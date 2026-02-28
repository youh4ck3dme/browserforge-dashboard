import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, onSnapshot, doc } from "firebase/firestore";

export interface BuildFlag {
  id: string;
  label: string;
  enabled: boolean;
  securityBoost: number;
}

export interface BrowserConfig {
  name: string;
  themeColor: string;
  logoFile: File | null;
  logoPreview: string | null;
  flags: BuildFlag[];
}

export interface BuildResult {
  id: string;
  status: string;
  recipe: string;
}

interface PipelineState {
  running: boolean;
  currentStage: number; // -1 = idle, 0-4 = stages
}

interface BrowserForgeContextType {
  config: BrowserConfig;
  setName: (name: string) => void;
  setThemeColor: (color: string) => void;
  setLogo: (file: File | null) => void;
  toggleFlag: (id: string) => void;
  securityScore: number;
  pipeline: PipelineState;
  buildResult: BuildResult | null;
  launchBuild: () => Promise<void>;
  apiUrl: string;
  setApiUrl: (url: string) => void;
}

const defaultFlags: BuildFlag[] = [
  { id: "block_telemetry", label: "Remove Google Telemetry", enabled: true, securityBoost: 25 },
  { id: "kiosk_mode", label: "Enforce Kiosk Mode", enabled: false, securityBoost: 10 },
  { id: "vpn_tunnel", label: "Corporate VPN Tunnel", enabled: false, securityBoost: 20 },
  { id: "anti_fingerprint", label: "Anti-Fingerprinting Defense", enabled: true, securityBoost: 30 },
];

const BrowserForgeContext = createContext<BrowserForgeContextType | null>(null);

export const useBrowserForge = () => {
  const ctx = useContext(BrowserForgeContext);
  if (!ctx) throw new Error("useBrowserForge must be used within BrowserForgeProvider");
  return ctx;
};

export const BrowserForgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<BrowserConfig>({
    name: "ForgeChrome",
    themeColor: "#00d4ff",
    logoFile: null,
    logoPreview: null,
    flags: defaultFlags,
  });

  const [pipeline, setPipeline] = useState<PipelineState>({ running: false, currentStage: -1 });
  const [buildResult, setBuildResult] = useState<BuildResult | null>(null);
  const [apiUrl, setApiUrl] = useState("https://stephanie-carbon-realistic-garlic.trycloudflare.com");

  const setName = useCallback((name: string) => setConfig((c) => ({ ...c, name })), []);
  const setThemeColor = useCallback((color: string) => setConfig((c) => ({ ...c, themeColor: color })), []);
  const setLogo = useCallback((file: File | null) => {
    const logoPreview = file ? URL.createObjectURL(file) : null;
    setConfig((c) => ({ ...c, logoFile: file, logoPreview }));
  }, []);
  const toggleFlag = useCallback((id: string) => {
    setConfig((c) => ({
      ...c,
      flags: c.flags.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    }));
  }, []);

  const securityScore = config.flags.reduce(
    (score, f) => score + (f.enabled ? f.securityBoost : 0),
    15 // base score
  );

  const launchBuild = useCallback(async () => {
    setPipeline({ running: true, currentStage: 0 });
    setBuildResult(null);

    const stages = 5;
    for (let i = 0; i < stages; i++) {
      await new Promise((r) => setTimeout(r, 1200));
      setPipeline({ running: true, currentStage: i });
    }

    try {
      // 1. Create Job via Orchestrator API (Replit)
      const buildFlags: Record<string, boolean> = {};
      config.flags.forEach(f => {
        buildFlags[f.id] = f.enabled;
      });

      const response = await fetch(`${apiUrl}/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: config.name,
          theme_color: config.themeColor,
          ...buildFlags
        }),
      });

      if (!response.ok) throw new Error("API call failed");

      const job = await response.json();
      const jobId = job.id;

      setBuildResult({
        id: jobId,
        status: "QUEUED (via API)",
        recipe: generateRecipe(config),
      });

      // 2. Listen for Real-Time Updates from Firestore
      onSnapshot(doc(db, "build_jobs", jobId), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setBuildResult((prev) => prev ? {
            ...prev,
            status: data.status,
            recipe: data.recipe || prev.recipe,
          } : null);

          // Stop Pipeline animation if finished
          if (data.status === "DONE" || data.status === "FAILED") {
            setPipeline({ running: false, currentStage: -1 });
          }
        }
      });

    } catch (e) {
      console.error("Firebase error", e);
      // Simulate a build result if Firebase logic fails (e.g. config missing)
      setBuildResult({
        id: crypto.randomUUID(),
        status: "QUEUED (simulated fallback)",
        recipe: generateRecipe(config),
      });
      await new Promise((r) => setTimeout(r, 500));
      setPipeline({ running: false, currentStage: -1 });
    }
  }, [config, apiUrl]);

  return (
    <BrowserForgeContext.Provider
      value={{
        config, setName, setThemeColor, setLogo, toggleFlag,
        securityScore, pipeline, buildResult, launchBuild,
        apiUrl, setApiUrl,
      }}
    >
      {children}
    </BrowserForgeContext.Provider>
  );
};

function generateRecipe(config: BrowserConfig): string {
  let recipe = `# BrowserForge Build Recipe\n`;
  recipe += `is_official_build = true\n`;
  recipe += `brand_name = "${config.name}"\n`;
  recipe += `brand_color = "${config.themeColor}"\n`;
  config.flags.forEach((f) => {
    recipe += `${f.id} = ${f.enabled}\n`;
  });
  return recipe;
}
