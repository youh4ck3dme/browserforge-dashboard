import { useEffect, useState } from "react";
import { History, ChevronDown } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "../components/ui/table";
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from "../components/ui/collapsible";
import { db } from "../lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

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

function mapStatus(raw: string): Status {
  if (raw === "DONE") return "COMPLETE";
  if (raw === "FAILED") return "FAILED";
  if (raw === "QUEUED" || raw.startsWith("BUILDING")) return "IN PROGRESS";
  return "IN PROGRESS";
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function formatConfig(config: Record<string, unknown>): string {
  const parts: string[] = [];
  if (config?.block_telemetry) parts.push("telemetry:off");
  if (config?.kiosk_mode) parts.push("kiosk:on");
  if (config?.vpn_tunnel) parts.push("vpn:on");
  if (config?.anti_fingerprint) parts.push("fingerprint:on");
  return parts.length > 0 ? parts.join(", ") : "default";
}

const statusStyle: Record<Status, string> = {
  COMPLETE: "bg-accent/20 text-accent border-accent/30",
  FAILED: "bg-destructive/20 text-destructive border-destructive/30",
  "IN PROGRESS": "bg-primary/20 text-primary border-primary/30 animate-pulse",
};

const filters: (Status | "ALL")[] = ["ALL", "COMPLETE", "FAILED", "IN PROGRESS"];

const BuildHistory = () => {
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);

  useEffect(() => {
    const q = query(collection(db, "build_jobs"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setBuilds(
          snap.docs.map((d) => {
            const data = d.data();
            const status = mapStatus(data.status ?? "");
            const recipe =
              status === "COMPLETE"
                ? data.download_url
                  ? `Download: ${data.download_url}`
                  : "Build completed."
                : status === "FAILED"
                  ? data.error_log ?? "Build failed."
                  : `Status: ${data.status ?? "IN PROGRESS"}`;
            return {
              id: d.id.substring(0, 8).toUpperCase(),
              name: data.config?.name ?? "Unknown",
              config: formatConfig(data.config ?? {}),
              status,
              duration: "—",
              timestamp: data.timestamp ? formatTimestamp(data.timestamp) : "—",
              recipe,
            };
          })
        );
      },
      () => {
        // Firebase not configured — leave empty
      }
    );
    return unsub;
  }, []);

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
            className={`px-3 py-1 rounded text-[11px] font-mono uppercase tracking-wider border transition-colors ${filter === f
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-xs text-muted-foreground font-mono py-8">
                  No builds found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => {
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
                              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Build Details</p>
                              <pre className="font-mono text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">{b.recipe}</pre>
                            </div>
                          </td>
                        </tr>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BuildHistory;
