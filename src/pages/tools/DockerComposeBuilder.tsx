import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Container, Plus, Trash2, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import YAML from "js-yaml";

interface Port { host: string; container: string; }
interface Volume { host: string; container: string; }
interface EnvVar { key: string; value: string; }
interface Service {
  id: string; name: string; image: string; ports: Port[]; volumes: Volume[];
  envVars: EnvVar[]; restart: string; dependsOn: string[]; command: string;
  networks: string[];
}

const imagePresets = [
  "nginx:alpine", "postgres:16", "redis:alpine", "mysql:8", "mongo:7",
  "node:20-alpine", "python:3.12-slim", "rabbitmq:3-management",
  "elasticsearch:8.12.0", "grafana/grafana:latest", "prom/prometheus:latest",
  "traefik:v3.0", "mailhog/mailhog", "adminer:latest", "minio/minio:latest",
];

let nextId = 1;
function createService(): Service {
  const id = `svc-${nextId++}`;
  return { id, name: "", image: "", ports: [], volumes: [], envVars: [], restart: "unless-stopped", dependsOn: [], command: "", networks: [] };
}

function generateYaml(services: Service[], networks: string[]): string {
  const doc: any = { version: "3.8", services: {} };
  for (const s of services) {
    if (!s.name) continue;
    const svc: any = { image: s.image || "alpine" };
    if (s.ports.length > 0) svc.ports = s.ports.filter(p => p.host && p.container).map(p => `${p.host}:${p.container}`);
    if (s.volumes.length > 0) svc.volumes = s.volumes.filter(v => v.host && v.container).map(v => `${v.host}:${v.container}`);
    if (s.envVars.length > 0) svc.environment = Object.fromEntries(s.envVars.filter(e => e.key).map(e => [e.key, e.value]));
    if (s.restart !== "no") svc.restart = s.restart;
    if (s.dependsOn.length > 0) svc.depends_on = s.dependsOn;
    if (s.command) svc.command = s.command;
    if (s.networks.length > 0) svc.networks = s.networks;
    doc.services[s.name] = svc;
  }
  if (networks.length > 0) {
    doc.networks = Object.fromEntries(networks.map(n => [n, { driver: "bridge" }]));
  }
  return YAML.dump(doc, { lineWidth: -1, quotingType: '"', forceQuotes: false });
}

