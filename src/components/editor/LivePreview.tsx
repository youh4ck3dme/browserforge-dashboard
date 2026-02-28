import { useBrowserForge } from "@/contexts/BrowserForgeContext";
import { Globe, X, Minus, Maximize2 } from "lucide-react";

export function LivePreview() {
  const { config } = useBrowserForge();

  return (
    <div className="glass-card overflow-hidden">
      <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground px-4 pt-3 pb-2">
        Live Browser Preview
      </h3>
      {/* Title bar */}
      <div className="mx-3 rounded-t-lg overflow-hidden border border-border" style={{ borderColor: config.themeColor + "40" }}>
        <div
          className="flex items-center justify-between px-3 py-1.5"
          style={{ background: config.themeColor + "20" }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <div className="w-2.5 h-2.5 rounded-full bg-neon-orange" />
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          </div>
          <div className="flex items-center gap-1">
            <Minus className="h-3 w-3 text-muted-foreground" />
            <Maximize2 className="h-3 w-3 text-muted-foreground" />
            <X className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        {/* Tab */}
        <div className="flex items-center px-2 py-1" style={{ background: config.themeColor + "10" }}>
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-t text-xs border-b-2"
            style={{ borderColor: config.themeColor, background: config.themeColor + "15" }}
          >
            {config.logoPreview ? (
              <img src={config.logoPreview} alt="" className="w-3 h-3 object-contain" />
            ) : (
              <Globe className="w-3 h-3" style={{ color: config.themeColor }} />
            )}
            <span className="font-medium text-foreground">{config.name || "New Tab"}</span>
          </div>
        </div>

        {/* Address bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50">
          <div className="flex-1 bg-muted rounded px-3 py-1 flex items-center gap-2">
            <Globe className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              https://{config.name.toLowerCase().replace(/\s+/g, "")}.browser.dev
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="bg-background/80 p-8 text-center min-h-[120px] flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center" style={{ background: config.themeColor + "20" }}>
            {config.logoPreview ? (
              <img src={config.logoPreview} alt="" className="w-8 h-8 object-contain" />
            ) : (
              <Globe className="w-6 h-6" style={{ color: config.themeColor }} />
            )}
          </div>
          <p className="text-sm text-muted-foreground font-medium">{config.name}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Secured Enterprise Browser</p>
        </div>
      </div>
      <div className="h-3" />
    </div>
  );
}
