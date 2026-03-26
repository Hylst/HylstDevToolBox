import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Search, Copy, Eye } from "lucide-react";
import { toast } from "sonner";

interface SelectorItem {
  selector: string;
  description: string;
  specificity: [number, number, number];
  example: string;
  html: string;
}

const categories: { label: string; items: SelectorItem[] }[] = [
  {
    label: "Basiques",
    items: [
      { selector: "*", description: "Sélecteur universel", specificity: [0, 0, 0], example: "* { margin: 0; }", html: "<div>Tout</div>" },
      { selector: "element", description: "Par nom de balise", specificity: [0, 0, 1], example: "p { color: blue; }", html: "<p>Paragraphe</p>" },
      { selector: ".class", description: "Par classe", specificity: [0, 1, 0], example: ".btn { padding: 8px; }", html: '<div class="btn">Bouton</div>' },
      { selector: "#id", description: "Par identifiant", specificity: [1, 0, 0], example: "#header { height: 60px; }", html: '<div id="header">Header</div>' },
    ],
  },
  {
    label: "Combinateurs",
    items: [
      { selector: "A B", description: "Descendant (n'importe quel niveau)", specificity: [0, 0, 2], example: "div p { color: red; }", html: "<div><section><p>Texte</p></section></div>" },
      { selector: "A > B", description: "Enfant direct", specificity: [0, 0, 2], example: "ul > li { list-style: none; }", html: "<ul><li>Item</li></ul>" },
      { selector: "A + B", description: "Frère adjacent (immédiat)", specificity: [0, 0, 2], example: "h2 + p { margin-top: 0; }", html: "<h2>Titre</h2><p>Texte</p>" },
      { selector: "A ~ B", description: "Frères généraux (tous après)", specificity: [0, 0, 2], example: "h2 ~ p { color: gray; }", html: "<h2>Titre</h2><p>1</p><p>2</p>" },
    ],
  },
  {
    label: "Attributs",
    items: [
      { selector: "[attr]", description: "Attribut présent", specificity: [0, 1, 0], example: "[disabled] { opacity: 0.5; }", html: '<input disabled />' },
      { selector: '[attr="val"]', description: "Valeur exacte", specificity: [0, 1, 0], example: '[type="email"] { border: blue; }', html: '<input type="email" />' },
      { selector: '[attr^="val"]', description: "Commence par", specificity: [0, 1, 0], example: '[href^="https"] { color: green; }', html: '<a href="https://...">Lien</a>' },
      { selector: '[attr$="val"]', description: "Finit par", specificity: [0, 1, 0], example: '[src$=".png"] { border: 1px; }', html: '<img src="photo.png" />' },
      { selector: '[attr*="val"]', description: "Contient", specificity: [0, 1, 0], example: '[class*="btn"] { cursor: pointer; }', html: '<div class="btn-primary">Ok</div>' },
      { selector: '[attr~="val"]', description: "Mot dans liste séparée par espaces", specificity: [0, 1, 0], example: '[class~="active"] { font-weight: bold; }', html: '<div class="nav active">Nav</div>' },
    ],
  },
  {
    label: "Pseudo-classes",
    items: [
      { selector: ":hover", description: "Au survol", specificity: [0, 1, 0], example: "a:hover { color: red; }", html: "<a>Survolez-moi</a>" },
      { selector: ":focus", description: "Au focus", specificity: [0, 1, 0], example: "input:focus { outline: blue; }", html: "<input />" },
      { selector: ":first-child", description: "Premier enfant", specificity: [0, 1, 0], example: "li:first-child { font-weight: bold; }", html: "<ul><li>Premier</li><li>Second</li></ul>" },
      { selector: ":last-child", description: "Dernier enfant", specificity: [0, 1, 0], example: "li:last-child { border: none; }", html: "<ul><li>Un</li><li>Dernier</li></ul>" },
      { selector: ":nth-child(n)", description: "N-ième enfant", specificity: [0, 1, 0], example: "tr:nth-child(2n) { background: gray; }", html: "<tr>Pair</tr>" },
      { selector: ":not(sel)", description: "Négation", specificity: [0, 1, 0], example: "p:not(.intro) { font-size: 14px; }", html: '<p>Normal</p><p class="intro">Intro</p>' },
      { selector: ":is(sel)", description: "Correspondance multiple", specificity: [0, 0, 1], example: ":is(h1, h2, h3) { color: navy; }", html: "<h1>Titre</h1>" },
      { selector: ":has(sel)", description: "Parent contenant", specificity: [0, 0, 1], example: "div:has(> img) { padding: 8px; }", html: "<div><img /></div>" },
      { selector: ":empty", description: "Élément vide", specificity: [0, 1, 0], example: "div:empty { display: none; }", html: "<div></div>" },
      { selector: ":checked", description: "Coché/sélectionné", specificity: [0, 1, 0], example: "input:checked + label { bold; }", html: '<input type="checkbox" checked />' },
      { selector: ":disabled", description: "Désactivé", specificity: [0, 1, 0], example: "input:disabled { opacity: 0.5; }", html: "<input disabled />" },
    ],
  },
  {
    label: "Pseudo-éléments",
    items: [
      { selector: "::before", description: "Contenu avant l'élément", specificity: [0, 0, 1], example: 'p::before { content: "→ "; }', html: "<p>Texte</p>" },
      { selector: "::after", description: "Contenu après l'élément", specificity: [0, 0, 1], example: 'a::after { content: " ↗"; }', html: "<a>Lien</a>" },
      { selector: "::first-line", description: "Première ligne", specificity: [0, 0, 1], example: "p::first-line { font-weight: bold; }", html: "<p>Longue ligne...</p>" },
      { selector: "::first-letter", description: "Première lettre", specificity: [0, 0, 1], example: "p::first-letter { font-size: 2em; }", html: "<p>Paragraphe</p>" },
      { selector: "::placeholder", description: "Texte placeholder", specificity: [0, 0, 1], example: "input::placeholder { color: gray; }", html: '<input placeholder="..." />' },
      { selector: "::selection", description: "Texte sélectionné", specificity: [0, 0, 1], example: "::selection { background: yellow; }", html: "<p>Sélectionnez-moi</p>" },
    ],
  },
];

