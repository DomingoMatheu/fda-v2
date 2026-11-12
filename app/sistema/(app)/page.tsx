import type { Metadata } from "next";
import { DashboardView } from "../_components/dashboard-view";

export const metadata: Metadata = { title: "Inicio" };

export default function Page() {
  return <DashboardView />;
}
