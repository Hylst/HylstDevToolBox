import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Link2, Trash2, History, List } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const transliterationMap: Record<string, string> = {
  à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", æ: "ae",
  ç: "c", č: "c", ć: "c", è: "e", é: "e", ê: "e", ë: "e", ě: "e",
  ì: "i", í: "i", î: "i", ï: "i", ñ: "n", ň: "n",
  ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o", œ: "oe",
  ù: "u", ú: "u", û: "u", ü: "u", ů: "u", ý: "y", ÿ: "y",
  ß: "ss", đ: "d", ð: "d", ł: "l", ř: "r", š: "s", ť: "t", ž: "z",
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
  ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  α: "a", β: "b", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i",
  θ: "th", ι: "i", κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x",
  ο: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y",
  φ: "f", χ: "ch", ψ: "ps", ω: "o",
};

function transliterate(str: string): string {
  return str.toLowerCase().split("").map((ch) => transliterationMap[ch] || ch).join("");
}

function generateSlug(text: string, options: { separator: string; lowercase: boolean; removeAccents: boolean; maxLength: number }): string {
  let slug = text;
  if (options.removeAccents) slug = transliterate(slug);
  if (options.lowercase) slug = slug.toLowerCase();
  slug = slug.replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, options.separator)
    .replace(new RegExp(`${options.separator}+`, "g"), options.separator)
    .replace(new RegExp(`^${options.separator}|${options.separator}$`, "g"), "");
  if (options.maxLength > 0 && slug.length > options.maxLength) {
    slug = slug.substring(0, options.maxLength);
    const lastSep = slug.lastIndexOf(options.separator);
    if (lastSep > 0) slug = slug.substring(0, lastSep);
  }
  return slug;
}

export default function SlugGenerator() {
  const [input, setInput] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);
  const [removeAccents, setRemoveAccents] = useState(true);
  const [maxLength, setMaxLength] = useState(0);
  const [baseUrl, setBaseUrl] = useState("https://example.com");
  const [history, setHistory] = useState<Array<{ input: string; slug: string }>>([]);

  const opts = { separator, lowercase, removeAccents, maxLength };
  const slug = useMemo(() => generateSlug(input, opts), [input, separator, lowercase, removeAccents, maxLength]);

  const bulkSlugs = useMemo(() => {
    if (!bulkInput.trim()) return [];
    return bulkInput.split("\n").filter(l => l.trim()).map(line => ({
      input: line.trim(),
      slug: generateSlug(line.trim(), opts),
    }));
  }, [bulkInput, separator, lowercase, removeAccents, maxLength]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  };

  const handleCopySingle = () => {
    if (!slug) return;
    handleCopy(slug);
    if (input && !history.some(h => h.input === input)) {
      setHistory(prev => [{ input, slug }, ...prev].slice(0, 20));
    }
  };

  const handleCopyAllBulk = () => {
    const text = bulkSlugs.map(s => s.slug).join("\n");
    handleCopy(text);
  };

  const handleCopyBulkUrls = () => {
    const text = bulkSlugs.map(s => `${baseUrl}/${s.slug}`).join("\n");
    handleCopy(text);
  };

  const examples = [
    "L'été sera chaud en 2024 !", "Créer un site web moderne",
    "Les 10 meilleurs restaurants à Paris", "Comment configurer React & TypeScript ?",
    "Привет мир", "Ελληνικά",
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Slug Generator</h1>
          <p className="text-muted-foreground">Convertissez du texte en slug URL-friendly — simple ou en masse</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="single">
            <TabsList>
              <TabsTrigger value="single">Simple</TabsTrigger>
              <TabsTrigger value="bulk"><List className="h-4 w-4 mr-1" /> Bulk</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-4">
              <Card>
                <CardHeader><CardTitle>Générateur</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Texte à convertir</Label>
                    <div className="flex gap-2">
                      <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Entrez votre titre ou texte..." className="flex-1" />
                      <Button variant="outline" onClick={() => setInput("")}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {examples.map(ex => (
                      <Button key={ex} variant="outline" size="sm" onClick={() => setInput(ex)} className="text-xs">
                        {ex.substring(0, 25)}…
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Slug généré</Label>
                    <div className="flex gap-2">
                      <Input value={slug} readOnly className="flex-1 font-mono bg-muted" placeholder="le-slug-apparaitra-ici" />
                      <Button onClick={handleCopySingle} disabled={!slug}><Copy className="h-4 w-4 mr-2" /> Copier</Button>
                    </div>
                  </div>

                  {slug && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Aperçu URL :</p>
                      <p className="font-mono text-primary break-all">{baseUrl}/<span className="font-bold">{slug}</span></p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Mode Bulk
                    <Badge variant="secondary">{bulkSlugs.length} slugs</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Un texte par ligne</Label>
                    <Textarea
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder={"Mon premier article\nGuide de démarrage rapide\nLes meilleures pratiques 2026"}
                      className="min-h-[150px] font-mono text-sm"
                    />
                  </div>

                  {bulkSlugs.length > 0 && (
                    <>
                      <div className="flex gap-2">
                        <Button onClick={handleCopyAllBulk} variant="outline" size="sm"><Copy className="h-4 w-4 mr-1" /> Copier slugs</Button>
                        <Button onClick={handleCopyBulkUrls} variant="outline" size="sm"><Copy className="h-4 w-4 mr-1" /> Copier URLs</Button>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-auto">
                        {bulkSlugs.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                            <span className="text-muted-foreground truncate flex-1">{item.input}</span>
                            <span className="text-primary font-mono truncate flex-1">{item.slug}</span>
                            <Button size="sm" variant="ghost" onClick={() => handleCopy(item.slug)}><Copy className="h-3.5 w-3.5" /></Button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Options</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Séparateur</Label>
                <Select value={separator} onValueChange={setSeparator}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">Tiret (-)</SelectItem>
                    <SelectItem value="_">Underscore (_)</SelectItem>
                    <SelectItem value=".">Point (.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lowercase">Minuscules</Label>
                <Switch id="lowercase" checked={lowercase} onCheckedChange={setLowercase} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="accents">Supprimer les accents</Label>
                <Switch id="accents" checked={removeAccents} onCheckedChange={setRemoveAccents} />
              </div>
              <div className="space-y-2">
                <Label>Longueur max (0 = illimité)</Label>
                <Input type="number" value={maxLength} onChange={(e) => setMaxLength(parseInt(e.target.value) || 0)} min={0} max={200} />
              </div>
              <div className="space-y-2">
                <Label>URL de base</Label>
                <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://example.com" />
              </div>
            </CardContent>
          </Card>

          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><History className="h-4 w-4" /> Historique</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {history.map((item, i) => (
                      <div key={i} className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => setInput(item.input)}>
                        <p className="text-xs text-muted-foreground truncate">{item.input}</p>
                        <p className="text-sm font-mono truncate">{item.slug}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
