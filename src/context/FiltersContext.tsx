import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_FILTERS, type MangaFilters } from '../types/filters';

interface FiltersContextValue {
  filters: MangaFilters;
  setFilters: (f: MangaFilters) => void;
}

const FiltersContext = createContext<FiltersContextValue>({
  filters: DEFAULT_FILTERS,
  setFilters: () => {},
});

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<MangaFilters>(DEFAULT_FILTERS);
  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  return useContext(FiltersContext);
}
