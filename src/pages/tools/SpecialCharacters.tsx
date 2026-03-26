import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Smile, Search, Copy } from "lucide-react";
import { toast } from "sonner";

interface CharItem { char: string; name: string; code: string; }

const categories: { label: string; items: CharItem[] }[] = [
  {
    label: "Flèches",
    items: [
      { char: "←", name: "Gauche", code: "U+2190" }, { char: "→", name: "Droite", code: "U+2192" },
      { char: "↑", name: "Haut", code: "U+2191" }, { char: "↓", name: "Bas", code: "U+2193" },
      { char: "↔", name: "Gauche-Droite", code: "U+2194" }, { char: "↕", name: "Haut-Bas", code: "U+2195" },
      { char: "⇒", name: "Double droite", code: "U+21D2" }, { char: "⇐", name: "Double gauche", code: "U+21D0" },
      { char: "⇔", name: "Double G-D", code: "U+21D4" }, { char: "↗", name: "Nord-Est", code: "U+2197" },
      { char: "↘", name: "Sud-Est", code: "U+2198" }, { char: "↙", name: "Sud-Ouest", code: "U+2199" },
      { char: "↖", name: "Nord-Ouest", code: "U+2196" }, { char: "➜", name: "Épaisse droite", code: "U+279C" },
      { char: "➤", name: "Triangle droite", code: "U+27A4" }, { char: "▶", name: "Play", code: "U+25B6" },
    ],
  },
  {
    label: "Mathématiques",
    items: [
      { char: "±", name: "Plus-moins", code: "U+00B1" }, { char: "×", name: "Multiplication", code: "U+00D7" },
      { char: "÷", name: "Division", code: "U+00F7" }, { char: "≠", name: "Différent", code: "U+2260" },
      { char: "≈", name: "Approx", code: "U+2248" }, { char: "≤", name: "Inférieur ou égal", code: "U+2264" },
      { char: "≥", name: "Supérieur ou égal", code: "U+2265" }, { char: "∞", name: "Infini", code: "U+221E" },
      { char: "√", name: "Racine carrée", code: "U+221A" }, { char: "∑", name: "Somme", code: "U+2211" },
      { char: "∏", name: "Produit", code: "U+220F" }, { char: "∫", name: "Intégrale", code: "U+222B" },
      { char: "∂", name: "Dérivée partielle", code: "U+2202" }, { char: "∆", name: "Delta", code: "U+2206" },
      { char: "π", name: "Pi", code: "U+03C0" }, { char: "θ", name: "Theta", code: "U+03B8" },
      { char: "λ", name: "Lambda", code: "U+03BB" }, { char: "α", name: "Alpha", code: "U+03B1" },
      { char: "β", name: "Beta", code: "U+03B2" }, { char: "Ω", name: "Omega", code: "U+03A9" },
    ],
  },
  {
    label: "Devises",
    items: [
      { char: "€", name: "Euro", code: "U+20AC" }, { char: "$", name: "Dollar", code: "U+0024" },
      { char: "£", name: "Livre", code: "U+00A3" }, { char: "¥", name: "Yen", code: "U+00A5" },
      { char: "₹", name: "Roupie", code: "U+20B9" }, { char: "₩", name: "Won", code: "U+20A9" },
      { char: "₿", name: "Bitcoin", code: "U+20BF" }, { char: "¢", name: "Cent", code: "U+00A2" },
      { char: "₽", name: "Rouble", code: "U+20BD" }, { char: "₺", name: "Lire turque", code: "U+20BA" },
    ],
  },
  {
    label: "Symboles courants",
    items: [
      { char: "©", name: "Copyright", code: "U+00A9" }, { char: "®", name: "Registered", code: "U+00AE" },
      { char: "™", name: "Trademark", code: "U+2122" }, { char: "°", name: "Degré", code: "U+00B0" },
      { char: "•", name: "Bullet", code: "U+2022" }, { char: "…", name: "Ellipsis", code: "U+2026" },
      { char: "§", name: "Section", code: "U+00A7" }, { char: "¶", name: "Paragraphe", code: "U+00B6" },
      { char: "†", name: "Dagger", code: "U+2020" }, { char: "‡", name: "Double dagger", code: "U+2021" },
      { char: "※", name: "Référence", code: "U+203B" }, { char: "‰", name: "Pour mille", code: "U+2030" },
      { char: "♠", name: "Pique", code: "U+2660" }, { char: "♥", name: "Cœur", code: "U+2665" },
      { char: "♦", name: "Carreau", code: "U+2666" }, { char: "♣", name: "Trèfle", code: "U+2663" },
    ],
  },
  {
    label: "Coches et formes",
    items: [
      { char: "✓", name: "Check", code: "U+2713" }, { char: "✗", name: "Croix", code: "U+2717" },
      { char: "✔", name: "Check épais", code: "U+2714" }, { char: "✘", name: "Croix épaisse", code: "U+2718" },
      { char: "★", name: "Étoile pleine", code: "U+2605" }, { char: "☆", name: "Étoile vide", code: "U+2606" },
      { char: "■", name: "Carré plein", code: "U+25A0" }, { char: "□", name: "Carré vide", code: "U+25A1" },
      { char: "●", name: "Cercle plein", code: "U+25CF" }, { char: "○", name: "Cercle vide", code: "U+25CB" },
      { char: "◆", name: "Losange plein", code: "U+25C6" }, { char: "◇", name: "Losange vide", code: "U+25C7" },
      { char: "▲", name: "Triangle haut", code: "U+25B2" }, { char: "▼", name: "Triangle bas", code: "U+25BC" },
    ],
  },
  {
    label: "Émojis populaires",
    items: [
      { char: "😀", name: "Grinning", code: "U+1F600" }, { char: "😂", name: "Rire", code: "U+1F602" },
      { char: "❤️", name: "Cœur rouge", code: "U+2764" }, { char: "👍", name: "Pouce haut", code: "U+1F44D" },
      { char: "🔥", name: "Feu", code: "U+1F525" }, { char: "⚡", name: "Éclair", code: "U+26A1" },
      { char: "✨", name: "Étoiles", code: "U+2728" }, { char: "🎉", name: "Tada", code: "U+1F389" },
      { char: "💡", name: "Ampoule", code: "U+1F4A1" }, { char: "🚀", name: "Fusée", code: "U+1F680" },
      { char: "⚠️", name: "Warning", code: "U+26A0" }, { char: "✅", name: "Check vert", code: "U+2705" },
      { char: "❌", name: "Croix rouge", code: "U+274C" }, { char: "📌", name: "Punaise", code: "U+1F4CC" },
      { char: "🔗", name: "Lien", code: "U+1F517" }, { char: "📝", name: "Mémo", code: "U+1F4DD" },
    ],
  },
];

