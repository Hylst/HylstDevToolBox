import { useState } from "react";
import { Table2, Plus, Trash2, Copy, Download, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface Column {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  defaultValue?: string;
  foreignKey?: { table: string; column: string };
}

interface Table {
  id: string;
  name: string;
  columns: Column[];
}

const dataTypes = [
  { value: "uuid", label: "UUID", sql: { postgresql: "UUID", mysql: "CHAR(36)", sqlite: "TEXT" } },
  { value: "serial", label: "Serial/Auto-increment", sql: { postgresql: "SERIAL", mysql: "INT AUTO_INCREMENT", sqlite: "INTEGER" } },
  { value: "int", label: "Integer", sql: { postgresql: "INTEGER", mysql: "INT", sqlite: "INTEGER" } },
  { value: "bigint", label: "Big Integer", sql: { postgresql: "BIGINT", mysql: "BIGINT", sqlite: "INTEGER" } },
  { value: "decimal", label: "Decimal", sql: { postgresql: "DECIMAL(10,2)", mysql: "DECIMAL(10,2)", sqlite: "REAL" } },
  { value: "float", label: "Float", sql: { postgresql: "REAL", mysql: "FLOAT", sqlite: "REAL" } },
  { value: "boolean", label: "Boolean", sql: { postgresql: "BOOLEAN", mysql: "TINYINT(1)", sqlite: "INTEGER" } },
  { value: "varchar", label: "Varchar(255)", sql: { postgresql: "VARCHAR(255)", mysql: "VARCHAR(255)", sqlite: "TEXT" } },
  { value: "text", label: "Text", sql: { postgresql: "TEXT", mysql: "TEXT", sqlite: "TEXT" } },
  { value: "date", label: "Date", sql: { postgresql: "DATE", mysql: "DATE", sqlite: "TEXT" } },
  { value: "datetime", label: "DateTime", sql: { postgresql: "TIMESTAMP", mysql: "DATETIME", sqlite: "TEXT" } },
  { value: "timestamp", label: "Timestamp", sql: { postgresql: "TIMESTAMPTZ", mysql: "TIMESTAMP", sqlite: "TEXT" } },
  { value: "json", label: "JSON", sql: { postgresql: "JSONB", mysql: "JSON", sqlite: "TEXT" } },
];

const defaultTables: Table[] = [
  {
    id: "1",
    name: "users",
    columns: [
      { id: "1", name: "id", type: "uuid", nullable: false, primaryKey: true, unique: true, defaultValue: "gen_random_uuid()" },
      { id: "2", name: "email", type: "varchar", nullable: false, primaryKey: false, unique: true },
      { id: "3", name: "name", type: "varchar", nullable: false, primaryKey: false, unique: false },
      { id: "4", name: "created_at", type: "timestamp", nullable: false, primaryKey: false, unique: false, defaultValue: "now()" },
    ],
  },
  {
    id: "2",
    name: "posts",
    columns: [
      { id: "1", name: "id", type: "uuid", nullable: false, primaryKey: true, unique: true, defaultValue: "gen_random_uuid()" },
      { id: "2", name: "title", type: "varchar", nullable: false, primaryKey: false, unique: false },
      { id: "3", name: "content", type: "text", nullable: true, primaryKey: false, unique: false },
      { id: "4", name: "author_id", type: "uuid", nullable: false, primaryKey: false, unique: false, foreignKey: { table: "users", column: "id" } },
      { id: "5", name: "published_at", type: "timestamp", nullable: true, primaryKey: false, unique: false },
    ],
  },
];

type Dialect = "postgresql" | "mysql" | "sqlite";
type ExportFormat = "sql" | "prisma" | "drizzle" | "typeorm";

export default function DbSchemaDesigner() {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>(defaultTables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(defaultTables[0]?.id || null);
  const [dialect, setDialect] = useState<Dialect>("postgresql");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("sql");

  const selectedTable = tables.find(t => t.id === selectedTableId);

  const addTable = () => {
    const newTable: Table = {
      id: Date.now().toString(),
      name: `table_${tables.length + 1}`,
      columns: [
        { id: "1", name: "id", type: "uuid", nullable: false, primaryKey: true, unique: true, defaultValue: "gen_random_uuid()" },
      ],
    };
    setTables([...tables, newTable]);
    setSelectedTableId(newTable.id);
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(tables.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTable = (id: string) => {
    setTables(tables.filter(t => t.id !== id));
    if (selectedTableId === id) {
      setSelectedTableId(tables[0]?.id || null);
    }
  };

  const addColumn = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    const newColumn: Column = {
      id: Date.now().toString(),
      name: `column_${table.columns.length + 1}`,
      type: "varchar",
      nullable: true,
      primaryKey: false,
      unique: false,
    };
    updateTable(tableId, { columns: [...table.columns, newColumn] });
  };

  const updateColumn = (tableId: string, columnId: string, updates: Partial<Column>) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    updateTable(tableId, {
      columns: table.columns.map(c => c.id === columnId ? { ...c, ...updates } : c),
    });
  };

  const deleteColumn = (tableId: string, columnId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    updateTable(tableId, { columns: table.columns.filter(c => c.id !== columnId) });
  };

  const generateExport = (): string => {
    switch (exportFormat) {
      case "sql": {
        const statements = tables.map(table => {
          const columnDefs = table.columns.map(col => {
            const typeInfo = dataTypes.find(t => t.value === col.type);
            let def = `  "${col.name}" ${typeInfo?.sql[dialect] || "TEXT"}`;
            if (!col.nullable) def += " NOT NULL";
            if (col.primaryKey) def += " PRIMARY KEY";
            if (col.unique && !col.primaryKey) def += " UNIQUE";
            if (col.defaultValue) {
              def += ` DEFAULT ${col.defaultValue}`;
            }
            return def;
          });

          const foreignKeys = table.columns
            .filter(c => c.foreignKey)
            .map(c => `  FOREIGN KEY ("${c.name}") REFERENCES "${c.foreignKey!.table}" ("${c.foreignKey!.column}")`);

          return `CREATE TABLE "${table.name}" (\n${[...columnDefs, ...foreignKeys].join(",\n")}\n);`;
        });

        return statements.join("\n\n");
      }

      case "prisma": {
        const models = tables.map(table => {
          const fields = table.columns.map(col => {
            let prismaType = "";
            switch (col.type) {
              case "uuid": prismaType = "String"; break;
              case "serial": prismaType = "Int"; break;
              case "int": case "bigint": prismaType = "Int"; break;
              case "decimal": case "float": prismaType = "Float"; break;
              case "boolean": prismaType = "Boolean"; break;
              case "varchar": case "text": prismaType = "String"; break;
              case "date": case "datetime": case "timestamp": prismaType = "DateTime"; break;
              case "json": prismaType = "Json"; break;
              default: prismaType = "String";
            }

            let field = `  ${col.name} ${prismaType}${col.nullable ? "?" : ""}`;
            
            const attrs: string[] = [];
            if (col.primaryKey) attrs.push("@id");
            if (col.unique && !col.primaryKey) attrs.push("@unique");
            if (col.defaultValue) {
              if (col.defaultValue.includes("uuid") || col.defaultValue.includes("random")) {
                attrs.push("@default(cuid())");
              } else if (col.defaultValue.includes("now")) {
                attrs.push("@default(now())");
              } else if (col.type === "serial") {
                attrs.push("@default(autoincrement())");
              }
            }
            if (attrs.length) field += ` ${attrs.join(" ")}`;

            return field;
          });

          const relations = table.columns
            .filter(c => c.foreignKey)
            .map(c => {
              const refTable = c.foreignKey!.table;
              const refTableCapital = refTable.charAt(0).toUpperCase() + refTable.slice(1);
              return `  ${refTable} ${refTableCapital} @relation(fields: [${c.name}], references: [${c.foreignKey!.column}])`;
            });

          const tableName = table.name.charAt(0).toUpperCase() + table.name.slice(1);
          return `model ${tableName} {\n${[...fields, ...relations].join("\n")}\n}`;
        });

        return models.join("\n\n");
      }

      case "drizzle": {
        const imports = new Set<string>();
        imports.add("pgTable");
        
        tables.forEach(table => {
          table.columns.forEach(col => {
            switch (col.type) {
              case "uuid": imports.add("uuid"); break;
              case "serial": imports.add("serial"); break;
              case "int": imports.add("integer"); break;
              case "bigint": imports.add("bigint"); break;
              case "varchar": imports.add("varchar"); break;
              case "text": imports.add("text"); break;
              case "boolean": imports.add("boolean"); break;
              case "timestamp": case "datetime": imports.add("timestamp"); break;
              case "date": imports.add("date"); break;
              case "json": imports.add("jsonb"); break;
            }
          });
        });

        const tableCode = tables.map(table => {
          const cols = table.columns.map(col => {
            let colDef = `  ${col.name}: `;
            switch (col.type) {
              case "uuid": colDef += `uuid("${col.name}")`; break;
              case "serial": colDef += `serial("${col.name}")`; break;
              case "int": colDef += `integer("${col.name}")`; break;
              case "varchar": colDef += `varchar("${col.name}", { length: 255 })`; break;
              case "text": colDef += `text("${col.name}")`; break;
              case "boolean": colDef += `boolean("${col.name}")`; break;
              case "timestamp": case "datetime": colDef += `timestamp("${col.name}")`; break;
              default: colDef += `text("${col.name}")`;
            }
            
            if (col.primaryKey) colDef += ".primaryKey()";
            if (!col.nullable) colDef += ".notNull()";
            if (col.unique && !col.primaryKey) colDef += ".unique()";
            if (col.defaultValue?.includes("now")) colDef += ".defaultNow()";
            
            return colDef + ",";
          });

          return `export const ${table.name} = pgTable("${table.name}", {\n${cols.join("\n")}\n});`;
        });

        return `import { ${Array.from(imports).join(", ")} } from "drizzle-orm/pg-core";\n\n${tableCode.join("\n\n")}`;
      }

      case "typeorm": {
        const entities = tables.map(table => {
          const columns = table.columns.map(col => {
            let tsType = "string";
            let decorator = "@Column()";
            
            switch (col.type) {
              case "uuid":
                decorator = col.primaryKey ? "@PrimaryGeneratedColumn('uuid')" : "@Column({ type: 'uuid' })";
                break;
              case "serial":
                decorator = col.primaryKey ? "@PrimaryGeneratedColumn()" : "@Column()";
                tsType = "number";
                break;
              case "int": case "bigint":
                decorator = col.primaryKey ? "@PrimaryGeneratedColumn()" : "@Column({ type: 'int' })";
                tsType = "number";
                break;
              case "boolean":
                decorator = "@Column({ type: 'boolean' })";
                tsType = "boolean";
                break;
              case "timestamp": case "datetime":
                decorator = col.defaultValue?.includes("now") 
                  ? "@CreateDateColumn()" 
                  : "@Column({ type: 'timestamp' })";
                tsType = "Date";
                break;
              case "json":
                decorator = "@Column({ type: 'jsonb' })";
                tsType = "Record<string, unknown>";
                break;
              default:
                decorator = `@Column({ nullable: ${col.nullable} })`;
            }

            if (col.unique && !col.primaryKey) {
              decorator = decorator.replace("@Column(", "@Column({ unique: true, ").replace("})", " })") || "@Column({ unique: true })";
            }

            return `  ${decorator}\n  ${col.name}${col.nullable ? "?" : ""}: ${tsType};`;
          });

          const className = table.name.charAt(0).toUpperCase() + table.name.slice(1);
          return `@Entity("${table.name}")\nexport class ${className} {\n${columns.join("\n\n")}\n}`;
        });

        return `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";\n\n${entities.join("\n\n")}`;
      }
    }
  };

  const copyExport = () => {
    navigator.clipboard.writeText(generateExport());
    toast({ title: "Copié !", description: "Schéma copié" });
  };

  const downloadExport = () => {
    const content = generateExport();
    const extensions: Record<ExportFormat, string> = {
      sql: "sql",
      prisma: "prisma",
      drizzle: "ts",
      typeorm: "ts",
    };
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema.${extensions[exportFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Table2 className="h-8 w-8 text-primary" />
          Database Schema Designer
        </h1>
        <p className="text-muted-foreground">
          Concevez visuellement votre schéma de base de données et exportez vers SQL, Prisma, Drizzle ou TypeORM
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tables ({tables.length})</span>
              <Button size="sm" onClick={addTable}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {tables.map(table => (
                  <div
                    key={table.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTableId === table.id ? "bg-primary/10 border-primary" : "bg-muted/50 hover:bg-muted"
                    }`}
                    onClick={() => setSelectedTableId(table.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Table2 className="h-4 w-4" />
                        <span className="font-medium">{table.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{table.columns.length} cols</Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={e => {
                            e.stopPropagation();
                            deleteTable(table.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {table.columns.slice(0, 3).map(c => c.name).join(", ")}
                      {table.columns.length > 3 && "..."}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedTable ? (
                  <Input
                    value={selectedTable.name}
                    onChange={e => updateTable(selectedTable.id, { name: e.target.value })}
                    className="font-bold text-lg h-auto py-0 px-2 w-48 inline-block"
                  />
                ) : "Sélectionnez une table"}
              </span>
              {selectedTable && (
                <Button size="sm" onClick={() => addColumn(selectedTable.id)}>
                  <Plus className="h-4 w-4 mr-1" /> Colonne
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTable ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {selectedTable.columns.map(col => (
                    <div key={col.id} className="p-3 bg-muted/50 rounded-lg space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nom"
                          value={col.name}
                          onChange={e => updateColumn(selectedTable.id, col.id, { name: e.target.value })}
                          className="flex-1"
                        />
                        <Select
                          value={col.type}
                          onValueChange={v => updateColumn(selectedTable.id, col.id, { type: v })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dataTypes.map(dt => (
                              <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteColumn(selectedTable.id, col.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="flex gap-4 flex-wrap text-sm">
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={col.primaryKey}
                            onCheckedChange={v => updateColumn(selectedTable.id, col.id, { primaryKey: !!v, nullable: v ? false : col.nullable })}
                          />
                          PK
                        </label>
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={col.unique}
                            onCheckedChange={v => updateColumn(selectedTable.id, col.id, { unique: !!v })}
                          />
                          Unique
                        </label>
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={col.nullable}
                            onCheckedChange={v => updateColumn(selectedTable.id, col.id, { nullable: !!v })}
                            disabled={col.primaryKey}
                          />
                          Nullable
                        </label>
                        <div className="flex items-center gap-2 flex-1">
                          <Label className="text-xs">Default:</Label>
                          <Input
                            placeholder="ex: now()"
                            value={col.defaultValue || ""}
                            onChange={e => updateColumn(selectedTable.id, col.id, { defaultValue: e.target.value || undefined })}
                            className="h-7 text-xs flex-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <Select
                          value={col.foreignKey ? `${col.foreignKey.table}.${col.foreignKey.column}` : "none"}
                          onValueChange={v => {
                            if (v === "none") {
                              updateColumn(selectedTable.id, col.id, { foreignKey: undefined });
                            } else {
                              const [table, column] = v.split(".");
                              updateColumn(selectedTable.id, col.id, { foreignKey: { table, column } });
                            }
                          }}
                        >
                          <SelectTrigger className="flex-1 h-7 text-xs">
                            <SelectValue placeholder="Foreign Key (optionnel)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucune</SelectItem>
                            {tables
                              .filter(t => t.id !== selectedTable.id)
                              .flatMap(t => 
                                t.columns
                                  .filter(c => c.primaryKey || c.unique)
                                  .map(c => (
                                    <SelectItem key={`${t.name}.${c.name}`} value={`${t.name}.${c.name}`}>
                                      {t.name}.{c.name}
                                    </SelectItem>
                                  ))
                              )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Table2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez une table ou créez-en une nouvelle</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Export</span>
            <div className="flex gap-2">
              <Select value={dialect} onValueChange={v => setDialect(v as Dialect)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                </SelectContent>
              </Select>
              <Select value={exportFormat} onValueChange={v => setExportFormat(v as ExportFormat)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sql">SQL</SelectItem>
                  <SelectItem value="prisma">Prisma</SelectItem>
                  <SelectItem value="drizzle">Drizzle</SelectItem>
                  <SelectItem value="typeorm">TypeORM</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={copyExport}>
                <Copy className="h-4 w-4 mr-1" /> Copier
              </Button>
              <Button variant="outline" onClick={downloadExport}>
                <Download className="h-4 w-4 mr-1" /> Télécharger
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={generateExport()}
            readOnly
            className="min-h-[300px] font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}
