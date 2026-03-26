import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Copy, Download, FileJson, ChevronRight, ChevronDown, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

interface ParsedSection {
  name: string;
  values: Record<string, any>;
  children: ParsedSection[];
}

const templates = {
  cargo: `[package]
name = "my-project"
version = "0.1.0"
edition = "2021"
authors = ["Your Name <you@example.com>"]
description = "A sample Rust project"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1.0", features = ["full"] }

[dev-dependencies]
criterion = "0.5"

[[bin]]
name = "my-app"
path = "src/main.rs"`,

  pyproject: `[project]
name = "my-project"
version = "0.1.0"
description = "A Python project"
readme = "README.md"
requires-python = ">=3.9"
license = { text = "MIT" }
authors = [
    { name = "Your Name", email = "you@example.com" }
]
dependencies = [
    "requests>=2.28",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = ["pytest", "black", "mypy"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.black]
line-length = 88
target-version = ["py39"]`,

  gitconfig: `[user]
    name = Your Name
    email = you@example.com

[core]
    editor = vim
    autocrlf = input
    excludesfile = ~/.gitignore_global

[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --oneline --graph --decorate

[pull]
    rebase = true

[push]
    default = current`,

  ini: `[database]
host = localhost
port = 5432
name = myapp
user = admin
password = secret123

[server]
host = 0.0.0.0
port = 8080
debug = true
workers = 4

[logging]
level = INFO
format = %(asctime)s - %(name)s - %(levelname)s - %(message)s
file = /var/log/app.log`
};

