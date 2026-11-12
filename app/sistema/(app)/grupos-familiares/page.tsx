import type { Metadata } from "next";
import { FamilyGroupsView } from "../../_components/family-groups-view";

export const metadata: Metadata = { title: "Grupos familiares" };

export default function Page() {
  return <FamilyGroupsView />;
}
