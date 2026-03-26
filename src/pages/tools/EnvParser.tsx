import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Copy, Download, Upload, Plus, Trash2, Eye, EyeOff, FileCode,
  ArrowLeftRight, AlertTriangle, CheckCircle, GitCompare, Minus, FileText, Settings
} from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/Tooltip";

interface EnvVariable {
  key: string;
  value: string;
  isSecret: boolean;
  description?: string;
}

interface DiffResult {
  key: string;
  leftValue?: string;
  rightValue?: string;
  status: "same" | "different" | "left-only" | "right-only";
  isSecret: boolean;
}

const secretKeywords = [
  'secret', 'password', 'pwd', 'pass', 'key', 'token', 'api_key', 'apikey',
  'private', 'credential', 'auth', 'bearer', 'jwt', 'access', 'refresh'
];

const isLikelySecret = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return secretKeywords.some(keyword => lowerKey.includes(keyword));
};

const envTemplates = [
  {
    name: "Next.js / Vercel",
    template: `# App Configuration
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# External APIs
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx`,
  },
  {
    name: "Node.js / Express",
    template: `# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=password`,
  },
  {
    name: "React / Vite",
    template: `# App Config
VITE_APP_TITLE=My React App
VITE_API_URL=http://localhost:3001/api

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false

# Third-party Services
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX`,
  },
  {
    name: "Docker Compose",
    template: `# Database
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# App
APP_PORT=3000
APP_DEBUG=true`,
  },
  {
    name: "Supabase",
    template: `# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Storage
SUPABASE_STORAGE_BUCKET=uploads

# Auth
SUPABASE_AUTH_EXTERNAL_GOOGLE_ENABLED=true
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx`,
  },
  {
    name: "AWS",
    template: `# AWS Credentials
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1

# S3
S3_BUCKET_NAME=my-bucket
S3_ENDPOINT=https://s3.amazonaws.com

# SES
SES_FROM_EMAIL=noreply@example.com`,
  },
];

const sampleLeft = `# Development Environment
NODE_ENV=development
API_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/myapp_dev
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=dev-secret-key-12345
SESSION_SECRET=session-dev-secret

# Features
ENABLE_DEBUG=true
LOG_LEVEL=debug`;

const sampleRight = `# Production Environment
NODE_ENV=production
API_URL=https://api.myapp.com
DATABASE_URL=postgresql://prod-db.example.com:5432/myapp
REDIS_URL=redis://prod-redis.example.com:6379

# Auth
JWT_SECRET=prod-super-secret-key-67890
SESSION_SECRET=session-prod-secret
OAUTH_CLIENT_ID=google-client-id

# Features
ENABLE_DEBUG=false
LOG_LEVEL=error
CDN_URL=https://cdn.myapp.com`;

