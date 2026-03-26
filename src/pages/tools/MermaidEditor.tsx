import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Copy, Download, RotateCcw, FileText, Layers, Image, Code, Share2,
  ZoomIn, ZoomOut, Maximize2, Minimize2, Save, FolderOpen, Trash2, Plus, X,
  Palette, Type, Square,
} from "lucide-react";
import mermaid from "mermaid";
import jsPDF from "jspdf";

// ── Templates ──────────────────────────────────────────────────────────

const TEMPLATES: Record<string, { label: string; category: string; code: string }> = {
  flowchart_basic: {
    label: "Flowchart basique",
    category: "Flowchart",
    code: `flowchart TD
    A[Début] --> B{Condition ?}
    B -->|Oui| C[Action 1]
    B -->|Non| D[Action 2]
    C --> E[Fin]
    D --> E`,
  },
  flowchart_complex: {
    label: "Flowchart complexe",
    category: "Flowchart",
    code: `flowchart TB
    subgraph Frontend
        A[Client] --> B[React App]
        B --> C[API Layer]
    end
    subgraph Backend
        D[REST API] --> E[(Database)]
        D --> F[Cache Redis]
        D --> G[Queue]
    end
    subgraph Services
        H[Auth Service]
        I[Email Service]
        J[Storage]
    end
    C --> D
    D --> H
    G --> I
    D --> J`,
  },
  sequence: {
    label: "Diagramme de séquence",
    category: "Séquence",
    code: `sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant A as API
    participant DB as Database

    U->>F: Clic sur "Login"
    F->>A: POST /auth/login
    A->>DB: SELECT user WHERE email=?
    DB-->>A: User data
    A-->>F: JWT Token
    F-->>U: Redirect Dashboard`,
  },
  sequence_async: {
    label: "Séquence async",
    category: "Séquence",
    code: `sequenceDiagram
    participant C as Client
    participant S as Server
    participant Q as Queue
    participant W as Worker
    participant N as Notification

    C->>S: Upload fichier
    S->>Q: Ajouter tache
    S-->>C: 202 Accepted (job_id)
    Q->>W: Traiter fichier
    W->>W: Conversion...
    W->>N: Envoyer notification
    N-->>C: Push notification
    C->>S: GET /jobs/{id}
    S-->>C: 200 OK (result)`,
  },
  class_diagram: {
    label: "Diagramme de classes",
    category: "Classes",
    code: `classDiagram
    class User {
        +String id
        +String email
        +String name
        +login()
        +logout()
    }
    class Post {
        +String id
        +String title
        +String content
        +Date createdAt
        +publish()
        +delete()
    }
    class Comment {
        +String id
        +String text
        +Date createdAt
    }
    User "1" --> "*" Post : writes
    User "1" --> "*" Comment : posts
    Post "1" --> "*" Comment : has`,
  },
  er_diagram: {
    label: "Entité-Relation",
    category: "ER",
    code: `erDiagram
    USERS ||--o{ ORDERS : places
    USERS {
        int id PK
        string email
        string name
        datetime created_at
    }
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS {
        int id PK
        int user_id FK
        decimal total
        string status
        datetime ordered_at
    }
    ORDER_ITEMS }o--|| PRODUCTS : references
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
    }
    PRODUCTS {
        int id PK
        string name
        decimal price
        int stock
    }`,
  },
  state: {
    label: "Diagramme d'état",
    category: "État",
    code: `stateDiagram-v2
    [*] --> Draft
    Draft --> Review : submit
    Review --> Approved : approve
    Review --> Rejected : reject
    Rejected --> Draft : revise
    Approved --> Published : publish
    Published --> Archived : archive
    Archived --> [*]

    state Review {
        [*] --> Pending
        Pending --> InReview : assign
        InReview --> Done : complete
    }`,
  },
  gantt: {
    label: "Diagramme de Gantt",
    category: "Gantt",
    code: `gantt
    title Roadmap Projet
    dateFormat YYYY-MM-DD
    section Design
        Wireframes           :done, d1, 2025-01-01, 10d
        Maquettes UI         :done, d2, after d1, 7d
        Design System        :active, d3, after d2, 14d
    section Développement
        Setup projet         :done, dev1, 2025-01-01, 3d
        Auth & Users         :active, dev2, after d2, 14d
        API CRUD             :dev3, after dev2, 10d
        Tests                :dev4, after dev3, 7d
    section Déploiement
        CI/CD                :dep1, after dev3, 5d
        Production           :milestone, after dev4, 0d`,
  },
  pie: {
    label: "Diagramme circulaire",
    category: "Pie",
    code: `pie title Répartition du trafic
    "Desktop" : 45
    "Mobile" : 35
    "Tablet" : 15
    "Autre" : 5`,
  },
  gitgraph: {
    label: "Git Graph",
    category: "Git",
    code: `gitGraph
    commit id: "init"
    branch develop
    checkout develop
    commit id: "feat-1"
    commit id: "feat-2"
    branch feature/auth
    checkout feature/auth
    commit id: "auth-1"
    commit id: "auth-2"
    checkout develop
    merge feature/auth
    checkout main
    merge develop tag: "v1.0"
    commit id: "hotfix"`,
  },
  mindmap: {
    label: "Mind Map",
    category: "Mind Map",
    code: `mindmap
  root((Projet Web))
    Frontend
      React
      TypeScript
      Tailwind CSS
      Vite
    Backend
      Node.js
      PostgreSQL
      Redis
      API REST
    DevOps
      Docker
      CI/CD
      Monitoring
    Design
      Figma
      Design System
      A11y`,
  },
  journey: {
    label: "User Journey",
    category: "Journey",
    code: `journey
    title Parcours utilisateur - Achat
    section Découverte
      Visite homepage: 5: Visiteur
      Recherche produit: 4: Visiteur
      Consulte fiche: 4: Visiteur
    section Achat
      Ajoute au panier: 3: Client
      Crée un compte: 2: Client
      Paiement: 3: Client
    section Post-achat
      Confirmation email: 5: Client
      Suivi livraison: 4: Client
      Avis produit: 3: Client`,
  },
  quadrant: {
    label: "Quadrant",
    category: "Quadrant",
    code: `quadrantChart
    title Priorisation des features
    x-axis Faible effort --> Fort effort
    y-axis Faible impact --> Fort impact
    quadrant-1 Quick wins
    quadrant-2 Projets majeurs
    quadrant-3 A éviter
    quadrant-4 A planifier
    Auth SSO: [0.2, 0.9]
    Dark mode: [0.1, 0.5]
    Export PDF: [0.4, 0.7]
    Refacto DB: [0.8, 0.8]
    Changelog: [0.3, 0.3]
    Migration v2: [0.9, 0.6]`,
  },
};

