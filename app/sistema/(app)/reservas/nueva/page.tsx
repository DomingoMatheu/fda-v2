import type { Metadata } from "next";
import { BookingForm } from "../../../_components/booking-form";
import { isBookingSlot } from "../../../_lib/bookings";

export const metadata: Metadata = { title: "Nueva reserva" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// The calendar opens it for a free slot: `?espacio=…&fecha=…&turno=…`.
export default async function Page({ searchParams }: PageProps) {
  const { espacio, fecha, turno } = await searchParams;
  return (
    <BookingForm
      initial={{
        venueId: typeof espacio === "string" ? espacio : undefined,
        date: typeof fecha === "string" && DATE.test(fecha) ? fecha : undefined,
        slot: isBookingSlot(turno) ? turno : undefined,
      }}
    />
  );
}
