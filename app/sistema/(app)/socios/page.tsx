import type { Metadata } from "next";
import { MembersView } from "../../_components/members-view";

export const metadata: Metadata = { title: "Socios" };

export default function Page() {
  return <MembersView />;
}
