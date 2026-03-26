import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip } from "@/components/Tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Code, FileJson, GitCompare, Copy, MousePointer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToolPageLayout } from "@/components/ToolPageLayout";

// JSON diff helper
function jsonDiff(a: any, b: any, path = ""): { path: string; type: "added" | "removed" | "changed"; oldVal?: any; newVal?: any }[] {
  const diffs: { path: string; type: "added" | "removed" | "changed"; oldVal?: any; newVal?: any }[] = [];
  
  if (a === b) return diffs;
  if (a === undefined) { diffs.push({ path, type: "added", newVal: b }); return diffs; }
  if (b === undefined) { diffs.push({ path, type: "removed", oldVal: a }); return diffs; }
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
    diffs.push({ path, type: "changed", oldVal: a, newVal: b });
    return diffs;
  }
  if (typeof a === "object" && a !== null) {
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of allKeys) {
      const childPath = path ? `${path}.${key}` : key;
      diffs.push(...jsonDiff(a[key], b[key], childPath));
    }
    return diffs;
  }
  if (a !== b) diffs.push({ path, type: "changed", oldVal: a, newVal: b });
  return diffs;
}

// Render JSON tree with clickable paths
function JsonTree({ data, path = "$", onPathClick }: { data: any; path?: string; onPathClick: (p: string) => void }) {
  if (data === null) return <span className="text-muted-foreground">null</span>;
  if (typeof data === "boolean") return <span className="text-primary">{data.toString()}</span>;
  if (typeof data === "number") return <span className="text-primary">{data}</span>;
  if (typeof data === "string") return <span className="text-green-600 dark:text-green-400">"{data}"</span>;
  
  if (Array.isArray(data)) {
    return (
      <span>
        {"["}
        <div className="ml-4">
          {data.map((item, i) => (
            <div key={i} className="group/tree">
              <button onClick={() => onPathClick(`${path}[${i}]`)} className="text-muted-foreground hover:text-primary text-xs mr-1 opacity-0 group-hover/tree:opacity-100">
                <MousePointer className="h-3 w-3 inline" />
              </button>
              <JsonTree data={item} path={`${path}[${i}]`} onPathClick={onPathClick} />
              {i < data.length - 1 && ","}
            </div>
          ))}
        </div>
        {"]"}
      </span>
    );
  }
  
  if (typeof data === "object") {
    const entries = Object.entries(data);
    return (
      <span>
        {"{"}
        <div className="ml-4">
          {entries.map(([key, value], i) => (
            <div key={key} className="group/tree">
              <button onClick={() => onPathClick(`${path}.${key}`)} className="text-muted-foreground hover:text-primary text-xs mr-1 opacity-0 group-hover/tree:opacity-100">
                <MousePointer className="h-3 w-3 inline" />
              </button>
              <span className="text-primary font-medium">"{key}"</span>: <JsonTree data={value} path={`${path}.${key}`} onPathClick={onPathClick} />
              {i < entries.length - 1 && ","}
            </div>
          ))}
        </div>
        {"}"}
      </span>
    );
  }
  return null;
}

