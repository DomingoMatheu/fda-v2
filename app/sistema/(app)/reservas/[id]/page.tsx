import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingDetail } from "../../../_components/booking-detail";

export const metadata: Metadata = { title: "Reserva" };

// Bookings live in the browser's store, so the server only rejects ids that
// can never be a booking; the view checks the store.
const BOOKING_ID = /^reserva-\d+$/;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!BOOKING_ID.test(id)) notFound();
  return <BookingDetail bookingId={id} />;
}
