import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Trash2, FileCode2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolPageLayout } from "@/components/ToolPageLayout";

function formatCSS(css: string, options: { indent: number; sortProperties: boolean; singleLine: boolean }): string {
  if (options.singleLine) {
    return minifyCSS(css);
  }

  const indent = " ".repeat(options.indent);
  let formatted = "";
  let depth = 0;
  let inRule = false;
  let buffer = "";

  // Remove comments and normalize whitespace
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  css = css.replace(/\s+/g, " ").trim();

  for (let i = 0; i < css.length; i++) {
    const char = css[i];

    if (char === "{") {
      formatted += buffer.trim() + " {\n";
      buffer = "";
      depth++;
      inRule = true;
    } else if (char === "}") {
      if (buffer.trim()) {
        const properties = buffer.split(";").filter((p) => p.trim());
        
        if (options.sortProperties) {
          properties.sort((a, b) => a.trim().localeCompare(b.trim()));
        }

        properties.forEach((prop) => {
          if (prop.trim()) {
            formatted += indent.repeat(depth) + prop.trim() + ";\n";
          }
        });
      }
      depth--;
      formatted += indent.repeat(depth) + "}\n\n";
      buffer = "";
      inRule = false;
    } else if (char === ";" && inRule) {
      buffer += ";";
    } else {
      buffer += char;
    }
  }

  return formatted.trim();
}

function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*:\s*/g, ":")
    .replace(/;}/g, "}")
    .trim();
}

function analyzeCSS(css: string) {
  const cleanCSS = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const selectors = cleanCSS.match(/[^{}]+(?=\s*{)/g) || [];
  const properties = cleanCSS.match(/[a-z-]+\s*:/gi) || [];
  const mediaQueries = (cleanCSS.match(/@media[^{]+/g) || []).length;
  const keyframes = (cleanCSS.match(/@keyframes\s+\w+/g) || []).length;
  const variables = (cleanCSS.match(/--[\w-]+/g) || []).length;
  const importStatements = (cleanCSS.match(/@import/g) || []).length;

  const uniqueProperties = [...new Set(properties.map(p => p.replace(/\s*:/, "").toLowerCase()))];

  return {
    selectors: selectors.length,
    properties: properties.length,
    uniqueProperties: uniqueProperties.length,
    mediaQueries,
    keyframes,
    variables,
    imports: importStatements,
    sizeOriginal: css.length,
    sizeMinified: minifyCSS(css).length,
  };
}

export default function CSSFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState("2");
  const [sortProperties, setSortProperties] = useState(false);

  const handleFormat = () => {
    try {
      const formatted = formatCSS(input, {
        indent: parseInt(indentSize),
        sortProperties,
        singleLine: false,
      });
      setOutput(formatted);
      toast.success("CSS formaté !");
    } catch {
      toast.error("Erreur lors du formatage");
    }
  };

  const handleMinify = () => {
    try {
      const minified = minifyCSS(input);
      setOutput(minified);
      toast.success("CSS minifié !");
    } catch {
      toast.error("Erreur lors de la minification");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copié !");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const stats = analyzeCSS(input);

  const sampleCSS = `.container{display:flex;flex-direction:column;gap:16px;padding:20px;}.header{background:#fff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);}.button{background:blue;color:white;padding:10px 20px;border:none;cursor:pointer;}.button:hover{background:darkblue;}@media (max-width: 768px){.container{padding:10px;}.header{padding:12px;}}`;

  return (
    <ToolPageLayout title="CSS Formatter" description="Formatez et minifiez votre code CSS">

      <Tabs defaultValue="format" className="space-y-4">
        <TabsList>
          <TabsTrigger value="format">Formatter</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-6">
          {/* Options */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Label>Indentation :</Label>
                  <Select value={indentSize} onValueChange={setIndentSize}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 esp.</SelectItem>
                      <SelectItem value="4">4 esp.</SelectItem>
                      <SelectItem value="1">1 tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="sort"
                    checked={sortProperties}
                    onCheckedChange={setSortProperties}
                  />
                  <Label htmlFor="sort">Trier les propriétés (A-Z)</Label>
                </div>

                <div className="flex-1" />

                <div className="flex gap-2">
                  <Button onClick={handleFormat}>Formater</Button>
                  <Button variant="secondary" onClick={handleMinify}>Minifier</Button>
                  <Button variant="outline" onClick={handleClear}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editor */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Entrée CSS
                  <Button variant="ghost" size="sm" onClick={() => setInput(sampleCSS)}>
                    Exemple
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Collez votre code CSS ici..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Résultat
                  <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={output}
                  readOnly
                  placeholder="Le CSS formaté apparaîtra ici..."
                  className="min-h-[400px] font-mono text-sm bg-muted"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analyse du CSS
              </CardTitle>
            </CardHeader>
            <CardContent>
              {input ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold">{stats.selectors}</p>
                    <p className="text-sm text-muted-foreground">Sélecteurs</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold">{stats.properties}</p>
                    <p className="text-sm text-muted-foreground">Propriétés</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold">{stats.uniqueProperties}</p>
                    <p className="text-sm text-muted-foreground">Props uniques</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold">{stats.mediaQueries}</p>
                    <p className="text-sm text-muted-foreground">Media Queries</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold">{stats.keyframes}</p>
                    <p className="text-sm text-muted-foreground">@keyframes</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold">{stats.variables}</p>
                    <p className="text-sm text-muted-foreground">Variables CSS</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold">{stats.sizeOriginal}</p>
                    <p className="text-sm text-muted-foreground">Taille (octets)</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-500">{stats.sizeMinified}</p>
                    <p className="text-sm text-muted-foreground">Taille minifiée</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Entrez du CSS pour voir les statistiques
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ToolPageLayout>
  );
}
