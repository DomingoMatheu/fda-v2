"use client";

import { useState } from "react";
import { DEMO_TODAY } from "../_lib/clock";
import {
  buildMemberRows,
  EMPTY_MEMBER_FILTERS,
  filterMemberRows,
  type MemberFilters,
  type MemberRow,
} from "../_lib/member-list";
import { can } from "../_lib/permissions";
import { useSystem } from "./use-system";

interface MemberFiltersState {
  filters: MemberFilters;
  setFilter: <Key extends keyof MemberFilters>(
    key: Key,
    value: MemberFilters[Key],
  ) => void;
  clearFilters: () => void;
  isFiltered: boolean;
  rows: MemberRow[];
  total: number;
  canAddMembers: boolean;
}

// Search and filters of the members list. The rows are rebuilt from the live
// state, so a payment shows up as "al día" right away.
export function useMemberFilters(): MemberFiltersState {
  const { state, user } = useSystem();
  const [filters, setFilters] = useState<MemberFilters>(EMPTY_MEMBER_FILTERS);
  const allRows = buildMemberRows(state, DEMO_TODAY);

  return {
    filters,
    setFilter: (key, value) =>
      setFilters((current) => ({ ...current, [key]: value })),
    clearFilters: () => setFilters(EMPTY_MEMBER_FILTERS),
    isFiltered: Object.values(filters).some(Boolean),
    rows: filterMemberRows(allRows, filters),
    total: allRows.length,
    canAddMembers: can(user, "members:write"),
  };
}
