"use client";

import { createContext } from "react";
import type { SystemSettings } from "../_data/settings";
import type { SystemState } from "../_lib/state";
import type {
  AccessLog,
  MedicalClearance,
  MemberStatus,
  NewMemberInput,
  RegisterPaymentInput,
  SystemUser,
} from "../_types";

export type ToastTone = "success" | "info" | "error";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

export interface SystemContextValue {
  state: SystemState;
  user: SystemUser;
  toasts: Toast[];
  // Returns the id of the receipt it issued.
  registerPayment: (input: RegisterPaymentInput) => string;
  // Returns the id of the new member.
  addMember: (input: NewMemberInput) => string;
  issuePoolPass: (memberId: string) => void;
  recordMedicalClearance: (
    memberId: string,
    clearance: MedicalClearance,
  ) => void;
  recordAccess: (log: Omit<AccessLog, "id" | "at">) => void;
  setMemberStatus: (memberId: string, status: MemberStatus) => void;
  updateSettings: (settings: SystemSettings) => void;
  notify: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: number) => void;
}

export const SystemContext = createContext<SystemContextValue | null>(null);
