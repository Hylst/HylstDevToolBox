import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, Search, Download, Code, Palette, Package, Layers, Check, Plus, 
  RefreshCw, Sparkles, Eye, Grid3X3, LayoutList
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Use the official icons object from lucide-react which contains all valid icons
const iconEntries = Object.entries(icons) as [string, LucideIcon][];
const iconNames = iconEntries.map(([name]) => name);
const iconMap = new Map(iconEntries);

const categories: Record<string, string[]> = {
  "Navigation": ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ChevronUp", "ChevronDown", "ChevronLeft", "ChevronRight", "Menu", "X", "Home", "ExternalLink", "ArrowUpRight", "ArrowDownLeft", "MoveUp", "MoveDown", "CornerUpLeft", "CornerDownRight"],
  "Actions": ["Plus", "Minus", "Check", "X", "Edit", "Edit2", "Edit3", "Trash2", "Copy", "Download", "Upload", "Save", "Send", "Share", "Share2", "Redo", "Undo", "RotateCcw", "RotateCw", "Maximize", "Minimize"],
  "Media": ["Play", "Pause", "Square", "SkipBack", "SkipForward", "Volume2", "VolumeX", "Volume1", "Mic", "MicOff", "Camera", "CameraOff", "Video", "VideoOff", "Image", "Music", "Radio", "Tv", "Film", "PlayCircle"],
  "Communication": ["Mail", "MessageCircle", "MessageSquare", "Phone", "PhoneCall", "PhoneOff", "Bell", "BellRing", "BellOff", "AtSign", "Send", "Inbox", "Forward", "Reply", "ReplyAll", "Voicemail"],
  "Fichiers": ["File", "FileText", "FilePlus", "FileMinus", "FileCode", "FileImage", "Folder", "FolderOpen", "FolderPlus", "Archive", "Paperclip", "FileJson", "FileSpreadsheet", "Files", "FolderTree"],
  "Interface": ["Settings", "Settings2", "Search", "Filter", "MoreHorizontal", "MoreVertical", "Grid", "Grid2X2", "Grid3X3", "List", "Layout", "LayoutGrid", "Sidebar", "PanelLeft", "PanelRight", "Columns", "Rows", "SlidersHorizontal", "SlidersVertical"],
  "Utilisateurs": ["User", "UserPlus", "UserMinus", "UserCheck", "UserX", "Users", "UserCog", "CircleUser", "Contact", "BadgeCheck", "Shield", "ShieldCheck", "ShieldAlert", "Lock", "Unlock", "Key", "LogIn", "LogOut"],
  "Données": ["Database", "Server", "HardDrive", "Cloud", "CloudUpload", "CloudDownload", "CloudOff", "Wifi", "WifiOff", "Globe", "Link", "Link2", "Unlink", "ExternalLink", "QrCode", "Barcode"],
  "Commerce": ["ShoppingCart", "ShoppingBag", "CreditCard", "Wallet", "DollarSign", "Euro", "Banknote", "Receipt", "Tag", "Tags", "Percent", "Gift", "Store", "Package", "Truck", "Building2"],
  "Charts": ["BarChart", "BarChart2", "BarChart3", "LineChart", "PieChart", "TrendingUp", "TrendingDown", "Activity", "Gauge", "Target", "Crosshair", "Milestone"],
  "Temps": ["Clock", "Clock1", "Clock2", "Clock3", "Clock4", "Timer", "TimerOff", "Hourglass", "Calendar", "CalendarDays", "CalendarClock", "CalendarCheck", "AlarmClock", "Sunrise", "Sunset", "Moon", "Sun"],
  "Alertes": ["AlertCircle", "AlertTriangle", "AlertOctagon", "Info", "HelpCircle", "CircleHelp", "MessageCircleWarning", "ShieldAlert", "Siren", "Bell", "BellRing"],
  "Code": ["Code", "Code2", "Braces", "Brackets", "Terminal", "Hash", "Binary", "Bug", "Cpu", "Cog", "GitBranch", "GitCommit", "GitMerge", "GitPullRequest", "Github", "Gitlab"],
  "Social": ["Github", "Twitter", "Linkedin", "Facebook", "Instagram", "Youtube", "Twitch", "Dribbble", "Figma", "Slack", "Chrome", "Apple"],
};

