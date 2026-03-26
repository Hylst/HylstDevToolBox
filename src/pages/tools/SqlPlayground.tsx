import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Database, Play, Trash2, Copy, Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// We'll use a simple in-browser SQL approach without sql.js for now
// Simulating a lightweight SQL engine with JS arrays

type TableSchema = { name: string; columns: string[]; rows: any[][] };

const sampleData: TableSchema[] = [
  {
    name: "users",
    columns: ["id", "name", "email", "age", "city"],
    rows: [
      [1, "Alice", "alice@example.com", 28, "Paris"],
      [2, "Bob", "bob@example.com", 34, "Lyon"],
      [3, "Charlie", "charlie@example.com", 22, "Marseille"],
      [4, "Diana", "diana@example.com", 31, "Toulouse"],
      [5, "Eve", "eve@example.com", 27, "Nice"],
      [6, "Frank", "frank@example.com", 45, "Paris"],
      [7, "Grace", "grace@example.com", 29, "Lyon"],
      [8, "Hugo", "hugo@example.com", 38, "Bordeaux"],
    ],
  },
  {
    name: "orders",
    columns: ["id", "user_id", "product", "amount", "date"],
    rows: [
      [1, 1, "Laptop", 999.99, "2024-01-15"],
      [2, 2, "Phone", 599.99, "2024-01-20"],
      [3, 1, "Tablet", 399.99, "2024-02-10"],
      [4, 3, "Monitor", 349.99, "2024-02-15"],
      [5, 5, "Keyboard", 79.99, "2024-03-01"],
      [6, 4, "Mouse", 49.99, "2024-03-05"],
      [7, 2, "Headphones", 199.99, "2024-03-10"],
      [8, 6, "Webcam", 129.99, "2024-03-15"],
    ],
  },
  {
    name: "products",
    columns: ["id", "name", "category", "price", "stock"],
    rows: [
      [1, "Laptop", "Electronics", 999.99, 50],
      [2, "Phone", "Electronics", 599.99, 120],
      [3, "Tablet", "Electronics", 399.99, 80],
      [4, "Monitor", "Electronics", 349.99, 35],
      [5, "Keyboard", "Accessories", 79.99, 200],
      [6, "Mouse", "Accessories", 49.99, 300],
      [7, "Headphones", "Audio", 199.99, 90],
      [8, "Webcam", "Accessories", 129.99, 60],
    ],
  },
];

const sampleQueries = [
  { label: "Tous les utilisateurs", query: "SELECT * FROM users" },
  { label: "Utilisateurs de Paris", query: "SELECT * FROM users WHERE city = 'Paris'" },
  { label: "Commandes > 200€", query: "SELECT * FROM orders WHERE amount > 200" },
  { label: "Nombre par ville", query: "SELECT city, COUNT(*) as count FROM users GROUP BY city" },
  { label: "Jointure users-orders", query: "SELECT u.name, o.product, o.amount FROM users u JOIN orders o ON u.id = o.user_id" },
  { label: "Total par utilisateur", query: "SELECT u.name, SUM(o.amount) as total FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.name ORDER BY total DESC" },
  { label: "Produits par catégorie", query: "SELECT category, COUNT(*) as count, AVG(price) as avg_price FROM products GROUP BY category" },
];

