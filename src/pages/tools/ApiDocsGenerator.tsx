import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileText, Copy, ArrowRight, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";

const sampleSpec = `{
  "openapi": "3.0.0",
  "info": {
    "title": "User API",
    "version": "1.0.0",
    "description": "API de gestion des utilisateurs"
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "Liste des utilisateurs",
        "description": "Retourne la liste paginée des utilisateurs",
        "tags": ["Users"],
        "parameters": [
          { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
          { "name": "limit", "in": "query", "schema": { "type": "integer", "default": 20 } }
        ],
        "responses": {
          "200": {
            "description": "Liste retournée avec succès",
            "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/User" } } } }
          }
        }
      },
      "post": {
        "summary": "Créer un utilisateur",
        "tags": ["Users"],
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "$ref": "#/components/schemas/CreateUser" } } }
        },
        "responses": {
          "201": { "description": "Utilisateur créé" },
          "400": { "description": "Données invalides" }
        }
      }
    },
    "/users/{id}": {
      "get": {
        "summary": "Détail d'un utilisateur",
        "tags": ["Users"],
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "Utilisateur trouvé" },
          "404": { "description": "Non trouvé" }
        }
      },
      "put": {
        "summary": "Modifier un utilisateur",
        "tags": ["Users"],
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": { "200": { "description": "Mis à jour" } }
      },
      "delete": {
        "summary": "Supprimer un utilisateur",
        "tags": ["Users"],
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": { "204": { "description": "Supprimé" } }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "format": "uuid" },
          "email": { "type": "string", "format": "email" },
          "name": { "type": "string" },
          "role": { "type": "string", "enum": ["admin", "user"] },
          "createdAt": { "type": "string", "format": "date-time" }
        }
      },
      "CreateUser": {
        "type": "object",
        "required": ["email", "name"],
        "properties": {
          "email": { "type": "string", "format": "email" },
          "name": { "type": "string" },
          "role": { "type": "string", "enum": ["admin", "user"], "default": "user" }
        }
      }
    }
  }
}`;

const methodColors: Record<string, string> = {
  get: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  post: "bg-green-500/10 text-green-600 border-green-500/20",
  put: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  patch: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  delete: "bg-red-500/10 text-red-600 border-red-500/20",
};

interface Endpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  tags: string[];
  parameters: any[];
  requestBody: any;
  responses: Record<string, any>;
}

