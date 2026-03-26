import { useState, useMemo } from "react";
import { 
  Star,
  FileText, 
  Code, 
  Database, 
  Palette, 
  Wrench, 
  BookOpen,
  Hash,
  Lock,
  Search,
  BarChart3,
  Type,
  Sparkles,
  ArrowLeftRight,
  QrCode,
  Binary,
  Link,
  Fingerprint,
  Shield,
  Server,
  Table2,
  Shuffle,
  FileJson2,
  Layers,
  Globe,
  Keyboard,
  Award,
  Activity,
  FileCode,
  Calendar,
  Clock,
  GitCompare,
  X
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { useLocation } from "react-router-dom";

const toolCategories = [
  {
    label: "Texte & Formats",
    items: [
      { title: "Markdown", url: "/markdown", icon: FileText },
      { title: "Comparateur", url: "/diff", icon: GitCompare },
      { title: "Analyseur", url: "/text-analyzer", icon: BarChart3 },
      { title: "Formatage", url: "/text-formatter", icon: Type },
      { title: "Extracteur", url: "/data-extractor", icon: Database },
      { title: "Lorem Ipsum", url: "/lorem", icon: FileText },
      { title: "Nettoyeur", url: "/text-cleaner", icon: Sparkles },
      { title: "Convertisseur", url: "/format-converter", icon: ArrowLeftRight },
      { title: "HTML ↔ Markdown", url: "/html-md", icon: FileCode },
      { title: "Text Case", url: "/text-case", icon: Type },
      { title: "Encodage", url: "/char-encoding", icon: FileText },
      { title: "Word Counter", url: "/word-counter", icon: BarChart3 },
      { title: "Table Generator", url: "/table-generator", icon: Table2 },
      { title: "Readme Generator", url: "/readme-generator", icon: FileText },
    ],
  },
  {
    label: "Code & Analyse",
    items: [
      { title: "Regex Pro", url: "/regex", icon: Code },
      { title: "JSON/YAML", url: "/json", icon: FileJson2 },
      { title: "SQL Formatter", url: "/sql", icon: Database },
      { title: "CSS Formatter", url: "/css-formatter", icon: Code },
      { title: "XML Formatter", url: "/xml", icon: Code },
      { title: "Escape/Unescape", url: "/escape", icon: Shield },
      { title: "Base64", url: "/base64", icon: Binary },
      { title: "JWT Decoder", url: "/jwt", icon: Lock },
      { title: "API Tester", url: "/api-tester", icon: Globe },
      { title: "Code Minifier", url: "/code-minifier", icon: Code },
      { title: "GraphQL Tester", url: "/graphql", icon: Layers },
      { title: "WebSocket Tester", url: "/websocket", icon: Globe },
      { title: "Cron Builder", url: "/cron", icon: Clock },
      { title: "AST Explorer", url: "/ast", icon: Layers },
      { title: "Package Analyzer", url: "/package-analyzer", icon: Layers },
      { title: "Prompt Engineer", url: "/prompt-engineer", icon: Sparkles },
      { title: "TOML Editor", url: "/toml-editor", icon: FileCode },
      { title: "Mermaid Editor", url: "/mermaid-editor", icon: Layers },
      { title: "Bundle Analyzer", url: "/bundle-analyzer", icon: Layers },
      { title: "HTTP Headers", url: "/http-headers", icon: Globe },
      { title: "Tailwind ↔ CSS", url: "/tailwind-css", icon: ArrowLeftRight },
      { title: "Dep Graph", url: "/dep-graph", icon: Layers },
      { title: "Docker Compose", url: "/docker-compose", icon: Server },
      { title: "Webhook Tester", url: "/webhook-tester", icon: Globe },
      { title: "NPM Compare", url: "/npm-compare", icon: Layers },
      { title: "Server Config", url: "/server-config", icon: Server },
      { title: "SQL ↔ Prisma", url: "/sql-prisma", icon: ArrowLeftRight },
      { title: "API Docs", url: "/api-docs", icon: FileJson2 },
      { title: "Code Formatter", url: "/code-formatter", icon: Code },
    ],
  },
  {
    label: "Design",
    items: [
      { title: "Couleurs", url: "/colors", icon: Palette },
      { title: "Gradients CSS", url: "/gradients", icon: Palette },
      { title: "Flexbox", url: "/flexbox", icon: Layers },
      { title: "CSS Grid", url: "/grid", icon: Layers },
      { title: "Contraste WCAG", url: "/contrast", icon: Palette },
      { title: "Box Shadow", url: "/box-shadow", icon: Layers },
      { title: "Border Radius", url: "/border-radius", icon: Palette },
      { title: "Text Shadow", url: "/text-shadow", icon: Type },
      { title: "Animations CSS", url: "/css-animations", icon: Sparkles },
      { title: "Icônes SVG", url: "/svg-icons", icon: Palette },
      { title: "Espacements", url: "/spacing", icon: Wrench },
      { title: "Font Pairing", url: "/font-pairing", icon: Type },
      { title: "Responsive Preview", url: "/responsive-preview", icon: Layers },
      { title: "CSS Specificity", url: "/css-specificity", icon: Palette },
      { title: "A11y Checklist", url: "/a11y-checklist", icon: Layers },
      { title: "Glassmorphism", url: "/glassmorphism", icon: Layers },
      { title: "Clip-path Editor", url: "/clip-path", icon: Layers },
      { title: "Color Palette", url: "/color-palette", icon: Palette },
      { title: "CSS Filter", url: "/css-filter", icon: Palette },
      { title: "Type Scale", url: "/type-scale", icon: Type },
      { title: "CSS Variables", url: "/css-variables", icon: Palette },
      { title: "Tailwind Playground", url: "/tailwind-playground", icon: Palette },
    ],
  },
  {
    label: "Utilitaires",
    items: [
      { title: "Mot de passe", url: "/password", icon: Lock },
      { title: "Hash", url: "/hash", icon: Fingerprint },
      { title: "Unités & Mesures", url: "/converters", icon: ArrowLeftRight },
      { title: "UUID Generator", url: "/uuid", icon: Fingerprint },
      { title: "QR Code", url: "/qrcode", icon: QrCode },
      { title: "Meta Tags", url: "/meta-tags", icon: Globe },
      { title: "Slug Generator", url: "/slug", icon: Link },
      { title: "TOTP / 2FA", url: "/totp-generator", icon: Shield },
      { title: "Permissions Unix", url: "/unix-permissions", icon: Shield },
      { title: "Bases numériques", url: "/number-base", icon: Binary },
      { title: "URL Parser", url: "/url-parser", icon: Link },
      { title: "Env Manager", url: "/env-parser", icon: FileText },
      { title: "Timestamp", url: "/timestamp", icon: Clock },
      { title: "IP Analyzer", url: "/ip-analyzer", icon: Globe },
      { title: "Barcode", url: "/barcode", icon: QrCode },
      { title: "Git Commit", url: "/git-commit", icon: FileCode },
      { title: "Changelog", url: "/changelog", icon: FileText },
      { title: ".gitignore Builder", url: "/gitignore", icon: FileText },
      { title: "Favicon", url: "/favicon", icon: Palette },
      { title: "Caractères Spéciaux", url: "/special-chars", icon: Type },
      { title: "Robots.txt", url: "/robots-builder", icon: FileText },
    ],
  },
  {
    label: "Dates & Temps",
    items: [
      { title: "Calculateur de dates", url: "/date-calculator", icon: Calendar },
      { title: "Formats de date", url: "/date-formats", icon: Clock },
      { title: "Timezone", url: "/timezone", icon: Globe },
      { title: "Inspecteur de dates", url: "/date-inspector", icon: Search },
      { title: "Flux temporels", url: "/timelines", icon: Activity },
      { title: "Calendriers", url: "/calendars", icon: Calendar },
      { title: "Date Reference", url: "/date-reference", icon: BookOpen },
      { title: "Date Toolbox", url: "/date-toolbox", icon: Wrench },
      { title: "Countdown", url: "/countdown", icon: Clock },
    ],
  },
  {
    label: "Data & Backend",
    items: [
      { title: "Générateur de données", url: "/data-generator", icon: Shuffle },
      { title: "CSV Viewer", url: "/csv", icon: Table2 },
      { title: "Schémas", url: "/schema-generator", icon: Layers },
      { title: "Faker Playground", url: "/faker-playground", icon: Sparkles },
      { title: "SQL Builder", url: "/sql-builder", icon: Table2 },
      { title: "API Mocker Pro", url: "/mock-api", icon: Server },
      { title: "DB Designer", url: "/db-designer", icon: Database },
      { title: "OpenAPI Designer", url: "/openapi-designer", icon: Layers },
      { title: "JSONPath Explorer", url: "/jsonpath", icon: Search },
      { title: "Anonymizer", url: "/anonymize", icon: Shield },
      { title: "Test Matcher", url: "/test-matcher", icon: Shuffle },
      { title: "GraphQL Builder", url: "/graphql-builder", icon: Layers },
      { title: "Seed Data", url: "/seed-data", icon: Database },
      { title: "Prisma Builder", url: "/prisma-builder", icon: Database },
      { title: "SQL Playground", url: "/sql-playground", icon: Database },
    ],
  },
  {
    label: "Mémo",
    items: [
      { title: "Cheatsheets", url: "/cheatsheets", icon: BookOpen },
      { title: "HTTP Status", url: "/http-status", icon: Server },
      { title: "Glossaire", url: "/glossary", icon: Search },
      { title: "Notes", url: "/notes", icon: FileText },
      { title: "Snippets", url: "/snippets", icon: FileCode },
      { title: "Raccourcis", url: "/shortcuts", icon: Keyboard },
      { title: "Quick Ref", url: "/quick-reference", icon: Layers },
      { title: "ASCII/Unicode", url: "/ascii", icon: Binary },
      { title: "Design Tokens", url: "/design-tokens", icon: Palette },
      { title: "Best Practices", url: "/best-practices", icon: Award },
      { title: "Algorithmes", url: "/algorithms", icon: Activity },
      { title: "Interview", url: "/interview", icon: BookOpen },
      { title: "Erreurs", url: "/errors", icon: Activity },
      { title: "Regex Cheatsheet", url: "/regex-cheatsheet", icon: Code },
      { title: "CSS Selectors", url: "/css-selectors", icon: Palette },
      { title: "Git Cheatsheet", url: "/git-cheatsheet", icon: BookOpen },
      { title: "Architecture", url: "/architecture", icon: Layers },
      { title: "Sécurité", url: "/security-cheatsheet", icon: Shield },
      { title: "Linux Commands", url: "/linux-commands", icon: Activity },
    ],
  },
];

// Flatten all tools for lookup
const allTools = toolCategories.flatMap(c => c.items);

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { favorites, toggleFavorite, isFavorite, addRecent } = useFavoritesContext();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return toolCategories;
    const q = searchQuery.toLowerCase();
    return toolCategories
      .map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.title.toLowerCase().includes(q)),
      }))
      .filter(cat => cat.items.length > 0);
  }, [searchQuery]);

  const favoriteTools = allTools.filter(t => favorites.includes(t.url));

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      {!isCollapsed && (
        <SidebarHeader className="pt-16 px-3 pb-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un outil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-8 text-xs bg-sidebar-accent/50 border-sidebar-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </SidebarHeader>
      )}
      <SidebarContent className={isCollapsed ? "pt-16" : "pt-2"}>
        {/* Favorites section */}
        {favoriteTools.length > 0 && (
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-yellow-500 flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500" /> Favoris
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {favoriteTools.map((item) => (
                  <SidebarMenuItem key={`fav-${item.url}`}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        onClick={() => addRecent(item.url)}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item.url); }}
                              className="opacity-80 hover:opacity-100"
                            >
                              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                            </button>
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredCategories.map((category) => (
          <SidebarGroup key={category.label}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {category.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {category.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth hover:bg-sidebar-accent group/item"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        onClick={() => addRecent(item.url)}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item.url); }}
                              className="opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                              <Star className={`h-3.5 w-3.5 ${isFavorite(item.url) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`} />
                            </button>
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
