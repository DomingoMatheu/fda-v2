"use client";

import { useState } from "react";
import {
  amountsByMethod,
  cashDays,
  cashStatus,
  closingOf,
  dayLabel,
  dayMovements,
  isAfterClosing,
  sumMovements,
  totalOf,
  type CashMovement,
  type CashStatus,
  type MovementOrigin,
} from "../_lib/cash";
import { DEMO_TODAY } from "../_lib/clock";
import { can } from "../_lib/permissions";
import { findUserById } from "../_lib/receipts";
import type {
  AmountsByMethod,
  CashClosing,
  Member,
  PaymentMethod,
  Receipt,
} from "../_types";
import { useSystem } from "./use-system";

export const ALL = "todos";

export type MethodFilter = PaymentMethod | typeof ALL;
export type OriginFilter = MovementOrigin | typeof ALL;
export type CashTab = "dia" | "historial";
export type CashModal = "income" | "closing" | null;

export interface CashMovementRow extends CashMovement {
  member?: Member;
  receipt?: Receipt;
  registeredBy: string;
  afterClosing: boolean;
}

export interface DayOption {
  day: string;
  label: string;
}

const STATUS_SUFFIX: Record<CashStatus, string> = {
  abierta: "",
  "sin-cerrar": " · sin cerrar",
  cerrada: " · cerrada",
  diferencia: " · con diferencia",
};

export interface CashDay {
  tab: CashTab;
  setTab: (tab: CashTab) => void;
  days: DayOption[];
  day: string;
  isToday: boolean;
  setDay: (day: string) => void;
  showDay: (day: string) => void;
  // Days are newest first: "older" moves down the list.
  goOlder: (() => void) | undefined;
  goNewer: (() => void) | undefined;
  closing?: CashClosing;
  closedBy?: string;
  status: CashStatus;
  amounts: AmountsByMethod;
  total: number;
  movementCount: number;
  feesTotal: number;
  feesCount: number;
  othersTotal: number;
  othersCount: number;
  afterClosingCount: number;
  afterClosingTotal: number;
  methods: PaymentMethod[];
  rows: CashMovementRow[];
  methodFilter: MethodFilter;
  setMethodFilter: (method: MethodFilter) => void;
  originFilter: OriginFilter;
  setOriginFilter: (origin: OriginFilter) => void;
  canWrite: boolean;
  modal: CashModal;
  openModal: (modal: Exclude<CashModal, null>) => void;
  closeModal: () => void;
  onIncomeRegistered: () => void;
  print: () => void;
}

// State of "Caja del día": the day on screen, its movements and totals, the
// filters of the table and which modal is open. Everything else is derived
// from the store on every render.
export function useCashDay(): CashDay {
  const { state, user } = useSystem();
  const [tab, setTab] = useState<CashTab>("dia");
  const [day, setDay] = useState(DEMO_TODAY);
  const [methodFilter, setMethodFilter] = useState<MethodFilter>(ALL);
  const [originFilter, setOriginFilter] = useState<OriginFilter>(ALL);
  const [modal, setModal] = useState<CashModal>(null);

  const days = cashDays(state, DEMO_TODAY);
  const dayOptions = days.map((option) => ({
    day: option,
    label: `${dayLabel(option)}${option === DEMO_TODAY ? " (hoy)" : ""}${STATUS_SUFFIX[cashStatus(closingOf(state, option), option, DEMO_TODAY)]}`,
  }));
  const index = days.indexOf(day);
  const closing = closingOf(state, day);
  const members = new Map(state.members.map((member) => [member.id, member]));
  const receipts = new Map(
    state.receipts.map((receipt) => [receipt.id, receipt]),
  );

  const movements: CashMovementRow[] = dayMovements(state, day).map(
    (movement) => ({
      ...movement,
      member: movement.payment && members.get(movement.payment.memberId),
      receipt: movement.payment && receipts.get(movement.payment.receiptId),
      registeredBy: findUserById(movement.registeredByUserId)?.name ?? "—",
      afterClosing: isAfterClosing(movement, closing),
    }),
  );
  const fees = movements.filter(({ origin }) => origin === "cuota");
  const others = movements.filter(({ origin }) => origin !== "cuota");
  const late = movements.filter(({ afterClosing }) => afterClosing);
  const amounts = amountsByMethod(movements);
  const methods = state.settings.paymentMethods;
  const usedMethods = (Object.keys(amounts) as PaymentMethod[]).filter(
    (method) => amounts[method] > 0 && !methods.includes(method),
  );

  const rows = movements.filter(
    (movement) =>
      (methodFilter === ALL || movement.method === methodFilter) &&
      (originFilter === ALL || movement.origin === originFilter),
  );

  const showDay = (next: string): void => {
    setDay(next);
    setTab("dia");
  };

  return {
    tab,
    setTab,
    days: dayOptions,
    day,
    isToday: day === DEMO_TODAY,
    setDay,
    showDay,
    goOlder:
      index < days.length - 1 ? () => setDay(days[index + 1]) : undefined,
    goNewer: index > 0 ? () => setDay(days[index - 1]) : undefined,
    closing,
    closedBy: closing && findUserById(closing.closedByUserId)?.name,
    status: cashStatus(closing, day, DEMO_TODAY),
    amounts,
    total: totalOf(amounts),
    movementCount: movements.length,
    feesTotal: sumMovements(fees),
    feesCount: fees.length,
    othersTotal: sumMovements(others),
    othersCount: others.length,
    afterClosingCount: late.length,
    afterClosingTotal: sumMovements(late),
    methods: [...methods, ...usedMethods],
    rows,
    methodFilter,
    setMethodFilter,
    originFilter,
    setOriginFilter,
    canWrite: can(user, "billing:write"),
    modal,
    openModal: setModal,
    closeModal: () => setModal(null),
    // Incomes always go into today's register.
    onIncomeRegistered: () => showDay(DEMO_TODAY),
    print: () => window.print(),
  };
}
