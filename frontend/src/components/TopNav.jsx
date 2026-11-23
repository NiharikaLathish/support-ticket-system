import { ROUTES, hrefFor } from "../routes";

const NAV_ITEMS = [
  { route: ROUTES.dashboard, label: "Dashboard" },
  { route: ROUTES.tickets, label: "Tickets" },
];

export default function TopNav({ route }) {
  return (
    <header className="site-header">
      <div className="topnav">
        <a className="brand" href={hrefFor(ROUTES.dashboard)}>
          <span className="brand-mark" aria-hidden="true" />
          TicketDesk
        </a>

        <nav className="nav-links" aria-label="Pages">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.route}
              href={hrefFor(item.route)}
              className={route === item.route ? "active" : undefined}
              aria-current={route === item.route ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          className={`nav-button${route === ROUTES.newTicket ? " active" : ""}`}
          href={hrefFor(ROUTES.newTicket)}
          aria-current={route === ROUTES.newTicket ? "page" : undefined}
        >
          New ticket
        </a>
      </div>
    </header>
  );
}
