import type { Metadata } from "next";
import { DisciplinesView } from "../../_components/disciplines-view";

export const metadata: Metadata = { title: "Disciplinas" };

export default function Page() {
  return <DisciplinesView />;
}
