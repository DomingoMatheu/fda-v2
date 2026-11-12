import { redirect } from "next/navigation";
import { SystemProvider } from "../_components/system-provider";
import { SystemShell } from "../_components/system-shell";
import { getSession } from "../_lib/session";

export default async function SystemAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/sistema/login");
  return (
    <SystemProvider user={session.user}>
      <SystemShell>{children}</SystemShell>
    </SystemProvider>
  );
}
