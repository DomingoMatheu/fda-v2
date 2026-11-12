"use client";

import { useState } from "react";
import { DEMO_TODAY } from "../_lib/clock";
import { canEmailNotice } from "../_lib/debt-notice";
import { accountHolder, findMember } from "../_lib/members";
import { memberBalance } from "../_lib/billing";
import { can } from "../_lib/permissions";
import { useSystem } from "./use-system";

interface DebtNoticeButton {
  // Only roles that handle billing, and only when someone owes.
  visible: boolean;
  // Nobody picked has an email address to send to.
  noEmail: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export function useDebtNoticeButton(memberIds: string[]): DebtNoticeButton {
  const { state, user } = useSystem();
  const [isOpen, setIsOpen] = useState(false);
  const accounts = memberIds
    .map((id) => findMember(state.members, id))
    .filter((member) => member !== undefined)
    .map((member) => accountHolder(member, state));
  const owes = accounts.some(
    (account) => memberBalance(account, state, DEMO_TODAY).overdue.length > 0,
  );

  return {
    visible: can(user, "billing:write") && owes,
    noEmail: !accounts.some((account) =>
      canEmailNotice(account, state, DEMO_TODAY),
    ),
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
