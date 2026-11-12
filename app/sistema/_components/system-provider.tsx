"use client";

import type { ReactNode } from "react";
import type { SystemUser } from "../_types";
import { SystemContext } from "./system-context";
import { Toaster } from "./toaster";
import { useSystemStore } from "./use-system-store";

interface SystemProviderProps {
  user: SystemUser;
  children: ReactNode;
}

export function SystemProvider({ user, children }: SystemProviderProps) {
  const value = useSystemStore(user);
  return (
    <SystemContext value={value}>
      {children}
      <Toaster />
    </SystemContext>
  );
}
