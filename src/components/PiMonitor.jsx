import { useState, useEffect } from "react";
import "./PiMonitor.css";

const POLL_INTERVAL_MS = 500; // refresh every 5 seconds

function fmt(value, suffix) {
  if (value === null || value === undefined) return "—";
  return `${value}${suffix}`;
}

function PiMonitor() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/system");
        if (!res.ok) throw new Error("non-2xx");
        const data = await res.json();
        if (!cancelled) {
          setStats(data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    };

    fetchStats();
    const id = setInterval(fetchStats, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const cpu = stats ? fmt(stats.cpu_percent, "%") : "…";
  const mem = stats ? fmt(stats.mem_percent, "%") : "…";
  const temp = stats ? fmt(stats.cpu_temp_c, "°C") : "…";

  return (
    <div
      className={`pi-monitor-pill${error ? " pi-monitor-error" : ""}`}
      title="Raspberry Pi system stats"
    >
      <span className="pi-monitor-segment">
        <span className="pi-monitor-label">cpu</span>
        <span className="pi-monitor-value">{cpu}</span>
      </span>
      <span className="pi-monitor-divider" />
      <span className="pi-monitor-segment">
        <span className="pi-monitor-label">mem</span>
        <span className="pi-monitor-value">{mem}</span>
      </span>
      <span className="pi-monitor-divider" />
      <span className="pi-monitor-segment">
        <span className="pi-monitor-label">temp</span>
        <span className="pi-monitor-value">{temp}</span>
      </span>
    </div>
  );
}

export default PiMonitor;
