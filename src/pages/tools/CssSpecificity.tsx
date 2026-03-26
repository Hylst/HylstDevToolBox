import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Plus, Trash2, ArrowUpDown, Info } from "lucide-react";
import { toast } from "sonner";

interface SpecificityResult {
  selector: string;
  inline: number;
  ids: number;
  classes: number;
  elements: number;
  score: string;
  numericScore: number;
  details: string[];
}

const exampleSelectors = [
  "div",
  ".container",
  "#header",
  "div.container",
  "#header .nav a",
  "ul li a.active",
  "#main .content p:first-child",
  "body #page .article h1",
  "[type='text']",
  "::before",
  ":hover",
  "div > p + span",
  ".btn.btn-primary.btn-large",
  "#sidebar ul.menu li.active a:hover"
];

const calculateSpecificity = (selector: string): SpecificityResult => {
  let inline = 0;
  let ids = 0;
  let classes = 0;
  let elements = 0;
  const details: string[] = [];

  // Nettoyer le sélecteur
  let s = selector.trim();

  // Style inline (pas applicable dans les sélecteurs CSS)
  // mais on le garde pour la complétude

  // Compter les IDs (#id)
  const idMatches = s.match(/#[a-zA-Z_-][\w-]*/g) || [];
  ids = idMatches.length;
  if (ids > 0) {
    details.push(`${ids} ID(s): ${idMatches.join(", ")}`);
  }

  // Retirer les IDs pour ne pas les recompter
  s = s.replace(/#[a-zA-Z_-][\w-]*/g, "");

  // Compter les classes, attributs et pseudo-classes
  const classMatches = s.match(/\.[a-zA-Z_-][\w-]*/g) || [];
  const attrMatches = s.match(/\[[^\]]+\]/g) || [];
  const pseudoClassMatches = s.match(/:(?!:)[a-zA-Z-]+(\([^)]*\))?/g) || [];

  // Exclure :not(), :is(), :where() du comptage (ils comptent leurs arguments)
  const validPseudoClasses = pseudoClassMatches.filter(
    p => !p.startsWith(":not") && !p.startsWith(":is") && !p.startsWith(":where")
  );

  classes = classMatches.length + attrMatches.length + validPseudoClasses.length;

  if (classMatches.length > 0) {
    details.push(`${classMatches.length} classe(s): ${classMatches.join(", ")}`);
  }
  if (attrMatches.length > 0) {
    details.push(`${attrMatches.length} attribut(s): ${attrMatches.join(", ")}`);
  }
  if (validPseudoClasses.length > 0) {
    details.push(`${validPseudoClasses.length} pseudo-classe(s): ${validPseudoClasses.join(", ")}`);
  }

  // Retirer pour ne pas recompter
  s = s.replace(/\.[a-zA-Z_-][\w-]*/g, "");
  s = s.replace(/\[[^\]]+\]/g, "");
  s = s.replace(/:(?!:)[a-zA-Z-]+(\([^)]*\))?/g, "");

  // Compter les éléments et pseudo-éléments
  const pseudoElementMatches = s.match(/::[a-zA-Z-]+/g) || [];
  // Éléments: ce qui reste après avoir retiré les combinateurs et espaces
  const elementMatches = s
    .replace(/::[a-zA-Z-]+/g, "")
    .replace(/[>+~\s]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(e => e && /^[a-zA-Z][\w-]*$/.test(e));

  elements = elementMatches.length + pseudoElementMatches.length;

  if (elementMatches.length > 0) {
    details.push(`${elementMatches.length} élément(s): ${elementMatches.join(", ")}`);
  }
  if (pseudoElementMatches.length > 0) {
    details.push(`${pseudoElementMatches.length} pseudo-élément(s): ${pseudoElementMatches.join(", ")}`);
  }

  const numericScore = inline * 1000000 + ids * 10000 + classes * 100 + elements;

  return {
    selector: selector.trim(),
    inline,
    ids,
    classes,
    elements,
    score: `(${inline}, ${ids}, ${classes}, ${elements})`,
    numericScore,
    details
  };
};

