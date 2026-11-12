"use client";

import { useState } from "react";
import { memberBalance } from "../_lib/billing";
import { DEMO_TODAY } from "../_lib/clock";
import {
  debtEmail,
  lastNotice,
  noticedRecently,
  type DebtEmail,
} from "../_lib/debt-notice";
import { fullName } from "../_lib/format";
import { accountHolder, findMember } from "../_lib/members";
import type { DebtNotice, Member, MemberBalance } from "../_types";
import { useSystem } from "./use-system";

export interface NoticeRecipient {
  account: Member;
  balance: MemberBalance;
  last?: DebtNotice;
  // Warned in the last few days: left unticked in a bulk notice.
  recent: boolean;
}

interface DebtNoticeForm {
  recipients: NoticeRecipient[];
  withoutEmail: NoticeRecipient[];
  isSelected: (memberId: string) => boolean;
  toggle: (memberId: string) => void;
  selectedCount: number;
  preview?: { recipient: NoticeRecipient; email: DebtEmail };
  showPreview: (memberId: string) => void;
  send: () => void;
}

// State of the "Avisar deuda por correo" modal: the accounts that owe, which
// of them get the email and the email each one would receive.
export function useDebtNotice(
  memberIds: string[],
  onDone: () => void,
): DebtNoticeForm {
  const { state, sendDebtNotices, notify } = useSystem();

  const accounts = new Map<string, Member>();
  for (const id of memberIds) {
    const member = findMember(state.members, id);
    if (member) {
      const account = accountHolder(member, state);
      accounts.set(account.id, account);
    }
  }
  const debtors: NoticeRecipient[] = [...accounts.values()]
    .map((account) => {
      const last = lastNotice(state.notices, account.id);
      return {
        account,
        balance: memberBalance(account, state, DEMO_TODAY),
        last,
        recent: noticedRecently(last, DEMO_TODAY),
      };
    })
    .filter(({ balance }) => balance.overdue.length > 0);
  const recipients = debtors.filter(({ account }) => account.email);
  const withoutEmail = debtors.filter(({ account }) => !account.email);

  const [selected, setSelected] = useState<string[]>(() =>
    recipients
      .filter(({ recent }) => recipients.length === 1 || !recent)
      .map(({ account }) => account.id),
  );
  const [previewId, setPreviewId] = useState(recipients[0]?.account.id);
  const previewed = recipients.find(({ account }) => account.id === previewId);

  return {
    recipients,
    withoutEmail,
    isSelected: (memberId) => selected.includes(memberId),
    toggle: (memberId) =>
      setSelected((current) =>
        current.includes(memberId)
          ? current.filter((id) => id !== memberId)
          : [...current, memberId],
      ),
    selectedCount: selected.length,
    preview: previewed && {
      recipient: previewed,
      email: debtEmail(
        previewed.account,
        previewed.balance,
        state.settings.lateFeeRate,
      ),
    },
    showPreview: setPreviewId,
    send: () => {
      const sent = sendDebtNotices(selected);
      const [only] = recipients.filter(({ account }) =>
        selected.includes(account.id),
      );
      notify(
        sent === 1 && only
          ? `Se envió el aviso de deuda a ${fullName(only.account)}.`
          : `Se enviaron ${sent} avisos de deuda por correo.`,
      );
      onDone();
    },
  };
}
