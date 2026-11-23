// Donut chart drawn with a CSS conic-gradient, so no chart library is needed.
export default function BreakdownChart({ title, options, counts, colors }) {
  const total = options.reduce((sum, option) => sum + (counts[option.value] ?? 0), 0);

  let start = 0;
  const stops = options.map((option) => {
    const share = total ? ((counts[option.value] ?? 0) / total) * 100 : 0;
    const stop = `${colors[option.value]} ${start}% ${start + share}%`;
    start += share;
    return stop;
  });
  const background = total ? `conic-gradient(${stops.join(", ")})` : undefined;

  return (
    <section className="card chart-card">
      <h2>{title}</h2>
      <div className="chart-body">
        <div className="donut" style={{ background }} role="img" aria-label={title}>
          <div className="donut-hole">
            <span className="donut-total">{total}</span>
            <span className="donut-caption">tickets</span>
          </div>
        </div>
        <ul className="legend">
          {options.map((option) => {
            const count = counts[option.value] ?? 0;
            return (
              <li key={option.value}>
                <span className="legend-dot" style={{ background: colors[option.value] }} />
                <span className="legend-label">{option.label}</span>
                <span className="legend-count">{count}</span>
                <span className="legend-percent">
                  {total ? Math.round((count / total) * 100) : 0}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
