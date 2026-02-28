import { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TelemetryEvent {
  timestamp: string;
  message: string;
}

function formatTimestamp(ts: string | { seconds: number }): string {
  try {
    const date = typeof ts === "string" ? new Date(ts) : new Date((ts as { seconds: number }).seconds * 1000);
    return date.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "--:--:--";
  }
}

function jobToEvents(doc: Record<string, unknown>): TelemetryEvent[] {
  // If the new 'logs' array exists, use it for high-fidelity data
  if (Array.isArray(doc.logs)) {
    return doc.logs.map((log: { timestamp?: string; message?: string }) => ({
      timestamp: log.timestamp || "--:--:--",
      message: log.message || "Unknown event",
    }));
  }

  const events: TelemetryEvent[] = [];
  const name = (doc.name as string) || (doc.config as Record<string, unknown>)?.name as string || "Unknown";
  const status = (doc.status as string) || "UNKNOWN";
  const ts = (doc.timestamp as string) || new Date().toISOString();

  events.push({
    timestamp: formatTimestamp(ts),
    message: `Build "${name}" → ${status}`,
  });

  const config = doc.config as Record<string, boolean | string> | undefined;
  if (config) {
    if (config.anti_fingerprint || config.antiFingerprint) {
      events.push({ timestamp: formatTimestamp(ts), message: `Anti-fingerprint canvas noise injected for "${name}"` });
    }
    if (config.block_telemetry || config.blockTelemetry) {
      events.push({ timestamp: formatTimestamp(ts), message: `Google telemetry endpoints blocked for "${name}"` });
    }
    if (config.vpn_tunnel || config.vpnIntegration) {
      events.push({ timestamp: formatTimestamp(ts), message: `VPN tunnel established for "${name}"` });
    }
  }

  if (status === "DONE" || status === "COMPLETE") {
    events.push({ timestamp: formatTimestamp(ts), message: `✅ Build "${name}" completed — artifact ready for download` });
  } else if (status === "FAILED") {
    events.push({ timestamp: formatTimestamp(ts), message: `❌ Build "${name}" failed — check error logs` });
  }

  return events;
}

export function TelemetryStream() {
  const [events, setEvents] = useState<TelemetryEvent[]>([
    { timestamp: formatTimestamp(new Date().toISOString()), message: "Telemetry stream initialized — awaiting Firestore events..." },
  ]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "build_jobs"), orderBy("timestamp", "desc"), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allEvents: TelemetryEvent[] = [];
      snapshot.docs.reverse().forEach((doc) => {
        const data = doc.data();
        allEvents.push(...jobToEvents(data));
      });

      if (allEvents.length > 0) {
        setEvents(allEvents.slice(-20));
      }
    }, (error) => {
      setEvents((prev) => [
        ...prev,
        { timestamp: formatTimestamp(new Date().toISOString()), message: `⚠ Firestore error: ${error.message}` },
      ]);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [events]);

  return (
    <div className="glass-card p-4 space-y-2">
      <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
        Telemetry Stream <span className="text-neon-green animate-pulse-neon">● LIVE</span>
      </h3>
      <div ref={ref} className="h-28 overflow-y-auto space-y-1 scrollbar-thin">
        {events.map((evt, i) => (
          <p key={i} className="telemetry-ticker">
            <span className="text-muted-foreground/50 mr-2 font-mono text-[10px]">{evt.timestamp}</span>
            <span className="text-muted-foreground/50 mr-1">›</span>
            {evt.message}
          </p>
        ))}
      </div>
    </div>
  );
}
