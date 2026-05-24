/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, getDocFromServer } from 'firebase/firestore';
import { ActivityReport } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Detect if firebase is configured
const isFirebaseConfigured = !!(firebaseConfig && (firebaseConfig as any).projectId);

let db: any = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = (firebaseConfig as any).firestoreDatabaseId
      ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
      : getFirestore(app);
  } catch (err) {
    console.warn("Firebase initialization failed:", err);
  }
}

// Validation/Test connection to Firestore as requested by SKILL.md
if (db) {
  async function testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }
  testConnection();
}

// Error handling matching SKILL.md instructions
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  /**
   * Returns true if client is securely configured to synch with Firestore
   */
  isEnabled(): boolean {
    return isFirebaseConfigured && db !== null;
  },

  /**
   * Submits report to both local disk redundancy and the cloud Firestore
   */
  async submitReport(report: ActivityReport): Promise<boolean> {
    // 1. Always write to LocalStorage to ensure perfect offline-first resilience
    try {
      const saved = localStorage.getItem('reports_history_v1');
      let history: ActivityReport[] = saved ? JSON.parse(saved) : [];
      history = history.filter(h => h.id !== report.id);
      history.unshift(report);
      localStorage.setItem('reports_history_v1', JSON.stringify(history));
    } catch (err) {
      console.warn('LocalStorage local submit fallback warning:', err);
    }

    // 2. Synchronize to the central cloud server if online
    if (this.isEnabled()) {
      const pathForWrite = 'reports';
      try {
        await setDoc(doc(db, pathForWrite, report.id), report);
        return true;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${pathForWrite}/${report.id}`);
      }
    }
    return false;
  },

  /**
   * Fetches the entire collection of uploaded reports
   */
  async getAllReports(): Promise<ActivityReport[]> {
    let localReports: ActivityReport[] = [];
    try {
      const saved = localStorage.getItem('imported_teacher_reports_v1');
      if (saved) {
        localReports = JSON.parse(saved);
      }
    } catch {}

    if (this.isEnabled()) {
      const pathForGet = 'reports';
      try {
        const querySnapshot = await getDocs(collection(db, pathForGet));
        const cloudReports: ActivityReport[] = [];
        querySnapshot.forEach((docSnap) => {
          cloudReports.push(docSnap.data() as ActivityReport);
        });

        // Smart merge server reports with local cache
        const mergedMap = new Map<string, ActivityReport>();
        localReports.forEach(r => mergedMap.set(r.id, r));
        cloudReports.forEach(r => mergedMap.set(r.id, r));

        const finalMerged = Array.from(mergedMap.values());
        // Sort descending
        finalMerged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Cache globally for swift offline access in Teacher Panel
        try {
          localStorage.setItem('imported_teacher_reports_v1', JSON.stringify(finalMerged));
        } catch {}

        return finalMerged;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, pathForGet);
      }
    }

    return localReports;
  }
};