export default function SpecialCharacters() {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const allChars = useMemo(() => categories.flatMap(c => c.items.map(i => ({ ...i, category: c.label }))), []);

  const filtered = useMemo(() => {
    if (!search) return null;
    return allChars.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.char.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, allChars]);

  const copyChar = (char: string) => {
    navigator.clipboard.writeText(char);
    setCopied(char);
    toast.success(`"${char}" copié !`);
    setTimeout(() => setCopied(null), 1500);
  };

  const renderGrid = (items: CharItem[]) => (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => copyChar(item.char)}
          className={`flex flex-col items-center p-2 rounded-lg border transition-all hover:border-primary hover:bg-muted/50 ${copied === item.char ? "border-primary bg-primary/10" : "border-border/50"}`}
          title={`${item.name} (${item.code})`}
        >
          <span className="text-2xl">{item.char}</span>
          <span className="text-xs text-muted-foreground mt-1 truncate w-full text-center">{item.name}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Smile className="h-8 w-8 text-primary" />Caractères Spéciaux
      </h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un caractère, nom ou code unicode..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {filtered ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Résultats ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? renderGrid(filtered) : (
              <p className="text-center text-muted-foreground py-8">Aucun résultat pour "{search}"</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.map(cat => (
            <Card key={cat.label}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {cat.label}
                  <Badge variant="secondary" className="text-xs">{cat.items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>{renderGrid(cat.items)}</CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
