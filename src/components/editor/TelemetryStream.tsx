import { useEffect, useRef, useState } from "react";

const LOG_TEMPLATES = [
  "Blocked {n} analytics pings from build #{b}",
  "Security Policy synced across {n} instances",
  "Telemetry endpoint blocked: google-analytics.com/{b}",
  "Certificate rotation completed for node-{n}",
  "Anti-fingerprint canvas noise injected in build #{b}",
  "VPN tunnel established: node-{n} → gateway-{b}",
  "Chromium patch {b}.{n} applied successfully",
  "Kiosk lockdown verified on {n} endpoints",
  "Build #{b} artifact signed with SHA-512",
  "Fleet sync: {n} browsers updated to v{b}.0",
];

function randomLog() {
  const t = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  return t
    .replace("{n}", String(Math.floor(Math.random() * 500) + 1))
    .replace("{b}", String(Math.floor(Math.random() * 200) + 100));
}

export function TelemetryStream() {
  const [logs, setLogs] = useState<string[]>(() =>
    Array.from({ length: 6 }, randomLog)
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => [...prev.slice(-15), randomLog()]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  return (
    <div className="glass-card p-4 space-y-2">
      <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">Telemetry Stream</h3>
      <div ref={ref} className="h-28 overflow-y-auto space-y-1 scrollbar-thin">
        {logs.map((log, i) => (
          <p key={i} className="telemetry-ticker">
            <span className="text-muted-foreground/50 mr-2">›</span>
            {log}
          </p>
        ))}
      </div>
    </div>
  );
}
