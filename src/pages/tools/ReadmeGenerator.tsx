import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Copy, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const templates = {
  library: { label: "Bibliothèque / Package", sections: ["badges", "description", "installation", "usage", "api", "contributing", "license"] },
  webapp: { label: "Application Web", sections: ["badges", "description", "screenshots", "installation", "usage", "env", "contributing", "license"] },
  cli: { label: "Outil CLI", sections: ["badges", "description", "installation", "usage", "commands", "contributing", "license"] },
  api: { label: "API / Backend", sections: ["badges", "description", "installation", "env", "endpoints", "contributing", "license"] },
};

const licenses = ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "ISC", "Unlicense"];

const badgeServices = [
  { id: "npm", label: "NPM Version", template: (name: string) => `![npm](https://img.shields.io/npm/v/${name})` },
  { id: "build", label: "Build Status", template: (name: string) => `![build](https://img.shields.io/github/actions/workflow/status/${name}/ci.yml)` },
  { id: "license", label: "License", template: (_: string, lic: string) => `![license](https://img.shields.io/badge/license-${lic}-blue)` },
  { id: "stars", label: "GitHub Stars", template: (name: string) => `![stars](https://img.shields.io/github/stars/${name})` },
];

export default function ReadmeGenerator() {
  const { toast } = useToast();
  const [template, setTemplate] = useState("library");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [license, setLicense] = useState("MIT");
  const [installCmd, setInstallCmd] = useState("npm install");
  const [usageCode, setUsageCode] = useState("");
  const [apiDocs, setApiDocs] = useState("");
  const [envVars, setEnvVars] = useState("");
  const [endpoints, setEndpoints] = useState("");
  const [commands, setCommands] = useState("");
  const [screenshots, setScreenshots] = useState("");
  const [selectedBadges, setSelectedBadges] = useState<string[]>(["license"]);
  const [contributing, setContributing] = useState(true);

  const repoName = repoUrl.replace("https://github.com/", "").replace(/\/$/, "") || "user/repo";

  const generateReadme = () => {
    const t = templates[template as keyof typeof templates];
    const lines: string[] = [];

    // Badges
    if (t.sections.includes("badges") && selectedBadges.length > 0) {
      const badges = badgeServices
        .filter(b => selectedBadges.includes(b.id))
        .map(b => b.template(repoName, license))
        .join(" ");
      lines.push(badges, "");
    }

    // Title
    lines.push(`# ${projectName || "Mon Projet"}`, "");

    // Description
    if (t.sections.includes("description")) {
      lines.push(description || "Description du projet.", "");
    }

    // Screenshots
    if (t.sections.includes("screenshots") && screenshots) {
      lines.push("## 📸 Screenshots", "", screenshots, "");
    }

    // Installation
    if (t.sections.includes("installation")) {
      lines.push("## 🚀 Installation", "", "```bash", installCmd || "npm install", "```", "");
    }

    // Env
    if (t.sections.includes("env")) {
      lines.push("## ⚙️ Variables d'environnement", "", "```env", envVars || "DATABASE_URL=\nAPI_KEY=", "```", "");
    }

    // Usage
    if (t.sections.includes("usage")) {
      lines.push("## 📖 Utilisation", "", "```javascript", usageCode || "// Exemple d'utilisation", "```", "");
    }

    // API
    if (t.sections.includes("api")) {
      lines.push("## 📚 API", "", apiDocs || "| Méthode | Description |\n|---------|-------------|\n| `method()` | Description |", "");
    }

    // Endpoints
    if (t.sections.includes("endpoints")) {
      lines.push("## 🔌 Endpoints", "", endpoints || "| Méthode | Route | Description |\n|---------|-------|-------------|\n| GET | /api/v1 | Description |", "");
    }

    // Commands
    if (t.sections.includes("commands")) {
      lines.push("## 💻 Commandes", "", commands || "| Commande | Description |\n|----------|-------------|\n| `--help` | Afficher l'aide |", "");
    }

    // Contributing
    if (t.sections.includes("contributing") && contributing) {
      lines.push(
        "## 🤝 Contributing", "",
        "Les contributions sont les bienvenues !", "",
        "1. Fork le projet",
        "2. Crée ta branche (`git checkout -b feature/amazing-feature`)",
        "3. Commit tes changements (`git commit -m 'feat: add amazing feature'`)",
        "4. Push (`git push origin feature/amazing-feature`)",
        "5. Ouvre une Pull Request", ""
      );
    }

    // License
    if (t.sections.includes("license")) {
      lines.push("## 📝 License", "", `Ce projet est sous licence [${license}](LICENSE).`, "");
    }

    return lines.join("\n");
  };

  const readme = generateReadme();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(readme);
    toast({ title: "Copié !", description: "README copié dans le presse-papier" });
  };

  const downloadFile = () => {
    const blob = new Blob([readme], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Readme Generator
        </h1>
        <p className="text-muted-foreground">Construisez un README.md professionnel avec des templates par type de projet</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(templates).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Licence</Label>
                  <Select value={license} onValueChange={setLicense}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {licenses.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Nom du projet</Label>
                <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Mon Super Projet" />
              </div>
              <div>
                <Label>URL du repo GitHub</Label>
                <Input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/user/repo" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Une courte description du projet..." rows={3} />
              </div>
              <div>
                <Label>Commande d'installation</Label>
                <Input value={installCmd} onChange={e => setInstallCmd(e.target.value)} placeholder="npm install my-package" />
              </div>
              <div>
                <Label>Exemple d'utilisation</Label>
                <Textarea value={usageCode} onChange={e => setUsageCode(e.target.value)} placeholder="import { ... } from 'my-package'" className="font-mono text-sm" rows={4} />
              </div>
              {templates[template as keyof typeof templates].sections.includes("api") && (
                <div>
                  <Label>Documentation API (Markdown)</Label>
                  <Textarea value={apiDocs} onChange={e => setApiDocs(e.target.value)} placeholder="| Méthode | Description |" className="font-mono text-sm" rows={4} />
                </div>
              )}
              {templates[template as keyof typeof templates].sections.includes("env") && (
                <div>
                  <Label>Variables d'environnement</Label>
                  <Textarea value={envVars} onChange={e => setEnvVars(e.target.value)} placeholder="DATABASE_URL=&#10;API_KEY=" className="font-mono text-sm" rows={3} />
                </div>
              )}
              {templates[template as keyof typeof templates].sections.includes("endpoints") && (
                <div>
                  <Label>Endpoints API</Label>
                  <Textarea value={endpoints} onChange={e => setEndpoints(e.target.value)} placeholder="| GET | /api/users | List users |" className="font-mono text-sm" rows={4} />
                </div>
              )}
              {templates[template as keyof typeof templates].sections.includes("commands") && (
                <div>
                  <Label>Commandes CLI</Label>
                  <Textarea value={commands} onChange={e => setCommands(e.target.value)} placeholder="| --help | Show help |" className="font-mono text-sm" rows={4} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Badges</Label>
                <div className="flex flex-wrap gap-3">
                  {badgeServices.map(b => (
                    <label key={b.id} className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={selectedBadges.includes(b.id)}
                        onCheckedChange={(checked) => {
                          setSelectedBadges(prev => checked ? [...prev, b.id] : prev.filter(x => x !== b.id));
                        }}
                      />
                      {b.label}
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={contributing} onCheckedChange={setContributing} />
                Section Contributing
              </label>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Eye className="h-5 w-5" /> Aperçu</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copier</Button>
                <Button size="sm" variant="outline" onClick={downloadFile}><Download className="h-4 w-4 mr-1" /> .md</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-lg max-h-[700px] overflow-auto">{readme}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