export default function CssSpecificity() {
  const [selectors, setSelectors] = useState<string[]>(["#header .nav a", ".container p", "div"]);
  const [newSelector, setNewSelector] = useState("");
  const [bulkInput, setBulkInput] = useState("");

  const results = useMemo(() => {
    return selectors
      .filter(s => s.trim())
      .map(s => calculateSpecificity(s))
      .sort((a, b) => b.numericScore - a.numericScore);
  }, [selectors]);

  const addSelector = () => {
    if (newSelector.trim() && !selectors.includes(newSelector.trim())) {
      setSelectors([...selectors, newSelector.trim()]);
      setNewSelector("");
    }
  };

  const removeSelector = (index: number) => {
    setSelectors(selectors.filter((_, i) => i !== index));
  };

  const loadExamples = () => {
    setSelectors(exampleSelectors);
    toast.success("Exemples chargés");
  };

  const parseBulk = () => {
    const lines = bulkInput
      .split("\n")
      .map(l => l.trim())
      .filter(l => l && !l.startsWith("//") && !l.startsWith("/*"));
    setSelectors([...new Set([...selectors, ...lines])]);
    setBulkInput("");
    toast.success(`${lines.length} sélecteur(s) ajouté(s)`);
  };

  const getBarWidth = (score: number): number => {
    const maxScore = Math.max(...results.map(r => r.numericScore), 1);
    return (score / maxScore) * 100;
  };

  const getScoreColor = (result: SpecificityResult): string => {
    if (result.ids > 0) return "bg-red-500";
    if (result.classes > 2) return "bg-orange-500";
    if (result.classes > 0) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Palette className="h-8 w-8 text-primary" />
          CSS Specificity Calculator
        </h1>
        <p className="text-muted-foreground mt-1">
          Calculez et comparez la spécificité de vos sélecteurs CSS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ajouter un sélecteur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSelector}
                  onChange={(e) => setNewSelector(e.target.value)}
                  placeholder=".my-class #id element"
                  onKeyDown={(e) => e.key === "Enter" && addSelector()}
                  className="font-mono"
                />
                <Button onClick={addSelector}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={loadExamples}>
                Charger des exemples
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Import en masse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Un sélecteur par ligne..."
                className="font-mono text-sm min-h-[100px]"
              />
              <Button variant="outline" onClick={parseBulk} disabled={!bulkInput.trim()}>
                Ajouter les sélecteurs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sélecteurs actuels ({selectors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  {selectors.map((sel, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                      <code className="font-mono">{sel}</code>
                      <Button variant="ghost" size="sm" onClick={() => removeSelector(idx)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Classement par spécificité
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {results.map((result, idx) => (
                    <div key={idx} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <code className="font-mono text-sm">{result.selector}</code>
                        <Badge variant="outline" className="font-mono">
                          {result.score}
                        </Badge>
                      </div>
                      
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreColor(result)} transition-all`}
                          style={{ width: `${getBarWidth(result.numericScore)}%` }}
                        />
                      </div>

                      <div className="flex gap-2 text-xs">
                        <Badge variant="secondary">IDs: {result.ids}</Badge>
                        <Badge variant="secondary">Classes: {result.classes}</Badge>
                        <Badge variant="secondary">Éléments: {result.elements}</Badge>
                      </div>

                      {result.details.length > 0 && (
                        <ul className="text-xs text-muted-foreground mt-2">
                          {result.details.map((d, i) => (
                            <li key={i}>• {d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Comment ça marche
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>La spécificité CSS est calculée avec 4 niveaux :</p>
              <ul className="space-y-1 text-muted-foreground">
                <li><strong>Inline styles</strong> (style="...") = 1,0,0,0</li>
                <li><strong>IDs</strong> (#header) = 0,1,0,0</li>
                <li><strong>Classes, attributs, pseudo-classes</strong> (.class, [attr], :hover) = 0,0,1,0</li>
                <li><strong>Éléments, pseudo-éléments</strong> (div, ::before) = 0,0,0,1</li>
              </ul>
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium">Bonnes pratiques :</p>
                <ul className="text-muted-foreground mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    Privilégiez les classes (BEM, Tailwind)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    Évitez les sélecteurs trop spécifiques
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    Limitez l'usage des IDs pour le style
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
