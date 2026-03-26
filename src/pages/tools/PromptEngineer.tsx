import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Download, Plus, Trash2, Star, History, Variable, FileJson } from "lucide-react";
import { toast } from "sonner";

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  systemPrompt: string;
  userPrompt: string;
  variables: string[];
}

interface SavedPrompt {
  id: string;
  name: string;
  systemPrompt: string;
  userPrompt: string;
  timestamp: number;
}

const defaultTemplates: PromptTemplate[] = [
  {
    id: "code-review",
    name: "Code Review",
    category: "code",
    systemPrompt: "Tu es un expert en révision de code. Analyse le code fourni et identifie les problèmes de qualité, de performance et de sécurité.",
    userPrompt: "Analyse ce code {{language}} et fournis une revue détaillée :\n\n```{{language}}\n{{code}}\n```",
    variables: ["language", "code"]
  },
  {
    id: "code-explain",
    name: "Explication de code",
    category: "code",
    systemPrompt: "Tu es un développeur senior pédagogue. Explique le code de manière claire et accessible.",
    userPrompt: "Explique ce code {{language}} ligne par ligne :\n\n```{{language}}\n{{code}}\n```",
    variables: ["language", "code"]
  },
  {
    id: "refactor",
    name: "Refactoring",
    category: "code",
    systemPrompt: "Tu es un expert en clean code et design patterns. Propose des améliorations de code.",
    userPrompt: "Refactorise ce code {{language}} en appliquant les bonnes pratiques :\n\n```{{language}}\n{{code}}\n```\n\nContraintes : {{constraints}}",
    variables: ["language", "code", "constraints"]
  },
  {
    id: "translate",
    name: "Traduction",
    category: "traduction",
    systemPrompt: "Tu es un traducteur professionnel. Traduis de manière précise en préservant le ton et le contexte.",
    userPrompt: "Traduis ce texte de {{source_lang}} vers {{target_lang}} :\n\n{{text}}",
    variables: ["source_lang", "target_lang", "text"]
  },
  {
    id: "summarize",
    name: "Résumé",
    category: "analyse",
    systemPrompt: "Tu es un expert en synthèse. Résume de manière concise tout en conservant les points essentiels.",
    userPrompt: "Résume ce texte en {{length}} points clés :\n\n{{text}}",
    variables: ["length", "text"]
  },
  {
    id: "generate-tests",
    name: "Génération de tests",
    category: "code",
    systemPrompt: "Tu es un expert en testing. Génère des tests unitaires complets et pertinents.",
    userPrompt: "Génère des tests unitaires pour ce code {{language}} avec {{framework}} :\n\n```{{language}}\n{{code}}\n```",
    variables: ["language", "framework", "code"]
  },
  {
    id: "api-doc",
    name: "Documentation API",
    category: "generation",
    systemPrompt: "Tu es un technical writer. Génère une documentation API claire et complète au format OpenAPI.",
    userPrompt: "Documente cette API {{type}} :\n\nEndpoints:\n{{endpoints}}\n\nFormat souhaité: {{format}}",
    variables: ["type", "endpoints", "format"]
  },
  {
    id: "debug",
    name: "Debug Assistant",
    category: "code",
    systemPrompt: "Tu es un expert en debugging. Analyse les erreurs et propose des solutions.",
    userPrompt: "J'ai cette erreur dans mon code {{language}} :\n\nErreur: {{error}}\n\nCode:\n```{{language}}\n{{code}}\n```",
    variables: ["language", "error", "code"]
  }
];

const categories = [
  { id: "all", label: "Tous" },
  { id: "code", label: "Code" },
  { id: "analyse", label: "Analyse" },
  { id: "generation", label: "Génération" },
  { id: "traduction", label: "Traduction" }
];

