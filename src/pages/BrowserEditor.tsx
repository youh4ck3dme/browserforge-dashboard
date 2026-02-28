import { ConfigPanel } from "@/components/editor/ConfigPanel";
import { LivePreview } from "@/components/editor/LivePreview";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { BuildPipeline } from "@/components/editor/BuildPipeline";
import { NodeHealthStats } from "@/components/editor/NodeHealthStats";
import { TelemetryStream } from "@/components/editor/TelemetryStream";
import { LaunchButton } from "@/components/editor/LaunchButton";

const BrowserEditor = () => {
  return (
    <div className="p-4 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr_1.2fr] gap-4 h-full">
        {/* Left Column — Configuration */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
          <ConfigPanel />
        </div>

        {/* Middle Column — Preview & Code */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-6rem)]">
          <LivePreview />
          <CodeEditor />
        </div>

        {/* Right Column — Manufacturing & Telemetry */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-6rem)] flex flex-col">
          <BuildPipeline />
          <NodeHealthStats />
          <TelemetryStream />
          <div className="mt-auto pt-2">
            <LaunchButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserEditor;
