"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { matchesMember } from "../_lib/members";
import type { Member } from "../_types";
import { useSystem } from "./use-system";

const MAX_RESULTS = 6;

interface MemberSearch {
  query: string;
  setQuery: (query: string) => void;
  results: Member[];
  isOpen: boolean;
  close: () => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

// Global member search in the top bar: type a name, DNI or member number and
// jump to the member's page.
export function useMemberSearch(): MemberSearch {
  const router = useRouter();
  const { state } = useSystem();
  const [query, setQuery] = useState("");
  const results = query.trim()
    ? state.members
        .filter((member) => matchesMember(member, query))
        .slice(0, MAX_RESULTS)
    : [];
  const close = (): void => setQuery("");

  return {
    query,
    setQuery,
    results,
    isOpen: query.trim().length > 0,
    close,
    submit: (event) => {
      event.preventDefault();
      const [first] = results;
      if (!first) return;
      router.push(`/sistema/socios/${first.id}`);
      close();
    },
  };
}
