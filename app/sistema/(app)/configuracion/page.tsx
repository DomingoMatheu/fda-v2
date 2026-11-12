import type { Metadata } from "next";
import { ModulePlaceholder } from "../../_components/module-placeholder";

export const metadata: Metadata = { title: "Configuración" };

export default function Page() {
  return <ModulePlaceholder href="/sistema/configuracion" />;
}
