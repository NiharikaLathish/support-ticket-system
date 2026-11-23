import { useCallback, useState } from "react";
import StatsDashboard from "./components/StatsDashboard";
import TicketForm from "./components/TicketForm";
import TicketList from "./components/TicketList";

export default function App() {
  // Bumped whenever tickets change; the list and stats refetch when it changes.
  const [dataVersion, setDataVersion] = useState(0);
  const refreshData = useCallback(() => setDataVersion((version) => version + 1), []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Support Ticket System</h1>
      </header>

      <main className="layout">
        <section className="panel">
          <h2>Submit a ticket</h2>
          <TicketForm onCreated={refreshData} />
        </section>

        <section className="panel">
          <h2>Overview</h2>
          <StatsDashboard refreshKey={dataVersion} />
        </section>

        <section className="panel panel-wide">
          <h2>Tickets</h2>
          <TicketList refreshKey={dataVersion} onTicketUpdated={refreshData} />
        </section>
      </main>
    </div>
  );
}
