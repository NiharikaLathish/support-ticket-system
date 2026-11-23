import { useCallback, useState } from "react";
import CategoryPie from "./components/CategoryPie";
import GlanceCard from "./components/GlanceCard";
import HeroCard from "./components/HeroCard";
import TicketForm from "./components/TicketForm";
import TicketList from "./components/TicketList";
import TopNav from "./components/TopNav";
import useStats from "./hooks/useStats";

export default function App() {
  // Bumped whenever tickets change; the list and stats refetch when it changes.
  const [dataVersion, setDataVersion] = useState(0);
  const refreshData = useCallback(() => setDataVersion((version) => version + 1), []);
  const { stats, error: statsError } = useStats(dataVersion);

  return (
    <div className="page">
      <TopNav />

      <main className="dashboard">
        <HeroCard stats={stats} error={statsError} />

        <div className="side-stack">
          {stats && (
            <>
              <GlanceCard stats={stats} />
              <CategoryPie counts={stats.category_breakdown} total={stats.total_tickets} />
            </>
          )}
        </div>

        <section id="new-ticket" className="card form-card">
          <p className="eyebrow">New ticket</p>
          <h2>What's going wrong?</h2>
          <TicketForm onCreated={refreshData} />
        </section>

        <section id="tickets" className="card tickets-card">
          <p className="eyebrow">Queue</p>
          <h2>Recent tickets</h2>
          <TicketList refreshKey={dataVersion} onTicketUpdated={refreshData} />
        </section>
      </main>
    </div>
  );
}
