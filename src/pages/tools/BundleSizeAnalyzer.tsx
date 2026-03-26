import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Package, AlertTriangle, ArrowRight, Copy, Download, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface PackageInfo {
  name: string;
  version: string;
  size: number;
  gzip: number;
  category: string;
}

// Base de données simplifiée des tailles de packages populaires (en KB)
const packageSizes: Record<string, { size: number; gzip: number; category: string }> = {
  "react": { size: 6.4, gzip: 2.5, category: "framework" },
  "react-dom": { size: 130, gzip: 42, category: "framework" },
  "lodash": { size: 530, gzip: 72, category: "utility" },
  "moment": { size: 290, gzip: 72, category: "date" },
  "date-fns": { size: 78, gzip: 18, category: "date" },
  "dayjs": { size: 7, gzip: 3, category: "date" },
  "axios": { size: 54, gzip: 14, category: "http" },
  "jquery": { size: 87, gzip: 30, category: "dom" },
  "underscore": { size: 70, gzip: 18, category: "utility" },
  "ramda": { size: 130, gzip: 27, category: "utility" },
  "rxjs": { size: 170, gzip: 42, category: "reactive" },
  "redux": { size: 7.6, gzip: 2.6, category: "state" },
  "mobx": { size: 57, gzip: 16, category: "state" },
  "zustand": { size: 3.3, gzip: 1.1, category: "state" },
  "immer": { size: 16, gzip: 5.5, category: "state" },
  "chart.js": { size: 200, gzip: 65, category: "visualization" },
  "d3": { size: 270, gzip: 80, category: "visualization" },
  "recharts": { size: 450, gzip: 135, category: "visualization" },
  "three": { size: 600, gzip: 150, category: "3d" },
  "firebase": { size: 800, gzip: 200, category: "backend" },
  "@supabase/supabase-js": { size: 150, gzip: 45, category: "backend" },
  "tailwindcss": { size: 30, gzip: 8, category: "css" },
  "styled-components": { size: 43, gzip: 12, category: "css" },
  "@emotion/react": { size: 35, gzip: 11, category: "css" },
  "framer-motion": { size: 150, gzip: 45, category: "animation" },
  "gsap": { size: 60, gzip: 23, category: "animation" },
  "zod": { size: 52, gzip: 12, category: "validation" },
  "yup": { size: 65, gzip: 18, category: "validation" },
  "formik": { size: 45, gzip: 13, category: "forms" },
  "react-hook-form": { size: 25, gzip: 8.5, category: "forms" },
  "@tanstack/react-query": { size: 40, gzip: 13, category: "data-fetching" },
  "swr": { size: 12, gzip: 4, category: "data-fetching" },
  "next": { size: 400, gzip: 120, category: "framework" },
  "express": { size: 60, gzip: 18, category: "backend" },
  "webpack": { size: 300, gzip: 90, category: "bundler" },
  "vite": { size: 15, gzip: 5, category: "bundler" },
  "typescript": { size: 3800, gzip: 900, category: "language" },
  "uuid": { size: 8, gzip: 3, category: "utility" },
  "nanoid": { size: 1.1, gzip: 0.5, category: "utility" },
};

const alternatives: Record<string, { to: string; savings: string }> = {
  "moment": { to: "date-fns ou dayjs", savings: "~200KB" },
  "lodash": { to: "lodash-es + tree-shaking", savings: "~400KB" },
  "axios": { to: "fetch natif", savings: "~54KB" },
  "jquery": { to: "API DOM native", savings: "~87KB" },
  "uuid": { to: "nanoid", savings: "~7KB" },
  "formik": { to: "react-hook-form", savings: "~20KB" },
  "redux": { to: "zustand", savings: "~4KB" },
  "chart.js": { to: "lightweight-charts", savings: "~150KB" },
};

const samplePackageJson = `{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "framer-motion": "^10.16.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}`;

