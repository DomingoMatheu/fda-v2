"use client";

import { useState } from "react";
import { feeState, memberBalance } from "../_lib/billing";
import { DEMO_TODAY } from "../_lib/clock";
import { familyMembers } from "../_lib/family-groups";
import { fullName } from "../_lib/format";
import {
  accountFees,
  accountPayments,
  clearanceState,
  memberPrograms,
  poolSituation,
  type ClearanceState,
  type PoolSituation,
} from "../_lib/member-account";
import { familyGroupName } from "../_lib/member-list";
import { accountHolder, findMember } from "../_lib/members";
import { can } from "../_lib/permissions";
import type { SystemState } from "../_lib/state";
import type {
  DisciplineProgram,
  FamilyGroup,
  Fee,
  FeeState,
  Member,
  MemberBalance,
  Payment,
  Receipt,
} from "../_types";
import { useSystem } from "./use-system";

export interface FeeRow {
  fee: Fee;
  state: FeeState;
}

export interface PaymentWithReceipt {
  payment: Payment;
  receipt?: Receipt;
}

export type AccountTab = "cuotas" | "pagos";

export type StatusDialog = "suspender" | "reactivar";

export interface MemberDetailData {
  member: Member;
  account: Member;
  balance: MemberBalance;
  group?: FamilyGroup;
  groupName?: string;
  family: Member[];
  programs: DisciplineProgram[];
  pool: PoolSituation;
  clearance: ClearanceState;
  fees: FeeRow[];
  payments: PaymentWithReceipt[];
}

interface MemberDetail {
  data?: MemberDetailData;
  canCharge: boolean;
  canEdit: boolean;
  tab: AccountTab;
  setTab: (tab: AccountTab) => void;
  isPaymentOpen: boolean;
  openPayment: () => void;
  closePayment: () => void;
  lastReceiptId?: string;
  onRegistered: (receiptId: string) => void;
  statusDialog?: StatusDialog;
  openStatusDialog: (dialog: StatusDialog) => void;
  closeStatusDialog: () => void;
  confirmStatus: () => void;
}

function detailData(member: Member, state: SystemState): MemberDetailData {
  const account = accountHolder(member, state);
  const group = state.familyGroups.find(
    ({ id }) => id === member.familyGroupId,
  );
  return {
    member,
    account,
    balance: memberBalance(account, state, DEMO_TODAY),
    group,
    groupName: group && familyGroupName(group, state.members),
    family: familyMembers(member, state),
    programs: memberPrograms(member, state),
    pool: poolSituation(member, state),
    clearance: clearanceState(member, DEMO_TODAY),
    fees: accountFees(member, state).map((fee) => ({
      fee,
      state: feeState(fee, DEMO_TODAY),
    })),
    payments: accountPayments(member, state).map((payment) => ({
      payment,
      receipt: state.receipts.find(({ id }) => id === payment.receiptId),
    })),
  };
}

// The member page ("ficha"): everything about one member plus the actions
// on it (charge, remind, suspend or reactivate).
export function useMemberDetail(memberId: string): MemberDetail {
  const { state, user, setMemberStatus, notify } = useSystem();
  const [tab, setTab] = useState<AccountTab>("cuotas");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [lastReceiptId, setLastReceiptId] = useState<string>();
  const [statusDialog, setStatusDialog] = useState<StatusDialog>();
  const member = findMember(state.members, memberId);

  return {
    data: member && detailData(member, state),
    canCharge: can(user, "billing:write"),
    canEdit: can(user, "members:write"),
    tab,
    setTab,
    isPaymentOpen,
    openPayment: () => setIsPaymentOpen(true),
    closePayment: () => setIsPaymentOpen(false),
    lastReceiptId,
    onRegistered: (receiptId) => {
      setLastReceiptId(receiptId);
      setTab("pagos");
    },
    statusDialog,
    openStatusDialog: setStatusDialog,
    closeStatusDialog: () => setStatusDialog(undefined),
    confirmStatus: () => {
      if (!member || !statusDialog) return;
      const suspend = statusDialog === "suspender";
      setMemberStatus(member.id, suspend ? "suspendido" : "activo");
      notify(
        suspend
          ? `Se suspendió a ${fullName(member)}.`
          : `Se reactivó a ${fullName(member)}.`,
        suspend ? "info" : "success",
      );
      setStatusDialog(undefined);
    },
  };
}
