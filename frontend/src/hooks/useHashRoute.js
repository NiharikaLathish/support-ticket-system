import { useEffect, useState } from "react";

function currentRoute() {
  return window.location.hash.replace(/^#/, "") || "/";
}

// Returns the current hash route and updates when the user navigates.
export default function useHashRoute() {
  const [route, setRoute] = useState(currentRoute);

  useEffect(() => {
    function handleHashChange() {
      setRoute(currentRoute());
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return route;
}
