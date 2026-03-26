import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Upload, Search, ArrowUpDown, FileSpreadsheet, Pencil, Check, X, Filter, BarChart3, Plus, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

function parseCSV(text: string, delimiter: string = ","): string[][] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const result: string[][] = [];
  for (const line of lines) {
    const row: string[] = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { cell += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (char === delimiter && !inQuotes) { row.push(cell.trim()); cell = ""; }
      else { cell += char; }
    }
    row.push(cell.trim());
    result.push(row);
  }
  return result;
}

function dataToCSV(headers: string[], rows: string[][], delimiter: string): string {
  const escape = (v: string) => v.includes(delimiter) || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
  const lines = [headers.map(escape).join(delimiter), ...rows.map(r => r.map(escape).join(delimiter))];
  return lines.join("\n");
}

function toJSON(headers: string[], rows: string[][]): string {
  if (headers.length === 0) return JSON.stringify(rows, null, 2);
  return JSON.stringify(rows.map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ""; });
    return obj;
  }), null, 2);
}

function toMarkdown(data: string[][]): string {
  if (data.length === 0) return "";
  const maxWidths = data[0].map((_, i) => Math.max(...data.map((row) => (row[i] || "").length)));
  let md = "";
  data.forEach((row, ri) => {
    md += "| " + row.map((cell, i) => (cell || "").padEnd(maxWidths[i])).join(" | ") + " |\n";
    if (ri === 0) md += "| " + maxWidths.map((w) => "-".repeat(w)).join(" | ") + " |\n";
  });
  return md;
}

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f97316", "#22c55e", "#a855f7", "#06b6d4", "#f43f5e", "#eab308"];

