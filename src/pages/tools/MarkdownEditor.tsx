import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { 
  Copy, Download, Eye, Code, FileDown, RotateCcw, Table, List, Image, 
  FileText, Maximize2, Minimize2, Clock, FileCode, GitBranch, BookOpen,
  Bold, Italic, Strikethrough, Link, Heading1, Heading2, Heading3,
  ListOrdered, CodeSquare, Quote, Minus, HelpCircle, ListTree, X
} from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { toast } from "sonner";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import mermaid from "mermaid";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

// Document templates
const documentTemplates = [
  {
    name: "README",
    icon: BookOpen,
    description: "Template README.md standard",
    content: `# Nom du Projet

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)

## 📋 Description

Une brève description de votre projet.

## ✨ Fonctionnalités

- ✅ Fonctionnalité 1
- ✅ Fonctionnalité 2
- ✅ Fonctionnalité 3

## 🚀 Installation

\`\`\`bash
# Cloner le repository
git clone https://github.com/username/project.git

# Installer les dépendances
npm install

# Lancer le projet
npm start
\`\`\`

## 📖 Utilisation

\`\`\`javascript
import { monModule } from 'mon-projet';

// Exemple d'utilisation
const result = monModule.doSomething();
\`\`\`

## 🔧 Configuration

| Variable | Description | Défaut |
|----------|-------------|--------|
| \`API_URL\` | URL de l'API | \`http://localhost:3000\` |
| \`DEBUG\` | Mode debug | \`false\` |

## 📁 Structure du projet

\`\`\`
src/
├── components/
├── hooks/
├── utils/
└── index.ts
\`\`\`

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## 📝 License

MIT © [Votre Nom](https://github.com/username)
`
  },
  {
    name: "CHANGELOG",
    icon: GitBranch,
    description: "Template CHANGELOG.md",
    content: `# Changelog

Toutes les modifications notables de ce projet seront documentées ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versioning Sémantique](https://semver.org/lang/fr/).

## [Unreleased]

### Ajouté
- Nouvelle fonctionnalité X

### Modifié
- Amélioration de Y

### Corrigé
- Bug Z corrigé

## [1.0.0] - 2024-01-15

### Ajouté
- 🎉 Première version stable
- Fonctionnalité principale A
- Fonctionnalité principale B
- Documentation complète

### Sécurité
- Mise à jour des dépendances

## [0.2.0] - 2024-01-01

### Ajouté
- Fonctionnalité beta C

### Modifié
- Refactoring du module X

## [0.1.0] - 2023-12-15

### Ajouté
- Version initiale du projet
- Configuration de base
- Tests unitaires

---

[Unreleased]: https://github.com/username/project/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/username/project/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/username/project/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/username/project/releases/tag/v0.1.0
`
  },
  {
    name: "API Doc",
    icon: FileCode,
    description: "Documentation d'API REST",
    content: `# Documentation API

## Base URL

\`\`\`
https://api.example.com/v1
\`\`\`

## Authentification

Toutes les requêtes nécessitent un header d'authentification :

\`\`\`
Authorization: Bearer <token>
\`\`\`

---

## Endpoints

### Utilisateurs

#### GET /users

Récupère la liste des utilisateurs.

**Paramètres de requête :**

| Param | Type | Description |
|-------|------|-------------|
| \`page\` | number | Numéro de page (défaut: 1) |
| \`limit\` | number | Éléments par page (défaut: 20) |

**Réponse :**

\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
\`\`\`

#### POST /users

Crée un nouvel utilisateur.

**Body :**

\`\`\`json
{
  "name": "string (requis)",
  "email": "string (requis)",
  "password": "string (requis, min 8 caractères)"
}
\`\`\`

**Réponses :**

| Status | Description |
|--------|-------------|
| 201 | Utilisateur créé |
| 400 | Données invalides |
| 409 | Email déjà utilisé |

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

## Diagramme de séquence

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant D as Database
    
    C->>A: POST /users
    A->>A: Valider données
    A->>D: INSERT user
    D-->>A: User créé
    A-->>C: 201 Created
\`\`\`
`
  },
  {
    name: "Flowchart",
    icon: GitBranch,
    description: "Diagramme Mermaid de flux",
    content: `# Diagramme de Flux

## Processus d'authentification

\`\`\`mermaid
flowchart TD
    A[Utilisateur] --> B{Connecté ?}
    B -->|Non| C[Page de connexion]
    C --> D[Entrer identifiants]
    D --> E{Valides ?}
    E -->|Oui| F[Créer session]
    F --> G[Rediriger Dashboard]
    E -->|Non| H[Afficher erreur]
    H --> C
    B -->|Oui| G
\`\`\`

## Architecture du système

\`\`\`mermaid
flowchart LR
    subgraph Frontend
        A[React App]
        B[Components]
        C[State]
    end
    
    subgraph Backend
        D[API Gateway]
        E[Auth Service]
        F[Data Service]
    end
    
    subgraph Storage
        G[(PostgreSQL)]
        H[(Redis Cache)]
    end
    
    A --> D
    D --> E
    D --> F
    E --> H
    F --> G
\`\`\`

## Diagramme de classes

\`\`\`mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +login()
        +logout()
    }
    
    class Order {
        +String id
        +Date createdAt
        +Float total
        +addItem()
        +removeItem()
    }
    
    class Product {
        +String id
        +String name
        +Float price
    }
    
    User "1" --> "*" Order : places
    Order "*" --> "*" Product : contains
\`\`\`
`
  }
];

