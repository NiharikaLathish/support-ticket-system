import CategoryPie from "../components/CategoryPie";
import GlanceCard from "../components/GlanceCard";
import HeroCard from "../components/HeroCard";
import TicketForm from "../components/TicketForm";
import TicketList from "../components/TicketList";
import { ROUTES, hrefFor } from "../routes";

const RECENT_TICKET_COUNT = 5;

export default function DashboardPage({ stats, statsError, dataVersion, onDataChanged }) {
  return (
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

      <section className="card form-card">
        <p className="eyebrow">New ticket</p>
        <h2>What's going wrong?</h2>
        <TicketForm onCreated={onDataChanged} />
      </section>

      <section className="card tickets-card">
        <div className="card-head">
          <div>
            <p className="eyebrow">Queue</p>
            <h2>Recent tickets</h2>
          </div>
          <a className="text-link" href={hrefFor(ROUTES.tickets)}>
            View all tickets
          </a>
        </div>
        <TicketList
          refreshKey={dataVersion}
          onTicketUpdated={onDataChanged}
          limit={RECENT_TICKET_COUNT}
        />
      </section>
    </main>
  );
}
