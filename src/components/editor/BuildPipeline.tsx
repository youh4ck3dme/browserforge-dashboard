import { useBrowserForge } from "@/contexts/BrowserForgeContext";
import { ChevronRight } from "lucide-react";

const STAGES = ["FETCH", "PATCH", "COMPILE", "SIGN", "PKG"];

export function BuildPipeline() {
  const { pipeline } = useBrowserForge();

  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground">Build Pipeline</h3>
      <div className="flex items-center gap-1 flex-wrap">
        {STAGES.map((stage, i) => {
          let cls = "pipeline-stage";
          if (pipeline.running) {
            if (i < pipeline.currentStage) cls += " done";
            else if (i === pipeline.currentStage) cls += " active";
          }
          return (
            <div key={stage} className="flex items-center gap-1">
              <span className={cls}>{stage}</span>
              {i < STAGES.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/40" />}
            </div>
          );
        })}
      </div>
      {pipeline.running && (
        <p className="text-[10px] font-mono text-primary animate-pulse-neon">
          ● Building stage: {STAGES[pipeline.currentStage] ?? "INIT"}...
        </p>
      )}
    </div>
  );
}
