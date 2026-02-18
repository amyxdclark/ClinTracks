import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AuditEvent, Notification } from './types';
import { INITIAL_STATE } from './types';
import { loadState, debouncedSaveState } from './storage';

interface AppContextType {
  state: AppState;
  updateState: (updater: (prevState: AppState) => AppState) => void;
  resetToDefaults: () => void;
  addAuditEvent: (action: string, entityType: string, entityId: string, details?: string) => void;
  addNotification: (userId: string, title: string, message: string, type: Notification['type'], linkTo?: string) => void;
  login: (profileId: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    debouncedSaveState(state);
  }, [state]);

  const updateState = useCallback((updater: (prevState: AppState) => AppState) => {
    setState(updater);
  }, []);

  const resetToDefaults = useCallback(() => {
    setState({ ...INITIAL_STATE, lastSavedAt: new Date().toISOString() });
  }, []);

  const addAuditEvent = useCallback((action: string, entityType: string, entityId: string, details?: string) => {
    setState(prev => ({
      ...prev,
      audit: [...prev.audit, {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        action,
        entityType,
        entityId,
        userId: prev.activeProfileId,
        timestamp: new Date().toISOString(),
        details,
      } as AuditEvent],
    }));
  }, []);

  const addNotification = useCallback((userId: string, title: string, message: string, type: Notification['type'], linkTo?: string) => {
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
        linkTo,
      } as Notification],
    }));
  }, []);

  const login = useCallback((profileId: string) => {
    setState(prev => ({
      ...prev,
      isLoggedIn: true,
      activeProfileId: profileId,
    }));
  }, []);

  const logout = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoggedIn: false,
    }));
  }, []);

  return (
    <AppContext.Provider value={{ state, updateState, resetToDefaults, addAuditEvent, addNotification, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
