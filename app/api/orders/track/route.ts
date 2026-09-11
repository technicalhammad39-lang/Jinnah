import { NextResponse } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { extractClientIp } from "@/lib/security/request-context";
import { 
  checkTrackRateLimit, 
  recordFailedTrackAttempt, 
  resetTrackRateLimit 
} from "@/lib/security/track-rate-limiter";

/**
 * Masks phone numbers for public privacy: 03001234567 -> 0300-****567
 */
function maskPhoneNumber(phone?: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 7) {
    const start = cleaned.slice(0, 4);
    const end = cleaned.slice(-3);
    return `${start}-****${end}`;
  }
  return phone;
}

/**
 * Normalizes phone numbers to comparable subscriber digits.
 * Strips leading 0 or 92 country code to handle formatting variations smoothly.
 */
function normalizePhone(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length >= 12) {
    return digits.slice(2);
  }
  if (digits.startsWith("0") && digits.length >= 11) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Verifies that the client-supplied phone matches the phone stored on the order.
 */
function isPhoneMatch(orderPhone?: string | null, suppliedPhone?: string | null): boolean {
  if (!orderPhone || !suppliedPhone) return false;
  const normOrder = normalizePhone(orderPhone);
  const normSupplied = normalizePhone(suppliedPhone);

  if (!normOrder || !normSupplied) return false;
  if (normOrder === normSupplied) return true;

  // Check last 7 to 10 subscriber digits
  if (normOrder.length >= 7 && normSupplied.length >= 7) {
    return normOrder.endsWith(normSupplied) || normSupplied.endsWith(normOrder);
  }

  return false;
}

/**
 * Masks street address while preserving general delivery destination (City/Area).
 */
function maskAddress(address?: string | null, city?: string | null): string {
  if (!address) return city || "Pakistan";
  const trimmed = address.trim();
  const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    // Return area/city while masking specific house/plot number
    return `***, ${parts.slice(1).join(", ")}`;
  }
  return `***, ${city || trimmed}`;
}

