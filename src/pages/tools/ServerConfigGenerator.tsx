import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Server, Copy, Download } from "lucide-react";

interface ConfigOptions {
  domain: string;
  port: string;
  ssl: boolean;
  gzip: boolean;
  cors: boolean;
  corsOrigin: string;
  cacheStatic: boolean;
  cacheDuration: string;
  redirectWww: boolean;
  redirectHttps: boolean;
  spa: boolean;
  proxyPass: string;
  rateLimit: boolean;
  rateLimitRps: string;
  securityHeaders: boolean;
}

const defaultOptions: ConfigOptions = {
  domain: "example.com",
  port: "3000",
  ssl: true,
  gzip: true,
  cors: false,
  corsOrigin: "*",
  cacheStatic: true,
  cacheDuration: "30d",
  redirectWww: true,
  redirectHttps: true,
  spa: false,
  proxyPass: "",
  rateLimit: false,
  rateLimitRps: "10",
  securityHeaders: true,
};

const generateNginx = (o: ConfigOptions) => {
  let config = "";

  if (o.redirectWww) {
    config += `server {\n    listen 80;\n    server_name www.${o.domain};\n    return 301 $scheme://${o.domain}$request_uri;\n}\n\n`;
  }

  if (o.redirectHttps && o.ssl) {
    config += `server {\n    listen 80;\n    server_name ${o.domain};\n    return 301 https://$server_name$request_uri;\n}\n\n`;
  }

  config += `server {\n`;
  config += o.ssl
    ? `    listen 443 ssl http2;\n    server_name ${o.domain};\n\n    ssl_certificate /etc/letsencrypt/live/${o.domain}/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/${o.domain}/privkey.pem;\n    ssl_protocols TLSv1.2 TLSv1.3;\n    ssl_ciphers HIGH:!aNULL:!MD5;\n\n`
    : `    listen 80;\n    server_name ${o.domain};\n\n`;

  if (o.gzip) {
    config += `    # Gzip\n    gzip on;\n    gzip_vary on;\n    gzip_min_length 1024;\n    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;\n\n`;
  }

  if (o.securityHeaders) {
    config += `    # Security headers\n    add_header X-Frame-Options "SAMEORIGIN" always;\n    add_header X-Content-Type-Options "nosniff" always;\n    add_header X-XSS-Protection "1; mode=block" always;\n    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n    add_header Content-Security-Policy "default-src 'self'" always;\n\n`;
  }

  if (o.cors) {
    config += `    # CORS\n    add_header Access-Control-Allow-Origin "${o.corsOrigin}";\n    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";\n    add_header Access-Control-Allow-Headers "Content-Type, Authorization";\n\n`;
  }

  if (o.cacheStatic) {
    config += `    # Static cache\n    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|woff2|svg)$ {\n        expires ${o.cacheDuration};\n        add_header Cache-Control "public, immutable";\n    }\n\n`;
  }

  if (o.rateLimit) {
    config = `limit_req_zone $binary_remote_addr zone=api:10m rate=${o.rateLimitRps}r/s;\n\n` + config;
    config += `    location /api/ {\n        limit_req zone=api burst=20 nodelay;\n`;
    if (o.proxyPass) config += `        proxy_pass http://127.0.0.1:${o.port};\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n`;
    config += `    }\n\n`;
  }

  if (o.proxyPass) {
    config += `    location / {\n        proxy_pass http://127.0.0.1:${o.port};\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n`;
  } else if (o.spa) {
    config += `    root /var/www/${o.domain};\n    index index.html;\n\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n`;
  } else {
    config += `    root /var/www/${o.domain};\n    index index.html;\n`;
  }

  config += `}\n`;
  return config;
};

