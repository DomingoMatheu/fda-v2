"use client";

import { useState } from "react";
import { matchesMember } from "../_lib/members";
import type { Member } from "../_types";
import { useSystem } from "./use-system";

const MAX_RESULTS = 6;

interface BookingMemberPicker {
  query: string;
  setQuery: (query: string) => void;
  results: Member[];
}

// Finds the member responsible for a booking by name, DNI or number.
export function useBookingMemberPicker(): BookingMemberPicker {
  const { state } = useSystem();
  const [query, setQuery] = useState("");
  return {
    query,
    setQuery,
    results: query.trim()
      ? state.members
          .filter((member) => matchesMember(member, query))
          .slice(0, MAX_RESULTS)
      : [],
  };
}
