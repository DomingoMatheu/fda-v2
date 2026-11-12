import type { ReactNode } from "react";
import {
  FEE_STATE_LABELS,
  FEE_STATUS_LABELS,
  MEMBER_STATUS_LABELS,
} from "../_data/labels";
import type { FeeState, MemberFeeStatus, MemberStatus } from "../_types";

export type BadgeTone = "ok" | "warn" | "danger" | "neutral" | "info";

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone, children }: BadgeProps) {
  return <span className={`sys-badge sys-badge--${tone}`}>{children}</span>;
}

const FEE_STATUS_TONES: Record<MemberFeeStatus, BadgeTone> = {
  "al-dia": "ok",
  "en-mora": "warn",
  moroso: "danger",
  exento: "info",
};

const FEE_STATE_TONES: Record<FeeState, BadgeTone> = {
  paga: "ok",
  pendiente: "neutral",
  vencida: "danger",
  anulada: "neutral",
};

const MEMBER_STATUS_TONES: Record<MemberStatus, BadgeTone> = {
  activo: "ok",
  suspendido: "warn",
  baja: "neutral",
};

// How a member stands with their fees: al día, en mora, moroso, exento.
export function FeeStatusBadge({ status }: { status: MemberFeeStatus }) {
  return (
    <Badge tone={FEE_STATUS_TONES[status]}>{FEE_STATUS_LABELS[status]}</Badge>
  );
}

// State of a single fee: pendiente, vencida, paga, anulada.
export function FeeStateBadge({ state }: { state: FeeState }) {
  return <Badge tone={FEE_STATE_TONES[state]}>{FEE_STATE_LABELS[state]}</Badge>;
}

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return (
    <Badge tone={MEMBER_STATUS_TONES[status]}>
      {MEMBER_STATUS_LABELS[status]}
    </Badge>
  );
}
