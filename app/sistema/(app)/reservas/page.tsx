import type { Metadata } from "next";
import { ModulePlaceholder } from "../../_components/module-placeholder";

export const metadata: Metadata = { title: "Reservas" };

export default function Page() {
  return <ModulePlaceholder href="/sistema/reservas" />;
}
