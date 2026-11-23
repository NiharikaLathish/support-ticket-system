import { CATEGORIES, CATEGORY_COLORS } from "../constants";

// Pie chart drawn with a CSS conic-gradient, so no chart library is needed.
export default function CategoryPie({ counts, total }) {
  let start = 0;
  const slices = CATEGORIES.map((option) => {
    const share = total ? ((counts[option.value] ?? 0) / total) * 100 : 0;
    const slice = `${CATEGORY_COLORS[option.value]} ${start}% ${start + share}%`;
    start += share;
    return slice;
  });
  const summary = CATEGORIES.map(
    (option) => `${option.label} ${counts[option.value] ?? 0}`,
  ).join(", ");

  return (
    <section className="card pie-card">
      <h2>By category</h2>

      <div className="pie-body">
        <div
          className="pie"
          style={{ background: total ? `conic-gradient(${slices.join(", ")})` : undefined }}
          role="img"
          aria-label={`Tickets by category: ${summary}`}
        >
          <div className="pie-hole">
            <span className="pie-total">{total}</span>
            <span className="pie-caption">tickets</span>
          </div>
        </div>

        <ul className="legend">
          {CATEGORIES.map((option) => {
            const count = counts[option.value] ?? 0;
            return (
              <li key={option.value}>
                <span
                  className="legend-dot"
                  style={{ background: CATEGORY_COLORS[option.value] }}
                />
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
