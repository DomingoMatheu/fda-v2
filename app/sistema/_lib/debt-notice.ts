import {
  CLUB_BILLING_EMAIL,
  CLUB_NAME,
  CLUB_OFFICE_HOURS,
  CLUB_PHONE,
} from "@/app/_components/club-info";
import type { DebtNotice, Member, MemberBalance } from "../_types";
import { memberBalance, oldestOverduePeriod } from "./billing";
import { daysBetween } from "./clock";
import { formatMoney } from "./format";
import { periodLabel } from "./period";
import type { SystemState } from "./state";

// Members warned this recently are left out of a bulk notice by default, so
// nobody gets the same email twice in a row.
export const NOTICE_COOLDOWN_DAYS = 7;

export interface DebtEmail {
  subject: string;
  body: string;
}

export function lastNotice(
  notices: DebtNotice[],
  memberId: string,
): DebtNotice | undefined {
  return notices
    .filter((notice) => notice.memberId === memberId)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0];
}

export function noticedRecently(
  notice: DebtNotice | undefined,
  on: string,
): boolean {
  return (
    notice !== undefined &&
    daysBetween(notice.sentAt, on) < NOTICE_COOLDOWN_DAYS
  );
}

// The email a debtor receives: what they owe, since when, and how to pay.
export function debtEmail(
  account: Member,
  balance: MemberBalance,
  lateFeeRate: number,
): DebtEmail {
  const since = oldestOverduePeriod(balance);
  const byPeriod = new Map<string, number>();
  for (const { period, amount } of balance.overdue) {
    byPeriod.set(period, (byPeriod.get(period) ?? 0) + amount);
  }
  const items = [...byPeriod.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([period, amount]) => `• ${periodLabel(period)}: ${formatMoney(amount)}`,
    );
  const officeHours = CLUB_OFFICE_HOURS.filter(
    ({ schedule }) => schedule !== "Cerrado",
  )
    .map(({ label, schedule }) => `${label} ${schedule}`)
    .join(", ");

  return {
    subject: `${CLUB_NAME}: tenés cuotas vencidas por ${formatMoney(balance.overdueTotal)}`,
    body: [
      `Hola, ${account.firstName}:`,
      "",
      `Te escribimos de Tesorería del ${CLUB_NAME}. Según nuestros registros, tu cuenta de socio n.º ${account.memberNumber} tiene ${byPeriod.size === 1 ? "1 mes" : `${byPeriod.size} meses`} de cuotas vencidas${since ? ` desde ${periodLabel(since)}` : ""}, por un total de ${formatMoney(balance.overdueTotal)}:`,
      "",
      ...items,
      "",
      `Al pagar se suma un recargo por mora del ${Math.round(lateFeeRate * 100)} %. Mientras tengas cuotas vencidas no vas a poder ingresar a la pileta.`,
      "",
      "Podés pagar:",
      `• En Secretaría (${officeHours}), en efectivo, con débito, crédito o QR.`,
      `• Por transferencia, mandando el comprobante a ${CLUB_BILLING_EMAIL}.`,
      "",
      `Si ya pagaste, desestimá este correo. Ante cualquier duda escribinos a ${CLUB_BILLING_EMAIL} o llamanos al ${CLUB_PHONE}.`,
      "",
      "Muchas gracias,",
      `Tesorería · ${CLUB_NAME}`,
    ].join("\n"),
  };
}

// An email notice needs an address and something overdue to tell about.
export function canEmailNotice(
  member: Member,
  state: SystemState,
  on: string,
): boolean {
  return (
    member.email !== undefined &&
    memberBalance(member, state, on).overdue.length > 0
  );
}
