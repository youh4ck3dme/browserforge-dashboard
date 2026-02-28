import { useState } from "react";
import { Server, Wifi, WifiOff, RefreshCw, MapPin, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";

const fleetStats = [
  { label: "Total Deployed", value: "12,500", icon: Globe },
  { label: "Online", value: "11,842", icon: Wifi },
  { label: "Offline", value: "413", icon: WifiOff },
  { label: "Pending Update", value: "245", icon: RefreshCw },
];

const instances = [
  { id: "bf-node-0a1b", name: "CorpSecure v4.2", version: "4.2.1", status: "Online", lastSeen: "Just now", location: "US-East" },
  { id: "bf-node-3c4d", name: "KioskBrowser Pro", version: "2.0.3", status: "Online", lastSeen: "12s ago", location: "EU-West" },
  { id: "bf-node-5e6f", name: "DevForge Canary", version: "5.0.0-beta", status: "Updating", lastSeen: "1m ago", location: "AP-Tokyo" },
  { id: "bf-node-7g8h", name: "CorpSecure v4.1", version: "4.1.9", status: "Online", lastSeen: "4s ago", location: "US-West" },
  { id: "bf-node-9i0j", name: "InternalTools Browser", version: "1.3.7", status: "Offline", lastSeen: "2h ago", location: "EU-Central" },
  { id: "bf-node-1k2l", name: "SecureMail Client", version: "3.1.0", status: "Online", lastSeen: "8s ago", location: "US-East" },
  { id: "bf-node-3m4n", name: "CorpSecure v3.9", version: "3.9.12", status: "Offline", lastSeen: "5d ago", location: "AP-Sydney" },
  { id: "bf-node-5o6p", name: "KioskBrowser Lite", version: "1.0.1", status: "Updating", lastSeen: "30s ago", location: "EU-West" },
  { id: "bf-node-7q8r", name: "DevForge Stable", version: "4.8.2", status: "Online", lastSeen: "1s ago", location: "US-Central" },
  { id: "bf-node-9s0t", name: "CorpSecure v4.2-hotfix", version: "4.2.2", status: "Online", lastSeen: "Just now", location: "US-East" },
];

const statusColor: Record<string, string> = {
  Online: "bg-accent/20 text-accent border-accent/30",
  Offline: "bg-destructive/20 text-destructive border-destructive/30",
  Updating: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const FleetManagement = () => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Fleet Management</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          className="font-mono text-xs border-primary/30 hover:bg-primary/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync Fleet"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {fleetStats.map((s) => (
          <div key={s.label} className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{s.label}</span>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Fleet Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Instance ID</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Browser Name</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Version</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Last Seen</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instances.map((inst) => (
              <TableRow key={inst.id} className="border-border/30">
                <TableCell className="font-mono text-xs text-muted-foreground">{inst.id}</TableCell>
                <TableCell className="text-sm text-foreground">{inst.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{inst.version}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColor[inst.status]}`}>
                    {inst.status.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{inst.lastSeen}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {inst.location}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FleetManagement;
