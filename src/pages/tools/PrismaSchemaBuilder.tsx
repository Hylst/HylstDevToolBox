import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Database, Plus, Trash2, Copy, Download } from "lucide-react";
import { toast } from "sonner";

type FieldType = "String" | "Int" | "Float" | "Boolean" | "DateTime" | "Json" | "BigInt" | "Bytes" | "Decimal";
type RelationType = "one-to-one" | "one-to-many" | "many-to-many";

interface Field {
  id: string;
  name: string;
  type: FieldType;
  isOptional: boolean;
  isList: boolean;
  isUnique: boolean;
  isId: boolean;
  defaultValue: string;
  relation?: { model: string; type: RelationType };
}

interface Model {
  id: string;
  name: string;
  fields: Field[];
}

const fieldTypes: FieldType[] = ["String", "Int", "Float", "Boolean", "DateTime", "Json", "BigInt", "Bytes", "Decimal"];

let nextId = 1;
const uid = () => `f-${nextId++}`;

function createField(name = "", type: FieldType = "String"): Field {
  return { id: uid(), name, type, isOptional: false, isList: false, isUnique: false, isId: false, defaultValue: "" };
}

function createModel(name = ""): Model {
  return {
    id: uid(),
    name,
    fields: [
      { ...createField("id", "Int"), isId: true, defaultValue: "autoincrement()" },
      { ...createField("createdAt", "DateTime"), defaultValue: "now()" },
      { ...createField("updatedAt", "DateTime"), defaultValue: "updatedAt()" },
    ],
  };
}

function generatePrisma(models: Model[], provider: string): string {
  let out = `generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "${provider}"\n  url      = env("DATABASE_URL")\n}\n\n`;

  for (const model of models) {
    if (!model.name) continue;
    out += `model ${model.name} {\n`;
    for (const f of model.fields) {
      if (!f.name) continue;
      let line = `  ${f.name}`;
      if (f.relation) {
        line += ` ${f.relation.model}`;
        if (f.isList) line += "[]";
        else if (f.isOptional) line += "?";
      } else {
        line += ` ${f.type}`;
        if (f.isList) line += "[]";
        else if (f.isOptional) line += "?";
      }
      const attrs: string[] = [];
      if (f.isId) attrs.push("@id");
      if (f.isUnique && !f.isId) attrs.push("@unique");
      if (f.defaultValue) {
        const dv = f.defaultValue;
        if (dv.includes("(")) attrs.push(`@default(${dv})`);
        else if (f.type === "String") attrs.push(`@default("${dv}")`);
        else if (f.type === "Boolean") attrs.push(`@default(${dv})`);
        else attrs.push(`@default(${dv})`);
      }
      if (f.name === "updatedAt" && f.type === "DateTime") attrs.push("@updatedAt");
      if (attrs.length) line += " " + attrs.join(" ");
      out += line + "\n";
    }
    out += "}\n\n";
  }

  return out.trimEnd() + "\n";
}

