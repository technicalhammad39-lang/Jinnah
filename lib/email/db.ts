import { adminDb, getAdminApp } from "@/lib/firebase-admin";
import { db as clientDb } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  addDoc,
  writeBatch,
} from "firebase/firestore";
import { EmailSettings, EmailMessage, EmailLog, EmailTemplate, EmailFolder } from "./types";
import { DEFAULT_TEMPLATES } from "./templates";

/**
 * Robust data persistence layer for the Email Center.
 * Automatically tries Firebase Admin SDK first. If Firebase Admin credentials are
 * invalid, unconfigured, or encounter gRPC issues, it seamlessly falls back to
 * the client Firestore SDK.
 */

// -------------------------------------------------------------
// 1. Email Settings
// -------------------------------------------------------------

export async function getStoredEmailSettings(): Promise<EmailSettings | null> {
  // 1. Try Firebase Admin SDK
  try {
    const app = getAdminApp();
    if (app) {
      const docSnap = await adminDb.collection("email_settings").doc("main").get();
      if (docSnap.exists) {
        return docSnap.data() as EmailSettings;
      }
    }
  } catch (adminErr: any) {
    console.warn("[Email DB] Admin SDK failed to get email_settings, using fallback:", adminErr?.message || adminErr);
  }

  // 2. Fallback to client Firestore SDK
  try {
    const docRef = doc(clientDb, "email_settings", "main");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as EmailSettings;
    }
  } catch (clientErr: any) {
    console.error("[Email DB] Client SDK failed to get email_settings:", clientErr?.message || clientErr);
  }

  return null;
}

export async function saveStoredEmailSettings(payload: EmailSettings): Promise<void> {
  let saved = false;

  // 1. Try Firebase Admin SDK
  try {
    const app = getAdminApp();
    if (app) {
      await adminDb.collection("email_settings").doc("main").set(payload, { merge: true });
      saved = true;
    }
  } catch (adminErr: any) {
    console.warn("[Email DB] Admin SDK failed to save email_settings, trying fallback:", adminErr?.message || adminErr);
  }

  // 2. Fallback to client Firestore SDK if Admin SDK failed
  if (!saved) {
    try {
      const docRef = doc(clientDb, "email_settings", "main");
      await setDoc(docRef, payload, { merge: true });
      saved = true;
    } catch (clientErr: any) {
      console.error("[Email DB] Client SDK also failed to save email_settings:", clientErr);
      throw clientErr;
    }
  }
}

// -------------------------------------------------------------
// 2. Email Messages
// -------------------------------------------------------------

export async function getEmailMessages(params: {
  folder: EmailFolder;
  search?: string;
  isStarred?: boolean;
  isImportant?: boolean;
  limitCount?: number;
}): Promise<{ messages: EmailMessage[]; folderCounts: Record<string, number> }> {
  const { folder, search = "", isStarred, isImportant, limitCount = 30 } = params;
  let rawMessages: EmailMessage[] = [];
  let unreadCounts: Record<string, number> = {
    inbox: 0,
    sent: 0,
    drafts: 0,
    outbox: 0,
    scheduled: 0,
    starred: 0,
    important: 0,
    spam: 0,
    archive: 0,
    trash: 0,
  };

  // 1. Try Admin SDK
  let queried = false;
  try {
    const app = getAdminApp();
    if (app) {
      let q: any = adminDb.collection("emails");
      if (isStarred || folder === "starred") {
        q = q.where("isStarred", "==", true);
      } else if (isImportant || folder === "important") {
        q = q.where("isImportant", "==", true);
      } else {
        q = q.where("folder", "==", folder);
      }
      q = q.orderBy("createdAt", "desc").limit(limitCount);

      const snap = await q.get();
      rawMessages = snap.docs.map((d: any) => ({
        dbKey: d.id,
        id: d.id,
        ...d.data(),
      }));

      const countSnap = await adminDb.collection("emails").where("isRead", "==", false).get();
      countSnap.forEach((d: any) => {
        const data = d.data();
        const f = data.folder || "inbox";
        if (unreadCounts[f] != null) unreadCounts[f]++;
      });

      queried = true;
    }
  } catch (adminErr: any) {
    console.warn("[Email DB] Admin SDK failed on getEmailMessages, using client SDK fallback:", adminErr?.message);
  }

  // 2. Fallback to Client SDK
  if (!queried) {
    try {
      const emailsCol = collection(clientDb, "emails");
      let q = query(
        emailsCol,
        where("folder", "==", folder),
        orderBy("createdAt", "desc"),
        firestoreLimit(limitCount)
      );

      if (isStarred || folder === "starred") {
        q = query(emailsCol, where("isStarred", "==", true), orderBy("createdAt", "desc"), firestoreLimit(limitCount));
      } else if (isImportant || folder === "important") {
        q = query(emailsCol, where("isImportant", "==", true), orderBy("createdAt", "desc"), firestoreLimit(limitCount));
      }

      const snap = await getDocs(q);
      rawMessages = snap.docs.map((d) => ({
        dbKey: d.id,
        id: d.id,
        ...d.data(),
      } as EmailMessage));

      const unreadQ = query(emailsCol, where("isRead", "==", false));
      const unreadSnap = await getDocs(unreadQ);
      unreadSnap.forEach((d) => {
        const data = d.data();
        const f = data.folder || "inbox";
        if (unreadCounts[f] != null) unreadCounts[f]++;
      });
    } catch (clientErr) {
      console.error("[Email DB] Client SDK failed on getEmailMessages:", clientErr);
    }
  }

  // Client-level search filter if search string was provided
  const cleanSearch = search.toLowerCase().trim();
  if (cleanSearch) {
    rawMessages = rawMessages.filter((m) => {
      const fromStr = `${m.from?.name || ""} ${m.from?.email || ""}`.toLowerCase();
      const toStr = (m.to || []).map((t) => `${t.name || ""} ${t.email || ""}`).join(" ").toLowerCase();
      const subjectStr = (m.subject || "").toLowerCase();
      const snippetStr = (m.snippet || "").toLowerCase();
      return (
        fromStr.includes(cleanSearch) ||
        toStr.includes(cleanSearch) ||
        subjectStr.includes(cleanSearch) ||
        snippetStr.includes(cleanSearch)
      );
    });
  }

  return { messages: rawMessages, folderCounts: unreadCounts };
}

