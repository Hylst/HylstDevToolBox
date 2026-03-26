import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Database, Copy, Check, Plus, Trash2, RotateCcw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ColType = "varchar" | "int" | "bigint" | "float" | "boolean" | "date" | "datetime" | "uuid" | "text" | "email" | "name" | "phone" | "url" | "ip" | "json";

interface Column {
  id: string;
  name: string;
  type: ColType;
  nullable: boolean;
  isPrimary: boolean;
  isUnique: boolean;
  defaultValue: string;
}

interface TableDef {
  name: string;
  columns: Column[];
}

const colTypes: { value: ColType; label: string }[] = [
  { value: "uuid", label: "UUID" },
  { value: "int", label: "Integer" },
  { value: "bigint", label: "Big Integer" },
  { value: "float", label: "Float" },
  { value: "varchar", label: "Varchar" },
  { value: "text", label: "Text" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "DateTime" },
  { value: "email", label: "Email" },
  { value: "name", label: "Name" },
  { value: "phone", label: "Phone" },
  { value: "url", label: "URL" },
  { value: "ip", label: "IP Address" },
  { value: "json", label: "JSON" },
];

const createColumn = (): Column => ({
  id: crypto.randomUUID(), name: "", type: "varchar", nullable: false, isPrimary: false, isUnique: false, defaultValue: "",
});

const defaultTable: TableDef = {
  name: "users",
  columns: [
    { id: "1", name: "id", type: "uuid", nullable: false, isPrimary: true, isUnique: true, defaultValue: "" },
    { id: "2", name: "name", type: "name", nullable: false, isPrimary: false, isUnique: false, defaultValue: "" },
    { id: "3", name: "email", type: "email", nullable: false, isPrimary: false, isUnique: true, defaultValue: "" },
    { id: "4", name: "age", type: "int", nullable: true, isPrimary: false, isUnique: false, defaultValue: "" },
    { id: "5", name: "is_active", type: "boolean", nullable: false, isPrimary: false, isUnique: false, defaultValue: "true" },
    { id: "6", name: "created_at", type: "datetime", nullable: false, isPrimary: false, isUnique: false, defaultValue: "" },
  ],
};

