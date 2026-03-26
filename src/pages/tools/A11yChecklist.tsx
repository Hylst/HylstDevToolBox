import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Accessibility, Eye, Download, Check, X, Contrast } from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  level: "A" | "AA" | "AAA";
  category: string;
  checked: boolean;
}

const initialChecklist: ChecklistItem[] = [
  // Niveau A
  { id: "1.1.1", title: "Contenu non textuel", description: "Fournir des alternatives textuelles pour tout contenu non textuel", level: "A", category: "Perceivable", checked: false },
  { id: "1.2.1", title: "Audio/Vidéo préenregistrés", description: "Fournir des alternatives pour les médias temporels", level: "A", category: "Perceivable", checked: false },
  { id: "1.3.1", title: "Information et relations", description: "L'information et les relations sont préservées dans le code", level: "A", category: "Perceivable", checked: false },
  { id: "1.3.2", title: "Ordre séquentiel logique", description: "L'ordre de lecture et de navigation est logique", level: "A", category: "Perceivable", checked: false },
  { id: "1.4.1", title: "Utilisation de la couleur", description: "La couleur n'est pas le seul moyen de transmettre l'information", level: "A", category: "Perceivable", checked: false },
  { id: "2.1.1", title: "Clavier", description: "Toutes les fonctions sont utilisables au clavier", level: "A", category: "Operable", checked: false },
  { id: "2.1.2", title: "Pas de piège au clavier", description: "Le focus clavier peut être déplacé hors de tout composant", level: "A", category: "Operable", checked: false },
  { id: "2.4.1", title: "Contourner des blocs", description: "Mécanisme pour sauter les blocs répétitifs", level: "A", category: "Operable", checked: false },
  { id: "2.4.2", title: "Titre de page", description: "Les pages ont des titres descriptifs", level: "A", category: "Operable", checked: false },
  { id: "2.4.4", title: "Fonction du lien", description: "L'objectif de chaque lien est déterminable", level: "A", category: "Operable", checked: false },
  { id: "3.1.1", title: "Langue de la page", description: "La langue par défaut est identifiable", level: "A", category: "Understandable", checked: false },
  { id: "3.2.1", title: "Au focus", description: "Pas de changement de contexte au focus", level: "A", category: "Understandable", checked: false },
  { id: "3.3.1", title: "Identification des erreurs", description: "Les erreurs sont identifiées et décrites", level: "A", category: "Understandable", checked: false },
  { id: "3.3.2", title: "Étiquettes ou instructions", description: "Étiquettes ou instructions fournies", level: "A", category: "Understandable", checked: false },
  { id: "4.1.1", title: "Analyse syntaxique", description: "Le HTML est valide et bien formé", level: "A", category: "Robust", checked: false },
  { id: "4.1.2", title: "Nom, rôle, valeur", description: "Composants UI ont nom, rôle, valeur accessibles", level: "A", category: "Robust", checked: false },
  
  // Niveau AA
  { id: "1.4.3", title: "Contraste (minimum)", description: "Ratio de contraste minimum 4.5:1 pour le texte", level: "AA", category: "Perceivable", checked: false },
  { id: "1.4.4", title: "Redimensionnement du texte", description: "Le texte peut être agrandi à 200% sans perte", level: "AA", category: "Perceivable", checked: false },
  { id: "1.4.5", title: "Texte sous forme d'image", description: "Utiliser du vrai texte plutôt que des images", level: "AA", category: "Perceivable", checked: false },
  { id: "2.4.5", title: "Accès multiples", description: "Plus d'une façon d'accéder aux pages", level: "AA", category: "Operable", checked: false },
  { id: "2.4.6", title: "En-têtes et étiquettes", description: "Les en-têtes et étiquettes décrivent le sujet", level: "AA", category: "Operable", checked: false },
  { id: "2.4.7", title: "Visibilité du focus", description: "Le focus clavier est visible", level: "AA", category: "Operable", checked: false },
  { id: "3.1.2", title: "Langue d'un passage", description: "Changements de langue identifiés", level: "AA", category: "Understandable", checked: false },
  { id: "3.2.3", title: "Navigation cohérente", description: "Navigation cohérente sur le site", level: "AA", category: "Understandable", checked: false },
  { id: "3.3.3", title: "Suggestion après une erreur", description: "Suggestions de correction fournies", level: "AA", category: "Understandable", checked: false },
  { id: "3.3.4", title: "Prévention des erreurs", description: "Données réversibles/vérifiables/confirmables", level: "AA", category: "Understandable", checked: false },
  
  // Niveau AAA
  { id: "1.4.6", title: "Contraste (amélioré)", description: "Ratio de contraste 7:1 pour le texte", level: "AAA", category: "Perceivable", checked: false },
  { id: "2.1.3", title: "Clavier (pas d'exception)", description: "Tout est accessible au clavier sans exception", level: "AAA", category: "Operable", checked: false },
  { id: "2.4.8", title: "Localisation", description: "Information sur la position dans le site", level: "AAA", category: "Operable", checked: false },
  { id: "2.4.9", title: "Fonction du lien (lien seul)", description: "Objectif du lien déterminable par le lien seul", level: "AAA", category: "Operable", checked: false },
];

