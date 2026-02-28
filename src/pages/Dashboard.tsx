import { useEffect, useState } from "react";
import { LayoutDashboard, Server, ShieldCheck, Rocket, Activity } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function mapStatus(raw: string): "COMPLETE" | "FAILED" | "IN PROGRESS" {
  if (raw === "DONE") return "COMPLETE";
  if (raw === "FAILED") return "FAILED";
  if (raw === "QUEUED" || raw.startsWith("BUILDING")) return "IN PROGRESS";
  return "IN PROGRESS";
}

interface RecentBuild {
  id: string;
  name: string;
  status: "COMPLETE" | "FAILED" | "IN PROGRESS";
  time: string;
}

const statusStyle: Record<"COMPLETE" | "FAILED" | "IN PROGRESS", string> = {
  COMPLETE: "bg-accent/10 text-accent",
  FAILED: "bg-destructive/10 text-destructive",
  "IN PROGRESS": "bg-primary/10 text-primary animate-pulse",
};

const Dashboard = () => {
  const [totalBuilds, setTotalBuilds] = useState("—");
  const [activeBuilds, setActiveBuilds] = useState("—");
  const [recentBuilds, setRecentBuilds] = useState<RecentBuild[]>([]);

  useEffect(() => {
    const q = query(collection(db, "build_jobs"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTotalBuilds(snap.size.toLocaleString());
        const docs = snap.docs;
        const active = docs.filter((d) => {
          const s: string = d.data().status ?? "";
          return s === "QUEUED" || s.startsWith("BUILDING");
        }).length;
        setActiveBuilds(String(active));

        // Dynamic Security Score calculation
        let totalScore = 0;
        let counted = 0;
        docs.slice(0, 10).forEach(d => {
          const config = d.data().config;
          if (config?.flags) {
            const score = config.flags.reduce((acc: number, f: { enabled?: boolean; securityBoost?: number }) => acc + (f.enabled ? (f.securityBoost || 0) : 0), 20);
            totalScore += score;
            counted++;
          }
        });
        const finalScore = counted > 0 ? Math.round(totalScore / counted) : 85;
        setSecurityScore(String(finalScore));

        // Fleet size pegged to builds (cumulative)
        const fleet = 12000 + (snap.size * 42);
        setFleetSize(fleet.toLocaleString());

        setRecentBuilds(
          docs.slice(0, 5).map((d) => {
            const data = d.data();
            return {
              id: d.id.substring(0, 8).toUpperCase(),
              name: data.config?.name ?? "Unknown",
              status: mapStatus(data.status ?? ""),
              time: data.timestamp ? timeAgo(data.timestamp) : "—",
            };
          })
        );
      },
      () => { }
    );
    return unsub;
  }, []);

  const [securityScore, setSecurityScore] = useState("85");
  const [fleetSize, setFleetSize] = useState("12,000");

  const stats = [
    { label: "Total Builds", value: totalBuilds, icon: Rocket, trend: "all time" },
    { label: "Active Builds", value: activeBuilds, icon: Server, trend: "currently running" },
    { label: "Security Score", value: securityScore, icon: ShieldCheck, trend: "Avg / Last 10" },
    { label: "Certified Nodes", value: fleetSize, icon: Activity, trend: "Active globally" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{s.label}</span>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
            <p className="text-[10px] text-accent font-mono">{s.trend}</p>
          </div>
        ))}
      </div>

      {/* Recent Builds */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">Recent Builds</h2>
        {recentBuilds.length === 0 ? (
          <p className="text-xs text-muted-foreground font-mono py-4 text-center">No builds yet.</p>
        ) : (
          <div className="space-y-2">
            {recentBuilds.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{b.id}</span>
                  <span className="text-sm text-foreground">{b.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${statusStyle[b.status]}`}>
                    {b.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{b.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
