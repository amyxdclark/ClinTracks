import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState } from './types';
import { INITIAL_STATE } from './types';
import { loadState, saveState } from './storage';

interface AppContextType {
  state: AppState;
  updateState: (updater: (prevState: AppState) => AppState) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = (updater: (prevState: AppState) => AppState) => {
    setState(updater);
  };

  const resetToDefaults = () => {
    setState(INITIAL_STATE);
  };

  return (
    <AppContext.Provider value={{ state, updateState, resetToDefaults }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
