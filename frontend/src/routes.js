// Pages are addressed with the URL hash (e.g. "#/tickets"), so the app needs no
// router library and nginx can keep serving a single index.html.
export const ROUTES = {
  dashboard: "/",
  newTicket: "/new",
  tickets: "/tickets",
};

export function hrefFor(route) {
  return `#${route}`;
}
