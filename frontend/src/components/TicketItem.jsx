import { useState } from "react";
import { updateTicket } from "../api";
import { CATEGORIES, PRIORITIES, STATUSES, labelFor } from "../constants";

const PREVIEW_LENGTH = 120;

function truncate(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

export default function TicketItem({ ticket, onUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleStatusChange(event) {
    setSaving(true);
    setError("");
    try {
      await updateTicket(ticket.id, { status: event.target.value });
      onUpdated();
    } catch {
      setError("Could not update the status. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className={`ticket priority-${ticket.priority}${expanded ? " expanded" : ""}`}>
      <button
        type="button"
        className="ticket-row"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <span className="ticket-top">
          <span className="ticket-title">{ticket.title}</span>
          <span className="ticket-id">#{ticket.id}</span>
          <time dateTime={ticket.created_at}>{new Date(ticket.created_at).toLocaleString()}</time>
        </span>
        <span className="ticket-preview">
          {expanded ? ticket.description : truncate(ticket.description, PREVIEW_LENGTH)}
        </span>
        <span className="ticket-meta">
          <span className={`badge category-${ticket.category}`}>
            {labelFor(CATEGORIES, ticket.category)}
          </span>
          <span className={`badge priority-${ticket.priority}`}>
            {labelFor(PRIORITIES, ticket.priority)}
          </span>
          <span className={`badge status-${ticket.status}`}>
            {labelFor(STATUSES, ticket.status)}
          </span>
        </span>
      </button>

      {expanded && (
        <div className="ticket-actions">
          <label>
            Change status
            <select value={ticket.status} onChange={handleStatusChange} disabled={saving}>
              {STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {saving && <span className="hint">Saving...</span>}
          {error && <span className="error">{error}</span>}
        </div>
      )}
    </li>
  );
}
