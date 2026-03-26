import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Copy, Download, Plus, Trash2, ArrowUp } from "lucide-react";
import { toast } from "sonner";

interface Version {
  version: string;
  date: string;
  commits: string;
}

const commitTypes: Record<string, { emoji: string; title: string; order: number }> = {
  feat: { emoji: "✨", title: "Features", order: 1 },
  fix: { emoji: "🐛", title: "Bug Fixes", order: 2 },
  perf: { emoji: "⚡", title: "Performance", order: 3 },
  refactor: { emoji: "♻️", title: "Refactoring", order: 4 },
  docs: { emoji: "📚", title: "Documentation", order: 5 },
  style: { emoji: "💄", title: "Styles", order: 6 },
  test: { emoji: "✅", title: "Tests", order: 7 },
  build: { emoji: "📦", title: "Build", order: 8 },
  ci: { emoji: "🔧", title: "CI/CD", order: 9 },
  chore: { emoji: "🔨", title: "Chores", order: 10 },
  revert: { emoji: "⏪", title: "Reverts", order: 11 },
};

const sampleCommits = `feat(auth): add OAuth2 login with Google
feat!: redesign user API (breaking change)
fix(ui): resolve button alignment on mobile
fix: handle null pointer in data parser
perf: optimize database queries for dashboard
docs: update API documentation
chore: bump dependencies to latest versions
refactor(core): extract validation logic
test: add unit tests for auth module
feat(dashboard): add export to PDF
fix(auth): fix token refresh race condition`;

const defaultVersions: Version[] = [
  { version: "1.2.0", date: new Date().toISOString().split("T")[0], commits: sampleCommits },
];

