import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitCommit, Copy, History, Trash2, Check, FileText } from "lucide-react";
import { toast } from "sonner";

interface CommitType { type: string; description: string; emoji: string; }
interface SavedCommit { id: string; message: string; timestamp: number; }

const commitTypes: CommitType[] = [
  { type: "feat", description: "Nouvelle fonctionnalité", emoji: "✨" },
  { type: "fix", description: "Correction de bug", emoji: "🐛" },
  { type: "docs", description: "Documentation", emoji: "📝" },
  { type: "style", description: "Style/formatage", emoji: "💄" },
  { type: "refactor", description: "Refactorisation", emoji: "♻️" },
  { type: "perf", description: "Performances", emoji: "⚡" },
  { type: "test", description: "Tests", emoji: "✅" },
  { type: "build", description: "Build/dépendances", emoji: "📦" },
  { type: "ci", description: "Configuration CI", emoji: "🔧" },
  { type: "chore", description: "Autres changements", emoji: "🔨" },
  { type: "revert", description: "Annulation de commit", emoji: "⏪" },
];

const scopeSuggestions: Record<string, string[]> = {
  feat: ["ui", "api", "auth", "core", "db", "i18n", "payments"],
  fix: ["ui", "api", "auth", "core", "db", "security", "performance"],
  docs: ["readme", "api", "changelog", "contributing", "license"],
  style: ["ui", "components", "layout", "theme"],
  refactor: ["core", "api", "utils", "components", "hooks"],
  perf: ["api", "db", "render", "bundle", "cache"],
  test: ["unit", "integration", "e2e", "api", "components"],
  build: ["deps", "config", "docker", "ci", "webpack", "vite"],
  ci: ["github", "gitlab", "jenkins", "docker", "deploy"],
  chore: ["deps", "config", "scripts", "cleanup"],
  revert: ["feat", "fix", "refactor"],
};

const allScopes = [...new Set(Object.values(scopeSuggestions).flat())].sort();

