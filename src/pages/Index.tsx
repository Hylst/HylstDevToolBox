import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import {
  FileText,
  Code,
  Palette,
  Lock,
  Hash,
  BookOpen,
  Zap,
  Shield,
  Sparkles,
  Search,
  BarChart3,
  Type,
  ArrowLeftRight,
  Database,
  Wrench,
  QrCode,
  Binary,
  Link,
  Fingerprint,
  Server,
  Table2,
  Shuffle,
  Globe,
  FileJson2,
  Layers,
  Calendar,
  Clock,
  LayoutGrid,
  Columns,
  Contrast,
  FileCode,
  Quote,
  Tags,
  LinkIcon,
  GlobeLock,
  FileSpreadsheet,
  AlertCircle,
  Star,
  Terminal,
  Paintbrush,
} from "lucide-react";

interface Tool {
  title: string;
  description: string;
  url: string;
  icon: React.ElementType;
}

interface Category {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tools: Tool[];
}

const categories: Category[] = [
  {
    label: "Texte & Formats",
    description: "Édition, analyse et conversion de texte",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    tools: [
      { title: "Markdown", description: "Éditeur avec preview temps réel", url: "/markdown", icon: FileText },
      { title: "Comparateur", description: "Diff entre deux textes", url: "/diff", icon: FileText },
      { title: "Analyseur", description: "Stats et métriques de texte", url: "/text-analyzer", icon: BarChart3 },
      { title: "Formatage", description: "Transformation de texte", url: "/text-formatter", icon: Type },
      { title: "Extracteur", description: "Extraction de données", url: "/data-extractor", icon: Database },
      { title: "Lorem Ipsum", description: "Génération de texte", url: "/lorem", icon: FileText },
      { title: "Nettoyeur", description: "Nettoyage de texte", url: "/text-cleaner", icon: Sparkles },
      { title: "Convertisseur", description: "JSON, YAML, XML...", url: "/format-converter", icon: ArrowLeftRight },
      { title: "HTML ↔ Markdown", description: "Conversion bidirectionnelle", url: "/html-md", icon: FileCode },
      { title: "Text Case", description: "Majuscules, camelCase...", url: "/text-case", icon: Type },
      { title: "Encodage", description: "UTF-8, mojibake, entités HTML", url: "/char-encoding", icon: FileText },
      { title: "Word Counter Pro", description: "Compteur, lisibilité, densité", url: "/word-counter", icon: BarChart3 },
      { title: "Table Generator", description: "Tableaux MD/HTML/CSV/LaTeX", url: "/table-generator", icon: Table2 },
      { title: "Readme Generator", description: "README.md professionnel", url: "/readme-generator", icon: FileText },
    ],
  },
  {
    label: "Code & Analyse",
    description: "Outils pour le développement",
    icon: Code,
    color: "from-purple-500 to-pink-500",
    tools: [
      { title: "Regex Pro", description: "Test, debug et génération de regex", url: "/regex", icon: Code },
      { title: "JSON/YAML", description: "Validation et formatage", url: "/json", icon: Code },
      { title: "SQL Formatter", description: "Formatage de requêtes SQL", url: "/sql", icon: Database },
      { title: "XML Formatter", description: "Formatage XML", url: "/xml", icon: Code },
      { title: "CSS Formatter", description: "Formatage et minification CSS", url: "/css-formatter", icon: FileCode },
      { title: "Escape/Unescape", description: "Encodage multi-formats", url: "/escape", icon: Quote },
      { title: "Base64", description: "Encodage/décodage", url: "/base64", icon: Code },
      { title: "JWT Decoder", description: "Décodage de tokens JWT", url: "/jwt", icon: Code },
      { title: "API Tester", description: "Test d'APIs REST", url: "/api-tester", icon: Server },
      { title: "Code Minifier", description: "Minification de code", url: "/code-minifier", icon: Code },
      { title: "GraphQL Tester", description: "Test de requêtes GraphQL", url: "/graphql", icon: Code },
      { title: "WebSocket", description: "Test de WebSockets", url: "/websocket", icon: Globe },
      { title: "Cron Builder", description: "Générateur d'expressions cron", url: "/cron", icon: Clock },
      { title: "AST Explorer", description: "Arbre syntaxique abstrait", url: "/ast", icon: Layers },
      { title: "Package Analyzer", description: "Analyse de packages npm", url: "/package-analyzer", icon: Layers },
      { title: "Prompt Engineer", description: "Conception de prompts LLM", url: "/prompt-engineer", icon: Sparkles },
      { title: "TOML Editor", description: "Éditeur TOML/INI", url: "/toml-editor", icon: FileCode },
      { title: "Mermaid Editor", description: "Éditeur de diagrammes Mermaid", url: "/mermaid-editor", icon: Layers },
      { title: "Bundle Analyzer", description: "Analyse de taille de bundle", url: "/bundle-analyzer", icon: BarChart3 },
      { title: "HTTP Headers", description: "Analyseur de headers HTTP", url: "/http-headers", icon: Globe },
      { title: "Tailwind ↔ CSS", description: "Convertisseur Tailwind/CSS", url: "/tailwind-css", icon: ArrowLeftRight },
      { title: "Dep Graph", description: "Graphe de dépendances", url: "/dep-graph", icon: Layers },
      { title: "Docker Compose", description: "Constructeur docker-compose.yml", url: "/docker-compose", icon: Server },
      { title: "Webhook Tester", description: "Simulation de webhooks", url: "/webhook-tester", icon: Globe },
      { title: "NPM Compare", description: "Comparaison de packages npm", url: "/npm-compare", icon: Layers },
      { title: "Server Config", description: "Générateur Nginx/Apache", url: "/server-config", icon: Server },
      { title: "SQL ↔ Prisma", description: "Conversion SQL/Prisma", url: "/sql-prisma", icon: ArrowLeftRight },
      { title: "API Docs", description: "Documentation OpenAPI", url: "/api-docs", icon: Layers },
      { title: "Code Formatter", description: "Formatage multi-langage", url: "/code-formatter", icon: Code },
    ],
  },
  {
    label: "Design",
    description: "CSS, couleurs et styles visuels",
    icon: Palette,
    color: "from-orange-500 to-red-500",
    tools: [
      { title: "Couleurs", description: "Sélecteur et palettes", url: "/colors", icon: Palette },
      { title: "Gradients CSS", description: "Générateur de dégradés", url: "/gradients", icon: Palette },
      { title: "Box Shadow", description: "Générateur d'ombres", url: "/box-shadow", icon: Palette },
      { title: "Border Radius", description: "Coins arrondis CSS", url: "/border-radius", icon: Palette },
      { title: "Text Shadow", description: "Ombres de texte", url: "/text-shadow", icon: Type },
      { title: "Animations CSS", description: "Générateur d'animations", url: "/css-animations", icon: Sparkles },
      { title: "Flexbox", description: "Playground Flexbox", url: "/flexbox", icon: Columns },
      { title: "CSS Grid", description: "Générateur de grilles", url: "/grid", icon: LayoutGrid },
      { title: "Contrast Checker", description: "Vérificateur WCAG", url: "/contrast", icon: Contrast },
      { title: "Icônes SVG", description: "Bibliothèque d'icônes", url: "/svg-icons", icon: Palette },
      { title: "Espacements", description: "Calculateur de spacing", url: "/spacing", icon: Wrench },
      { title: "Font Pairing", description: "Combinaisons de polices", url: "/font-pairing", icon: Type },
      { title: "Responsive Preview", description: "Prévisualisation responsive", url: "/responsive-preview", icon: LayoutGrid },
      { title: "CSS Specificity", description: "Calculateur de spécificité", url: "/css-specificity", icon: Layers },
      { title: "A11y Checklist", description: "Audit accessibilité WCAG", url: "/a11y-checklist", icon: Shield },
      { title: "Glassmorphism", description: "Générateur d'effets verre", url: "/glassmorphism", icon: Layers },
      { title: "Clip-path Editor", description: "Éditeur de formes CSS", url: "/clip-path", icon: Layers },
      { title: "Color Palette", description: "Palettes harmoniques", url: "/color-palette", icon: Palette },
      { title: "CSS Filter", description: "Éditeur de filtres CSS", url: "/css-filter", icon: Palette },
      { title: "Type Scale", description: "Échelle typographique", url: "/type-scale", icon: Type },
      { title: "CSS Variables", description: "Générateur de thème CSS", url: "/css-variables", icon: Palette },
      { title: "Tailwind Playground", description: "Sandbox Tailwind interactive", url: "/tailwind-playground", icon: Paintbrush },
    ],
  },
  {
    label: "Utilitaires",
    description: "Générateurs et convertisseurs",
    icon: Wrench,
    color: "from-green-500 to-emerald-500",
    tools: [
      { title: "Mot de passe", description: "Générateur sécurisé", url: "/password", icon: Lock },
      { title: "Hash", description: "MD5, SHA-256, SHA-512...", url: "/hash", icon: Hash },
      { title: "Unités & Mesures", description: "Convertisseurs d'unités", url: "/converters", icon: ArrowLeftRight },
      { title: "UUID Generator", description: "Génération d'identifiants", url: "/uuid", icon: Fingerprint },
      { title: "QR Code", description: "Générateur de QR codes", url: "/qrcode", icon: QrCode },
      { title: "Meta Tags", description: "Générateur SEO", url: "/meta-tags", icon: Tags },
      { title: "Slug Generator", description: "URLs propres", url: "/slug", icon: LinkIcon },
      { title: "Permissions Unix", description: "Calculateur chmod", url: "/unix-permissions", icon: Shield },
      { title: "Bases numériques", description: "Binaire, hex, décimal...", url: "/number-base", icon: Binary },
      { title: "URL Parser", description: "Analyse d'URLs", url: "/url-parser", icon: Link },
      { title: "Env Manager", description: "Parser, comparer et convertir .env", url: "/env-parser", icon: FileText },
      { title: "Timestamp", description: "Convertisseur de timestamps", url: "/timestamp", icon: Clock },
      { title: "IP Analyzer", description: "Analyse d'adresses IP", url: "/ip-analyzer", icon: Globe },
      { title: "Barcode", description: "Générateur de codes-barres", url: "/barcode", icon: QrCode },
      { title: "Git Commit", description: "Générateur de commits", url: "/git-commit", icon: FileCode },
      { title: "Changelog", description: "Générateur de changelog", url: "/changelog", icon: FileText },
      { title: ".gitignore Builder", description: "Générateur de .gitignore", url: "/gitignore", icon: FileText },
      { title: "Favicon", description: "Générateur de favicons", url: "/favicon", icon: Palette },
      { title: "Caractères Spéciaux", description: "Émojis, symboles, flèches", url: "/special-chars", icon: Type },
      { title: "Robots.txt", description: "Constructeur de robots.txt", url: "/robots-builder", icon: FileText },
      { title: "TOTP / 2FA", description: "Générateur de codes TOTP", url: "/totp-generator", icon: Shield },
    ],
  },
  {
    label: "Dates & Temps",
    description: "Manipulation et analyse de dates",
    icon: Calendar,
    color: "from-indigo-500 to-blue-500",
    tools: [
      { title: "Calculateur", description: "Calculs entre dates", url: "/date-calculator", icon: Calendar },
      { title: "Formats", description: "Conversion de formats", url: "/date-formats", icon: Code },
      { title: "Inspecteur", description: "Analyse de dates", url: "/date-inspector", icon: Search },
      { title: "Fuseaux horaires", description: "Conversion timezone", url: "/timezone", icon: GlobeLock },
      { title: "Flux temporels", description: "Timelines et intervalles", url: "/timelines", icon: BarChart3 },
      { title: "Calendriers", description: "Jours fériés et semaines", url: "/calendars", icon: Calendar },
      { title: "Date Reference", description: "Sandbox, problèmes et docs", url: "/date-reference", icon: BookOpen },
      { title: "Date Toolbox", description: "API services et validation", url: "/date-toolbox", icon: Wrench },
      { title: "Countdown", description: "Minuteur et compte à rebours", url: "/countdown", icon: Clock },
    ],
  },
  {
    label: "Data & Backend",
    description: "Génération et manipulation de données",
    icon: Database,
    color: "from-teal-500 to-cyan-500",
    tools: [
      { title: "Générateur", description: "Données de test", url: "/data-generator", icon: Shuffle },
      { title: "CSV Viewer", description: "Visualisation CSV", url: "/csv", icon: FileSpreadsheet },
      { title: "Schémas", description: "Générateur de schémas", url: "/schema-generator", icon: Layers },
      { title: "Faker", description: "Données réalistes", url: "/faker-playground", icon: Sparkles },
      { title: "SQL Builder", description: "Constructeur de requêtes", url: "/sql-builder", icon: Table2 },
      { title: "API Mocker Pro", description: "Endpoints mock & réponses réalistes", url: "/mock-api", icon: Server },
      { title: "DB Designer", description: "Schémas de base", url: "/db-designer", icon: Database },
      { title: "OpenAPI Designer", description: "Conception d'APIs OpenAPI", url: "/openapi-designer", icon: Layers },
      { title: "JSONPath Explorer", description: "Navigation JSONPath", url: "/jsonpath", icon: Search },
      { title: "Anonymizer", description: "Anonymisation de données", url: "/anonymize", icon: Shield },
      { title: "Test Matcher", description: "Comparaison de données test", url: "/test-matcher", icon: Shuffle },
      { title: "GraphQL Builder", description: "Constructeur de schéma GraphQL", url: "/graphql-builder", icon: Layers },
      { title: "Seed Data", description: "Générateur de données seed", url: "/seed-data", icon: Database },
      { title: "Prisma Builder", description: "Constructeur de schema.prisma", url: "/prisma-builder", icon: Database },
      { title: "SQL Playground", description: "SQL in-browser avec données sample", url: "/sql-playground", icon: Database },
    ],
  },
  {
    label: "Mémo",
    description: "Références et documentation",
    icon: BookOpen,
    color: "from-yellow-500 to-orange-500",
    tools: [
      { title: "Cheatsheets", description: "Mémos de syntaxe", url: "/cheatsheets", icon: BookOpen },
      { title: "HTTP Status", description: "Codes de statut HTTP", url: "/http-status", icon: AlertCircle },
      { title: "Glossaire", description: "Termes de développement", url: "/glossary", icon: Search },
      { title: "Notes", description: "Notes personnelles", url: "/notes", icon: FileText },
      { title: "Snippets", description: "Bibliothèque de code", url: "/snippets", icon: Code },
      { title: "Raccourcis", description: "Shortcuts clavier", url: "/shortcuts", icon: Hash },
      { title: "Quick Ref", description: "HTTP, ports, MIME...", url: "/quick-reference", icon: Layers },
      { title: "ASCII/Unicode", description: "Tables de caractères", url: "/ascii", icon: Binary },
      { title: "Design Tokens", description: "Tailwind, Bootstrap...", url: "/design-tokens", icon: Palette },
      { title: "Best Practices", description: "Clean Code, SOLID...", url: "/best-practices", icon: BookOpen },
      { title: "Algorithmes", description: "Visualisation d'algos", url: "/algorithms", icon: BarChart3 },
      { title: "Interview", description: "Questions d'entretien", url: "/interview", icon: BookOpen },
      { title: "Erreurs", description: "Référence des erreurs", url: "/errors", icon: AlertCircle },
      { title: "Regex Cheatsheet", description: "Référence interactive regex", url: "/regex-cheatsheet", icon: Code },
      { title: "CSS Selectors", description: "Guide des sélecteurs CSS", url: "/css-selectors", icon: Palette },
      { title: "Git Cheatsheet", description: "Commandes et workflows Git", url: "/git-cheatsheet", icon: BookOpen },
      { title: "Architecture", description: "Patterns d'architecture logicielle", url: "/architecture", icon: Layers },
      { title: "Sécurité", description: "OWASP Top 10 & checklist sécurité", url: "/security-cheatsheet", icon: Shield },
      { title: "Linux Commands", description: "Référence interactive Linux/Unix", url: "/linux-commands", icon: Terminal },
    ],
  },
];

