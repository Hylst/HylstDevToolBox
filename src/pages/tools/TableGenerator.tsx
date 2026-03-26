import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table2, Copy, Plus, Minus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Cell = string;

export default function TableGenerator() {
  const { toast } = useToast();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [alignment, setAlignment] = useState<("left" | "center" | "right")[]>(Array(3).fill("left"));
  const [data, setData] = useState<Cell[][]>(() =>
    Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => r === 0 ? `Header ${c + 1}` : "")
    )
  );

  const resize = useCallback((newRows: number, newCols: number) => {
    const totalRows = newRows + 1; // +1 for header
    setData(prev => {
      const newData: Cell[][] = [];
      for (let r = 0; r < totalRows; r++) {
        const row: Cell[] = [];
        for (let c = 0; c < newCols; c++) {
          row.push(prev[r]?.[c] ?? (r === 0 ? `Header ${c + 1}` : ""));
        }
        newData.push(row);
      }
      return newData;
    });
    setAlignment(prev => {
      const a = [...prev];
      while (a.length < newCols) a.push("left");
      return a.slice(0, newCols);
    });
    setRows(newRows);
    setCols(newCols);
  }, []);

  const updateCell = (r: number, c: number, val: string) => {
    setData(prev => {
      const copy = prev.map(row => [...row]);
      copy[r][c] = val;
      return copy;
    });
  };

  const toMarkdown = () => {
    const header = `| ${data[0].join(" | ")} |`;
    const sep = `| ${alignment.map(a => a === "center" ? ":---:" : a === "right" ? "---:" : "---").join(" | ")} |`;
    const body = data.slice(1).map(row => `| ${row.join(" | ")} |`).join("\n");
    return `${header}\n${sep}\n${body}`;
  };

  const toHtml = () => {
    let html = "<table>\n  <thead>\n    <tr>\n";
    data[0].forEach(cell => { html += `      <th>${cell}</th>\n`; });
    html += "    </tr>\n  </thead>\n  <tbody>\n";
    data.slice(1).forEach(row => {
      html += "    <tr>\n";
      row.forEach(cell => { html += `      <td>${cell}</td>\n`; });
      html += "    </tr>\n";
    });
    html += "  </tbody>\n</table>";
    return html;
  };

  const toCsv = () => data.map(row => row.map(c => c.includes(",") ? `"${c}"` : c).join(",")).join("\n");

  const toLatex = () => {
    const colSpec = alignment.map(a => a === "center" ? "c" : a === "right" ? "r" : "l").join(" | ");
    let latex = `\\begin{tabular}{| ${colSpec} |}\n\\hline\n`;
    data.forEach((row, i) => {
      latex += row.join(" & ") + " \\\\\n\\hline\n";
    });
    latex += "\\end{tabular}";
    return latex;
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !" });
  };

  const importCsv = () => {
    const input = prompt("Collez votre CSV ici :");
    if (!input) return;
    const lines = input.trim().split("\n").map(l => l.split(",").map(c => c.replace(/^"|"$/g, "").trim()));
    if (lines.length < 2) return;
    const newCols = lines[0].length;
    const newRows = lines.length - 1;
    setData(lines);
    setCols(newCols);
    setRows(newRows);
    setAlignment(Array(newCols).fill("left"));
    toast({ title: "CSV importé !", description: `${newRows} lignes × ${newCols} colonnes` });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Table2 className="h-8 w-8 text-primary" />
          Table Generator
        </h1>
        <p className="text-muted-foreground">Créez des tableaux et exportez en Markdown, HTML, CSV ou LaTeX</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Éditeur</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={importCsv}>Import CSV</Button>
                  <Button size="sm" variant="outline" onClick={() => resize(rows + 1, cols)}>
                    <Plus className="h-3 w-3 mr-1" /> Ligne
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rows > 1 && resize(rows - 1, cols)}>
                    <Minus className="h-3 w-3 mr-1" /> Ligne
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => resize(rows, cols + 1)}>
                    <Plus className="h-3 w-3 mr-1" /> Col
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => cols > 1 && resize(rows, cols - 1)}>
                    <Minus className="h-3 w-3 mr-1" /> Col
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {data[0]?.map((cell, c) => (
                        <th key={c} className="p-1">
                          <Input
                            value={cell}
                            onChange={e => updateCell(0, c, e.target.value)}
                            className="font-semibold text-center h-9 text-sm"
                          />
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {alignment.map((a, c) => (
                        <th key={c} className="p-1">
                          <Select value={a} onValueChange={(v) => {
                            setAlignment(prev => { const n = [...prev]; n[c] = v as any; return n; });
                          }}>
                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">← Gauche</SelectItem>
                              <SelectItem value="center">↔ Centre</SelectItem>
                              <SelectItem value="right">→ Droite</SelectItem>
                            </SelectContent>
                          </Select>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(1).map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td key={c} className="p-1">
                            <Input
                              value={cell}
                              onChange={e => updateCell(r + 1, c, e.target.value)}
                              className="h-9 text-sm"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Export</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="markdown">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="markdown">MD</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="csv">CSV</TabsTrigger>
                <TabsTrigger value="latex">LaTeX</TabsTrigger>
              </TabsList>
              {[
                { key: "markdown", fn: toMarkdown },
                { key: "html", fn: toHtml },
                { key: "csv", fn: toCsv },
                { key: "latex", fn: toLatex },
              ].map(({ key, fn }) => (
                <TabsContent key={key} value={key}>
                  <div className="relative">
                    <Button size="sm" variant="ghost" className="absolute top-2 right-2 z-10" onClick={() => copy(fn())}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <pre className="text-xs font-mono bg-muted/50 p-3 rounded-lg overflow-auto max-h-[500px] whitespace-pre-wrap">{fn()}</pre>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
