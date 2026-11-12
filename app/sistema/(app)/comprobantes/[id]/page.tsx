import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReceiptView } from "../../../_components/receipt-view";

export const metadata: Metadata = { title: "Recibo" };

// Receipts live in the browser's in-memory store, so the server only rejects
// ids that can never be a receipt; the view checks the store.
const RECEIPT_ID = /^recibo-\d+$/;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!RECEIPT_ID.test(id)) notFound();
  return <ReceiptView receiptId={id} />;
}
