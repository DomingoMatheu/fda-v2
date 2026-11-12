import type { Metadata } from "next";
import { MemberDetail } from "../../../_components/member-detail";

export const metadata: Metadata = { title: "Ficha de socio" };

export default async function Page({
  params,
}: PageProps<"/sistema/socios/[id]">) {
  const { id } = await params;
  return <MemberDetail memberId={id} />;
}
