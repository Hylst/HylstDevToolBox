import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle } from "lucide-react";

const bundleSizes: Record<string, number> = { react: 42, "react-dom": 130, lodash: 72, moment: 290, axios: 14, "date-fns": 20, dayjs: 3 };
const alternatives: Record<string, string> = { moment: "date-fns ou dayjs", lodash: "lodash-es", axios: "fetch natif" };

export default function PackageAnalyzer() {
  const [input, setInput] = useState(`{\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "lodash": "^4.17.21"\n  },\n  "devDependencies": {\n    "typescript": "^5.0.0"\n  }\n}`);
  
  const analysis = useMemo(() => {
    try {
      const pkg = JSON.parse(input);
      const deps = Object.entries(pkg.dependencies || {}) as [string, string][];
      const devDeps = Object.entries(pkg.devDependencies || {}) as [string, string][];
      const totalSize = deps.reduce((sum, [name]) => sum + (bundleSizes[name] || 10), 0);
      return { valid: true, deps, devDeps, totalSize };
    } catch { return { valid: false, deps: [], devDeps: [], totalSize: 0 }; }
  }, [input]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Package className="h-8 w-8 text-primary" />Package Analyzer</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>package.json</CardTitle></CardHeader><CardContent>
          <Textarea value={input} onChange={e => setInput(e.target.value)} rows={15} className="font-mono text-sm" />
        </CardContent></Card>
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Analyse</CardTitle></CardHeader><CardContent>
            {!analysis.valid ? <p className="text-destructive">JSON invalide</p> : (
              <div className="space-y-4">
                <div className="flex gap-4"><Badge variant="outline">{analysis.deps.length} deps</Badge><Badge variant="outline">{analysis.devDeps.length} devDeps</Badge><Badge>~{analysis.totalSize} KB</Badge></div>
                {analysis.deps.filter(([name]) => alternatives[name]).map(([name]) => (
                  <div key={name} className="flex items-center gap-2 text-yellow-500"><AlertTriangle className="h-4 w-4" /><span className="text-sm">{name}: considérez {alternatives[name]}</span></div>
                ))}
              </div>
            )}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Dépendances</CardTitle></CardHeader><CardContent>
            <div className="space-y-2">{analysis.deps.map(([name, version]) => (
              <div key={name} className="flex justify-between text-sm"><span className="font-mono">{name}</span><Badge variant="secondary">{version as string}</Badge></div>
            ))}</div>
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}
