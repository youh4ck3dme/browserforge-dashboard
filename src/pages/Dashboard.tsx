import { LayoutDashboard, Server, ShieldCheck, Rocket, Activity } from "lucide-react";

const stats = [
  { label: "Total Builds", value: "1,247", icon: Rocket, trend: "+12%" },
  { label: "Active Nodes", value: "64", icon: Server, trend: "98% uptime" },
  { label: "Security Score", value: "87", icon: ShieldCheck, trend: "Strong" },
  { label: "Fleet Size", value: "12,500", icon: Activity, trend: "+340 this week" },
];

const recentBuilds = [
  { id: "#1247", name: "CorpSecure v4.2", status: "COMPLETE", time: "2m ago" },
  { id: "#1246", name: "KioskBrowser Pro", status: "COMPLETE", time: "14m ago" },
  { id: "#1245", name: "DevForge Canary", status: "FAILED", time: "1h ago" },
  { id: "#1244", name: "CorpSecure v4.1", status: "COMPLETE", time: "3h ago" },
  { id: "#1243", name: "InternalTools Browser", status: "COMPLETE", time: "5h ago" },
];

const Dashboard = () => {
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
        <div className="space-y-2">
          {recentBuilds.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">{b.id}</span>
                <span className="text-sm text-foreground">{b.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    b.status === "COMPLETE"
                      ? "bg-accent/10 text-accent"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {b.status}
                </span>
                <span className="text-[10px] text-muted-foreground">{b.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