const features = [
  {
    icon: Zap,
    title: "100% Local",
    description: "Fonctionne entièrement offline, aucune donnée envoyée",
  },
  {
    icon: Shield,
    title: "Pédagogique",
    description: "Infobulles sur tous les termes techniques",
  },
  {
    icon: Sparkles,
    title: `${categories.flatMap(c => c.tools).length}+ Outils`,
    description: "Tous vos outils de dev au même endroit",
  },
];

export default function Index() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { favorites, toggleFavorite, isFavorite, addRecent } = useFavoritesContext();

  const toggleFilter = (label: string) => {
    setActiveFilters(prev =>
      prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]
    );
  };

  const filteredCategories = activeFilters.length > 0
    ? categories.filter(c => activeFilters.includes(c.label))
    : categories;

  const allTools = categories.flatMap((cat) =>
    cat.tools.map((tool) => ({ ...tool, category: cat.label }))
  );

  const filteredTools = searchQuery
    ? allTools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const totalTools = allTools.length;
  const favoriteTools = allTools.filter(t => favorites.includes(t.url));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero border-b border-border">
        <div className="container mx-auto px-6 py-16 md:py-24 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Votre boîte à outils
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                de développeur
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Plus de {totalTools} outils de productivité, d'analyse et de génération.
              <br />
              100% local, pédagogique et open-source.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto pt-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground mt-2" />
              <Input
                placeholder="Rechercher un outil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg shadow-md"
              />
              {searchQuery && filteredTools.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
                  {filteredTools.map((tool) => (
                    <div
                      key={tool.url}
                      className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-smooth"
                      onClick={() => {
                        navigate(tool.url);
                        setSearchQuery("");
                      }}
                    >
                      <tool.icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{tool.title}</p>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <Card key={feature.title} className="glass">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4 shadow-glow">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Favorites Section */}
      {favoriteTools.length > 0 && (
        <section className="container mx-auto px-6 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            <h2 className="text-2xl font-bold">Vos favoris</h2>
            <Badge variant="secondary">{favoriteTools.length}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {favoriteTools.map((tool) => (
              <div
                key={`fav-${tool.url}`}
                onClick={() => { addRecent(tool.url); navigate(tool.url); }}
                className="group relative flex items-center gap-3 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 hover:border-primary hover:bg-muted/50 cursor-pointer transition-smooth"
              >
                <tool.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{tool.title}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(tool.url); }}
                  className="opacity-60 hover:opacity-100"
                >
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="container mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Tous les outils par catégorie</h2>
          <p className="text-muted-foreground mb-6">
            {categories.length} catégories • {totalTools} outils
          </p>
          {/* Category Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const isActive = activeFilters.includes(cat.label);
              return (
                <Button
                  key={cat.label}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5 rounded-full"
                  onClick={() => toggleFilter(cat.label)}
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {cat.tools.length}
                  </Badge>
                </Button>
              );
            })}
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-muted-foreground"
                onClick={() => setActiveFilters([])}
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategory === category.label || activeFilters.length > 0;
            const displayedTools = isExpanded ? category.tools : category.tools.slice(0, 4);

            return (
              <Card key={category.label} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-12 w-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center shadow-md`}
                      >
                        <category.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{category.label}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {category.tools.length} outils
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {displayedTools.map((tool) => (
                      <div
                        key={tool.url}
                        onClick={() => { addRecent(tool.url); navigate(tool.url); }}
                        className="group/tool relative flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:border-primary hover:bg-primary/5 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:-translate-y-0.5 cursor-pointer transition-all duration-300 overflow-hidden"
                      >
                        {/* Effet Cyber Glitch au survol */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover/tool:animate-[shimmer_1s_infinite] pointer-events-none" />
                        
                        <tool.icon className="h-5 w-5 text-muted-foreground group-hover/tool:text-primary group-hover/tool:drop-shadow-[0_0_5px_rgba(168,85,247,0.8)] transition-all flex-shrink-0 z-10" />
                        <div className="min-w-0 flex-1 z-10">
                          <p className="font-medium text-sm truncate group-hover/tool:text-primary transition-colors">
                            {tool.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate group-hover/tool:text-foreground/80 transition-colors">
                            {tool.description}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(tool.url); }}
                          className="opacity-0 group-hover/tool:opacity-100 transition-opacity flex-shrink-0 z-10"
                        >
                          <Star className={`h-3.5 w-3.5 ${isFavorite(tool.url) ? "fill-yellow-500 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" : "text-muted-foreground hover:text-yellow-500"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {category.tools.length > 4 && activeFilters.length === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() =>
                        setExpandedCategory(isExpanded ? null : category.label)
                      }
                    >
                      {isExpanded
                        ? "Voir moins"
                        : `Voir ${category.tools.length - 4} outils de plus`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à booster votre productivité ?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tous vos outils de développement réunis dans une interface moderne et intuitive.
            Aucune installation requise, tout fonctionne dans votre navigateur.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/markdown")} className="shadow-glow">
              Commencer maintenant
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/cheatsheets")}>
              Voir les mémos
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