// Simple SQL parser for SELECT queries
function executeQuery(query: string, tables: TableSchema[]): { columns: string[]; rows: any[][]; error?: string; time: number } {
  const start = performance.now();
  try {
    const q = query.trim().replace(/;$/, "");
    const upper = q.toUpperCase();

    if (!upper.startsWith("SELECT")) {
      return { columns: ["Result"], rows: [["Seules les requêtes SELECT sont supportées dans ce playground"]], time: 0 };
    }

    // Parse basic SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY ... LIMIT
    const selectMatch = q.match(/SELECT\s+(.+?)\s+FROM\s+(.+?)(?:\s+WHERE\s+(.+?))?(?:\s+GROUP\s+BY\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i);
    if (!selectMatch) return { columns: ["Error"], rows: [["Impossible de parser la requête"]], time: 0 };

    const selectClause = selectMatch[1];
    const fromClause = selectMatch[2];
    const whereClause = selectMatch[3];
    const groupByClause = selectMatch[4];
    const orderByClause = selectMatch[5];
    const limitClause = selectMatch[6];

    // Parse FROM with JOINs
    const joinMatch = fromClause.match(/(\w+)\s+(\w+)\s+JOIN\s+(\w+)\s+(\w+)\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/i);
    let workingRows: Record<string, any>[] = [];

    if (joinMatch) {
      const [, t1Name, t1Alias, t2Name, t2Alias, jAlias1, jCol1, jAlias2, jCol2] = joinMatch;
      const table1 = tables.find(t => t.name === t1Name.toLowerCase());
      const table2 = tables.find(t => t.name === t2Name.toLowerCase());
      if (!table1 || !table2) return { columns: ["Error"], rows: [["Table non trouvée"]], time: 0 };

      for (const r1 of table1.rows) {
        for (const r2 of table2.rows) {
          const obj: Record<string, any> = {};
          table1.columns.forEach((c, i) => { obj[`${t1Alias}.${c}`] = r1[i]; obj[c] = r1[i]; });
          table2.columns.forEach((c, i) => { obj[`${t2Alias}.${c}`] = r2[i]; });
          const v1 = obj[`${jAlias1}.${jCol1}`];
          const v2 = obj[`${jAlias2}.${jCol2}`];
          if (v1 == v2) workingRows.push(obj);
        }
      }
    } else {
      const tableName = fromClause.trim().split(/\s+/)[0].toLowerCase();
      const table = tables.find(t => t.name === tableName);
      if (!table) return { columns: ["Error"], rows: [[`Table "${tableName}" non trouvée. Tables disponibles: ${tables.map(t => t.name).join(", ")}`]], time: 0 };
      workingRows = table.rows.map(row => {
        const obj: Record<string, any> = {};
        table.columns.forEach((c, i) => { obj[c] = row[i]; });
        return obj;
      });
    }

    // WHERE
    if (whereClause) {
      const condMatch = whereClause.match(/(\w+(?:\.\w+)?)\s*(=|!=|>|<|>=|<=|LIKE)\s*'?([^']*)'?/i);
      if (condMatch) {
        const [, col, op, val] = condMatch;
        const colKey = Object.keys(workingRows[0] || {}).find(k => k === col || k.endsWith(`.${col}`)) || col;
        workingRows = workingRows.filter(row => {
          const rv = row[colKey];
          const cv = isNaN(Number(val)) ? val : Number(val);
          switch (op) {
            case "=": return rv == cv;
            case "!=": return rv != cv;
            case ">": return rv > cv;
            case "<": return rv < cv;
            case ">=": return rv >= cv;
            case "<=": return rv <= cv;
            default: return true;
          }
        });
      }
    }

    // GROUP BY
    if (groupByClause) {
      const groupCol = groupByClause.trim();
      const groups: Record<string, Record<string, any>[]> = {};
      workingRows.forEach(row => {
        const key = String(row[groupCol] ?? "");
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });

      const selectParts = selectClause.split(",").map(s => s.trim());
      const resultRows: Record<string, any>[] = [];
      for (const [key, rows] of Object.entries(groups)) {
        const obj: Record<string, any> = {};
        for (const part of selectParts) {
          const aggMatch = part.match(/(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*(\*|\w+(?:\.\w+)?)\s*\)(?:\s+as\s+(\w+))?/i);
          if (aggMatch) {
            const [, fn, col, alias] = aggMatch;
            const name = alias || `${fn.toLowerCase()}(${col})`;
            const vals = col === "*" ? rows : rows.map(r => Number(r[col] || 0));
            switch (fn.toUpperCase()) {
              case "COUNT": obj[name] = col === "*" ? rows.length : vals.length; break;
              case "SUM": obj[name] = Math.round((vals as number[]).reduce((a, b) => a + b, 0) * 100) / 100; break;
              case "AVG": obj[name] = Math.round((vals as number[]).reduce((a, b) => a + b, 0) / vals.length * 100) / 100; break;
              case "MIN": obj[name] = Math.min(...(vals as number[])); break;
              case "MAX": obj[name] = Math.max(...(vals as number[])); break;
            }
          } else {
            const colName = part.replace(/^\w+\./, "");
            obj[colName] = rows[0]?.[part] ?? rows[0]?.[colName] ?? key;
          }
        }
        resultRows.push(obj);
      }
      workingRows = resultRows;
    }

    // ORDER BY
    if (orderByClause) {
      const [col, dir] = orderByClause.trim().split(/\s+/);
      const desc = dir?.toUpperCase() === "DESC";
      workingRows.sort((a, b) => {
        const va = a[col], vb = b[col];
        if (va < vb) return desc ? 1 : -1;
        if (va > vb) return desc ? -1 : 1;
        return 0;
      });
    }

    // LIMIT
    if (limitClause) {
      workingRows = workingRows.slice(0, Number(limitClause));
    }

    // SELECT columns
    let columns: string[];
    if (selectClause.trim() === "*") {
      columns = Object.keys(workingRows[0] || {}).filter(k => !k.includes("."));
    } else if (groupByClause) {
      columns = Object.keys(workingRows[0] || {});
    } else {
      columns = selectClause.split(",").map(s => {
        const aliasMatch = s.trim().match(/(?:\w+\.)?(\w+)(?:\s+as\s+(\w+))?/i);
        return aliasMatch?.[2] || aliasMatch?.[1] || s.trim();
      });
    }

    const rows = workingRows.map(row => {
      if (groupByClause) return columns.map(c => row[c] ?? "");
      return columns.map(c => {
        const key = Object.keys(row).find(k => k === c || k.endsWith(`.${c}`)) || c;
        return row[key] ?? "";
      });
    });

    return { columns, rows, time: performance.now() - start };
  } catch (e: any) {
    return { columns: ["Error"], rows: [[e.message]], time: performance.now() - start };
  }
}

