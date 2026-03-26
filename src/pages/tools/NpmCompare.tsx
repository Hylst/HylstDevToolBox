import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Layers, Search, ExternalLink, ArrowRight, Download, Calendar, Package, AlertTriangle } from "lucide-react";

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  license: string;
  homepage: string;
  repository: string;
  weeklyDownloads: number;
  dependencies: number;
  devDependencies: number;
  lastPublish: string;
  maintainers: number;
  keywords: string[];
  gzipSize: string;
  loading?: boolean;
  error?: string;
}

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const daysSince = (dateStr: string) => {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days < 30) return `${days}j`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}an`;
};

export default function NpmCompare() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<(PackageInfo | null)[]>([null, null, null]);
  const [inputs, setInputs] = useState(["", "", ""]);
  const [loading, setLoading] = useState([false, false, false]);

  const fetchPackage = async (name: string, index: number) => {
    if (!name.trim()) return;
    const newLoading = [...loading];
    newLoading[index] = true;
    setLoading(newLoading);

    try {
      const res = await fetch(`https://registry.npmjs.org/${name.trim()}`);
      if (!res.ok) throw new Error("Package non trouvé");
      const data = await res.json();
      const latest = data["dist-tags"]?.latest;
      const latestData = data.versions?.[latest] || {};

      // Fetch downloads
      let weeklyDownloads = 0;
      try {
        const dlRes = await fetch(`https://api.npmjs.org/downloads/point/last-week/${name.trim()}`);
        if (dlRes.ok) {
          const dlData = await dlRes.json();
          weeklyDownloads = dlData.downloads || 0;
        }
      } catch {}

      const pkg: PackageInfo = {
        name: data.name,
        version: latest,
        description: data.description || "",
        license: latestData.license || "N/A",
        homepage: data.homepage || "",
        repository: typeof data.repository === "object" ? data.repository.url || "" : data.repository || "",
        weeklyDownloads,
        dependencies: Object.keys(latestData.dependencies || {}).length,
        devDependencies: Object.keys(latestData.devDependencies || {}).length,
        lastPublish: data.time?.[latest] || "",
        maintainers: (data.maintainers || []).length,
        keywords: (data.keywords || []).slice(0, 8),
        gzipSize: latestData.dist?.unpackedSize ? `${(latestData.dist.unpackedSize / 1024).toFixed(0)} KB` : "N/A",
      };

      const newPackages = [...packages];
      newPackages[index] = pkg;
      setPackages(newPackages);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
      const newPackages = [...packages];
      newPackages[index] = null;
      setPackages(newPackages);
    } finally {
      const nl = [...loading];
      nl[index] = false;
      setLoading(nl);
    }
  };

  const activePackages = packages.filter(Boolean) as PackageInfo[];

  const getComparisonClass = (index: number, getValue: (p: PackageInfo) => number, higherIsBetter = true) => {
    if (activePackages.length < 2) return "";
    const values = activePackages.map(getValue);
    const val = packages[index] ? getValue(packages[index]!) : 0;
    const best = higherIsBetter ? Math.max(...values) : Math.min(...values);
    return val === best ? "text-green-500 font-bold" : "";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Layers className="h-8 w-8 text-primary" />
          NPM Package Comparator
        </h1>
        <p className="text-muted-foreground mt-1">
          Comparez jusqu'à 3 packages npm côte à côte — popularité, taille, dépendances
        </p>
      </div>

      {/* Input row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder={`Package ${i + 1} (ex: react)`}
                  value={inputs[i]}
                  onChange={(e) => {
                    const newInputs = [...inputs];
                    newInputs[i] = e.target.value;
                    setInputs(newInputs);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && fetchPackage(inputs[i], i)}
                  className="font-mono text-sm"
                />
                <Button size="icon" onClick={() => fetchPackage(inputs[i], i)} disabled={loading[i]}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison table */}
      {activePackages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparaison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Critère</th>
                    {packages.map((pkg, i) =>
                      pkg ? (
                        <th key={i} className="text-left py-3 px-2 font-medium">
                          <span className="font-mono">{pkg.name}</span>
                        </th>
                      ) : null
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2.5 px-2 text-muted-foreground">Version</td>
                    {packages.map((pkg, i) => pkg && <td key={i} className="py-2.5 px-2 font-mono">{pkg.version}</td>)}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-muted-foreground">Description</td>
                    {packages.map((pkg, i) => pkg && <td key={i} className="py-2.5 px-2 text-xs">{pkg.description.slice(0, 100)}</td>)}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-muted-foreground flex items-center gap-1"><Download className="h-3 w-3" /> Téléchargements/sem</td>
                    {packages.map((pkg, i) => pkg && (
                      <td key={i} className={`py-2.5 px-2 font-mono ${getComparisonClass(i, (p) => p.weeklyDownloads)}`}>
                        {formatNumber(pkg.weeklyDownloads)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-muted-foreground"><Package className="h-3 w-3 inline mr-1" />Dépendances</td>
                    {packages.map((pkg, i) => pkg && (
                      <td key={i} className={`py-2.5 px-2 font-mono ${getComparisonClass(i, (p) => p.dependencies, false)}`}>
                        {pkg.dependencies}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-muted-foreground">Taille (unpacked)</td>
                    {packages.map((pkg, i) => pkg && <td key={i} className="py-2.5 px-2 font-mono">{pkg.gzipSize}</td>)}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-muted-foreground">Licence</td>
                    {packages.map((pkg, i) => pkg && <td key={i} className="py-2.5 px-2"><Badge variant="secondary">{pkg.license}</Badge></td>)}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-muted-foreground"><Calendar className="h-3 w-3 inline mr-1" />Dernière publication</td>
                    {packages.map((pkg, i) => pkg && (
                      <td key={i} className="py-2.5 px-2">
                        {pkg.lastPublish ? (
                          <span className="font-mono">
                            {daysSince(pkg.lastPublish)}
                            {parseInt(daysSince(pkg.lastPublish)) > 365 && <AlertTriangle className="h-3 w-3 inline ml-1 text-yellow-500" />}
                          </span>
                        ) : "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-muted-foreground">Mainteneurs</td>
                    {packages.map((pkg, i) => pkg && <td key={i} className="py-2.5 px-2 font-mono">{pkg.maintainers}</td>)}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-muted-foreground">Keywords</td>
                    {packages.map((pkg, i) => pkg && (
                      <td key={i} className="py-2.5 px-2">
                        <div className="flex flex-wrap gap-1">
                          {pkg.keywords.map((k) => <Badge key={k} variant="outline" className="text-xs">{k}</Badge>)}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-muted-foreground">Liens</td>
                    {packages.map((pkg, i) => pkg && (
                      <td key={i} className="py-2.5 px-2">
                        <div className="flex gap-2">
                          <a href={`https://www.npmjs.com/package/${pkg.name}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                            npm <ExternalLink className="h-3 w-3" />
                          </a>
                          {pkg.homepage && (
                            <a href={pkg.homepage} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                              site <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activePackages.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Layers className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Entrez des noms de packages pour commencer</p>
            <p className="text-sm mt-1">Les données sont récupérées depuis le registre npm public</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