const generateApache = (o: ConfigOptions) => {
  let config = "";

  if (o.redirectHttps && o.ssl) {
    config += `<VirtualHost *:80>\n    ServerName ${o.domain}\n    Redirect permanent / https://${o.domain}/\n</VirtualHost>\n\n`;
  }

  config += o.ssl
    ? `<VirtualHost *:443>\n    ServerName ${o.domain}\n    DocumentRoot /var/www/${o.domain}\n\n    SSLEngine on\n    SSLCertificateFile /etc/letsencrypt/live/${o.domain}/fullchain.pem\n    SSLCertificateKeyFile /etc/letsencrypt/live/${o.domain}/privkey.pem\n\n`
    : `<VirtualHost *:80>\n    ServerName ${o.domain}\n    DocumentRoot /var/www/${o.domain}\n\n`;

  if (o.gzip) {
    config += `    # Gzip\n    <IfModule mod_deflate.c>\n        AddOutputFilterByType DEFLATE text/html text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml\n    </IfModule>\n\n`;
  }

  if (o.securityHeaders) {
    config += `    # Security headers\n    Header always set X-Frame-Options "SAMEORIGIN"\n    Header always set X-Content-Type-Options "nosniff"\n    Header always set X-XSS-Protection "1; mode=block"\n    Header always set Referrer-Policy "strict-origin-when-cross-origin"\n\n`;
  }

  if (o.cors) {
    config += `    # CORS\n    Header set Access-Control-Allow-Origin "${o.corsOrigin}"\n    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"\n    Header set Access-Control-Allow-Headers "Content-Type, Authorization"\n\n`;
  }

  if (o.cacheStatic) {
    config += `    # Static cache\n    <FilesMatch "\\.(jpg|jpeg|png|gif|ico|css|js|woff2|svg)$">\n        Header set Cache-Control "public, max-age=2592000, immutable"\n    </FilesMatch>\n\n`;
  }

  if (o.proxyPass) {
    config += `    # Reverse proxy\n    ProxyPreserveHost On\n    ProxyPass / http://127.0.0.1:${o.port}/\n    ProxyPassReverse / http://127.0.0.1:${o.port}/\n\n`;
  }

  if (o.spa && !o.proxyPass) {
    config += `    # SPA fallback\n    <IfModule mod_rewrite.c>\n        RewriteEngine On\n        RewriteCond %{REQUEST_FILENAME} !-f\n        RewriteCond %{REQUEST_FILENAME} !-d\n        RewriteRule ^ /index.html [L]\n    </IfModule>\n\n`;
  }

  if (o.redirectWww) {
    config += `    # Redirect www\n    <IfModule mod_rewrite.c>\n        RewriteEngine On\n        RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]\n        RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L]\n    </IfModule>\n\n`;
  }

  config += `</VirtualHost>\n`;
  return config;
};

export default function ServerConfigGenerator() {
  const { toast } = useToast();
  const [options, setOptions] = useState<ConfigOptions>(defaultOptions);
  const [serverType, setServerType] = useState<"nginx" | "apache">("nginx");

  const config = serverType === "nginx" ? generateNginx(options) : generateApache(options);

  const update = (key: keyof ConfigOptions, value: any) => setOptions((prev) => ({ ...prev, [key]: value }));

  const copy = () => {
    navigator.clipboard.writeText(config);
    toast({ title: "Copié !" });
  };

  const download = () => {
    const filename = serverType === "nginx" ? `${options.domain}.conf` : `.htaccess`;
    const blob = new Blob([config], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Server className="h-8 w-8 text-primary" />
          Server Config Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Générez des configurations Nginx et Apache avec SSL, CORS, cache et sécurité
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Options */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={serverType} onValueChange={(v) => setServerType(v as any)}>
                <TabsList className="w-full">
                  <TabsTrigger value="nginx" className="flex-1">Nginx</TabsTrigger>
                  <TabsTrigger value="apache" className="flex-1">Apache</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Domaine</Label>
                  <Input value={options.domain} onChange={(e) => update("domain", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Port backend</Label>
                  <Input value={options.port} onChange={(e) => update("port", e.target.value)} className="mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-xs">Proxy pass (laisser vide pour static)</Label>
                <Input value={options.proxyPass} onChange={(e) => update("proxyPass", e.target.value)} placeholder="http://127.0.0.1:3000" className="mt-1" />
              </div>

              <div className="space-y-3">
                {([
                  ["ssl", "SSL / HTTPS"],
                  ["gzip", "Compression Gzip"],
                  ["securityHeaders", "Headers de sécurité"],
                  ["cacheStatic", "Cache fichiers statiques"],
                  ["redirectHttps", "Redirection HTTP → HTTPS"],
                  ["redirectWww", "Redirection www → non-www"],
                  ["spa", "SPA (fallback index.html)"],
                  ["cors", "CORS Headers"],
                  ["rateLimit", "Rate Limiting"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-sm">{label}</Label>
                    <Switch checked={options[key] as boolean} onCheckedChange={(v) => update(key, v)} />
                  </div>
                ))}
              </div>

              {options.cors && (
                <div>
                  <Label className="text-xs">CORS Origin</Label>
                  <Input value={options.corsOrigin} onChange={(e) => update("corsOrigin", e.target.value)} className="mt-1" />
                </div>
              )}

              {options.cacheStatic && (
                <div>
                  <Label className="text-xs">Durée cache</Label>
                  <Select value={options.cacheDuration} onValueChange={(v) => update("cacheDuration", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 jours</SelectItem>
                      <SelectItem value="30d">30 jours</SelectItem>
                      <SelectItem value="365d">1 an</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {options.rateLimit && (
                <div>
                  <Label className="text-xs">Requêtes/seconde</Label>
                  <Input value={options.rateLimitRps} onChange={(e) => update("rateLimitRps", e.target.value)} className="mt-1" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {serverType === "nginx" ? `${options.domain}.conf` : ".htaccess"}
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copy}><Copy className="h-4 w-4 mr-1" /> Copier</Button>
                  <Button size="sm" variant="outline" onClick={download}><Download className="h-4 w-4 mr-1" /> Télécharger</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-auto max-h-[600px] whitespace-pre">
                {config}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