export async function GET(req: Request) {
  try {
    const clientIp = extractClientIp(req);
    const { searchParams } = new URL(req.url);

    const rawId = (searchParams.get("id") || searchParams.get("query") || searchParams.get("orderId") || "").trim();
    const rawPhone = (searchParams.get("phone") || "").trim();

    // 1. Mandatory Dual-Factor Requirement: Order ID + Phone Number
    if (!rawId || !rawPhone) {
      return NextResponse.json(
        { 
          error: "Both Order ID (#JH-XXXX-XXXX) and the phone number used during checkout are required to track an order." 
        },
        { status: 400 }
      );
    }

    // 2. Input Format Validation
    // Order ID format: Must be clean alphanumeric + hyphen/hash (e.g. #JH-XXXX-XXXX or JH-XXXX-XXXX or courier CN)
    const cleanId = rawId.toUpperCase().replace(/^#/, "");
    if (!/^[A-Z0-9_-]{4,40}$/i.test(cleanId)) {
      return NextResponse.json(
        { error: "Invalid Order ID format. Expected format: #JH-XXXX-XXXX" },
        { status: 400 }
      );
    }

    const cleanPhoneDigits = rawPhone.replace(/\D/g, "");
    if (cleanPhoneDigits.length < 7 || cleanPhoneDigits.length > 15) {
      return NextResponse.json(
        { error: "Invalid phone number format. Please enter a valid contact number." },
        { status: 400 }
      );
    }

    // 3. Rate Limit Evaluation (Protects IP and targeted Order ID from enumeration)
    const rateLimit = await checkTrackRateLimit(clientIp, cleanId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error || "Too many tracking requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    // 4. Retrieve Order from Firestore
    let foundOrder: any = null;
    const adminApp = getAdminApp();

    if (adminApp) {
      try {
        // Direct document lookup by doc ID (orders/${cleanId})
        const docRef = adminDb.collection("orders").doc(cleanId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          foundOrder = { dbKey: docSnap.id, ...docSnap.data() };
        }

        // Query by 'id' field if not matched by doc id
        if (!foundOrder) {
          const qSnap = await adminDb
            .collection("orders")
            .where("id", "==", cleanId)
            .limit(1)
            .get();
          if (!qSnap.empty) {
            const first = qSnap.docs[0];
            foundOrder = { dbKey: first.id, ...first.data() };
          }
        }

        // Query with 'JH-' prefix if user omitted it
        if (!foundOrder && !cleanId.startsWith("JH-")) {
          const withJH = `JH-${cleanId}`;
          const qSnap = await adminDb
            .collection("orders")
            .where("id", "==", withJH)
            .limit(1)
            .get();
          if (!qSnap.empty) {
            const first = qSnap.docs[0];
            foundOrder = { dbKey: first.id, ...first.data() };
          }
        }

        // Query by Courier tracking number / Consignment Number
        if (!foundOrder) {
          const qSnap = await adminDb
            .collection("orders")
            .where("trackingNumber", "==", rawId)
            .limit(1)
            .get();
          if (!qSnap.empty) {
            const first = qSnap.docs[0];
            foundOrder = { dbKey: first.id, ...first.data() };
          }
        }
      } catch (adminErr) {
        console.warn("[Tracking API] Admin query error, trying client SDK fallback:", adminErr);
      }
    }

    // Fallback to client Firestore SDK if needed
    if (!foundOrder) {
      try {
        const singleSnap = await getDoc(doc(db, "orders", cleanId));
        if (singleSnap.exists()) {
          foundOrder = { dbKey: singleSnap.id, ...singleSnap.data() };
        } else {
          const q = query(collection(db, "orders"), where("id", "==", cleanId));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const first = snap.docs[0];
            foundOrder = { dbKey: first.id, ...first.data() };
          } else if (!cleanId.startsWith("JH-")) {
            const qJH = query(collection(db, "orders"), where("id", "==", `JH-${cleanId}`));
            const snapJH = await getDocs(qJH);
            if (!snapJH.empty) {
              const first = snapJH.docs[0];
              foundOrder = { dbKey: first.id, ...first.data() };
            }
          }
        }
      } catch (clientErr) {
        console.error("[Tracking API] Client SDK query error:", clientErr);
      }
    }

    // Generic error message for both non-existent order and phone mismatch
    // (Prevents Order ID enumeration attacks)
    const genericNotFoundMessage =
      "No matching order found for the provided Order ID and phone number. Please check your details and try again.";

    // 5. Verify Order Exists AND Verify Phone Ownership
    if (!foundOrder) {
      await recordFailedTrackAttempt(clientIp, cleanId);
      return NextResponse.json({ error: genericNotFoundMessage }, { status: 404 });
    }

    const orderPhone = foundOrder.customerInfo?.phone;
    const isAuthorized = isPhoneMatch(orderPhone, rawPhone);

    if (!isAuthorized) {
      // Record failed verification attempt against this Order ID and IP
      await recordFailedTrackAttempt(clientIp, cleanId);
      return NextResponse.json({ error: genericNotFoundMessage }, { status: 404 });
    }

    // 6. Verification Succeeded — Reset failed attempt counter for this Order
    await resetTrackRateLimit(cleanId);

    // 7. Format Dates Safely
    const createdAtIso = foundOrder.createdAt?.toDate
      ? foundOrder.createdAt.toDate().toISOString()
      : typeof foundOrder.createdAt === "string"
      ? foundOrder.createdAt
      : new Date().toISOString();

    // 8. Sanitize Response (Data Minimization: Masked PII, no payment proofs, no private notes)
    const sanitizedOrder = {
      id: foundOrder.id || cleanId,
      status: foundOrder.status || "pending",
      courierName: foundOrder.courierName || null,
      trackingNumber: foundOrder.trackingNumber || null,
      estimatedDelivery: foundOrder.estimatedDelivery || "2-4 Business Days",
      trackingHistory: foundOrder.trackingHistory || [],
      adminNotes: foundOrder.publicTrackingNotes || null,
      createdAt: createdAtIso,
      items: (foundOrder.items || []).map((item: any) => ({
        name: item.name || item.product?.name || "Hardware Product",
        image: item.image || item.product?.images?.[0] || null,
        price: item.price || item.product?.price || 0,
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
      })),
      subtotal: foundOrder.subtotal || 0,
      discount: foundOrder.discount || 0,
      shipping: foundOrder.shipping ?? 0,
      total: foundOrder.total || 0,
      paymentMethod: foundOrder.paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Bank Transfer",
      customerInfo: {
        firstName: foundOrder.customerInfo?.firstName || "Customer",
        lastName: foundOrder.customerInfo?.lastName ? `${foundOrder.customerInfo.lastName.charAt(0)}.` : "",
        city: foundOrder.customerInfo?.city || "",
        address: maskAddress(foundOrder.customerInfo?.address, foundOrder.customerInfo?.city),
        postalCode: foundOrder.customerInfo?.postalCode ? `${foundOrder.customerInfo.postalCode.slice(0, 2)}***` : "",
        phone: maskPhoneNumber(foundOrder.customerInfo?.phone),
      },
    };

    return NextResponse.json({ success: true, order: sanitizedOrder });
  } catch (error: any) {
    console.error("[Tracking API Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve tracking details. Please try again later." },
      { status: 500 }
    );
  }
}
