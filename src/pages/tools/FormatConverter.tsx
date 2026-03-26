import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Copy, Download, Upload, Sparkles, FileJson, Table as TableIcon, Eye, EyeOff, History, Trash2, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Format,
  FORMAT_LABELS,
  FORMAT_EXTENSIONS,
  EXAMPLE_DATA,
  detectFormat,
  parseData,
  generateData,
  validateInput,
  loadHistory,
  saveToHistory,
  clearHistory,
  ConversionHistoryEntry,
} from "@/lib/format-converter-utils";

const ALL_FORMATS: Format[] = ['csv', 'json', 'tsv', 'markdown', 'yaml', 'xml', 'sql'];

// --- Sub-components ---

function FormatSelector({ value, onChange }: { value: Format; onChange: (f: Format) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ALL_FORMATS.map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            value === f
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          {FORMAT_LABELS[f]}
        </button>
      ))}
    </div>
  );
}

function ValidationBadge({ validation }: { validation: { valid: boolean; error?: string; line?: number } }) {
  if (validation.valid) {
    return (
      <Badge variant="outline" className="gap-1 border-green-500/30 text-green-600 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        Valide
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 border-destructive/30 text-destructive max-w-xs truncate">
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span className="truncate">{validation.line ? `L${validation.line}: ` : ''}{validation.error}</span>
    </Badge>
  );
}

function HistoryPanel({ history, onReplay, onClear }: {
  history: ConversionHistoryEntry[];
  onReplay: (entry: ConversionHistoryEntry) => void;
  onClear: () => void;
}) {
  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Aucune conversion récente
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{history.length} conversion(s)</span>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive gap-1">
          <Trash2 className="h-3 w-3" /> Vider
        </Button>
      </div>
      <ScrollArea className="max-h-[300px]">
        <div className="space-y-2 pr-2">
          {history.map(entry => (
            <div key={entry.id} className="rounded-lg border p-3 hover:bg-accent/50 transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{FORMAT_LABELS[entry.inputFormat]}</Badge>
                  <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="secondary" className="text-[10px]">{FORMAT_LABELS[entry.outputFormat]}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReplay(entry)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 h-7"
                >
                  <RotateCcw className="h-3 w-3" /> Rejouer
                </Button>
              </div>
              <p className="text-xs text-muted-foreground truncate font-mono">{entry.inputPreview}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(entry.timestamp).toLocaleString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// --- Main component ---

export default function FormatConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [inputFormat, setInputFormat] = useState<Format>('csv');
  const [outputFormat, setOutputFormat] = useState<Format>('json');
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState<ConversionHistoryEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const handleInputChange = useCallback((text: string) => {
    setInput(text);
    const detected = detectFormat(text);
    if (detected) setInputFormat(detected);
  }, []);

  const validation = useMemo(() => {
    if (!input.trim()) return { valid: true };
    return validateInput(input, inputFormat);
  }, [input, inputFormat]);

  const previewData = useMemo(() => {
    if (!input.trim()) return [];
    try { return parseData(input, inputFormat); } catch { return []; }
  }, [input, inputFormat]);

  const previewHeaders = useMemo(() => {
    return previewData.length > 0 ? Object.keys(previewData[0]) : [];
  }, [previewData]);

  const convert = useCallback(() => {
    if (!input.trim()) return;
    try {
      const data = parseData(input, inputFormat);
      if (!data.length) {
        toast.error("Impossible de parser les données d'entrée");
        return;
      }
      const result = generateData(data, outputFormat);
      setOutput(result);
      const updated = saveToHistory({
        inputFormat,
        outputFormat,
        input,
        output: result,
        inputPreview: input.slice(0, 80),
        outputPreview: result.slice(0, 80),
      });
      setHistory(updated);
      toast.success(`Converti de ${FORMAT_LABELS[inputFormat]} vers ${FORMAT_LABELS[outputFormat]}`);
    } catch (e: any) {
      toast.error(e.message || "Erreur de conversion");
    }
  }, [input, inputFormat, outputFormat]);

  const swapFormats = useCallback(() => {
    setInputFormat(outputFormat);
    setOutputFormat(inputFormat);
    setInput(output);
    setOutput(input);
  }, [input, output, inputFormat, outputFormat]);

  const handleReplay = useCallback((entry: ConversionHistoryEntry) => {
    setInput(entry.input);
    setOutput(entry.output);
    setInputFormat(entry.inputFormat);
    setOutputFormat(entry.outputFormat);
    setShowHistory(false);
    toast.success("Conversion restaurée");
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
    toast.success("Historique vidé");
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }, []);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleInputChange(text);
      toast.success(`Fichier "${file.name}" importé`);
    };
    reader.readAsText(file);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copié dans le presse-papiers");
  };

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${FORMAT_EXTENSIONS[outputFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <ArrowLeftRight className="h-8 w-8 text-primary" />
            Convertisseur de Formats
          </h1>
          <p className="text-muted-foreground">
            Convertissez entre CSV, JSON, TSV, Markdown, YAML, XML et SQL — avec auto-détection, validation et historique
          </p>
        </div>
        <Button
          variant={showHistory ? "default" : "outline"}
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="gap-1 shrink-0"
        >
          <History className="h-4 w-4" />
          Historique
          {history.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 flex items-center justify-center text-[10px]">
              {history.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* History panel */}
      {showHistory && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Conversions récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HistoryPanel history={history} onReplay={handleReplay} onClear={handleClearHistory} />
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Source</CardTitle>
                <CardDescription>Collez, tapez ou glissez un fichier</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setInput(EXAMPLE_DATA[inputFormat]); }} variant="outline" size="sm">
                  Exemple
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
                <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.json,.tsv,.md,.yaml,.yml,.xml,.sql,.txt"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <FormatSelector value={inputFormat} onChange={setInputFormat} />
            <div
              className={`relative rounded-lg transition-colors ${isDragging ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              {isDragging && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 rounded-lg border-2 border-dashed border-primary">
                  <p className="text-primary font-medium">Déposer le fichier ici</p>
                </div>
              )}
              <Textarea
                placeholder={`Collez vos données ${FORMAT_LABELS[inputFormat]} ici ou glissez un fichier...`}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`min-h-[300px] font-mono text-sm resize-none ${
                  input.trim() && !validation.valid
                    ? 'border-destructive focus-visible:ring-destructive/50'
                    : ''
                }`}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{input.length} car.</Badge>
              {input && (
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Détecté : {FORMAT_LABELS[inputFormat]}
                </Badge>
              )}
              {input.trim() && <ValidationBadge validation={validation} />}
              {previewData.length > 0 && (
                <Button variant="ghost" size="sm" className="ml-auto gap-1" onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPreview ? 'Masquer' : 'Aperçu'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Résultat</CardTitle>
                <CardDescription>Sortie de la conversion</CardDescription>
              </div>
              <Button onClick={swapFormats} variant="outline" size="sm" title="Inverser">
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <FormatSelector value={outputFormat} onChange={setOutputFormat} />
            <Textarea
              placeholder="Le résultat apparaîtra ici..."
              value={output}
              readOnly
              className="min-h-[300px] font-mono bg-muted/50 text-sm resize-none"
            />
            <div className="flex items-center gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm" disabled={!output}>
                <Copy className="h-4 w-4 mr-1" /> Copier
              </Button>
              <Button onClick={downloadFile} variant="outline" size="sm" disabled={!output}>
                <Download className="h-4 w-4 mr-1" /> .{FORMAT_EXTENSIONS[outputFormat]}
              </Button>
              <Badge variant="secondary" className="ml-auto">{output.length} car.</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview table */}
      {showPreview && previewData.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TableIcon className="h-5 w-5 text-primary" />
              Aperçu des données ({previewData.length} lignes × {previewHeaders.length} colonnes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground w-10">#</TableHead>
                    {previewHeaders.map(h => (
                      <TableHead key={h} className="font-semibold">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 50).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                      {previewHeaders.map(h => (
                        <TableCell key={h} className="font-mono text-sm">{row[h]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            {previewData.length > 50 && (
              <p className="text-xs text-muted-foreground mt-2">Affichage limité aux 50 premières lignes.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Convert button */}
      <div className="flex justify-center">
        <Button onClick={convert} size="lg" disabled={!input.trim() || !validation.valid} className="w-full md:w-auto gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Convertir {FORMAT_LABELS[inputFormat]} → {FORMAT_LABELS[outputFormat]}
        </Button>
      </div>

      {/* Format info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Formats supportés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {ALL_FORMATS.map(f => (
              <div key={f} className="rounded-lg border p-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-primary" />
                  {FORMAT_LABELS[f]}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {f === 'csv' && 'Tableur, séparateur virgule'}
                  {f === 'json' && 'APIs, données structurées'}
                  {f === 'tsv' && 'Tableur, séparateur tabulation'}
                  {f === 'markdown' && 'Tables Markdown/GitHub'}
                  {f === 'yaml' && 'Config, CI/CD, Kubernetes'}
                  {f === 'xml' && 'Données structurées, SOAP'}
                  {f === 'sql' && 'Insertion base de données'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
