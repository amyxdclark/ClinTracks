import type { AppState } from './types';
import { INITIAL_STATE } from './types';

const STORAGE_KEY = 'clintrack-app-state';
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(serializedState);
    // Migrate old formats
    if (parsed.users && !parsed.profiles) {
      return INITIAL_STATE;
    }
    return { ...INITIAL_STATE, ...parsed };
  } catch {
    console.error('Failed to load state');
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState): void => {
  try {
    const toSave = { ...state, lastSavedAt: new Date().toISOString() };
    const serializedState = JSON.stringify(toSave);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch {
    console.error('Failed to save state');
  }
};

export const debouncedSaveState = (state: AppState): void => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveState(state), 500);
};

export const exportState = (state: AppState): void => {
  const dataStr = JSON.stringify(state, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `clintrack-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importState = (file: File): Promise<AppState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target?.result as string);
        if (!state.version || !state.profiles) {
          reject(new Error('Invalid ClinTrack backup file'));
          return;
        }
        resolve(state);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const mergeState = (current: AppState, incoming: AppState): AppState => {
  const mergeArrays = <T extends { id: string }>(a: T[], b: T[]): T[] => {
    const map = new Map<string, T>();
    a.forEach(item => map.set(item.id, item));
    b.forEach(item => map.set(item.id, item));
    return Array.from(map.values());
  };
  return {
    ...current,
    lastSavedAt: new Date().toISOString(),
    profiles: mergeArrays(current.profiles, incoming.profiles),
    programs: mergeArrays(current.programs, incoming.programs),
    cohorts: mergeArrays(current.cohorts, incoming.cohorts),
    sites: mergeArrays(current.sites, incoming.sites),
    capacities: mergeArrays(current.capacities, incoming.capacities),
    requirementTemplates: mergeArrays(current.requirementTemplates, incoming.requirementTemplates),
    studentProgress: mergeArrays(current.studentProgress, incoming.studentProgress),
    shiftLogs: mergeArrays(current.shiftLogs, incoming.shiftLogs),
    skillLogs: mergeArrays(current.skillLogs, incoming.skillLogs),
    approvals: mergeArrays(current.approvals, incoming.approvals),
    scheduleRequests: mergeArrays(current.scheduleRequests, incoming.scheduleRequests),
    notifications: mergeArrays(current.notifications, incoming.notifications),
    audit: (() => {
      const existingIds = new Set(current.audit.map(a => a.id));
      return [...current.audit, ...incoming.audit.filter(a => !existingIds.has(a.id))];
    })(),
  };
};

export const resetState = (): AppState => {
  localStorage.removeItem(STORAGE_KEY);
  return INITIAL_STATE;
};
