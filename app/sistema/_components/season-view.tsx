"use client";

import { useState } from "react";
import { SEASON_TABS } from "../_data/season-labels";
import { DEMO_TODAY } from "../_lib/clock";
import { formatDate } from "../_lib/format";
import { currentSeason } from "../_lib/pool-access";
import { logsOn, type SeasonTab } from "../_lib/season";
import { AccessCheck } from "./access-check";
import { AccessLogView } from "./access-log";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { PoolPasses } from "./pool-passes";
import { SeasonModals } from "./season-modals";
import { Tabs } from "./tabs";
import { useSeasonModals } from "./use-season-modals";
import { useSystem } from "./use-system";

interface SeasonViewProps {
  initialTab: SeasonTab;
}

export function SeasonView({ initialTab }: SeasonViewProps) {
  const { state } = useSystem();
  const [tab, setTab] = useState<SeasonTab>(initialTab);
  const { modal, openModal, closeModal } = useSeasonModals();
  const season = currentSeason(state.seasons);
  const todayCount = logsOn(state.accessLogs, DEMO_TODAY).length;

  return (
    <PermissionGate permission="season:read">
      <PageHeader
        eyebrow={season?.name ?? "Pileta"}
        title="Temporada de pileta"
        description={
          season
            ? `Abre el ${formatDate(season.startsAt)}. Control de ingreso por DNI, carnets, aptos médicos e ingresos del día.`
            : "Control de ingreso por DNI, carnets, aptos médicos e ingresos del día."
        }
      />
      <Tabs
        label="Secciones de la temporada"
        items={SEASON_TABS.map((item) =>
          item.key === "hoy" ? { ...item, count: todayCount } : item,
        )}
        active={tab}
        onChange={setTab}
      />
      {tab === "ingreso" && <AccessCheck onAction={openModal} />}
      {tab === "carnets" && <PoolPasses onAction={openModal} />}
      {tab === "hoy" && <AccessLogView />}
      <SeasonModals modal={modal} onClose={closeModal} />
    </PermissionGate>
  );
}
