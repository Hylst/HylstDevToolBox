import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, Search, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface GitCmd {
  command: string;
  description: string;
  example?: string;
  danger?: boolean;
}

const categories: { label: string; icon: string; items: GitCmd[] }[] = [
  {
    label: "Configuration",
    icon: "cog",
    items: [
      { command: "git config --global user.name \"Nom\"", description: "Définir le nom d'utilisateur" },
      { command: "git config --global user.email \"email\"", description: "Définir l'email" },
      { command: "git config --list", description: "Voir toute la configuration" },
      { command: "git config --global init.defaultBranch main", description: "Branche par défaut: main" },
      { command: "git config --global alias.co checkout", description: "Créer un alias (co = checkout)" },
    ],
  },
  {
    label: "Bases",
    icon: "box",
    items: [
      { command: "git init", description: "Initialiser un dépôt" },
      { command: "git clone <url>", description: "Cloner un dépôt distant" },
      { command: "git status", description: "Voir l'état du working tree" },
      { command: "git add <fichier>", description: "Ajouter au staging" },
      { command: "git add .", description: "Ajouter tous les fichiers modifiés" },
      { command: "git commit -m \"message\"", description: "Créer un commit" },
      { command: "git commit --amend", description: "Modifier le dernier commit" },
      { command: "git log --oneline", description: "Historique compact" },
      { command: "git log --graph --all", description: "Historique en graphe" },
    ],
  },
  {
    label: "Branches",
    icon: "branch",
    items: [
      { command: "git branch", description: "Lister les branches locales" },
      { command: "git branch <nom>", description: "Créer une branche" },
      { command: "git checkout <branche>", description: "Changer de branche" },
      { command: "git checkout -b <branche>", description: "Créer et changer de branche" },
      { command: "git switch <branche>", description: "Changer de branche (moderne)" },
      { command: "git switch -c <branche>", description: "Créer et changer (moderne)" },
      { command: "git branch -d <branche>", description: "Supprimer une branche (safe)" },
      { command: "git branch -D <branche>", description: "Forcer la suppression", danger: true },
      { command: "git branch -m <ancien> <nouveau>", description: "Renommer une branche" },
    ],
  },
  {
    label: "Merge & Rebase",
    icon: "merge",
    items: [
      { command: "git merge <branche>", description: "Fusionner une branche dans la courante" },
      { command: "git merge --no-ff <branche>", description: "Merge avec commit de merge" },
      { command: "git rebase <branche>", description: "Rebaser sur une branche", example: "git rebase main" },
      { command: "git rebase -i HEAD~3", description: "Rebase interactif (3 derniers commits)" },
      { command: "git cherry-pick <hash>", description: "Appliquer un commit spécifique" },
      { command: "git merge --abort", description: "Annuler un merge en conflit" },
      { command: "git rebase --abort", description: "Annuler un rebase en cours" },
    ],
  },
  {
    label: "Remote",
    icon: "cloud",
    items: [
      { command: "git remote -v", description: "Voir les remotes" },
      { command: "git remote add origin <url>", description: "Ajouter un remote" },
      { command: "git push origin <branche>", description: "Pousser vers le remote" },
      { command: "git push -u origin <branche>", description: "Pousser et tracker" },
      { command: "git pull", description: "Tirer les changements (fetch + merge)" },
      { command: "git pull --rebase", description: "Tirer avec rebase" },
      { command: "git fetch", description: "Récupérer sans merger" },
      { command: "git push --force-with-lease", description: "Force push sécurisé", danger: true },
    ],
  },
  {
    label: "Stash",
    icon: "archive",
    items: [
      { command: "git stash", description: "Mettre de côté les changements" },
      { command: "git stash pop", description: "Réappliquer et supprimer le stash" },
      { command: "git stash apply", description: "Réappliquer sans supprimer" },
      { command: "git stash list", description: "Lister les stashes" },
      { command: "git stash drop", description: "Supprimer le dernier stash" },
      { command: "git stash -u", description: "Stash incluant les fichiers non-trackés" },
    ],
  },
  {
    label: "Annulations",
    icon: "undo",
    items: [
      { command: "git restore <fichier>", description: "Annuler les modifications (working tree)" },
      { command: "git restore --staged <fichier>", description: "Unstage un fichier" },
      { command: "git reset HEAD~1", description: "Annuler le dernier commit (garder changes)" },
      { command: "git reset --hard HEAD~1", description: "Annuler le dernier commit (tout perdre)", danger: true },
      { command: "git revert <hash>", description: "Créer un commit inverse (safe)" },
      { command: "git clean -fd", description: "Supprimer fichiers non-trackés", danger: true },
      { command: "git reflog", description: "Historique de toutes les refs (récupération)" },
    ],
  },
  {
    label: "Inspection",
    icon: "search",
    items: [
      { command: "git diff", description: "Voir les changements non-stagés" },
      { command: "git diff --staged", description: "Voir les changements stagés" },
      { command: "git show <hash>", description: "Détails d'un commit" },
      { command: "git blame <fichier>", description: "Qui a modifié chaque ligne" },
      { command: "git bisect start", description: "Recherche binaire de bug" },
      { command: "git log -p <fichier>", description: "Historique d'un fichier avec diff" },
      { command: "git shortlog -sn", description: "Nombre de commits par auteur" },
    ],
  },
  {
    label: "Tags",
    icon: "tag",
    items: [
      { command: "git tag v1.0.0", description: "Créer un tag léger" },
      { command: "git tag -a v1.0.0 -m \"Release\"", description: "Créer un tag annoté" },
      { command: "git push origin --tags", description: "Pousser tous les tags" },
      { command: "git tag -d v1.0.0", description: "Supprimer un tag local" },
    ],
  },
];

