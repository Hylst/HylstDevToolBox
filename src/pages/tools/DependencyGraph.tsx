import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Copy, Check, RotateCcw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mermaid from "mermaid";

interface PkgJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const samplePkg: PkgJson = {
  name: "my-app",
  version: "1.0.0",
  dependencies: {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "date-fns": "^3.0.0",
  },
  devDependencies: {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@types/react": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.55.0",
    "vitest": "^1.0.0",
    "postcss": "^8.4.0",
  },
};

function generateMermaid(pkg: PkgJson, showDev: boolean, showPeer: boolean): string {
  const lines: string[] = ["graph LR"];
  const rootId = "root";
  const rootLabel = `${pkg.name || "project"}@${pkg.version || "0.0.0"}`;
  lines.push(`  ${rootId}["🏠 ${rootLabel}"]`);

  const addDeps = (deps: Record<string, string>, prefix: string, style: string) => {
    Object.entries(deps).forEach(([name, ver]) => {
      const id = `${prefix}_${name.replace(/[@/\-\.]/g, "_")}`;
      const shortVer = ver.replace(/[\^~>=<]/g, "");
      lines.push(`  ${id}["${name}@${shortVer}"]`);
      lines.push(`  ${rootId} --> ${id}`);
    });
  };

  if (pkg.dependencies) {
    lines.push(`  subgraph deps["📦 Dependencies"]`);
    Object.entries(pkg.dependencies).forEach(([name, ver]) => {
      const id = `dep_${name.replace(/[@/\-\.]/g, "_")}`;
      const shortVer = ver.replace(/[\^~>=<]/g, "");
      lines.push(`    ${id}["${name}@${shortVer}"]`);
    });
    lines.push("  end");
    Object.keys(pkg.dependencies).forEach(name => {
      const id = `dep_${name.replace(/[@/\-\.]/g, "_")}`;
      lines.push(`  ${rootId} --> ${id}`);
    });
  }

  if (showDev && pkg.devDependencies) {
    lines.push(`  subgraph devdeps["🔧 Dev Dependencies"]`);
    Object.entries(pkg.devDependencies).forEach(([name, ver]) => {
      const id = `dev_${name.replace(/[@/\-\.]/g, "_")}`;
      const shortVer = ver.replace(/[\^~>=<]/g, "");
      lines.push(`    ${id}["${name}@${shortVer}"]`);
    });
    lines.push("  end");
    Object.keys(pkg.devDependencies).forEach(name => {
      const id = `dev_${name.replace(/[@/\-\.]/g, "_")}`;
      lines.push(`  ${rootId} -.-> ${id}`);
    });
  }

  if (showPeer && pkg.peerDependencies) {
    lines.push(`  subgraph peerdeps["🤝 Peer Dependencies"]`);
    Object.entries(pkg.peerDependencies).forEach(([name, ver]) => {
      const id = `peer_${name.replace(/[@/\-\.]/g, "_")}`;
      const shortVer = ver.replace(/[\^~>=<]/g, "");
      lines.push(`    ${id}["${name}@${shortVer}"]`);
    });
    lines.push("  end");
    Object.keys(pkg.peerDependencies).forEach(name => {
      const id = `peer_${name.replace(/[@/\-\.]/g, "_")}`;
      lines.push(`  ${rootId} -..-> ${id}`);
    });
  }

  lines.push(`  style ${rootId} fill:#6366f1,color:#fff,stroke:#4f46e5`);
  return lines.join("\n");
}

export default function DependencyGraph() {
  const { toast } = useToast();
  const [input, setInput] = useState(JSON.stringify(samplePkg, null, 2));
  const [showDev, setShowDev] = useState(true);
  const [showPeer, setShowPeer] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => {
    try {
      const obj = JSON.parse(input);
      setError("");
      return obj as PkgJson;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, [input]);

  const mermaidCode = useMemo(() => {
    if (!parsed) return "";
    return generateMermaid(parsed, showDev, showPeer);
  }, [parsed, showDev, showPeer]);

  const stats = useMemo(() => {
    if (!parsed) return { deps: 0, dev: 0, peer: 0, total: 0 };
    const deps = Object.keys(parsed.dependencies || {}).length;
    const dev = Object.keys(parsed.devDependencies || {}).length;
    const peer = Object.keys(parsed.peerDependencies || {}).length;
    return { deps, dev, peer, total: deps + dev + peer };
  }, [parsed]);

  useEffect(() => {
    if (!mermaidCode || !diagramRef.current) return;
    mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
    diagramRef.current.innerHTML = "";
    mermaid.render("dep-graph", mermaidCode).then(({ svg }) => {
      if (diagramRef.current) diagramRef.current.innerHTML = svg;
    }).catch(() => {});
  }, [mermaidCode]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copié !" });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitBranch className="h-8 w-8 text-primary" />
          Dependency Graph
        </h1>
        <p className="text-muted-foreground mt-1">
          Visualisez l'arbre de dépendances de votre package.json
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Badge variant="secondary">📦 {stats.deps} deps</Badge>
        <Badge variant="secondary">🔧 {stats.dev} dev</Badge>
        <Badge variant="secondary">🤝 {stats.peer} peer</Badge>
        <Badge variant="outline">Total: {stats.total}</Badge>
        <div className="flex gap-2 ml-auto">
          <Button variant={showDev ? "default" : "outline"} size="sm" onClick={() => setShowDev(!showDev)}>Dev deps</Button>
          <Button variant={showPeer ? "default" : "outline"} size="sm" onClick={() => setShowPeer(!showPeer)}>Peer deps</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              package.json
              <Button variant="ghost" size="sm" onClick={() => setInput(JSON.stringify(samplePkg, null, 2))}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full bg-muted rounded-lg p-4 text-sm font-mono min-h-[400px] resize-y border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graph */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Graphe</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={diagramRef} className="overflow-auto min-h-[350px] flex items-center justify-center" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Code Mermaid
                <Button variant="outline" size="sm" onClick={() => copy(mermaidCode)} disabled={!mermaidCode}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted rounded-lg p-4 text-xs font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                {mermaidCode || "Entrez un package.json valide"}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
