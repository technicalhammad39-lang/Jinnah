"use server";

import { collection, getDocs, query, orderBy, limit, where, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Helper to serialize Firestore data
function serializeData(data: any) {
  const serialized = { ...data };
  for (const key in serialized) {
    if (serialized[key] instanceof Timestamp) {
      serialized[key] = serialized[key].toDate().toISOString();
    }
  }
  return serialized;
}

export async function getProducts() {
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) })) as any[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getFeaturedProducts() {
  try {
    const q = query(
      collection(db, "products"), 
      where("featured", "==", true),
      orderBy("createdAt", "desc"),
      limit(6)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) })) as any[];
    
    // Ensure we return exactly 6 products (fill with latest if needed)
    if (data.length < 6) {
      const remainingNeeded = 6 - data.length;
      const q2 = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(10));
      const snap2 = await getDocs(q2);
      
      const latestData = snap2.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) })) as any[];
      
      // Filter out products already in 'data'
      const existingIds = new Set(data.map(p => p.id));
      const newProducts = latestData.filter(p => !existingIds.has(p.id)).slice(0, remainingNeeded);
      
      return [...data, ...newProducts];
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function getBrands() {
  try {
    const q = query(collection(db, "brands"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) })) as any[];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

export async function getSettings() {
  try {
    const docRef = doc(db, "settings", "global");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return serializeData(docSnap.data());
    }
    return null;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}

export async function getBlogs() {
  try {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) })) as any[];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    const q = query(collection(db, "blogs"), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...serializeData(docSnap.data()) };
    }
    
    // Fallback to fetch by ID
    const docRef = doc(db, "blogs", slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...serializeData(docSnap.data()) };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return null;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const q = query(collection(db, "products"), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...serializeData(docSnap.data()) };
    }
    
    // Fallback to fetch by ID
    const docRef = doc(db, "products", slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...serializeData(docSnap.data()) };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

export async function getGallery() {
  try {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) })) as any[];
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }
}

export async function getPaymentMethods() {
  try {
    const q = query(collection(db, "payment-methods"), where("active", "==", true));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) })) as any[];
    return data.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return [];
  }
}

export async function getReviews() {
  try {
    const q = query(collection(db, "reviews"), where("active", "==", true));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) })) as any[];
    return data.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function getLeadership() {
  try {
    const q = query(collection(db, "leadership"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) })) as any[];
  } catch (error) {
    console.error("Error fetching leadership:", error);
    return [];
  }
}

export async function getCategories(onlyActive = false) {
  try {
    let q;
    if (onlyActive) {
      q = query(collection(db, "categories"), where("status", "==", "active"), orderBy("name", "asc"));
    } else {
      try {
        q = query(collection(db, "categories"), orderBy("name", "asc"));
      } catch {
        q = query(collection(db, "categories"));
      }
    }
    const snapshot = await getDocs(q);
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) })) as any[];
    
    // Get all products to count per category (works for both legacy text and new categoryId)
    const productsSnap = await getDocs(collection(db, "products"));
    const products = productsSnap.docs.map(d => d.data());
    
    return categories
      .filter(cat => !onlyActive || (cat.status || "active") === "active")
      .map(cat => ({
        ...cat,
        count: products.filter(p =>
          p.categoryId === cat.id || p.category === cat.name
        ).length
      }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
