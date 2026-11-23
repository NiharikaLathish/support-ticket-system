import { useCallback, useState } from "react";
import BreakdownChart from "./components/BreakdownChart";
import OverviewCards from "./components/OverviewCards";
import Sidebar from "./components/Sidebar";
import TicketForm from "./components/TicketForm";
import TicketList from "./components/TicketList";
import TopBar from "./components/TopBar";
import { CATEGORIES, CATEGORY_COLORS, PRIORITIES, PRIORITY_COLORS } from "./constants";
import useStats from "./hooks/useStats";

export default function App() {
  // Bumped whenever tickets change; the list and stats refetch when it changes.
  const [dataVersion, setDataVersion] = useState(0);
  const refreshData = useCallback(() => setDataVersion((version) => version + 1), []);
  const { stats, error: statsError } = useStats(dataVersion);

  return (
    <div className="shell">
      <Sidebar />

      <main className="main">
        <TopBar />

        <section id="overview" className="overview">
          <div className="section-head">
            <h2>Quick overview</h2>
            <p>Live numbers from the support queue</p>
          </div>
          <OverviewCards stats={stats} error={statsError} />
        </section>

        <div className="dashboard-grid">
          <section id="new-ticket" className="card">
            <div className="section-head">
              <h2>Submit a ticket</h2>
              <p>AI suggests a category and priority as you type</p>
            </div>
            <TicketForm onCreated={refreshData} />
          </section>

          <div className="chart-column">
            {stats && (
              <>
                <BreakdownChart
                  title="Tickets by priority"
                  options={PRIORITIES}
                  counts={stats.priority_breakdown}
                  colors={PRIORITY_COLORS}
                />
                <BreakdownChart
                  title="Tickets by category"
                  options={CATEGORIES}
                  counts={stats.category_breakdown}
                  colors={CATEGORY_COLORS}
                />
              </>
            )}
          </div>
        </div>

        <section id="tickets" className="card">
          <div className="section-head">
            <h2>Recent tickets</h2>
            <p>Click a ticket to see the full description and change its status</p>
          </div>
          <TicketList refreshKey={dataVersion} onTicketUpdated={refreshData} />
        </section>
      </main>
    </div>
  );
}