export default function PrismaSchemaBuilder() {
  const [models, setModels] = useState<Model[]>([createModel("User")]);
  const [provider, setProvider] = useState("postgresql");

  const updateModel = (id: string, patch: Partial<Model>) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  };

  const updateField = (modelId: string, fieldId: string, patch: Partial<Field>) => {
    setModels(prev => prev.map(m => m.id === modelId ? {
      ...m,
      fields: m.fields.map(f => f.id === fieldId ? { ...f, ...patch } : f),
    } : m));
  };

  const addField = (modelId: string) => {
    setModels(prev => prev.map(m => m.id === modelId ? { ...m, fields: [...m.fields, createField()] } : m));
  };

  const removeField = (modelId: string, fieldId: string) => {
    setModels(prev => prev.map(m => m.id === modelId ? { ...m, fields: m.fields.filter(f => f.id !== fieldId) } : m));
  };

  const schema = generatePrisma(models, provider);

  const copySchema = () => { navigator.clipboard.writeText(schema); toast.success("schema.prisma copié !"); };
  const downloadSchema = () => {
    const blob = new Blob([schema], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = "schema.prisma";
    link.href = URL.createObjectURL(blob);
    link.click();
    toast.success("Fichier téléchargé !");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Database className="h-8 w-8 text-primary" />Prisma Schema Builder
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Models */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Label className="text-xs">Database Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["postgresql", "mysql", "sqlite", "sqlserver", "mongodb", "cockroachdb"].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {models.map(model => (
            <Card key={model.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={model.name}
                    onChange={e => updateModel(model.id, { name: e.target.value })}
                    placeholder="ModelName"
                    className="h-8 font-mono font-bold"
                  />
                  {models.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => setModels(prev => prev.filter(m => m.id !== model.id))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {model.fields.map(field => (
                  <div key={field.id} className="flex items-center gap-1.5 flex-wrap">
                    <Input
                      value={field.name}
                      onChange={e => updateField(model.id, field.id, { name: e.target.value })}
                      placeholder="fieldName"
                      className="h-7 text-xs font-mono w-28"
                    />
                    {field.relation ? (
                      <Select value={field.relation.model} onValueChange={v => updateField(model.id, field.id, { relation: { ...field.relation!, model: v } })}>
                        <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {models.filter(m => m.name && m.id !== model.id).map(m => (
                            <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select value={field.type} onValueChange={(v: FieldType) => updateField(model.id, field.id, { type: v })}>
                        <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    <div className="flex items-center gap-1">
                      <Badge
                        variant={field.isOptional ? "default" : "outline"}
                        className="text-xs cursor-pointer h-6 px-1.5"
                        onClick={() => updateField(model.id, field.id, { isOptional: !field.isOptional })}
                      >?</Badge>
                      <Badge
                        variant={field.isList ? "default" : "outline"}
                        className="text-xs cursor-pointer h-6 px-1.5"
                        onClick={() => updateField(model.id, field.id, { isList: !field.isList })}
                      >[]</Badge>
                      <Badge
                        variant={field.isUnique ? "default" : "outline"}
                        className="text-xs cursor-pointer h-6 px-1.5"
                        onClick={() => updateField(model.id, field.id, { isUnique: !field.isUnique })}
                      >U</Badge>
                      <Badge
                        variant={field.isId ? "default" : "outline"}
                        className="text-xs cursor-pointer h-6 px-1.5"
                        onClick={() => updateField(model.id, field.id, { isId: !field.isId })}
                      >@id</Badge>
                    </div>
                    <Input
                      value={field.defaultValue}
                      onChange={e => updateField(model.id, field.id, { defaultValue: e.target.value })}
                      placeholder="default"
                      className="h-7 text-xs font-mono w-28"
                    />
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeField(model.id, field.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => addField(model.id)}>
                    <Plus className="h-3 w-3 mr-1" />Champ
                  </Button>
                  {models.filter(m => m.name && m.id !== model.id).length > 0 && (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                      const relModel = models.find(m => m.name && m.id !== model.id);
                      if (relModel) {
                        const f = createField(relModel.name.toLowerCase());
                        f.relation = { model: relModel.name, type: "one-to-many" };
                        setModels(prev => prev.map(m => m.id === model.id ? { ...m, fields: [...m.fields, f] } : m));
                      }
                    }}>
                      <Plus className="h-3 w-3 mr-1" />Relation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={() => setModels(prev => [...prev, createModel()])} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-1" />Ajouter un modèle
          </Button>
        </div>

        {/* Schema Output */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">schema.prisma</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={copySchema}><Copy className="h-4 w-4 mr-1" />Copier</Button>
                  <Button size="sm" variant="outline" onClick={downloadSchema}><Download className="h-4 w-4 mr-1" />.prisma</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/50 rounded-lg p-4 text-sm font-mono overflow-auto max-h-[650px] whitespace-pre">{schema}</pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