export default function BundleSizeAnalyzer() {
  const [packageJson, setPackageJson] = useState(samplePackageJson);

  const analysis = useMemo(() => {
    try {
      const parsed = JSON.parse(packageJson);
      const deps = { ...parsed.dependencies, ...parsed.devDependencies };
      
      const packages: PackageInfo[] = [];
      let totalSize = 0;
      let totalGzip = 0;
      const suggestions: Array<{ pkg: string; suggestion: string; savings: string }> = [];
      const duplicates: string[] = [];

      Object.entries(deps).forEach(([name, version]) => {
        const cleanName = name.replace(/^@/, "").split("/")[0];
        const info = packageSizes[name] || packageSizes[cleanName];
        
        if (info) {
          packages.push({
            name,
            version: version as string,
            size: info.size,
            gzip: info.gzip,
            category: info.category
          });
          totalSize += info.size;
          totalGzip += info.gzip;

          if (alternatives[name]) {
            suggestions.push({
              pkg: name,
              suggestion: alternatives[name].to,
              savings: alternatives[name].savings
            });
          }
        } else {
          // Estimation pour packages inconnus
          const estimated = 20;
          packages.push({
            name,
            version: version as string,
            size: estimated,
            gzip: estimated * 0.3,
            category: "unknown"
          });
          totalSize += estimated;
          totalGzip += estimated * 0.3;
        }
      });

      // Tri par taille décroissante
      packages.sort((a, b) => b.size - a.size);

      return {
        valid: true,
        packages,
        totalSize,
        totalGzip,
        suggestions,
        duplicates,
        count: packages.length
      };
    } catch (e) {
      return { valid: false, packages: [], totalSize: 0, totalGzip: 0, suggestions: [], duplicates: [], count: 0 };
    }
  }, [packageJson]);

  const formatSize = (kb: number): string => {
    if (kb >= 1000) return `${(kb / 1000).toFixed(1)} MB`;
    return `${kb.toFixed(1)} KB`;
  };

  const getCategoryColor = (cat: string): string => {
    const colors: Record<string, string> = {
      framework: "bg-blue-500/20 text-blue-700",
      utility: "bg-purple-500/20 text-purple-700",
      date: "bg-orange-500/20 text-orange-700",
      state: "bg-green-500/20 text-green-700",
      visualization: "bg-cyan-500/20 text-cyan-700",
      animation: "bg-pink-500/20 text-pink-700",
      css: "bg-yellow-500/20 text-yellow-700",
      validation: "bg-red-500/20 text-red-700",
      forms: "bg-indigo-500/20 text-indigo-700",
      unknown: "bg-gray-500/20 text-gray-700"
    };
    return colors[cat] || colors.unknown;
  };

  const exportReport = () => {
    const report = `# Bundle Size Analysis Report

## Summary
- Total packages: ${analysis.count}
- Total size: ${formatSize(analysis.totalSize)}
- Gzipped: ${formatSize(analysis.totalGzip)}

## Packages by Size

${analysis.packages.map(p => `- **${p.name}** (${p.version}): ${formatSize(p.size)} (gzip: ${formatSize(p.gzip)})`).join("\n")}

## Optimization Suggestions

${analysis.suggestions.map(s => `- Replace **${s.pkg}** with **${s.suggestion}** to save ${s.savings}`).join("\n") || "No suggestions"}
`;
    
    navigator.clipboard.writeText(report);
    toast.success("Rapport copié en Markdown");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          Bundle Size Analyzer
        </h1>
        <p className="text-muted-foreground mt-1">
          Analysez la taille de vos dépendances npm et optimisez votre bundle
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">package.json</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={packageJson}
                onChange={(e) => setPackageJson(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Collez votre package.json ici..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Résumé</CardTitle>
            </CardHeader>
            <CardContent>
              {!analysis.valid ? (
                <p className="text-destructive">JSON invalide</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{analysis.count}</p>
                      <p className="text-xs text-muted-foreground">Packages</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatSize(analysis.totalSize)}</p>
                      <p className="text-xs text-muted-foreground">Taille totale</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{formatSize(analysis.totalGzip)}</p>
                      <p className="text-xs text-muted-foreground">Gzipped</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={exportReport}>
                    <Copy className="h-4 w-4 mr-2" /> Exporter le rapport
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Packages list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Packages par taille</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {analysis.packages.map((pkg, idx) => (
                    <div key={pkg.name} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm truncate">{pkg.name}</span>
                          <Badge className={getCategoryColor(pkg.category)} variant="secondary">
                            {pkg.category}
                          </Badge>
                        </div>
                        <Progress 
                          value={(pkg.size / analysis.totalSize) * 100} 
                          className="h-2 mt-1"
                        />
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium">{formatSize(pkg.size)}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(pkg.gzip)} gz</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <Card className="border-orange-500/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  Suggestions d'optimisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.suggestions.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                      <span className="font-mono text-sm">{s.pkg}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{s.suggestion}</span>
                      <Badge variant="secondary" className="ml-auto">
                        -{s.savings}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
