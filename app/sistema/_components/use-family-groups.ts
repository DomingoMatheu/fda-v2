"use client";

import { useState } from "react";
import { DEMO_TODAY } from "../_lib/clock";
import {
  familyGroupSummaries,
  type FamilyGroupSummary,
} from "../_lib/family-groups";
import { searchable } from "../_lib/text";
import { useSystem } from "./use-system";

export type FamilyGroupFilter = "todos" | "con-aviso" | "con-deuda";

interface FamilyGroups {
  groups: FamilyGroupSummary[];
  query: string;
  setQuery: (query: string) => void;
  filter: FamilyGroupFilter;
  setFilter: (filter: FamilyGroupFilter) => void;
  counts: Record<FamilyGroupFilter, number>;
  memberCount: number;
  pleno: number;
  basico: number;
  monthlyTotal: number;
}

const MATCHES: Record<
  FamilyGroupFilter,
  (summary: FamilyGroupSummary) => boolean
> = {
  todos: () => true,
  "con-aviso": ({ warnings }) => warnings.length > 0,
  "con-deuda": ({ overdueTotal }) => overdueTotal > 0,
};

function matchesQuery(summary: FamilyGroupSummary, query: string): boolean {
  const text = searchable(query);
  return (
    !text ||
    summary.members.some((member) =>
      searchable(`${member.firstName} ${member.lastName}`).includes(text),
    )
  );
}

export function useFamilyGroups(): FamilyGroups {
  const { state } = useSystem();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FamilyGroupFilter>("todos");
  const all = familyGroupSummaries(state, DEMO_TODAY);

  return {
    groups: all.filter(
      (summary) => MATCHES[filter](summary) && matchesQuery(summary, query),
    ),
    query,
    setQuery,
    filter,
    setFilter,
    counts: {
      todos: all.length,
      "con-aviso": all.filter(MATCHES["con-aviso"]).length,
      "con-deuda": all.filter(MATCHES["con-deuda"]).length,
    },
    memberCount: all.reduce((total, { members }) => total + members.length, 0),
    pleno: all.filter(({ group }) => group.plan === "pleno").length,
    basico: all.filter(({ group }) => group.plan === "basico").length,
    monthlyTotal: all.reduce((total, { monthlyFee }) => total + monthlyFee, 0),
  };
}
