import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Layers, Copy, Check, Plus, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ScalarType = "String" | "Int" | "Float" | "Boolean" | "ID" | "DateTime" | "JSON";
const scalarTypes: ScalarType[] = ["String", "Int", "Float", "Boolean", "ID", "DateTime", "JSON"];

interface Field {
  id: string;
  name: string;
  type: string;
  isList: boolean;
  isRequired: boolean;
  description: string;
}

interface GqlType {
  id: string;
  name: string;
  kind: "type" | "input" | "enum";
  fields: Field[];
  enumValues: string[];
  description: string;
}

const createField = (): Field => ({
  id: crypto.randomUUID(),
  name: "",
  type: "String",
  isList: false,
  isRequired: true,
  description: "",
});

const createType = (kind: "type" | "input" | "enum" = "type"): GqlType => ({
  id: crypto.randomUUID(),
  name: "",
  kind,
  fields: kind === "enum" ? [] : [createField()],
  enumValues: kind === "enum" ? ["VALUE_1", "VALUE_2"] : [],
  description: "",
});

const defaultTypes: GqlType[] = [
  {
    id: "1", name: "User", kind: "type", description: "A registered user",
    enumValues: [],
    fields: [
      { id: "f1", name: "id", type: "ID", isList: false, isRequired: true, description: "" },
      { id: "f2", name: "name", type: "String", isList: false, isRequired: true, description: "" },
      { id: "f3", name: "email", type: "String", isList: false, isRequired: true, description: "" },
      { id: "f4", name: "posts", type: "Post", isList: true, isRequired: false, description: "" },
      { id: "f5", name: "role", type: "Role", isList: false, isRequired: true, description: "" },
    ],
  },
  {
    id: "2", name: "Post", kind: "type", description: "A blog post",
    enumValues: [],
    fields: [
      { id: "f6", name: "id", type: "ID", isList: false, isRequired: true, description: "" },
      { id: "f7", name: "title", type: "String", isList: false, isRequired: true, description: "" },
      { id: "f8", name: "content", type: "String", isList: false, isRequired: false, description: "" },
      { id: "f9", name: "author", type: "User", isList: false, isRequired: true, description: "" },
      { id: "f10", name: "createdAt", type: "DateTime", isList: false, isRequired: true, description: "" },
    ],
  },
  {
    id: "3", name: "Role", kind: "enum", description: "User roles",
    fields: [],
    enumValues: ["ADMIN", "USER", "MODERATOR"],
  },
];

function generateSDL(types: GqlType[], queries: string[], mutations: string[]): string {
  const lines: string[] = [];

  // Custom scalars
  const usedScalars = new Set<string>();
  types.forEach(t => t.fields.forEach(f => {
    if (f.type === "DateTime") usedScalars.add("DateTime");
    if (f.type === "JSON") usedScalars.add("JSON");
  }));
  usedScalars.forEach(s => lines.push(`scalar ${s}\n`));

  // Types
  types.forEach(t => {
    if (t.description) lines.push(`"""${t.description}"""`);
    if (t.kind === "enum") {
      lines.push(`enum ${t.name} {`);
      t.enumValues.forEach(v => lines.push(`  ${v}`));
      lines.push("}\n");
    } else {
      lines.push(`${t.kind} ${t.name} {`);
      t.fields.filter(f => f.name).forEach(f => {
        const typeStr = f.isList ? `[${f.type}${f.isRequired ? "!" : ""}]` : `${f.type}${f.isRequired ? "!" : ""}`;
        lines.push(`  ${f.name}: ${typeStr}`);
      });
      lines.push("}\n");
    }
  });

  // Query
  if (queries.length > 0) {
    lines.push("type Query {");
    queries.forEach(q => lines.push(`  ${q}`));
    lines.push("}\n");
  }

  // Mutation
  if (mutations.length > 0) {
    lines.push("type Mutation {");
    mutations.forEach(m => lines.push(`  ${m}`));
    lines.push("}");
  }

  return lines.join("\n");
}

