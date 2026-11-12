"use client";

import { useState } from "react";
import {
  ACCESS_LOG_FILTERS,
  type AccessLogFilter,
} from "../_data/season-labels";
import { DEMO_TODAY } from "../_lib/clock";
import { findMember } from "../_lib/members";
import { logsOn } from "../_lib/season";
import type { AccessLog, Member } from "../_types";
import { useSystem } from "./use-system";

export interface AccessLogRow {
  log: AccessLog;
  member?: Member;
}

interface AccessLogFilterOption {
  key: AccessLogFilter;
  label: string;
  count: number;
}

interface AccessLogView {
  rows: AccessLogRow[];
  total: number;
  allowed: number;
  denied: number;
  filters: AccessLogFilterOption[];
  filter: AccessLogFilter;
  setFilter: (filter: AccessLogFilter) => void;
}

// Today's gate log, newest first, with allowed and denied counters.
export function useAccessLog(): AccessLogView {
  const { state } = useSystem();
  const [filter, setFilter] = useState<AccessLogFilter>("todos");
  const logs = logsOn(state.accessLogs, DEMO_TODAY);
  const countOf = (key: AccessLogFilter): number =>
    logs.filter(({ result }) => key === "todos" || result === key).length;

  return {
    rows: logs
      .filter(({ result }) => filter === "todos" || result === filter)
      .map((log) => ({
        log,
        member: log.memberId
          ? findMember(state.members, log.memberId)
          : undefined,
      })),
    total: logs.length,
    allowed: countOf("permitido"),
    denied: countOf("denegado"),
    filters: ACCESS_LOG_FILTERS.map((option) => ({
      ...option,
      count: countOf(option.key),
    })),
    filter,
    setFilter,
  };
}
