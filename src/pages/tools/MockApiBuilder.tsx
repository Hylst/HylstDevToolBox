import { useState } from "react";
import { Server, Plus, Trash2, Copy, Download, Play, Code } from "lucide-react";
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

interface Endpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  statusCode: number;
  headers: Record<string, string>;
  responseBody: string;
  delay: number;
  useFaker: boolean;
}

const defaultEndpoints: Endpoint[] = [
  {
    id: "1",
    method: "GET",
    path: "/api/users",
    description: "Get all users",
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    responseBody: JSON.stringify([
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" }
    ], null, 2),
    delay: 0,
    useFaker: false,
  },
  {
    id: "2",
    method: "GET",
    path: "/api/users/:id",
    description: "Get user by ID",
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    responseBody: JSON.stringify({ id: 1, name: "John Doe", email: "john@example.com" }, null, 2),
    delay: 100,
    useFaker: false,
  },
  {
    id: "3",
    method: "POST",
    path: "/api/users",
    description: "Create a new user",
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    responseBody: JSON.stringify({ id: 3, name: "New User", email: "new@example.com", createdAt: "2024-01-01T00:00:00Z" }, null, 2),
    delay: 200,
    useFaker: true,
  },
];

const statusCodes = [
  { value: 200, label: "200 OK" },
  { value: 201, label: "201 Created" },
  { value: 204, label: "204 No Content" },
  { value: 400, label: "400 Bad Request" },
  { value: 401, label: "401 Unauthorized" },
  { value: 403, label: "403 Forbidden" },
  { value: 404, label: "404 Not Found" },
  { value: 500, label: "500 Internal Server Error" },
];

