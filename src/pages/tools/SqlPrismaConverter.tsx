import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftRight, Copy, ArrowRight } from "lucide-react";

const sampleSql = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT false,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  body TEXT NOT NULL,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const samplePrisma = `model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique @db.VarChar(255)
  name      String?   @db.VarChar(100)
  role      String    @default("user") @db.VarChar(20)
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @default(now()) @map("updated_at")
  posts     Post[]
  comments  Comment[]

  @@map("users")
}

model Post {
  id        Int       @id @default(autoincrement())
  title     String    @db.VarChar(255)
  content   String?   @db.Text
  published Boolean   @default(false)
  authorId  Int       @map("author_id")
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments  Comment[]
  createdAt DateTime  @default(now()) @map("created_at")

  @@map("posts")
}

model Comment {
  id        Int      @id @default(autoincrement())
  body      String   @db.Text
  postId    Int      @map("post_id")
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    Int      @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")

  @@map("comments")
}`;

const sqlTypeToP: Record<string, string> = {
  "serial": "Int",
  "bigserial": "BigInt",
  "integer": "Int",
  "int": "Int",
  "bigint": "BigInt",
  "smallint": "Int",
  "boolean": "Boolean",
  "bool": "Boolean",
  "text": "String",
  "varchar": "String",
  "char": "String",
  "timestamp": "DateTime",
  "timestamptz": "DateTime",
  "date": "DateTime",
  "float": "Float",
  "double": "Float",
  "decimal": "Decimal",
  "numeric": "Decimal",
  "real": "Float",
  "json": "Json",
  "jsonb": "Json",
  "uuid": "String",
};

const toCamelCase = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const toPascalCase = (s: string) => {
  const camel = toCamelCase(s);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};
const toSingular = (s: string) => s.endsWith("ies") ? s.slice(0, -3) + "y" : s.endsWith("s") ? s.slice(0, -1) : s;

function sqlToPrisma(sql: string, dialect: string): string {
  const tables: Array<{
    name: string;
    columns: Array<{ name: string; type: string; nullable: boolean; default_: string; pk: boolean; unique: boolean; ref?: { table: string; column: string; onDelete?: string } }>;
  }> = [];

  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\);/gi;
  let match;
  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const columns: typeof tables[0]["columns"] = [];

    const lines = body.split(",").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (/^\s*(PRIMARY\s+KEY|CONSTRAINT|UNIQUE|INDEX|CHECK|FOREIGN)/i.test(line)) continue;

      const colMatch = line.match(/^(\w+)\s+(\w+)(?:\([\d,\s]+\))?(.*)/i);
      if (!colMatch) continue;

      const [, colName, rawType, rest] = colMatch;
      const typeLower = rawType.toLowerCase();
      const nullable = !/NOT\s+NULL/i.test(rest);
      const pk = /PRIMARY\s+KEY/i.test(rest) || typeLower === "serial" || typeLower === "bigserial";
      const unique = /UNIQUE/i.test(rest);
      const defaultMatch = rest.match(/DEFAULT\s+('[^']*'|\w+(?:\(\))?)/i);
      const default_ = defaultMatch ? defaultMatch[1] : "";

      const refMatch = rest.match(/REFERENCES\s+(\w+)\((\w+)\)(?:\s+ON\s+DELETE\s+(\w+))?/i);
      const ref = refMatch ? { table: refMatch[1], column: refMatch[2], onDelete: refMatch[3] } : undefined;

      columns.push({ name: colName, type: typeLower, nullable: pk ? false : nullable, default_, pk, unique, ref });
    }
    tables.push({ name: tableName, columns });
  }

  if (tables.length === 0) return "// Aucune table détectée. Vérifiez le SQL.";

  let output = `// Prisma schema generated from SQL (${dialect})\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "${dialect}"\n  url      = env("DATABASE_URL")\n}\n\n`;

  for (const table of tables) {
    const modelName = toPascalCase(toSingular(table.name));
    output += `model ${modelName} {\n`;

    for (const col of table.columns) {
      const prismaType = sqlTypeToP[col.type] || "String";
      const fieldName = toCamelCase(col.name);
      let attrs = "";

      if (col.pk) attrs += " @id";
      if (col.type === "serial" || col.type === "bigserial") attrs += " @default(autoincrement())";
      else if (col.default_ === "CURRENT_TIMESTAMP" || col.default_.includes("now")) attrs += " @default(now())";
      else if (col.default_ && col.default_ !== "''") {
        const dv = col.default_.replace(/'/g, '"');
        attrs += ` @default(${dv})`;
      }

      if (col.unique) attrs += " @unique";

      const typeStr = col.nullable && !col.pk ? `${prismaType}?` : prismaType;
      const mapStr = fieldName !== col.name ? ` @map("${col.name}")` : "";

      output += `  ${fieldName.padEnd(12)} ${typeStr.padEnd(10)}${attrs}${mapStr}\n`;

      if (col.ref) {
        const relModel = toPascalCase(toSingular(col.ref.table));
        const relName = toCamelCase(toSingular(col.ref.table));
        const onDelete = col.ref.onDelete ? `, onDelete: ${col.ref.onDelete.charAt(0).toUpperCase() + col.ref.onDelete.slice(1).toLowerCase()}` : "";
        output += `  ${relName.padEnd(12)} ${relModel.padEnd(10)} @relation(fields: [${fieldName}], references: [${toCamelCase(col.ref.column)}]${onDelete})\n`;
      }
    }

    // Add reverse relations from other tables
    for (const otherTable of tables) {
      if (otherTable.name === table.name) continue;
      const hasRef = otherTable.columns.some((c) => c.ref?.table === table.name);
      if (hasRef) {
        const relModel = toPascalCase(toSingular(otherTable.name));
        output += `  ${toCamelCase(otherTable.name).padEnd(12)} ${relModel}[]\n`;
      }
    }

    output += `\n  @@map("${table.name}")\n}\n\n`;
  }

  return output.trim();
}

