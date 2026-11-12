"use client";

import { useRef, useState, type RefObject } from "react";
import { VISITOR_FEES, type VisitorFee } from "@/app/_components/fees";
import { DEMO_TODAY } from "../_lib/clock";
import { fullName } from "../_lib/format";
import { can } from "../_lib/permissions";
import { checkPoolAccess } from "../_lib/pool-access";
import {
  findMemberAtGate,
  gateDigits,
  gateIssues,
  looksLikeDocument,
  visitorReason,
  type GateIssues,
} from "../_lib/season";
import type { AccessCheck, Member } from "../_types";
import { useSystem } from "./use-system";

export type GateLookup =
  | { kind: "idle" }
  | { kind: "member"; member: Member; check: AccessCheck; issues: GateIssues }
  | { kind: "unknown"; digits: string; isDocument: boolean };

const TOUCH_QUERY = "(pointer: coarse)";

export interface AccessCheckState {
  inputRef: RefObject<HTMLInputElement | null>;
  resultRef: RefObject<HTMLDivElement | null>;
  query: string;
  setQuery: (query: string) => void;
  search: () => void;
  clear: () => void;
  lookup: GateLookup;
  visitorFee: VisitorFee;
  setVisitorFee: (label: string) => void;
  registerEntry: () => void;
  registerVisitor: () => void;
  canRegister: boolean;
  canCharge: boolean;
  canManageSeason: boolean;
  canAddMember: boolean;
}

// The gate: type a DNI or member number, see whether they get in and why.
// The result is derived from the store on every render, so charging a fee
// or loading a clearance from the shortcuts updates the card at once.
export function useAccessCheck(): AccessCheckState {
  const { state, user, recordAccess, notify } = useSystem();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [visitorLabel, setVisitorLabel] = useState(VISITOR_FEES[0].label);
  const canManageSeason = can(user, "season:write");

  const member = findMemberAtGate(state.members, searched);
  const lookup: GateLookup = !searched
    ? { kind: "idle" }
    : member
      ? {
          kind: "member",
          member,
          check: checkPoolAccess(member, state, DEMO_TODAY),
          issues: gateIssues(member, state, DEMO_TODAY),
        }
      : {
          kind: "unknown",
          digits: searched,
          isDocument: looksLikeDocument(searched),
        };
  const visitorFee =
    VISITOR_FEES.find(({ label }) => label === visitorLabel) ?? VISITOR_FEES[0];

  const clear = (): void => {
    setQuery("");
    setSearched("");
    inputRef.current?.focus();
  };

  return {
    inputRef,
    resultRef,
    query,
    setQuery,
    search: () => {
      setSearched(gateDigits(query));
      // On a phone, close the keyboard so the result card is in view.
      if (window.matchMedia(TOUCH_QUERY).matches) inputRef.current?.blur();
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        }),
      );
    },
    clear,
    lookup,
    visitorFee,
    setVisitorFee: setVisitorLabel,
    registerEntry: () => {
      if (lookup.kind !== "member") return;
      const { check } = lookup;
      recordAccess({
        gate: "porteria",
        memberId: lookup.member.id,
        documentNumber: lookup.member.documentNumber,
        result: check.allowed ? "permitido" : "denegado",
        reason: check.reasons.join(" · ") || undefined,
      });
      notify(
        check.allowed
          ? `Ingreso registrado: ${fullName(lookup.member)}.`
          : `Rechazo registrado: ${fullName(lookup.member)}.`,
        check.allowed ? "success" : "info",
      );
      clear();
    },
    registerVisitor: () => {
      if (lookup.kind !== "unknown") return;
      recordAccess({
        gate: "porteria",
        documentNumber: lookup.digits,
        result: "permitido",
        reason: visitorReason(visitorFee),
      });
      notify(
        `Visitante registrado (${visitorFee.label}, ${visitorFee.amount}).`,
        "success",
      );
      clear();
    },
    canRegister: canManageSeason,
    canCharge: can(user, "billing:write"),
    canManageSeason,
    canAddMember: can(user, "members:write"),
  };
}
