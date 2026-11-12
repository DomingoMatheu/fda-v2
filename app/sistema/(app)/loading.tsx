// Placeholder while a screen loads: the shape of a page header, the stat
// cards and a table. It only fades in if loading takes a moment.
const STAT_PLACEHOLDERS = 4;
const ROW_PLACEHOLDERS = 6;

export default function SystemLoading() {
  return (
    <div className="sys-skeleton" aria-busy="true">
      <p className="sys-visually-hidden" role="status">
        Cargando…
      </p>
      <div className="sys-skeleton__header">
        <span className="sys-skeleton__line sys-skeleton__line--eyebrow" />
        <span className="sys-skeleton__line sys-skeleton__line--title" />
        <span className="sys-skeleton__line sys-skeleton__line--text" />
      </div>
      <div className="sys-stats">
        {Array.from({ length: STAT_PLACEHOLDERS }, (_, index) => (
          <span
            key={index}
            className="sys-skeleton__block sys-skeleton__stat"
          />
        ))}
      </div>
      <div className="sys-skeleton__table">
        {Array.from({ length: ROW_PLACEHOLDERS }, (_, index) => (
          <span key={index} className="sys-skeleton__line sys-skeleton__row" />
        ))}
      </div>
    </div>
  );
}
