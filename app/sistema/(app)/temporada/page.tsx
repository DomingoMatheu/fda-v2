import type { Metadata } from "next";
import { isSeasonTab } from "../../_lib/season";
import { SeasonView } from "../../_components/season-view";

export const metadata: Metadata = { title: "Temporada" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// `?tab=carnets` or `?tab=hoy` opens that tab, e.g. from the home page.
export default async function Page({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  return <SeasonView initialTab={isSeasonTab(tab) ? tab : "ingreso"} />;
}
