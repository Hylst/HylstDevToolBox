import { useState, useCallback, useEffect, useMemo } from "react";
import { Copy, Download, RefreshCw, Plus, Trash2, Database, Save, Link2, Eye, EyeOff, BookmarkPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  FieldDefinition,
  fieldTypes,
  builtInTemplates,
  generateDataSet,
  formatOutput,
  canRelate,
  getRelationSources,
  loadCustomSchemas,
  saveCustomSchema,
  deleteCustomSchema,
  SchemaTemplate,
} from "@/lib/data-generator-utils";

// ---- Field Row ----
function FieldRow({
  field,
  index,
  allFields,
  onUpdate,
  onRemove,
}: {
  field: FieldDefinition;
  index: number;
  allFields: FieldDefinition[];
  onUpdate: (index: number, key: keyof FieldDefinition, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const showRelation = canRelate(field.type);
  const relationSources = getRelationSources(field.type);
  const availableSources = allFields.filter(
    (f, i) => i !== index && relationSources.includes(f.type)
  );

  return (
    <div className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg">
      <div className="flex-1 space-y-2">
        <Input
          placeholder="Nom du champ"
          value={field.name}
          onChange={(e) => onUpdate(index, "name", e.target.value)}
        />
        <Select value={field.type} onValueChange={(v) => onUpdate(index, "type", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map((ft) => (
              <SelectItem key={ft.value} value={ft.value}>
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{ft.category}</Badge>
                  {ft.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {field.type === "enum" && (
          <Input
            placeholder="Valeurs séparées par des virgules"
            value={field.options || ""}
            onChange={(e) => onUpdate(index, "options", e.target.value)}
          />
        )}
        {showRelation && availableSources.length > 0 && (
          <div className="flex items-center gap-2">
            <Link2 className="h-3 w-3 text-muted-foreground shrink-0" />
            <Select
              value={field.relatedTo || "__none__"}
              onValueChange={(v) => onUpdate(index, "relatedTo", v === "__none__" ? "" : v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Lier à..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Aucune relation</SelectItem>
                {availableSources.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    Basé sur « {s.name} »
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <Button size="icon" variant="ghost" onClick={() => onRemove(index)} className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ---- Preview Table ----
function DataPreviewTable({ data, fields }: { data: Record<string, unknown>[]; fields: FieldDefinition[] }) {
  if (!data.length) return null;
  const headers = fields.map((f) => f.name);
  const rows = data.slice(0, 50);

  return (
    <ScrollArea className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-muted-foreground w-10">#</TableHead>
            {headers.map((h) => (
              <TableHead key={h} className="font-semibold whitespace-nowrap">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
              {headers.map((h) => (
                <TableCell key={h} className="font-mono text-sm max-w-[200px] truncate">
                  {row[h] === null ? (
                    <span className="text-muted-foreground italic">null</span>
                  ) : (
                    String(row[h])
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
      {data.length > 50 && (
        <p className="text-xs text-muted-foreground mt-2">Affichage limité aux 50 premières lignes sur {data.length}.</p>
      )}
    </ScrollArea>
  );
}

// ---- Main ----
export default function DataGenerator() {
  const [fields, setFields] = useState<FieldDefinition[]>(builtInTemplates[0].fields);
  const [count, setCount] = useState(10);
  const [output, setOutput] = useState("");
  const [generatedData, setGeneratedData] = useState<Record<string, unknown>[]>([]);
  const [outputFormat, setOutputFormat] = useState("json");
  const [includeNull, setIncludeNull] = useState(false);
  const [nullProbability, setNullProbability] = useState(10);
  const [showPreview, setShowPreview] = useState(false);
  const [customSchemas, setCustomSchemas] = useState<SchemaTemplate[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [schemaName, setSchemaName] = useState("");

  useEffect(() => { setCustomSchemas(loadCustomSchemas()); }, []);

  const allTemplates = useMemo(
    () => [...builtInTemplates, ...customSchemas],
    [customSchemas]
  );

  const addField = () => {
    setFields([...fields, { name: `field${fields.length + 1}`, type: "firstName" }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof FieldDefinition, value: string) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    // Clear relation if type changed and can't relate anymore
    if (key === "type" && !canRelate(value)) {
      newFields[index].relatedTo = undefined;
    }
    setFields(newFields);
  };

  const loadTemplate = (templateName: string) => {
    const template = allTemplates.find((t) => t.name === templateName);
    if (template) setFields(template.fields.map((f) => ({ ...f })));
  };

  const handleSaveSchema = () => {
    if (!schemaName.trim()) return;
    const updated = saveCustomSchema({ name: schemaName.trim(), fields, isCustom: true });
    setCustomSchemas(updated);
    setSaveDialogOpen(false);
    setSchemaName("");
    toast.success(`Schéma « ${schemaName.trim()} » sauvegardé`);
  };

  const handleDeleteSchema = (name: string) => {
    const updated = deleteCustomSchema(name);
    setCustomSchemas(updated);
    toast.success(`Schéma « ${name} » supprimé`);
  };

  const generate = useCallback(() => {
    const data = generateDataSet(fields, count, includeNull, nullProbability);
    setGeneratedData(data);
    setOutput(formatOutput(data, fields, outputFormat, includeNull));
  }, [fields, count, outputFormat, includeNull, nullProbability]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copié dans le presse-papiers");
  };

  const downloadFile = () => {
    const extensions: Record<string, string> = { json: "json", csv: "csv", sql: "sql", typescript: "ts" };
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data.${extensions[outputFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          Générateur de Données de Test
        </h1>
        <p className="text-muted-foreground">
          Générez des données réalistes avec relations entre champs, {fieldTypes.length} types et sauvegarde de schémas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Définissez la structure de vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Template</Label>
                  <Select onValueChange={loadTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un template" />
                    </SelectTrigger>
                    <SelectContent>
                      {builtInTemplates.map((t) => (
                        <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                      ))}
                      {customSchemas.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                            Mes schémas
                          </div>
                          {customSchemas.map((s) => (
                            <SelectItem key={`custom-${s.name}`} value={s.name}>
                              <span className="flex items-center gap-2">
                                <BookmarkPlus className="h-3 w-3 text-primary" />
                                {s.name}
                              </span>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-28">
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10000}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Switch checked={includeNull} onCheckedChange={setIncludeNull} />
                  <Label>Inclure null</Label>
                </div>
                {includeNull && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number" min={1} max={50}
                      value={nullProbability}
                      onChange={(e) => setNullProbability(parseInt(e.target.value) || 10)}
                      className="w-16"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Champs ({fields.length})</span>
                <div className="flex gap-2">
                  <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Save className="h-4 w-4 mr-1" /> Sauvegarder
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Sauvegarder le schéma</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <Input
                          placeholder="Nom du schéma"
                          value={schemaName}
                          onChange={(e) => setSchemaName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveSchema()}
                        />
                        <Button onClick={handleSaveSchema} disabled={!schemaName.trim()} className="w-full">
                          Sauvegarder
                        </Button>
                        {customSchemas.length > 0 && (
                          <div className="border-t pt-3 space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Schémas sauvegardés</p>
                            {customSchemas.map((s) => (
                              <div key={s.name} className="flex items-center justify-between text-sm">
                                <span>{s.name} ({s.fields.length} champs)</span>
                                <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => handleDeleteSchema(s.name)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline" onClick={addField}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {fields.map((field, index) => (
                  <FieldRow
                    key={index}
                    field={field}
                    index={index}
                    allFields={fields}
                    onUpdate={updateField}
                    onRemove={removeField}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="sql">SQL INSERT</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generate} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Générer {count} enregistrements
            </Button>
          </div>
        </div>

        {/* Right: Output */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Résultat</span>
                <div className="flex gap-2">
                  {generatedData.length > 0 && (
                    <Button
                      size="sm"
                      variant={showPreview ? "default" : "outline"}
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                      {showPreview ? "Code" : "Tableau"}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={copyToClipboard} disabled={!output}>
                    <Copy className="h-4 w-4 mr-1" /> Copier
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadFile} disabled={!output}>
                    <Download className="h-4 w-4 mr-1" /> .{({ json: "json", csv: "csv", sql: "sql", typescript: "ts" } as Record<string, string>)[outputFormat]}
                  </Button>
                </div>
              </CardTitle>
              {generatedData.length > 0 && (
                <CardDescription>
                  {generatedData.length} enregistrements × {fields.length} champs
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {showPreview && generatedData.length > 0 ? (
                <DataPreviewTable data={generatedData} fields={fields} />
              ) : (
                <Textarea
                  value={output}
                  readOnly
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Cliquez sur 'Générer' pour créer des données..."
                />
              )}
            </CardContent>
          </Card>

          {/* Relation hints */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                Relations entre champs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="rounded border p-2">
                  <span className="font-medium text-foreground">Email</span> → basé sur prénom/nom
                </div>
                <div className="rounded border p-2">
                  <span className="font-medium text-foreground">Username</span> → basé sur prénom/nom
                </div>
                <div className="rounded border p-2">
                  <span className="font-medium text-foreground">Code postal</span> → basé sur ville
                </div>
                <div className="rounded border p-2">
                  <span className="font-medium text-foreground">Slug</span> → basé sur titre/nom
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
