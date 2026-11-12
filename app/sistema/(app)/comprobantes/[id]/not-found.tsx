import Link from "next/link";
import { PageHeader } from "../../../_components/page-header";

export default function ReceiptNotFound() {
  return (
    <>
      <PageHeader eyebrow="Comprobantes" title="No encontramos ese recibo" />
      <section className="sys-card sys-receipts__missing">
        <p>
          Puede que el número esté mal o que el recibo se haya emitido en otro
          navegador: cada uno guarda su propia copia de la demo.
        </p>
        <Link
          href="/sistema/comprobantes"
          className="sys-button sys-button--primary"
        >
          Ver todos los comprobantes
        </Link>
      </section>
    </>
  );
}
