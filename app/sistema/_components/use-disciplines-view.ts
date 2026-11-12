"use client";

import { useState } from "react";
import { DISCIPLINES, type Discipline } from "@/app/_components/disciplines";
import { DISCIPLINE_PROGRAMS } from "../_data/disciplines";
import { memberBalance } from "../_lib/billing";
import { DEMO_TODAY } from "../_lib/clock";
import { findEmployee } from "../_lib/employees";
import {
  activeEnrollments,
  disciplineSummary,
  type DisciplineSummary,
} from "../_lib/enrollments";
import { findMember } from "../_lib/members";
import { slugify } from "../_lib/text";
import type { Employee, Member, MemberFeeStatus } from "../_types";
import { useSystem } from "./use-system";

export interface DisciplineCard extends DisciplineSummary {
  photo?: Discipline;
  coach?: Employee;
  phone?: string;
}

export interface EnrolledMember {
  member: Member;
  enrolledAt: string;
  feeStatus: MemberFeeStatus;
}

interface DisciplinesView {
  cards: DisciplineCard[];
  totalEnrolled: number;
  totalIncome: number;
  selected?: DisciplineCard;
  enrolled: EnrolledMember[];
  open: (id: string) => void;
  close: () => void;
}

function photoOf(id: string): Discipline | undefined {
  return DISCIPLINES.find(({ name }) => slugify(name) === id);
}

export function useDisciplinesView(): DisciplinesView {
  const { state } = useSystem();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cards: DisciplineCard[] = DISCIPLINE_PROGRAMS.map((program) => {
    const coach = findEmployee(program.coachEmployeeId);
    return {
      ...disciplineSummary(state, program),
      photo: photoOf(program.id),
      coach,
      phone: program.contactPhone ?? coach?.phone,
    };
  });
  const selected = cards.find(({ program }) => program.id === selectedId);

  const enrolled: EnrolledMember[] = selected
    ? activeEnrollments(state, selected.program.id)
        .flatMap((enrollment) => {
          const member = findMember(state.members, enrollment.memberId);
          return member
            ? [
                {
                  member,
                  enrolledAt: enrollment.enrolledAt,
                  feeStatus: memberBalance(member, state, DEMO_TODAY).status,
                },
              ]
            : [];
        })
        .sort((a, b) =>
          a.member.lastName.localeCompare(b.member.lastName, "es"),
        )
    : [];

  return {
    cards,
    totalEnrolled: cards.reduce((total, card) => total + card.enrolled, 0),
    totalIncome: cards.reduce((total, card) => total + card.monthlyIncome, 0),
    selected,
    enrolled,
    open: setSelectedId,
    close: () => setSelectedId(null),
  };
}
