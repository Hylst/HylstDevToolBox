import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Copy, Check, Search, RotateCcw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  name: string;
  category: string;
  icon: string;
  patterns: string[];
}

const templates: Template[] = [
  { name: "Node.js", category: "Runtime", icon: "🟢", patterns: ["node_modules/", "npm-debug.log*", "yarn-debug.log*", "yarn-error.log*", ".pnpm-debug.log*", "package-lock.json", ".npm", ".yarn/cache", ".yarn/unplugged"] },
  { name: "Python", category: "Language", icon: "🐍", patterns: ["__pycache__/", "*.py[cod]", "*$py.class", "*.so", ".Python", "build/", "develop-eggs/", "dist/", "eggs/", "*.egg-info/", ".venv/", "venv/", "env/", ".env"] },
  { name: "Java", category: "Language", icon: "☕", patterns: ["*.class", "*.jar", "*.war", "*.ear", "target/", ".gradle/", "build/", "gradle-app.setting", ".settings/", ".project", ".classpath"] },
  { name: "Go", category: "Language", icon: "🔵", patterns: ["*.exe", "*.exe~", "*.dll", "*.so", "*.dylib", "*.test", "*.out", "vendor/"] },
  { name: "Rust", category: "Language", icon: "🦀", patterns: ["target/", "Cargo.lock", "**/*.rs.bk"] },
  { name: "React", category: "Framework", icon: "⚛️", patterns: ["node_modules/", "build/", ".env.local", ".env.development.local", ".env.test.local", ".env.production.local", "npm-debug.log*"] },
  { name: "Next.js", category: "Framework", icon: "▲", patterns: [".next/", "out/", "node_modules/", ".env*.local", "npm-debug.log*", ".vercel"] },
  { name: "Vue.js", category: "Framework", icon: "💚", patterns: ["node_modules/", "dist/", ".env.local", ".env.*.local", "npm-debug.log*", "yarn-debug.log*"] },
  { name: "Angular", category: "Framework", icon: "🅰️", patterns: ["node_modules/", "dist/", "tmp/", "out-tsc/", ".angular/", ".sass-cache/", "connect.lock"] },
  { name: "Django", category: "Framework", icon: "🎸", patterns: ["*.pyc", "db.sqlite3", "db.sqlite3-journal", "media/", "staticfiles/", ".env", "__pycache__/"] },
  { name: "Laravel", category: "Framework", icon: "🔴", patterns: ["vendor/", "node_modules/", ".env", "storage/*.key", "public/hot", "public/storage", "Homestead.json", "Homestead.yaml"] },
  { name: "macOS", category: "OS", icon: "🍎", patterns: [".DS_Store", ".AppleDouble", ".LSOverride", "._*", ".Spotlight-V100", ".Trashes"] },
  { name: "Windows", category: "OS", icon: "🪟", patterns: ["Thumbs.db", "Thumbs.db:encryptable", "ehthumbs.db", "*.stackdump", "[Dd]esktop.ini", "$RECYCLE.BIN/"] },
  { name: "Linux", category: "OS", icon: "🐧", patterns: ["*~", ".fuse_hidden*", ".directory", ".Trash-*", ".nfs*"] },
  { name: "VS Code", category: "Editor", icon: "💙", patterns: [".vscode/", "*.code-workspace", ".history/"] },
  { name: "JetBrains", category: "Editor", icon: "🧠", patterns: [".idea/", "*.iml", "*.iws", "*.ipr", "out/", ".idea_modules/"] },
  { name: "Vim", category: "Editor", icon: "📝", patterns: ["[._]*.s[a-v][a-z]", "[._]*.sw[a-p]", "[._]s[a-rt-v][a-z]", "[._]ss[a-gi-z]", "[._]sw[a-p]", "Session.vim", "Sessionx.vim", ".netrwhist", "*~", "tags"] },
  { name: "Git", category: "VCS", icon: "🔀", patterns: ["*.orig", "*.BACKUP.*", "*.BASE.*", "*.LOCAL.*", "*.REMOTE.*"] },
  { name: "Docker", category: "DevOps", icon: "🐳", patterns: [".dockerignore", "docker-compose.override.yml"] },
  { name: "Terraform", category: "DevOps", icon: "🏗️", patterns: [".terraform/", "*.tfstate", "*.tfstate.*", "crash.log", "*.tfvars", "override.tf", "override.tf.json"] },
  { name: "Environment", category: "Security", icon: "🔐", patterns: [".env", ".env.local", ".env.*.local", ".env.development", ".env.production", "*.pem", "*.key"] },
  { name: "Logs", category: "General", icon: "📋", patterns: ["logs/", "*.log", "npm-debug.log*", "yarn-debug.log*", "pids/", "*.pid", "*.seed"] },
  { name: "Archives", category: "General", icon: "📦", patterns: ["*.zip", "*.tar.gz", "*.rar", "*.7z", "*.dmg", "*.iso"] },
  { name: "Images", category: "General", icon: "🖼️", patterns: ["*.png", "*.jpg", "*.jpeg", "*.gif", "*.bmp", "*.ico", "*.webp", "*.svg"] },
];

