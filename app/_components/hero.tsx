import Image from "next/image";
import { Fragment } from "react";
import { Counter } from "./counter";
import { DISCIPLINES } from "./disciplines";
import { ParallaxStrip } from "./parallax-strip";

// The track is rendered twice so the marquee can loop seamlessly.
const MARQUEE_PASSES = [0, 1];

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-orb orb-1" />
        <div className="hero-orb orb-2" />
        <div className="hero-orb orb-3" />
      </div>

      <div className="wrap hero-body">
        <div className="hero-grid">
          <Image
            src="/escudo-limpio.svg"
            alt="Escudo del club"
            width={320}
            height={347}
            priority
            unoptimized
            className="hero-logo"
          />

          <div className="hero-side">
            <h1 className="hero-title">
              CLUB S&amp;D F.A. <span>DOMINGO MATHEU</span>
            </h1>
            <p className="hero-lede">
              Somos un club de familia, abierto, con muchas hectáreas de{" "}
              <em>árboles y deporte</em>. Doce disciplinas, pileta, dos quinchos
              y un salón de eventos — todo a la vuelta de tu casa.
            </p>
            <div className="hero-meta">
              <div className="stat">
                <Counter target={DISCIPLINES.length} />
                <div className="l">Disciplinas</div>
              </div>
              <div className="stat">
                <Counter target={9.5} decimals={1} />
                <div className="l">Hectáreas verdes</div>
              </div>
              <div className="stat">
                <div className="n">+80</div>
                <div className="l">Años de historia</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap hero-strip-wrap">
        <ParallaxStrip />
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {MARQUEE_PASSES.map((pass) =>
            DISCIPLINES.map((d) => (
              <Fragment key={`${pass}-${d.name}`}>
                <span>{d.name}</span>
                <span className="dot" />
              </Fragment>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