const THEMES = [
  { value: "default", label: "Default" },
  { value: "dark", label: "Dark" },
  { value: "forest", label: "Forest" },
  { value: "neutral", label: "Neutral" },
];

const LS_KEY = "mermaid-editor-diagrams";

interface SavedDiagram {
  id: string;
  name: string;
  code: string;
  theme: string;
  updatedAt: string;
}

function loadDiagrams(): SavedDiagram[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDiagrams(diagrams: SavedDiagram[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(diagrams));
}

// ── Syntax Highlighting ────────────────────────────────────────────────

function highlightMermaid(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // keywords
    .replace(
      /\b(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram-v2|stateDiagram|erDiagram|gantt|pie|gitGraph|mindmap|journey|quadrantChart|subgraph|end|participant|actor|loop|alt|opt|par|critical|break|rect|note|over|title|section|dateFormat|axisFormat|class|direction)\b/g,
      '<span class="text-chart-1 font-semibold">$1</span>'
    )
    // arrows
    .replace(/(--&gt;|--&gt;\||\.\.&gt;|==&gt;|-&gt;&gt;|--&gt;&gt;|--x|--o|&lt;--&gt;|---|\|&gt;|o--|x--|-\.-&gt;|==)/g,
      '<span class="text-chart-2">$1</span>'
    )
    // strings
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="text-chart-3">$1</span>')
    // comments
    .replace(/(%%.*$)/gm, '<span class="text-muted-foreground italic">$1</span>')
    // labels like :done, :active, :milestone
    .replace(/:(done|active|milestone|crit)\b/g, ':<span class="text-chart-4 font-medium">$1</span>')
    // node shapes [text], {text}, (text), ((text)), etc
    .replace(/(\[[\w\s]+\]|\{[\w\s?]+\})/g, '<span class="text-chart-5">$1</span>');
}

// ── Syntax-highlighted Editor ──────────────────────────────────────────

function SyntaxEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const highlighted = useMemo(() => highlightMermaid(value), [value]);

  const syncScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="relative rounded-md border border-input bg-muted/30 overflow-hidden">
      <pre
        ref={preRef}
        className="absolute inset-0 p-3 font-mono text-sm leading-relaxed overflow-auto pointer-events-none whitespace-pre-wrap break-words"
        aria-hidden
        dangerouslySetInnerHTML={{ __html: highlighted + "\n" }}
      />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        className="relative w-full min-h-[500px] p-3 font-mono text-sm leading-relaxed bg-transparent text-transparent caret-foreground resize-none outline-none"
        spellCheck={false}
      />
    </div>
  );
}