export default function TomlEditor() {
  const [content, setContent] = useState(templates.cargo);
  const [outputFormat, setOutputFormat] = useState<"json" | "yaml">("json");

  const parseToml = (toml: string): { valid: boolean; data: any; errors: string[] } => {
    const errors: string[] = [];
    const data: Record<string, any> = {};
    let currentSection = "";

    const lines = toml.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      // Ligne vide ou commentaire
      if (!line || line.startsWith("#") || line.startsWith(";")) continue;

      // Section [section] ou [[array]]
      const sectionMatch = line.match(/^\[{1,2}([^\]]+)\]{1,2}$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1].trim();
        if (!data[currentSection]) {
          data[currentSection] = {};
        }
        continue;
      }

      // Paire clé = valeur
      const kvMatch = line.match(/^([^=]+)=(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1].trim();
        let value = kvMatch[2].trim();

        // Parse la valeur
        let parsedValue: any;

        // String entre guillemets
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          parsedValue = value.slice(1, -1);
        }
        // Tableau
        else if (value.startsWith("[")) {
          try {
            parsedValue = JSON.parse(value.replace(/'/g, '"'));
          } catch {
            parsedValue = value;
          }
        }
        // Objet inline
        else if (value.startsWith("{")) {
          try {
            // Convertir la syntaxe TOML en JSON
            const jsonStr = value
              .replace(/(\w+)\s*=/g, '"$1":')
              .replace(/'/g, '"');
            parsedValue = JSON.parse(jsonStr);
          } catch {
            parsedValue = value;
          }
        }
        // Booléen
        else if (value === "true" || value === "false") {
          parsedValue = value === "true";
        }
        // Nombre
        else if (!isNaN(Number(value))) {
          parsedValue = Number(value);
        }
        // Autre
        else {
          parsedValue = value;
        }

        if (currentSection) {
          if (!data[currentSection]) data[currentSection] = {};
          data[currentSection][key] = parsedValue;
        } else {
          data[key] = parsedValue;
        }
        continue;
      }

      if (line) {
        errors.push(`Ligne ${lineNum}: Syntaxe invalide - "${line}"`);
      }
    }

    return { valid: errors.length === 0, data, errors };
  };

  const parsed = useMemo(() => parseToml(content), [content]);

  const toYaml = (obj: any, indent = 0): string => {
    const spaces = "  ".repeat(indent);
    let result = "";

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        result += `${spaces}${key}: null\n`;
      } else if (Array.isArray(value)) {
        result += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === "object") {
            result += `${spaces}  -\n${toYaml(item, indent + 2)}`;
          } else {
            result += `${spaces}  - ${item}\n`;
          }
        });
      } else if (typeof value === "object") {
        result += `${spaces}${key}:\n${toYaml(value, indent + 1)}`;
      } else if (typeof value === "string") {
        result += `${spaces}${key}: "${value}"\n`;
      } else {
        result += `${spaces}${key}: ${value}\n`;
      }
    }

    return result;
  };

  const output = useMemo(() => {
    if (!parsed.valid) return "";
    if (outputFormat === "json") {
      return JSON.stringify(parsed.data, null, 2);
    }
    return toYaml(parsed.data);
  }, [parsed, outputFormat]);

  const loadTemplate = (name: keyof typeof templates) => {
    setContent(templates[name]);
    toast.success(`Template ${name} chargé`);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copié dans le presse-papiers");
  };

  const downloadOutput = () => {
    const ext = outputFormat === "json" ? "json" : "yaml";
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `config.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Fichier ${ext.toUpperCase()} téléchargé`);
  };

  const renderTree = (data: any, path = ""): React.ReactNode => {
    return Object.entries(data).map(([key, value]) => {
      const fullPath = path ? `${path}.${key}` : key;

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return (
          <div key={fullPath} className="ml-4">
            <div className="flex items-center gap-1 text-sm font-medium py-1">
              <ChevronDown className="h-4 w-4" />
              <span className="text-primary">[{key}]</span>
            </div>
            {renderTree(value, fullPath)}
          </div>
        );
      }

      return (
        <div key={fullPath} className="ml-8 flex items-center gap-2 text-sm py-0.5">
          <span className="text-muted-foreground">{key}</span>
          <span className="text-muted-foreground">=</span>
          <span className="text-foreground">
            {Array.isArray(value) ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          TOML/INI Editor
        </h1>
        <p className="text-muted-foreground mt-1">
          Éditez et convertissez vos fichiers de configuration TOML et INI
        </p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => loadTemplate("cargo")}>
          Cargo.toml
        </Button>
        <Button variant="outline" size="sm" onClick={() => loadTemplate("pyproject")}>
          pyproject.toml
        </Button>
        <Button variant="outline" size="sm" onClick={() => loadTemplate("gitconfig")}>
          .gitconfig
        </Button>
        <Button variant="outline" size="sm" onClick={() => loadTemplate("ini")}>
          config.ini
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Éditeur */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Éditeur</CardTitle>
                <Badge variant={parsed.valid ? "default" : "destructive"}>
                  {parsed.valid ? (
                    <><Check className="h-3 w-3 mr-1" /> Valide</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 mr-1" /> Erreurs</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Collez votre TOML/INI ici..."
              />
            </CardContent>
          </Card>

          {parsed.errors.length > 0 && (
            <Card className="border-destructive">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Erreurs ({parsed.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {parsed.errors.map((err, idx) => (
                    <li key={idx} className="text-destructive">{err}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sortie */}
        <div className="space-y-4">
          <Tabs defaultValue="output">
            <TabsList className="w-full">
              <TabsTrigger value="output" className="flex-1">Sortie</TabsTrigger>
              <TabsTrigger value="tree" className="flex-1">Arborescence</TabsTrigger>
            </TabsList>

            <TabsContent value="output" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Conversion</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={outputFormat === "json" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setOutputFormat("json")}
                      >
                        JSON
                      </Button>
                      <Button
                        variant={outputFormat === "yaml" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setOutputFormat("yaml")}
                      >
                        YAML
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <pre className="text-sm font-mono p-3 bg-muted rounded-md whitespace-pre-wrap">
                      {output || "Aucune donnée valide"}
                    </pre>
                  </ScrollArea>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={copyOutput} disabled={!parsed.valid}>
                      <Copy className="h-4 w-4 mr-1" /> Copier
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={downloadOutput} disabled={!parsed.valid}>
                      <Download className="h-4 w-4 mr-1" /> Télécharger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tree" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Vue arborescente</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {parsed.valid ? (
                      <div className="font-mono text-sm">
                        {renderTree(parsed.data)}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Corrigez les erreurs pour voir l'arborescence
                      </p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Aide rapide */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Syntaxe TOML</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 font-mono">
                <p><span className="text-primary">[section]</span> - Définit une section</p>
                <p><span className="text-primary">clé = "valeur"</span> - Chaîne de caractères</p>
                <p><span className="text-primary">nombre = 42</span> - Nombre</p>
                <p><span className="text-primary">bool = true</span> - Booléen</p>
                <p><span className="text-primary">liste = [1, 2, 3]</span> - Tableau</p>
                <p><span className="text-primary"># commentaire</span> - Commentaire</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
