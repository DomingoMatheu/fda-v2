"use client";

import { useState } from "react";
import { formatMoney, fullName } from "../_lib/format";
import { findMember, matchesMember } from "../_lib/members";
import { currentSeason } from "../_lib/pool-access";
import { canGetPass } from "../_lib/season";
import type { Member, Season } from "../_types";
import { useSystem } from "./use-system";

const MAX_RESULTS = 6;

interface IssuePass {
  season?: Season;
  query: string;
  setQuery: (query: string) => void;
  results: Member[];
  member?: Member;
  chooseMember: (memberId: string) => void;
  clearMember: () => void;
  confirm: () => void;
}

// State of the "Emitir carnet" modal: pick an active member without a pass
// and issue it, which adds the season fee to their account.
export function useIssuePass(
  initialMemberId: string | undefined,
  onDone: () => void,
): IssuePass {
  const { state, issuePoolPass, notify } = useSystem();
  const season = currentSeason(state.seasons);
  const [memberId, setMemberId] = useState(initialMemberId);
  const [query, setQuery] = useState("");
  const member = memberId ? findMember(state.members, memberId) : undefined;

  return {
    season,
    query,
    setQuery,
    results: query.trim()
      ? state.members
          .filter(
            (candidate) =>
              matchesMember(candidate, query) &&
              canGetPass(candidate, state, season),
          )
          .slice(0, MAX_RESULTS)
      : [],
    member,
    chooseMember: setMemberId,
    clearMember: () => setMemberId(undefined),
    confirm: () => {
      if (!member || !season || !canGetPass(member, state, season)) return;
      issuePoolPass(member.id);
      notify(
        `Carnet emitido para ${fullName(member)}. Queda pendiente de pago: ${formatMoney(season.memberPassPrice)}.`,
        "success",
      );
      onDone();
    },
  };
}
