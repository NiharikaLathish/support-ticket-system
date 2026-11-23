// All backend calls go through here. In Docker, nginx proxies /api to Django,
// so the frontend and API share an origin and no CORS setup is needed.
const API_BASE = "/api";

export class ApiError extends Error {
  constructor(status, data) {
    super(`Request failed with status ${status}`);
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    signal,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, data);
  }
  return data;
}

export function fetchTickets(filters, signal) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== ""),
  );
  const query = params.toString();
  return request(`/tickets/${query ? `?${query}` : ""}`, { signal });
}

export function createTicket(ticket) {
  return request("/tickets/", { method: "POST", body: ticket });
}

export function updateTicket(id, changes) {
  return request(`/tickets/${id}/`, { method: "PATCH", body: changes });
}

export function fetchStats(signal) {
  return request("/tickets/stats/", { signal });
}

export function classifyDescription(description, signal) {
  return request("/tickets/classify/", {
    method: "POST",
    body: { description },
    signal,
  });
}
