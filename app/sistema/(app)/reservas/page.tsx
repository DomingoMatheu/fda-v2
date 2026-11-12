import type { Metadata } from "next";
import { BookingsView } from "../../_components/bookings-view";
import { isBookingTab } from "../../_lib/bookings";

export const metadata: Metadata = { title: "Reservas" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// `?tab=hoy`, `?tab=lista` or `?tab=calendario` opens that view.
export default async function Page({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  return <BookingsView initialTab={isBookingTab(tab) ? tab : undefined} />;
}
