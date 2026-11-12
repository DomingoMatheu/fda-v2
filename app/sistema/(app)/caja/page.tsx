import type { Metadata } from "next";
import { CashView } from "../../_components/cash-view";

export const metadata: Metadata = { title: "Caja del día" };

export default function Page() {
  return <CashView />;
}
