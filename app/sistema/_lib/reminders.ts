import { CLUB_SHORT_NAME } from "@/app/_components/club-info";
import { whatsappUrl } from "@/app/_components/whatsapp";
import type { Member, MemberBalance } from "../_types";
import { oldestOverduePeriod } from "./billing";
import { formatMoney } from "./format";
import { periodLabel } from "./period";

// WhatsApp link with a ready-made reminder for a member who owes fees, or
// undefined when the account holder has no phone on file.
export function reminderUrl(
  account: Member,
  balance: MemberBalance,
): string | undefined {
  if (!account.phone || balance.overdue.length === 0) return undefined;
  const since = oldestOverduePeriod(balance);
  const message =
    `Hola ${account.firstName}, te escribimos del ${CLUB_SHORT_NAME}. ` +
    `Te recordamos que tenés ${formatMoney(balance.overdueTotal)} en cuotas vencidas` +
    `${since ? ` desde ${periodLabel(since)}` : ""}. ` +
    "Podés pagar en Secretaría, por transferencia o con QR. ¡Gracias!";
  return whatsappUrl(account.phone, message);
}
