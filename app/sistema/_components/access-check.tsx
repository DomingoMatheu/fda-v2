"use client";

import Link from "next/link";
import { VISITOR_FEES } from "@/app/_components/fees";
import { CATEGORY_LABELS } from "../_data/labels";
import { formatDocument, fullName } from "../_lib/format";
import { MemberStatusBadge } from "./status-badge";
import {
  useAccessCheck,
  type AccessCheckState,
  type GateLookup,
} from "./use-access-check";

type GateActions = Omit<AccessCheckState, "inputRef" | "resultRef">;
import type { SeasonModalKind } from "./use-season-modals";

interface AccessCheckProps {
  onAction: (kind: SeasonModalKind, memberId: string) => void;
}

// Generic silhouette: the demo has no member photos.
function MemberPhoto() {
  return (
    <span className="sys-gate__photo" aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <circle cx="24" cy="18" r="9" />
        <path d="M8 44c1.5-9 8-14 16-14s14.5 5 16 14z" />
      </svg>
    </span>
  );
}

function MemberResult({
  gate,
  lookup,
  onAction,
}: {
  gate: GateActions;
  lookup: Extract<GateLookup, { kind: "member" }>;
  onAction: AccessCheckProps["onAction"];
}) {
  const { member, check, issues } = lookup;
  const allowed = check.allowed;
  return (
    <article className={`sys-gate__result ${allowed ? "is-ok" : "is-denied"}`}>
      <p className="sys-gate__verdict">
        {allowed ? "Habilitado" : "No habilitado"}
      </p>
      <div className="sys-gate__person">
        <MemberPhoto />
        <div className="sys-gate__who">
          <Link
            href={`/sistema/socios/${member.id}`}
            className="sys-gate__name"
          >
            {fullName(member)}
          </Link>
          <p className="sys-gate__meta">
            Socio n.º {member.memberNumber} · DNI{" "}
            {formatDocument(member.documentNumber)}
          </p>
          <p className="sys-gate__meta">
            {CATEGORY_LABELS[member.category]} ·{" "}
            <MemberStatusBadge status={member.status} />
          </p>
        </div>
      </div>
      {allowed ? (
        <p className="sys-gate__ok-text">
          Socio activo, al día, con apto médico vigente y carnet de temporada
          pago.
        </p>
      ) : (
        <ul className="sys-gate__reasons">
          {check.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}
      <div className="sys-gate__actions">
        {gate.canRegister && (
          <button
            type="button"
            className={`sys-button sys-gate__main-action ${allowed ? "sys-button--primary" : ""}`}
            onClick={gate.registerEntry}
          >
            {allowed ? "Registrar ingreso" : "Registrar rechazo"}
          </button>
        )}
        {issues.owesFees && gate.canCharge && (
          <button
            type="button"
            className="sys-button sys-button--accent"
            onClick={() => onAction("cobro", member.id)}
          >
            Registrar cobro
          </button>
        )}
        {issues.needsClearance && gate.canManageSeason && (
          <button
            type="button"
            className="sys-button"
            onClick={() => onAction("apto", member.id)}
          >
            Cargar apto médico
          </button>
        )}
        {issues.needsPass &&
          member.status === "activo" &&
          gate.canManageSeason && (
            <button
              type="button"
              className="sys-button"
              onClick={() => onAction("carnet", member.id)}
            >
              Emitir carnet
            </button>
          )}
      </div>
      {issues.owesFees && !gate.canCharge && (
        <p className="sys-gate__hint">
          Para regularizar el pago tiene que pasar por Secretaría.
        </p>
      )}
    </article>
  );
}

function UnknownResult({
  gate,
  lookup,
}: {
  gate: GateActions;
  lookup: Extract<GateLookup, { kind: "unknown" }>;
}) {
  if (!lookup.isDocument) {
    return (
      <article className="sys-gate__result is-unknown">
        <p className="sys-gate__verdict">Sin resultados</p>
        <p>
          No hay ningún socio con el número {lookup.digits}. Revisá el número o
          buscá por DNI.
        </p>
      </article>
    );
  }
  return (
    <article className="sys-gate__result is-unknown">
      <p className="sys-gate__verdict">No figura como socio</p>
      <p>
        No encontramos a nadie con el DNI{" "}
        <strong>{formatDocument(lookup.digits)}</strong>.{" "}
        {gate.canAddMember
          ? "Podés darlo de alta o dejarlo pasar como visitante."
          : "Puede pasar como visitante; el alta de socio se hace en Secretaría."}
      </p>
      {gate.canRegister && (
        <fieldset className="sys-gate__visitor">
          <legend className="sys-field__label">Entrada de visitante</legend>
          <div className="sys-gate__chips">
            {VISITOR_FEES.map((fee) => (
              <button
                key={fee.label}
                type="button"
                className="sys-chip"
                aria-pressed={fee.label === gate.visitorFee.label}
                onClick={() => gate.setVisitorFee(fee.label)}
              >
                {fee.label} · {fee.amount}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="sys-gate__actions">
        {gate.canRegister && (
          <button
            type="button"
            className="sys-button sys-button--primary sys-gate__main-action"
            onClick={gate.registerVisitor}
          >
            Registrar visitante ({gate.visitorFee.amount})
          </button>
        )}
        {gate.canAddMember && (
          <Link
            href={`/sistema/socios/nuevo?dni=${lookup.digits}`}
            className="sys-button"
          >
            Dar de alta como socio
          </Link>
        )}
      </div>
    </article>
  );
}

export function AccessCheck({ onAction }: AccessCheckProps) {
  const { inputRef, resultRef, ...gate } = useAccessCheck();
  const { lookup } = gate;

  return (
    <section className="sys-gate" aria-label="Control de ingreso">
      <form
        className="sys-gate__form"
        onSubmit={(event) => {
          event.preventDefault();
          gate.search();
        }}
      >
        <label htmlFor="sys-gate-input" className="sys-gate__label">
          DNI o número de socio
        </label>
        <div className="sys-gate__row">
          <input
            ref={inputRef}
            id="sys-gate-input"
            className="sys-gate__input"
            inputMode="numeric"
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Ej.: 30123456"
            value={gate.query}
            onChange={(event) => gate.setQuery(event.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="sys-button sys-button--primary sys-gate__submit"
          >
            Buscar
          </button>
        </div>
        {lookup.kind !== "idle" && (
          <button
            type="button"
            className="sys-gate__clear"
            onClick={gate.clear}
          >
            Limpiar y buscar otro
          </button>
        )}
      </form>

      <div ref={resultRef} aria-live="polite">
        {lookup.kind === "member" && (
          <MemberResult
            // A new key replays the reveal for every person and verdict.
            key={`${lookup.member.id}-${lookup.check.allowed}`}
            gate={gate}
            lookup={lookup}
            onAction={onAction}
          />
        )}
        {lookup.kind === "unknown" && (
          <UnknownResult key={lookup.digits} gate={gate} lookup={lookup} />
        )}
        {lookup.kind === "idle" && (
          <p className="sys-gate__idle">
            Tipeá el DNI o el número de socio y tocá Buscar. Te decimos al
            instante si puede pasar y, si no, por qué.
          </p>
        )}
      </div>
    </section>
  );
}
