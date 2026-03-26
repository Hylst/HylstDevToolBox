import { useState, useMemo } from "react";
import { Shield, Copy, Download, AlertTriangle, CheckCircle, Info, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface Header {
  name: string;
  value: string;
}

interface HeaderInfo {
  name: string;
  description: string;
  category: "security" | "cache" | "cors" | "cookie" | "content" | "other";
  recommended?: string;
  link?: string;
}

const headerDatabase: Record<string, HeaderInfo> = {
  "content-security-policy": {
    name: "Content-Security-Policy",
    description: "Contrôle les ressources que le navigateur peut charger",
    category: "security",
    recommended: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
  },
  "strict-transport-security": {
    name: "Strict-Transport-Security",
    description: "Force les connexions HTTPS",
    category: "security",
    recommended: "max-age=31536000; includeSubDomains; preload",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security",
  },
  "x-content-type-options": {
    name: "X-Content-Type-Options",
    description: "Empêche le MIME sniffing",
    category: "security",
    recommended: "nosniff",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options",
  },
  "x-frame-options": {
    name: "X-Frame-Options",
    description: "Protection contre le clickjacking",
    category: "security",
    recommended: "DENY",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options",
  },
  "x-xss-protection": {
    name: "X-XSS-Protection",
    description: "Protection XSS intégrée au navigateur (obsolète)",
    category: "security",
    recommended: "0",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection",
  },
  "referrer-policy": {
    name: "Referrer-Policy",
    description: "Contrôle les informations de referrer envoyées",
    category: "security",
    recommended: "strict-origin-when-cross-origin",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy",
  },
  "permissions-policy": {
    name: "Permissions-Policy",
    description: "Contrôle les fonctionnalités du navigateur",
    category: "security",
    recommended: "geolocation=(), camera=(), microphone=()",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy",
  },
  "cache-control": {
    name: "Cache-Control",
    description: "Directives de mise en cache",
    category: "cache",
    recommended: "public, max-age=31536000, immutable",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control",
  },
  "etag": {
    name: "ETag",
    description: "Identifiant de version pour le cache",
    category: "cache",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag",
  },
  "access-control-allow-origin": {
    name: "Access-Control-Allow-Origin",
    description: "Origines autorisées pour CORS",
    category: "cors",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin",
  },
  "access-control-allow-methods": {
    name: "Access-Control-Allow-Methods",
    description: "Méthodes HTTP autorisées pour CORS",
    category: "cors",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods",
  },
  "access-control-allow-headers": {
    name: "Access-Control-Allow-Headers",
    description: "En-têtes autorisés pour CORS",
    category: "cors",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers",
  },
  "set-cookie": {
    name: "Set-Cookie",
    description: "Définit un cookie",
    category: "cookie",
    recommended: "name=value; HttpOnly; Secure; SameSite=Strict",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie",
  },
  "content-type": {
    name: "Content-Type",
    description: "Type MIME du contenu",
    category: "content",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type",
  },
};

const securityHeaders = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];

