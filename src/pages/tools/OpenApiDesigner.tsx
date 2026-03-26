import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, Plus, Trash2, Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface Endpoint { id: string; method: string; path: string; summary: string; }

export default function OpenApiDesigner() {
  const [title, setTitle] = useState("My API");
  const [version, setVersion] = useState("1.0.0");
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    { id: "1", method: "GET", path: "/users", summary: "List all users" },
    { id: "2", method: "POST", path: "/users", summary: "Create a user" },
  ]);

  const addEndpoint = () => setEndpoints([...endpoints, { id: Date.now().toString(), method: "GET", path: "/", summary: "" }]);
  const removeEndpoint = (id: string) => setEndpoints(endpoints.filter(e => e.id !== id));
  const updateEndpoint = (id: string, field: keyof Endpoint, value: string) => setEndpoints(endpoints.map(e => e.id === id ? { ...e, [field]: value } : e));

  const generateSpec = () => {
    const paths: Record<string, any> = {};
    endpoints.forEach(e => {
      if (!paths[e.path]) paths[e.path] = {};
      paths[e.path][e.method.toLowerCase()] = { summary: e.summary, responses: { "200": { description: "Success" } } };
    });
    return JSON.stringify({ openapi: "3.0.0", info: { title, version }, paths }, null, 2);
  };

  const copy = () => { navigator.clipboard.writeText(generateSpec()); toast.success("Copié !"); };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Layers className="h-8 w-8 text-primary" />OpenAPI Designer</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Info</CardTitle></CardHeader><CardContent className="space-y-4">
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="API Title" />
            <Input value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0.0" />
          </CardContent></Card>
          <Card><CardHeader className="flex-row justify-between"><CardTitle>Endpoints</CardTitle><Button size="sm" onClick={addEndpoint}><Plus className="h-4 w-4" /></Button></CardHeader><CardContent className="space-y-4">
            {endpoints.map(e => (
              <div key={e.id} className="flex gap-2 items-center">
                <Select value={e.method} onValueChange={v => updateEndpoint(e.id, "method", v)}><SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>{["GET", "POST", "PUT", "DELETE", "PATCH"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={e.path} onChange={ev => updateEndpoint(e.id, "path", ev.target.value)} placeholder="/path" className="flex-1" />
                <Button size="icon" variant="ghost" onClick={() => removeEndpoint(e.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent></Card>
        </div>
        <Card><CardHeader className="flex-row justify-between"><CardTitle>OpenAPI Spec</CardTitle><Button size="sm" variant="outline" onClick={copy}><Copy className="h-4 w-4" /></Button></CardHeader><CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs h-[500px]">{generateSpec()}</pre>
        </CardContent></Card>
      </div>
    </div>
  );
}