// Fake data generators
const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hugo", "Iris", "Jack", "Kate", "Léo", "Marie", "Noah", "Olivia", "Paul", "Quinn", "Rose", "Sam", "Théo"];
const lastNames = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier", "Morel"];
const domains = ["gmail.com", "outlook.com", "company.io", "example.com", "mail.org"];
const loremWords = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor"];

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomChoice<T>(arr: T[]): T { return arr[randomInt(0, arr.length - 1)]; }
function randomUUID() { return crypto.randomUUID(); }
function randomDate(start = new Date(2020, 0, 1), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateValue(col: Column, rowIndex: number): string {
  if (col.nullable && Math.random() < 0.15) return "NULL";
  switch (col.type) {
    case "uuid": return `'${randomUUID()}'`;
    case "int": return `${randomInt(1, 10000)}`;
    case "bigint": return `${randomInt(100000, 9999999)}`;
    case "float": return `${(Math.random() * 1000).toFixed(2)}`;
    case "varchar": return `'${loremWords.slice(0, randomInt(2, 5)).join(" ")}'`;
    case "text": return `'${loremWords.slice(0, randomInt(5, 12)).join(" ")}'`;
    case "boolean": return Math.random() > 0.5 ? "TRUE" : "FALSE";
    case "date": return `'${randomDate().toISOString().split("T")[0]}'`;
    case "datetime": return `'${randomDate().toISOString().replace("T", " ").slice(0, 19)}'`;
    case "email": {
      const fn = randomChoice(firstNames).toLowerCase();
      const ln = randomChoice(lastNames).toLowerCase();
      return `'${fn}.${ln}@${randomChoice(domains)}'`;
    }
    case "name": return `'${randomChoice(firstNames)} ${randomChoice(lastNames)}'`;
    case "phone": return `'+33${randomInt(600000000, 699999999)}'`;
    case "url": return `'https://${randomChoice(domains)}/page/${randomInt(1, 999)}'`;
    case "ip": return `'${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}'`;
    case "json": return `'{"key": "value_${randomInt(1, 100)}"}'`;
    default: return `'data_${rowIndex}'`;
  }
}

function generatePrismaValue(col: Column, rowIndex: number): string {
  if (col.nullable && Math.random() < 0.15) return "null";
  switch (col.type) {
    case "uuid": return `"${randomUUID()}"`;
    case "int": return `${randomInt(1, 10000)}`;
    case "bigint": return `BigInt(${randomInt(100000, 9999999)})`;
    case "float": return `${(Math.random() * 1000).toFixed(2)}`;
    case "varchar": case "text": return `"${loremWords.slice(0, randomInt(2, 5)).join(" ")}"`;
    case "boolean": return Math.random() > 0.5 ? "true" : "false";
    case "date": case "datetime": return `new Date("${randomDate().toISOString()}")`;
    case "email": return `"${randomChoice(firstNames).toLowerCase()}.${randomChoice(lastNames).toLowerCase()}@${randomChoice(domains)}"`;
    case "name": return `"${randomChoice(firstNames)} ${randomChoice(lastNames)}"`;
    case "phone": return `"+33${randomInt(600000000, 699999999)}"`;
    case "url": return `"https://${randomChoice(domains)}/page/${randomInt(1, 999)}"`;
    case "ip": return `"${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}"`;
    case "json": return `{ key: "value_${randomInt(1, 100)}" }`;
    default: return `"data_${rowIndex}"`;
  }
}

export default function SeedDataGenerator() {
  const { toast } = useToast();
  const [table, setTable] = useState<TableDef>(defaultTable);
  const [rowCount, setRowCount] = useState(10);
  const [format, setFormat] = useState<"sql" | "prisma" | "json">("sql");
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(0); // for regeneration

  const output = useMemo(() => {
    const cols = table.columns.filter(c => c.name);
    if (cols.length === 0) return "// Ajoutez des colonnes au schéma";

    if (format === "sql") {
      const lines: string[] = [];
      lines.push(`INSERT INTO ${table.name} (${cols.map(c => c.name).join(", ")})`);
      lines.push("VALUES");
      for (let i = 0; i < rowCount; i++) {
        const vals = cols.map(c => generateValue(c, i));
        const comma = i < rowCount - 1 ? "," : ";";
        lines.push(`  (${vals.join(", ")})${comma}`);
      }
      return lines.join("\n");
    }

    if (format === "prisma") {
      const lines: string[] = [];
      lines.push(`import { PrismaClient } from '@prisma/client';\n`);
      lines.push("const prisma = new PrismaClient();\n");
      lines.push("async function main() {");
      for (let i = 0; i < rowCount; i++) {
        lines.push(`  await prisma.${table.name}.create({`);
        lines.push("    data: {");
        cols.forEach(c => {
          lines.push(`      ${c.name}: ${generatePrismaValue(c, i)},`);
        });
        lines.push("    },");
        lines.push("  });\n");
      }
      lines.push("}");
      lines.push("\nmain().then(() => prisma.$disconnect());");
      return lines.join("\n");
    }

    // JSON
    const rows = [];
    for (let i = 0; i < rowCount; i++) {
      const obj: Record<string, any> = {};
      cols.forEach(c => {
        const v = generatePrismaValue(c, i);
        // Strip quotes for JSON
        if (v === "null") obj[c.name] = null;
        else if (v === "true" || v === "false") obj[c.name] = v === "true";
        else if (v.startsWith('"') && v.endsWith('"')) obj[c.name] = v.slice(1, -1);
        else if (!isNaN(Number(v))) obj[c.name] = Number(v);
        else obj[c.name] = v;
      });
      rows.push(obj);
    }
    return JSON.stringify(rows, null, 2);
  }, [table, rowCount, format, seed]);

  const updateColumn = (id: string, patch: Partial<Column>) => {
    setTable(prev => ({ ...prev, columns: prev.columns.map(c => c.id === id ? { ...c, ...patch } : c) }));
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: "Seed data copié !" });
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const ext = format === "sql" ? "sql" : format === "prisma" ? "ts" : "json";
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `seed-${table.name}.${ext}`;
    a.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          Seed Data Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Générez des données réalistes — SQL INSERT, Prisma seed ou JSON
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schema editor */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Table Schema
                <Button variant="ghost" size="sm" onClick={() => setTable(defaultTable)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nom de la table</Label>
                <Input value={table.name} onChange={e => setTable({ ...table, name: e.target.value })} className="mt-1" placeholder="users" />
              </div>

              <div>
                <Label className="mb-2 block">Colonnes</Label>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {table.columns.map(col => (
                    <div key={col.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <Input placeholder="name" value={col.name} onChange={e => updateColumn(col.id, { name: e.target.value })} className="h-8 text-sm flex-1" />
                        <Select value={col.type} onValueChange={v => updateColumn(col.id, { type: v as ColType })}>
                          <SelectTrigger className="h-8 text-sm w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {colTypes.map(ct => <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTable({ ...table, columns: table.columns.filter(c => c.id !== col.id) })}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <label className="flex items-center gap-1">
                          <Checkbox checked={col.isPrimary} onCheckedChange={v => updateColumn(col.id, { isPrimary: !!v })} />
                          PK
                        </label>
                        <label className="flex items-center gap-1">
                          <Checkbox checked={col.nullable} onCheckedChange={v => updateColumn(col.id, { nullable: !!v })} />
                          Nullable
                        </label>
                        <label className="flex items-center gap-1">
                          <Checkbox checked={col.isUnique} onCheckedChange={v => updateColumn(col.id, { isUnique: !!v })} />
                          Unique
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setTable({ ...table, columns: [...table.columns, createColumn()] })}>
                  <Plus className="h-4 w-4 mr-1" /> Colonne
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 space-y-4">
              <div className="flex items-center gap-4">
                <Label>Nombre de lignes</Label>
                <Slider value={[rowCount]} onValueChange={([v]) => setRowCount(v)} min={1} max={100} className="flex-1" />
                <span className="text-sm font-medium w-8 text-right">{rowCount}</span>
              </div>
              <div className="flex gap-2">
                <Button variant={format === "sql" ? "default" : "outline"} size="sm" onClick={() => setFormat("sql")}>SQL</Button>
                <Button variant={format === "prisma" ? "default" : "outline"} size="sm" onClick={() => setFormat("prisma")}>Prisma</Button>
                <Button variant={format === "json" ? "default" : "outline"} size="sm" onClick={() => setFormat("json")}>JSON</Button>
                <Button variant="secondary" size="sm" className="ml-auto" onClick={() => setSeed(s => s + 1)}>
                  🎲 Régénérer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Résultat
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={download}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted rounded-lg p-4 text-sm font-mono whitespace-pre-wrap max-h-[600px] overflow-y-auto">{output}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
