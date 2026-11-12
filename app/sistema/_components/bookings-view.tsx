"use client";

import Link from "next/link";
import { useState } from "react";
import { BOOKING_TABS } from "../_data/booking-labels";
import { bookingStats, type BookingTab } from "../_lib/bookings";
import { DEMO_TODAY } from "../_lib/clock";
import { formatMoney } from "../_lib/format";
import { can } from "../_lib/permissions";
import { BookingsCalendar } from "./bookings-calendar";
import { BookingsList } from "./bookings-list";
import { BookingsToday } from "./bookings-today";
import { PageHeader } from "./page-header";
import { PermissionGate } from "./permission-gate";
import { StatCard } from "./stat-card";
import { Tabs } from "./tabs";
import { useSystem } from "./use-system";

interface BookingsViewProps {
  // Without one, the gate opens today's lists and everyone else the calendar.
  initialTab?: BookingTab;
}

export function BookingsView({ initialTab }: BookingsViewProps) {
  const { state, user } = useSystem();
  const canWrite = can(user, "bookings:write");
  const [tab, setTab] = useState<BookingTab>(
    initialTab ?? (canWrite ? "calendario" : "hoy"),
  );
  const stats = bookingStats(state, DEMO_TODAY);

  return (
    <PermissionGate permission="bookings:read">
      <PageHeader
        eyebrow="Quinchos y salón"
        title="Reservas"
        description="Calendario de los quinchos y el salón de eventos, listas de invitados para portería y cobro de cada reserva."
        actions={
          canWrite && (
            <Link
              href="/sistema/reservas/nueva"
              className="sys-button sys-button--primary"
            >
              Nueva reserva
            </Link>
          )
        }
      />
      <div className="sys-stats">
        <StatCard label="Reservas este mes" value={String(stats.thisMonth)} />
        <StatCard
          label="Hoy"
          value={String(stats.today)}
          tone={stats.today > 0 ? "ok" : "default"}
        />
        <StatCard
          label="Por confirmar"
          value={String(stats.pending)}
          hint="Falta la planilla o el pago"
          tone={stats.pending > 0 ? "warn" : "default"}
        />
        <StatCard
          label="Por cobrar"
          value={formatMoney(stats.toCollect)}
          hint="Salón y quinchos exclusivos"
        />
      </div>
      <Tabs
        label="Vistas de reservas"
        items={BOOKING_TABS.map((item) =>
          item.key === "hoy" ? { ...item, count: stats.today } : item,
        )}
        active={tab}
        onChange={setTab}
      />
      {tab === "calendario" && <BookingsCalendar />}
      {tab === "lista" && <BookingsList />}
      {tab === "hoy" && <BookingsToday />}
    </PermissionGate>
  );
}