const methodColors: Record<string, string> = {
  GET: "bg-green-500/20 text-green-400 border-green-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PUT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PATCH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function MockApiBuilder() {
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<Endpoint[]>(defaultEndpoints);
  const [selectedId, setSelectedId] = useState<string | null>(defaultEndpoints[0]?.id || null);
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const [exportFormat, setExportFormat] = useState<"json-server" | "msw" | "openapi">("json-server");

  const selectedEndpoint = endpoints.find(e => e.id === selectedId);

  const addEndpoint = () => {
    const newEndpoint: Endpoint = {
      id: Date.now().toString(),
      method: "GET",
      path: "/api/new-endpoint",
      description: "New endpoint",
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      responseBody: "{}",
      delay: 0,
      useFaker: false,
    };
    setEndpoints([...endpoints, newEndpoint]);
    setSelectedId(newEndpoint.id);
  };

  const updateEndpoint = (id: string, updates: Partial<Endpoint>) => {
    setEndpoints(endpoints.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEndpoint = (id: string) => {
    setEndpoints(endpoints.filter(e => e.id !== id));
    if (selectedId === id) {
      setSelectedId(endpoints[0]?.id || null);
    }
  };

  const generateExport = () => {
    switch (exportFormat) {
      case "json-server": {
        const routes: Record<string, unknown> = {};
        const db: Record<string, unknown[]> = {};
        
        endpoints.forEach(ep => {
          const resource = ep.path.split("/")[2] || "data";
          try {
            const body = JSON.parse(ep.responseBody);
            if (Array.isArray(body)) {
              db[resource] = body;
            } else {
              if (!db[resource]) db[resource] = [];
              (db[resource] as unknown[]).push(body);
            }
          } catch {
            db[resource] = [{ data: ep.responseBody }];
          }
        });

        return JSON.stringify({ db, routes: {} }, null, 2);
      }

      case "msw": {
        const handlers = endpoints.map(ep => {
          return `rest.${ep.method.toLowerCase()}('${baseUrl}${ep.path}', (req, res, ctx) => {
  return res(
    ctx.delay(${ep.delay}),
    ctx.status(${ep.statusCode}),
    ${Object.entries(ep.headers).map(([k, v]) => `ctx.set('${k}', '${v}')`).join(',\n    ')},
    ctx.json(${ep.responseBody})
  );
}),`;
        }).join('\n\n');

        return `import { rest } from 'msw';

export const handlers = [
${handlers}
];`;
      }

      case "openapi": {
        const paths: Record<string, Record<string, unknown>> = {};
        
        endpoints.forEach(ep => {
          const pathKey = ep.path.replace(/:(\w+)/g, '{$1}');
          if (!paths[pathKey]) paths[pathKey] = {};
          
          paths[pathKey][ep.method.toLowerCase()] = {
            summary: ep.description,
            responses: {
              [ep.statusCode]: {
                description: ep.description,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                    },
                    example: JSON.parse(ep.responseBody || "{}"),
                  },
                },
              },
            },
          };
        });

        const openapi = {
          openapi: "3.0.3",
          info: {
            title: "Mock API",
            version: "1.0.0",
          },
          servers: [{ url: baseUrl }],
          paths,
        };

        return JSON.stringify(openapi, null, 2);
      }
    }
  };

  const copyExport = () => {
    navigator.clipboard.writeText(generateExport());
    toast({ title: "Copié !", description: `Configuration ${exportFormat} copiée` });
  };

  const downloadExport = () => {
    const content = generateExport();
    const extensions: Record<string, string> = {
      "json-server": "json",
      msw: "ts",
      openapi: "json",
    };
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock-api.${extensions[exportFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Server className="h-8 w-8 text-primary" />
          Mock API Builder
        </h1>
        <p className="text-muted-foreground">
          Créez des APIs mock pour le développement et les tests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Endpoints ({endpoints.length})</span>
              <Button size="sm" onClick={addEndpoint}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label>Base URL</Label>
              <Input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {endpoints.map(ep => (
                  <div
                    key={ep.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedId === ep.id ? "bg-primary/10 border-primary" : "bg-muted/50 hover:bg-muted"
                    }`}
                    onClick={() => setSelectedId(ep.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={methodColors[ep.method]}>
                        {ep.method}
                      </Badge>
                      <code className="text-sm truncate flex-1">{ep.path}</code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={e => {
                          e.stopPropagation();
                          deleteEndpoint(ep.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{ep.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configuration de l'Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEndpoint ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Méthode</Label>
                    <Select
                      value={selectedEndpoint.method}
                      onValueChange={v => updateEndpoint(selectedEndpoint.id, { method: v as Endpoint["method"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["GET", "POST", "PUT", "PATCH", "DELETE"].map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Path</Label>
                    <Input
                      value={selectedEndpoint.path}
                      onChange={e => updateEndpoint(selectedEndpoint.id, { path: e.target.value })}
                      placeholder="/api/resource/:id"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={selectedEndpoint.description}
                    onChange={e => updateEndpoint(selectedEndpoint.id, { description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Status Code</Label>
                    <Select
                      value={String(selectedEndpoint.statusCode)}
                      onValueChange={v => updateEndpoint(selectedEndpoint.id, { statusCode: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusCodes.map(sc => (
                          <SelectItem key={sc.value} value={String(sc.value)}>{sc.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Délai (ms)</Label>
                    <Input
                      type="number"
                      value={selectedEndpoint.delay}
                      onChange={e => updateEndpoint(selectedEndpoint.id, { delay: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Switch
                      checked={selectedEndpoint.useFaker}
                      onCheckedChange={v => updateEndpoint(selectedEndpoint.id, { useFaker: v })}
                    />
                    <Label>Données dynamiques</Label>
                  </div>
                </div>

                <div>
                  <Label>Headers (JSON)</Label>
                  <Input
                    value={JSON.stringify(selectedEndpoint.headers)}
                    onChange={e => {
                      try {
                        updateEndpoint(selectedEndpoint.id, { headers: JSON.parse(e.target.value) });
                      } catch {}
                    }}
                  />
                </div>

                <div>
                  <Label>Response Body (JSON)</Label>
                  <Textarea
                    value={selectedEndpoint.responseBody}
                    onChange={e => updateEndpoint(selectedEndpoint.id, { responseBody: e.target.value })}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un endpoint ou créez-en un nouveau</p>
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
              <Select value={exportFormat} onValueChange={v => setExportFormat(v as typeof exportFormat)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json-server">json-server</SelectItem>
                  <SelectItem value="msw">MSW (Mock Service Worker)</SelectItem>
                  <SelectItem value="openapi">OpenAPI 3.0</SelectItem>
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
