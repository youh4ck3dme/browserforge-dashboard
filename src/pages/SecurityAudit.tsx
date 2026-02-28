import { ShieldCheck, AlertTriangle, AlertCircle, Info } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { useBrowserForge } from "@/contexts/BrowserForgeContext";

interface Finding {
  severity: "Critical" | "Warning" | "Info";
  finding: string;
  component: string;
  recommendation: string;
}

function getGrade(score: number): { letter: string; label: string } {
  if (score >= 90) return { letter: "A", label: "Excellent" };
  if (score >= 80) return { letter: "B+", label: "Strong" };
  if (score >= 70) return { letter: "B", label: "Good" };
  if (score >= 60) return { letter: "C+", label: "Fair" };
  return { letter: "C", label: "Weak" };
}

// Static Chromium-level findings always present
const staticFindings: Finding[] = [
  { severity: "Critical", finding: "Unpatched V8 CVE-2024-4761 detected", component: "V8 Engine", recommendation: "Upgrade to V8 12.6.228.21+" },
  { severity: "Warning", finding: "Outdated TLS 1.2 config in networking stack", component: "Net Module", recommendation: "Enforce TLS 1.3 minimum" },
  { severity: "Warning", finding: "PDF renderer sandbox escape vector", component: "PDFium", recommendation: "Enable --pdf-renderer-sandbox flag" },
  { severity: "Info", finding: "DNS-over-HTTPS not enforced by default", component: "DNS Resolver", recommendation: "Set DoH to strict mode" },
];

// Dynamic findings based on disabled flags
const flagFindings: Record<string, Finding> = {
  block_telemetry: {
    severity: "Warning",
    finding: "Google telemetry endpoints active — user data leaking",
    component: "Metrics Service",
    recommendation: "Enable 'Remove Google Telemetry' flag",
  },
  kiosk_mode: {
    severity: "Info",
    finding: "Kiosk lockdown not enforced — user can exit browser",
    component: "Window Manager",
    recommendation: "Enable 'Enforce Kiosk Mode' flag",
  },
  vpn_tunnel: {
    severity: "Info",
    finding: "No corporate VPN tunnel — traffic unencrypted at perimeter",
    component: "Network Stack",
    recommendation: "Enable 'Corporate VPN Tunnel' flag",
  },
  anti_fingerprint: {
    severity: "Warning",
    finding: "Browser fingerprinting exposed — device identifiable",
    component: "Canvas / WebGL",
    recommendation: "Enable 'Anti-Fingerprinting Defense' flag",
  },
};

const severityStyle: Record<string, string> = {
  Critical: "bg-destructive/20 text-destructive border-destructive/30",
  Warning: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Info: "bg-primary/20 text-primary border-primary/30",
};

const SecurityAudit = () => {
  const { securityScore, config } = useBrowserForge();

  const disabledFlagFindings: Finding[] = config.flags
    .filter((f) => !f.enabled)
    .map((f) => flagFindings[f.id])
    .filter(Boolean);

  const allFindings: Finding[] = [...staticFindings, ...disabledFlagFindings];

  const grade = getGrade(securityScore);

  const vulnSummary = [
    {
      label: "Critical",
      count: allFindings.filter((f) => f.severity === "Critical").length,
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/20",
    },
    {
      label: "Warning",
      count: allFindings.filter((f) => f.severity === "Warning").length,
      icon: AlertTriangle,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
    {
      label: "Info",
      count: allFindings.filter((f) => f.severity === "Info").length,
      icon: Info,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Security Audit</h1>
      </div>

      {/* Grade + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 flex flex-col items-center justify-center space-y-1">
          <span className="text-5xl font-black font-mono text-accent">{grade.letter}</span>
          <span className="text-xs text-muted-foreground font-mono">Score: {securityScore}/100</span>
          <span className="text-[10px] uppercase tracking-widest text-accent font-mono">{grade.label}</span>
        </div>
        {vulnSummary.map((v) => (
          <div key={v.label} className={`glass-card p-4 space-y-2 border ${v.bg}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono uppercase tracking-wider ${v.color}`}>{v.label}</span>
              <v.icon className={`h-4 w-4 ${v.color}`} />
            </div>
            <p className={`text-3xl font-bold font-mono ${v.color}`}>{v.count}</p>
          </div>
        ))}
      </div>

      {/* Findings */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
            Audit Findings — {config.name}
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Severity</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Finding</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Component</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Recommendation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allFindings.map((f, i) => (
              <TableRow key={i} className="border-border/30">
                <TableCell>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${severityStyle[f.severity]}`}>
                    {f.severity.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-foreground">{f.finding}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{f.component}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{f.recommendation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SecurityAudit;