export default function PromptEngineer() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [promptName, setPromptName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("prompt-engineer-saved");
    if (saved) {
      setSavedPrompts(JSON.parse(saved));
    }
  }, []);

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  };

  const allVariables = [...new Set([...extractVariables(systemPrompt), ...extractVariables(userPrompt)])];

  const replaceVariables = (text: string): string => {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || `{{${key}}}`);
    }
    return result;
  };

  const estimateTokens = (text: string): number => {
    // Approximation: 1 token ≈ 4 caractères en moyenne
    return Math.ceil(text.length / 4);
  };

  const totalTokens = estimateTokens(replaceVariables(systemPrompt) + replaceVariables(userPrompt));

  const loadTemplate = (template: PromptTemplate) => {
    setSystemPrompt(template.systemPrompt);
    setUserPrompt(template.userPrompt);
    setVariables({});
    toast.success(`Template "${template.name}" chargé`);
  };

  const savePrompt = () => {
    if (!promptName.trim()) {
      toast.error("Entrez un nom pour le prompt");
      return;
    }
    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      name: promptName,
      systemPrompt,
      userPrompt,
      timestamp: Date.now()
    };
    const updated = [newPrompt, ...savedPrompts];
    setSavedPrompts(updated);
    localStorage.setItem("prompt-engineer-saved", JSON.stringify(updated));
    setPromptName("");
    toast.success("Prompt sauvegardé");
  };

  const loadSavedPrompt = (prompt: SavedPrompt) => {
    setSystemPrompt(prompt.systemPrompt);
    setUserPrompt(prompt.userPrompt);
    setVariables({});
    toast.success(`Prompt "${prompt.name}" chargé`);
  };

  const deleteSavedPrompt = (id: string) => {
    const updated = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updated);
    localStorage.setItem("prompt-engineer-saved", JSON.stringify(updated));
    toast.success("Prompt supprimé");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers");
  };

  const exportAsJson = () => {
    const data = {
      model: "gpt-4",
      messages: [
        { role: "system", content: replaceVariables(systemPrompt) },
        { role: "user", content: replaceVariables(userPrompt) }
      ]
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exporté en JSON");
  };

  const filteredTemplates = selectedCategory === "all" 
    ? defaultTemplates 
    : defaultTemplates.filter(t => t.category === selectedCategory);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Prompt Engineer
        </h1>
        <p className="text-muted-foreground mt-1">
          Concevez et testez vos prompts pour LLM avec variables et templates
        </p>
      </div>

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">Éditeur</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="saved">Sauvegardés</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Éditeur */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">System Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Tu es un assistant utile..."
                    className="min-h-[120px] font-mono text-sm"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>~{estimateTokens(replaceVariables(systemPrompt))} tokens</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(replaceVariables(systemPrompt))}>
                      <Copy className="h-3 w-3 mr-1" /> Copier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">User Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Utilise {{variable}} pour les variables..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>~{estimateTokens(replaceVariables(userPrompt))} tokens</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(replaceVariables(userPrompt))}>
                      <Copy className="h-3 w-3 mr-1" /> Copier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Variables */}
              {allVariables.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Variable className="h-5 w-5" />
                      Variables ({allVariables.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {allVariables.map((variable) => (
                      <div key={variable}>
                        <Label className="text-sm">{`{{${variable}}}`}</Label>
                        <Textarea
                          value={variables[variable] || ""}
                          onChange={(e) => setVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                          placeholder={`Valeur pour ${variable}...`}
                          className="mt-1 min-h-[60px] font-mono text-sm"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Preview & Actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Prévisualisation</CardTitle>
                    <Badge variant="outline" className="font-mono">
                      ~{totalTokens} tokens total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">SYSTEM</Label>
                      <div className="mt-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap font-mono">
                        {replaceVariables(systemPrompt) || <span className="text-muted-foreground italic">Aucun system prompt</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">USER</Label>
                      <div className="mt-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap font-mono max-h-[300px] overflow-auto">
                        {replaceVariables(userPrompt) || <span className="text-muted-foreground italic">Aucun user prompt</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={promptName}
                      onChange={(e) => setPromptName(e.target.value)}
                      placeholder="Nom du prompt..."
                      className="flex-1"
                    />
                    <Button onClick={savePrompt}>
                      <Star className="h-4 w-4 mr-1" /> Sauvegarder
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={exportAsJson}>
                      <FileJson className="h-4 w-4 mr-1" /> Export JSON
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => copyToClipboard(JSON.stringify({
                      system: replaceVariables(systemPrompt),
                      user: replaceVariables(userPrompt)
                    }, null, 2))}>
                      <Copy className="h-4 w-4 mr-1" /> Copier tout
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Estimation de coût */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Estimation de coût</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">GPT-4</p>
                      <p className="font-mono">${((totalTokens / 1000) * 0.03).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">GPT-3.5</p>
                      <p className="font-mono">${((totalTokens / 1000) * 0.002).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Claude 3</p>
                      <p className="font-mono">${((totalTokens / 1000) * 0.015).toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gemini Pro</p>
                      <p className="font-mono">${((totalTokens / 1000) * 0.00125).toFixed(4)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => loadTemplate(template)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {template.systemPrompt}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((v) => (
                      <Badge key={v} variant="outline" className="text-xs">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          {savedPrompts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun prompt sauvegardé</p>
                <p className="text-sm text-muted-foreground">Sauvegardez vos prompts favoris depuis l'éditeur</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPrompts.map((prompt) => (
                <Card key={prompt.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{prompt.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => loadSavedPrompt(prompt)}>
                          Charger
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteSavedPrompt(prompt.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(prompt.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {prompt.userPrompt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