export default function CSVViewer() {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeader, setHasHeader] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<number, string>>({});
  const [activeFilterCol, setActiveFilterCol] = useState<number | null>(null);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "scatter" | "area">("bar");
  const [chartValueCol2, setChartValueCol2] = useState(2);
  const [chartLabelCol, setChartLabelCol] = useState(0);
  const [chartValueCol, setChartValueCol] = useState(1);
  const [editableRows, setEditableRows] = useState<string[][] | null>(null);
  const [editableHeaders, setEditableHeaders] = useState<string[] | null>(null);

  const parsedData = useMemo(() => parseCSV(input, delimiter), [input, delimiter]);
  const headers = useMemo(() => {
    if (editableHeaders) return editableHeaders;
    return hasHeader && parsedData.length > 0 ? parsedData[0] : parsedData[0]?.map((_, i) => `Col ${i + 1}`) || [];
  }, [parsedData, hasHeader, editableHeaders]);
  const rows = useMemo(() => {
    if (editableRows) return editableRows;
    return hasHeader ? parsedData.slice(1) : parsedData;
  }, [parsedData, hasHeader, editableRows]);

  // Filtering
  const filteredRows = useMemo(() => {
    let result = rows;
    if (searchQuery) {
      result = result.filter(row => row.some(cell => cell.toLowerCase().includes(searchQuery.toLowerCase())));
    }
    Object.entries(columnFilters).forEach(([colStr, filter]) => {
      if (!filter) return;
      const col = Number(colStr);
      result = result.filter(row => (row[col] || "").toLowerCase().includes(filter.toLowerCase()));
    });
    return result;
  }, [rows, searchQuery, columnFilters]);

  // Sorting
  const sortedRows = useMemo(() => {
    if (sortColumn === null) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortColumn] || "";
      const bVal = b[sortColumn] || "";
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  const handleSort = (i: number) => {
    if (sortColumn === i) setSortDirection(d => d === "asc" ? "desc" : "asc");
    else { setSortColumn(i); setSortDirection("asc"); }
  };

  // Inline editing
  const startEdit = (rowIndex: number, colIndex: number) => {
    // Find original index in rows array
    const row = sortedRows[rowIndex];
    const origIdx = rows.indexOf(row);
    if (origIdx === -1) return;
    setEditingCell({ row: origIdx, col: colIndex });
    setEditValue(row[colIndex] || "");
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const newRows = (editableRows || [...rows]).map(r => [...r]);
    newRows[editingCell.row][editingCell.col] = editValue;
    setEditableRows(newRows);
    setEditingCell(null);
    toast.success("Cellule modifiée");
  };

  const cancelEdit = () => setEditingCell(null);

  const addRow = () => {
    const newRow = Array(headers.length).fill("");
    setEditableRows([...(editableRows || rows), newRow]);
    toast.success("Ligne ajoutée");
  };

  const deleteRow = (sortedIdx: number) => {
    const row = sortedRows[sortedIdx];
    const currentRows = editableRows || [...rows];
    const origIdx = currentRows.indexOf(row);
    if (origIdx === -1) return;
    setEditableRows(currentRows.filter((_, i) => i !== origIdx));
    toast.success("Ligne supprimée");
  };

  const addColumn = () => {
    const newHeaders = [...headers, `Col ${headers.length + 1}`];
    const newRows = (editableRows || rows).map(r => [...r, ""]);
    setEditableHeaders(newHeaders);
    setEditableRows(newRows);
    toast.success("Colonne ajoutée");
  };

  const syncInputFromEdits = () => {
    const currentRows = editableRows || rows;
    const csv = dataToCSV(headers, currentRows, delimiter);
    setInput(csv);
    setEditableRows(null);
    setEditableHeaders(null);
    toast.success("Modifications appliquées au CSV");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setInput(event.target?.result as string);
      setEditableRows(null);
      setEditableHeaders(null);
      toast.success(`Fichier "${file.name}" chargé`);
    };
    reader.readAsText(file);
  };

  const handleCopy = (format: "json" | "markdown" | "csv") => {
    const currentRows = editableRows || rows;
    let content = "";
    if (format === "json") content = toJSON(headers, currentRows);
    else if (format === "markdown") content = toMarkdown([headers, ...currentRows]);
    else content = dataToCSV(headers, currentRows, delimiter);
    navigator.clipboard.writeText(content);
    toast.success(`Copié en ${format.toUpperCase()}`);
  };

  const downloadCSV = () => {
    const currentRows = editableRows || rows;
    const csv = dataToCSV(headers, currentRows, delimiter);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "data.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier CSV téléchargé");
  };

  // Chart data
  const chartData = useMemo(() => {
    const currentRows = editableRows || rows;
    return currentRows
      .map(row => {
        const val = parseFloat(row[chartValueCol]);
        if (isNaN(val)) return null;
        const val2 = parseFloat(row[chartValueCol2]);
        return { name: row[chartLabelCol] || "?", value: val, value2: isNaN(val2) ? undefined : val2 };
      })
      .filter(Boolean) as { name: string; value: number; value2?: number }[];
  }, [rows, editableRows, chartLabelCol, chartValueCol, chartValueCol2]);

  // Column stats
  const columnStats = useMemo(() => {
    const currentRows = editableRows || rows;
    return headers.map((h, i) => {
      const nums = currentRows.map(r => parseFloat(r[i])).filter(n => !isNaN(n));
      if (nums.length === 0) return null;
      return {
        header: h,
        count: nums.length,
        sum: nums.reduce((a, b) => a + b, 0),
        avg: nums.reduce((a, b) => a + b, 0) / nums.length,
        min: Math.min(...nums),
        max: Math.max(...nums),
      };
    });
  }, [headers, rows, editableRows]);

  const stats = useMemo(() => ({
    rows: rows.length,
    columns: headers.length,
    cells: rows.reduce((acc, row) => acc + row.length, 0),
    filtered: filteredRows.length,
  }), [rows, headers, filteredRows]);

  const hasEdits = editableRows !== null || editableHeaders !== null;

  const sampleCSV = `Nom,Email,Age,Ville,Score
Alice Martin,alice@example.com,28,Paris,87
Bob Dupont,bob@example.com,35,Lyon,92
Claire Bernard,claire@example.com,42,Marseille,76
David Petit,david@example.com,31,Bordeaux,95
Emma Leroy,emma@example.com,26,Toulouse,88
Franck Morel,franck@example.com,38,Nice,71
Grace Roux,grace@example.com,29,Nantes,83`;

  const colCount = headers.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">CSV Viewer Pro</h1>
          <p className="text-muted-foreground">Visualisez, éditez et analysez vos données CSV</p>
        </div>
      </div>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Tableau</TabsTrigger>
          <TabsTrigger value="charts" disabled={rows.length === 0}>Graphiques</TabsTrigger>
          <TabsTrigger value="stats" disabled={rows.length === 0}>Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Input Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Données CSV
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setInput(sampleCSV); setEditableRows(null); setEditableHeaders(null); }}>Exemple</Button>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild><span><Upload className="h-4 w-4" /></span></Button>
                    </Label>
                    <input id="file-upload" type="file" accept=".csv,.txt,.tsv" onChange={handleFileUpload} className="hidden" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea value={input} onChange={(e) => { setInput(e.target.value); setEditableRows(null); setEditableHeaders(null); }} placeholder="Collez vos données CSV ici..." className="min-h-[180px] font-mono text-sm" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Délimiteur</Label>
                    <Select value={delimiter} onValueChange={setDelimiter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value=",">Virgule (,)</SelectItem>
                        <SelectItem value=";">Point-virgule (;)</SelectItem>
                        <SelectItem value={"\t"}>Tabulation</SelectItem>
                        <SelectItem value="|">Pipe (|)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Première ligne</Label>
                    <Select value={hasHeader ? "header" : "data"} onValueChange={(v) => setHasHeader(v === "header")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">En-têtes</SelectItem>
                        <SelectItem value="data">Données</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">{stats.rows} lignes</Badge>
                  <Badge variant="secondary">{stats.columns} colonnes</Badge>
                  {stats.filtered !== stats.rows && (
                    <Badge variant="outline">{stats.filtered} filtrées</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy("json")}><Copy className="h-4 w-4 mr-1" /> JSON</Button>
                  <Button variant="outline" size="sm" onClick={() => handleCopy("markdown")}><Copy className="h-4 w-4 mr-1" /> Markdown</Button>
                  <Button variant="outline" size="sm" onClick={() => handleCopy("csv")}><Copy className="h-4 w-4 mr-1" /> CSV</Button>
                  <Button variant="outline" size="sm" onClick={downloadCSV}><Download className="h-4 w-4 mr-1" /> Télécharger</Button>
                </div>

                {hasEdits && (
                  <Button size="sm" onClick={syncInputFromEdits} className="w-full">
                    <Check className="h-4 w-4 mr-1" /> Appliquer les modifications au CSV
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Table View */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  Visualisation
                  <div className="flex gap-2 items-center">
                    {parsedData.length > 0 && (
                      <>
                        <Button variant="outline" size="sm" onClick={addRow}><Plus className="h-4 w-4 mr-1" /> Ligne</Button>
                        <Button variant="outline" size="sm" onClick={addColumn}><Plus className="h-4 w-4 mr-1" /> Colonne</Button>
                      </>
                    )}
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 w-48" />
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {parsedData.length > 0 ? (
                  <ScrollArea className="h-[500px] rounded border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 text-center">#</TableHead>
                          {headers.map((header, i) => (
                            <TableHead key={i} className="min-w-[120px]">
                              <div className="space-y-1">
                                <div
                                  className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
                                  onClick={() => handleSort(i)}
                                >
                                  {header}
                                  <ArrowUpDown className={`h-3 w-3 ${sortColumn === i ? "text-primary" : "text-muted-foreground"}`} />
                                </div>
                                {/* Column filter */}
                                {activeFilterCol === i ? (
                                  <div className="flex gap-1">
                                    <Input
                                      placeholder="Filtrer..."
                                      value={columnFilters[i] || ""}
                                      onChange={(e) => setColumnFilters(f => ({ ...f, [i]: e.target.value }))}
                                      className="h-6 text-xs"
                                      autoFocus
                                    />
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setActiveFilterCol(null); setColumnFilters(f => { const n = { ...f }; delete n[i]; return n; }); }}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-5 w-5 ${columnFilters[i] ? "text-primary" : "text-muted-foreground"}`}
                                    onClick={() => setActiveFilterCol(i)}
                                  >
                                    <Filter className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableHead>
                          ))}
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedRows.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            <TableCell className="text-center text-muted-foreground text-xs">{rowIndex + 1}</TableCell>
                            {row.map((cell, colIndex) => {
                              const origIdx = (editableRows || rows).indexOf(row);
                              const isEditing = editingCell?.row === origIdx && editingCell?.col === colIndex;
                              return (
                                <TableCell key={colIndex} className="p-1">
                                  {isEditing ? (
                                    <div className="flex gap-1 items-center">
                                      <Input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="h-7 text-sm"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") commitEdit();
                                          if (e.key === "Escape") cancelEdit();
                                        }}
                                      />
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={commitEdit}><Check className="h-3 w-3" /></Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}><X className="h-3 w-3" /></Button>
                                    </div>
                                  ) : (
                                    <div
                                      className="px-2 py-1 rounded cursor-pointer hover:bg-muted/50 transition-colors truncate max-w-[200px] group flex items-center gap-1"
                                      onDoubleClick={() => startEdit(rowIndex, colIndex)}
                                      title="Double-cliquer pour modifier"
                                    >
                                      <span className="truncate">{cell}</span>
                                      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                                    </div>
                                  )}
                                </TableCell>
                              );
                            })}
                            <TableCell className="p-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteRow(rowIndex)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Entrez des données CSV pour les visualiser
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Configuration du graphique</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={chartType} onValueChange={(v) => setChartType(v as typeof chartType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Barres</SelectItem>
                      <SelectItem value="line">Ligne</SelectItem>
                      <SelectItem value="area">Aire</SelectItem>
                      <SelectItem value="pie">Camembert</SelectItem>
                      <SelectItem value="scatter">Nuage de points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Colonne étiquettes (X)</Label>
                  <Select value={String(chartLabelCol)} onValueChange={(v) => setChartLabelCol(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {headers.map((h, i) => (
                        <SelectItem key={i} value={String(i)}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Colonne valeurs (Y)</Label>
                  <Select value={String(chartValueCol)} onValueChange={(v) => setChartValueCol(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {headers.map((h, i) => (
                        <SelectItem key={i} value={String(i)}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {chartType === "scatter" && (
                  <div className="space-y-2">
                    <Label>Colonne Y2 (scatter)</Label>
                    <Select value={String(chartValueCol2)} onValueChange={(v) => setChartValueCol2(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {headers.map((h, i) => (
                          <SelectItem key={i} value={String(i)}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  <p><strong>{chartData.length}</strong> points de données</p>
                  {chartData.length > 0 && (
                    <>
                      <p>Min : {Math.min(...chartData.map(d => d.value)).toFixed(1)}</p>
                      <p>Max : {Math.max(...chartData.map(d => d.value)).toFixed(1)}</p>
                      <p>Moy : {(chartData.reduce((a, d) => a + d.value, 0) / chartData.length).toFixed(1)}</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Graphique</CardTitle></CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType === "bar" ? (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="value" name={headers[chartValueCol] || "Valeur"} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : chartType === "line" ? (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" name={headers[chartValueCol] || "Valeur"} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                      </LineChart>
                    ) : chartType === "area" ? (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="value" name={headers[chartValueCol] || "Valeur"} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      </AreaChart>
                    ) : chartType === "scatter" ? (
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="value" name={headers[chartValueCol] || "X"} type="number" className="text-xs" />
                        <YAxis dataKey="value2" name={headers[chartValueCol2] || "Y"} type="number" className="text-xs" />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name={`${headers[chartValueCol]} vs ${headers[chartValueCol2]}`} data={chartData.filter(d => d.value2 !== undefined)} fill="hsl(var(--primary))" />
                      </ScatterChart>
                    ) : (
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    <p>Sélectionnez une colonne numérique pour générer un graphique</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader><CardTitle>Statistiques par colonne</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columnStats.map((stat, i) => stat ? (
                  <Card key={i} className="bg-muted/50">
                    <CardContent className="pt-4 space-y-2">
                      <h4 className="font-semibold text-sm">{stat.header}</h4>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <span className="text-muted-foreground">COUNT</span><span className="font-mono text-right">{stat.count}</span>
                        <span className="text-muted-foreground">SUM</span><span className="font-mono text-right">{stat.sum.toFixed(2)}</span>
                        <span className="text-muted-foreground">AVG</span><span className="font-mono text-right">{stat.avg.toFixed(2)}</span>
                        <span className="text-muted-foreground">MIN</span><span className="font-mono text-right">{stat.min.toFixed(2)}</span>
                        <span className="text-muted-foreground">MAX</span><span className="font-mono text-right">{stat.max.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : null)}
              </div>
              {columnStats.every(s => s === null) && (
                <p className="text-center text-muted-foreground py-8">Aucune colonne numérique détectée</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