export async function saveEmailMessageDoc(messageData: any): Promise<string> {
  // 1. Try Admin SDK
  try {
    const app = getAdminApp();
    if (app) {
      const docRef = adminDb.collection("emails").doc();
      const id = docRef.id;
      await docRef.set({ id, ...messageData });
      return id;
    }
  } catch (adminErr: any) {
    console.warn("[Email DB] Admin SDK failed to save email doc, trying fallback:", adminErr?.message);
  }

  // 2. Client SDK fallback
  try {
    const colRef = collection(clientDb, "emails");
    const docRef = await addDoc(colRef, messageData);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  } catch (clientErr) {
    console.error("[Email DB] Client SDK failed to save email doc:", clientErr);
    throw clientErr;
  }
}

export async function updateEmailMessagesBatch(
  ids: string[],
  updates: Record<string, any>
): Promise<void> {
  // 1. Try Admin SDK
  try {
    const app = getAdminApp();
    if (app) {
      const batch = adminDb.batch();
      for (const id of ids) {
        const ref = adminDb.collection("emails").doc(id);
        batch.update(ref, updates);
      }
      await batch.commit();
      return;
    }
  } catch (adminErr: any) {
    console.warn("[Email DB] Admin SDK failed on batch update, trying fallback:", adminErr?.message);
  }

  // 2. Client SDK fallback
  try {
    const batch = writeBatch(clientDb);
    for (const id of ids) {
      const ref = doc(clientDb, "emails", id);
      batch.update(ref, updates);
    }
    await batch.commit();
  } catch (clientErr) {
    console.error("[Email DB] Client SDK batch update failed:", clientErr);
    throw clientErr;
  }
}

export async function deleteEmailMessagesBatch(ids: string[]): Promise<void> {
  // 1. Try Admin SDK
  try {
    const app = getAdminApp();
    if (app) {
      const batch = adminDb.batch();
      for (const id of ids) {
        batch.delete(adminDb.collection("emails").doc(id));
      }
      await batch.commit();
      return;
    }
  } catch (adminErr: any) {
    console.warn("[Email DB] Admin SDK failed on batch delete, trying fallback:", adminErr?.message);
  }

  // 2. Client SDK fallback
  try {
    const batch = writeBatch(clientDb);
    for (const id of ids) {
      batch.delete(doc(clientDb, "emails", id));
    }
    await batch.commit();
  } catch (clientErr) {
    console.error("[Email DB] Client SDK batch delete failed:", clientErr);
    throw clientErr;
  }
}

// -------------------------------------------------------------
// 3. Email Logs
// -------------------------------------------------------------

export async function saveEmailLogDoc(log: Partial<EmailLog>): Promise<void> {
  const logData = {
    ...log,
    timestamp: log.timestamp || new Date().toISOString(),
  };

  try {
    const app = getAdminApp();
    if (app) {
      await adminDb.collection("email_logs").add(logData);
      return;
    }
  } catch (err) {
    // Admin failed, try fallback
  }

  try {
    await addDoc(collection(clientDb, "email_logs"), logData);
  } catch (clientErr) {
    console.error("[Email DB] Failed to save email log:", clientErr);
  }
}

