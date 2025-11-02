import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export const logAudit = async (
  userId: string,
  action: string,
  metadata?: Record<string, string | number | boolean>
) => {
  try {
    await addDoc(collection(db, "auditLogs"), {
      userId,
      action,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      environment: import.meta.env.MODE,
      ...metadata,
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
};