const headerTemplates = {
  "API REST": [
    { name: "Content-Type", value: "application/json; charset=utf-8" },
    { name: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
    { name: "X-Content-Type-Options", value: "nosniff" },
    { name: "Access-Control-Allow-Origin", value: "*" },
    { name: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
    { name: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
  ],
  "SPA sécurisée": [
    { name: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'" },
    { name: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
    { name: "X-Content-Type-Options", value: "nosniff" },
    { name: "X-Frame-Options", value: "DENY" },
    { name: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { name: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
  ],
  "Assets statiques": [
    { name: "Cache-Control", value: "public, max-age=31536000, immutable" },
    { name: "Content-Type", value: "text/css; charset=utf-8" },
    { name: "X-Content-Type-Options", value: "nosniff" },
  ],
  "Téléchargement fichier": [
    { name: "Content-Type", value: "application/octet-stream" },
    { name: "Content-Disposition", value: "attachment; filename=\"file.pdf\"" },
    { name: "Cache-Control", value: "private, no-cache" },
    { name: "X-Content-Type-Options", value: "nosniff" },
  ],
};

type ExportFormat = "nginx" | "apache" | "vercel" | "netlify" | "express";

export default function HttpHeadersAnalyzer() {
  const { toast } = useToast();
  const [headers, setHeaders] = useState<Header[]>([
    { name: "Content-Type", value: "application/json" },
    { name: "Cache-Control", value: "no-cache" },
  ]);
  const [rawInput, setRawInput] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("nginx");

  const addHeader = () => {
    setHeaders([...headers, { name: "", value: "" }]);
  };

  const updateHeader = (index: number, field: "name" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const loadTemplate = (templateName: keyof typeof headerTemplates) => {
    setHeaders(headerTemplates[templateName]);
  };

  const parseRawHeaders = () => {
    const lines = rawInput.split("\n").filter(l => l.trim());
    const parsed: Header[] = [];
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        parsed.push({
          name: line.substring(0, colonIndex).trim(),
          value: line.substring(colonIndex + 1).trim(),
        });
      }
    }
    if (parsed.length > 0) {
      setHeaders(parsed);
      toast({ title: "Importé !", description: `${parsed.length} headers importés` });
    }
  };

  const securityScore = useMemo(() => {
    const headerNames = headers.map(h => h.name.toLowerCase());
    const presentSecurityHeaders = securityHeaders.filter(sh => headerNames.includes(sh));
    return Math.round((presentSecurityHeaders.length / securityHeaders.length) * 100);
  }, [headers]);

  const analysis = useMemo(() => {
    const results: { header: string; status: "good" | "warning" | "missing"; message: string; info?: HeaderInfo }[] = [];
    const headerMap = new Map(headers.map(h => [h.name.toLowerCase(), h.value]));

    for (const secHeader of securityHeaders) {
      const value = headerMap.get(secHeader);
      const info = headerDatabase[secHeader];
      
      if (!value) {
        results.push({
          header: info?.name || secHeader,
          status: "missing",
          message: `Header manquant. Recommandé: ${info?.recommended || "À configurer"}`,
          info,
        });
      } else {
        results.push({
          header: info?.name || secHeader,
          status: "good",
          message: `Présent: ${value}`,
          info,
        });
      }
    }

    // Check for common issues
    const csp = headerMap.get("content-security-policy");
    if (csp?.includes("unsafe-eval")) {
      results.push({
        header: "CSP Warning",
        status: "warning",
        message: "'unsafe-eval' dans CSP peut être dangereux",
      });
    }

    const hsts = headerMap.get("strict-transport-security");
    if (hsts && !hsts.includes("includeSubDomains")) {
      results.push({
        header: "HSTS Warning",
        status: "warning",
        message: "Considérez ajouter 'includeSubDomains' à HSTS",
      });
    }

    return results;
  }, [headers]);

  const generateExport = () => {
    switch (exportFormat) {
      case "nginx":
        return headers.map(h => `add_header ${h.name} "${h.value}";`).join("\n");
      case "apache":
        return headers.map(h => `Header set ${h.name} "${h.value}"`).join("\n");
      case "vercel":
        return JSON.stringify({
          headers: [{
            source: "/(.*)",
            headers: headers.map(h => ({ key: h.name, value: h.value })),
          }],
        }, null, 2);
      case "netlify":
        return `/*\n${headers.map(h => `  ${h.name}: ${h.value}`).join("\n")}`;
      case "express":
        return `app.use((req, res, next) => {\n${headers.map(h => `  res.setHeader('${h.name}', '${h.value}');`).join("\n")}\n  next();\n});`;
    }
  };

  const copyExport = () => {
    navigator.clipboard.writeText(generateExport());
    toast({ title: "Copié !", description: "Configuration copiée" });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          HTTP Headers Analyzer
        </h1>
        <p className="text-muted-foreground">
          Analysez, configurez et exportez vos en-têtes HTTP pour la sécurité et les performances
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Headers ({headers.length})</span>
                <div className="flex gap-2">
                  <Select onValueChange={v => loadTemplate(v as keyof typeof headerTemplates)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Templates" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(headerTemplates).map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={addHeader}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {headers.map((header, index) => {
                    const info = headerDatabase[header.name.toLowerCase()];
                    return (
                      <div key={index} className="flex gap-2 items-start p-2 bg-muted/50 rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Nom du header"
                            value={header.name}
                            onChange={e => updateHeader(index, "name", e.target.value)}
                            list="header-suggestions"
                          />
                          <Input
                            placeholder="Valeur"
                            value={header.value}
                            onChange={e => updateHeader(index, "value", e.target.value)}
                          />
                          {info && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {info.category}
                              </Badge>
                              {info.description}
                              {info.link && (
                                <a href={info.link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => removeHeader(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <datalist id="header-suggestions">
                {Object.values(headerDatabase).map(h => (
                  <option key={h.name} value={h.name} />
                ))}
              </datalist>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import brut</CardTitle>
              <CardDescription>Collez des headers au format "Nom: Valeur" (un par ligne)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={rawInput}
                onChange={e => setRawInput(e.target.value)}
                placeholder="Content-Type: application/json&#10;Cache-Control: no-cache"
                className="min-h-[100px] font-mono text-sm"
              />
              <Button onClick={parseRawHeaders} className="mt-2" disabled={!rawInput.trim()}>
                Importer
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Score de Sécurité</span>
                <Badge variant={securityScore >= 80 ? "default" : securityScore >= 50 ? "secondary" : "destructive"}>
                  {securityScore}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={securityScore} className="h-3 mb-4" />
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {analysis.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        item.status === "good" ? "bg-green-500/10 border-green-500/30" :
                        item.status === "warning" ? "bg-yellow-500/10 border-yellow-500/30" :
                        "bg-red-500/10 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.status === "good" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : item.status === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Info className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{item.header}</span>
                        {item.info?.link && (
                          <a href={item.info.link} target="_blank" rel="noopener noreferrer" className="ml-auto">
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Export</span>
                <div className="flex gap-2">
                  <Select value={exportFormat} onValueChange={v => setExportFormat(v as ExportFormat)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nginx">Nginx</SelectItem>
                      <SelectItem value="apache">Apache</SelectItem>
                      <SelectItem value="vercel">Vercel</SelectItem>
                      <SelectItem value="netlify">Netlify</SelectItem>
                      <SelectItem value="express">Express.js</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={copyExport}>
                    <Copy className="h-4 w-4 mr-1" /> Copier
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generateExport()}
                readOnly
                className="min-h-[150px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
