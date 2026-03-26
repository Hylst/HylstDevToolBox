import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Keyboard, Search, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Shortcut {
  id: string;
  action: string;
  keys: {
    mac: string;
    windows: string;
  };
  category: string;
}

interface Tool {
  name: string;
  shortcuts: Shortcut[];
}

const tools: Tool[] = [
  {
    name: "VS Code",
    shortcuts: [
      { id: "vsc-1", action: "Palette de commandes", keys: { mac: "⌘ ⇧ P", windows: "Ctrl+Shift+P" }, category: "Général" },
      { id: "vsc-2", action: "Recherche de fichiers", keys: { mac: "⌘ P", windows: "Ctrl+P" }, category: "Général" },
      { id: "vsc-3", action: "Recherche globale", keys: { mac: "⌘ ⇧ F", windows: "Ctrl+Shift+F" }, category: "Recherche" },
      { id: "vsc-4", action: "Remplacer", keys: { mac: "⌘ ⌥ F", windows: "Ctrl+H" }, category: "Recherche" },
      { id: "vsc-5", action: "Fermer l'éditeur", keys: { mac: "⌘ W", windows: "Ctrl+W" }, category: "Éditeur" },
      { id: "vsc-6", action: "Diviser l'éditeur", keys: { mac: "⌘ \\", windows: "Ctrl+\\" }, category: "Éditeur" },
      { id: "vsc-7", action: "Terminal intégré", keys: { mac: "⌃ `", windows: "Ctrl+`" }, category: "Terminal" },
      { id: "vsc-8", action: "Nouveau terminal", keys: { mac: "⌃ ⇧ `", windows: "Ctrl+Shift+`" }, category: "Terminal" },
      { id: "vsc-9", action: "Commenter ligne", keys: { mac: "⌘ /", windows: "Ctrl+/" }, category: "Code" },
      { id: "vsc-10", action: "Formater le code", keys: { mac: "⇧ ⌥ F", windows: "Shift+Alt+F" }, category: "Code" },
      { id: "vsc-11", action: "Aller à la définition", keys: { mac: "F12", windows: "F12" }, category: "Navigation" },
      { id: "vsc-12", action: "Aller à la ligne", keys: { mac: "⌃ G", windows: "Ctrl+G" }, category: "Navigation" },
      { id: "vsc-13", action: "Multi-curseur", keys: { mac: "⌥ Click", windows: "Alt+Click" }, category: "Sélection" },
      { id: "vsc-14", action: "Sélectionner le mot", keys: { mac: "⌘ D", windows: "Ctrl+D" }, category: "Sélection" },
      { id: "vsc-15", action: "Déplacer la ligne", keys: { mac: "⌥ ↑/↓", windows: "Alt+↑/↓" }, category: "Code" },
      { id: "vsc-16", action: "Dupliquer la ligne", keys: { mac: "⇧ ⌥ ↑/↓", windows: "Shift+Alt+↑/↓" }, category: "Code" },
      { id: "vsc-17", action: "Renommer symbole", keys: { mac: "F2", windows: "F2" }, category: "Refactoring" },
      { id: "vsc-18", action: "Sidebar explorer", keys: { mac: "⌘ ⇧ E", windows: "Ctrl+Shift+E" }, category: "Vue" },
      { id: "vsc-19", action: "Sidebar Git", keys: { mac: "⌃ ⇧ G", windows: "Ctrl+Shift+G" }, category: "Vue" },
      { id: "vsc-20", action: "Extensions", keys: { mac: "⌘ ⇧ X", windows: "Ctrl+Shift+X" }, category: "Vue" },
    ],
  },
  {
    name: "Chrome DevTools",
    shortcuts: [
      { id: "cdt-1", action: "Ouvrir DevTools", keys: { mac: "⌘ ⌥ I", windows: "F12" }, category: "Général" },
      { id: "cdt-2", action: "Ouvrir Console", keys: { mac: "⌘ ⌥ J", windows: "Ctrl+Shift+J" }, category: "Général" },
      { id: "cdt-3", action: "Inspecter élément", keys: { mac: "⌘ ⇧ C", windows: "Ctrl+Shift+C" }, category: "Elements" },
      { id: "cdt-4", action: "Mode responsive", keys: { mac: "⌘ ⇧ M", windows: "Ctrl+Shift+M" }, category: "Général" },
      { id: "cdt-5", action: "Rafraîchir (cache vidé)", keys: { mac: "⌘ ⇧ R", windows: "Ctrl+Shift+R" }, category: "Réseau" },
      { id: "cdt-6", action: "Pause/Resume script", keys: { mac: "F8", windows: "F8" }, category: "Debugger" },
      { id: "cdt-7", action: "Step over", keys: { mac: "F10", windows: "F10" }, category: "Debugger" },
      { id: "cdt-8", action: "Step into", keys: { mac: "F11", windows: "F11" }, category: "Debugger" },
      { id: "cdt-9", action: "Step out", keys: { mac: "⇧ F11", windows: "Shift+F11" }, category: "Debugger" },
      { id: "cdt-10", action: "Rechercher dans les fichiers", keys: { mac: "⌘ ⌥ F", windows: "Ctrl+Shift+F" }, category: "Sources" },
      { id: "cdt-11", action: "Ouvrir fichier", keys: { mac: "⌘ P", windows: "Ctrl+P" }, category: "Sources" },
      { id: "cdt-12", action: "Palette de commandes", keys: { mac: "⌘ ⇧ P", windows: "Ctrl+Shift+P" }, category: "Général" },
    ],
  },
  {
    name: "Terminal / Bash",
    shortcuts: [
      { id: "bash-1", action: "Effacer l'écran", keys: { mac: "⌘ K / Ctrl+L", windows: "Ctrl+L" }, category: "Général" },
      { id: "bash-2", action: "Annuler la commande", keys: { mac: "Ctrl+C", windows: "Ctrl+C" }, category: "Général" },
      { id: "bash-3", action: "Suspendre processus", keys: { mac: "Ctrl+Z", windows: "Ctrl+Z" }, category: "Général" },
      { id: "bash-4", action: "Fin de saisie (EOF)", keys: { mac: "Ctrl+D", windows: "Ctrl+D" }, category: "Général" },
      { id: "bash-5", action: "Début de ligne", keys: { mac: "Ctrl+A", windows: "Ctrl+A" }, category: "Navigation" },
      { id: "bash-6", action: "Fin de ligne", keys: { mac: "Ctrl+E", windows: "Ctrl+E" }, category: "Navigation" },
      { id: "bash-7", action: "Mot précédent", keys: { mac: "⌥ B", windows: "Ctrl+←" }, category: "Navigation" },
      { id: "bash-8", action: "Mot suivant", keys: { mac: "⌥ F", windows: "Ctrl+→" }, category: "Navigation" },
      { id: "bash-9", action: "Supprimer mot avant", keys: { mac: "Ctrl+W", windows: "Ctrl+W" }, category: "Édition" },
      { id: "bash-10", action: "Supprimer jusqu'à fin", keys: { mac: "Ctrl+K", windows: "Ctrl+K" }, category: "Édition" },
      { id: "bash-11", action: "Historique précédent", keys: { mac: "↑ / Ctrl+P", windows: "↑" }, category: "Historique" },
      { id: "bash-12", action: "Recherche historique", keys: { mac: "Ctrl+R", windows: "Ctrl+R" }, category: "Historique" },
    ],
  },
  {
    name: "Git",
    shortcuts: [
      { id: "git-1", action: "Status", keys: { mac: "git status", windows: "git status" }, category: "Commandes" },
      { id: "git-2", action: "Ajouter tous les fichiers", keys: { mac: "git add .", windows: "git add ." }, category: "Commandes" },
      { id: "git-3", action: "Commit", keys: { mac: "git commit -m \"msg\"", windows: "git commit -m \"msg\"" }, category: "Commandes" },
      { id: "git-4", action: "Push", keys: { mac: "git push", windows: "git push" }, category: "Commandes" },
      { id: "git-5", action: "Pull", keys: { mac: "git pull", windows: "git pull" }, category: "Commandes" },
      { id: "git-6", action: "Nouvelle branche", keys: { mac: "git checkout -b name", windows: "git checkout -b name" }, category: "Branches" },
      { id: "git-7", action: "Changer de branche", keys: { mac: "git checkout name", windows: "git checkout name" }, category: "Branches" },
      { id: "git-8", action: "Merge branche", keys: { mac: "git merge name", windows: "git merge name" }, category: "Branches" },
      { id: "git-9", action: "Stash", keys: { mac: "git stash", windows: "git stash" }, category: "Avancé" },
      { id: "git-10", action: "Stash pop", keys: { mac: "git stash pop", windows: "git stash pop" }, category: "Avancé" },
      { id: "git-11", action: "Log compact", keys: { mac: "git log --oneline", windows: "git log --oneline" }, category: "Historique" },
      { id: "git-12", action: "Diff", keys: { mac: "git diff", windows: "git diff" }, category: "Historique" },
    ],
  },
  {
    name: "Figma",
    shortcuts: [
      { id: "fig-1", action: "Outil sélection", keys: { mac: "V", windows: "V" }, category: "Outils" },
      { id: "fig-2", action: "Outil cadre", keys: { mac: "F", windows: "F" }, category: "Outils" },
      { id: "fig-3", action: "Outil rectangle", keys: { mac: "R", windows: "R" }, category: "Outils" },
      { id: "fig-4", action: "Outil ellipse", keys: { mac: "O", windows: "O" }, category: "Outils" },
      { id: "fig-5", action: "Outil texte", keys: { mac: "T", windows: "T" }, category: "Outils" },
      { id: "fig-6", action: "Outil plume", keys: { mac: "P", windows: "P" }, category: "Outils" },
      { id: "fig-7", action: "Zoom 100%", keys: { mac: "⌘ 0", windows: "Ctrl+0" }, category: "Vue" },
      { id: "fig-8", action: "Zoom ajusté", keys: { mac: "⌘ 1", windows: "Ctrl+1" }, category: "Vue" },
      { id: "fig-9", action: "Grouper", keys: { mac: "⌘ G", windows: "Ctrl+G" }, category: "Organisation" },
      { id: "fig-10", action: "Dégrouper", keys: { mac: "⌘ ⇧ G", windows: "Ctrl+Shift+G" }, category: "Organisation" },
      { id: "fig-11", action: "Dupliquer", keys: { mac: "⌘ D", windows: "Ctrl+D" }, category: "Édition" },
      { id: "fig-12", action: "Créer composant", keys: { mac: "⌘ ⌥ K", windows: "Ctrl+Alt+K" }, category: "Composants" },
    ],
  },
  {
    name: "Notion",
    shortcuts: [
      { id: "not-1", action: "Nouvelle page", keys: { mac: "⌘ N", windows: "Ctrl+N" }, category: "Pages" },
      { id: "not-2", action: "Recherche", keys: { mac: "⌘ P", windows: "Ctrl+P" }, category: "Navigation" },
      { id: "not-3", action: "Créer lien", keys: { mac: "⌘ K", windows: "Ctrl+K" }, category: "Édition" },
      { id: "not-4", action: "Gras", keys: { mac: "⌘ B", windows: "Ctrl+B" }, category: "Format" },
      { id: "not-5", action: "Italique", keys: { mac: "⌘ I", windows: "Ctrl+I" }, category: "Format" },
      { id: "not-6", action: "Code inline", keys: { mac: "⌘ E", windows: "Ctrl+E" }, category: "Format" },
      { id: "not-7", action: "Todo", keys: { mac: "⌘ ⇧ 4", windows: "Ctrl+Shift+4" }, category: "Blocs" },
      { id: "not-8", action: "Heading 1", keys: { mac: "⌘ ⇧ 1", windows: "Ctrl+Shift+1" }, category: "Blocs" },
      { id: "not-9", action: "Toggle liste", keys: { mac: "⌘ ⇧ 7", windows: "Ctrl+Shift+7" }, category: "Blocs" },
      { id: "not-10", action: "Bloc code", keys: { mac: "⌘ ⇧ 8", windows: "Ctrl+Shift+8" }, category: "Blocs" },
    ],
  },
  {
    name: "Slack",
    shortcuts: [
      { id: "slk-1", action: "Recherche", keys: { mac: "⌘ K", windows: "Ctrl+K" }, category: "Navigation" },
      { id: "slk-2", action: "Nouveau message", keys: { mac: "⌘ N", windows: "Ctrl+N" }, category: "Messages" },
      { id: "slk-3", action: "Upload fichier", keys: { mac: "⌘ U", windows: "Ctrl+U" }, category: "Messages" },
      { id: "slk-4", action: "Éditer dernier message", keys: { mac: "↑", windows: "↑" }, category: "Messages" },
      { id: "slk-5", action: "Réaction emoji", keys: { mac: "⌘ ⇧ \\", windows: "Ctrl+Shift+\\" }, category: "Messages" },
      { id: "slk-6", action: "Marquer non lu", keys: { mac: "⌥ Click", windows: "Alt+Click" }, category: "Messages" },
      { id: "slk-7", action: "Channel suivant", keys: { mac: "⌥ ↓", windows: "Alt+↓" }, category: "Navigation" },
      { id: "slk-8", action: "Channel non lu suivant", keys: { mac: "⌥ ⇧ ↓", windows: "Alt+Shift+↓" }, category: "Navigation" },
    ],
  },
  {
    name: "JetBrains",
    shortcuts: [
      { id: "jb-1", action: "Recherche partout", keys: { mac: "⇧ ⇧", windows: "Shift+Shift" }, category: "Recherche" },
      { id: "jb-2", action: "Actions", keys: { mac: "⌘ ⇧ A", windows: "Ctrl+Shift+A" }, category: "Général" },
      { id: "jb-3", action: "Aller à la classe", keys: { mac: "⌘ O", windows: "Ctrl+N" }, category: "Navigation" },
      { id: "jb-4", action: "Aller au fichier", keys: { mac: "⌘ ⇧ O", windows: "Ctrl+Shift+N" }, category: "Navigation" },
      { id: "jb-5", action: "Aller au symbole", keys: { mac: "⌘ ⌥ O", windows: "Ctrl+Alt+Shift+N" }, category: "Navigation" },
      { id: "jb-6", action: "Refactoring", keys: { mac: "⌃ T", windows: "Ctrl+Alt+Shift+T" }, category: "Refactoring" },
      { id: "jb-7", action: "Renommer", keys: { mac: "⇧ F6", windows: "Shift+F6" }, category: "Refactoring" },
      { id: "jb-8", action: "Extraire méthode", keys: { mac: "⌘ ⌥ M", windows: "Ctrl+Alt+M" }, category: "Refactoring" },
      { id: "jb-9", action: "Formater code", keys: { mac: "⌘ ⌥ L", windows: "Ctrl+Alt+L" }, category: "Code" },
      { id: "jb-10", action: "Optimiser imports", keys: { mac: "⌃ ⌥ O", windows: "Ctrl+Alt+O" }, category: "Code" },
      { id: "jb-11", action: "Commenter ligne", keys: { mac: "⌘ /", windows: "Ctrl+/" }, category: "Code" },
      { id: "jb-12", action: "Dupliquer ligne", keys: { mac: "⌘ D", windows: "Ctrl+D" }, category: "Code" },
      { id: "jb-13", action: "Run", keys: { mac: "⌃ R", windows: "Shift+F10" }, category: "Exécution" },
      { id: "jb-14", action: "Debug", keys: { mac: "⌃ D", windows: "Shift+F9" }, category: "Exécution" },
      { id: "jb-15", action: "Terminal", keys: { mac: "⌥ F12", windows: "Alt+F12" }, category: "Outils" },
    ],
  },
  {
    name: "macOS",
    shortcuts: [
      { id: "mac-1", action: "Spotlight", keys: { mac: "⌘ Space", windows: "-" }, category: "Système" },
      { id: "mac-2", action: "Forcer à quitter", keys: { mac: "⌘ ⌥ Esc", windows: "-" }, category: "Système" },
      { id: "mac-3", action: "Capture d'écran", keys: { mac: "⌘ ⇧ 3", windows: "-" }, category: "Capture" },
      { id: "mac-4", action: "Capture zone", keys: { mac: "⌘ ⇧ 4", windows: "-" }, category: "Capture" },
      { id: "mac-5", action: "Capture fenêtre", keys: { mac: "⌘ ⇧ 4 Space", windows: "-" }, category: "Capture" },
      { id: "mac-6", action: "Changer d'app", keys: { mac: "⌘ Tab", windows: "-" }, category: "Navigation" },
      { id: "mac-7", action: "Fermer fenêtre", keys: { mac: "⌘ W", windows: "-" }, category: "Fenêtres" },
      { id: "mac-8", action: "Quitter app", keys: { mac: "⌘ Q", windows: "-" }, category: "Système" },
      { id: "mac-9", action: "Masquer app", keys: { mac: "⌘ H", windows: "-" }, category: "Fenêtres" },
      { id: "mac-10", action: "Mission Control", keys: { mac: "⌃ ↑", windows: "-" }, category: "Navigation" },
    ],
  },
  {
    name: "Windows",
    shortcuts: [
      { id: "win-1", action: "Menu Démarrer", keys: { mac: "-", windows: "Win" }, category: "Système" },
      { id: "win-2", action: "Gestionnaire des tâches", keys: { mac: "-", windows: "Ctrl+Shift+Esc" }, category: "Système" },
      { id: "win-3", action: "Capture d'écran", keys: { mac: "-", windows: "Win+Shift+S" }, category: "Capture" },
      { id: "win-4", action: "Capture plein écran", keys: { mac: "-", windows: "PrtScn" }, category: "Capture" },
      { id: "win-5", action: "Changer d'app", keys: { mac: "-", windows: "Alt+Tab" }, category: "Navigation" },
      { id: "win-6", action: "Bureau", keys: { mac: "-", windows: "Win+D" }, category: "Navigation" },
      { id: "win-7", action: "Explorateur", keys: { mac: "-", windows: "Win+E" }, category: "Système" },
      { id: "win-8", action: "Verrouiller", keys: { mac: "-", windows: "Win+L" }, category: "Système" },
      { id: "win-9", action: "Snap gauche/droite", keys: { mac: "-", windows: "Win+←/→" }, category: "Fenêtres" },
      { id: "win-10", action: "Paramètres", keys: { mac: "-", windows: "Win+I" }, category: "Système" },
    ],
  },
];