export default function ApiDocsGenerator() {
  const { toast } = useToast();
  const [specInput, setSpecInput] = useState(sampleSpec);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [apiInfo, setApiInfo] = useState<any>(null);
  const [schemas, setSchemas] = useState<Record<string, any>>({});
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);

  const parseSpec = () => {
    try {
      const spec = JSON.parse(specInput);
      setApiInfo(spec.info || {});
      setSchemas(spec.components?.schemas || {});

      const eps: Endpoint[] = [];
      for (const [path, methods] of Object.entries(spec.paths || {})) {
        for (const [method, details] of Object.entries(methods as any)) {
          if (["get", "post", "put", "patch", "delete"].includes(method)) {
            eps.push({
              method,
              path,
              summary: (details as any).summary || "",
              description: (details as any).description || "",
              tags: (details as any).tags || [],
              parameters: (details as any).parameters || [],
              requestBody: (details as any).requestBody,
              responses: (details as any).responses || {},
            });
          }
        }
      }
      setEndpoints(eps);
      toast({ title: `${eps.length} endpoints parsés` });
    } catch (err: any) {
      toast({ title: "JSON invalide", description: err.message, variant: "destructive" });
    }
  };

  const generateMarkdown = () => {
    let md = `# ${apiInfo?.title || "API"}\n\n`;
    md += `${apiInfo?.description || ""}\n\n**Version:** ${apiInfo?.version || "1.0"}\n\n---\n\n`;

    const tags = [...new Set(endpoints.flatMap((e) => e.tags))];
    for (const tag of tags) {
      md += `## ${tag}\n\n`;
      for (const ep of endpoints.filter((e) => e.tags.includes(tag))) {
        md += `### \`${ep.method.toUpperCase()}\` ${ep.path}\n\n`;
        md += `${ep.summary}\n\n`;
        if (ep.description) md += `${ep.description}\n\n`;
        if (ep.parameters.length) {
          md += `| Param | In | Type | Required |\n|---|---|---|---|\n`;
          for (const p of ep.parameters) {
            md += `| ${p.name} | ${p.in} | ${p.schema?.type || "string"} | ${p.required ? "✅" : "❌"} |\n`;
          }
          md += "\n";
        }
        md += `**Responses:**\n\n`;
        for (const [code, res] of Object.entries(ep.responses)) {
          md += `- \`${code}\`: ${(res as any).description}\n`;
        }
        md += "\n---\n\n";
      }
    }

    // Ungrouped
    const ungrouped = endpoints.filter((e) => e.tags.length === 0);
    if (ungrouped.length) {
      md += `## Other\n\n`;
      for (const ep of ungrouped) {
        md += `### \`${ep.method.toUpperCase()}\` ${ep.path}\n\n${ep.summary}\n\n---\n\n`;
      }
    }

    if (Object.keys(schemas).length) {
      md += `## Schemas\n\n`;
      for (const [name, schema] of Object.entries(schemas)) {
        md += `### ${name}\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n\n`;
      }
    }

    return md;
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !" });
  };

  const toggleEndpoint = (key: string) => setExpandedEndpoint(expandedEndpoint === key ? null : key);

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          API Docs Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Générez une documentation interactive depuis un schema OpenAPI/Swagger
        </p>
      </div>

      <Tabs defaultValue="input">
        <TabsList>
          <TabsTrigger value="input">Spec OpenAPI</TabsTrigger>
          <TabsTrigger value="preview" disabled={endpoints.length === 0}>Documentation</TabsTrigger>
          <TabsTrigger value="markdown" disabled={endpoints.length === 0}>Export Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <Textarea value={specInput} onChange={(e) => setSpecInput(e.target.value)} className="font-mono text-xs min-h-[400px]" placeholder="Collez votre spec OpenAPI JSON ici..." />
              <Button onClick={parseSpec} className="mt-3">
                <ArrowRight className="h-4 w-4 mr-2" /> Parser & Générer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {apiInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{apiInfo.title}</CardTitle>
                <p className="text-muted-foreground">{apiInfo.description}</p>
                <Badge variant="secondary">v{apiInfo.version}</Badge>
              </CardHeader>
            </Card>
          )}

          <div className="space-y-2">
            {endpoints.map((ep, i) => {
              const key = `${ep.method}-${ep.path}`;
              const isExpanded = expandedEndpoint === key;
              return (
                <Card key={i}>
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleEndpoint(key)}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Badge className={`font-mono text-xs uppercase ${methodColors[ep.method] || ""}`}>
                      {ep.method}
                    </Badge>
                    <code className="font-mono text-sm">{ep.path}</code>
                    <span className="text-sm text-muted-foreground ml-2">{ep.summary}</span>
                    {ep.tags.map((t) => <Badge key={t} variant="outline" className="ml-auto text-xs">{t}</Badge>)}
                  </div>
                  {isExpanded && (
                    <CardContent className="pt-0 space-y-4">
                      {ep.description && <p className="text-sm text-muted-foreground">{ep.description}</p>}

                      {ep.parameters.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Paramètres</h4>
                          <table className="w-full text-sm">
                            <thead><tr className="border-b"><th className="text-left py-1.5 text-muted-foreground">Nom</th><th className="text-left py-1.5 text-muted-foreground">In</th><th className="text-left py-1.5 text-muted-foreground">Type</th><th className="text-left py-1.5 text-muted-foreground">Requis</th></tr></thead>
                            <tbody>
                              {ep.parameters.map((p: any, j: number) => (
                                <tr key={j} className="border-b"><td className="py-1.5 font-mono text-xs">{p.name}</td><td className="py-1.5">{p.in}</td><td className="py-1.5"><Badge variant="outline" className="text-xs">{p.schema?.type || "string"}</Badge></td><td className="py-1.5">{p.required ? "✅" : "❌"}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium text-sm mb-2">Réponses</h4>
                        <div className="space-y-1">
                          {Object.entries(ep.responses).map(([code, res]: [string, any]) => (
                            <div key={code} className="flex items-center gap-2">
                              <Badge variant={code.startsWith("2") ? "default" : code.startsWith("4") ? "destructive" : "secondary"} className="font-mono text-xs">{code}</Badge>
                              <span className="text-sm">{res.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {Object.keys(schemas).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Schemas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(schemas).map(([name, schema]) => (
                  <div key={name}>
                    <h4 className="font-mono font-medium mb-1">{name}</h4>
                    <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-auto">{JSON.stringify(schema, null, 2)}</pre>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="markdown">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Markdown Export</CardTitle>
                <Button size="sm" variant="outline" onClick={() => copy(generateMarkdown())}>
                  <Copy className="h-4 w-4 mr-1" /> Copier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-auto max-h-[600px] whitespace-pre-wrap">
                {generateMarkdown()}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
