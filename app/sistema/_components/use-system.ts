"use client";

import { useContext } from "react";
import { SystemContext, type SystemContextValue } from "./system-context";

export function useSystem(): SystemContextValue {
  const value = useContext(SystemContext);
  if (!value) throw new Error("useSystem must be used inside SystemProvider");
  return value;
}
