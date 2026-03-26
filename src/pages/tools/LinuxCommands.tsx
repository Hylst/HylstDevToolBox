import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Terminal, Search, Copy, FolderOpen, Globe, Cpu, HardDrive, Users, FileText, Settings, ArrowLeftRight, Archive, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { commands, categories, pipeCombinations } from "@/lib/linux-commands-data";
import type { Command } from "@/lib/linux-commands-data";

const iconMap: Record<string, React.ElementType> = {
  Terminal, FolderOpen, FileText, Globe, Cpu, HardDrive, Users, Settings, ArrowLeftRight, Archive,
};

export default function LinuxCommands() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Command | null>(null);
  const [showPipes, setShowPipes] = useState(false);

  const filtered = useMemo(() => {
    return commands.filter(cmd => {
      const matchSearch = !search || cmd.name.includes(search.toLowerCase()) || cmd.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "all" || cmd.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !" });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Terminal className="h-8 w-8 text-primary" />
          Linux Commands
        </h1>
        <p className="text-muted-foreground">
          Référence interactive de {commands.length} commandes Linux/Unix avec exemples
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une commande..." className="pl-10" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => {
            const Icon = iconMap[cat.icon] || Terminal;
            return (
              <Button key={cat.id} size="sm" variant={category === cat.id ? "default" : "outline"} onClick={() => { setCategory(cat.id); setShowPipes(false); }}>
                <Icon className="h-3 w-3 mr-1" /> {cat.label}
              </Button>
            );
          })}
          <Button size="sm" variant={showPipes ? "default" : "outline"} onClick={() => setShowPipes(!showPipes)}>
            <Zap className="h-3 w-3 mr-1" /> Pipes
          </Button>
        </div>
      </div>

      {showPipes ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Pipes & Combinaisons
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Les pipes (<code className="text-primary">|</code>) permettent de chaîner des commandes. La sortie d'une commande devient l'entrée de la suivante.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipeCombinations.map((pipe, i) => (
              <div key={i} className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <code className="font-mono text-sm text-primary break-all">{pipe.cmd}</code>
                  <Button size="sm" variant="ghost" onClick={() => copy(pipe.cmd)} className="shrink-0 ml-2">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{pipe.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-2 max-h-[700px] overflow-auto">
            <div className="text-xs text-muted-foreground mb-2 px-1">
              {filtered.length} commande{filtered.length > 1 ? "s" : ""}
            </div>
            {filtered.map(cmd => (
              <Card
                key={cmd.name}
                className={`cursor-pointer transition-all hover:border-primary/50 ${selected?.name === cmd.name ? "border-primary bg-primary/5" : ""}`}
                onClick={() => setSelected(cmd)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <code className="font-bold text-primary">{cmd.name}</code>
                    <Badge variant="secondary" className="text-xs">{categories.find(c => c.id === cmd.category)?.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{cmd.description}</p>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune commande trouvée</p>}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <code className="text-2xl text-primary">{selected.name}</code>
                    <span className="text-lg font-normal text-muted-foreground">{selected.description}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Syntaxe</Label>
                    <div className="bg-muted/50 p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                      <code>{selected.syntax}</code>
                      <Button size="sm" variant="ghost" onClick={() => copy(selected.syntax)}><Copy className="h-3 w-3" /></Button>
                    </div>
                  </div>

                  {selected.options.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Options courantes</Label>
                      <div className="space-y-1">
                        {selected.options.map(opt => (
                          <div key={opt.flag} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                            <code className="font-mono text-sm font-bold text-primary min-w-[80px]">{opt.flag}</code>
                            <span className="text-sm text-muted-foreground">{opt.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Exemples</Label>
                    <div className="space-y-2">
                      {selected.examples.map((ex, i) => (
                        <div key={i} className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <code className="font-mono text-sm text-primary">{ex.cmd}</code>
                            <Button size="sm" variant="ghost" onClick={() => copy(ex.cmd)}><Copy className="h-3 w-3" /></Button>
                          </div>
                          <p className="text-xs text-muted-foreground">{ex.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez une commande pour voir les détails</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