// Presets for common use cases
const iconPresets = [
  {
    name: "Navigation App",
    description: "Menu, navigation et contrôles essentiels",
    icons: ["Home", "Search", "Menu", "X", "ChevronLeft", "ChevronRight", "ArrowUp", "ArrowDown", "Settings", "User", "Bell", "MoreVertical"],
    color: "#3b82f6"
  },
  {
    name: "E-commerce",
    description: "Boutique, panier et paiements",
    icons: ["ShoppingCart", "CreditCard", "Package", "Truck", "Heart", "Star", "Tag", "Percent", "Gift", "Store", "Receipt", "Wallet"],
    color: "#22c55e"
  },
  {
    name: "Dashboard",
    description: "Analytics, stats et graphiques",
    icons: ["BarChart3", "LineChart", "PieChart", "TrendingUp", "TrendingDown", "Activity", "Users", "DollarSign", "Calendar", "Clock", "Target", "Gauge"],
    color: "#8b5cf6"
  },
  {
    name: "Social Media",
    description: "Réseaux sociaux et partage",
    icons: ["Heart", "MessageCircle", "Share2", "Bookmark", "ThumbsUp", "ThumbsDown", "UserPlus", "Users", "Globe", "Link", "Camera", "Image"],
    color: "#ec4899"
  },
  {
    name: "Media Player",
    description: "Lecture audio et vidéo",
    icons: ["Play", "Pause", "Square", "SkipBack", "SkipForward", "Rewind", "FastForward", "Volume2", "VolumeX", "Repeat", "Shuffle", "List"],
    color: "#f59e0b"
  },
  {
    name: "Éditeur de texte",
    description: "Formatage et édition",
    icons: ["Bold", "Italic", "Underline", "Strikethrough", "AlignLeft", "AlignCenter", "AlignRight", "List", "ListOrdered", "Link", "Image", "Code"],
    color: "#6366f1"
  },
  {
    name: "Fichiers & Documents",
    description: "Gestion de fichiers",
    icons: ["File", "FileText", "FilePlus", "FileCode", "Folder", "FolderPlus", "FolderOpen", "Download", "Upload", "Trash2", "Copy", "Move"],
    color: "#0ea5e9"
  },
  {
    name: "Communication",
    description: "Messages et notifications",
    icons: ["Mail", "Inbox", "Send", "MessageCircle", "MessageSquare", "Phone", "Video", "Bell", "BellRing", "AtSign", "Forward", "Reply"],
    color: "#14b8a6"
  },
];

// Templates for code generation
const codeTemplates = [
  {
    name: "Bouton avec icône",
    template: (icon: string, size: number, color: string) => `<Button className="gap-2">
  <${icon} size={${size}} />
  <span>Action</span>
</Button>`
  },
  {
    name: "Bouton icône seule",
    template: (icon: string, size: number, color: string) => `<Button variant="ghost" size="icon">
  <${icon} size={${size}} />
</Button>`
  },
  {
    name: "Badge avec icône",
    template: (icon: string, size: number, color: string) => `<Badge className="gap-1">
  <${icon} size={${Math.min(size, 14)}} />
  <span>Label</span>
</Badge>`
  },
  {
    name: "Input avec icône",
    template: (icon: string, size: number, color: string) => `<div className="relative">
  <${icon} 
    size={${size}} 
    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
  />
  <Input placeholder="Rechercher..." className="pl-10" />
</div>`
  },
  {
    name: "Liste avec icônes",
    template: (icon: string, size: number, color: string) => `<ul className="space-y-2">
  {items.map((item) => (
    <li key={item.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded">
      <${icon} size={${size}} className="text-primary" />
      <span>{item.label}</span>
    </li>
  ))}
</ul>`
  },
  {
    name: "Card avec icône",
    template: (icon: string, size: number, color: string) => `<Card>
  <CardHeader>
    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
      <${icon} size={${size}} className="text-primary" />
    </div>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description de la carte</CardDescription>
  </CardHeader>
</Card>`
  },
  {
    name: "Navigation item",
    template: (icon: string, size: number, color: string) => `<a 
  href="#" 
  className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
>
  <${icon} size={${size}} />
  <span>Menu item</span>
</a>`
  },
  {
    name: "Alert",
    template: (icon: string, size: number, color: string) => `<Alert>
  <${icon} size={${size}} />
  <AlertTitle>Titre de l'alerte</AlertTitle>
  <AlertDescription>Message descriptif ici.</AlertDescription>
</Alert>`
  },
];

