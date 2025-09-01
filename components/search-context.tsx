'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface SearchCtx {
  search: string;
  setSearch: (v: string) => void;
}

const Ctx = createContext<SearchCtx | null>(null);

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearchState] = useState('');
  const setSearch = useCallback((v: string) => setSearchState(v), []);
  return <Ctx.Provider value={{ search, setSearch }}>{children}</Ctx.Provider>;
}

export function useGlobalSearch() {
  const c = useContext(Ctx);
  return c ?? { search: '', setSearch: () => {} };
}