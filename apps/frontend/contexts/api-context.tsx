"use client";

import React,{ createContext, useContext, ReactNode } from "react";
import axios from "axios";
import { useAuth } from "./auth-context";

interface ApiContextType {
  get: <T>(endpoint: string) => Promise<T>;
  post: <T, B = unknown>(endpoint: string, data?: B) => Promise<T>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
  });

  const get = async <T,>(endpoint: string): Promise<T> => {
    const res = await api.get<T>(endpoint);
    return res.data;
  };

  const post = async <T, B = unknown>(
    endpoint: string,
    data?: B
  ): Promise<T> => {
    const res = await api.post<T>(endpoint, data);
    return res.data;
  };

  return (
    <ApiContext.Provider value={{ get, post }}>
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
