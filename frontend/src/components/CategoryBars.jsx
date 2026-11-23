import { CATEGORIES, CATEGORY_COLORS } from "../constants";

export default function CategoryBars({ counts, total }) {
  const largest = Math.max(1, ...CATEGORIES.map((option) => counts[option.value] ?? 0));

  return (
    <section className="card bars-card">
      <div className="bars-head">
        <h2>By category</h2>
        <span className="hint">{total} tickets</span>
      </div>

      <div className="bars">
        {CATEGORIES.map((option) => {
          const count = counts[option.value] ?? 0;
          const color = CATEGORY_COLORS[option.value];
          return (
            <div className="bar-col" key={option.value}>
              <span className="bar-count">{count}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    height: `${(count / largest) * 100}%`,
                    background: `linear-gradient(180deg, ${color}, ${color}66)`,
                  }}
                />
              </div>
              <span className="bar-label">{option.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
