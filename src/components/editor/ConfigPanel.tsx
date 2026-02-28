import { useBrowserForge } from "@/contexts/BrowserForgeContext";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Upload } from "lucide-react";
import { useCallback } from "react";

export function ConfigPanel() {
  const { config, setName, setThemeColor, setLogo, toggleFlag, securityScore } = useBrowserForge();

  const handleLogoDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) setLogo(file);
    },
    [setLogo]
  );

  const handleLogoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setLogo(file);
    },
    [setLogo]
  );

  const scoreColor =
    securityScore >= 75
      ? "text-accent neon-text-green"
      : securityScore >= 50
      ? "text-neon-orange"
      : "text-destructive";

  return (
    <div className="space-y-4">
      {/* Browser Name */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">Configuration</h3>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Browser Name</Label>
          <Input
            value={config.name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background/50 border-border font-mono text-sm"
            placeholder="MyBrowser"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Brand Identity</Label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleLogoDrop}
            className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {config.logoPreview ? (
              <img src={config.logoPreview} alt="Logo" className="h-12 w-12 mx-auto object-contain" />
            ) : (
              <div className="space-y-1">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Drop logo here</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" id="logo-upload" />
            <label htmlFor="logo-upload" className="text-[10px] text-primary cursor-pointer hover:underline">
              or browse
            </label>
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Primary UI Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="font-mono text-xs text-muted-foreground">{config.themeColor}</span>
          </div>
        </div>
      </div>

      {/* Build Flags */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">Build Flags</h3>
        {config.flags.map((flag) => (
          <div key={flag.id} className="flex items-center justify-between">
            <Label className="text-xs text-secondary-foreground cursor-pointer" htmlFor={flag.id}>
              {flag.label}
            </Label>
            <Switch id={flag.id} checked={flag.enabled} onCheckedChange={() => toggleFlag(flag.id)} />
          </div>
        ))}
      </div>

      {/* Security Score */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">AI Security Audit</h3>
        </div>
        <div className="flex items-end gap-3">
          <span className={`text-4xl font-bold font-mono ${scoreColor}`}>{securityScore}</span>
          <span className="text-xs text-muted-foreground mb-1">/100</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${securityScore}%`,
              background:
                securityScore >= 75
                  ? "hsl(var(--neon-green))"
                  : securityScore >= 50
                  ? "hsl(var(--neon-orange))"
                  : "hsl(var(--destructive))",
            }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          {securityScore >= 75
            ? "Strong hardening profile detected."
            : securityScore >= 50
            ? "Moderate protection. Enable more flags."
            : "Weak security posture. Action required."}
        </p>
      </div>
    </div>
  );
}
