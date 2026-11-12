import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { CLUB_NAME_MAIN, CLUB_NAME_PREFIX } from "@/app/_components/club-info";
import { LoginForm } from "../../_components/login-form";
import { getSession } from "../../_lib/session";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage() {
  if (await getSession()) redirect("/sistema");
  return (
    <div className="sys-login">
      <section className="sys-login__brand">
        <Image
          src="/escudo-limpio.svg"
          alt="Escudo del club"
          width={88}
          height={88}
          priority
        />
        <p className="sys-login__club">
          <span>{CLUB_NAME_PREFIX}</span>
          {CLUB_NAME_MAIN}
        </p>
        <p className="sys-login__tagline">
          Socios, cobranza, pileta y personal, todo en un mismo lugar.
        </p>
      </section>
      <section className="sys-login__panel">
        <LoginForm />
        <p className="sys-login__note">
          Demo con datos de prueba. Lo que cargues queda guardado en este
          navegador; para empezar de cero usá “Reiniciar demo”.
        </p>
      </section>
    </div>
  );
}
