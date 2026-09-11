import { NextResponse } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import * as admin from "firebase-admin";
import { extractClientIp } from "@/lib/security/request-context";
import { 
  checkTrackRateLimit, 
  recordFailedTrackAttempt, 
  resetTrackRateLimit 
} from "@/lib/security/track-rate-limiter";
import { 
  isValidOrderIdentifier, 
  isValidPublicTrackingId, 
  generateUniqueTrackingId 
} from "@/lib/security/tracking-id";

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
  return phone.length > 4 ? `${phone.slice(0, 3)}****` : "****";
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

    const rawId = (
      searchParams.get("id") || 
      searchParams.get("query") || 
      searchParams.get("orderId") || 
      searchParams.get("trackingId") || 
      ""
    ).trim();

    // 1. Mandatory Identifier Requirement (Single-Factor Tracking)
    if (!rawId) {
      return NextResponse.json(
        { 
          error: "Tracking ID is required. Please enter your 8-character Tracking ID (e.g. JH7K4M92)." 
        },
        { status: 400 }
      );
    }

    // 2. Input Format Validation
    // Supports exact 8-char tracking ID (JH + 6 chars), legacy #JH-XXXX-XXXX, and courier CN
    const cleanId = rawId.toUpperCase().replace(/^#/, "");
    if (!isValidOrderIdentifier(cleanId)) {
      return NextResponse.json(
        { 
          error: "Invalid Tracking ID format. Expected format: JH followed by 6 characters (e.g. JH7K4M92)." 
        },
        { status: 400 }
      );
    }

    // 3. Rate Limit Evaluation (Protects IP and targeted Tracking ID from enumeration attacks)
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
        // Priority A: Query by new public 'trackingId' field (e.g. JH7K4M92)
        const qTracking = await adminDb
          .collection("orders")
          .where("trackingId", "==", cleanId)
          .limit(1)
          .get();
        if (!qTracking.empty) {
          const first = qTracking.docs[0];
          foundOrder = { dbKey: first.id, ...first.data() };
        }

        // Priority B: Direct document lookup by doc ID (orders/${cleanId})
        if (!foundOrder) {
          const docRef = adminDb.collection("orders").doc(cleanId);
          const docSnap = await docRef.get();
          if (docSnap.exists) {
            foundOrder = { dbKey: docSnap.id, ...docSnap.data() };
          }
        }

        // Priority C: Query by legacy 'id' field if not matched by doc ID
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

        // Priority D: Query with 'JH-' prefix if user omitted it
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

        // Priority E: Query by Courier tracking number / Consignment Number
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

    // Fallback to client Firestore SDK if adminApp is unavailable
    if (!foundOrder) {
      try {
        // Fallback A: trackingId query
        const qTrack = query(collection(db, "orders"), where("trackingId", "==", cleanId));
        const snapTrack = await getDocs(qTrack);
        if (!snapTrack.empty) {
          const first = snapTrack.docs[0];
          foundOrder = { dbKey: first.id, ...first.data() };
        } else {
          // Fallback B: direct doc ID
          const singleSnap = await getDoc(doc(db, "orders", cleanId));
          if (singleSnap.exists()) {
            foundOrder = { dbKey: singleSnap.id, ...singleSnap.data() };
          } else {
            // Fallback C: id field
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
        }
      } catch (clientErr) {
        console.error("[Tracking API] Client SDK query error:", clientErr);
      }
    }

    // 5. Anti-Enumeration Protection: Generic not-found message
    const genericNotFoundMessage =
      "No matching order found for the provided Tracking ID. Please check your details and try again.";

    if (!foundOrder) {
      await recordFailedTrackAttempt(clientIp, cleanId);
      return NextResponse.json({ error: genericNotFoundMessage }, { status: 404 });
    }

    // 6. Reset Rate Limit Counter on Successful Match
    await resetTrackRateLimit(cleanId);

    // 7. Backward Compatibility: Safely generate and persist trackingId for existing orders if missing
    if (!foundOrder.trackingId && adminApp) {
      try {
        const newTrackingId = await generateUniqueTrackingId(adminDb);
        foundOrder.trackingId = newTrackingId;
        const targetDocId = foundOrder.dbKey || foundOrder.id;
        adminDb.collection("orders").doc(targetDocId).update({
          trackingId: newTrackingId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }).catch((err: any) => console.warn("[Tracking API] Auto-persisting trackingId failed:", err));
      } catch (migErr) {
        console.warn("[Tracking API] Auto-migration of trackingId failed:", migErr);
      }
    }

    // 8. Format Dates Safely
    const createdAtIso = foundOrder.createdAt?.toDate
      ? foundOrder.createdAt.toDate().toISOString()
      : typeof foundOrder.createdAt === "string"
      ? foundOrder.createdAt
      : new Date().toISOString();

    // 9. Sanitize Response (Strict Data Minimization: Masked PII, ZERO payment proofs, ZERO transaction IDs, ZERO admin notes)
    const publicTrackingId = foundOrder.trackingId || cleanId;

    const sanitizedOrder = {
      id: publicTrackingId,
      trackingId: publicTrackingId,
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
