import { useCallback, useState } from "react";
import TopNav from "./components/TopNav";
import useHashRoute from "./hooks/useHashRoute";
import useStats from "./hooks/useStats";
import DashboardPage from "./pages/DashboardPage";
import NewTicketPage from "./pages/NewTicketPage";
import TicketsPage from "./pages/TicketsPage";
import { ROUTES } from "./routes";

export default function App() {
  const route = useHashRoute();
  // Bumped whenever tickets change; the lists and stats refetch when it changes.
  const [dataVersion, setDataVersion] = useState(0);
  const refreshData = useCallback(() => setDataVersion((version) => version + 1), []);
  const { stats, error: statsError } = useStats(dataVersion);

  let page;
  if (route === ROUTES.tickets) {
    page = <TicketsPage dataVersion={dataVersion} onDataChanged={refreshData} />;
  } else if (route === ROUTES.newTicket) {
    page = <NewTicketPage onDataChanged={refreshData} />;
  } else {
    page = (
      <DashboardPage
        stats={stats}
        statsError={statsError}
        dataVersion={dataVersion}
        onDataChanged={refreshData}
      />
    );
  }

  return (
    <div className="page">
      <TopNav route={route} />
      {page}
    </div>
  );
}
