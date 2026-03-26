import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/Tooltip";
import { 
  Copy, 
  Download, 
  RotateCcw, 
  FileText, 
  ArrowLeftRight,
  Eye,
  FileCode,
  Settings2,
  TrendingUp,
  Save,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type DiffMode = "line" | "word" | "char";
type ViewMode = "split" | "unified";

interface DiffLine {
  type: "added" | "removed" | "unchanged" | "modified";
  oldLineNum?: number;
  newLineNum?: number;
  oldContent: string;
  newContent: string;
  changes?: Array<{ type: "added" | "removed" | "unchanged"; text: string }>;
}

interface DiffStats {
  linesAdded: number;
  linesRemoved: number;
  linesModified: number;
  linesUnchanged: number;
  charsAdded: number;
  charsRemoved: number;
  similarity: number;
}

const DiffViewer = () => {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [diffMode, setDiffMode] = useState<DiffMode>("line");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [syntaxHighlight, setSyntaxHighlight] = useState(false);
  const { toast } = useToast();

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("diffviewer-data");
    if (saved) {
      try {
        const { oldText: o, newText: n } = JSON.parse(saved);
        setOldText(o || "");
        setNewText(n || "");
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(
        "diffviewer-data",
        JSON.stringify({ oldText, newText })
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [oldText, newText]);

  const processText = (text: string): string => {
    let processed = text;
    if (ignoreWhitespace) {
      processed = processed.replace(/\s+/g, " ").trim();
    }
    if (ignoreCase) {
      processed = processed.toLowerCase();
    }
    return processed;
  };

  const computeLineDiff = (
    oldLines: string[],
    newLines: string[]
  ): DiffLine[] => {
    const result: DiffLine[] = [];
    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      const oldLine = oldLines[oldIndex];
      const newLine = newLines[newIndex];

      if (oldIndex >= oldLines.length) {
        // Rest are additions
        result.push({
          type: "added",
          newLineNum: newIndex + 1,
          oldContent: "",
          newContent: newLines[newIndex],
        });
        newIndex++;
      } else if (newIndex >= newLines.length) {
        // Rest are deletions
        result.push({
          type: "removed",
          oldLineNum: oldIndex + 1,
          oldContent: oldLines[oldIndex],
          newContent: "",
        });
        oldIndex++;
      } else if (processText(oldLine) === processText(newLine)) {
        // Lines are the same
        result.push({
          type: "unchanged",
          oldLineNum: oldIndex + 1,
          newLineNum: newIndex + 1,
          oldContent: oldLines[oldIndex],
          newContent: newLines[newIndex],
        });
        oldIndex++;
        newIndex++;
      } else {
        // Look ahead to see if this is a modification or add/remove
        const oldInNew = newLines
          .slice(newIndex)
          .findIndex((l) => processText(l) === processText(oldLine));
        const newInOld = oldLines
          .slice(oldIndex)
          .findIndex((l) => processText(l) === processText(newLine));

        if (oldInNew === -1 && newInOld === -1) {
          // Modified line
          result.push({
            type: "modified",
            oldLineNum: oldIndex + 1,
            newLineNum: newIndex + 1,
            oldContent: oldLines[oldIndex],
            newContent: newLines[newIndex],
            changes: computeInlineDiff(oldLines[oldIndex], newLines[newIndex]),
          });
          oldIndex++;
          newIndex++;
        } else if (oldInNew !== -1 && (newInOld === -1 || oldInNew < newInOld)) {
          // Line removed
          result.push({
            type: "removed",
            oldLineNum: oldIndex + 1,
            oldContent: oldLines[oldIndex],
            newContent: "",
          });
          oldIndex++;
        } else {
          // Line added
          result.push({
            type: "added",
            newLineNum: newIndex + 1,
            oldContent: "",
            newContent: newLines[newIndex],
          });
          newIndex++;
        }
      }
    }

    return result;
  };

  const computeInlineDiff = (
    oldText: string,
    newText: string
  ): Array<{ type: "added" | "removed" | "unchanged"; text: string }> => {
    const result: Array<{
      type: "added" | "removed" | "unchanged";
      text: string;
    }> = [];

    if (diffMode === "char") {
      let i = 0;
      let j = 0;
      while (i < oldText.length || j < newText.length) {
        if (i >= oldText.length) {
          result.push({ type: "added", text: newText[j] });
          j++;
        } else if (j >= newText.length) {
          result.push({ type: "removed", text: oldText[i] });
          i++;
        } else if (oldText[i] === newText[j]) {
          result.push({ type: "unchanged", text: oldText[i] });
          i++;
          j++;
        } else {
          result.push({ type: "removed", text: oldText[i] });
          result.push({ type: "added", text: newText[j] });
          i++;
          j++;
        }
      }
    } else if (diffMode === "word") {
      const oldWords = oldText.split(/(\s+)/);
      const newWords = newText.split(/(\s+)/);
      let i = 0;
      let j = 0;

      while (i < oldWords.length || j < newWords.length) {
        if (i >= oldWords.length) {
          result.push({ type: "added", text: newWords[j] });
          j++;
        } else if (j >= newWords.length) {
          result.push({ type: "removed", text: oldWords[i] });
          i++;
        } else if (oldWords[i] === newWords[j]) {
          result.push({ type: "unchanged", text: oldWords[i] });
          i++;
          j++;
        } else {
          result.push({ type: "removed", text: oldWords[i] });
          result.push({ type: "added", text: newWords[j] });
          i++;
          j++;
        }
      }
    }

    return result;
  };

  const diff = useMemo(() => {
    const oldLines = oldText.split("\n");
    const newLines = newText.split("\n");
    return computeLineDiff(oldLines, newLines);
  }, [oldText, newText, diffMode, ignoreWhitespace, ignoreCase]);

  const stats: DiffStats = useMemo(() => {
    const linesAdded = diff.filter((d) => d.type === "added").length;
    const linesRemoved = diff.filter((d) => d.type === "removed").length;
    const linesModified = diff.filter((d) => d.type === "modified").length;
    const linesUnchanged = diff.filter((d) => d.type === "unchanged").length;

    const charsAdded = diff
      .filter((d) => d.type === "added")
      .reduce((sum, d) => sum + d.newContent.length, 0);
    const charsRemoved = diff
      .filter((d) => d.type === "removed")
      .reduce((sum, d) => sum + d.oldContent.length, 0);

    const totalLines = Math.max(
      oldText.split("\n").length,
      newText.split("\n").length
    );
    const similarity =
      totalLines > 0 ? (linesUnchanged / totalLines) * 100 : 100;

    return {
      linesAdded,
      linesRemoved,
      linesModified,
      linesUnchanged,
      charsAdded,
      charsRemoved,
      similarity,
    };
  }, [diff, oldText, newText]);

  const handleCopy = () => {
    const diffText = diff
      .map((line) => {
        if (line.type === "added") return `+ ${line.newContent}`;
        if (line.type === "removed") return `- ${line.oldContent}`;
        if (line.type === "modified")
          return `! ${line.oldContent} → ${line.newContent}`;
        return `  ${line.oldContent}`;
      })
      .join("\n");

    navigator.clipboard.writeText(diffText);
    toast({ title: "Copié !", description: "Diff copié dans le presse-papier" });
  };

  const handleExport = () => {
    const diffText = diff
      .map((line) => {
        if (line.type === "added") return `+ ${line.newContent}`;
        if (line.type === "removed") return `- ${line.oldContent}`;
        if (line.type === "modified")
          return `! Old: ${line.oldContent}\n! New: ${line.newContent}`;
        return `  ${line.oldContent}`;
      })
      .join("\n");

    const blob = new Blob([diffText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diff-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Exporté !", description: "Fichier téléchargé" });
  };

  const handleReset = () => {
    setOldText("");
    setNewText("");
    toast({ title: "Réinitialisé", description: "Textes effacés" });
  };

  const loadExample = () => {
    setOldText(`function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`);

    setNewText(`function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`);

    toast({ title: "Exemple chargé", description: "Code JavaScript chargé" });
  };

  const renderDiffLine = (line: DiffLine, index: number) => {
    const bgColor =
      line.type === "added"
        ? "bg-green-500/10 border-l-4 border-green-500"
        : line.type === "removed"
        ? "bg-red-500/10 border-l-4 border-red-500"
        : line.type === "modified"
        ? "bg-yellow-500/10 border-l-4 border-yellow-500"
        : "bg-transparent";

    if (viewMode === "split") {
      return (
        <div key={index} className="grid grid-cols-2 gap-2 text-sm font-mono">
          {/* Old side */}
          <div className={`flex ${line.type === "added" ? "opacity-30" : ""}`}>
            {showLineNumbers && (
              <span className="w-12 text-right pr-2 text-muted-foreground select-none">
                {line.oldLineNum || ""}
              </span>
            )}
            <div
              className={`flex-1 px-2 py-1 ${
                line.type === "removed" || line.type === "modified"
                  ? bgColor
                  : ""
              }`}
            >
              {line.type === "modified" && line.changes && diffMode !== "line" ? (
                <span>
                  {line.changes
                    .filter((c) => c.type !== "added")
                    .map((change, i) => (
                      <span
                        key={i}
                        className={
                          change.type === "removed"
                            ? "bg-red-500/30 text-red-900 dark:text-red-100"
                            : ""
                        }
                      >
                        {change.text}
                      </span>
                    ))}
                </span>
              ) : (
                line.oldContent
              )}
            </div>
          </div>

          {/* New side */}
          <div className={`flex ${line.type === "removed" ? "opacity-30" : ""}`}>
            {showLineNumbers && (
              <span className="w-12 text-right pr-2 text-muted-foreground select-none">
                {line.newLineNum || ""}
              </span>
            )}
            <div
              className={`flex-1 px-2 py-1 ${
                line.type === "added" || line.type === "modified" ? bgColor : ""
              }`}
            >
              {line.type === "modified" && line.changes && diffMode !== "line" ? (
                <span>
                  {line.changes
                    .filter((c) => c.type !== "removed")
                    .map((change, i) => (
                      <span
                        key={i}
                        className={
                          change.type === "added"
                            ? "bg-green-500/30 text-green-900 dark:text-green-100"
                            : ""
                        }
                      >
                        {change.text}
                      </span>
                    ))}
                </span>
              ) : (
                line.newContent
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // Unified view
      return (
        <div key={index} className={`flex text-sm font-mono ${bgColor}`}>
          {showLineNumbers && (
            <>
              <span className="w-12 text-right pr-2 text-muted-foreground select-none">
                {line.oldLineNum || ""}
              </span>
              <span className="w-12 text-right pr-2 text-muted-foreground select-none">
                {line.newLineNum || ""}
              </span>
            </>
          )}
          <span className="w-6 text-center select-none">
            {line.type === "added"
              ? "+"
              : line.type === "removed"
              ? "-"
              : line.type === "modified"
              ? "~"
              : " "}
          </span>
          <div className="flex-1 px-2 py-1">
            {line.type === "modified" ? (
              <>
                <div className="text-red-600 dark:text-red-400">
                  - {line.oldContent}
                </div>
                <div className="text-green-600 dark:text-green-400">
                  + {line.newContent}
                </div>
              </>
            ) : line.type === "added" ? (
              <span className="text-green-600 dark:text-green-400">
                {line.newContent}
              </span>
            ) : line.type === "removed" ? (
              <span className="text-red-600 dark:text-red-400">
                {line.oldContent}
              </span>
            ) : (
              line.oldContent
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <ToolPageLayout title="Comparateur de Texte Avancé" description="Comparez deux versions de texte avec visualisation détaillée des différences.">

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={handleCopy} variant="outline" size="sm">
          <Copy className="w-4 h-4 mr-2" />
          Copier Diff
        </Button>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </Button>
        <Button onClick={handleReset} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
        <Button onClick={loadExample} variant="outline" size="sm">
          <FileCode className="w-4 h-4 mr-2" />
          Charger Exemple
        </Button>
      </div>

      {/* Statistics */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5" />
          <h3 className="font-semibold">Statistiques</h3>
          <Badge variant="outline" className="ml-auto">
            {stats.linesAdded + stats.linesRemoved + stats.linesModified} changements
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">+{stats.linesAdded}</div>
            <div className="text-xs text-muted-foreground">Ajoutées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">-{stats.linesRemoved}</div>
            <div className="text-xs text-muted-foreground">Supprimées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">~{stats.linesModified}</div>
            <div className="text-xs text-muted-foreground">Modifiées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{stats.linesUnchanged}</div>
            <div className="text-xs text-muted-foreground">Inchangées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.similarity.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Similarité</div>
          </div>
        </div>
      </Card>

      {/* Settings Accordion */}
      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="settings">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Options de Comparaison
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              <div>
                <Label className="mb-2 block">
                  <Tooltip term="Mode de comparaison">
                    Définit le niveau de granularité de la comparaison
                  </Tooltip>
                  Mode de Diff
                </Label>
                <Select
                  value={diffMode}
                  onValueChange={(v) => setDiffMode(v as DiffMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Par ligne</SelectItem>
                    <SelectItem value="word">Par mot</SelectItem>
                    <SelectItem value="char">Par caractère</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Mode d'Affichage</Label>
                <Select
                  value={viewMode}
                  onValueChange={(v) => setViewMode(v as ViewMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">Côte à côte</SelectItem>
                    <SelectItem value="unified">Unifié</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="whitespace" className="text-sm">
                    Ignorer espaces
                  </Label>
                  <Switch
                    id="whitespace"
                    checked={ignoreWhitespace}
                    onCheckedChange={setIgnoreWhitespace}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="case" className="text-sm">
                    Ignorer casse
                  </Label>
                  <Switch
                    id="case"
                    checked={ignoreCase}
                    onCheckedChange={setIgnoreCase}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="linenum" className="text-sm">
                    Numéros de ligne
                  </Label>
                  <Switch
                    id="linenum"
                    checked={showLineNumbers}
                    onCheckedChange={setShowLineNumbers}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card
          className="p-4"
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("ring-2", "ring-primary"); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-primary");
            const file = e.dataTransfer.files[0];
            if (file) { const r = new FileReader(); r.onload = (ev) => setOldText(ev.target?.result as string || ""); r.readAsText(file); }
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <Label className="font-semibold">Texte Original</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{oldText.split("\n").length} lignes</Badge>
              <input id="file-old" type="file" className="hidden" accept=".txt,.js,.ts,.tsx,.jsx,.css,.html,.json,.md,.xml,.yaml,.yml,.sql"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setOldText(ev.target?.result as string || ""); r.readAsText(f); } }} />
              <Button size="sm" variant="ghost" onClick={() => document.getElementById("file-old")?.click()}>
                <Upload className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Textarea
            value={oldText}
            onChange={(e) => setOldText(e.target.value)}
            placeholder="Collez ou glissez-déposez un fichier ici..."
            className="font-mono text-sm min-h-[200px]"
          />
        </Card>

        <Card
          className="p-4"
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("ring-2", "ring-primary"); }}
          onDragLeave={(e) => { e.currentTarget.classList.remove("ring-2", "ring-primary"); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-primary");
            const file = e.dataTransfer.files[0];
            if (file) { const r = new FileReader(); r.onload = (ev) => setNewText(ev.target?.result as string || ""); r.readAsText(file); }
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <Label className="font-semibold">Texte Modifié</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{newText.split("\n").length} lignes</Badge>
              <input id="file-new" type="file" className="hidden" accept=".txt,.js,.ts,.tsx,.jsx,.css,.html,.json,.md,.xml,.yaml,.yml,.sql"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setNewText(ev.target?.result as string || ""); r.readAsText(f); } }} />
              <Button size="sm" variant="ghost" onClick={() => document.getElementById("file-new")?.click()}>
                <Upload className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Collez ou glissez-déposez un fichier ici..."
            className="font-mono text-sm min-h-[200px]"
          />
        </Card>
      </div>

      {/* Diff Display */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Résultat de la Comparaison
          </h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-green-600">
              +{stats.linesAdded}
            </Badge>
            <Badge variant="outline" className="text-red-600">
              -{stats.linesRemoved}
            </Badge>
            <Badge variant="outline" className="text-yellow-600">
              ~{stats.linesModified}
            </Badge>
          </div>
        </div>

        {diff.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Entrez du texte pour voir les différences</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-auto max-h-[600px] bg-muted/30">
            {viewMode === "split" && (
              <div className="grid grid-cols-2 gap-2 border-b p-2 bg-background sticky top-0 z-10">
                <div className="font-semibold text-sm">Original</div>
                <div className="font-semibold text-sm">Modifié</div>
              </div>
            )}
            <div className="p-2">{diff.map(renderDiffLine)}</div>
          </div>
        )}
      </Card>

      {/* Legend */}
      <Card className="p-4 mt-6">
        <h4 className="font-semibold mb-3">Légende</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/20 border-l-4 border-green-500"></div>
            <span>Ligne ajoutée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 border-l-4 border-red-500"></div>
            <span>Ligne supprimée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/20 border-l-4 border-yellow-500"></div>
            <span>Ligne modifiée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-transparent border"></div>
            <span>Ligne inchangée</span>
          </div>
        </div>
      </Card>
    </ToolPageLayout>
  );
};

export default DiffViewer;