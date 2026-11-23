import { useEffect, useState } from "react";
import { fetchTickets } from "../api";
import useDebouncedValue from "../hooks/useDebouncedValue";
import TicketFilters from "./TicketFilters";
import TicketItem from "./TicketItem";

const EMPTY_FILTERS = { search: "", category: "", priority: "", status: "" };
const SEARCH_DELAY_MS = 300;

export default function TicketList({ refreshKey, onTicketUpdated }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = useDebouncedValue(filters.search.trim(), SEARCH_DELAY_MS);
  const { category, priority, status } = filters;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchTickets({ search, category, priority, status }, controller.signal)
      .then((data) => {
        setTickets(data);
        setError("");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Could not load tickets.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [search, category, priority, status, refreshKey]);

  return (
    <div>
      <TicketFilters filters={filters} onChange={setFilters} />

      {error && <p className="error">{error}</p>}
      {loading && tickets.length === 0 && <p className="hint">Loading tickets...</p>}
      {!loading && !error && tickets.length === 0 && (
        <p className="hint">No tickets match the current filters.</p>
      )}

      {tickets.length > 0 && (
        <div className="ticket-table-head" aria-hidden="true">
          <span>ID</span>
          <span>Ticket</span>
          <span>Category</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Created</span>
        </div>
      )}
      <ul className="ticket-list">
        {tickets.map((ticket) => (
          <TicketItem key={ticket.id} ticket={ticket} onUpdated={onTicketUpdated} />
        ))}
      </ul>
    </div>
  );
}