export default function SVGIconBrowser() {
  const [search, setSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("Heart");
  const [iconSize, setIconSize] = useState(24);
  const [iconColor, setIconColor] = useState("#3b82f6");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const iconPreviewRef = useRef<HTMLDivElement>(null);

  const filteredIcons = useMemo(() => {
    let icons = iconNames;

    if (activeCategory !== "all" && categories[activeCategory]) {
      icons = categories[activeCategory].filter((name) => iconNames.includes(name));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      icons = icons.filter((name) => name.toLowerCase().includes(searchLower));
    }

    return icons.slice(0, 300);
  }, [search, activeCategory]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
  };

  const renderIcon = (name: string, size = 24, color = "currentColor", sw = 2) => {
    const IconComponent = iconMap.get(name);
    if (!IconComponent) return null;
    return <IconComponent size={size} color={color} strokeWidth={sw} />;
  };

  const generateReactCode = () => {
    if (!selectedIcon) return "";
    return `import { ${selectedIcon} } from 'lucide-react';

<${selectedIcon} size={${iconSize}} color="${iconColor}" strokeWidth={${strokeWidth}} />`;
  };

  const generateSVGCode = () => {
    if (!selectedIcon || !iconPreviewRef.current) return "";
    const svg = iconPreviewRef.current.querySelector('svg');
    if (!svg) return "";
    
    // Clone and clean the SVG
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.removeAttribute('class');
    
    return clone.outerHTML;
  };

  const downloadSVG = () => {
    const svgCode = generateSVGCode();
    if (!svgCode) {
      toast.error("Impossible de générer le SVG");
      return;
    }
    const blob = new Blob([svgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedIcon?.toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("SVG téléchargé !");
  };

  const applyPreset = (preset: typeof iconPresets[0]) => {
    setSelectedIcons(preset.icons.filter(icon => iconNames.includes(icon)));
    setIconColor(preset.color);
    setActiveTab("browse");
    toast.success(`Preset "${preset.name}" appliqué !`);
  };

  const toggleIconSelection = (name: string) => {
    if (selectedIcons.includes(name)) {
      setSelectedIcons(selectedIcons.filter((n) => n !== name));
    } else {
      setSelectedIcons([...selectedIcons, name]);
    }
  };

  const generateBatchImport = () => {
    if (selectedIcons.length === 0) return "";
    return `import { ${selectedIcons.join(", ")} } from 'lucide-react';`;
  };

  const generateIconsArray = () => {
    if (selectedIcons.length === 0) return "";
    return `import { ${selectedIcons.join(", ")} } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const icons: { name: string; Icon: LucideIcon }[] = [
${selectedIcons.map(icon => `  { name: "${icon}", Icon: ${icon} },`).join("\n")}
];`;
  };

  const randomIcon = () => {
    const randomIndex = Math.floor(Math.random() * iconNames.length);
    setSelectedIcon(iconNames[randomIndex]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            Explorateur d'icônes SVG
          </h1>
          <p className="text-muted-foreground">
            {iconNames.length}+ icônes Lucide avec personnalisation, presets et templates de code
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={randomIcon}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Icône aléatoire
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="browse" className="gap-2">
            <Search className="h-4 w-4" />
            Parcourir
          </TabsTrigger>
          <TabsTrigger value="presets" className="gap-2">
            <Package className="h-4 w-4" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Code className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Icon Browser */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher une icône..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-1 border rounded-lg p-1">
                      <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                      >
                        <LayoutList className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      <Button
                        variant={activeCategory === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory("all")}
                      >
                        Tous
                      </Button>
                      {Object.keys(categories).map((cat) => (
                        <Button
                          key={cat}
                          variant={activeCategory === cat ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveCategory(cat)}
                          className="whitespace-nowrap"
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>

                  {selectedIcons.length > 0 && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          {selectedIcons.length} icône(s) sélectionnée(s)
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedIcons([])}
                        >
                          Tout désélectionner
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedIcons.map((name) => (
                          <Badge 
                            key={name} 
                            variant="secondary" 
                            className="gap-1 cursor-pointer hover:bg-destructive/20"
                            onClick={() => toggleIconSelection(name)}
                          >
                            {renderIcon(name, 12)}
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[400px] overflow-y-auto">
                      {filteredIcons.map((name) => (
                        <button
                          key={name}
                          onClick={() => setSelectedIcon(name)}
                          onDoubleClick={() => toggleIconSelection(name)}
                          className={`p-3 rounded-lg border-2 transition-all hover:bg-muted relative group ${
                            selectedIcon === name ? "border-primary bg-primary/10" : "border-transparent"
                          }`}
                          title={`${name} (double-clic pour sélectionner)`}
                        >
                          {renderIcon(name)}
                          {selectedIcons.includes(name) && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {name}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-1">
                        {filteredIcons.map((name) => (
                          <button
                            key={name}
                            onClick={() => setSelectedIcon(name)}
                            onDoubleClick={() => toggleIconSelection(name)}
                            className={`w-full p-2 rounded-lg flex items-center gap-3 transition-all hover:bg-muted ${
                              selectedIcon === name ? "bg-primary/10" : ""
                            }`}
                          >
                            <div className="w-8 h-8 flex items-center justify-center">
                              {renderIcon(name)}
                            </div>
                            <span className="font-mono text-sm">{name}</span>
                            {selectedIcons.includes(name) && (
                              <Check className="h-4 w-4 text-primary ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                  {filteredIcons.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune icône trouvée pour "{search}"
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    {filteredIcons.length} icônes affichées • Double-clic pour sélection multiple
                  </p>
                </CardContent>
              </Card>

              {selectedIcons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Export multiple ({selectedIcons.length} icônes)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Import simple</Label>
                      <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto font-mono">
                        {generateBatchImport()}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => copyToClipboard(generateBatchImport(), "Import")}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copier l'import
                      </Button>
                    </div>

                    <div>
                      <Label className="mb-2 block">Tableau typé</Label>
                      <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto max-h-40 font-mono">
                        {generateIconsArray()}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => copyToClipboard(generateIconsArray(), "Tableau")}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copier le tableau
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Icon Preview & Customization */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Personnalisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedIcon ? (
                    <>
                      <div 
                        ref={iconPreviewRef}
                        className="flex items-center justify-center p-8 bg-muted rounded-lg relative"
                        style={{ minHeight: Math.max(iconSize + 64, 120) }}
                      >
                        {renderIcon(selectedIcon, iconSize, iconColor, strokeWidth)}
                        <div 
                          className="absolute inset-0 rounded-lg border-2 border-dashed border-muted-foreground/20 pointer-events-none"
                          style={{ 
                            margin: 16,
                            background: `repeating-linear-gradient(
                              45deg,
                              transparent,
                              transparent 10px,
                              rgba(0,0,0,0.02) 10px,
                              rgba(0,0,0,0.02) 20px
                            )`
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-lg font-medium">{selectedIcon}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleIconSelection(selectedIcon)}
                        >
                          {selectedIcons.includes(selectedIcon) ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Taille</Label>
                            <span className="text-sm text-muted-foreground">{iconSize}px</span>
                          </div>
                          <Slider
                            value={[iconSize]}
                            min={12}
                            max={96}
                            step={4}
                            onValueChange={([v]) => setIconSize(v)}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Épaisseur</Label>
                            <span className="text-sm text-muted-foreground">{strokeWidth}</span>
                          </div>
                          <Slider
                            value={[strokeWidth]}
                            min={0.5}
                            max={4}
                            step={0.25}
                            onValueChange={([v]) => setStrokeWidth(v)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Couleur</Label>
                          <div className="flex gap-2">
                            <div className="relative">
                              <Input
                                type="color"
                                value={iconColor}
                                onChange={(e) => setIconColor(e.target.value)}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                            </div>
                            <Input
                              value={iconColor}
                              onChange={(e) => setIconColor(e.target.value)}
                              className="font-mono flex-1"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {["#000000", "#ffffff", "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"].map(
                            (color) => (
                              <button
                                key={color}
                                onClick={() => setIconColor(color)}
                                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                                  iconColor === color ? "border-foreground ring-2 ring-foreground/20 scale-110" : "border-border"
                                }`}
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            )
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Sélectionnez une icône</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedIcon && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="react">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="react">React</TabsTrigger>
                        <TabsTrigger value="svg">SVG</TabsTrigger>
                      </TabsList>

                      <TabsContent value="react" className="space-y-3 mt-4">
                        <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto font-mono">
                          {generateReactCode()}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => copyToClipboard(generateReactCode(), "Code React")}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copier le code
                        </Button>
                      </TabsContent>

                      <TabsContent value="svg" className="space-y-3 mt-4">
                        <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto max-h-32 font-mono">
                          {generateSVGCode() || "Sélectionnez une icône pour voir le SVG"}
                        </pre>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => copyToClipboard(generateSVGCode(), "SVG")}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copier
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={downloadSVG}>
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {iconPresets.map((preset, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${preset.color}15` }}
                    >
                      <Package size={20} style={{ color: preset.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{preset.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-6 gap-1">
                    {preset.icons.slice(0, 12).map((iconName) => (
                      <div
                        key={iconName}
                        className="p-2 rounded bg-muted flex items-center justify-center"
                        style={{ color: preset.color }}
                      >
                        {renderIcon(iconName, 16)}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => applyPreset(preset)}
                    >
                      Appliquer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const importCode = `import { ${preset.icons.join(", ")} } from 'lucide-react';`;
                        copyToClipboard(importCode, "Import");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedIcons.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Icônes sélectionnées ({selectedIcons.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 mb-4">
                  {selectedIcons.map((name) => (
                    <div
                      key={name}
                      className="flex flex-col items-center gap-1 p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      style={{ color: iconColor }}
                      onClick={() => toggleIconSelection(name)}
                    >
                      {renderIcon(name, 24)}
                      <span className="text-xs text-muted-foreground">{name}</span>
                    </div>
                  ))}
                </div>
                <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto mb-2 font-mono">
                  {generateBatchImport()}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateBatchImport(), "Import")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier l'import
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Templates de code</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Générez du code React prêt à l'emploi avec l'icône sélectionnée
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {codeTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTemplate(index)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition ${
                        selectedTemplate === index
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:bg-muted"
                      }`}
                    >
                      <span className="font-medium">{template.name}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Icône pour le template</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
                    {filteredIcons.slice(0, 64).map((name) => (
                      <button
                        key={name}
                        onClick={() => setSelectedIcon(name)}
                        className={`p-2 rounded transition hover:bg-muted ${
                          selectedIcon === name ? "bg-primary/10 ring-2 ring-primary" : ""
                        }`}
                        title={name}
                      >
                        {renderIcon(name, 18)}
                      </button>
                    ))}
                  </div>
                  {selectedIcon && (
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      Sélectionné : <span className="font-mono font-medium">{selectedIcon}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {codeTemplates[selectedTemplate].name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedIcon ? (
                    <>
                      <div className="p-6 bg-muted rounded-lg flex items-center justify-center" style={{ color: iconColor }}>
                        {renderIcon(selectedIcon, iconSize, iconColor, strokeWidth)}
                      </div>

                      <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                        {codeTemplates[selectedTemplate].template(selectedIcon, iconSize, iconColor)}
                      </pre>

                      <Button
                        className="w-full"
                        onClick={() =>
                          copyToClipboard(
                            codeTemplates[selectedTemplate].template(selectedIcon, iconSize, iconColor),
                            "Template"
                          )
                        }
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copier le code
                      </Button>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Sélectionnez une icône pour générer le code</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