export default function KeyboardShortcuts() {
  const [search, setSearch] = useState("");
  const [selectedTool, setSelectedTool] = useState("VS Code");
  const [platform, setPlatform] = useState<"mac" | "windows">(() => {
    if (typeof navigator !== "undefined") {
      return navigator.platform.toLowerCase().includes("mac") ? "mac" : "windows";
    }
    return "windows";
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("keyboard-shortcuts-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const currentTool = tools.find((t) => t.name === selectedTool);

  const filteredShortcuts = useMemo(() => {
    if (!currentTool) return [];
    return currentTool.shortcuts.filter((s) =>
      s.action.toLowerCase().includes(search.toLowerCase()) ||
      s.keys[platform].toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [currentTool, search, platform]);

  const categories = useMemo(() => {
    if (!currentTool) return [];
    return [...new Set(currentTool.shortcuts.map((s) => s.category))];
  }, [currentTool]);

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem("keyboard-shortcuts-favorites", JSON.stringify(newFavorites));
  };

  const KeyBadge = ({ keys }: { keys: string }) => {
    if (keys === "-") return <span className="text-muted-foreground text-sm">N/A</span>;
    return (
      <div className="flex gap-1 flex-wrap">
        {keys.split(" ").map((key, i) => (
          <kbd
            key={i}
            className="px-2 py-1 bg-muted rounded border text-sm font-mono shadow-sm"
          >
            {key}
          </kbd>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Keyboard className="h-8 w-8 text-primary" />
          Raccourcis Clavier
        </h1>
        <p className="text-muted-foreground">
          Référence rapide des raccourcis pour vos outils favoris
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Plateforme</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                variant={platform === "mac" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setPlatform("mac")}
              >
                macOS
              </Button>
              <Button
                variant={platform === "windows" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setPlatform("windows")}
              >
                Windows
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Outils</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {tools.map((tool) => (
                <Button
                  key={tool.name}
                  variant={selectedTool === tool.name ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedTool(tool.name)}
                >
                  {tool.name}
                  <Badge variant="secondary" className="ml-auto">{tool.shortcuts.length}</Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {favorites.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Mes favoris</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{favorites.length} raccourcis</Badge>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un raccourci..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Tous ({filteredShortcuts.length})</TabsTrigger>
              <TabsTrigger value="favorites">Favoris</TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="space-y-2 pr-4">
                  {filteredShortcuts.map((shortcut) => (
                    <ShortcutRow
                      key={shortcut.id}
                      shortcut={shortcut}
                      platform={platform}
                      isFavorite={favorites.includes(shortcut.id)}
                      onToggleFavorite={toggleFavorite}
                      KeyBadge={KeyBadge}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="favorites" className="mt-4">
              <ScrollArea className="h-[calc(100vh-350px)]">
                <div className="space-y-2 pr-4">
                  {tools.flatMap((t) => t.shortcuts).filter((s) => favorites.includes(s.id)).map((shortcut) => (
                    <ShortcutRow
                      key={shortcut.id}
                      shortcut={shortcut}
                      platform={platform}
                      isFavorite={true}
                      onToggleFavorite={toggleFavorite}
                      KeyBadge={KeyBadge}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {categories.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-4">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-2 pr-4">
                    {filteredShortcuts.filter((s) => s.category === cat).map((shortcut) => (
                      <ShortcutRow
                        key={shortcut.id}
                        shortcut={shortcut}
                        platform={platform}
                        isFavorite={favorites.includes(shortcut.id)}
                        onToggleFavorite={toggleFavorite}
                        KeyBadge={KeyBadge}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({
  shortcut,
  platform,
  isFavorite,
  onToggleFavorite,
  KeyBadge,
}: {
  shortcut: Shortcut;
  platform: "mac" | "windows";
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  KeyBadge: React.FC<{ keys: string }>;
}) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="sm" onClick={() => onToggleFavorite(shortcut.id)}>
            {isFavorite ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
          <div className="flex-1">
            <p className="font-medium">{shortcut.action}</p>
            <Badge variant="outline" className="text-xs">{shortcut.category}</Badge>
          </div>
        </div>
        <KeyBadge keys={shortcut.keys[platform]} />
      </CardContent>
    </Card>
  );
}
