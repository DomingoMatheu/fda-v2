import type { Metadata } from "next";
import { CollectionsView } from "../../_components/collections-view";

export const metadata: Metadata = { title: "Cobranza" };

export default function Page() {
  return <CollectionsView />;
}
