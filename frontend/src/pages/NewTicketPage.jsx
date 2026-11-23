import TicketForm from "../components/TicketForm";
import { ROUTES, hrefFor } from "../routes";

export default function NewTicketPage({ onDataChanged }) {
  return (
    <main className="single-page narrow">
      <section className="card">
        <p className="eyebrow">New ticket</p>
        <h2>What's going wrong?</h2>
        <TicketForm onCreated={onDataChanged} />
      </section>
      <a className="text-link" href={hrefFor(ROUTES.tickets)}>
        Go to all tickets
      </a>
    </main>
  );
}
