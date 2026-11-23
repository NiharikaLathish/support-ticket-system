import { useState } from "react";

const NAV_ITEMS = [
  { href: "#overview", label: "Dashboard", icon: DashboardIcon },
  { href: "#new-ticket", label: "New ticket", icon: PlusIcon },
  { href: "#tickets", label: "Tickets", icon: ListIcon },
];

export default function TopNav() {
  const [active, setActive] = useState(NAV_ITEMS[0].href);

  return (
    <header className="topnav">
      <a className="brand" href="#overview">
        <span className="brand-mark" aria-hidden="true" />
        TicketDesk
      </a>

      <nav className="pill-nav" aria-label="Sections">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = active === href;
          return (
            <a
              key={href}
              href={href}
              className={`pill${isActive ? " active" : ""}`}
              aria-label={label}
              aria-current={isActive ? "true" : undefined}
              title={label}
              onClick={() => setActive(href)}
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