export default function GraphQLSchemaBuilder() {
  const { toast } = useToast();
  const [types, setTypes] = useState<GqlType[]>(defaultTypes);
  const [selectedId, setSelectedId] = useState(types[0].id);
  const [queries, setQueries] = useState(["users: [User!]!", "user(id: ID!): User", "posts: [Post!]!"]);
  const [mutations, setMutations] = useState(["createUser(name: String!, email: String!): User!", "createPost(title: String!, authorId: ID!): Post!"]);
  const [newQuery, setNewQuery] = useState("");
  const [newMutation, setNewMutation] = useState("");
  const [copied, setCopied] = useState(false);

  const selected = types.find(t => t.id === selectedId) || types[0];
  const allTypeNames = [...scalarTypes, ...types.map(t => t.name).filter(Boolean)];

  const sdl = useMemo(() => generateSDL(types.filter(t => t.name), queries, mutations), [types, queries, mutations]);

  const updateType = (id: string, patch: Partial<GqlType>) => {
    setTypes(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  };

  const updateField = (typeId: string, fieldId: string, patch: Partial<Field>) => {
    setTypes(prev => prev.map(t => t.id === typeId ? {
      ...t,
      fields: t.fields.map(f => f.id === fieldId ? { ...f, ...patch } : f),
    } : t));
  };

  const addType = (kind: "type" | "input" | "enum") => {
    const nt = createType(kind);
    setTypes([...types, nt]);
    setSelectedId(nt.id);
  };

  const removeType = (id: string) => {
    const next = types.filter(t => t.id !== id);
    setTypes(next);
    if (selectedId === id && next.length > 0) setSelectedId(next[0].id);
  };

  const copy = () => {
    navigator.clipboard.writeText(sdl);
    setCopied(true);
    toast({ title: "Schema SDL copié !" });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Layers className="h-8 w-8 text-primary" />
          GraphQL Schema Builder
        </h1>
        <p className="text-muted-foreground mt-1">
          Construisez visuellement un schéma GraphQL — types, queries, mutations et export SDL
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Type list */}
        <div className="lg:col-span-3 space-y-3">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex justify-between items-center">
                Types
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addType("type")}>+Type</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addType("enum")}>+Enum</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addType("input")}>+Input</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {types.map(t => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    t.id === selectedId ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedId(t.id)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {t.kind === "enum" ? "E" : t.kind === "input" ? "I" : "T"}
                    </Badge>
                    <span className="text-sm font-medium">{t.name || "(sans nom)"}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); removeType(t.id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Queries */}
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">Queries</CardTitle></CardHeader>
            <CardContent className="space-y-2 pt-0">
              {queries.map((q, i) => (
                <div key={i} className="flex items-center gap-1">
                  <code className="text-xs bg-muted rounded px-2 py-1 flex-1 truncate">{q}</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setQueries(queries.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-1">
                <Input placeholder="users: [User!]!" value={newQuery} onChange={e => setNewQuery(e.target.value)} className="text-xs h-7" />
                <Button size="sm" className="h-7" onClick={() => { if (newQuery) { setQueries([...queries, newQuery]); setNewQuery(""); } }}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mutations */}
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">Mutations</CardTitle></CardHeader>
            <CardContent className="space-y-2 pt-0">
              {mutations.map((m, i) => (
                <div key={i} className="flex items-center gap-1">
                  <code className="text-xs bg-muted rounded px-2 py-1 flex-1 truncate">{m}</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMutations(mutations.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-1">
                <Input placeholder="createUser(...): User!" value={newMutation} onChange={e => setNewMutation(e.target.value)} className="text-xs h-7" />
                <Button size="sm" className="h-7" onClick={() => { if (newMutation) { setMutations([...mutations, newMutation]); setNewMutation(""); } }}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Type editor */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm">
              Éditer : {selected.kind} {selected.name || "..."}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Nom</Label>
              <Input value={selected.name} onChange={e => updateType(selected.id, { name: e.target.value })} placeholder="User" className="mt-1 h-8" />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input value={selected.description} onChange={e => updateType(selected.id, { description: e.target.value })} placeholder="Optionnel" className="mt-1 h-8" />
            </div>

            {selected.kind === "enum" ? (
              <div>
                <Label className="text-xs mb-2 block">Valeurs</Label>
                {selected.enumValues.map((v, i) => (
                  <div key={i} className="flex gap-1 mb-1">
                    <Input
                      value={v}
                      onChange={e => updateType(selected.id, { enumValues: selected.enumValues.map((val, j) => j === i ? e.target.value : val) })}
                      className="h-7 text-xs font-mono"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateType(selected.id, { enumValues: selected.enumValues.filter((_, j) => j !== i) })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => updateType(selected.id, { enumValues: [...selected.enumValues, "NEW_VALUE"] })}>
                  <Plus className="h-3 w-3 mr-1" /> Valeur
                </Button>
              </div>
            ) : (
              <div>
                <Label className="text-xs mb-2 block">Champs</Label>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {selected.fields.map(f => (
                    <div key={f.id} className="border rounded-lg p-2 space-y-2">
                      <div className="flex gap-1">
                        <Input placeholder="name" value={f.name} onChange={e => updateField(selected.id, f.id, { name: e.target.value })} className="h-7 text-xs flex-1" />
                        <Select value={f.type} onValueChange={v => updateField(selected.id, f.id, { type: v })}>
                          <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {allTypeNames.map(tn => (
                              <SelectItem key={tn} value={tn}>{tn}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateType(selected.id, { fields: selected.fields.filter(ff => ff.id !== f.id) })}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <label className="flex items-center gap-1">
                          <Checkbox checked={f.isRequired} onCheckedChange={v => updateField(selected.id, f.id, { isRequired: !!v })} />
                          Required
                        </label>
                        <label className="flex items-center gap-1">
                          <Checkbox checked={f.isList} onCheckedChange={v => updateField(selected.id, f.id, { isList: !!v })} />
                          List
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs mt-2" onClick={() => updateType(selected.id, { fields: [...selected.fields, createField()] })}>
                  <Plus className="h-3 w-3 mr-1" /> Champ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SDL output */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Schema SDL
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted rounded-lg p-4 text-sm font-mono whitespace-pre-wrap max-h-[600px] overflow-y-auto">{sdl}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
