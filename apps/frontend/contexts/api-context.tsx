"use client";

import { createContext, useContext, ReactNode } from "react";

interface ApiContextType {
  get: <T>(endpoint: string) => Promise<T>;
  post: <T, B = unknown>(endpoint: string, data?: B) => Promise<T>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
  const value: ApiContextType = {
    get: () => Promise.reject('Not implemented'),
    post: () => Promise.reject('Not implemented'),
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};
