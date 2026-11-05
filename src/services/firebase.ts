import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import type { AppState } from '../types/dashboard';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use provisioned named database if available
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const DASHBOARD_DOC_ID = 'main_ho_dashboard';
export const DASHBOARD_COLLECTION = 'dashboardState';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as specified in the Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection: client is offline or network is restricted.');
      return false;
    }
    // Any other response (such as document not found) means the server was reached successfully
    return true;
  }
}

// Save complete dashboard state to Firestore
export async function saveDashboardToCloud(state: AppState): Promise<void> {
  const docRef = doc(db, DASHBOARD_COLLECTION, DASHBOARD_DOC_ID);
  const nowIso = new Date().toISOString();
  const rawPayload = {
    years: state.years,
    activeYear: state.activeYear,
    activeMonth: state.activeMonth,
    activeEntity: state.activeEntity,
    entities: state.entities,
    logoUrl: state.logoUrl || null,
    data: state.data,
    updatedAt: state.updatedAt || nowIso,
    savedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };

  // Firestore throws if any property is undefined; JSON serialization removes all undefined fields
  const sanitizedPayload = JSON.parse(JSON.stringify(rawPayload));

  try {
    await setDoc(docRef, sanitizedPayload, { merge: true });
    // Also mirror logo to a dedicated branding document so logo is permanently locked & independent
    if (state.logoUrl) {
      await setDoc(
        doc(db, DASHBOARD_COLLECTION, 'branding_logo'),
        { logoUrl: state.logoUrl, updatedAt: nowIso },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${DASHBOARD_COLLECTION}/${DASHBOARD_DOC_ID}`);
  }
}

// Fetch dashboard state once
export async function loadDashboardFromCloud(): Promise<AppState | null> {
  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, DASHBOARD_DOC_ID);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data() as AppState;
      // If logo is not in main doc, try checking dedicated branding doc
      if (!data.logoUrl) {
        try {
          const logoSnap = await getDoc(doc(db, DASHBOARD_COLLECTION, 'branding_logo'));
          if (logoSnap.exists() && logoSnap.data().logoUrl) {
            data.logoUrl = logoSnap.data().logoUrl;
          }
        } catch (e) {
          // Ignore secondary logo check error
        }
      }
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Failed to load dashboard from Firestore:', err);
    return null;
  }
}

// Real-time listener for live sync across all tabs, devices and users
export function subscribeToCloudDashboard(
  onUpdate: (cloudState: AppState) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, DASHBOARD_DOC_ID);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as AppState;
          onUpdate(data);
        }
      },
      (error) => {
        console.warn('Firestore real-time subscription error:', error);
        if (onError) onError(error);
        if (error.message.includes('permission')) {
          handleFirestoreError(error, OperationType.GET, `${DASHBOARD_COLLECTION}/${DASHBOARD_DOC_ID}`);
        }
      }
    );
  } catch (err) {
    console.warn('Could not establish real-time subscription:', err);
    return () => {};
  }
}

export { firebaseConfig };