const defaultMarkdown = `# Éditeur Markdown Pro

## 🎯 Fonctionnalités

### Formatage de Texte
- **Texte gras** avec \`**texte**\`
- *Texte italique* avec \`*texte*\`
- ***Gras et italique*** avec \`***texte***\`
- ~~Texte barré~~ avec \`~~texte~~\`

### Diagrammes Mermaid

\`\`\`mermaid
flowchart LR
    A[Écrire Markdown] --> B[Parser]
    B --> C[Rendu HTML]
    B --> D[Rendu Mermaid]
    C --> E[Aperçu]
    D --> E
\`\`\`

### Tableaux

| Fonctionnalité | Status | Notes |
|----------------|--------|-------|
| Mermaid.js | ✅ | Diagrammes intégrés |
| Mode Focus | ✅ | Écriture zen |
| Templates | ✅ | README, CHANGELOG |
| Export PDF | ✅ | Via html2canvas |

### Code

\`\`\`javascript
function hello(name) {
  return \`Bonjour \${name}!\`;
}
\`\`\`

### Citations

> "Le code est comme l'humour. Quand vous devez l'expliquer, c'est mauvais."
> — Cory House

---

**Raccourcis :** Ctrl+B (gras) · Ctrl+I (italique) · Ctrl+K (lien) · Ctrl+S (sauvegarder)
`;

// Quick insert templates
const quickTemplates = [
  { name: "Tableau", icon: Table, content: `| Colonne 1 | Colonne 2 | Colonne 3 |\n|-----------|-----------|-----------|\n| Cellule 1 | Cellule 2 | Cellule 3 |` },
  { name: "Tâches", icon: List, content: `- [ ] Tâche à faire\n- [x] Tâche terminée\n- [ ] Autre tâche` },
  { name: "Code", icon: Code, content: `\`\`\`javascript\nfunction exemple() {\n  console.log("Hello World!");\n}\n\`\`\`` },
  { name: "Mermaid", icon: GitBranch, content: `\`\`\`mermaid\nflowchart TD\n    A[Début] --> B{Condition}\n    B -->|Oui| C[Action 1]\n    B -->|Non| D[Action 2]\n    C --> E[Fin]\n    D --> E\n\`\`\`` },
  { name: "Image", icon: Image, content: `![Description](https://via.placeholder.com/400x200)` }
];

