function percentOf(part, total) {
  return total ? `${Math.round((part / total) * 100)}% of total` : "No tickets yet";
}

export default function OverviewCards({ stats, error }) {
  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="hint">Loading stats...</p>;

  const total = stats.total_tickets;
  const cards = [
    { label: "Total tickets", value: total, note: "All time" },
    { label: "Open tickets", value: stats.open_tickets, note: percentOf(stats.open_tickets, total) },
    { label: "Avg per day", value: stats.avg_tickets_per_day, note: "Since first ticket" },
    {
      label: "Critical",
      value: stats.priority_breakdown.critical,
      note: percentOf(stats.priority_breakdown.critical, total),
    },
  ];

  return (
    <div className="overview-cards">
      {cards.map((card) => (
        <div className="overview-card" key={card.label}>
          <span className="overview-value">{card.value}</span>
          <span className="overview-label">{card.label}</span>
          <span className="overview-note">{card.note}</span>
        </div>
      ))}
    </div>
  );
}
