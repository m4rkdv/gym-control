"use client";

import { ReactNode } from "react";
import { ApiProvider } from "./api-context";
import { MemberProvider } from "./member-context";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApiProvider>
      <MemberProvider>
        {children}
      </MemberProvider>
    </ApiProvider>
  );
}