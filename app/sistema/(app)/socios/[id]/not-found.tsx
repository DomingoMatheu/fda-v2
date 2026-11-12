import Link from "next/link";

export default function MemberNotFound() {
  return (
    <div className="sys-card sys-locked">
      <h2>No encontramos ese socio</h2>
      <p>
        Puede que el link esté mal, o que sea un alta hecha antes de recargar la
        página: la demo no guarda los cambios. Buscalo en el listado.
      </p>
      <Link href="/sistema/socios" className="sys-button sys-button--primary">
        Ir a socios
      </Link>
    </div>
  );
}
