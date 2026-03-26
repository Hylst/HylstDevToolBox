import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, Lock, Key, ExternalLink, RotateCcw, CheckCircle2 } from "lucide-react";
import {
  OWASP_TOP_10, SECURITY_HEADERS, AUTH_BEST_PRACTICES,
  SECURITY_CHECKLIST, SECURITY_TOOLS, CATEGORY_LABELS,
} from "@/lib/security-data";

const STORAGE_KEY = "security-checklist-state";

function loadChecklist(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch { return {}; }
}

function saveChecklist(state: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function SecurityCheatsheet() {
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecklist);

  useEffect(() => { saveChecklist(checked); }, [checked]);

  const allItems = SECURITY_CHECKLIST.flatMap(c => c.items);
  const doneCount = allItems.filter(item => checked[item]).length;
  const progress = Math.round((doneCount / allItems.length) * 100);

  const toggleCheck = (item: string) => {
    setChecked(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const resetChecklist = () => {
    setChecked({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const severityColor = (s: string) => {
    if (s === "critical") return "destructive";
    if (s === "high") return "secondary";
    return "outline";
  };

  const importanceColor = (i: string) => {
    if (i === "critical") return "destructive";
    if (i === "recommended") return "secondary";
    return "outline";
  };

  const importanceLabel = (i: string) => {
    if (i === "critical") return "Obligatoire";
    if (i === "recommended") return "Recommandé";
    return "Optionnel";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Security Cheatsheet</h1>
          <p className="text-muted-foreground">OWASP Top 10, authentification, headers et checklist interactive</p>
        </div>
      </div>

      <Tabs defaultValue="owasp">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="owasp">OWASP Top 10</TabsTrigger>
          <TabsTrigger value="auth">Auth & JWT</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="tools">Outils</TabsTrigger>
        </TabsList>

        {/* OWASP */}
        <TabsContent value="owasp" className="space-y-4">
          <p className="text-sm text-muted-foreground">Les 10 risques de sécurité les plus critiques pour les applications web (OWASP 2021).</p>
          {OWASP_TOP_10.map(vuln => (
            <Card key={vuln.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{vuln.id} — {vuln.name}</CardTitle>
                    <CardDescription>{vuln.description}</CardDescription>
                  </div>
                  <Badge variant={severityColor(vuln.severity) as any}>{vuln.severity}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-destructive mb-2">❌ Vulnérable</p>
                    <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-52">{vuln.vulnerable}</pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">✅ Sécurisé</p>
                    <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-52">{vuln.secure}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Auth & JWT */}
        <TabsContent value="auth" className="space-y-4">
          <p className="text-sm text-muted-foreground">Bonnes pratiques pour l'authentification, les tokens JWT, OAuth et la gestion des mots de passe.</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Badge key={key} variant="outline">{label}</Badge>
            ))}
          </div>
          {AUTH_BEST_PRACTICES.map((bp, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{bp.title}</CardTitle>
                    <CardDescription>{bp.description}</CardDescription>
                  </div>
                  <Badge variant="outline">{CATEGORY_LABELS[bp.category]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-destructive mb-2">❌ À éviter</p>
                    <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-60">{bp.bad}</pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">✅ Recommandé</p>
                    <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-60">{bp.good}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Headers */}
        <TabsContent value="headers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Security Headers HTTP</CardTitle>
              <CardDescription>Headers essentiels pour sécuriser votre application web — classés par importance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {SECURITY_HEADERS.map(h => (
                <div key={h.name} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-mono text-sm font-bold">{h.name}</p>
                    <Badge variant={importanceColor(h.importance) as any} className="text-xs shrink-0">{importanceLabel(h.importance)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{h.desc}</p>
                  <pre className="bg-muted p-2 rounded mt-2 text-xs font-mono overflow-auto">{h.name}: {h.value}</pre>
                </div>
              ))}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium mb-2">Express.js — Configuration complète avec Helmet</p>
                  <pre className="bg-muted p-3 rounded text-xs font-mono overflow-auto">{`import helmet from 'helmet';
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'"],
    connectSrc: ["'self'", "https://api.myapp.com"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
  }
}));
app.use(helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }));
app.disable('x-powered-by');`}</pre>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklist */}
        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Security Checklist
                  </CardTitle>
                  <CardDescription>{doneCount} / {allItems.length} complétés — progression sauvegardée automatiquement</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={resetChecklist} className="gap-1">
                  <RotateCcw className="h-3 w-3" /> Reset
                </Button>
              </div>
              <Progress value={progress} className="mt-3" />
              {progress === 100 && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">🎉 Toutes les vérifications sont complètes !</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {SECURITY_CHECKLIST.map(cat => {
                const catDone = cat.items.filter(i => checked[i]).length;
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">{cat.category}</h3>
                      <span className="text-xs text-muted-foreground">{catDone}/{cat.items.length}</span>
                    </div>
                    <div className="space-y-1">
                      {cat.items.map(item => (
                        <div
                          key={item}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleCheck(item)}
                        >
                          <Checkbox checked={!!checked[item]} className="mt-0.5" />
                          <span className={`text-sm ${checked[item] ? "line-through text-muted-foreground" : ""}`}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outils */}
        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Outils de sécurité recommandés</CardTitle>
              <CardDescription>Scanners, analyseurs et bibliothèques pour sécuriser vos applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {SECURITY_TOOLS.map(tool => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
