import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Search, Copy, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RegexItem {
  pattern: string;
  description: string;
  example: string;
  matches: string;
}

const categories: { label: string; items: RegexItem[] }[] = [
  {
    label: "Ancres",
    items: [
      { pattern: "^", description: "Début de ligne", example: "^Hello", matches: "Hello world" },
      { pattern: "$", description: "Fin de ligne", example: "world$", matches: "Hello world" },
      { pattern: "\\b", description: "Limite de mot", example: "\\bcat\\b", matches: "the cat sat" },
      { pattern: "\\B", description: "Non-limite de mot", example: "\\Bcat\\B", matches: "concatenate" },
    ],
  },
  {
    label: "Classes de caractères",
    items: [
      { pattern: ".", description: "Tout caractère sauf newline", example: "h.t", matches: "hat hot hut" },
      { pattern: "\\d", description: "Chiffre [0-9]", example: "\\d+", matches: "abc 123 def" },
      { pattern: "\\D", description: "Non-chiffre [^0-9]", example: "\\D+", matches: "abc 123 def" },
      { pattern: "\\w", description: "Mot [a-zA-Z0-9_]", example: "\\w+", matches: "hello_world 42" },
      { pattern: "\\W", description: "Non-mot", example: "\\W+", matches: "hello world!" },
      { pattern: "\\s", description: "Espace blanc", example: "\\s+", matches: "hello   world" },
      { pattern: "\\S", description: "Non-espace", example: "\\S+", matches: "hello   world" },
      { pattern: "[abc]", description: "Un de a, b ou c", example: "[aeiou]", matches: "hello world" },
      { pattern: "[^abc]", description: "Pas a, b ni c", example: "[^aeiou]", matches: "hello world" },
      { pattern: "[a-z]", description: "Plage a à z", example: "[A-Z]", matches: "Hello World" },
    ],
  },
  {
    label: "Quantificateurs",
    items: [
      { pattern: "*", description: "0 ou plus (greedy)", example: "ab*c", matches: "ac abc abbc" },
      { pattern: "+", description: "1 ou plus (greedy)", example: "ab+c", matches: "ac abc abbc" },
      { pattern: "?", description: "0 ou 1 (optionnel)", example: "colou?r", matches: "color colour" },
      { pattern: "{n}", description: "Exactement n fois", example: "\\d{3}", matches: "12 123 1234" },
      { pattern: "{n,}", description: "Au moins n fois", example: "\\d{2,}", matches: "1 12 123 1234" },
      { pattern: "{n,m}", description: "Entre n et m fois", example: "\\d{2,3}", matches: "1 12 123 1234" },
      { pattern: "*?", description: "0 ou plus (lazy)", example: "<.*?>", matches: "<b>bold</b>" },
      { pattern: "+?", description: "1 ou plus (lazy)", example: "a+?", matches: "aaa" },
    ],
  },
  {
    label: "Groupes et références",
    items: [
      { pattern: "(abc)", description: "Groupe de capture", example: "(\\w+)@(\\w+)", matches: "user@host" },
      { pattern: "(?:abc)", description: "Groupe non-capturant", example: "(?:ab)+", matches: "ababab" },
      { pattern: "(?<name>)", description: "Groupe nommé", example: "(?<year>\\d{4})", matches: "2024-01-15" },
      { pattern: "\\1", description: "Référence arrière", example: "(\\w+) \\1", matches: "hello hello world" },
      { pattern: "(?=abc)", description: "Lookahead positif", example: "\\d+(?= euros)", matches: "100 euros 50 dollars" },
      { pattern: "(?!abc)", description: "Lookahead négatif", example: "\\d+(?! euros)", matches: "100 euros 50 dollars" },
      { pattern: "(?<=abc)", description: "Lookbehind positif", example: "(?<=\\$)\\d+", matches: "$100 200" },
      { pattern: "(?<!abc)", description: "Lookbehind négatif", example: "(?<!\\$)\\d+", matches: "$100 200" },
    ],
  },
  {
    label: "Alternation et spéciaux",
    items: [
      { pattern: "|", description: "OU logique", example: "cat|dog", matches: "I have a cat and a dog" },
      { pattern: "\\n", description: "Saut de ligne", example: "\\n", matches: "line1\\nline2" },
      { pattern: "\\t", description: "Tabulation", example: "\\t", matches: "col1\\tcol2" },
      { pattern: "\\\\", description: "Backslash littéral", example: "\\\\", matches: "C:\\path" },
    ],
  },
  {
    label: "Flags",
    items: [
      { pattern: "g", description: "Global - toutes les occurrences", example: "/hello/g", matches: "hello hello hello" },
      { pattern: "i", description: "Insensible à la casse", example: "/hello/i", matches: "Hello HELLO" },
      { pattern: "m", description: "Multiligne (^ et $ par ligne)", example: "/^hello/m", matches: "hello\\nworld\\nhello" },
      { pattern: "s", description: "Dotall (. inclut \\n)", example: "/a.b/s", matches: "a\\nb" },
      { pattern: "u", description: "Unicode complet", example: "/\\u{1F600}/u", matches: "emoji test" },
    ],
  },
];

