// The pool season ("temporada de pileta") runs through the summer; members
// buy a season pass and need a valid medical clearance to get in.

export type SeasonStatus = "inscripcion" | "en-curso" | "cerrada";

export interface Season {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: SeasonStatus;
  memberPassPrice: number;
  guestDayPrice: number;
}

export interface PoolPass {
  id: string;
  seasonId: string;
  memberId: string;
  requestedAt: string;
  feeId: string;
  revokedAt?: string;
  revokeReason?: string;
}

export type AccessGate = "porteria" | "pileta";

export type AccessResult = "permitido" | "denegado";

export interface AccessLog {
  id: string;
  at: string;
  gate: AccessGate;
  memberId?: string;
  documentNumber: string;
  result: AccessResult;
  reason?: string;
}

// Outcome of checking a person at the gate.
export interface AccessCheck {
  allowed: boolean;
  reasons: string[];
}
