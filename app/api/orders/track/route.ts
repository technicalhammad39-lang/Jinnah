import { NextResponse } from "next/server";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

// Helper to mask phone numbers for public privacy: 03001234567 -> 0300-****567
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryTerm = (searchParams.get("query") || searchParams.get("id") || "").trim();

    if (!queryTerm) {
      return NextResponse.json(
        { error: "Please enter an Order ID, Courier Tracking Number, or Phone Number" },
        { status: 400 }
      );
    }

    // Normalize query
    const cleanTerm = queryTerm.toUpperCase();
    const withoutHash = cleanTerm.replace(/^#/, "");
    const cleanDigits = queryTerm.replace(/\D/g, "");

    let foundOrder: any = null;

    // Check with Firebase Admin first if available
    const adminApp = getAdminApp();

    if (adminApp) {
      try {
        // 1. Direct doc lookup by ID (e.g. JH-XXXX-XXXX)
        const docRef = adminDb.collection("orders").doc(withoutHash);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          foundOrder = { dbKey: docSnap.id, ...docSnap.data() };
        }

        // 2. Query by 'id' field
        if (!foundOrder) {
          const qSnap = await adminDb.collection("orders").where("id", "==", withoutHash).limit(1).get();
          if (!qSnap.empty) {
            const first = qSnap.docs[0];
            foundOrder = { dbKey: first.id, ...first.data() };
          }
        }

        // 3. Query without 'JH-' if user typed just the alphanumeric code
        if (!foundOrder && !withoutHash.startsWith("JH-")) {
          const withJH = `JH-${withoutHash}`;
          const qSnap = await adminDb.collection("orders").where("id", "==", withJH).limit(1).get();
          if (!qSnap.empty) {
            const first = qSnap.docs[0];
            foundOrder = { dbKey: first.id, ...first.data() };
          }
        }

        // 4. Query by courier tracking number / consignment number
        if (!foundOrder) {
          const qSnap = await adminDb
            .collection("orders")
            .where("trackingNumber", "==", queryTerm)
            .limit(1)
            .get();
          if (!qSnap.empty) {
            const first = qSnap.docs[0];
            foundOrder = { dbKey: first.id, ...first.data() };
          }
        }

        // 5. Query by customer phone
        if (!foundOrder && cleanDigits.length >= 7) {
          const qSnap = await adminDb
            .collection("orders")
            .where("customerInfo.phone", "==", queryTerm)
            .limit(1)
            .get();
          if (!qSnap.empty) {
            const first = qSnap.docs[0];
            foundOrder = { dbKey: first.id, ...first.data() };
          }
        }
      } catch (adminErr) {
        console.warn("[Tracking API] Firebase admin query fallback to client db:", adminErr);
      }
    }

    // Fallback to client Firestore SDK if adminDb wasn't configured or failed
    if (!foundOrder) {
      try {
        // Direct doc
        const singleSnap = await getDoc(doc(db, "orders", withoutHash));
        if (singleSnap.exists()) {
          foundOrder = { dbKey: singleSnap.id, ...singleSnap.data() };
        } else {
          // By id field
          const q = query(collection(db, "orders"), where("id", "==", withoutHash));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const first = snap.docs[0];
            foundOrder = { dbKey: first.id, ...first.data() };
          } else if (!withoutHash.startsWith("JH-")) {
            const qJH = query(collection(db, "orders"), where("id", "==", `JH-${withoutHash}`));
            const snapJH = await getDocs(qJH);
            if (!snapJH.empty) {
              const first = snapJH.docs[0];
              foundOrder = { dbKey: first.id, ...first.data() };
            }
          }
        }
      } catch (clientErr) {
        console.error("[Tracking API] Client SDK error:", clientErr);
      }
    }

    if (!foundOrder) {
      return NextResponse.json(
        { error: `No order found matching "${queryTerm}". Please verify your Order ID or Contact Support.` },
        { status: 404 }
      );
    }

    // Convert dates if needed
    const createdAtIso = foundOrder.createdAt?.toDate
      ? foundOrder.createdAt.toDate().toISOString()
      : typeof foundOrder.createdAt === "string"
      ? foundOrder.createdAt
      : new Date().toISOString();

    // Sanitize response
    const sanitizedOrder = {
      id: foundOrder.id || withoutHash,
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
      paymentMethod: foundOrder.paymentMethod || "cod",
      customerInfo: {
        firstName: foundOrder.customerInfo?.firstName || "",
        lastName: foundOrder.customerInfo?.lastName || "",
        city: foundOrder.customerInfo?.city || "",
        address: foundOrder.customerInfo?.address || "",
        postalCode: foundOrder.customerInfo?.postalCode || "",
        phone: maskPhoneNumber(foundOrder.customerInfo?.phone),
      },
    };

    return NextResponse.json({ success: true, order: sanitizedOrder });
  } catch (error: any) {
    console.error("[Tracking API Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve tracking details. Please try again." },
      { status: 500 }
    );
  }
}
