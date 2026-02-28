import { useState } from "react";
import { History, ChevronDown } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from "@/components/ui/collapsible";

type Status = "COMPLETE" | "FAILED" | "IN PROGRESS";

interface Build {
  id: string;
  name: string;
  config: string;
  status: Status;
  duration: string;
  timestamp: string;
  recipe: string;
}

const builds: Build[] = [
  { id: "#1247", name: "CorpSecure v4.2", config: "telemetry:off, kiosk:on", status: "COMPLETE", duration: "14m 32s", timestamp: "2024-12-27 09:14", recipe: 'is_official_build = true\nbrand_name = "CorpSecure"\nenable_google_reporting = false\nkiosk_mode = true' },
  { id: "#1246", name: "KioskBrowser Pro", config: "telemetry:off, vpn:on", status: "COMPLETE", duration: "12m 08s", timestamp: "2024-12-27 08:51", recipe: 'is_official_build = true\nbrand_name = "KioskBrowser Pro"\nvpn_tunnel = true' },
  { id: "#1245", name: "DevForge Canary", config: "all flags:on", status: "FAILED", duration: "6m 41s", timestamp: "2024-12-27 07:30", recipe: 'ERROR: Compile stage failed at component webrtc\nExit code 1' },
  { id: "#1244", name: "CorpSecure v4.1", config: "telemetry:off", status: "COMPLETE", duration: "13m 55s", timestamp: "2024-12-26 22:10", recipe: 'is_official_build = true\nbrand_name = "CorpSecure"\nenable_google_reporting = false' },
  { id: "#1243", name: "InternalTools Browser", config: "fingerprint:on", status: "COMPLETE", duration: "15m 02s", timestamp: "2024-12-26 18:44", recipe: 'is_official_build = true\nbrand_name = "InternalTools"\nanti_fingerprint = true' },
  { id: "#1242", name: "SecureMail Client", config: "vpn:on, fingerprint:on", status: "IN PROGRESS", duration: "—", timestamp: "2024-12-26 17:20", recipe: 'Build in progress…\nCurrent stage: COMPILE (3/5)' },
  { id: "#1241", name: "KioskBrowser Lite", config: "kiosk:on", status: "COMPLETE", duration: "11m 19s", timestamp: "2024-12-26 14:05", recipe: 'is_official_build = true\nbrand_name = "KioskBrowser Lite"\nkiosk_mode = true' },
  { id: "#1240", name: "DevForge Stable", config: "telemetry:off, vpn:on", status: "COMPLETE", duration: "14m 48s", timestamp: "2024-12-26 10:32", recipe: 'is_official_build = true\nbrand_name = "DevForge"\nenable_google_reporting = false\nvpn_tunnel = true' },
  { id: "#1239", name: "CorpSecure v3.9", config: "telemetry:off", status: "FAILED", duration: "3m 12s", timestamp: "2024-12-25 23:58", recipe: 'ERROR: SIGN stage failed — certificate expired\nExit code 2' },
  { id: "#1238", name: "TestBuild Alpha", config: "none", status: "COMPLETE", duration: "10m 05s", timestamp: "2024-12-25 20:15", recipe: 'is_official_build = false\nbrand_name = "TestBuild"\ndefault configuration' },
];

const statusStyle: Record<Status, string> = {
  COMPLETE: "bg-accent/20 text-accent border-accent/30",
  FAILED: "bg-destructive/20 text-destructive border-destructive/30",
  "IN PROGRESS": "bg-primary/20 text-primary border-primary/30 animate-pulse",
};

const filters: (Status | "ALL")[] = ["ALL", "COMPLETE", "FAILED", "IN PROGRESS"];

const BuildHistory = () => {
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "ALL" ? builds : builds.filter((b) => b.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Build History</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-[11px] font-mono uppercase tracking-wider border transition-colors ${
              filter === f
                ? "bg-primary/20 text-primary border-primary/40"
                : "bg-secondary/30 text-muted-foreground border-border/50 hover:bg-secondary/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-8" />
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Build ID</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Browser Name</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Config</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Duration</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => {
              const isOpen = expanded === b.id;
              return (
                <Collapsible key={b.id} open={isOpen} onOpenChange={() => setExpanded(isOpen ? null : b.id)} asChild>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="border-border/30 cursor-pointer hover:bg-secondary/30">
                        <TableCell className="w-8 text-center">
                          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{b.id}</TableCell>
                        <TableCell className="text-sm text-foreground">{b.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{b.config}</TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusStyle[b.status]}`}>
                            {b.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{b.duration}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{b.timestamp}</TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <tr className="border-border/20">
                        <td colSpan={7} className="p-0">
                          <div className="bg-secondary/20 border-t border-border/30 p-4">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Build Recipe</p>
                            <pre className="font-mono text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">{b.recipe}</pre>
                          </div>
                        </td>
                      </tr>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BuildHistory;