// ── Mermaid Preview Component ──────────────────────────────────────────

function MermaidPreview({ code, theme, zoom }: { code: string; theme: string; zoom: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const renderIdRef = useRef(0);

  useEffect(() => {
    const id = ++renderIdRef.current;
    const render = async () => {
      if (!containerRef.current || !code.trim()) return;
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: theme as any,
          securityLevel: "loose",
          fontFamily: "ui-monospace, monospace",
        });
        const uniqueId = `mermaid-preview-${id}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, code.trim());
        if (id === renderIdRef.current && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (e: any) {
        if (id === renderIdRef.current) {
          setError(e.message || "Erreur de syntaxe Mermaid");
          if (containerRef.current) containerRef.current.innerHTML = "";
        }
      }
    };
    const timeout = setTimeout(render, 400);
    return () => clearTimeout(timeout);
  }, [code, theme]);

  return (
    <div className="relative h-full">
      {error && (
        <div className="absolute top-2 left-2 right-2 z-10 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div
        ref={containerRef}
        className="flex items-center justify-center min-h-[300px] p-4 overflow-auto [&_svg]:max-w-full"
        style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
      />
    </div>
  );
}

// ── File Manager Dialog ────────────────────────────────────────────────

function FileManager({
  onLoad,
  currentCode,
  currentTheme,
}: {
  onLoad: (d: SavedDiagram) => void;
  currentCode: string;
  currentTheme: string;
}) {
  const { toast } = useToast();
  const [diagrams, setDiagrams] = useState<SavedDiagram[]>(loadDiagrams);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  const refresh = () => setDiagrams(loadDiagrams());

  const handleSave = () => {
    const name = newName.trim() || `Diagram ${diagrams.length + 1}`;
    const d: SavedDiagram = {
      id: crypto.randomUUID(),
      name,
      code: currentCode,
      theme: currentTheme,
      updatedAt: new Date().toISOString(),
    };
    const updated = [d, ...diagrams];
    saveDiagrams(updated);
    setDiagrams(updated);
    setNewName("");
    toast({ title: `"${name}" sauvegardé` });
  };

  const handleOverwrite = (id: string) => {
    const updated = diagrams.map((d) =>
      d.id === id ? { ...d, code: currentCode, theme: currentTheme, updatedAt: new Date().toISOString() } : d
    );
    saveDiagrams(updated);
    setDiagrams(updated);
    toast({ title: "Diagramme mis à jour" });
  };

  const handleDelete = (id: string) => {
    const updated = diagrams.filter((d) => d.id !== id);
    saveDiagrams(updated);
    setDiagrams(updated);
    toast({ title: "Diagramme supprimé" });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) refresh(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderOpen className="h-3.5 w-3.5 mr-1" /> Fichiers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mes diagrammes</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            placeholder="Nom du diagramme…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <Button size="sm" onClick={handleSave}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Sauvegarder
          </Button>
        </div>
        <ScrollArea className="max-h-[350px]">
          {diagrams.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun diagramme sauvegardé</p>
          )}
          <div className="space-y-2">
            {diagrams.map((d) => (
              <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(d.updatedAt).toLocaleString("fr-FR")} · {d.theme}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { onLoad(d); setOpen(false); }} title="Charger">
                  <FolderOpen className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOverwrite(d.id)} title="Écraser">
                  <Save className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(d.id)} title="Supprimer">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ── Style Panel ────────────────────────────────────────────────────────

interface NodeStyle {
  id: string;
  name: string;
  fill: string;
  stroke: string;
  strokeWidth: string;
  color: string;
  fontFamily: string;
  fontSize: string;
  rx: string;
}

const DEFAULT_NODE_STYLE: Omit<NodeStyle, "id" | "name"> = {
  fill: "#4f46e5",
  stroke: "#3730a3",
  strokeWidth: "2",
  color: "#ffffff",
  fontFamily: "sans-serif",
  fontSize: "14",
  rx: "5",
};

const FONT_OPTIONS = [
  { value: "sans-serif", label: "Sans-serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "cursive", label: "Cursive" },
  { value: "ui-monospace, monospace", label: "UI Mono" },
];

const PRESET_STYLES: { label: string; style: Omit<NodeStyle, "id" | "name"> }[] = [
  { label: "Indigo", style: { fill: "#4f46e5", stroke: "#3730a3", strokeWidth: "2", color: "#ffffff", fontFamily: "sans-serif", fontSize: "14", rx: "5" } },
  { label: "Emerald", style: { fill: "#059669", stroke: "#047857", strokeWidth: "2", color: "#ffffff", fontFamily: "sans-serif", fontSize: "14", rx: "8" } },
  { label: "Rose", style: { fill: "#e11d48", stroke: "#be123c", strokeWidth: "2", color: "#ffffff", fontFamily: "sans-serif", fontSize: "14", rx: "5" } },
  { label: "Amber", style: { fill: "#d97706", stroke: "#b45309", strokeWidth: "2", color: "#1a1a1a", fontFamily: "sans-serif", fontSize: "14", rx: "5" } },
  { label: "Slate", style: { fill: "#475569", stroke: "#334155", strokeWidth: "1", color: "#f1f5f9", fontFamily: "monospace", fontSize: "13", rx: "3" } },
  { label: "Neon", style: { fill: "#0f172a", stroke: "#22d3ee", strokeWidth: "3", color: "#22d3ee", fontFamily: "monospace", fontSize: "14", rx: "0" } },
  { label: "Pastel", style: { fill: "#dbeafe", stroke: "#93c5fd", strokeWidth: "1", color: "#1e3a5f", fontFamily: "sans-serif", fontSize: "14", rx: "12" } },
  { label: "Dark", style: { fill: "#1e1b4b", stroke: "#7c3aed", strokeWidth: "2", color: "#c4b5fd", fontFamily: "sans-serif", fontSize: "14", rx: "8" } },
];

function StylePanel({ onApply }: { onApply: (classDefs: string) => void }) {
  const [styles, setStyles] = useState<NodeStyle[]>([
    { id: crypto.randomUUID(), name: "highlight", ...DEFAULT_NODE_STYLE },
  ]);
  const [activeStyleId, setActiveStyleId] = useState(styles[0].id);
  const activeStyle = styles.find((s) => s.id === activeStyleId) || styles[0];

  const updateStyle = (field: keyof NodeStyle, value: string) => {
    setStyles((prev) => prev.map((s) => (s.id === activeStyleId ? { ...s, [field]: value } : s)));
  };

  const addStyle = () => {
    const ns: NodeStyle = { id: crypto.randomUUID(), name: `style${styles.length + 1}`, ...DEFAULT_NODE_STYLE };
    setStyles((prev) => [...prev, ns]);
    setActiveStyleId(ns.id);
  };

  const removeStyle = (id: string) => {
    if (styles.length <= 1) return;
    const updated = styles.filter((s) => s.id !== id);
    setStyles(updated);
    if (activeStyleId === id) setActiveStyleId(updated[0].id);
  };

  const applyPreset = (preset: Omit<NodeStyle, "id" | "name">) => {
    setStyles((prev) => prev.map((s) => (s.id === activeStyleId ? { ...s, ...preset } : s)));
  };

  const genClassDefs = (): string =>
    styles
      .map((s) => `classDef ${s.name} fill:${s.fill},stroke:${s.stroke},stroke-width:${s.strokeWidth}px,color:${s.color},font-family:${s.fontFamily},font-size:${s.fontSize}px,rx:${s.rx}px`)
      .join("\n");

  return (
    <ScrollArea className="h-[560px]">
      <div className="space-y-4 pr-4">
        {/* Style classes tabs */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Classes de style</Label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStyleId(s.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${s.id === activeStyleId ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
              >
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: s.fill, border: `1px solid ${s.stroke}` }} />
                {s.name}
                {styles.length > 1 && (
                  <X className="h-3 w-3 ml-0.5 opacity-50 hover:opacity-100" onClick={(e) => { e.stopPropagation(); removeStyle(s.id); }} />
                )}
              </button>
            ))}
            <button onClick={addStyle} className="px-2 py-1 rounded-md text-xs border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
              <Plus className="h-3 w-3 inline mr-0.5" /> Ajouter
            </button>
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Nom de la classe</Label>
          <Input value={activeStyle.name} onChange={(e) => updateStyle("name", e.target.value.replace(/\s/g, ""))} className="h-8 text-sm mt-1" />
        </div>

        {/* Presets */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Préréglages</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {PRESET_STYLES.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p.style)} className="flex flex-col items-center gap-1 p-2 rounded-md border border-border hover:border-primary/50 transition-colors" title={p.label}>
                <div className="w-full h-5 rounded" style={{ backgroundColor: p.style.fill, border: `${p.style.strokeWidth}px solid ${p.style.stroke}`, borderRadius: `${p.style.rx}px` }} />
                <span className="text-[10px] text-muted-foreground truncate w-full text-center">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Couleurs</Label>
          <div className="grid grid-cols-2 gap-3">
            {([["Fond", "fill"], ["Texte", "color"], ["Bordure", "stroke"]] as const).map(([label, field]) => (
              <div key={field}>
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={activeStyle[field]} onChange={(e) => updateStyle(field, e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={activeStyle[field]} onChange={(e) => updateStyle(field, e.target.value)} className="h-8 text-xs font-mono flex-1" />
                </div>
              </div>
            ))}
            <div>
              <Label className="text-xs text-muted-foreground">Épaisseur</Label>
              <Input type="number" min="0" max="10" value={activeStyle.strokeWidth} onChange={(e) => updateStyle("strokeWidth", e.target.value)} className="h-8 text-xs mt-1" />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Typographie</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Police</Label>
              <Select value={activeStyle.fontFamily} onValueChange={(v) => updateStyle("fontFamily", v)}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Taille (px)</Label>
              <Input type="number" min="8" max="32" value={activeStyle.fontSize} onChange={(e) => updateStyle("fontSize", e.target.value)} className="h-8 text-xs mt-1" />
            </div>
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Arrondi (rx)</Label>
          <div className="flex items-center gap-3">
            <input type="range" min="0" max="30" value={activeStyle.rx} onChange={(e) => updateStyle("rx", e.target.value)} className="flex-1 h-2 accent-primary" />
            <span className="text-xs text-muted-foreground w-10 text-right">{activeStyle.rx}px</span>
          </div>
        </div>

        {/* Node Preview */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Aperçu du nœud</Label>
          <div className="flex items-center justify-center p-4 rounded-lg border border-border bg-muted/30">
            <div className="px-4 py-2" style={{ backgroundColor: activeStyle.fill, border: `${activeStyle.strokeWidth}px solid ${activeStyle.stroke}`, color: activeStyle.color, fontFamily: activeStyle.fontFamily, fontSize: `${activeStyle.fontSize}px`, borderRadius: `${activeStyle.rx}px` }}>
              Exemple de nœud
            </div>
          </div>
        </div>

        {/* Generated Code */}
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Code généré</Label>
          <pre className="p-3 rounded-md bg-muted/50 border border-border text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all text-foreground">{genClassDefs()}</pre>
        </div>

        <Button className="w-full" onClick={() => onApply(genClassDefs())}>
          <Palette className="h-4 w-4 mr-2" /> Injecter les styles dans le code
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Ajoute les <code className="bg-muted px-1 rounded">classDef</code> en fin de code.
          Appliquez avec <code className="bg-muted px-1 rounded">A:::highlight</code>
        </p>
      </div>
    </ScrollArea>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export default function MermaidEditor() {
  const { toast } = useToast();
  const [code, setCode] = useState(TEMPLATES.flowchart_basic.code);
  const [theme, setTheme] = useState("default");
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState("editor");
  const [history, setHistory] = useState<string[]>([TEMPLATES.flowchart_basic.code]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const categories = [...new Set(Object.values(TEMPLATES).map((t) => t.category))];

  const updateCode = useCallback(
    (newCode: string) => {
      setCode(newCode);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newCode);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCode(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCode(history[historyIndex + 1]);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code Mermaid copié" });
  };

  const copySvg = () => {
    const svgEl = document.querySelector("#mermaid-render-area svg");
    if (svgEl) {
      navigator.clipboard.writeText(svgEl.outerHTML);
      toast({ title: "SVG copié dans le presse-papier" });
    }
  };

  const exportSvg = () => {
    const svgEl = document.querySelector("#mermaid-render-area svg");
    if (!svgEl) return;
    const blob = new Blob([svgEl.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "SVG exporté" });
  };

  const exportPng = async () => {
    const svgEl = document.querySelector("#mermaid-render-area svg") as SVGSVGElement | null;
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = "diagram.png";
      a.click();
      toast({ title: "PNG exporté (2x)" });
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const exportPdf = async () => {
    const svgEl = document.querySelector("#mermaid-render-area svg") as SVGSVGElement | null;
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    });

    const scale = 3;
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const pngDataUrl = canvas.toDataURL("image/png");

    const margin = 20;
    const headerH = 30;
    const footerH = 20;
    const maxW = 210 - margin * 2; // A4 width minus margins
    const maxH = 297 - margin * 2 - headerH - footerH;

    const ratio = img.width / img.height;
    let imgW = maxW;
    let imgH = imgW / ratio;
    if (imgH > maxH) {
      imgH = maxH;
      imgW = imgH * ratio;
    }

    const pdf = new jsPDF({ orientation: imgW > imgH * 1.3 ? "landscape" : "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Header
    pdf.setFillColor(245, 245, 250);
    pdf.rect(0, 0, pageW, margin + headerH, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(30, 30, 60);
    pdf.text("Diagramme Mermaid", margin, margin + 10);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 140);
    const dateStr = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
    pdf.text(dateStr, margin, margin + 18);
    pdf.text(`Theme: ${theme}  |  ${code.split("\\n").length} lignes`, pageW - margin, margin + 18, { align: "right" });

    // Separator line
    pdf.setDrawColor(200, 200, 220);
    pdf.setLineWidth(0.3);
    pdf.line(margin, margin + headerH, pageW - margin, margin + headerH);

    // Diagram image centered
    const imgX = (pageW - imgW) / 2;
    const imgY = margin + headerH + (maxH - imgH) / 2 + 5;
    pdf.addImage(pngDataUrl, "PNG", imgX, imgY, imgW, imgH);

    // Border around diagram
    pdf.setDrawColor(220, 220, 230);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(imgX - 2, imgY - 2, imgW + 4, imgH + 4, 2, 2, "S");

    // Footer
    pdf.setDrawColor(200, 200, 220);
    pdf.line(margin, pageH - margin - footerH, pageW - margin, pageH - margin - footerH);
    pdf.setFontSize(8);
    pdf.setTextColor(160, 160, 180);
    pdf.text("Généré avec Mermaid Editor", margin, pageH - margin - 5);
    pdf.text("Page 1/1", pageW - margin, pageH - margin - 5, { align: "right" });

    pdf.save("diagram.pdf");
    toast({ title: "PDF exporté avec mise en page professionnelle" });
  };

  const shareUrl = () => {
    const params = new URLSearchParams({ code: btoa(unescape(encodeURIComponent(code))), theme });
    const url = `${window.location.origin}/mermaid-editor?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast({ title: "URL de partage copiée" });
  };

  const loadDiagram = (d: SavedDiagram) => {
    updateCode(d.code);
    setTheme(d.theme);
    toast({ title: `"${d.name}" chargé` });
  };

  // Load from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("code");
    const t = params.get("theme");
    if (encoded) {
      try {
        const decoded = decodeURIComponent(escape(atob(encoded)));
        setCode(decoded);
        setHistory([decoded]);
        setHistoryIndex(0);
      } catch {}
    }
    if (t && THEMES.some((th) => th.value === t)) setTheme(t);
  }, []);

  // Escape to exit fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreen) setFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen]);

  // ── Fullscreen overlay ──
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="font-semibold text-foreground">Aperçu plein écran</span>
          <div className="flex items-center gap-2">
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={exportSvg}><Download className="h-3.5 w-3.5 mr-1" /> SVG</Button>
            <Button variant="outline" size="sm" onClick={exportPng}><Download className="h-3.5 w-3.5 mr-1" /> PNG</Button>
            <Button variant="outline" size="sm" onClick={exportPdf}><Download className="h-3.5 w-3.5 mr-1" /> PDF</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFullscreen(false)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div id="mermaid-render-area" className="flex-1 overflow-auto">
          <MermaidPreview code={code} theme={theme} zoom={zoom} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Éditeur Mermaid</h1>
          <p className="text-muted-foreground mt-1">
            Créez, visualisez et exportez des diagrammes Mermaid avec templates et préréglages
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FileManager onLoad={loadDiagram} currentCode={code} currentTheme={theme} />
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Editor */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="editor" className="flex-1 gap-1">
                <Code className="h-4 w-4" /> Éditeur
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex-1 gap-1">
                <Layers className="h-4 w-4" /> Templates
              </TabsTrigger>
              <TabsTrigger value="styles" className="flex-1 gap-1">
                <Palette className="h-4 w-4" /> Styles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                  <RotateCcw className="h-3 w-3 mr-1" /> Undo
                </Button>
                <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                  <RotateCcw className="h-3 w-3 mr-1 scale-x-[-1]" /> Redo
                </Button>
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={copyCode}>
                  <Copy className="h-3 w-3 mr-1" /> Copier
                </Button>
                <Button variant="outline" size="sm" onClick={shareUrl}>
                  <Share2 className="h-3 w-3 mr-1" /> Partager
                </Button>
              </div>
              <SyntaxEditor value={code} onChange={updateCode} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{code.split("\n").length} lignes</span>
                <span>{code.length} caractères</span>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <ScrollArea className="h-[560px]">
                <div className="space-y-4 pr-4">
                  {categories.map((cat) => (
                    <div key={cat}>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">{cat}</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(TEMPLATES)
                          .filter(([, t]) => t.category === cat)
                          .map(([key, t]) => (
                            <button
                              key={key}
                              onClick={() => {
                                updateCode(t.code);
                                setActiveTab("editor");
                                toast({ title: `Template "${t.label}" chargé` });
                              }}
                              className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
                            >
                              <div className="font-medium text-sm text-foreground">{t.label}</div>
                              <pre className="text-xs text-muted-foreground mt-1 line-clamp-2 font-mono">
                                {t.code.split("\n").slice(0, 2).join("\n")}
                              </pre>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="styles">
              <StylePanel
                onApply={(classDefs) => {
                  // Remove existing classDef lines and append new ones
                  const lines = code.split("\n").filter((l) => !l.trim().startsWith("classDef "));
                  const newCode = lines.join("\n").trimEnd() + "\n" + classDefs;
                  updateCode(newCode);
                  setActiveTab("editor");
                  toast({ title: "Styles injectés dans le code" });
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Preview */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Aperçu</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setFullscreen(true)} title="Plein écran">
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={copySvg} title="Copier SVG">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={exportSvg} title="Exporter SVG">
                  <FileText className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={exportPng} title="Exporter PNG">
                  <Image className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              id="mermaid-render-area"
              className="rounded-lg border border-border bg-background min-h-[500px] overflow-auto"
            >
              <MermaidPreview code={code} theme={theme} zoom={zoom} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground">Exporter :</span>
            <Button variant="outline" size="sm" onClick={exportSvg}>
              <Download className="h-3.5 w-3.5 mr-1" /> SVG
            </Button>
            <Button variant="outline" size="sm" onClick={exportPng}>
              <Download className="h-3.5 w-3.5 mr-1" /> PNG (2x)
            </Button>
            <Button variant="outline" size="sm" onClick={exportPdf}>
              <Download className="h-3.5 w-3.5 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={copyCode}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Code Mermaid
            </Button>
            <Button variant="outline" size="sm" onClick={copySvg}>
              <Copy className="h-3.5 w-3.5 mr-1" /> SVG HTML
            </Button>
            <Button variant="outline" size="sm" onClick={shareUrl}>
              <Share2 className="h-3.5 w-3.5 mr-1" /> Lien de partage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
