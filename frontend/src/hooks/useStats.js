import { useEffect, useState } from "react";
import { fetchStats } from "../api";

// Loads /api/tickets/stats/ and reloads it whenever `refreshKey` changes.
export default function useStats(refreshKey) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetchStats(controller.signal)
      .then((data) => {
        setStats(data);
        setError("");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Could not load stats.");
        }
      });

    return () => controller.abort();
  }, [refreshKey]);

  return { stats, error };
}