// Keyboard shortcuts definition
const shortcutsList = [
  { keys: "Ctrl+B", label: "Gras", action: "bold" },
  { keys: "Ctrl+I", label: "Italique", action: "italic" },
  { keys: "Ctrl+K", label: "Lien", action: "link" },
  { keys: "Ctrl+Shift+K", label: "Code inline", action: "inlineCode" },
  { keys: "Ctrl+Shift+X", label: "Barré", action: "strikethrough" },
  { keys: "Ctrl+1", label: "Titre H1", action: "h1" },
  { keys: "Ctrl+2", label: "Titre H2", action: "h2" },
  { keys: "Ctrl+3", label: "Titre H3", action: "h3" },
  { keys: "Ctrl+Shift+L", label: "Liste à puces", action: "ul" },
  { keys: "Ctrl+Shift+O", label: "Liste numérotée", action: "ol" },
  { keys: "Ctrl+Shift+C", label: "Bloc de code", action: "codeBlock" },
  { keys: "Ctrl+Shift+Q", label: "Citation", action: "quote" },
  { keys: "Ctrl+S", label: "Sauvegarder", action: "save" },
  { keys: "Ctrl+Shift+F", label: "Mode Focus", action: "focus" },
];

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("");
  const [view, setView] = useState<"split" | "code" | "preview">("split");
  const [focusMode, setFocusMode] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("markdown-content");
    setMarkdown(saved || defaultMarkdown);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("markdown-content", markdown);
    }, 500);
    return () => clearTimeout(timer);
  }, [markdown]);

  // --- Text manipulation helpers ---
  const wrapSelection = useCallback((before: string, after: string) => {
    const ta = editorRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = markdown.substring(start, end);
    const newText = markdown.substring(0, start) + before + selected + after + markdown.substring(end);
    setMarkdown(newText);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = end + before.length;
    }, 0);
  }, [markdown]);

  const insertAtLineStart = useCallback((prefix: string) => {
    const ta = editorRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
    const newText = markdown.substring(0, lineStart) + prefix + markdown.substring(lineStart);
    setMarkdown(newText);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + prefix.length;
    }, 0);
  }, [markdown]);

  const applyFormat = useCallback((action: string) => {
    switch (action) {
      case "bold": wrapSelection("**", "**"); break;
      case "italic": wrapSelection("*", "*"); break;
      case "strikethrough": wrapSelection("~~", "~~"); break;
      case "inlineCode": wrapSelection("`", "`"); break;
      case "link": wrapSelection("[", "](url)"); break;
      case "h1": insertAtLineStart("# "); break;
      case "h2": insertAtLineStart("## "); break;
      case "h3": insertAtLineStart("### "); break;
      case "ul": insertAtLineStart("- "); break;
      case "ol": insertAtLineStart("1. "); break;
      case "codeBlock": wrapSelection("```\n", "\n```"); break;
      case "quote": insertAtLineStart("> "); break;
      case "hr": {
        const ta = editorRef.current;
        if (!ta) return;
        const pos = ta.selectionStart;
        const newText = markdown.substring(0, pos) + "\n---\n" + markdown.substring(pos);
        setMarkdown(newText);
        setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = pos + 5; }, 0);
        break;
      }
      case "save":
        localStorage.setItem("markdown-content", markdown);
        toast.success("Document sauvegardé !");
        break;
      case "focus":
        setFocusMode(f => !f);
        break;
    }
  }, [wrapSelection, insertAtLineStart, markdown]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      let action: string | null = null;
      if (e.shiftKey) {
        switch (e.key.toUpperCase()) {
          case "K": action = "inlineCode"; break;
          case "X": action = "strikethrough"; break;
          case "L": action = "ul"; break;
          case "O": action = "ol"; break;
          case "C": action = "codeBlock"; break;
          case "Q": action = "quote"; break;
          case "F": action = "focus"; break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case "b": action = "bold"; break;
          case "i": action = "italic"; break;
          case "k": action = "link"; break;
          case "s": action = "save"; break;
          case "1": action = "h1"; break;
          case "2": action = "h2"; break;
          case "3": action = "h3"; break;
        }
      }

      if (action) {
        e.preventDefault();
        applyFormat(action);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [applyFormat]);

  // --- Scroll sync ---
  const handleEditorScroll = useCallback(() => {
    if (isSyncingScroll.current || !editorRef.current || !previewScrollRef.current) return;
    isSyncingScroll.current = true;
    const ta = editorRef.current;
    const ratio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight || 1);
    const target = previewScrollRef.current;
    target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
    requestAnimationFrame(() => { isSyncingScroll.current = false; });
  }, []);

  const handlePreviewScroll = useCallback(() => {
    if (isSyncingScroll.current || !editorRef.current || !previewScrollRef.current) return;
    isSyncingScroll.current = true;
    const target = previewScrollRef.current;
    const ratio = target.scrollTop / (target.scrollHeight - target.clientHeight || 1);
    const ta = editorRef.current;
    ta.scrollTop = ratio * (ta.scrollHeight - ta.clientHeight);
    requestAnimationFrame(() => { isSyncingScroll.current = false; });
  }, []);

  // --- TOC extraction ---
  const tocItems = useMemo(() => {
    const regex = /^(#{1,4}) (.+)$/gm;
    const items: { level: number; text: string; id: string }[] = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      const level = match[1].length;
      const text = match[2].replace(/[*_~`]/g, "");
      items.push({ level, text, id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
    }
    return items;
  }, [markdown]);

  // Render mermaid diagrams
  const renderMermaid = useCallback(async () => {
    if (!previewRef.current) return;
    const mermaidBlocks = previewRef.current.querySelectorAll('.mermaid-block:not(.mermaid-rendered)');
    for (const block of mermaidBlocks) {
      const code = block.getAttribute('data-code');
      if (!code) continue;
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        block.innerHTML = svg;
        block.classList.add('mermaid-rendered');
      } catch (error) {
        block.innerHTML = `<pre class="text-destructive text-sm p-2 bg-destructive/10 rounded">Erreur Mermaid: ${error}</pre>`;
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(renderMermaid, 100);
    return () => clearTimeout(timer);
  }, [markdown, view, renderMermaid]);

  // --- Markdown to HTML converter ---
  const convertToHTML = (md: string): string => {
    let html = md;
    html = html.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
      const escapedCode = code.trim().replace(/"/g, '&quot;');
      return `<div class="mermaid-block my-4 p-4 bg-muted/50 rounded-lg border border-border flex justify-center" data-code="${escapedCode}"></div>`;
    });
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-base font-semibold mt-3 mb-2">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');
    const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
    html = html.replace(tableRegex, (match) => {
      const lines = match.trim().split('\n');
      const headers = lines[0].split('|').filter(h => h.trim());
      const rows = lines.slice(2).map(row => row.split('|').filter(cell => cell.trim()));
      let table = '<table class="min-w-full my-4 border-collapse border border-border"><thead><tr>';
      headers.forEach(header => { table += `<th class="border border-border px-4 py-2 bg-muted font-semibold">${header.trim()}</th>`; });
      table += '</tr></thead><tbody>';
      rows.forEach(row => { table += '<tr>'; row.forEach(cell => { table += `<td class="border border-border px-4 py-2">${cell.trim()}</td>`; }); table += '</tr>'; });
      table += '</tbody></table>';
      return table;
    });
    html = html.replace(/^- \[x\] (.+)$/gim, '<li class="flex items-center gap-2"><input type="checkbox" checked disabled class="rounded" /> <span>$1</span></li>');
    html = html.replace(/^- \[ \] (.+)$/gim, '<li class="flex items-center gap-2"><input type="checkbox" disabled class="rounded" /> <span>$1</span></li>');
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<del class="line-through opacity-70">$1</del>');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg" />');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block my-4 p-4 rounded-lg overflow-x-auto bg-muted border border-border"><code class="text-sm">$2</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-muted border border-border rounded text-sm font-mono">$1</code>');
    html = html.replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/30 rounded-r">$1</blockquote>');
    html = html.replace(/^---$/gim, '<hr class="my-8 border-t-2 border-border" />');
    html = html.replace(/^\d+\. (.+)$/gim, '<li class="ml-6">$1</li>');
    const olRegex = /(<li class="ml-6">.*<\/li>\n?)+/g;
    html = html.replace(olRegex, '<ol class="list-decimal my-4">$&</ol>');
    html = html.replace(/^[-*] (.+)$/gim, '<li class="ml-6">$1</li>');
    const ulRegex = /(<li class="ml-6">.*<\/li>\n?)+/g;
    html = html.replace(ulRegex, '<ul class="list-disc my-4">$&</ul>');
    html = html.split('\n\n').map(para => {
      if (para.match(/^<[h|ul|ol|pre|blockquote|hr|table|img|div]/)) return para;
      if (para.trim() === '') return '';
      return `<p class="my-3 leading-relaxed">${para}</p>`;
    }).join('\n');
    return html;
  };

  // --- Actions ---
  const copyToClipboard = () => { navigator.clipboard.writeText(markdown); toast.success("Copié !"); };

  const downloadAsMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'document.md'; a.click();
    URL.revokeObjectURL(url); toast.success("Fichier .md téléchargé !");
  };

  const downloadAsHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Markdown Export</title>
<style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 40px auto; padding: 40px 20px; line-height: 1.7; color: #333; } h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; } h1 { font-size: 2.5em; border-bottom: 3px solid #e0e0e0; padding-bottom: 0.3em; } h2 { font-size: 2em; border-bottom: 2px solid #e8e8e8; padding-bottom: 0.2em; } pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; border: 1px solid #e1e4e8; margin: 1em 0; } code { font-family: 'Courier New', Consolas, monospace; font-size: 0.9em; background: #f6f8fa; padding: 2px 6px; border-radius: 3px; } pre code { background: none; padding: 0; } blockquote { border-left: 4px solid #0066cc; padding-left: 16px; margin: 1em 0; color: #666; font-style: italic; background: #f9f9f9; padding: 12px 16px; border-radius: 0 4px 4px 0; } ul, ol { margin: 1em 0; padding-left: 2em; } table { border-collapse: collapse; width: 100%; margin: 1em 0; } th, td { border: 1px solid #ddd; padding: 12px; text-align: left; } th { background-color: #f6f8fa; font-weight: 600; } img { max-width: 100%; height: auto; border-radius: 8px; } hr { border: none; border-top: 2px solid #e0e0e0; margin: 2em 0; }</style>
</head><body>${convertToHTML(markdown)}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'document.html'; a.click();
    URL.revokeObjectURL(url); toast.success("HTML téléchargé !");
  };

  const downloadAsPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    toast.info("Génération du PDF en cours...");
    try {
      await renderMermaid();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force light theme for PDF
      const el = previewRef.current;
      const prevBg = el.style.backgroundColor;
      const prevColor = el.style.color;
      el.style.backgroundColor = '#ffffff';
      el.style.color = '#1a1a1a';

      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });

      el.style.backgroundColor = prevBg;
      el.style.color = prevColor;

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('document.pdf');
      toast.success("PDF téléchargé !");
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const insertTemplate = (content: string) => { setMarkdown(prev => prev + '\n\n' + content); toast.success("Inséré !"); };
  const loadDocumentTemplate = (template: typeof documentTemplates[0]) => { setMarkdown(template.content); setIsTemplateDialogOpen(false); toast.success(`Template ${template.name} chargé !`); };
  const resetEditor = () => { setMarkdown(defaultMarkdown); toast.success("Réinitialisé !"); };
  const toggleFocusMode = () => { setFocusMode(!focusMode); if (!focusMode) setView("split"); };

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const charCount = markdown.length;
  const lineCount = markdown.split('\n').length;
  const readingTime = Math.ceil(wordCount / 200);

  // --- Formatting toolbar ---
  const FormatToolbar = () => (
    <div className="flex flex-wrap items-center gap-0.5 p-1 border border-border rounded-md bg-muted/30">
      {[
        { icon: Bold, action: "bold", tip: "Gras (Ctrl+B)" },
        { icon: Italic, action: "italic", tip: "Italique (Ctrl+I)" },
        { icon: Strikethrough, action: "strikethrough", tip: "Barré (Ctrl+Shift+X)" },
        { icon: CodeSquare, action: "inlineCode", tip: "Code (Ctrl+Shift+K)" },
        { icon: Link, action: "link", tip: "Lien (Ctrl+K)" },
      ].map(({ icon: Icon, action, tip }) => (
        <Tooltip key={action} content={tip}>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => applyFormat(action)}>
            <Icon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      ))}
      <div className="w-px h-5 bg-border mx-1" />
      {[
        { icon: Heading1, action: "h1", tip: "H1 (Ctrl+1)" },
        { icon: Heading2, action: "h2", tip: "H2 (Ctrl+2)" },
        { icon: Heading3, action: "h3", tip: "H3 (Ctrl+3)" },
      ].map(({ icon: Icon, action, tip }) => (
        <Tooltip key={action} content={tip}>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => applyFormat(action)}>
            <Icon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      ))}
      <div className="w-px h-5 bg-border mx-1" />
      {[
        { icon: List, action: "ul", tip: "Liste (Ctrl+Shift+L)" },
        { icon: ListOrdered, action: "ol", tip: "Liste num. (Ctrl+Shift+O)" },
        { icon: Quote, action: "quote", tip: "Citation (Ctrl+Shift+Q)" },
        { icon: Minus, action: "hr", tip: "Séparateur" },
      ].map(({ icon: Icon, action, tip }) => (
        <Tooltip key={action} content={tip}>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => applyFormat(action)}>
            <Icon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      ))}
    </div>
  );

  // --- TOC sidebar ---
  const TocPanel = () => (
    <div className="w-56 shrink-0 border-r border-border p-3 overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <ListTree className="h-4 w-4" /> Sommaire
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowToc(false)}>
          <X className="h-3 w-3" />
        </Button>
      </div>
      {tocItems.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucun titre détecté</p>
      ) : (
        <nav className="space-y-0.5">
          {tocItems.map((item, i) => (
            <button
              key={i}
              className="block w-full text-left text-xs py-1 px-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground truncate"
              style={{ paddingLeft: `${(item.level - 1) * 12 + 4}px` }}
              onClick={() => {
                // Scroll to approximate position in editor
                const lines = markdown.split('\n');
                let charPos = 0;
                for (let l = 0; l < lines.length; l++) {
                  if (lines[l].match(new RegExp(`^#{${item.level}} ${item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))) {
                    editorRef.current?.focus();
                    editorRef.current!.selectionStart = editorRef.current!.selectionEnd = charPos;
                    // Scroll textarea to position
                    const lineHeight = 20;
                    editorRef.current!.scrollTop = l * lineHeight - 100;
                    break;
                  }
                  charPos += lines[l].length + 1;
                }
              }}
            >
              {item.text}
            </button>
          ))}
        </nav>
      )}
    </div>
  );

  // --- Editor textarea component ---
  const EditorTextarea = ({ className = "", minH = "min-h-[600px]" }: { className?: string; minH?: string }) => (
    <Textarea
      ref={editorRef}
      value={markdown}
      onChange={(e) => setMarkdown(e.target.value)}
      onScroll={handleEditorScroll}
      className={`${minH} font-mono text-sm resize-none ${className}`}
      placeholder="# Écrivez votre Markdown ici..."
    />
  );

  // --- Preview component ---
  const PreviewContent = ({ className = "", minH = "min-h-[600px]" }: { className?: string; minH?: string }) => (
    <div
      ref={previewScrollRef}
      className={`${minH} overflow-auto ${className}`}
      onScroll={handlePreviewScroll}
    >
      <div
        ref={previewRef}
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: convertToHTML(markdown) }}
      />
    </div>
  );

  // Focus mode
  if (focusMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Button onClick={toggleFocusMode} variant="ghost" size="sm">
              <Minimize2 className="h-4 w-4 mr-2" />
              Quitter le mode focus
            </Button>
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              ~{readingTime} min de lecture
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{wordCount} mots</span>
            <span>·</span>
            <span>{charCount} caractères</span>
          </div>
        </div>
        <div className="p-2">
          <FormatToolbar />
        </div>
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full p-4 overflow-auto">
                <Textarea
                  ref={editorRef}
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  onScroll={handleEditorScroll}
                  className="w-full h-full min-h-[calc(100vh-200px)] font-mono text-base resize-none border-0 focus-visible:ring-0 bg-transparent"
                  placeholder="Écrivez en Markdown..."
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div
                ref={previewScrollRef}
                className="h-full p-4 overflow-auto bg-muted/20"
                onScroll={handlePreviewScroll}
              >
                <div
                  ref={previewRef}
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: convertToHTML(markdown) }}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    );
  }

  return (
    <ToolPageLayout title="Éditeur Markdown Pro" description="Éditeur avec split-view redimensionnable, raccourcis clavier, Mermaid.js et export PDF paginé">

      {/* Main Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Tooltip content="Copier le Markdown">
          <Button onClick={copyToClipboard} variant="outline" size="sm"><Copy className="h-4 w-4 mr-2" />Copier</Button>
        </Tooltip>
        <Tooltip content="Télécharger .md">
          <Button onClick={downloadAsMarkdown} variant="outline" size="sm"><FileDown className="h-4 w-4 mr-2" />.md</Button>
        </Tooltip>
        <Tooltip content="Télécharger HTML">
          <Button onClick={downloadAsHTML} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />HTML</Button>
        </Tooltip>
        <Tooltip content="Exporter PDF (A4 paginé)">
          <Button onClick={downloadAsPDF} variant="outline" size="sm" disabled={isExporting}><FileText className="h-4 w-4 mr-2" />PDF</Button>
        </Tooltip>
        <Tooltip content="Mode Focus (Ctrl+Shift+F)">
          <Button onClick={toggleFocusMode} variant="outline" size="sm"><Maximize2 className="h-4 w-4 mr-2" />Focus</Button>
        </Tooltip>
        <Tooltip content="Table des matières">
          <Button onClick={() => setShowToc(t => !t)} variant={showToc ? "default" : "outline"} size="sm">
            <ListTree className="h-4 w-4 mr-2" />TOC
          </Button>
        </Tooltip>

        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><BookOpen className="h-4 w-4 mr-2" />Templates</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Templates de documents</DialogTitle></DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="grid gap-4 p-1">
                {documentTemplates.map((template) => (
                  <Card key={template.name} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => loadDocumentTemplate(template)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <template.icon className="h-5 w-5 text-primary" />
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded max-h-24 overflow-hidden">{template.content.slice(0, 200)}...</pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Tooltip content="Réinitialiser">
          <Button onClick={resetEditor} variant="outline" size="sm"><RotateCcw className="h-4 w-4 mr-2" />Reset</Button>
        </Tooltip>

        <Tooltip content="Raccourcis clavier">
          <Button onClick={() => setShowShortcuts(s => !s)} variant="outline" size="sm"><HelpCircle className="h-4 w-4" /></Button>
        </Tooltip>

        <div className="ml-auto flex flex-wrap gap-2">
          {quickTemplates.map((template) => (
            <Tooltip key={template.name} content={`Insérer ${template.name}`}>
              <Button onClick={() => insertTemplate(template.content)} variant="outline" size="sm">
                <template.icon className="h-4 w-4 mr-2" />{template.name}
              </Button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Shortcuts panel */}
      {showShortcuts && (
        <Card className="mb-4">
          <CardContent className="py-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
              {shortcutsList.map((s) => (
                <div key={s.action} className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">{s.keys}</kbd>
                  <span className="text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formatting toolbar */}
      <div className="mb-3">
        <FormatToolbar />
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
        <span>{wordCount} mots</span>
        <span>{charCount} caractères</span>
        <span>{lineCount} lignes</span>
        <span>~{readingTime} min de lecture</span>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="split"><Eye className="h-4 w-4 mr-2" />Vue divisée</TabsTrigger>
          <TabsTrigger value="code"><Code className="h-4 w-4 mr-2" />Markdown</TabsTrigger>
          <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-2" />Aperçu</TabsTrigger>
        </TabsList>

        <TabsContent value="split" className="mt-4">
          <div className="flex">
            {showToc && <TocPanel />}
            <div className="flex-1 min-w-0">
              <ResizablePanelGroup direction="horizontal" className="rounded-lg border border-border">
                <ResizablePanel defaultSize={50} minSize={25}>
                  <div className="h-full flex flex-col">
                    <div className="px-4 py-2 border-b border-border bg-muted/30">
                      <span className="text-sm font-medium flex items-center gap-2"><Code className="h-4 w-4" />Éditeur</span>
                    </div>
                    <div className="flex-1 p-3">
                      <EditorTextarea />
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={25}>
                  <div className="h-full flex flex-col">
                    <div className="px-4 py-2 border-b border-border bg-muted/30">
                      <span className="text-sm font-medium flex items-center gap-2"><Eye className="h-4 w-4" />Aperçu</span>
                    </div>
                    <div className="flex-1 p-3">
                      <PreviewContent />
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <div className="flex">
            {showToc && <TocPanel />}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2"><Code className="h-5 w-5" />Éditeur Markdown</CardTitle>
              </CardHeader>
              <CardContent>
                <EditorTextarea />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="flex">
            {showToc && <TocPanel />}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2"><Eye className="h-5 w-5" />Aperçu du rendu</CardTitle>
              </CardHeader>
              <CardContent>
                <PreviewContent />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ToolPageLayout>
  );
}