const categories = [...new Set(templates.map(t => t.category))];

export default function GitignoreBuilder() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customPatterns, setCustomPatterns] = useState("");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return templates;
    const q = search.toLowerCase();
    return templates.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  }, [search]);

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const output = useMemo(() => {
    const sections: string[] = [];
    templates.filter(t => selected.has(t.name)).forEach(t => {
      sections.push(`# ${t.icon} ${t.name}`);
      t.patterns.forEach(p => sections.push(p));
      sections.push("");
    });
    if (customPatterns.trim()) {
      sections.push("# Custom");
      sections.push(customPatterns.trim());
      sections.push("");
    }
    return sections.join("\n");
  }, [selected, customPatterns]);

  const totalPatterns = templates.filter(t => selected.has(t.name)).reduce((sum, t) => sum + t.patterns.length, 0)
    + (customPatterns.trim() ? customPatterns.trim().split("\n").length : 0);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: ".gitignore copié !" });
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = ".gitignore";
    a.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          .gitignore Builder
        </h1>
        <p className="text-muted-foreground mt-1">
          Sélectionnez vos technologies et générez un .gitignore complet
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template selection */}
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setSelected(new Set()); setCustomPatterns(""); }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {selected.size > 0 && [...selected].map(name => {
              const t = templates.find(x => x.name === name);
              return (
                <Badge key={name} variant="secondary" className="cursor-pointer" onClick={() => toggle(name)}>
                  {t?.icon} {name} ×
                </Badge>
              );
            })}
          </div>

          {categories.map(cat => {
            const items = filtered.filter(t => t.category === cat);
            if (items.length === 0) return null;
            return (
              <Card key={cat}>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{cat}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {items.map(t => (
                      <label
                        key={t.name}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
                          selected.has(t.name)
                            ? "bg-primary/10 border-primary/30"
                            : "border-transparent hover:bg-muted"
                        }`}
                      >
                        <Checkbox checked={selected.has(t.name)} onCheckedChange={() => toggle(t.name)} />
                        <span className="text-sm">{t.icon} {t.name}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Custom Patterns</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <textarea
                className="w-full bg-muted rounded-lg p-3 text-sm font-mono min-h-[80px] resize-y border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="*.tmp&#10;my-secret-folder/"
                value={customPatterns}
                onChange={e => setCustomPatterns(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>.gitignore <Badge variant="secondary" className="ml-2">{totalPatterns} patterns</Badge></span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={download} disabled={!output.trim()}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted rounded-lg p-4 text-sm font-mono whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                {output || "# Sélectionnez des technologies ci-contre pour générer votre .gitignore"}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
