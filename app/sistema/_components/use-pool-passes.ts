"use client";

import { useState } from "react";
import { PASS_FILTERS } from "../_data/season-labels";
import { DEMO_TODAY } from "../_lib/clock";
import { matchesMember } from "../_lib/members";
import { can } from "../_lib/permissions";
import { currentSeason } from "../_lib/pool-access";
import {
  matchesPassFilter,
  seasonPassRows,
  type PassFilter,
  type PassRow,
} from "../_lib/season";
import type { Season } from "../_types";
import { useSystem } from "./use-system";

interface PassFilterOption {
  key: PassFilter;
  label: string;
  count: number;
}

interface PoolPasses {
  season?: Season;
  rows: PassRow[];
  filters: PassFilterOption[];
  filter: PassFilter;
  setFilter: (filter: PassFilter) => void;
  query: string;
  setQuery: (query: string) => void;
  countOf: (filter: PassFilter) => number;
  canManageSeason: boolean;
  canCharge: boolean;
}

// The passes of the current season with their payment and clearance state,
// filtered by situation and searched by name, DNI or member number.
export function usePoolPasses(): PoolPasses {
  const { state, user } = useSystem();
  const [filter, setFilter] = useState<PassFilter>("todos");
  const [query, setQuery] = useState("");
  const season = currentSeason(state.seasons);
  const all = season ? seasonPassRows(state, season, DEMO_TODAY) : [];
  const countOf = (key: PassFilter): number =>
    all.filter((row) => matchesPassFilter(row, key)).length;

  return {
    season,
    rows: all.filter(
      (row) =>
        matchesPassFilter(row, filter) && matchesMember(row.member, query),
    ),
    filters: PASS_FILTERS.map((option) => ({
      ...option,
      count: countOf(option.key),
    })),
    filter,
    setFilter,
    query,
    setQuery,
    countOf,
    canManageSeason: can(user, "season:write"),
    canCharge: can(user, "billing:write"),
  };
}