function prismaToSql(prisma: string, dialect: string): string {
  const models: Array<{ name: string; tableName: string; fields: Array<{ name: string; type: string; colName: string; pk: boolean; unique: boolean; nullable: boolean; default_: string; isRelation: boolean; relFields?: string; relRefs?: string; onDelete?: string }> }> = [];

  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\}/g;
  let match;
  while ((match = modelRegex.exec(prisma)) !== null) {
    const [, modelName, body] = match;
    const mapMatch = body.match(/@@map\("(\w+)"\)/);
    const tableName = mapMatch ? mapMatch[1] : modelName.toLowerCase() + "s";

    const fields: typeof models[0]["fields"] = [];
    const lines = body.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("@@") && !l.startsWith("//"));

    for (const line of lines) {
      const fieldMatch = line.match(/^(\w+)\s+(\w+)(\[\])?\??/);
      if (!fieldMatch) continue;

      const [, fname, ftype, isArray] = fieldMatch;
      if (isArray) continue; // skip relation arrays

      const isRelation = /^[A-Z]/.test(ftype) && !["Int", "String", "Boolean", "Float", "DateTime", "BigInt", "Decimal", "Json"].includes(ftype);
      if (isRelation) {
        const relMatch = line.match(/@relation\(fields:\s*\[(\w+)\],\s*references:\s*\[(\w+)\](?:,\s*onDelete:\s*(\w+))?\)/);
        if (relMatch) {
          fields.push({ name: fname, type: ftype, colName: fname, pk: false, unique: false, nullable: false, default_: "", isRelation: true, relFields: relMatch[1], relRefs: relMatch[2], onDelete: relMatch[3] });
        }
        continue;
      }

      const mapFieldMatch = line.match(/@map\("(\w+)"\)/);
      const colName = mapFieldMatch ? mapFieldMatch[1] : fname;
      const pk = line.includes("@id");
      const unique = line.includes("@unique");
      const nullable = line.includes("?");
      let default_ = "";
      if (line.includes("@default(autoincrement())")) default_ = "AUTOINCREMENT";
      else if (line.includes("@default(now())")) default_ = "CURRENT_TIMESTAMP";
      else {
        const defMatch = line.match(/@default\(([^)]+)\)/);
        if (defMatch) default_ = defMatch[1].replace(/"/g, "'");
      }

      fields.push({ name: fname, type: ftype, colName, pk, unique, nullable, default_: default_, isRelation: false });
    }

    models.push({ name: modelName, tableName, fields });
  }

  if (models.length === 0) return "-- Aucun modèle détecté. Vérifiez le schema Prisma.";

  const pToSql: Record<string, string> = {
    Int: dialect === "mysql" ? "INT" : "INTEGER",
    String: "VARCHAR(255)",
    Boolean: "BOOLEAN",
    Float: dialect === "mysql" ? "DOUBLE" : "FLOAT",
    DateTime: "TIMESTAMP",
    BigInt: "BIGINT",
    Decimal: "DECIMAL(10,2)",
    Json: dialect === "mysql" ? "JSON" : "JSONB",
  };

  let output = `-- SQL generated from Prisma schema (${dialect})\n\n`;

  for (const model of models) {
    output += `CREATE TABLE ${model.tableName} (\n`;
    const colDefs: string[] = [];

    for (const field of model.fields) {
      if (field.isRelation) continue;

      let sqlType = pToSql[field.type] || "TEXT";
      if (field.pk && field.default_ === "AUTOINCREMENT") {
        sqlType = dialect === "postgresql" ? "SERIAL" : "INT AUTO_INCREMENT";
      }

      let def = `  ${field.colName} ${sqlType}`;
      if (field.pk) def += " PRIMARY KEY";
      if (!field.nullable && !field.pk) def += " NOT NULL";
      if (field.unique) def += " UNIQUE";
      if (field.default_ && field.default_ !== "AUTOINCREMENT") def += ` DEFAULT ${field.default_}`;

      // Check for foreign key
      const rel = model.fields.find((f) => f.isRelation && f.relFields === field.name);
      if (rel) {
        const targetModel = models.find((m) => m.name === rel.type);
        if (targetModel) {
          const targetCol = targetModel.fields.find((f) => f.name === rel.relRefs);
          def += ` REFERENCES ${targetModel.tableName}(${targetCol?.colName || rel.relRefs})`;
          if (rel.onDelete) def += ` ON DELETE ${rel.onDelete.toUpperCase()}`;
        }
      }

      colDefs.push(def);
    }

    output += colDefs.join(",\n") + "\n);\n\n";
  }

  return output.trim();
}

