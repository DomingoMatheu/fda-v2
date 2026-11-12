"use client";

import { CashClosingModal } from "./cash-closing-modal";
import { CashDayPanel } from "./cash-day-panel";
import { CashHistory } from "./cash-history";
import { CashIncomeModal } from "./cash-income-modal";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { Tabs } from "./tabs";
import { useCashDay, type CashTab } from "./use-cash-day";

const TABS: { key: CashTab; label: string }[] = [
  { key: "dia", label: "Día" },
  { key: "historial", label: "Historial de cierres" },
];

export function CashView() {
  const cash = useCashDay();

  return (
    <PermissionGate permission="billing:read">
      <div className="sys-cash">
        <PageHeader
          eyebrow="Tesorería"
          title="Caja del día"
          description="Lo que entró en el día por cada medio de pago, los movimientos y el cierre con el conteo del efectivo."
          actions={
            cash.canWrite && (
              <button
                type="button"
                className="sys-button sys-button--accent"
                onClick={() => cash.openModal("income")}
              >
                Registrar otro ingreso
              </button>
            )
          }
        />

        <div className="sys-cash__tabs">
          <Tabs
            items={TABS}
            active={cash.tab}
            onChange={cash.setTab}
            label="Vista de la caja"
          />
        </div>

        {cash.tab === "dia" ? (
          <CashDayPanel cash={cash} />
        ) : (
          <CashHistory onShowDay={cash.showDay} />
        )}

        {cash.modal === "income" && (
          <CashIncomeModal
            onClose={cash.closeModal}
            onRegistered={cash.onIncomeRegistered}
          />
        )}
        {cash.modal === "closing" && (
          <CashClosingModal
            day={cash.day}
            expected={cash.amounts}
            methods={cash.methods}
            total={cash.total}
            previous={cash.closing}
            onClose={cash.closeModal}
          />
        )}
      </div>
    </PermissionGate>
  );
}
