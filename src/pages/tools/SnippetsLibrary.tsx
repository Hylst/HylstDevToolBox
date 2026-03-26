import { useState, useMemo, useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import css from "highlight.js/lib/languages/css";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml";
import php from "highlight.js/lib/languages/php";
import "highlight.js/styles/github-dark.css";

// Register languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("css", css);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("php", php);
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code, Search, Copy, Plus, Star, StarOff, Trash2, Download, Upload, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Snippet {
  id: string;
  title: string;
  code: string;
  description: string;
  language: string;
  category: string;
  tags: string[];
  favorite: boolean;
  custom: boolean;
}

const defaultSnippets: Snippet[] = [
  // JavaScript
  { id: "js-fetch-get", title: "Fetch GET", code: `const response = await fetch(url);\nconst data = await response.json();`, description: "Requête GET avec Fetch API", language: "JavaScript", category: "Fetch", tags: ["api", "http"], favorite: false, custom: false },
  { id: "js-fetch-post", title: "Fetch POST", code: `const response = await fetch(url, {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(data)\n});\nconst result = await response.json();`, description: "Requête POST avec Fetch API", language: "JavaScript", category: "Fetch", tags: ["api", "http"], favorite: false, custom: false },
  { id: "js-localstorage", title: "LocalStorage CRUD", code: `// Set\nlocalStorage.setItem('key', JSON.stringify(value));\n// Get\nconst data = JSON.parse(localStorage.getItem('key'));\n// Remove\nlocalStorage.removeItem('key');\n// Clear all\nlocalStorage.clear();`, description: "Opérations LocalStorage", language: "JavaScript", category: "Storage", tags: ["storage"], favorite: false, custom: false },
  { id: "js-debounce", title: "Debounce", code: `function debounce(fn, delay) {\n  let timeoutId;\n  return (...args) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn(...args), delay);\n  };\n}`, description: "Fonction debounce", language: "JavaScript", category: "Utils", tags: ["performance"], favorite: false, custom: false },
  { id: "js-throttle", title: "Throttle", code: `function throttle(fn, limit) {\n  let inThrottle;\n  return (...args) => {\n    if (!inThrottle) {\n      fn(...args);\n      inThrottle = true;\n      setTimeout(() => inThrottle = false, limit);\n    }\n  };\n}`, description: "Fonction throttle", language: "JavaScript", category: "Utils", tags: ["performance"], favorite: false, custom: false },
  { id: "js-deepclone", title: "Deep Clone", code: `const deepClone = (obj) => JSON.parse(JSON.stringify(obj));\n// ou avec structuredClone (modern)\nconst clone = structuredClone(obj);`, description: "Clonage profond d'objet", language: "JavaScript", category: "Utils", tags: ["object"], favorite: false, custom: false },
  { id: "js-array-unique", title: "Array Unique", code: `const unique = [...new Set(array)];\n// ou avec objets\nconst uniqueById = [...new Map(arr.map(x => [x.id, x])).values()];`, description: "Dédoublonner un tableau", language: "JavaScript", category: "Arrays", tags: ["array"], favorite: false, custom: false },
  { id: "js-array-group", title: "Array Group By", code: `const groupBy = (arr, key) => arr.reduce((acc, item) => {\n  (acc[item[key]] ??= []).push(item);\n  return acc;\n}, {});`, description: "Grouper tableau par clé", language: "JavaScript", category: "Arrays", tags: ["array"], favorite: false, custom: false },
  { id: "js-promise-all", title: "Promise.all", code: `const results = await Promise.all([\n  fetch(url1),\n  fetch(url2),\n  fetch(url3)\n]);`, description: "Attendre plusieurs promesses", language: "JavaScript", category: "Async", tags: ["promise", "async"], favorite: false, custom: false },
  { id: "js-event-listener", title: "Event Listener", code: `element.addEventListener('click', (e) => {\n  e.preventDefault();\n  // handler\n});\n// Remove\nelement.removeEventListener('click', handler);`, description: "Gestion d'événements", language: "JavaScript", category: "DOM", tags: ["dom", "event"], favorite: false, custom: false },

  // TypeScript
  { id: "ts-interface", title: "Interface", code: `interface User {\n  id: string;\n  name: string;\n  email: string;\n  age?: number; // optional\n  readonly createdAt: Date;\n}`, description: "Définir une interface", language: "TypeScript", category: "Types", tags: ["types"], favorite: false, custom: false },
  { id: "ts-generic", title: "Generic Function", code: `function identity<T>(arg: T): T {\n  return arg;\n}\n\nconst output = identity<string>("hello");`, description: "Fonction générique", language: "TypeScript", category: "Types", tags: ["types", "generics"], favorite: false, custom: false },
  { id: "ts-enum", title: "Enum", code: `enum Status {\n  Pending = 'PENDING',\n  Active = 'ACTIVE',\n  Completed = 'COMPLETED'\n}\n\nconst status: Status = Status.Active;`, description: "Énumération TypeScript", language: "TypeScript", category: "Types", tags: ["types", "enum"], favorite: false, custom: false },
  { id: "ts-utility", title: "Utility Types", code: `type PartialUser = Partial<User>; // all optional\ntype RequiredUser = Required<User>; // all required\ntype ReadonlyUser = Readonly<User>;\ntype PickedUser = Pick<User, 'id' | 'name'>;\ntype OmittedUser = Omit<User, 'password'>;`, description: "Types utilitaires", language: "TypeScript", category: "Types", tags: ["types"], favorite: false, custom: false },

  // React
  { id: "react-usestate", title: "useState", code: `const [count, setCount] = useState(0);\nconst [user, setUser] = useState<User | null>(null);\nconst [items, setItems] = useState<Item[]>([]);`, description: "Hook useState", language: "React", category: "Hooks", tags: ["hooks", "state"], favorite: false, custom: false },
  { id: "react-useeffect", title: "useEffect", code: `useEffect(() => {\n  // Effect\n  fetchData();\n  \n  return () => {\n    // Cleanup\n  };\n}, [dependency]);`, description: "Hook useEffect", language: "React", category: "Hooks", tags: ["hooks", "lifecycle"], favorite: false, custom: false },
  { id: "react-usememo", title: "useMemo", code: `const memoizedValue = useMemo(() => {\n  return expensiveComputation(a, b);\n}, [a, b]);`, description: "Hook useMemo", language: "React", category: "Hooks", tags: ["hooks", "performance"], favorite: false, custom: false },
  { id: "react-usecallback", title: "useCallback", code: `const memoizedCallback = useCallback(() => {\n  doSomething(a, b);\n}, [a, b]);`, description: "Hook useCallback", language: "React", category: "Hooks", tags: ["hooks", "performance"], favorite: false, custom: false },
  { id: "react-context", title: "Context", code: `const ThemeContext = createContext<Theme>('light');\n\n// Provider\n<ThemeContext.Provider value={theme}>\n  {children}\n</ThemeContext.Provider>\n\n// Consumer\nconst theme = useContext(ThemeContext);`, description: "React Context API", language: "React", category: "State", tags: ["context", "state"], favorite: false, custom: false },

  // Python
  { id: "py-list-comp", title: "List Comprehension", code: `squares = [x**2 for x in range(10)]\neven = [x for x in numbers if x % 2 == 0]\npairs = [(x, y) for x in a for y in b]`, description: "List comprehension Python", language: "Python", category: "Basics", tags: ["list"], favorite: false, custom: false },
  { id: "py-dict-comp", title: "Dict Comprehension", code: `squares = {x: x**2 for x in range(5)}\nfiltered = {k: v for k, v in d.items() if v > 0}`, description: "Dict comprehension", language: "Python", category: "Basics", tags: ["dict"], favorite: false, custom: false },
  { id: "py-file", title: "File Operations", code: `# Read\nwith open('file.txt', 'r') as f:\n    content = f.read()\n\n# Write\nwith open('file.txt', 'w') as f:\n    f.write('Hello')`, description: "Lecture/écriture fichiers", language: "Python", category: "IO", tags: ["file"], favorite: false, custom: false },
  { id: "py-decorator", title: "Decorator", code: `def timer(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        print(f'{func.__name__}: {time.time()-start:.2f}s')\n        return result\n    return wrapper\n\n@timer\ndef slow_function():\n    pass`, description: "Décorateur Python", language: "Python", category: "Advanced", tags: ["decorator"], favorite: false, custom: false },

  // SQL
  { id: "sql-select", title: "SELECT with JOIN", code: `SELECT u.name, o.total\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.status = 'completed'\nORDER BY o.total DESC\nLIMIT 10;`, description: "SELECT avec JOIN", language: "SQL", category: "Queries", tags: ["select", "join"], favorite: false, custom: false },
  { id: "sql-insert", title: "INSERT", code: `INSERT INTO users (name, email, created_at)\nVALUES ('John', 'john@email.com', NOW())\nRETURNING id;`, description: "INSERT avec RETURNING", language: "SQL", category: "Queries", tags: ["insert"], favorite: false, custom: false },
  { id: "sql-update", title: "UPDATE", code: `UPDATE users\nSET status = 'active', updated_at = NOW()\nWHERE id = 1\nRETURNING *;`, description: "UPDATE avec conditions", language: "SQL", category: "Queries", tags: ["update"], favorite: false, custom: false },
  { id: "sql-cte", title: "CTE (WITH)", code: `WITH active_users AS (\n  SELECT * FROM users WHERE status = 'active'\n)\nSELECT * FROM active_users\nWHERE created_at > '2024-01-01';`, description: "Common Table Expression", language: "SQL", category: "Advanced", tags: ["cte"], favorite: false, custom: false },

  // CSS
  { id: "css-flexbox", title: "Flexbox Center", code: `.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}`, description: "Centrage avec Flexbox", language: "CSS", category: "Layout", tags: ["flexbox", "center"], favorite: false, custom: false },
  { id: "css-grid", title: "CSS Grid", code: `.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n}`, description: "Grid responsive", language: "CSS", category: "Layout", tags: ["grid"], favorite: false, custom: false },
  { id: "css-animation", title: "Animation", code: `@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(-10px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n.animate {\n  animation: fadeIn 0.3s ease-out;\n}`, description: "Animation CSS", language: "CSS", category: "Animation", tags: ["animation"], favorite: false, custom: false },

  // Bash
  { id: "bash-loop", title: "For Loop", code: `for file in *.txt; do\n  echo "Processing $file"\n  cat "$file"\ndone`, description: "Boucle for en Bash", language: "Bash", category: "Basics", tags: ["loop"], favorite: false, custom: false },
  { id: "bash-if", title: "If Statement", code: `if [ -f "$file" ]; then\n  echo "File exists"\nelif [ -d "$file" ]; then\n  echo "Is directory"\nelse\n  echo "Not found"\nfi`, description: "Condition Bash", language: "Bash", category: "Basics", tags: ["condition"], favorite: false, custom: false },
  { id: "bash-function", title: "Function", code: `greet() {\n  local name="$1"\n  echo "Hello, $name!"\n}\n\ngreet "World"`, description: "Fonction Bash", language: "Bash", category: "Basics", tags: ["function"], favorite: false, custom: false },
];

const languages = ["JavaScript", "TypeScript", "React", "Python", "SQL", "CSS", "Bash", "HTML", "PHP"];

export default function SnippetsLibrary() {
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    const saved = localStorage.getItem("snippets-library-custom");
    const custom = saved ? JSON.parse(saved) : [];
    return [...defaultSnippets, ...custom];
  });
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Tous");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const { toast } = useToast();

  const saveCustomSnippets = (allSnippets: Snippet[]) => {
    const custom = allSnippets.filter((s) => s.custom);
    localStorage.setItem("snippets-library-custom", JSON.stringify(custom));
  };

  const allTags = useMemo(() => [...new Set(snippets.flatMap((s) => s.tags))], [snippets]);
  const allCategories = useMemo(() => [...new Set(snippets.map((s) => s.category))], [snippets]);

  const filteredSnippets = useMemo(() => {
    return snippets.filter((snippet) => {
      const matchesSearch =
        snippet.title.toLowerCase().includes(search.toLowerCase()) ||
        snippet.description.toLowerCase().includes(search.toLowerCase()) ||
        snippet.code.toLowerCase().includes(search.toLowerCase());
      const matchesLanguage = selectedLanguage === "Tous" || snippet.language === selectedLanguage;
      const matchesTag = !selectedTag || snippet.tags.includes(selectedTag);
      return matchesSearch && matchesLanguage && matchesTag;
    });
  }, [snippets, search, selectedLanguage, selectedTag]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copié !", description: "Code copié dans le presse-papier" });
  };

  const createSnippet = () => {
    setEditingSnippet({
      id: crypto.randomUUID(),
      title: "",
      code: "",
      description: "",
      language: "JavaScript",
      category: "Custom",
      tags: [],
      favorite: false,
      custom: true,
    });
    setIsDialogOpen(true);
  };

  const saveSnippet = () => {
    if (!editingSnippet) return;
    const exists = snippets.find((s) => s.id === editingSnippet.id);
    const updated = exists
      ? snippets.map((s) => (s.id === editingSnippet.id ? editingSnippet : s))
      : [...snippets, editingSnippet];
    setSnippets(updated);
    saveCustomSnippets(updated);
    setIsDialogOpen(false);
    setEditingSnippet(null);
    toast({ title: "Sauvegardé !", description: "Snippet enregistré" });
  };

  const deleteSnippet = (id: string) => {
    const updated = snippets.filter((s) => s.id !== id);
    setSnippets(updated);
    saveCustomSnippets(updated);
    toast({ title: "Supprimé", description: "Snippet supprimé" });
  };

  const toggleFavorite = (id: string) => {
    const updated = snippets.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s));
    setSnippets(updated);
    saveCustomSnippets(updated);
  };

  const addTag = () => {
    if (!editingSnippet || !newTagInput.trim()) return;
    if (!editingSnippet.tags.includes(newTagInput.trim())) {
      setEditingSnippet({
        ...editingSnippet,
        tags: [...editingSnippet.tags, newTagInput.trim()],
      });
    }
    setNewTagInput("");
  };

  const exportSnippets = () => {
    const custom = snippets.filter((s) => s.custom);
    const blob = new Blob([JSON.stringify(custom, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "snippets-custom.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exporté !", description: `${custom.length} snippets exportés` });
  };

  const importSnippets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported: Snippet[] = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          const withCustomFlag = imported.map((s) => ({ ...s, custom: true, id: crypto.randomUUID() }));
          const updated = [...snippets, ...withCustomFlag];
          setSnippets(updated);
          saveCustomSnippets(updated);
          toast({ title: "Importé !", description: `${imported.length} snippets importés` });
        }
      } catch {
        toast({ title: "Erreur", description: "Fichier JSON invalide", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Code className="h-8 w-8 text-primary" />
          Bibliothèque de Snippets
        </h1>
        <p className="text-muted-foreground">
          {snippets.length}+ snippets de code réutilisables
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={createSnippet}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau snippet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSnippet?.custom ? "Éditer snippet" : "Nouveau snippet"}</DialogTitle>
              </DialogHeader>
              {editingSnippet && (
                <div className="space-y-4">
                  <Input
                    placeholder="Titre"
                    value={editingSnippet.title}
                    onChange={(e) => setEditingSnippet({ ...editingSnippet, title: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={editingSnippet.description}
                    onChange={(e) => setEditingSnippet({ ...editingSnippet, description: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Select
                      value={editingSnippet.language}
                      onValueChange={(v) => setEditingSnippet({ ...editingSnippet, language: v })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Catégorie"
                      value={editingSnippet.category}
                      onChange={(e) => setEditingSnippet({ ...editingSnippet, category: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter un tag"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={addTag}>+</Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {editingSnippet.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setEditingSnippet({ ...editingSnippet, tags: editingSnippet.tags.filter((t) => t !== tag) })}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Code"
                    value={editingSnippet.code}
                    onChange={(e) => setEditingSnippet({ ...editingSnippet, code: e.target.value })}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                    <Button onClick={saveSnippet}>Sauvegarder</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Langages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button
                variant={selectedLanguage === "Tous" ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setSelectedLanguage("Tous")}
              >
                Tous
                <Badge variant="secondary" className="ml-auto">{snippets.length}</Badge>
              </Button>
              {languages.map((lang) => {
                const count = snippets.filter((s) => s.language === lang).length;
                if (count === 0) return null;
                return (
                  <Button
                    key={lang}
                    variant={selectedLanguage === lang ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang}
                    <Badge variant="secondary" className="ml-auto">{count}</Badge>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tags populaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {allTags.slice(0, 15).map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={exportSnippets}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <label className="flex-1">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                </span>
              </Button>
              <input type="file" accept=".json" className="hidden" onChange={importSnippets} />
            </label>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un snippet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Tous ({filteredSnippets.length})</TabsTrigger>
              <TabsTrigger value="favorites">Favoris ({snippets.filter((s) => s.favorite).length})</TabsTrigger>
              <TabsTrigger value="custom">Personnels ({snippets.filter((s) => s.custom).length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="space-y-3 pr-4">
                  {filteredSnippets.map((snippet) => (
                    <SnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      onCopy={copyCode}
                      onToggleFavorite={toggleFavorite}
                      onEdit={(s) => { setEditingSnippet(s); setIsDialogOpen(true); }}
                      onDelete={deleteSnippet}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="favorites">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="space-y-3 pr-4">
                  {snippets.filter((s) => s.favorite).map((snippet) => (
                    <SnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      onCopy={copyCode}
                      onToggleFavorite={toggleFavorite}
                      onEdit={(s) => { setEditingSnippet(s); setIsDialogOpen(true); }}
                      onDelete={deleteSnippet}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="custom">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="space-y-3 pr-4">
                  {snippets.filter((s) => s.custom).map((snippet) => (
                    <SnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      onCopy={copyCode}
                      onToggleFavorite={toggleFavorite}
                      onEdit={(s) => { setEditingSnippet(s); setIsDialogOpen(true); }}
                      onDelete={deleteSnippet}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Map language names to highlight.js language identifiers
const languageMap: Record<string, string> = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  React: "javascript",
  Python: "python",
  SQL: "sql",
  CSS: "css",
  Bash: "bash",
  HTML: "html",
  PHP: "php",
};

function HighlightedCode({ code, language }: { code: string; language: string }) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      // Reset the element before highlighting
      codeRef.current.removeAttribute("data-highlighted");
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const hljsLanguage = languageMap[language] || "plaintext";

  return (
    <pre className="p-3 bg-[#0d1117] rounded-md overflow-x-auto">
      <code ref={codeRef} className={`language-${hljsLanguage} text-sm font-mono`}>
        {code}
      </code>
    </pre>
  );
}

function SnippetCard({
  snippet,
  onCopy,
  onToggleFavorite,
  onEdit,
  onDelete,
}: {
  snippet: Snippet;
  onCopy: (code: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{snippet.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge>{snippet.language}</Badge>
              <Badge variant="outline">{snippet.category}</Badge>
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onToggleFavorite(snippet.id)}>
              {snippet.favorite ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onCopy(snippet.code)}>
              <Copy className="h-4 w-4" />
            </Button>
            {snippet.custom && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onEdit(snippet)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(snippet.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{snippet.description}</p>
        <HighlightedCode code={snippet.code} language={snippet.language} />
        {snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {snippet.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
