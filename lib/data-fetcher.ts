import { collection, getDocs, query, orderBy, limit, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getProducts() {
  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      limit(10)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Fallback to latest products if no featured products
    if (data.length === 0) {
      const q2 = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(10));
      const snap2 = await getDocs(q2);
      return snap2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      return docSnap.data();
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return null;
  }
}

export async function getGallery() {
  try {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }
}
