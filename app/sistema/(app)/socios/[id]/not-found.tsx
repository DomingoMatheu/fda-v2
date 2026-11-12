import Link from "next/link";

export default function MemberNotFound() {
  return (
    <div className="sys-card sys-locked">
      <h2>No encontramos ese socio</h2>
      <p>
        Puede que el link esté mal, o que el alta se haya hecho en otro
        navegador: cada uno guarda su propia copia de la demo. Buscalo en el
        listado.
      </p>
      <Link href="/sistema/socios" className="sys-button sys-button--primary">
        Ir a socios
      </Link>
    </div>
  );
}