export default function SqlPlayground() {
  const { toast } = useToast();
  const [query, setQuery] = useState(sampleQueries[0].query);
  const [result, setResult] = useState<{ columns: string[]; rows: any[][]; error?: string; time: number } | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const run = () => {
    const res = executeQuery(query, sampleData);
    setResult(res);
    setHistory(prev => [query, ...prev.filter(q => q !== query)].slice(0, 20));
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !" });
  };

  const exportCsv = () => {
    if (!result) return;
    const csv = [result.columns.join(","), ...result.rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "result.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          SQL Playground
        </h1>
        <p className="text-muted-foreground">Exécutez des requêtes SQL sur des données sample en mémoire</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Tables</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {sampleData.map(t => (
                <div key={t.name}>
                  <div className="font-mono text-sm font-bold text-primary">{t.name}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {t.columns.map(c => (
                      <Badge key={c} variant="secondary" className="text-xs font-mono cursor-pointer" onClick={() => copy(c)}>{c}</Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{t.rows.length} lignes</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Exemples</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {sampleQueries.map((sq, i) => (
                <Button key={i} size="sm" variant="ghost" className="w-full justify-start text-xs h-auto py-1.5" onClick={() => setQuery(sq.query)}>
                  {sq.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                Requête SQL
                <div className="flex gap-2">
                  <Button onClick={run}><Play className="h-4 w-4 mr-1" /> Exécuter</Button>
                  <Button variant="outline" onClick={() => setQuery("")}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="font-mono text-sm min-h-[120px]"
                placeholder="SELECT * FROM users WHERE age > 25"
                onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); } }}
              />
              <p className="text-xs text-muted-foreground mt-1">Ctrl+Enter pour exécuter</p>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>
                    Résultats
                    <Badge variant="secondary" className="ml-2">{result.rows.length} lignes</Badge>
                    <Badge variant="outline" className="ml-2">{result.time.toFixed(1)}ms</Badge>
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-3 w-3 mr-1" /> CSV</Button>
                    <Button size="sm" variant="outline" onClick={() => copy(JSON.stringify(result.rows))}><Copy className="h-3 w-3 mr-1" /> JSON</Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-[400px] border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        {result.columns.map((c, i) => (
                          <th key={i} className="px-3 py-2 text-left font-mono font-semibold text-xs border-b">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, ri) => (
                        <tr key={ri} className="hover:bg-muted/30 border-b">
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-3 py-1.5 font-mono text-xs">{String(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
