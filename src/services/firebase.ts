import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  getDocFromServer,
  disableNetwork,
  setLogLevel,
} from 'firebase/firestore';
import type { AppState } from '../types/dashboard';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence internal Firestore SDK retry logs so quota exhaustion never triggers unhandled console error overlays
try {
  setLogLevel('silent');
} catch {
  // Ignore if unsupported
}

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use provisioned named database if available
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const DASHBOARD_DOC_ID = 'main_ho_dashboard';
export const DASHBOARD_COLLECTION = 'dashboardState';

// Circuit breaker for Firestore free-tier daily write quota exhaustion
let isFirestoreQuotaExhausted = false;

export function getIsQuotaExhausted(): boolean {
  return isFirestoreQuotaExhausted;
}

function isQuotaError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string })?.code || '';
  return (
    code === 'resource-exhausted' ||
    msg.includes('resource-exhausted') ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('Quota exceeded')
  );
}

async function tripQuotaCircuitBreaker(): Promise<void> {
  if (!isFirestoreQuotaExhausted) {
    isFirestoreQuotaExhausted = true;
    try {
      await disableNetwork(db);
    } catch {
      // Ignore network disable error
    }
  }
}

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
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to save state to the shared Express server file (src/data/persistedState.json)
export async function saveDashboardToServerFile(state: AppState): Promise<boolean> {
  try {
    const response = await fetch('/api/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Helper to load state from the shared Express server file (src/data/persistedState.json)
export async function loadDashboardFromServerFile(): Promise<AppState | null> {
  try {
    const response = await fetch('/api/dashboard');
    if (!response.ok) return null;
    const json = await response.json();
    if (json && json.state && json.state.data) {
      return json.state as AppState;
    }
    return null;
  } catch {
    return null;
  }
}

// Test connection on boot as specified in the Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  if (isFirestoreQuotaExhausted) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (isQuotaError(error)) {
      await tripQuotaCircuitBreaker();
      return false;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return false;
    }
    // Any other response (such as document not found) means the server was reached successfully
    return true;
  }
}

// Save complete dashboard state to shared Server File + Firestore (when quota permits)
export async function saveDashboardToCloud(
  state: AppState,
  options?: { syncFirestore?: boolean }
): Promise<void> {
  const nowIso = new Date().toISOString();
  const rawPayload: AppState = {
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

  // JSON serialization removes all undefined fields
  const sanitizedPayload: AppState = JSON.parse(JSON.stringify(rawPayload));

  // 1. Always persist immediately to the server-side source file (src/data/persistedState.json)
  // This has zero quota limits and writes directly into the codebase before republishing.
  await saveDashboardToServerFile(sanitizedPayload);

  // 2. Only write to Firestore when explicitly requested (e.g. Lock & Save) and quota is not exhausted
  if (!options?.syncFirestore || isFirestoreQuotaExhausted) {
    return;
  }

  const docRef = doc(db, DASHBOARD_COLLECTION, DASHBOARD_DOC_ID);
  try {
    await setDoc(docRef, sanitizedPayload, { merge: true });
    if (state.logoUrl) {
      await setDoc(
        doc(db, DASHBOARD_COLLECTION, 'branding_logo'),
        { logoUrl: state.logoUrl, updatedAt: nowIso },
        { merge: true }
      );
    }
  } catch (error) {
    if (isQuotaError(error)) {
      await tripQuotaCircuitBreaker();
      return;
    }
    if (error instanceof Error && error.message.includes('permission')) {
      handleFirestoreError(error, OperationType.WRITE, `${DASHBOARD_COLLECTION}/${DASHBOARD_DOC_ID}`);
    }
  }
}

// Fetch dashboard state once (checks server file & Firestore)
export async function loadDashboardFromCloud(): Promise<AppState | null> {
  // First check shared server file
  const serverState = await loadDashboardFromServerFile();

  if (isFirestoreQuotaExhausted) {
    return serverState;
  }

  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, DASHBOARD_DOC_ID);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data() as AppState;
      if (!data.logoUrl) {
        try {
          const logoSnap = await getDoc(doc(db, DASHBOARD_COLLECTION, 'branding_logo'));
          if (logoSnap.exists() && logoSnap.data().logoUrl) {
            data.logoUrl = logoSnap.data().logoUrl;
          }
        } catch {
          // Ignore secondary logo check error
        }
      }

      // Return whichever is newer between server file and Firestore
      if (serverState && serverState.updatedAt && data.updatedAt) {
        const sTime = new Date(serverState.updatedAt).getTime();
        const cTime = new Date(data.updatedAt).getTime();
        if (sTime >= cTime) return serverState;
      }
      return data;
    }
    return serverState;
  } catch (err) {
    if (isQuotaError(err)) {
      await tripQuotaCircuitBreaker();
    }
    return serverState;
  }
}

// Subscribe to shared dashboard state (combines server file hydration + Firestore live listener if quota permits)
export function subscribeToCloudDashboard(
  onUpdate: (cloudState: AppState) => void,
  onError?: (err: Error) => void
): () => void {
  let isCancelled = false;

  // Immediately hydrate from shared server file so public viewers & reloads get instant state
  loadDashboardFromServerFile().then((serverState) => {
    if (!isCancelled && serverState && serverState.data) {
      onUpdate(serverState);
    }
  });

  if (isFirestoreQuotaExhausted) {
    return () => {
      isCancelled = true;
    };
  }

  try {
    const docRef = doc(db, DASHBOARD_COLLECTION, DASHBOARD_DOC_ID);
    const unsubscribeFirestore = onSnapshot(
      docRef,
      (snapshot) => {
        if (isCancelled) return;
        if (snapshot.exists()) {
          const data = snapshot.data() as AppState;
          onUpdate(data);
        }
      },
      async (error) => {
        if (isQuotaError(error)) {
          await tripQuotaCircuitBreaker();
          return;
        }
        if (onError) onError(error);
        if (error.message.includes('permission')) {
          handleFirestoreError(error, OperationType.GET, `${DASHBOARD_COLLECTION}/${DASHBOARD_DOC_ID}`);
        }
      }
    );

    return () => {
      isCancelled = true;
      unsubscribeFirestore();
    };
  } catch {
    return () => {
      isCancelled = true;
    };
  }
}

export { firebaseConfig };