function testRegex(pattern: string, text: string): { matches: string[]; indices: [number, number][] } {
  try {
    const regex = new RegExp(pattern, "g");
    const matches: string[] = [];
    const indices: [number, number][] = [];
    let m;
    while ((m = regex.exec(text)) !== null) {
      matches.push(m[0]);
      indices.push([m.index, m.index + m[0].length]);
      if (!m[0].length) regex.lastIndex++;
    }
    return { matches, indices };
  } catch {
    return { matches: [], indices: [] };
  }
}

function highlightMatches(text: string, indices: [number, number][]): React.ReactNode[] {
  if (indices.length === 0) return [text];
  const parts: React.ReactNode[] = [];
  let last = 0;
  indices.forEach(([start, end], i) => {
    if (start > last) parts.push(text.slice(last, start));
    parts.push(<mark key={i} className="bg-primary/30 rounded px-0.5">{text.slice(start, end)}</mark>);
    last = end;
  });
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function RegexCheatsheet() {
  const [search, setSearch] = useState("");
  const [testPattern, setTestPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [testText, setTestText] = useState("Contact: user@email.com or admin@site.org for info");

  const filteredCats = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.map(c => ({
      ...c,
      items: c.items.filter(i => i.pattern.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)),
    })).filter(c => c.items.length > 0);
  }, [search]);

  const testResult = useMemo(() => testRegex(testPattern, testText), [testPattern, testText]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Code className="h-8 w-8 text-primary" />Regex Cheatsheet
      </h1>

      <Tabs defaultValue="reference" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reference">Référence</TabsTrigger>
          <TabsTrigger value="playground">Playground</TabsTrigger>
        </TabsList>

        <TabsContent value="reference" className="space-y-4">
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un pattern ou une description..." className="pl-10" />
              </div>
            </CardContent>
          </Card>

          {filteredCats.map(cat => (
            <Card key={cat.label}>
              <CardHeader><CardTitle className="text-sm">{cat.label}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cat.items.map((item, i) => {
                    const result = testRegex(item.example.replace(/^\/|\/[gimsuy]*$/g, ""), item.matches.replace(/\\n/g, "\n").replace(/\\t/g, "\t"));
                    return (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                        <code className="font-mono text-primary font-bold min-w-[80px] cursor-pointer" onClick={() => { navigator.clipboard.writeText(item.pattern); toast.success("Copié !"); }}>
                          {item.pattern}
                        </code>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{item.example}</code>
                            <span className="text-xs text-muted-foreground">→</span>
                            <span className="text-xs font-mono">
                              {highlightMatches(item.matches.replace(/\\n/g, "\n").replace(/\\t/g, "\t"), result.indices)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">{result.matches.length} match{result.matches.length !== 1 ? "es" : ""}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="playground" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Tester une expression</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Pattern</label>
                <Input value={testPattern} onChange={e => setTestPattern(e.target.value)} className="font-mono" placeholder="\\d+" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Texte de test</label>
                <Input value={testText} onChange={e => setTestText(e.target.value)} className="font-mono" />
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-mono">{highlightMatches(testText, testResult.indices)}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{testResult.matches.length} match{testResult.matches.length !== 1 ? "es" : ""}</Badge>
                {testResult.matches.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {testResult.matches.map((m, i) => (
                      <code key={i} className="text-xs bg-primary/10 px-2 py-0.5 rounded">"{m}"</code>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Patterns courants</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-2">
              {[
                { label: "Email", pattern: "[\\w.-]+@[\\w.-]+\\.\\w{2,}" },
                { label: "URL", pattern: "https?://[\\w.-]+(?:/[\\w.-]*)?" },
                { label: "IPv4", pattern: "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}" },
                { label: "Date FR", pattern: "\\d{2}/\\d{2}/\\d{4}" },
                { label: "Hex Color", pattern: "#[0-9a-fA-F]{3,8}" },
                { label: "Phone FR", pattern: "(?:0|\\+33)[1-9](?:[\\s.-]?\\d{2}){4}" },
              ].map(p => (
                <Button key={p.label} variant="outline" size="sm" className="justify-start font-mono text-xs" onClick={() => setTestPattern(p.pattern)}>
                  <Play className="h-3 w-3 mr-2 shrink-0" />{p.label}: {p.pattern}
                </Button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
