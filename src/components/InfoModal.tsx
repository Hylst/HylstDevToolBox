import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toolCategories, totalToolCount } from "@/lib/tool-registry";
import { Badge } from "@/components/ui/badge";
import { Info, Wrench, BookOpen, User, Mail, Heart, Command, Keyboard, Star, ChevronLeft, ChevronRight, Search, Settings, ClipboardList } from "lucide-react";

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InfoModal = ({ open, onOpenChange }: InfoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Command className="h-5 w-5 text-white" />
            </div>
            DevToolbox
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="about" className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-6 mb-0 w-fit">
            <TabsTrigger value="about" className="gap-1.5">
              <Info className="h-3.5 w-3.5" /> À propos
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-1.5">
              <Wrench className="h-3.5 w-3.5" /> Outils
            </TabsTrigger>
            <TabsTrigger value="guide" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Mode d'emploi
            </TabsTrigger>
            <TabsTrigger value="creator" className="gap-1.5">
              <User className="h-3.5 w-3.5" /> Créateur
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 max-h-[60vh]">
            {/* About */}
            <TabsContent value="about" className="px-6 pb-6 mt-4 space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Une boîte à outils complète pour développeurs</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  DevToolbox réunit <strong className="text-foreground">{totalToolCount} outils</strong> essentiels pour le développement web dans une seule interface, rapide, moderne et 100% locale. Aucune donnée n'est envoyée à un serveur — tout fonctionne dans votre navigateur.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Principes</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { 
                      icon: "🔒", 
                      title: "100% local", 
                      desc: "Aucune donnée transmise, tout reste dans votre navigateur",
                      hoverClass: "hover:bg-blue-500/10 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:-translate-y-0.5"
                    },
                    { 
                      icon: "🎓", 
                      title: "Pédagogique", 
                      desc: "Chaque outil possède son propre mode d'emploi et ses explications détaillées pour vous faire progresser.",
                      hoverClass: "hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:-translate-y-0.5"
                    },
                    { 
                      icon: "🇫🇷", 
                      title: "En français", 
                      desc: "Interface entièrement en français pour les francophones",
                      hoverClass: "hover:bg-purple-500/10 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:-translate-y-0.5"
                    },
                    { 
                      icon: "⚡", 
                      title: "Rapide", 
                      desc: "Chargement instantané avec lazy loading et code splitting",
                      hoverClass: "hover:bg-amber-500/10 hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:-translate-y-0.5"
                    },
                  ].map(p => (
                    <div key={p.title} className={`rounded-lg border border-border bg-muted/30 p-3 transition-all duration-300 cursor-default ${p.hoverClass}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl drop-shadow-sm">{p.icon}</span>
                        <span className="text-sm font-medium text-foreground">{p.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Stack technique</h4>
                <div className="flex flex-wrap gap-2">
                  {["React 18", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "React Router", "Radix UI", "Lucide Icons", "Recharts", "Tanstack Query"].map(t => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tools */}
            <TabsContent value="tools" className="px-6 pb-6 mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                {totalToolCount} outils répartis en {toolCategories.length} catégories
              </p>
              {toolCategories.map(cat => (
                <div key={cat.label}>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-foreground">{cat.label}</h4>
                    <Badge variant="outline" className="text-xs">{cat.tools.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                    {cat.tools.map(tool => (
                      <div key={tool.url} className="text-xs text-muted-foreground py-1.5 px-2 rounded bg-muted/40" title={tool.shortDesc || tool.description}>
                        <span className="font-medium text-foreground">{tool.title}</span>
                        {tool.shortDesc && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{tool.shortDesc}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Guide */}
            <TabsContent value="guide" className="px-6 pb-6 mt-4 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Keyboard className="h-4 w-4" /> Raccourcis clavier
                </h4>
                <div className="space-y-2">
                  {[
                    { keys: "⌘ K", desc: "Ouvrir la palette de commandes (recherche globale)" },
                    { keys: "⌘ D", desc: "Basculer thème clair / sombre" },
                    { keys: "⌘ B", desc: "Afficher / masquer la sidebar" },
                    { keys: "⇧ ⌘ V", desc: "Ouvrir l'historique du presse-papier" },
                    { keys: "⇧ ⌘ ← / →", desc: "Navigation rapide vers l'outil précédent/suivant (PC: Ctrl+Shift+Flèches)" },
                  ].map(s => (
                    <div key={s.keys} className="flex items-center gap-3">
                      <kbd className="inline-flex h-6 items-center rounded border border-border bg-muted px-2 font-mono text-xs text-muted-foreground whitespace-nowrap">{s.keys}</kbd>
                      <span className="text-sm text-muted-foreground">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4" /> Recherche et navigation
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li>Utilisez la <strong className="text-foreground">barre de recherche</strong> ou <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">⌘K</kbd> pour trouver un outil</li>
                  <li>Filtrez par <strong className="text-foreground">catégorie</strong> sur la page d'accueil avec les chips de filtre</li>
                  <li>Le <strong className="text-foreground">fil d'Ariane</strong> en haut de chaque outil indique votre position</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" /> Favoris
                </h4>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur l'étoile <Star className="inline h-3.5 w-3.5 text-yellow-500" /> à côté du titre d'un outil pour l'ajouter à vos favoris. Retrouvez-les dans la sidebar sous « Favoris ».
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" /><ChevronRight className="h-4 w-4 -ml-3" /> Navigation entre outils
                </h4>
                <p className="text-sm text-muted-foreground">
                  En bas de chaque outil, des boutons « Précédent » et « Suivant » permettent de parcourir les outils de la même catégorie.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" /> Presse-papier interactif
                </h4>
                <p className="text-sm text-muted-foreground">
                  Tous vos éléments copiés depuis l'application sont mémorisés localement. Retrouvez-les via l'icône Presse-papier dans l'en-tête ou avec <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px]">⇧ ⌘ V</kbd>.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Préférences & Export
                </h4>
                <p className="text-sm text-muted-foreground">
                  Vos paramètres, favoris et historique sont sauvés dans votre navigateur. Utilisez l'icône <Settings className="inline h-3.5 w-3.5" /> dans l'en-tête pour exporter vos données (JSON) et les restaurer sur un autre appareil.
                </p>
              </div>
            </TabsContent>

            {/* Creator */}
            <TabsContent value="creator" className="px-6 pb-6 mt-4">
              <div className="rounded-xl border border-border bg-muted/20 p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-white">
                    GS
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Geoffroy Streit</h3>
                    <a href="mailto:geoffroy.streit@gmail.com" className="text-sm text-primary hover:underline flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      geoffroy.streit@gmail.com
                    </a>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Réalisé par passion dans le cadre de mon apprentissage, de ma plateforme de supports de cours et fiches mémo sur le développement web (<a href="https://hylst.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">hylst.fr</a>), pour le plaisir de partager, et de réunir en un endroit un maximum d'outils utiles au développeur web et plus encore.
                  </p>
                  <p>
                    L'outil est libre et totalement <strong>gratuit</strong> d'utilisation.
                  </p>
                  <p className="font-mono text-xs opacity-80 mt-2">
                    {`/* Geoffroy = apprenant perpétuel ^^ */`} <br/>
                    {`(づ ᴗ _ᴗ)づ♡ ☕ 💻`}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Partage", "Entraide", "Open Source", "Apprentissage"].map(v => (
                      <Badge key={v} variant="outline" className="text-xs">
                        {v}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Que votre code compile du premier coup ! 🚀
                  </p>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
