export default function GlanceCard({ stats }) {
  return (
    <section className="card glance">
      <h2>At a glance</h2>

      <div className="glance-flow">
        <div className="glance-tile">
          <span className="glance-label">Total tickets</span>
          <span className="glance-value">{stats.total_tickets}</span>
        </div>

        <svg className="glance-arrow" viewBox="0 0 120 70" aria-hidden="true">
          <defs>
            <linearGradient id="glance-flow-gradient" x1="0" x2="1">
              <stop offset="0%" stopColor="#2ea3f2" />
              <stop offset="100%" stopColor="#f4854b" />
            </linearGradient>
          </defs>
          <path d="M4 14 C 54 14, 58 56, 108 56" />
          <path d="M100 49 L110 56 L100 63" />
        </svg>

        <div className="glance-tile accent">
          <span className="glance-label">Open now</span>
          <span className="glance-value">{stats.open_tickets}</span>
        </div>
      </div>

      <div className="glance-foot">
        <span>Average per day</span>
        <strong>{stats.avg_tickets_per_day}</strong>
      </div>
    </section>
  );
}
