import { formatMoney } from "../_lib/format";

interface BillingAmountProps {
  amount: number;
  overdue?: boolean;
}

// An amount in a billing table: never split across lines, red when overdue.
export function BillingAmount({ amount, overdue = false }: BillingAmountProps) {
  return (
    <span className={`sys-billing-amount${overdue ? " is-overdue" : ""}`}>
      {formatMoney(amount)}
    </span>
  );
}