export default function JsonValidator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [diffs, setDiffs] = useState<ReturnType<typeof jsonDiff>>([]);
  const [compareError, setCompareError] = useState("");
  const { toast } = useToast();

  const validateJson = () => {
    setError("");
    setIsValid(null);
    try {
      const parsed = JSON.parse(input);
      setIsValid(true);
      setOutput(JSON.stringify(parsed, null, 2));
      toast({ title: "JSON valide !", description: "Votre JSON est correctement formaté" });
    } catch (e: any) {
      setIsValid(false);
      setError(e.message);
      setOutput("");
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setIsValid(true);
      setError("");
      toast({ title: "JSON minifié !" });
    } catch (e: any) { setIsValid(false); setError(e.message); }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setIsValid(true);
      setError("");
    } catch (e: any) { setIsValid(false); setError(e.message); }
  };

  const jsonToYaml = () => {
    try {
      const parsed = JSON.parse(input);
      const yaml = convertToYaml(parsed);
      setOutput(yaml);
      setIsValid(true);
      setError("");
      toast({ title: "Converti en YAML !" });
    } catch (e: any) { setIsValid(false); setError(e.message); }
  };

  const convertToYaml = (obj: any, indent = 0): string => {
    let yaml = "";
    const spaces = "  ".repeat(indent);
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          yaml += `${spaces}-\n${convertToYaml(item, indent + 1)}`;
        } else {
          yaml += `${spaces}- ${item}\n`;
        }
      });
    } else if (typeof obj === "object" && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          yaml += `${spaces}${key}:\n${convertToYaml(value, indent + 1)}`;
        } else {
          yaml += `${spaces}${key}: ${value}\n`;
        }
      });
    }
    return yaml;
  };

  const compareJsons = () => {
    setCompareError("");
    try {
      const a = JSON.parse(compareA);
      const b = JSON.parse(compareB);
      const d = jsonDiff(a, b);
      setDiffs(d);
      if (d.length === 0) toast({ title: "Identiques !", description: "Les deux JSON sont identiques" });
      else toast({ title: `${d.length} différence(s) trouvée(s)` });
    } catch (e: any) {
      setCompareError(e.message);
    }
  };

  const handlePathClick = (path: string) => {
    navigator.clipboard.writeText(path);
    toast({ title: "Path copié !", description: path });
  };

  let parsedInput: any = null;
  try { parsedInput = JSON.parse(input); } catch {}

  return (
    <ToolPageLayout title="JSON/YAML Pro" description="Validez, formatez, comparez et explorez vos données JSON">

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">Éditeur</TabsTrigger>
          <TabsTrigger value="tree">Arbre</TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-1"><GitCompare className="h-3 w-3" /> Comparateur</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Entrée
                  <Tooltip term="json">JSON (JavaScript Object Notation) est un format d'échange de données</Tooltip>
                </CardTitle>
                <CardDescription>Collez votre JSON ici</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea placeholder='{"name": "John", "age": 30}' value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[400px] font-mono text-sm" />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={validateJson}><CheckCircle2 className="h-4 w-4 mr-2" /> Valider</Button>
                  <Button onClick={formatJson} variant="outline"><Code className="h-4 w-4 mr-2" /> Formatter</Button>
                  <Button onClick={minifyJson} variant="outline">Minifier</Button>
                  <Button onClick={jsonToYaml} variant="outline">→ YAML</Button>
                </div>
                {isValid !== null && (
                  <div className={`flex items-center gap-2 ${isValid ? "text-green-600" : "text-destructive"}`}>
                    {isValid ? <><CheckCircle2 className="h-5 w-5" /><span className="font-medium">JSON valide !</span></> : <><XCircle className="h-5 w-5" /><span className="font-medium">JSON invalide</span></>}
                  </div>
                )}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive font-mono">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Sortie</CardTitle><CardDescription>Résultat formaté</CardDescription></CardHeader>
              <CardContent>
                <Textarea value={output} readOnly className="min-h-[400px] font-mono text-sm" placeholder="Le résultat apparaîtra ici..." />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tree">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" /> Arbre JSON
                <span className="text-sm font-normal text-muted-foreground">— Cliquez sur un nœud pour copier son path</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parsedInput ? (
                <pre className="font-mono text-sm overflow-auto max-h-[600px] p-4 bg-muted/30 rounded-lg">
                  <JsonTree data={parsedInput} onPathClick={handlePathClick} />
                </pre>
              ) : (
                <p className="text-muted-foreground text-center py-12">Entrez du JSON valide dans l'onglet Éditeur pour voir l'arbre</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <div className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-sm">JSON A (original)</CardTitle></CardHeader>
                <CardContent>
                  <Textarea value={compareA} onChange={e => setCompareA(e.target.value)} className="min-h-[300px] font-mono text-sm" placeholder='{"name": "Alice", "age": 28}' />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">JSON B (modifié)</CardTitle></CardHeader>
                <CardContent>
                  <Textarea value={compareB} onChange={e => setCompareB(e.target.value)} className="min-h-[300px] font-mono text-sm" placeholder='{"name": "Alice", "age": 29, "city": "Paris"}' />
                </CardContent>
              </Card>
            </div>

            <Button onClick={compareJsons} className="w-full"><GitCompare className="h-4 w-4 mr-2" /> Comparer</Button>

            {compareError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-mono">{compareError}</p>
              </div>
            )}

            {diffs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Différences
                    <Badge>{diffs.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {diffs.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded border text-sm font-mono">
                        <Badge variant={d.type === "added" ? "default" : d.type === "removed" ? "destructive" : "secondary"} className="text-xs shrink-0">
                          {d.type === "added" ? "+" : d.type === "removed" ? "−" : "~"}
                        </Badge>
                        <button onClick={() => handlePathClick(d.path)} className="text-primary hover:underline cursor-pointer shrink-0">{d.path}</button>
                        <div className="text-muted-foreground">
                          {d.type === "changed" && <><span className="line-through text-destructive">{JSON.stringify(d.oldVal)}</span> → <span className="text-green-600">{JSON.stringify(d.newVal)}</span></>}
                          {d.type === "added" && <span className="text-green-600">{JSON.stringify(d.newVal)}</span>}
                          {d.type === "removed" && <span className="text-destructive line-through">{JSON.stringify(d.oldVal)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </ToolPageLayout>
  );
}
