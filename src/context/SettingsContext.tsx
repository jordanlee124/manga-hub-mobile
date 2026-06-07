import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReadingMode = 'vertical' | 'ltr' | 'rtl';

interface SettingsContextType {
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  readingMode: 'vertical',
  setReadingMode: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [readingMode, setReadingModeState] = useState<ReadingMode>('vertical');

  useEffect(() => {
    AsyncStorage.getItem('settings:readingMode').then(val => {
      if (val === 'ltr' || val === 'rtl' || val === 'vertical') {
        setReadingModeState(val);
      }
    });
  }, []);

  const setReadingMode = (mode: ReadingMode) => {
    setReadingModeState(mode);
    AsyncStorage.setItem('settings:readingMode', mode);
  };

  return (
    <SettingsContext.Provider value={{ readingMode, setReadingMode }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