interface WorkflowStep { cmd: string; desc: string; }

const workflows: { name: string; description: string; steps: WorkflowStep[] }[] = [
  {
    name: "Feature Branch",
    description: "Développer une fonctionnalité isolée",
    steps: [
      { cmd: "git checkout -b feature/ma-feature", desc: "Créer la branche" },
      { cmd: "git add . && git commit -m \"feat: ...\"", desc: "Commiter les changements" },
      { cmd: "git push -u origin feature/ma-feature", desc: "Pousser la branche" },
      { cmd: "# Créer une Pull Request", desc: "Review de code" },
      { cmd: "git checkout main && git pull", desc: "Revenir sur main" },
      { cmd: "git branch -d feature/ma-feature", desc: "Nettoyer" },
    ],
  },
  {
    name: "Hotfix",
    description: "Corriger un bug en production",
    steps: [
      { cmd: "git checkout -b hotfix/fix-bug main", desc: "Branche depuis main" },
      { cmd: "git commit -m \"fix: ...\"", desc: "Appliquer le fix" },
      { cmd: "git checkout main && git merge hotfix/fix-bug", desc: "Merger dans main" },
      { cmd: "git tag v1.0.1", desc: "Taguer la release" },
      { cmd: "git push origin main --tags", desc: "Déployer" },
    ],
  },
  {
    name: "Rebase Workflow",
    description: "Garder un historique linéaire",
    steps: [
      { cmd: "git checkout feature && git rebase main", desc: "Rebaser sur main" },
      { cmd: "# Résoudre les conflits si nécessaire", desc: "Fix conflits" },
      { cmd: "git rebase --continue", desc: "Continuer le rebase" },
      { cmd: "git checkout main && git merge --ff-only feature", desc: "Fast-forward merge" },
    ],
  },
  {
    name: "Squash Commits",
    description: "Nettoyer l'historique avant merge",
    steps: [
      { cmd: "git rebase -i HEAD~5", desc: "Rebase interactif (5 derniers)" },
      { cmd: "# Marquer 'squash' sur les commits à fusionner", desc: "Éditer la liste" },
      { cmd: "# Réécrire le message de commit", desc: "Message propre" },
      { cmd: "git push --force-with-lease", desc: "Force push sécurisé" },
    ],
  },
];

export default function GitCheatsheet() {
  const [search, setSearch] = useState("");

  const allCmds = useMemo(() => categories.flatMap(c => c.items.map(i => ({ ...i, category: c.label }))), []);

  const filteredCats = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.map(c => ({
      ...c,
      items: c.items.filter(i => i.command.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
    })).filter(c => c.items.length > 0);
  }, [search]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Commande copiée !");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <GitBranch className="h-8 w-8 text-primary" />Git Cheatsheet
      </h1>

      <Tabs defaultValue="commands" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commands">Commandes</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une commande git..." className="pl-10" />
              </div>
            </CardContent>
          </Card>

          {filteredCats.map(cat => (
            <Card key={cat.label}>
              <CardHeader><CardTitle className="text-sm">{cat.label}</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {cat.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer group transition-colors"
                    onClick={() => copy(item.command)}
                  >
                    <code className={`font-mono text-sm flex-1 ${item.danger ? "text-destructive" : "text-foreground"}`}>
                      {item.command}
                    </code>
                    <span className="text-xs text-muted-foreground hidden sm:block max-w-[200px] truncate">{item.description}</span>
                    {item.danger && <Badge variant="destructive" className="text-xs shrink-0">Danger</Badge>}
                    <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          {workflows.map(wf => (
            <Card key={wf.name}>
              <CardHeader>
                <CardTitle className="text-sm">{wf.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{wf.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wf.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {i + 1}
                        </div>
                        {i < wf.steps.length - 1 && <div className="w-px h-4 bg-border" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <code
                          className="text-sm font-mono cursor-pointer hover:text-primary transition-colors block truncate"
                          onClick={() => copy(step.cmd)}
                        >
                          {step.cmd}
                        </code>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