export default function DockerComposeBuilder() {
  const [services, setServices] = useState<Service[]>([createService()]);
  const [networks, setNetworks] = useState<string[]>([]);
  const [newNetwork, setNewNetwork] = useState("");

  const updateService = (id: string, patch: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const addService = () => setServices(prev => [...prev, createService()]);
  const removeService = (id: string) => setServices(prev => prev.filter(s => s.id !== id));

  const yaml = generateYaml(services, networks);

  const addNetwork = () => {
    if (newNetwork && !networks.includes(newNetwork)) {
      setNetworks(prev => [...prev, newNetwork]);
      setNewNetwork("");
    }
  };

  const copyYaml = () => { navigator.clipboard.writeText(yaml); toast.success("docker-compose.yml copié !"); };
  const downloadYaml = () => {
    const blob = new Blob([yaml], { type: "text/yaml" });
    const link = document.createElement("a");
    link.download = "docker-compose.yml";
    link.href = URL.createObjectURL(blob);
    link.click();
    toast.success("Fichier téléchargé !");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Container className="h-8 w-8 text-primary" />Docker Compose Builder
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Services */}
        <div className="space-y-4">
          {services.map((svc, idx) => (
            <Card key={svc.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Service {idx + 1}</CardTitle>
                  {services.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeService(svc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Nom</Label>
                    <Input value={svc.name} onChange={e => updateService(svc.id, { name: e.target.value })} placeholder="web" />
                  </div>
                  <div>
                    <Label className="text-xs">Image</Label>
                    <Select value={svc.image} onValueChange={v => updateService(svc.id, { image: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>
                        {imagePresets.map(img => <SelectItem key={img} value={img}>{img}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Restart</Label>
                  <Select value={svc.restart} onValueChange={v => updateService(svc.id, { restart: v })}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["no", "always", "on-failure", "unless-stopped"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Command</Label>
                  <Input value={svc.command} onChange={e => updateService(svc.id, { command: e.target.value })} placeholder="optionnel" className="h-8" />
                </div>

                {/* Ports */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Ports</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateService(svc.id, { ports: [...svc.ports, { host: "", container: "" }] })}>
                      <Plus className="h-3 w-3 mr-1" />Port
                    </Button>
                  </div>
                  {svc.ports.map((p, pi) => (
                    <div key={pi} className="flex gap-1 items-center mt-1">
                      <Input value={p.host} onChange={e => { const ports = [...svc.ports]; ports[pi] = { ...p, host: e.target.value }; updateService(svc.id, { ports }); }} placeholder="8080" className="h-7 text-xs" />
                      <span className="text-xs text-muted-foreground">:</span>
                      <Input value={p.container} onChange={e => { const ports = [...svc.ports]; ports[pi] = { ...p, container: e.target.value }; updateService(svc.id, { ports }); }} placeholder="80" className="h-7 text-xs" />
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateService(svc.id, { ports: svc.ports.filter((_, i) => i !== pi) })}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>

                {/* Env vars */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Variables d'env</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateService(svc.id, { envVars: [...svc.envVars, { key: "", value: "" }] })}>
                      <Plus className="h-3 w-3 mr-1" />Env
                    </Button>
                  </div>
                  {svc.envVars.map((env, ei) => (
                    <div key={ei} className="flex gap-1 items-center mt-1">
                      <Input value={env.key} onChange={e => { const envVars = [...svc.envVars]; envVars[ei] = { ...env, key: e.target.value }; updateService(svc.id, { envVars }); }} placeholder="KEY" className="h-7 text-xs font-mono" />
                      <span className="text-xs">=</span>
                      <Input value={env.value} onChange={e => { const envVars = [...svc.envVars]; envVars[ei] = { ...env, value: e.target.value }; updateService(svc.id, { envVars }); }} placeholder="value" className="h-7 text-xs font-mono" />
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateService(svc.id, { envVars: svc.envVars.filter((_, i) => i !== ei) })}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>

                {/* Volumes */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Volumes</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateService(svc.id, { volumes: [...svc.volumes, { host: "", container: "" }] })}>
                      <Plus className="h-3 w-3 mr-1" />Volume
                    </Button>
                  </div>
                  {svc.volumes.map((v, vi) => (
                    <div key={vi} className="flex gap-1 items-center mt-1">
                      <Input value={v.host} onChange={e => { const volumes = [...svc.volumes]; volumes[vi] = { ...v, host: e.target.value }; updateService(svc.id, { volumes }); }} placeholder="./data" className="h-7 text-xs font-mono" />
                      <span className="text-xs">:</span>
                      <Input value={v.container} onChange={e => { const volumes = [...svc.volumes]; volumes[vi] = { ...v, container: e.target.value }; updateService(svc.id, { volumes }); }} placeholder="/var/lib/data" className="h-7 text-xs font-mono" />
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateService(svc.id, { volumes: svc.volumes.filter((_, i) => i !== vi) })}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>

                {/* Networks */}
                {networks.length > 0 && (
                  <div>
                    <Label className="text-xs">Networks</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {networks.map(n => (
                        <Badge
                          key={n}
                          variant={svc.networks.includes(n) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            const nets = svc.networks.includes(n) ? svc.networks.filter(x => x !== n) : [...svc.networks, n];
                            updateService(svc.id, { networks: nets });
                          }}
                        >{n}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Depends on */}
                {services.length > 1 && (
                  <div>
                    <Label className="text-xs">Depends on</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {services.filter(s => s.id !== svc.id && s.name).map(s => (
                        <Badge
                          key={s.id}
                          variant={svc.dependsOn.includes(s.name) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            const deps = svc.dependsOn.includes(s.name) ? svc.dependsOn.filter(d => d !== s.name) : [...svc.dependsOn, s.name];
                            updateService(svc.id, { dependsOn: deps });
                          }}
                        >{s.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-2">
            <Button onClick={addService} variant="outline" className="flex-1"><Plus className="h-4 w-4 mr-1" />Ajouter un service</Button>
          </div>

          {/* Networks */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Networks</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input value={newNetwork} onChange={e => setNewNetwork(e.target.value)} placeholder="frontend" className="h-8" onKeyDown={e => e.key === "Enter" && addNetwork()} />
                <Button size="sm" onClick={addNetwork}><Plus className="h-4 w-4" /></Button>
              </div>
              {networks.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {networks.map(n => (
                    <Badge key={n} variant="secondary" className="cursor-pointer" onClick={() => setNetworks(prev => prev.filter(x => x !== n))}>
                      {n} ×
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* YAML Output */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">docker-compose.yml</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={copyYaml}><Copy className="h-4 w-4 mr-1" />Copier</Button>
                  <Button size="sm" variant="outline" onClick={downloadYaml}><Download className="h-4 w-4 mr-1" />.yml</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/50 rounded-lg p-4 text-sm font-mono overflow-auto max-h-[600px] whitespace-pre">{yaml}</pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