function specificityToString(s: [number, number, number]): string {
  return `(${s[0]}, ${s[1]}, ${s[2]})`;
}

function specificityScore(s: [number, number, number]): number {
  return s[0] * 100 + s[1] * 10 + s[2];
}

export default function CssSelectorReference() {
  const [search, setSearch] = useState("");
  const [compareA, setCompareA] = useState("#nav .item");
  const [compareB, setCompareB] = useState("div.nav > a.active");

  const allItems = useMemo(() => categories.flatMap(c => c.items), []);

  const filteredCats = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.map(c => ({
      ...c,
      items: c.items.filter(i => i.selector.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
    })).filter(c => c.items.length > 0);
  }, [search]);

  function calcSpecificity(sel: string): [number, number, number] {
    const s: [number, number, number] = [0, 0, 0];
    // Remove pseudo-elements
    const clean = sel.replace(/::[a-z-]+/g, () => { s[2]++; return ""; });
    // Count IDs
    s[0] = (clean.match(/#[a-zA-Z_-]+/g) || []).length;
    // Count classes, attributes, pseudo-classes
    s[1] = (clean.match(/\.[a-zA-Z_-]+/g) || []).length
      + (clean.match(/\[[^\]]+\]/g) || []).length
      + (clean.match(/:[a-zA-Z_-]+(?:\([^)]*\))?/g) || []).length;
    // Count elements
    const elements = clean.replace(/#[a-zA-Z_-]+/g, "").replace(/\.[a-zA-Z_-]+/g, "")
      .replace(/\[[^\]]+\]/g, "").replace(/:[a-zA-Z_-]+(?:\([^)]*\))?/g, "")
      .replace(/[>+~ *]/g, " ").trim().split(/\s+/).filter(Boolean);
    s[2] += elements.filter(e => /^[a-zA-Z]/.test(e)).length;
    return s;
  }

  const specA = calcSpecificity(compareA);
  const specB = calcSpecificity(compareB);
  const scoreA = specificityScore(specA);
  const scoreB = specificityScore(specB);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Palette className="h-8 w-8 text-primary" />CSS Selector Reference
      </h1>

      <Tabs defaultValue="reference" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reference">Référence</TabsTrigger>
          <TabsTrigger value="specificity">Spécificité</TabsTrigger>
        </TabsList>

        <TabsContent value="reference" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un sélecteur..." className="pl-10" />
              </div>
            </CardContent>
          </Card>

          {filteredCats.map(cat => (
            <Card key={cat.label}>
              <CardHeader><CardTitle className="text-sm">{cat.label}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {cat.items.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <code
                            className="font-mono text-primary font-bold cursor-pointer hover:underline"
                            onClick={() => { navigator.clipboard.writeText(item.selector); toast.success("Copié !"); }}
                          >
                            {item.selector}
                          </code>
                          <Badge variant="outline" className="text-xs font-mono shrink-0">
                            {specificityToString(item.specificity)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="mt-2 grid md:grid-cols-2 gap-2">
                      <div className="bg-muted/30 rounded p-2">
                        <span className="text-xs text-muted-foreground">CSS</span>
                        <code className="block text-xs font-mono mt-1">{item.example}</code>
                      </div>
                      <div className="bg-muted/30 rounded p-2">
                        <span className="text-xs text-muted-foreground">HTML</span>
                        <code className="block text-xs font-mono mt-1">{item.html}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="specificity" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Comparateur de spécificité</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Sélecteur A</label>
                  <Input value={compareA} onChange={e => setCompareA(e.target.value)} className="font-mono" />
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">{specificityToString(specA)}</Badge>
                    <span className="text-xs text-muted-foreground">Score: {scoreA}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Sélecteur B</label>
                  <Input value={compareB} onChange={e => setCompareB(e.target.value)} className="font-mono" />
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">{specificityToString(specB)}</Badge>
                    <span className="text-xs text-muted-foreground">Score: {scoreB}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                {scoreA === scoreB ? (
                  <p className="font-medium">Spécificité égale — le dernier déclaré gagne</p>
                ) : (
                  <p className="font-medium">
                    <code className="text-primary">{scoreA > scoreB ? compareA : compareB}</code>
                    {" "}gagne avec un score de {Math.max(scoreA, scoreB)} vs {Math.min(scoreA, scoreB)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Règles de spécificité</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Card><CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-primary">A</div>
                    <div className="text-xs text-muted-foreground mt-1">IDs (#id)</div>
                    <div className="text-xs">×100</div>
                  </CardContent></Card>
                  <Card><CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-primary">B</div>
                    <div className="text-xs text-muted-foreground mt-1">Classes, attributs, pseudo-classes</div>
                    <div className="text-xs">×10</div>
                  </CardContent></Card>
                  <Card><CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-primary">C</div>
                    <div className="text-xs text-muted-foreground mt-1">Éléments, pseudo-éléments</div>
                    <div className="text-xs">×1</div>
                  </CardContent></Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
