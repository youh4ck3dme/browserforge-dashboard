import { useBrowserForge } from "@/contexts/BrowserForgeContext";
import { Rocket, Loader2 } from "lucide-react";

export function LaunchButton() {
  const { pipeline, launchBuild, buildResult } = useBrowserForge();

  return (
    <div className="space-y-3">
      <button
        onClick={launchBuild}
        disabled={pipeline.running}
        className="launch-button w-full flex items-center justify-center gap-3"
      >
        {pipeline.running ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            BUILDING...
          </>
        ) : (
          <>
            <Rocket className="h-5 w-5" />
            LAUNCH PRODUCTION BUILD
          </>
        )}
      </button>
      {buildResult && (
        <div className="glass-card p-3 space-y-1">
          <p className="text-[10px] font-mono text-muted-foreground">Build ID</p>
          <p className="text-xs font-mono text-primary truncate">{buildResult.id}</p>
          <p className="text-[10px] font-mono text-accent">{buildResult.status}</p>
        </div>
      )}
    </div>
  );
}
