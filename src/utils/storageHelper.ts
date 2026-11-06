import { AppState, DEFAULT_ENTITIES } from '../types/dashboard';
import { createInitialYearData } from '../data/defaultData';
import persistedStateJson from '../data/persistedState.json';

export const DASHBOARD_STORAGE_KEY = 'hrbp_nusaraya_ho_dashboard_v2';

/**
 * Creates the production default state for HRBP Nusaraya Head Office.
 * Uses the persisted source file (src/data/persistedState.json) baked into the build
 * so that republished public builds immediately display the latest saved inputs,
 * entities, and logo without resetting.
 */
export function createDefaultProductionState(): AppState {
  const bundled = persistedStateJson as unknown as AppState;
  if (bundled && bundled.data && bundled.years) {
    return {
      ...bundled,
      entities:
        bundled.entities && Array.isArray(bundled.entities) && bundled.entities.length > 0
          ? bundled.entities
          : DEFAULT_ENTITIES,
      // Leave updatedAt undefined on initial cold fallback so newer cloud/server state still takes precedence
      updatedAt: bundled.updatedAt,
    };
  }

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
    updatedAt: undefined,
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

    if (!parsed.entities || !Array.isArray(parsed.entities) || parsed.entities.length === 0) {
      parsed.entities = DEFAULT_ENTITIES;
    }

    // Compare against bundled persistedStateJson so if the app was republished with newer data, the newer data wins
    const bundled = persistedStateJson as unknown as AppState;
    if (bundled && bundled.updatedAt && parsed.updatedAt) {
      const bundledTime = new Date(bundled.updatedAt).getTime();
      const localTime = new Date(parsed.updatedAt).getTime();
      if (bundledTime > localTime) {
        return bundled;
      }
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
 * Resolves state between local storage and shared server/cloud state.
 */
export function resolveSyncState(
  localState: AppState,
  cloudState: AppState | null
): { state: AppState; shouldPushToCloud: boolean } {
  if (cloudState && cloudState.data) {
    const localTime = localState.updatedAt ? new Date(localState.updatedAt).getTime() : 0;
    const cloudTime = cloudState.updatedAt ? new Date(cloudState.updatedAt).getTime() : 0;

    if (!localState.updatedAt || cloudTime >= localTime) {
      return {
        state: {
          ...cloudState,
          savedAt: cloudState.savedAt || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
        shouldPushToCloud: false,
      };
    }

    return {
      state: localState,
      shouldPushToCloud: true,
    };
  }

  return {
    state: localState,
    shouldPushToCloud: !!localState.updatedAt,
  };
}
