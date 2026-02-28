import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { API_BASE_URL } from "@/lib/api";
import { Hexagon, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

async function testConnection() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(API_BASE_URL, { signal: controller.signal });
    clearTimeout(timeout);
    const body = await res.text();
    if (res.ok) {
      toast({ title: "🟢 Replit Backend Connected!", description: body });
    } else {
      toast({ title: "Connection Failed", description: `${res.status} — ${body}`, variant: "destructive" });
      toast({ title: "Connection Failed", description: `Status ${res.status} ${res.statusText}`, variant: "destructive" });
    }
  } catch (err: unknown) {
    const error = err as Error;
    toast({ title: "Connection Error", description: error?.message || String(error), variant: "destructive" });
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-4 shrink-0 bg-card/30 backdrop-blur-sm">
            <SidebarTrigger className="mr-3 text-muted-foreground hover:text-foreground" />
            <div className="flex items-center gap-2">
              <img src="/logo.png" className="h-5 w-5 grayscale hover:grayscale-0 brightness-150 transition-all" alt="Logo" />
              <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">Mission Control</span>
            </div>
            <Button variant="ghost" size="sm" onClick={testConnection} className="ml-auto font-mono text-[10px] text-muted-foreground hover:text-foreground gap-1">
              <Plug className="h-3 w-3" /> Test Connection
            </Button>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
