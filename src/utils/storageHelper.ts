import { AppState, DEFAULT_ENTITIES } from '../types/dashboard';
import { createInitialYearData } from '../data/defaultData';

export const DASHBOARD_STORAGE_KEY = 'hrbp_nusaraya_ho_dashboard_v2';

/**
 * Creates the production default state for HRBP Nusaraya Head Office.
 * CRITICAL: updatedAt MUST be undefined so a newly initialized client NEVER
 * overwrites the persistent cloud database with a blank template!
 */
export function createDefaultProductionState(): AppState {
  const initial2026 = createInitialYearData();
  const initial2025 = createInitialYearData();
  return {
    years: [2025, 2026, 2027],
    activeYear: 2026,
    activeMonth: 10, // November
    activeEntity: 'ALL',
    entities: DEFAULT_ENTITIES,
    logoUrl: null,
    savedAt: null,
    updatedAt: undefined, // Unmodified default: must never overwrite cloud
    data: {
      2025: initial2025,
      2026: initial2026,
    },
  };
}

/**
 * Loads the dashboard state from browser localStorage with schema validation
 */
export function loadFromLocalStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data || !parsed.years) {
      return null;
    }

    // Ensure entities are present and up to date
    if (!parsed.entities || !Array.isArray(parsed.entities) || parsed.entities.length === 0) {
      parsed.entities = DEFAULT_ENTITIES;
    }

    return parsed as AppState;
  } catch (error) {
    console.error('storageHelper: Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Persists the dashboard state to browser localStorage immediately
 */
export function saveToLocalStorage(state: AppState): boolean {
  try {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('storageHelper: Failed to save to localStorage:', error);
    return false;
  }
}

/**
 * Removes cached dashboard state from browser localStorage
 */
export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(DASHBOARD_STORAGE_KEY);
  } catch (error) {
    console.error('storageHelper: Failed to clear localStorage:', error);
  }
}

/**
 * Resolves state between local storage and cloud Firestore.
 * Rules:
 * 1. If cloud document has data:
 *    - If local has never been edited by a user (!localState.updatedAt), CLOUD WINS.
 *    - If cloud timestamp >= local timestamp, CLOUD WINS.
 *    - If local has newer timestamp from user keystrokes in this session, LOCAL WINS & pushes to cloud.
 * 2. If cloud document is empty:
 *    - ONLY push if local state has actual user edits (localState.updatedAt is set).
 */
export function resolveSyncState(
  localState: AppState,
  cloudState: AppState | null
): { state: AppState; shouldPushToCloud: boolean } {
  // Case A: Cloud document has verified dashboard data
  if (cloudState && cloudState.data) {
    const localTime = localState.updatedAt ? new Date(localState.updatedAt).getTime() : 0;
    const cloudTime = cloudState.updatedAt ? new Date(cloudState.updatedAt).getTime() : 0;

    // If local was never edited by a user OR cloud is newer/equal: Cloud is the authority!
    if (!localState.updatedAt || cloudTime >= localTime) {
      return {
        state: {
          ...cloudState,
          savedAt: cloudState.savedAt || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
        shouldPushToCloud: false,
      };
    }

    // Local in this browser has newer, explicit user changes:
    return {
      state: localState,
      shouldPushToCloud: true,
    };
  }

  // Case B: Cloud document is empty or brand new
  return {
    state: localState,
    shouldPushToCloud: !!localState.updatedAt,
  };
}
