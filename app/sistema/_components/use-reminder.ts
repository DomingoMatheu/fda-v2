"use client";

import { memberBalance } from "../_lib/billing";
import { DEMO_TODAY } from "../_lib/clock";
import { accountHolder } from "../_lib/members";
import { reminderUrl } from "../_lib/reminders";
import type { Member } from "../_types";
import { useSystem } from "./use-system";

export function useReminder(member: Member): string | undefined {
  const { state } = useSystem();
  const account = accountHolder(member, state);
  return reminderUrl(account, memberBalance(account, state, DEMO_TODAY));
}
