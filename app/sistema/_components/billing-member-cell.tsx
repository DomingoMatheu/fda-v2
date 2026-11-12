"use client";

import Link from "next/link";
import { listName } from "../_lib/format";
import type { Member } from "../_types";

interface BillingMemberCellProps {
  member?: Member;
  // What the row charges, shown only on phones, where that column is hidden.
  detail?: string;
}

// Member name linked to their page, with the member number below.
export function BillingMemberCell({ member, detail }: BillingMemberCellProps) {
  if (!member) return <span className="sys-billing-member">—</span>;
  return (
    <span className="sys-billing-member">
      <Link
        href={`/sistema/socios/${member.id}`}
        className="sys-billing-member__name"
        onClick={(event) => event.stopPropagation()}
      >
        {listName(member)}
      </Link>
      <span className="sys-billing-member__number">
        N.º {member.memberNumber}
      </span>
      {detail && <span className="sys-billing-member__detail">{detail}</span>}
    </span>
  );
}
