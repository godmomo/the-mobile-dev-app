import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AppState {
  counter: number;
  username: string;
  theme: 'light' | 'dark';
}

interface AppContextType {
  state: AppState;
  incrementCounter: () => void;
  decrementCounter: () => void;
  resetCounter: () => void;
  setUsername: (name: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  isLoading: boolean;
}

const initialState: AppState = {
  counter: 0,
  username: 'User',
  theme: 'light',
};

const STORAGE_KEY = '@app_state';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    loadState();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveState();
    }
  }, [state, isLoading]);

  const loadState = async () => {
    try {
      const storedState = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedState) {
        const parsedState = JSON.parse(storedState) as Partial<AppState>;
        setState((prev) => ({ ...prev, ...parsedState }));
      }
    } catch (error) {
      console.error('Failed to load state from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to storage:', error);
    }
  };

  const incrementCounter = useCallback(() => {
    setState((prev) => ({ ...prev, counter: prev.counter + 1 }));
  }, []);

  const decrementCounter = useCallback(() => {
    setState((prev) => ({ ...prev, counter: prev.counter - 1 }));
  }, []);

  const resetCounter = useCallback(() => {
    setState((prev) => ({ ...prev, counter: 0 }));
  }, []);

  const setUsername = useCallback((name: string) => {
    setState((prev) => ({ ...prev, username: name }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState((prev) => ({ ...prev, theme }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        incrementCounter,
        decrementCounter,
        resetCounter,
        setUsername,
        setTheme,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

