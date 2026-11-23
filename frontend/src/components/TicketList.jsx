import { useEffect, useState } from "react";
import { fetchTickets } from "../api";
import useDebouncedValue from "../hooks/useDebouncedValue";
import TicketFilters from "./TicketFilters";
import TicketItem from "./TicketItem";

const EMPTY_FILTERS = { search: "", category: "", priority: "", status: "" };
const SEARCH_DELAY_MS = 300;
const PAGE_SIZE = 10;

/**
 * With `limit`, shows only the newest `limit` tickets (dashboard preview).
 * Without it, shows PAGE_SIZE at a time with a "Show more" button.
 */
export default function TicketList({ refreshKey, onTicketUpdated, showFilters = false, limit }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  function handleFiltersChange(nextFilters) {
    setFilters(nextFilters);
    setVisibleCount(PAGE_SIZE);
  }

  const shownCount = limit ?? visibleCount;
  const shown = tickets.slice(0, shownCount);
  const remaining = tickets.length - shown.length;

  return (
    <div>
      {showFilters && <TicketFilters filters={filters} onChange={handleFiltersChange} />}

      {error && <p className="error">{error}</p>}
      {loading && tickets.length === 0 && <p className="hint">Loading tickets...</p>}
      {!loading && !error && tickets.length === 0 && (
        <p className="hint">
          {showFilters ? "No tickets match the current filters." : "No tickets yet."}
        </p>
      )}

      <ul className="ticket-list">
        {shown.map((ticket) => (
          <TicketItem key={ticket.id} ticket={ticket} onUpdated={onTicketUpdated} />
        ))}
      </ul>

      {limit === undefined && remaining > 0 && (
        <div className="list-footer">
          <span className="hint">
            Showing {shown.length} of {tickets.length}
          </span>
          <button
            type="button"
            className="button-secondary"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Show {Math.min(PAGE_SIZE, remaining)} more
          </button>
        </div>
      )}
    </div>
  );
}
