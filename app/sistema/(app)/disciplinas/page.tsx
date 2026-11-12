import type { Metadata } from "next";
import { ModulePlaceholder } from "../../_components/module-placeholder";

export const metadata: Metadata = { title: "Disciplinas" };

export default function Page() {
  return <ModulePlaceholder href="/sistema/disciplinas" />;
}
