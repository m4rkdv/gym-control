"use client";

import React,{ createContext, useContext, ReactNode } from "react";
import axios, { AxiosError } from "axios";
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

  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      let message = "Something went wrong";

      if (error.response?.data) {
        const raw = error.response.data;
        if (raw && typeof raw === "object") {
          const possible = raw as { error?: string; message?: string };
          message = possible.error ?? possible.message ?? message;
        }
      } else if (error.request) {
        message = "Network error";
      }

      throw new Error(message);
    }
  );

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