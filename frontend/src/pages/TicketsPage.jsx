import TicketList from "../components/TicketList";

export default function TicketsPage({ dataVersion, onDataChanged }) {
  return (
    <main className="single-page">
      <section className="card">
        <p className="eyebrow">Queue</p>
        <h2>All tickets</h2>
        <TicketList refreshKey={dataVersion} onTicketUpdated={onDataChanged} showFilters />
      </section>
    </main>
  );
}