export async function getEmailLogsList(statusFilter = "all", limitCount = 50): Promise<EmailLog[]> {
  try {
    const app = getAdminApp();
    if (app) {
      let q: any = adminDb.collection("email_logs");
      if (statusFilter !== "all") {
        q = q.where("status", "==", statusFilter);
      }
      q = q.orderBy("timestamp", "desc").limit(limitCount);
      const snap = await q.get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    }
  } catch (adminErr) {
    // Admin failed, try client SDK
  }

  try {
    const logsCol = collection(clientDb, "email_logs");
    let q = query(logsCol, orderBy("timestamp", "desc"), firestoreLimit(limitCount));
    if (statusFilter !== "all") {
      q = query(logsCol, where("status", "==", statusFilter), orderBy("timestamp", "desc"), firestoreLimit(limitCount));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmailLog));
  } catch (clientErr) {
    console.error("[Email DB] Failed to get email logs:", clientErr);
    return [];
  }
}

// -------------------------------------------------------------
// 4. Email Templates
// -------------------------------------------------------------

export async function getEmailTemplatesList(): Promise<EmailTemplate[]> {
  try {
    const app = getAdminApp();
    if (app) {
      const snap = await adminDb.collection("email_templates").get();
      if (!snap.empty) {
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      }
    }
  } catch (adminErr) {}

  try {
    const snap = await getDocs(collection(clientDb, "email_templates"));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmailTemplate));
    }
  } catch (clientErr) {}

  return DEFAULT_TEMPLATES;
}

export async function saveEmailTemplateDoc(template: EmailTemplate): Promise<void> {
  try {
    const app = getAdminApp();
    if (app) {
      await adminDb.collection("email_templates").doc(template.id).set(template, { merge: true });
      return;
    }
  } catch (adminErr) {}

  const docRef = doc(clientDb, "email_templates", template.id);
  await setDoc(docRef, template, { merge: true });
}

export async function deleteEmailTemplateDoc(id: string): Promise<void> {
  try {
    const app = getAdminApp();
    if (app) {
      await adminDb.collection("email_templates").doc(id).delete();
      return;
    }
  } catch (adminErr) {}

  const docRef = doc(clientDb, "email_templates", id);
  await deleteDoc(docRef);
}

// -------------------------------------------------------------
// 5. Email Newsletter & Subscribers
// -------------------------------------------------------------

export async function getNewsletterData(): Promise<{ subscribers: any[]; campaigns: any[] }> {
  let subscribers: any[] = [];
  let campaigns: any[] = [];

  // Try Admin SDK
  try {
    const app = getAdminApp();
    if (app) {
      const [subSnap, campSnap] = await Promise.all([
        adminDb.collection("email_subscribers").orderBy("subscribedAt", "desc").limit(200).get(),
        adminDb.collection("email_newsletters").orderBy("createdAt", "desc").limit(50).get(),
      ]);
      subscribers = subSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      campaigns = campSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      return { subscribers, campaigns };
    }
  } catch (adminErr) {}

  // Client SDK fallback
  try {
    const subQ = query(collection(clientDb, "email_subscribers"), orderBy("subscribedAt", "desc"), firestoreLimit(200));
    const campQ = query(collection(clientDb, "email_newsletters"), orderBy("createdAt", "desc"), firestoreLimit(50));
    const [subSnap, campSnap] = await Promise.all([getDocs(subQ), getDocs(campQ)]);
    subscribers = subSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    campaigns = campSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (clientErr) {
    console.error("[Email DB] Failed to get newsletter data:", clientErr);
  }

  return { subscribers, campaigns };
}

export async function saveSubscriberDoc(data: any): Promise<void> {
  const email = data.email.toLowerCase().trim();
  try {
    const app = getAdminApp();
    if (app) {
      await adminDb.collection("email_subscribers").doc(email).set(data, { merge: true });
      return;
    }
  } catch (adminErr) {}

  await setDoc(doc(clientDb, "email_subscribers", email), data, { merge: true });
}

export async function saveNewsletterCampaignDoc(data: any): Promise<string> {
  try {
    const app = getAdminApp();
    if (app) {
      const ref = adminDb.collection("email_newsletters").doc();
      await ref.set({ id: ref.id, ...data });
      return ref.id;
    }
  } catch (adminErr) {}

  const ref = await addDoc(collection(clientDb, "email_newsletters"), data);
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}