export default function SqlPrismaConverter() {
  const { toast } = useToast();
  const [mode, setMode] = useState<"sql-to-prisma" | "prisma-to-sql">("sql-to-prisma");
  const [dialect, setDialect] = useState("postgresql");
  const [input, setInput] = useState(sampleSql);
  const [output, setOutput] = useState("");

  const convert = () => {
    try {
      if (mode === "sql-to-prisma") {
        setOutput(sqlToPrisma(input, dialect));
      } else {
        setOutput(prismaToSql(input, dialect));
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const switchMode = () => {
    if (mode === "sql-to-prisma") {
      setMode("prisma-to-sql");
      setInput(samplePrisma);
      setOutput("");
    } else {
      setMode("sql-to-prisma");
      setInput(sampleSql);
      setOutput("");
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copié !" });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ArrowLeftRight className="h-8 w-8 text-primary" />
          SQL ↔ Prisma Converter
        </h1>
        <p className="text-muted-foreground mt-1">
          Conversion bidirectionnelle entre SQL DDL et schema Prisma
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Button variant={mode === "sql-to-prisma" ? "default" : "outline"} onClick={() => { setMode("sql-to-prisma"); setInput(sampleSql); setOutput(""); }}>
          SQL → Prisma
        </Button>
        <Button size="icon" variant="ghost" onClick={switchMode}>
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
        <Button variant={mode === "prisma-to-sql" ? "default" : "outline"} onClick={() => { setMode("prisma-to-sql"); setInput(samplePrisma); setOutput(""); }}>
          Prisma → SQL
        </Button>
        <Select value={dialect} onValueChange={setDialect}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="postgresql">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
            <SelectItem value="sqlite">SQLite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{mode === "sql-to-prisma" ? "SQL DDL" : "Prisma Schema"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="font-mono text-xs min-h-[400px]" />
            <Button onClick={convert} className="mt-3 w-full">
              <ArrowRight className="h-4 w-4 mr-2" /> Convertir
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{mode === "sql-to-prisma" ? "Prisma Schema" : "SQL DDL"}</CardTitle>
              <Button size="sm" variant="outline" onClick={copy} disabled={!output}><Copy className="h-4 w-4 mr-1" /> Copier</Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-auto min-h-[400px] max-h-[500px] whitespace-pre-wrap">
              {output || "Cliquez Convertir pour générer la sortie..."}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
