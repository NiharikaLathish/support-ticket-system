import { useEffect, useState } from "react";
import { fetchStats } from "../api";
import { CATEGORIES, PRIORITIES } from "../constants";

export default function StatsDashboard({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetchStats(controller.signal)
      .then((data) => {
        setStats(data);
        setError("");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Could not load stats.");
        }
      });

    return () => controller.abort();
  }, [refreshKey]);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="hint">Loading stats...</p>;

  return (
    <div className="stats">
      <div className="stat-cards">
        <StatCard label="Total tickets" value={stats.total_tickets} />
        <StatCard label="Open tickets" value={stats.open_tickets} />
        <StatCard label="Avg per day" value={stats.avg_tickets_per_day} />
      </div>
      <Breakdown
        title="By priority"
        options={PRIORITIES}
        counts={stats.priority_breakdown}
        total={stats.total_tickets}
        colorPrefix="priority"
      />
      <Breakdown
        title="By category"
        options={CATEGORIES}
        counts={stats.category_breakdown}
        total={stats.total_tickets}
        colorPrefix="category"
      />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function Breakdown({ title, options, counts, total, colorPrefix }) {
  return (
    <div className="breakdown">
      <h3>{title}</h3>
      {options.map((option) => {
        const count = counts[option.value] ?? 0;
        const percent = total ? (count / total) * 100 : 0;
        return (
          <div className="breakdown-row" key={option.value}>
            <span className="breakdown-label">{option.label}</span>
            <div className="bar-track">
              <div
                className={`bar ${colorPrefix}-${option.value}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="breakdown-count">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
