import { useState } from "react";

const NAV_ITEMS = [
  { href: "#overview", label: "Dashboard", icon: DashboardIcon },
  { href: "#new-ticket", label: "New ticket", icon: PlusIcon },
  { href: "#tickets", label: "Tickets", icon: ListIcon },
];

export default function Sidebar() {
  const [active, setActive] = useState(NAV_ITEMS[0].href);

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-name">TicketDesk</span>
      </div>

      <p className="nav-heading">Menu</p>
      <nav className="nav">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className={`nav-item${active === href ? " active" : ""}`}
            onClick={() => setActive(href)}
          >
            <Icon />
            {label}
          </a>
        ))}
      </nav>

      <div className="sidebar-note">
        <span className="pulse" aria-hidden="true" />
        AI triage powered by Gemini
      </div>
    </aside>
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