export default function ChangelogGenerator() {
  const [versions, setVersions] = useState<Version[]>(defaultVersions);
  const [repoUrl, setRepoUrl] = useState("https://github.com/user/repo");
  const [useEmojis, setUseEmojis] = useState(true);
  const [showScopes, setShowScopes] = useState(true);
  const [groupByScope, setGroupByScope] = useState(false);
  const [keepAChangelog, setKeepAChangelog] = useState(true);

  const parseCommit = (line: string) => {
    const match = line.match(/^(\w+)(!)?(?:\(([^)]+)\))?:\s*(.+)/);
    if (!match) return null;
    return {
      type: match[1],
      breaking: !!match[2],
      scope: match[3] || null,
      message: match[4].trim(),
    };
  };

  const generateChangelog = useMemo(() => {
    let md = keepAChangelog
      ? `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`
      : `# Changelog\n\n`;

    for (const ver of versions) {
      const compareLink = repoUrl ? `[${ver.version}](${repoUrl}/releases/tag/v${ver.version})` : ver.version;
      md += `## ${compareLink} - ${ver.date}\n\n`;

      const parsed = ver.commits
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean)
        .map(parseCommit)
        .filter(Boolean) as NonNullable<ReturnType<typeof parseCommit>>[];

      // Breaking changes first
      const breaking = parsed.filter(c => c.breaking);
      if (breaking.length) {
        md += `### 💥 BREAKING CHANGES\n\n`;
        breaking.forEach(c => {
          const scope = showScopes && c.scope ? `**${c.scope}:** ` : "";
          md += `- ${scope}${c.message}\n`;
        });
        md += "\n";
      }

      // Group by type
      const groups: Record<string, typeof parsed> = {};
      parsed.forEach(c => {
        if (!groups[c.type]) groups[c.type] = [];
        groups[c.type].push(c);
      });

      const sortedTypes = Object.keys(groups).sort((a, b) => {
        return (commitTypes[a]?.order ?? 99) - (commitTypes[b]?.order ?? 99);
      });

      for (const type of sortedTypes) {
        const info = commitTypes[type] || { emoji: "📝", title: type, order: 99 };
        const emoji = useEmojis ? `${info.emoji} ` : "";
        md += `### ${emoji}${info.title}\n\n`;

        if (groupByScope) {
          const byScope: Record<string, typeof parsed> = {};
          groups[type].forEach(c => {
            const key = c.scope || "_none";
            if (!byScope[key]) byScope[key] = [];
            byScope[key].push(c);
          });
          for (const [scope, commits] of Object.entries(byScope)) {
            if (scope !== "_none") md += `- **${scope}**\n`;
            commits.forEach(c => {
              md += scope !== "_none" ? `  - ${c.message}\n` : `- ${c.message}\n`;
            });
          }
        } else {
          groups[type].forEach(c => {
            const scope = showScopes && c.scope ? `**${c.scope}:** ` : "";
            md += `- ${scope}${c.message}\n`;
          });
        }
        md += "\n";
      }

      // Stats
      const stats = Object.entries(groups).map(([t, items]) => `${items.length} ${t}`).join(", ");
      md += `> ${parsed.length} commits (${stats})\n\n---\n\n`;
    }

    return md;
  }, [versions, repoUrl, useEmojis, showScopes, groupByScope, keepAChangelog]);

  const addVersion = () => {
    const lastVer = versions[0]?.version || "0.0.0";
    const parts = lastVer.split(".").map(Number);
    parts[1]++;
    parts[2] = 0;
    setVersions([
      { version: parts.join("."), date: new Date().toISOString().split("T")[0], commits: "" },
      ...versions,
    ]);
  };

  const updateVersion = (i: number, updates: Partial<Version>) => {
    setVersions(versions.map((v, j) => j === i ? { ...v, ...updates } : v));
  };

  const removeVersion = (i: number) => {
    if (versions.length <= 1) return;
    setVersions(versions.filter((_, j) => j !== i));
  };

  const copy = () => { navigator.clipboard.writeText(generateChangelog); toast.success("Changelog copié !"); };
  const download = () => {
    const blob = new Blob([generateChangelog], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CHANGELOG.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CHANGELOG.md téléchargé");
  };

  const detectedTypes = useMemo(() => {
    const all = versions.flatMap(v => v.commits.split("\n").map(l => parseCommit(l.trim())).filter(Boolean));
    const counts: Record<string, number> = {};
    all.forEach(c => { if (c) counts[c.type] = (counts[c.type] || 0) + 1; });
    return counts;
  }, [versions]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FileText className="h-8 w-8 text-primary" />
        Changelog Generator
      </h1>

      {/* Stats */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(detectedTypes).map(([type, count]) => {
              const info = commitTypes[type] || { emoji: "📝", title: type };
              return (
                <Badge key={type} variant="secondary" className="text-sm">
                  {info.emoji} {type}: {count}
                </Badge>
              );
            })}
            {Object.keys(detectedTypes).length === 0 && (
              <span className="text-muted-foreground text-sm">Ajoutez des commits au format conventionnel</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          {/* Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">URL du dépôt</Label>
                <Input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/user/repo" className="font-mono text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Emojis</Label>
                  <Switch checked={useEmojis} onCheckedChange={setUseEmojis} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Scopes</Label>
                  <Switch checked={showScopes} onCheckedChange={setShowScopes} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Grouper par scope</Label>
                  <Switch checked={groupByScope} onCheckedChange={setGroupByScope} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Keep a Changelog</Label>
                  <Switch checked={keepAChangelog} onCheckedChange={setKeepAChangelog} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Versions */}
          <Card>
            <CardHeader className="flex-row justify-between items-center pb-3">
              <CardTitle className="text-lg">Versions</CardTitle>
              <Button size="sm" variant="outline" onClick={addVersion}>
                <Plus className="h-4 w-4 mr-1" /> Version
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="0">
                <TabsList className="mb-3">
                  {versions.map((v, i) => (
                    <TabsTrigger key={i} value={String(i)} className="text-xs">
                      v{v.version}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {versions.map((v, i) => (
                  <TabsContent key={i} value={String(i)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm text-muted-foreground">Version (semver)</Label>
                        <Input value={v.version} onChange={e => updateVersion(i, { version: e.target.value })} placeholder="1.0.0" className="font-mono" />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Date</Label>
                        <Input type="date" value={v.date} onChange={e => updateVersion(i, { date: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Commits (format: type(scope): message)
                      </Label>
                      <Textarea
                        value={v.commits}
                        onChange={e => updateVersion(i, { commits: e.target.value })}
                        rows={10}
                        className="font-mono text-sm"
                        placeholder={"feat(auth): add login\nfix: resolve bug\nfeat!: breaking change"}
                      />
                    </div>
                    {versions.length > 1 && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeVersion(i)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Supprimer cette version
                      </Button>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Reference */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Types conventionnels</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(commitTypes).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 p-1">
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{key}</code>
                    <span className="text-muted-foreground">{val.emoji} {val.title}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ajoutez <code className="bg-muted px-1 rounded">!</code> pour un breaking change : <code className="bg-muted px-1 rounded">feat!: message</code>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Output */}
        <Card className="h-fit sticky top-20">
          <CardHeader className="flex-row justify-between items-center">
            <CardTitle>Changelog</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copy}>
                <Copy className="h-4 w-4 mr-1" /> Copier
              </Button>
              <Button size="sm" onClick={download}>
                <Download className="h-4 w-4 mr-1" /> .md
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-[70vh] whitespace-pre-wrap">
              {generateChangelog}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
