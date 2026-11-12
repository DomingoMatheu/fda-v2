"use client";

import { useState } from "react";
import { USERS } from "../_data/users";
import { DEMO_TODAY } from "../_lib/clock";
import {
  birthdaysThisWeek,
  dashboardStats,
  debtors,
  expiringClearances,
  latestPayments,
  monthlyCollection,
  type Birthday,
  type DashboardStats,
  type Debtor,
  type MonthlyTotal,
} from "../_lib/dashboard";
import { CLEARANCE_WARNING_DAYS } from "../_lib/member-account";
import { findMember } from "../_lib/members";
import { periodLabel, periodOf } from "../_lib/period";
import { can } from "../_lib/permissions";
import { currentSeason } from "../_lib/pool-access";
import type { ActivityEntry, Member, Payment } from "../_types";
import { useSystem } from "./use-system";

const DEBTORS_SHOWN = 5;
const PAYMENTS_SHOWN = 8;
const ACTIVITY_SHOWN = 8;

export interface PaymentRow {
  payment: Payment;
  member?: Member;
}

export interface ActivityRow {
  entry: ActivityEntry;
  userName: string;
}

interface Dashboard {
  greeting: string;
  monthLabel: string;
  seasonName?: string;
  stats: DashboardStats;
  topDebtors: Debtor[];
  debtorCount: number;
  clearances: Member[];
  birthdays: Birthday[];
  payments: PaymentRow[];
  activity: ActivityRow[];
  collection: MonthlyTotal[];
  canCharge: boolean;
  canAddMembers: boolean;
  isPaymentOpen: boolean;
  openPayment: () => void;
  closePayment: () => void;
}

function userName(userId: string): string {
  return USERS.find(({ id }) => id === userId)?.name ?? "Sistema";
}

// Everything the dashboard shows, read from the live state so a payment
// registered anywhere updates it.
export function useDashboard(): Dashboard {
  const { state, user } = useSystem();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const allDebtors = debtors(state, DEMO_TODAY);

  return {
    greeting: `Hola, ${user.name.split(" ")[0]}`,
    monthLabel: periodLabel(periodOf(DEMO_TODAY)),
    seasonName: currentSeason(state.seasons)?.name,
    stats: dashboardStats(state, DEMO_TODAY),
    topDebtors: allDebtors.slice(0, DEBTORS_SHOWN),
    debtorCount: allDebtors.length,
    clearances: expiringClearances(state, DEMO_TODAY, CLEARANCE_WARNING_DAYS),
    birthdays: birthdaysThisWeek(state, DEMO_TODAY),
    payments: latestPayments(state, PAYMENTS_SHOWN).map((payment) => ({
      payment,
      member: findMember(state.members, payment.memberId),
    })),
    activity: state.activity.slice(0, ACTIVITY_SHOWN).map((entry) => ({
      entry,
      userName: userName(entry.userId),
    })),
    collection: monthlyCollection(state, DEMO_TODAY),
    canCharge: can(user, "billing:write"),
    canAddMembers: can(user, "members:write"),
    isPaymentOpen,
    openPayment: () => setIsPaymentOpen(true),
    closePayment: () => setIsPaymentOpen(false),
  };
}
