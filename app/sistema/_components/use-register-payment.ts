"use client";

import { useState } from "react";
import {
  feeState,
  memberBalance,
  sumAmounts,
  surchargeFor,
} from "../_lib/billing";
import { DEMO_TODAY } from "../_lib/clock";
import { formatMoney, fullName } from "../_lib/format";
import { accountHolder, findMember, matchesMember } from "../_lib/members";
import type { Fee, Member, PaymentMethod } from "../_types";
import { useSystem } from "./use-system";

const MAX_RESULTS = 6;

interface RegisterPayment {
  query: string;
  setQuery: (query: string) => void;
  results: Member[];
  member?: Member;
  account?: Member;
  chooseMember: (memberId: string) => void;
  clearMember: () => void;
  pendingFees: Fee[];
  isSelected: (feeId: string) => boolean;
  toggleFee: (feeId: string) => void;
  method: PaymentMethod;
  setMethod: (method: PaymentMethod) => void;
  methods: PaymentMethod[];
  subtotal: number;
  surcharge: number;
  total: number;
  canConfirm: boolean;
  confirm: () => void;
}

// State of the "Registrar cobro" modal, shared by the member page, Cobranza
// and the gate. Overdue fees come selected; the late surcharge is computed
// from the fees picked.
export function useRegisterPayment(
  initialMemberId: string | undefined,
  onDone: (receiptId: string) => void,
): RegisterPayment {
  const { state, registerPayment, notify } = useSystem();

  const pendingFor = (member: Member | undefined): Fee[] =>
    member
      ? memberBalance(
          accountHolder(member, state),
          state,
          DEMO_TODAY,
        ).pending.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      : [];
  const defaultSelection = (member: Member | undefined): string[] => {
    const pending = pendingFor(member);
    const overdue = pending.filter(
      (fee) => feeState(fee, DEMO_TODAY) === "vencida",
    );
    return (overdue.length > 0 ? overdue : pending).map(({ id }) => id);
  };

  const initialMember = initialMemberId
    ? findMember(state.members, initialMemberId)
    : undefined;
  const [memberId, setMemberId] = useState(initialMemberId);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(() =>
    defaultSelection(initialMember),
  );
  const member = memberId ? findMember(state.members, memberId) : undefined;
  const account = member && accountHolder(member, state);
  const [method, setMethod] = useState<PaymentMethod>(
    account?.preferredPaymentMethod ?? "efectivo",
  );

  const pendingFees = pendingFor(member);
  const selectedFees = pendingFees.filter(({ id }) => selected.includes(id));
  const subtotal = sumAmounts(selectedFees);
  const surcharge = surchargeFor(
    selectedFees,
    DEMO_TODAY,
    state.settings.lateFeeRate,
  );

  return {
    query,
    setQuery,
    results: query.trim()
      ? state.members
          .filter((candidate) => matchesMember(candidate, query))
          .slice(0, MAX_RESULTS)
      : [],
    member,
    account,
    chooseMember: (id) => {
      const chosen = findMember(state.members, id);
      setMemberId(id);
      setSelected(defaultSelection(chosen));
      if (chosen)
        setMethod(accountHolder(chosen, state).preferredPaymentMethod);
    },
    clearMember: () => {
      setMemberId(undefined);
      setSelected([]);
    },
    pendingFees,
    isSelected: (feeId) => selected.includes(feeId),
    toggleFee: (feeId) =>
      setSelected((current) =>
        current.includes(feeId)
          ? current.filter((id) => id !== feeId)
          : [...current, feeId],
      ),
    method,
    setMethod,
    methods: state.settings.paymentMethods,
    subtotal,
    surcharge,
    total: subtotal + surcharge,
    canConfirm: selectedFees.length > 0,
    confirm: () => {
      if (!account || selectedFees.length === 0) return;
      const receiptId = registerPayment({
        memberId: account.id,
        feeIds: selectedFees.map(({ id }) => id),
        method,
      });
      notify(
        `Cobro de ${formatMoney(subtotal + surcharge)} registrado a ${fullName(account)}.`,
      );
      onDone(receiptId);
    },
  };
}
