import type { Metadata } from "next";
import { ReceiptsView } from "../../_components/receipts-view";

export const metadata: Metadata = { title: "Comprobantes" };

export default function Page() {
  return <ReceiptsView />;
}
