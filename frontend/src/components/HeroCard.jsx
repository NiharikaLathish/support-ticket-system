import { PRIORITIES } from "../constants";

// Positions on the arc, in degrees counter-clockwise from 3 o'clock.
const TILE_ANGLES = [196, 156, 119, 84];
const GHOST_ANGLES = [234, 48];

function headline({ total_tickets: total, open_tickets: open, priority_breakdown }) {
  const critical = priority_breakdown.critical;
  if (total === 0) {
    return { title: "A fresh start", subtitle: "No tickets yet. Submit the first one below." };
  }
  if (open === 0) {
    return { title: "Inbox zero", subtitle: "Every ticket has been picked up. Nice work." };
  }
  if (critical > 0) {
    return {
      title: `${critical} critical ${critical === 1 ? "ticket needs" : "tickets need"} you`,
      subtitle: `${open} open in total. Start with the critical ones.`,
    };
  }
  return {
    title: "Momentum is on your side",
    subtitle: `${open} open ${open === 1 ? "ticket" : "tickets"} and nothing critical. Keep it up!`,
  };
}

export default function HeroCard({ stats, error }) {
  return (
    <section className="card hero">
      <p className="eyebrow">Overview</p>
      {error && <p className="error">{error}</p>}
      {!stats && !error && <p className="hint">Loading stats...</p>}
      {stats && <HeroContent stats={stats} />}
    </section>
  );
}

function HeroContent({ stats }) {
  const { title, subtitle } = headline(stats);
  const total = stats.total_tickets;
  const pickedUp = total ? Math.round(((total - stats.open_tickets) / total) * 100) : 0;
  const summary = PRIORITIES.map(
    (option) => `${option.label} ${stats.priority_breakdown[option.value]}`,
  ).join(", ");

  return (
    <>
      <h1 className="hero-title">{title}</h1>
      <p className="hero-subtitle">{subtitle}</p>

      <div className="arc" role="img" aria-label={`Tickets by priority: ${summary}`}>
        {GHOST_ANGLES.map((angle) => (
          <span key={angle} className="arc-tile ghost" style={{ "--angle": `${angle}deg` }} />
        ))}
        {PRIORITIES.map((option, index) => (
          <div key={option.value} style={{ "--angle": `${TILE_ANGLES[index]}deg` }}>
            <span className={`arc-tile priority-${option.value}`}>
              {stats.priority_breakdown[option.value]}
            </span>
            <span className="arc-label">{option.label}</span>
          </div>
        ))}
        <div className="arc-center">
          <span className="arc-percent">{pickedUp}%</span>
          <span className="arc-caption">Tickets picked up</span>
        </div>
      </div>
    </>
  );
}
