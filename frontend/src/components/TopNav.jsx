import { ROUTES, hrefFor } from "../routes";

const NAV_ITEMS = [
  { route: ROUTES.dashboard, label: "Dashboard", icon: DashboardIcon },
  { route: ROUTES.newTicket, label: "New ticket", icon: PlusIcon },
  { route: ROUTES.tickets, label: "Tickets", icon: ListIcon },
];

export default function TopNav({ route }) {
  return (
    <header className="topnav">
      <a className="brand" href={hrefFor(ROUTES.dashboard)}>
        <span className="brand-mark" aria-hidden="true" />
        TicketDesk
      </a>

      <nav className="pill-nav" aria-label="Pages">
        {NAV_ITEMS.map(({ route: itemRoute, label, icon: Icon }) => {
          const isActive = route === itemRoute;
          return (
            <a
              key={itemRoute}
              href={hrefFor(itemRoute)}
              className={`pill${isActive ? " active" : ""}`}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              title={label}
            >
              <Icon />
              {isActive && <span>{label}</span>}
            </a>
          );
        })}
      </nav>

      <span className="ai-chip">
        <span className="pulse" aria-hidden="true" />
        AI triage on
      </span>
    </header>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </svg>
  );
}