// ─── Parser Tab ─────────────────────────────────────────
function ParserTab({
  variables, setVariables, showSecrets, setShowSecrets
}: {
  variables: EnvVariable[];
  setVariables: (v: EnvVariable[]) => void;
  showSecrets: boolean;
  setShowSecrets: (v: boolean) => void;
}) {
  const [envText, setEnvText] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const parseEnvText = () => {
    const lines = envText.split('\n');
    const parsed: EnvVariable[] = [];
    const errors: string[] = [];
    let currentDescription = "";

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) { currentDescription = ""; return; }
      if (trimmed.startsWith('#')) { currentDescription = trimmed.slice(1).trim(); return; }

      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
      if (match) {
        const [, key, rawValue] = match;
        let value = rawValue;
        if ((rawValue.startsWith('"') && rawValue.endsWith('"')) ||
            (rawValue.startsWith("'") && rawValue.endsWith("'"))) {
          value = rawValue.slice(1, -1);
        }
        parsed.push({ key, value, isSecret: isLikelySecret(key), description: currentDescription || undefined });
        currentDescription = "";
      } else if (trimmed.includes('=')) {
        errors.push(`Ligne ${index + 1}: Format de clé invalide "${trimmed.split('=')[0]}"`);
      }
    });

    setVariables(parsed);
    setValidationErrors(errors);
    if (parsed.length > 0) toast.success(`${parsed.length} variable${parsed.length > 1 ? 's' : ''} parsée${parsed.length > 1 ? 's' : ''}`);
  };

  const validateVariables = () => {
    const errors: string[] = [];
    const keys = new Set<string>();
    variables.forEach((v) => {
      if (keys.has(v.key)) errors.push(`Clé dupliquée: ${v.key}`);
      keys.add(v.key);
      if (v.isSecret && !v.value) errors.push(`Secret vide: ${v.key}`);
      if (!/^[A-Z_][A-Z0-9_]*$/i.test(v.key)) errors.push(`Format de clé invalide: ${v.key}`);
      if (['xxx', 'your-secret-here', 'changeme', 'TODO', 'FIXME'].some(p => v.value.includes(p)))
        errors.push(`Valeur placeholder détectée: ${v.key}`);
    });
    setValidationErrors(errors);
    if (errors.length === 0) toast.success("Toutes les variables sont valides !");
    else toast.error(`${errors.length} problème${errors.length > 1 ? 's' : ''} détecté${errors.length > 1 ? 's' : ''}`);
  };

  const maskValue = (value: string): string => {
    if (value.length <= 4) return '•'.repeat(value.length);
    return value.slice(0, 2) + '•'.repeat(Math.min(value.length - 4, 20)) + value.slice(-2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Coller votre fichier .env</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={envText} onChange={(e) => setEnvText(e.target.value)}
            placeholder={`# Configuration\nDATABASE_URL=postgresql://user:pass@localhost/db\nAPI_KEY=your-api-key-here\nDEBUG=true`}
            className="min-h-[250px] font-mono text-sm" />
          <div className="flex gap-3">
            <Button onClick={parseEnvText}><Upload className="h-4 w-4 mr-2" />Parser</Button>
            <Button variant="outline" onClick={() => setEnvText("")}>Effacer</Button>
          </div>
        </CardContent>
      </Card>

      {validationErrors.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />Erreurs de validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i} className="text-sm text-destructive flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-destructive rounded-full" />{error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {variables.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />Variables parsées ({variables.length})
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="show-secrets" className="text-sm">Afficher les secrets</Label>
                  <Switch id="show-secrets" checked={showSecrets} onCheckedChange={setShowSecrets} />
                </div>
                <Button variant="outline" size="sm" onClick={validateVariables}>Valider</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {variables.map((v, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="font-mono font-medium text-primary">{v.key}</code>
                      {v.isSecret && <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">Secret</Badge>}
                    </div>
                    <code className="text-sm text-muted-foreground font-mono block truncate">
                      {v.isSecret && !showSecrets ? maskValue(v.value) : v.value || '(vide)'}
                    </code>
                    {v.description && <p className="text-xs text-muted-foreground mt-1">{v.description}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(`${v.key}=${v.value}`); toast.success("Copié"); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Edit Tab ───────────────────────────────────────────
function EditTab({
  variables, setVariables, showSecrets, setShowSecrets
}: {
  variables: EnvVariable[];
  setVariables: (v: EnvVariable[]) => void;
  showSecrets: boolean;
  setShowSecrets: (v: boolean) => void;
}) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const addVariable = () => {
    if (!newKey) { toast.error("La clé est requise"); return; }
    if (variables.some(v => v.key === newKey)) { toast.error("Cette clé existe déjà"); return; }
    setVariables([...variables, { key: newKey.toUpperCase().replace(/[^A-Z0-9_]/g, '_'), value: newValue, isSecret: isLikelySecret(newKey) }]);
    setNewKey(""); setNewValue("");
    toast.success("Variable ajoutée");
  };

  const removeVariable = (index: number) => setVariables(variables.filter((_, i) => i !== index));

  const updateVariable = (index: number, field: 'key' | 'value' | 'isSecret', value: string | boolean) => {
    const updated = [...variables];
    if (field === 'isSecret') updated[index].isSecret = value as boolean;
    else updated[index][field] = value as string;
    setVariables(updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Ajouter une variable</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Clé</Label>
              <Input value={newKey} onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))} placeholder="MY_VARIABLE" className="font-mono" />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Valeur</Label>
              <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="value" className="font-mono" />
            </div>
            <div className="flex items-end">
              <Button onClick={addVariable}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {variables.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Éditer les variables ({variables.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {variables.map((v, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Input value={v.key} onChange={(e) => updateVariable(i, 'key', e.target.value.toUpperCase())} className="font-mono w-48" />
                  <span className="text-muted-foreground">=</span>
                  <div className="flex-1 relative">
                    <Input type={v.isSecret && !showSecrets ? "password" : "text"} value={v.value} onChange={(e) => updateVariable(i, 'value', e.target.value)} className="font-mono pr-10" />
                    {v.isSecret && (
                      <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0" onClick={() => setShowSecrets(!showSecrets)}>
                        {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip content="Marquer comme secret">
                      <Switch checked={v.isSecret} onCheckedChange={(checked) => updateVariable(i, 'isSecret', checked)} />
                    </Tooltip>
                    <Button variant="ghost" size="sm" onClick={() => removeVariable(i)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Compare Tab ────────────────────────────────────────
function CompareTab() {
  const [leftEnv, setLeftEnv] = useState(sampleLeft);
  const [rightEnv, setRightEnv] = useState(sampleRight);
  const [leftLabel, setLeftLabel] = useState("Development");
  const [rightLabel, setRightLabel] = useState("Production");
  const [hideSecrets, setHideSecrets] = useState(true);
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);

  const parseEnv = (content: string): EnvVariable[] => {
    const lines = content.split("\n");
    const variables: EnvVariable[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        variables.push({ key, value, isSecret: isLikelySecret(key) });
      }
    }
    return variables;
  };

  const diff = useMemo((): DiffResult[] => {
    const leftVars = parseEnv(leftEnv);
    const rightVars = parseEnv(rightEnv);
    const leftMap = new Map(leftVars.map(v => [v.key, v]));
    const rightMap = new Map(rightVars.map(v => [v.key, v]));
    const allKeys = new Set([...leftMap.keys(), ...rightMap.keys()]);
    const results: DiffResult[] = [];

    for (const key of allKeys) {
      const left = leftMap.get(key);
      const right = rightMap.get(key);
      const isSecret = left?.isSecret || right?.isSecret || false;
      if (left && right) {
        results.push({ key, leftValue: left.value, rightValue: right.value, status: left.value === right.value ? "same" : "different", isSecret });
      } else if (left) {
        results.push({ key, leftValue: left.value, status: "left-only", isSecret });
      } else if (right) {
        results.push({ key, rightValue: right.value, status: "right-only", isSecret });
      }
    }
    return results.sort((a, b) => {
      const order = { "left-only": 0, "right-only": 1, "different": 2, "same": 3 };
      return order[a.status] - order[b.status];
    });
  }, [leftEnv, rightEnv]);

  const filteredDiff = showOnlyDiff ? diff.filter(d => d.status !== "same") : diff;
  const stats = {
    total: diff.length,
    same: diff.filter(d => d.status === "same").length,
    different: diff.filter(d => d.status === "different").length,
    leftOnly: diff.filter(d => d.status === "left-only").length,
    rightOnly: diff.filter(d => d.status === "right-only").length
  };

  const maskValue = (value: string, isSecret: boolean): string => {
    if (!hideSecrets || !isSecret) return value;
    if (value.length <= 4) return "****";
    return value.substring(0, 2) + "***" + value.substring(value.length - 2);
  };

  const getStatusIcon = (status: DiffResult["status"]) => {
    switch (status) {
      case "same": return <span className="text-green-500">✓</span>;
      case "different": return <ArrowLeftRight className="h-4 w-4 text-orange-500" />;
      case "left-only": return <Minus className="h-4 w-4 text-destructive" />;
      case "right-only": return <Plus className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: DiffResult["status"]) => {
    switch (status) {
      case "same": return "bg-green-500/10";
      case "different": return "bg-orange-500/10";
      case "left-only": return "bg-destructive/10";
      case "right-only": return "bg-blue-500/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{leftLabel}</CardTitle>
              <Input value={leftLabel} onChange={(e) => setLeftLabel(e.target.value)} className="w-32 text-right text-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <Textarea value={leftEnv} onChange={(e) => setLeftEnv(e.target.value)} className="min-h-[220px] font-mono text-sm" placeholder="Collez votre .env ici..." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{rightLabel}</CardTitle>
              <Input value={rightLabel} onChange={(e) => setRightLabel(e.target.value)} className="w-32 text-right text-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <Textarea value={rightEnv} onChange={(e) => setRightEnv(e.target.value)} className="min-h-[220px] font-mono text-sm" placeholder="Collez votre .env ici..." />
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Variables</p>
        </Card>
        <Card className="p-4 text-center bg-green-500/10">
          <p className="text-2xl font-bold text-green-600">{stats.same}</p>
          <p className="text-xs text-muted-foreground">Identiques</p>
        </Card>
        <Card className="p-4 text-center bg-orange-500/10">
          <p className="text-2xl font-bold text-orange-600">{stats.different}</p>
          <p className="text-xs text-muted-foreground">Différentes</p>
        </Card>
        <Card className="p-4 text-center bg-destructive/10">
          <p className="text-2xl font-bold text-destructive">{stats.leftOnly}</p>
          <p className="text-xs text-muted-foreground">{leftLabel} uniquement</p>
        </Card>
        <Card className="p-4 text-center bg-blue-500/10">
          <p className="text-2xl font-bold text-blue-600">{stats.rightOnly}</p>
          <p className="text-xs text-muted-foreground">{rightLabel} uniquement</p>
        </Card>
      </div>

      {/* Diff table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-lg">Comparaison</CardTitle>
            <div className="flex items-center gap-4">
              <Label className="flex items-center gap-2 text-sm">
                <Switch checked={hideSecrets} onCheckedChange={setHideSecrets} />
                {hideSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Masquer les secrets
              </Label>
              <Label className="flex items-center gap-2 text-sm">
                <Switch checked={showOnlyDiff} onCheckedChange={setShowOnlyDiff} />
                Différences uniquement
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 w-8"></th>
                  <th className="text-left p-2">Variable</th>
                  <th className="text-left p-2">{leftLabel}</th>
                  <th className="text-left p-2">{rightLabel}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiff.map((item) => (
                  <tr key={item.key} className={`border-b ${getStatusColor(item.status)}`}>
                    <td className="p-2">{getStatusIcon(item.status)}</td>
                    <td className="p-2 font-mono font-medium">
                      {item.key}
                      {item.isSecret && <Badge variant="outline" className="ml-2 text-xs">secret</Badge>}
                    </td>
                    <td className="p-2 font-mono text-xs">
                      {item.leftValue !== undefined
                        ? <code className={item.status === "different" ? "text-destructive" : ""}>{maskValue(item.leftValue, item.isSecret)}</code>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-2 font-mono text-xs">
                      {item.rightValue !== undefined
                        ? <code className={item.status === "different" ? "text-green-600" : ""}>{maskValue(item.rightValue, item.isSecret)}</code>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 flex-wrap">
        <Button variant="outline" onClick={() => {
          const allKeys = [...new Set(diff.map(d => d.key))].sort();
          const content = allKeys.map(key => {
            const item = diff.find(d => d.key === key);
            return `${key}=${item?.isSecret ? "your-secret-here" : "your-value-here"}`;
          }).join("\n");
          navigator.clipboard.writeText(content);
          toast.success(".env.example copié");
        }}>
          <Copy className="h-4 w-4 mr-2" /> Copier .env.example
        </Button>
        <Button variant="outline" onClick={() => {
          const merged = diff.map(d => `${d.key}=${d.rightValue || d.leftValue || ""}`).join("\n");
          navigator.clipboard.writeText(merged);
          toast.success("Fichier fusionné copié");
        }}>
          <FileText className="h-4 w-4 mr-2" /> Copier fusionné ({rightLabel})
        </Button>
      </div>
    </div>
  );
}

// ─── Convert Tab ────────────────────────────────────────
function ConvertTab({ variables }: { variables: EnvVariable[] }) {
  const [outputFormat, setOutputFormat] = useState<"dotenv" | "json" | "yaml" | "shell" | "docker">("dotenv");

  const generateOutput = (): string => {
    switch (outputFormat) {
      case "dotenv":
        return variables.map(v => {
          const needsQuotes = v.value.includes(' ') || v.value.includes('#');
          return `${v.key}=${needsQuotes ? `"${v.value.replace(/"/g, '\\"')}"` : v.value}`;
        }).join('\n');
      case "json":
        const obj: Record<string, string> = {};
        variables.forEach(v => { obj[v.key] = v.value; });
        return JSON.stringify(obj, null, 2);
      case "yaml":
        return variables.map(v => {
          const needsQuotes = v.value.includes(':') || v.value.includes('#') || /^\s|\s$/.test(v.value);
          return `${v.key}: ${needsQuotes ? `"${v.value.replace(/"/g, '\\"')}"` : v.value}`;
        }).join('\n');
      case "shell":
        return variables.map(v => `export ${v.key}='${v.value.replace(/'/g, "'\\''")}'`).join('\n');
      case "docker":
        return variables.map(v => `-e ${v.key}="${v.value.replace(/"/g, '\\"')}"`).join(' \\\n  ');
      default: return "";
    }
  };

  const downloadOutput = () => {
    const content = generateOutput();
    const ext = outputFormat === 'json' ? 'json' : outputFormat === 'yaml' ? 'yml' : 'env';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `.env.${ext}`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Format de sortie</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Select value={outputFormat} onValueChange={(v: typeof outputFormat) => setOutputFormat(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="dotenv">.env (standard)</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="yaml">YAML</SelectItem>
            <SelectItem value="shell">Shell (export)</SelectItem>
            <SelectItem value="docker">Docker CLI (-e flags)</SelectItem>
          </SelectContent>
        </Select>
        {variables.length > 0 ? (
          <>
            <div className="p-4 bg-muted/50 rounded-lg">
              <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto max-h-[300px]">{generateOutput()}</pre>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { navigator.clipboard.writeText(generateOutput()); toast.success("Copié"); }}>
                <Copy className="h-4 w-4 mr-2" />Copier
              </Button>
              <Button variant="outline" onClick={downloadOutput}>
                <Download className="h-4 w-4 mr-2" />Télécharger
              </Button>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-8">Parsez d'abord un fichier .env ou ajoutez des variables</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Generate Tab ───────────────────────────────────────
function GenerateTab({ variables }: { variables: EnvVariable[] }) {
  const generateEnvExample = (): string => {
    if (variables.length === 0) return "# No variables loaded\n# Parse a .env file first or add variables manually";
    const grouped: Record<string, EnvVariable[]> = {};
    variables.forEach(v => {
      const prefix = v.key.split('_').slice(0, v.key.split('_').length > 2 ? 2 : 1).join('_');
      if (!grouped[prefix]) grouped[prefix] = [];
      grouped[prefix].push(v);
    });
    return Object.entries(grouped).map(([, vars]) =>
      vars.map(v => {
        const placeholder = v.isSecret ? "your-secret-here" : v.value || "your-value-here";
        const comment = v.isSecret ? " # ⚠️ Secret" : "";
        return `${v.key}=${placeholder}${comment}`;
      }).join('\n')
    ).join('\n\n');
  };

  const content = generateEnvExample();

  return (
    <Card>
      <CardHeader><CardTitle>Générer .env.example</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Génère un fichier .env.example à partir des variables parsées, avec les secrets remplacés par des placeholders.
        </p>
        <div className="p-4 bg-muted/50 rounded-lg">
          <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto max-h-[400px]">{content}</pre>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => { navigator.clipboard.writeText(content); toast.success(".env.example copié"); }}>
            <Copy className="h-4 w-4 mr-2" />Copier
          </Button>
          <Button variant="outline" onClick={() => {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = '.env.example'; a.click();
            URL.revokeObjectURL(url);
            toast.success(".env.example téléchargé");
          }}>
            <Download className="h-4 w-4 mr-2" />Télécharger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Templates Tab ──────────────────────────────────────
function TemplatesTab({ onLoad }: { onLoad: (template: string) => void }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {envTemplates.map((t, i) => (
        <Card key={i} className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader><CardTitle className="text-lg">{t.name}</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded max-h-[150px] overflow-hidden font-mono mb-4">
              {t.template.slice(0, 200)}...
            </pre>
            <Button variant="outline" className="w-full" onClick={() => onLoad(t.template)}>
              Utiliser ce template
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────
export default function EnvParser() {
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [showSecrets, setShowSecrets] = useState(false);
  const [activeTab, setActiveTab] = useState("parse");

  const handleLoadTemplate = (template: string) => {
    const lines = template.split('\n');
    const parsed: EnvVariable[] = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
      if (match) parsed.push({ key: match[1], value: match[2], isSecret: isLikelySecret(match[1]) });
    });
    setVariables(parsed);
    setActiveTab("parse");
    toast.success("Template chargé");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Environment Manager
        </h1>
        <p className="text-muted-foreground">
          Parsez, comparez, convertissez et générez vos fichiers .env — tout-en-un
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="parse"><Upload className="h-4 w-4 mr-2" />Parser</TabsTrigger>
          <TabsTrigger value="edit"><FileCode className="h-4 w-4 mr-2" />Éditer</TabsTrigger>
          <TabsTrigger value="compare"><GitCompare className="h-4 w-4 mr-2" />Comparer</TabsTrigger>
          <TabsTrigger value="convert"><ArrowLeftRight className="h-4 w-4 mr-2" />Convertir</TabsTrigger>
          <TabsTrigger value="generate"><FileText className="h-4 w-4 mr-2" />.env.example</TabsTrigger>
          <TabsTrigger value="templates"><FileCode className="h-4 w-4 mr-2" />Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="parse">
          <ParserTab variables={variables} setVariables={setVariables} showSecrets={showSecrets} setShowSecrets={setShowSecrets} />
        </TabsContent>
        <TabsContent value="edit">
          <EditTab variables={variables} setVariables={setVariables} showSecrets={showSecrets} setShowSecrets={setShowSecrets} />
        </TabsContent>
        <TabsContent value="compare">
          <CompareTab />
        </TabsContent>
        <TabsContent value="convert">
          <ConvertTab variables={variables} />
        </TabsContent>
        <TabsContent value="generate">
          <GenerateTab variables={variables} />
        </TabsContent>
        <TabsContent value="templates">
          <TemplatesTab onLoad={handleLoadTemplate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
