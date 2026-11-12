import Link from "next/link";
import { PageHeader } from "./page-header";

export function BookingMissing() {
  return (
    <>
      <PageHeader eyebrow="Reservas" title="No encontramos esa reserva" />
      <section className="sys-card sys-booking__missing">
        <p>
          Puede que el número esté mal o que la reserva se haya cargado en otro
          navegador: cada uno guarda su propia copia de la demo.
        </p>
        <Link
          href="/sistema/reservas"
          className="sys-button sys-button--primary"
        >
          Ver todas las reservas
        </Link>
      </section>
    </>
  );
}
