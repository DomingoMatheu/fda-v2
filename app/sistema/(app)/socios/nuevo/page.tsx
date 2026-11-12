import type { Metadata } from "next";
import { NewMemberForm } from "../../../_components/new-member-form";

export const metadata: Metadata = { title: "Nuevo socio" };

export default function Page() {
  return <NewMemberForm />;
}
