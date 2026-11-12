"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PermissionGate } from "./permission-gate";
import { ReceiptDocument } from "./receipt-document";
import { useReceipt } from "./use-receipt";

interface ReceiptViewProps {
  receiptId: string;
}

export function ReceiptView({ receiptId }: ReceiptViewProps) {
  const { receipt, member, registeredBy, print } = useReceipt(receiptId);
  if (!receipt) notFound();

  return (
    <PermissionGate permission="billing:read">
      <div className="sys-receipt-actions">
        <Link href="/sistema/comprobantes" className="sys-button">
          ← Comprobantes
        </Link>
        {member && (
          <Link href={`/sistema/socios/${member.id}`} className="sys-button">
            Ver ficha del socio
          </Link>
        )}
        <button
          type="button"
          className="sys-button sys-button--primary"
          onClick={print}
        >
          Imprimir
        </button>
      </div>
      <ReceiptDocument
        receipt={receipt}
        member={member}
        registeredBy={registeredBy}
      />
    </PermissionGate>
  );
}