const colorBlindFilters = {
  normal: "none",
  protanopia: "url(#protanopia)",
  deuteranopia: "url(#deuteranopia)", 
  tritanopia: "url(#tritanopia)",
  achromatopsia: "grayscale(100%)"
};

export default function A11yChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [filterLevel, setFilterLevel] = useState<"all" | "A" | "AA" | "AAA">("all");
  const [colorBlindMode, setColorBlindMode] = useState<keyof typeof colorBlindFilters>("normal");
  const [contrastFg, setContrastFg] = useState("#000000");
  const [contrastBg, setContrastBg] = useState("#ffffff");

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const filteredItems = checklist.filter(item => 
    filterLevel === "all" || item.level === filterLevel
  );

  const stats = {
    total: filteredItems.length,
    checked: filteredItems.filter(i => i.checked).length,
    A: { total: checklist.filter(i => i.level === "A").length, checked: checklist.filter(i => i.level === "A" && i.checked).length },
    AA: { total: checklist.filter(i => i.level === "AA").length, checked: checklist.filter(i => i.level === "AA" && i.checked).length },
    AAA: { total: checklist.filter(i => i.level === "AAA").length, checked: checklist.filter(i => i.level === "AAA" && i.checked).length }
  };

  const progress = stats.total > 0 ? (stats.checked / stats.total) * 100 : 0;

  // Calcul du contraste
  const getLuminance = (hex: string): number => {
    const rgb = hex.replace("#", "").match(/.{2}/g)!.map(x => parseInt(x, 16) / 255);
    const [r, g, b] = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const getContrastRatio = (fg: string, bg: string): number => {
    const l1 = getLuminance(fg);
    const l2 = getLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const contrastRatio = getContrastRatio(contrastFg, contrastBg);
  const passesAA = contrastRatio >= 4.5;
  const passesAAA = contrastRatio >= 7;

  const exportReport = () => {
    const report = `# Rapport d'audit d'accessibilité WCAG 2.1

## Résumé
- Progression globale: ${Math.round(progress)}%
- Niveau A: ${stats.A.checked}/${stats.A.total}
- Niveau AA: ${stats.AA.checked}/${stats.AA.total}
- Niveau AAA: ${stats.AAA.checked}/${stats.AAA.total}

## Détail des critères

${checklist.map(item => `- [${item.checked ? "x" : " "}] ${item.id} - ${item.title} (${item.level})\n  ${item.description}`).join("\n\n")}

---
Généré le ${new Date().toLocaleDateString()}
`;
    
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "a11y-audit.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rapport exporté");
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "A": return "bg-green-500/20 text-green-700";
      case "AA": return "bg-orange-500/20 text-orange-700";
      case "AAA": return "bg-purple-500/20 text-purple-700";
      default: return "";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* SVG Filters for color blindness */}
      <svg className="hidden">
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
          </filter>
        </defs>
      </svg>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Accessibility className="h-8 w-8 text-primary" />
          Accessibility Checklist
        </h1>
        <p className="text-muted-foreground mt-1">
          Audit d'accessibilité WCAG 2.1 interactif
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main checklist */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Progression</CardTitle>
                <Badge>{Math.round(progress)}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-3" />
              <div className="flex gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1">
                  <Badge className={getLevelColor("A")}>A</Badge>
                  {stats.A.checked}/{stats.A.total}
                </span>
                <span className="flex items-center gap-1">
                  <Badge className={getLevelColor("AA")}>AA</Badge>
                  {stats.AA.checked}/{stats.AA.total}
                </span>
                <span className="flex items-center gap-1">
                  <Badge className={getLevelColor("AAA")}>AAA</Badge>
                  {stats.AAA.checked}/{stats.AAA.total}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Critères WCAG 2.1</CardTitle>
                <div className="flex gap-1">
                  {(["all", "A", "AA", "AAA"] as const).map(level => (
                    <Button
                      key={level}
                      variant={filterLevel === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterLevel(level)}
                    >
                      {level === "all" ? "Tous" : level}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        item.checked ? "bg-green-500/10 border-green-500/30" : "hover:bg-muted"
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={item.checked} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm text-muted-foreground">{item.id}</span>
                            <span className="font-medium">{item.title}</span>
                            <Badge className={getLevelColor(item.level)}>{item.level}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Tools sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Contrast className="h-5 w-5" />
                Test de contraste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Premier plan</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={contrastFg}
                      onChange={(e) => setContrastFg(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={contrastFg}
                      onChange={(e) => setContrastFg(e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Arrière-plan</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={contrastBg}
                      onChange={(e) => setContrastBg(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={contrastBg}
                      onChange={(e) => setContrastBg(e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-lg text-center"
                style={{ backgroundColor: contrastBg, color: contrastFg }}
              >
                <p className="text-lg font-medium">Exemple de texte</p>
                <p className="text-sm">Texte plus petit</p>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold">{contrastRatio.toFixed(2)}:1</p>
                <div className="flex gap-2 justify-center mt-2">
                  <Badge variant={passesAA ? "default" : "destructive"}>
                    {passesAA ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    AA (4.5:1)
                  </Badge>
                  <Badge variant={passesAAA ? "default" : "destructive"}>
                    {passesAAA ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                    AAA (7:1)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Simulation daltonisme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(colorBlindFilters) as Array<keyof typeof colorBlindFilters>).map((mode) => (
                <Button
                  key={mode}
                  variant={colorBlindMode === mode ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setColorBlindMode(mode)}
                >
                  <div
                    className="w-4 h-4 rounded mr-2"
                    style={{
                      background: "linear-gradient(135deg, #ff0000, #00ff00, #0000ff)",
                      filter: colorBlindFilters[mode]
                    }}
                  />
                  {mode === "normal" && "Vision normale"}
                  {mode === "protanopia" && "Protanopie (rouge)"}
                  {mode === "deuteranopia" && "Deutéranopie (vert)"}
                  {mode === "tritanopia" && "Tritanopie (bleu)"}
                  {mode === "achromatopsia" && "Achromatopsie (N&B)"}
                </Button>
              ))}

              <div
                className="p-4 rounded-lg grid grid-cols-4 gap-2"
                style={{ filter: colorBlindFilters[colorBlindMode] }}
              >
                {["#e74c3c", "#2ecc71", "#3498db", "#f1c40f", "#9b59b6", "#1abc9c", "#e67e22", "#34495e"].map(color => (
                  <div key={color} className="w-full h-8 rounded" style={{ backgroundColor: color }} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" /> Exporter le rapport
          </Button>
        </div>
      </div>
    </div>
  );
}
