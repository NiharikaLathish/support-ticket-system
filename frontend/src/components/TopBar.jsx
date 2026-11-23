function greeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function TopBar() {
  const now = new Date();

  return (
    <header className="topbar">
      <div>
        <h1>{greeting(now.getHours())}</h1>
        <p>Here's what's happening in your support queue today.</p>
      </div>
      <div className="topbar-date">
        {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
      </div>
    </header>
  );
}