export default function GitCommitGenerator() {
  const [type, setType] = useState("feat");
  const [scope, setScope] = useState("");
  const [customScope, setCustomScope] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [breakingDescription, setBreakingDescription] = useState("");
  const [useEmoji, setUseEmoji] = useState(true);
  const [history, setHistory] = useState<SavedCommit[]>([]);
  const [scopeFilter, setScopeFilter] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("git-commit-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const selectedType = commitTypes.find(t => t.type === type)!;
  const finalScope = customScope || scope;

  const suggestedScopes = useMemo(() => {
    const typeScopes = scopeSuggestions[type] || [];
    const all = [...new Set([...typeScopes, ...allScopes])];
    if (!scopeFilter) return all.slice(0, 12);
    return all.filter(s => s.includes(scopeFilter.toLowerCase())).slice(0, 12);
  }, [type, scopeFilter]);

  const generateCommit = (): string => {
    let commit = "";
    if (useEmoji) commit += selectedType.emoji + " ";
    commit += type;
    if (finalScope) commit += `(${finalScope})`;
    if (isBreaking) commit += "!";
    commit += `: ${description}`;
    if (body) commit += `\n\n${body}`;
    if (isBreaking && breakingDescription) commit += `\n\nBREAKING CHANGE: ${breakingDescription}`;
    return commit;
  };

  const commitMessage = generateCommit();
  const isValid = description.length >= 3 && description.length <= 72;

  // Generate changelog preview from history
  const changelogPreview = useMemo(() => {
    if (history.length === 0) return "";
    const grouped: Record<string, string[]> = {};
    const allCommits = isValid ? [{ message: commitMessage }, ...history] : history;
    
    for (const c of allCommits.slice(0, 20)) {
      const firstLine = c.message.split("\n")[0];
      const match = firstLine.match(/^(?:\S+\s)?(\w+)(?:\([^)]*\))?!?:\s*(.+)$/);
      if (!match) continue;
      const [, cType, cDesc] = match;
      const typeInfo = commitTypes.find(t => t.type === cType);
      const label = typeInfo ? `${typeInfo.emoji} ${typeInfo.description}` : cType;
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(cDesc);
    }

    let md = `## [Unreleased] - ${new Date().toISOString().slice(0, 10)}\n\n`;
    for (const [label, items] of Object.entries(grouped)) {
      md += `### ${label}\n`;
      items.forEach(item => { md += `- ${item}\n`; });
      md += "\n";
    }
    return md;
  }, [history, commitMessage, isValid]);

  const copyCommit = () => {
    navigator.clipboard.writeText(commitMessage);
    const newCommit: SavedCommit = { id: Date.now().toString(), message: commitMessage, timestamp: Date.now() };
    const updated = [newCommit, ...history].slice(0, 30);
    setHistory(updated);
    localStorage.setItem("git-commit-history", JSON.stringify(updated));
    toast.success("Commit copié et sauvegardé");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("git-commit-history");
    toast.success("Historique effacé");
  };

  const reset = () => {
    setType("feat"); setScope(""); setCustomScope(""); setDescription("");
    setBody(""); setIsBreaking(false); setBreakingDescription(""); setScopeFilter("");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitCommit className="h-8 w-8 text-primary" /> Git Commit Generator
        </h1>
        <p className="text-muted-foreground mt-1">Générez des messages de commit conventionnels avec preview changelog</p>
      </div>

      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generator"><GitCommit className="h-4 w-4 mr-1" /> Générateur</TabsTrigger>
          <TabsTrigger value="changelog"><FileText className="h-4 w-4 mr-1" /> Changelog Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">Type de commit</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {commitTypes.map((t) => (
                      <Button key={t.type} variant={type === t.type ? "default" : "outline"} className="justify-start h-auto py-2 px-3" onClick={() => { setType(t.type); setScopeFilter(""); }}>
                        <span className="mr-2">{t.emoji}</span>
                        <div className="text-left">
                          <div className="font-mono text-sm">{t.type}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[120px]">{t.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">Détails</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* Scope with autocomplete */}
                  <div>
                    <Label>Scope (optionnel)</Label>
                    <Input
                      value={customScope || scope}
                      onChange={(e) => { setCustomScope(e.target.value); setScopeFilter(e.target.value); setScope(""); }}
                      placeholder="Tapez ou choisissez un scope..."
                      className="mt-1"
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {suggestedScopes.map(s => (
                        <Badge
                          key={s}
                          variant={(customScope || scope) === s ? "default" : "secondary"}
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                          onClick={() => { setScope(s); setCustomScope(""); setScopeFilter(""); }}
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label>Description courte *</Label>
                      <span className={`text-xs ${description.length > 72 ? "text-destructive" : "text-muted-foreground"}`}>{description.length}/72</span>
                    </div>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez brièvement le changement..." className={description.length > 72 ? "border-destructive" : ""} />
                    <p className="text-xs text-muted-foreground mt-1">Impératif : "add feature" pas "added feature"</p>
                  </div>

                  <div>
                    <Label>Corps (optionnel)</Label>
                    <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Expliquez le pourquoi et le comment..." className="mt-1 min-h-[80px]" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <Label>Breaking Change</Label>
                      <p className="text-xs text-muted-foreground">Changement incompatible</p>
                    </div>
                    <Switch checked={isBreaking} onCheckedChange={setIsBreaking} />
                  </div>

                  {isBreaking && (
                    <div>
                      <Label>Description du breaking change</Label>
                      <Textarea value={breakingDescription} onChange={(e) => setBreakingDescription(e.target.value)} placeholder="Comment migrer..." className="mt-1" />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div><Label>Emojis (Gitmoji)</Label></div>
                    <Switch checked={useEmoji} onCheckedChange={setUseEmoji} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Prévisualisation</CardTitle>
                    <Badge variant={isValid ? "default" : "destructive"}>{isValid ? <><Check className="h-3 w-3 mr-1" /> Valide</> : "Invalide"}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="p-3 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap break-all">{commitMessage || "..."}</pre>
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1" onClick={copyCommit} disabled={!isValid}><Copy className="h-4 w-4 mr-2" /> Copier</Button>
                    <Button variant="outline" onClick={reset}>Reset</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5" /> Historique</CardTitle>
                    {history.length > 0 && <Button variant="ghost" size="sm" onClick={clearHistory}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">Aucun commit</p>
                  ) : (
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2">
                        {history.map((commit) => (
                          <div key={commit.id} className="p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => { navigator.clipboard.writeText(commit.message); toast.success("Copié"); }}>
                            <p className="font-mono text-xs truncate">{commit.message.split("\n")[0]}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(commit.timestamp).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="changelog">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><FileText className="h-5 w-5" /> Changelog généré</span>
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(changelogPreview); toast.success("Changelog copié"); }}>
                  <Copy className="h-4 w-4 mr-1" /> Copier
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {changelogPreview ? (
                <pre className="bg-muted p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">{changelogPreview}</pre>
              ) : (
                <p className="text-center text-muted-foreground py-8">Générez des commits pour voir le changelog</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
