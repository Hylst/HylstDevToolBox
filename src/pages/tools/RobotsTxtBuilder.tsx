import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Rule {
  id: string;
  userAgent: string;
  disallow: string[];
  allow: string[];
}

const TEMPLATES: Record<string, { rules: Rule[]; sitemap: string }> = {
  default: {
    rules: [{ id: "1", userAgent: "*", disallow: [], allow: ["/"] }],
    sitemap: "https://example.com/sitemap.xml",
  },
  wordpress: {
    rules: [
      { id: "1", userAgent: "*", disallow: ["/wp-admin/", "/wp-includes/", "/wp-content/plugins/", "/trackback/", "/feed/", "/?s="], allow: ["/wp-admin/admin-ajax.php"] },
    ],
    sitemap: "https://example.com/sitemap_index.xml",
  },
  nextjs: {
    rules: [
      { id: "1", userAgent: "*", disallow: ["/_next/", "/api/", "/admin/"], allow: ["/"] },
    ],
    sitemap: "https://example.com/sitemap.xml",
  },
  spa: {
    rules: [
      { id: "1", userAgent: "*", disallow: ["/api/", "/admin/", "/private/"], allow: ["/"] },
    ],
    sitemap: "https://example.com/sitemap.xml",
  },
  strict: {
    rules: [
      { id: "1", userAgent: "*", disallow: ["/"], allow: [] },
    ],
    sitemap: "",
  },
  blockAI: {
    rules: [
      { id: "1", userAgent: "GPTBot", disallow: ["/"], allow: [] },
      { id: "2", userAgent: "ChatGPT-User", disallow: ["/"], allow: [] },
      { id: "3", userAgent: "Google-Extended", disallow: ["/"], allow: [] },
      { id: "4", userAgent: "*", disallow: [], allow: ["/"] },
    ],
    sitemap: "https://example.com/sitemap.xml",
  },
};

let idCounter = 100;

export default function RobotsTxtBuilder() {
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[]>(TEMPLATES.default.rules);
  const [sitemap, setSitemap] = useState(TEMPLATES.default.sitemap);
  const [copied, setCopied] = useState(false);

  const addRule = () => {
    setRules(prev => [...prev, { id: String(++idCounter), userAgent: "*", disallow: [], allow: [] }]);
  };

  const removeRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const updateRule = (id: string, field: keyof Rule, value: string | string[]) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addPath = (ruleId: string, field: "disallow" | "allow") => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, [field]: [...r[field], "/"] } : r));
  };

  const updatePath = (ruleId: string, field: "disallow" | "allow", idx: number, value: string) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      const paths = [...r[field]];
      paths[idx] = value;
      return { ...r, [field]: paths };
    }));
  };

  const removePath = (ruleId: string, field: "disallow" | "allow", idx: number) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r;
      return { ...r, [field]: r[field].filter((_, i) => i !== idx) };
    }));
  };

  const applyTemplate = (name: string) => {
    const t = TEMPLATES[name];
    if (t) {
      setRules(t.rules.map((r, i) => ({ ...r, id: String(++idCounter + i) })));
      setSitemap(t.sitemap);
    }
  };

  const output = (() => {
    const lines: string[] = [];
    rules.forEach(rule => {
      lines.push(`User-agent: ${rule.userAgent}`);
      rule.disallow.forEach(p => lines.push(`Disallow: ${p}`));
      rule.allow.forEach(p => lines.push(`Allow: ${p}`));
      if (rule.disallow.length === 0 && rule.allow.length === 0) {
        lines.push(`Disallow:`);
      }
      lines.push("");
    });
    if (sitemap.trim()) {
      lines.push(`Sitemap: ${sitemap}`);
    }
    return lines.join("\n").trim();
  })();

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: "Copié !", description: "robots.txt copié dans le presse-papier" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Robots.txt Builder</h1>
        <p className="text-muted-foreground mt-1">Constructeur visuel de robots.txt avec templates et validation</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Label className="w-full text-sm font-medium">Templates :</Label>
        {[
          { key: "default", label: "Par défaut" },
          { key: "wordpress", label: "WordPress" },
          { key: "nextjs", label: "Next.js" },
          { key: "spa", label: "SPA" },
          { key: "strict", label: "Bloquer tout" },
          { key: "blockAI", label: "Bloquer IA" },
        ].map(t => (
          <Button key={t.key} variant="outline" size="sm" onClick={() => applyTemplate(t.key)}>
            {t.label}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          {rules.map(rule => (
            <Card key={rule.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Règle</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => removeRule(rule.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">User-Agent</Label>
                  <Input value={rule.userAgent} onChange={e => updateRule(rule.id, "userAgent", e.target.value)} className="h-8 text-sm" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs">Disallow</Label>
                    <Button variant="ghost" size="sm" onClick={() => addPath(rule.id, "disallow")} className="h-6 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Ajouter
                    </Button>
                  </div>
                  {rule.disallow.map((p, i) => (
                    <div key={i} className="flex gap-1 mb-1">
                      <Input value={p} onChange={e => updatePath(rule.id, "disallow", i, e.target.value)} className="h-7 text-xs font-mono" />
                      <Button variant="ghost" size="sm" onClick={() => removePath(rule.id, "disallow", i)} className="h-7 px-2">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs">Allow</Label>
                    <Button variant="ghost" size="sm" onClick={() => addPath(rule.id, "allow")} className="h-6 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Ajouter
                    </Button>
                  </div>
                  {rule.allow.map((p, i) => (
                    <div key={i} className="flex gap-1 mb-1">
                      <Input value={p} onChange={e => updatePath(rule.id, "allow", i, e.target.value)} className="h-7 text-xs font-mono" />
                      <Button variant="ghost" size="sm" onClick={() => removePath(rule.id, "allow", i)} className="h-7 px-2">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-3">
            <Button variant="outline" onClick={addRule}><Plus className="h-4 w-4 mr-2" /> Ajouter une règle</Button>
          </div>

          <div>
            <Label>Sitemap URL</Label>
            <Input value={sitemap} onChange={e => setSitemap(e.target.value)} placeholder="https://example.com/sitemap.xml" />
          </div>
        </div>

        {/* Output */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">robots.txt</CardTitle>
              <CardDescription>Fichier généré</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={copyOutput}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-sm font-mono whitespace-pre-wrap min-h-[200px]">{output}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
