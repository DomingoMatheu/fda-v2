import { DisciplineGrid } from "./discipline-grid";
import { DISCIPLINES } from "./disciplines";
import { Reveal } from "./reveal";

export function Disciplinas() {
  return (
    <section className="disciplinas" id="disciplinas">
      <div className="wrap">
        <div className="section-head">
          <Reveal>
            <div className="eyebrow">{DISCIPLINES.length} disciplinas</div>
            <h2 className="display h-lg">
              Tu próxima <em>disciplina favorita</em> te está esperando.
            </h2>
          </Reveal>
          <Reveal className="right" delay=".15s">
            Desde el arco y el patín hasta el wing chun y el ultimate frisbee —
            doce disciplinas con su cancha, su gente y sus horarios. Todas con
            el espíritu del club. Tocá cualquiera para escribirle directo por
            WhatsApp.
          </Reveal>
        </div>

        <DisciplineGrid />
      </div>
    </section>
  );
}
