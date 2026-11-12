import type { Metadata } from "next";
import { ModulePlaceholder } from "../../_components/module-placeholder";

export const metadata: Metadata = { title: "Grupos familiares" };

export default function Page() {
  return <ModulePlaceholder href="/sistema/grupos-familiares" />;
}
