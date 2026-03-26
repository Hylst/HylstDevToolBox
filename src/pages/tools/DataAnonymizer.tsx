import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Copy, RefreshCw, Download, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

// Fake data pools for realistic replacement
const fakeFirstNames = ["Marie", "Pierre", "Sophie", "Lucas", "Emma", "Louis", "Chloé", "Hugo", "Léa", "Thomas", "Julie", "Antoine"];
const fakeLastNames = ["Martin", "Bernard", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Garcia", "Roux"];
const fakeDomains = ["example.com", "test.org", "demo.net", "sample.fr", "mail.test"];
const fakeCities = ["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Lille", "Nantes", "Strasbourg"];
const fakeStreets = ["rue de la Paix", "avenue des Champs", "boulevard Saint-Michel", "rue du Commerce", "place de la République"];

let seedCounter = 0;
const seededRandom = () => {
  seedCounter = (seedCounter * 1103515245 + 12345) & 0x7fffffff;
  return seedCounter / 0x7fffffff;
};
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface Pattern {
  name: string;
  category: string;
  regex: RegExp;
  mask: string;
  fakeFn: () => string;
  enabled: boolean;
}

const defaultPatterns: Pattern[] = [
  {
    name: "Email",
    category: "Contact",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    mask: "***@***.com",
    fakeFn: () => `${pick(fakeFirstNames).toLowerCase()}.${pick(fakeLastNames).toLowerCase()}@${pick(fakeDomains)}`,
    enabled: true,
  },
  {
    name: "Téléphone FR",
    category: "Contact",
    regex: /(\+33|0)[1-9](\s?\d{2}){4}/g,
    mask: "** ** ** ** **",
    fakeFn: () => `0${Math.floor(Math.random() * 9) + 1} ${String(Math.floor(Math.random() * 100)).padStart(2, "0")} ${String(Math.floor(Math.random() * 100)).padStart(2, "0")} ${String(Math.floor(Math.random() * 100)).padStart(2, "0")} ${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`,
    enabled: true,
  },
  {
    name: "Téléphone INT",
    category: "Contact",
    regex: /\+\d{1,3}[\s-]?\d{1,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/g,
    mask: "+** *** *** ***",
    fakeFn: () => `+${Math.floor(Math.random() * 99) + 1} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
    enabled: true,
  },
  {
    name: "Carte bancaire",
    category: "Financier",
    regex: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
    mask: "**** **** **** ****",
    fakeFn: () => `${Math.floor(Math.random() * 9000) + 1000} **** **** ${Math.floor(Math.random() * 9000) + 1000}`,
    enabled: true,
  },
  {
    name: "IBAN",
    category: "Financier",
    regex: /[A-Z]{2}\d{2}[\s]?[A-Z0-9]{4}[\s]?\d{4}[\s]?\d{4}[\s]?\d{4}[\s]?\d{4}[\s]?\d{0,3}/g,
    mask: "FR** **** **** **** **** ***",
    fakeFn: () => `FR${String(Math.floor(Math.random() * 100)).padStart(2, "0")} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    enabled: true,
  },
  {
    name: "Adresse IP",
    category: "Technique",
    regex: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g,
    mask: "***.***.***.***",
    fakeFn: () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    enabled: true,
  },
  {
    name: "IPv6",
    category: "Technique",
    regex: /([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/g,
    mask: "****:****:****:****:****:****:****:****",
    fakeFn: () => Array(8).fill(0).map(() => Math.floor(Math.random() * 65535).toString(16).padStart(4, "0")).join(":"),
    enabled: true,
  },
  {
    name: "Numéro Sécu (NIR)",
    category: "Identité",
    regex: /[12]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}/g,
    mask: "* ** ** ** *** *** **",
    fakeFn: () => `${Math.random() > 0.5 ? 1 : 2} ${String(Math.floor(Math.random() * 100)).padStart(2, "0")} ${String(Math.floor(Math.random() * 13) + 1).padStart(2, "0")} ${String(Math.floor(Math.random() * 100)).padStart(2, "0")} ${String(Math.floor(Math.random() * 1000)).padStart(3, "0")} ${String(Math.floor(Math.random() * 1000)).padStart(3, "0")} ${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`,
    enabled: true,
  },
  {
    name: "Date de naissance",
    category: "Identité",
    regex: /\b(0[1-9]|[12]\d|3[01])[\/\-](0[1-9]|1[0-2])[\/\-](19|20)\d{2}\b/g,
    mask: "**/**/****",
    fakeFn: () => `${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${Math.floor(Math.random() * 50) + 1960}`,
    enabled: true,
  },
  {
    name: "Adresse postale",
    category: "Contact",
    regex: /\d{1,4}\s+(rue|avenue|boulevard|place|chemin|impasse|allée)\s+[A-Za-zÀ-ÿ\s-]+/gi,
    mask: "*** [adresse masquée]",
    fakeFn: () => `${Math.floor(Math.random() * 200) + 1} ${pick(fakeStreets)}`,
    enabled: true,
  },
  {
    name: "Code postal FR",
    category: "Contact",
    regex: /\b[0-9]{5}\b/g,
    mask: "*****",
    fakeFn: () => `${String(Math.floor(Math.random() * 96) + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    enabled: false, // Trop de faux positifs par défaut
  },
  {
    name: "URL",
    category: "Technique",
    regex: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g,
    mask: "https://[url-masked].com",
    fakeFn: () => `https://example-${Math.floor(Math.random() * 9999)}.com/page`,
    enabled: false,
  },
  {
    name: "MAC Address",
    category: "Technique",
    regex: /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/g,
    mask: "**:**:**:**:**:**",
    fakeFn: () => Array(6).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join(":"),
    enabled: true,
  },
];

const sampleInput = `Fiche client #12345
Nom: Jean Dupont
Email: jean.dupont@gmail.com
Tél: 06 12 34 56 78
Né le: 15/03/1985
NIR: 1 85 03 75 123 456 78
Adresse: 42 rue de la Paix
IP de connexion: 192.168.1.100
CB: 4532 1234 5678 9012
IBAN: FR76 3000 6000 0112 3456 7890 189
MAC: AA:BB:CC:DD:EE:FF`;

export default function DataAnonymizer() {
  const [input, setInput] = useState(sampleInput);
  const [patterns, setPatterns] = useState(defaultPatterns);
  const [mode, setMode] = useState<"mask" | "fake">("fake");
  const [showOriginal, setShowOriginal] = useState(true);

  const togglePattern = (i: number) => {
    setPatterns(patterns.map((p, j) => j === i ? { ...p, enabled: !p.enabled } : p));
  };

  const detected = useMemo(() => {
    return patterns.map(p => ({
      ...p,
      matches: p.enabled ? (input.match(p.regex) || []) : [],
    }));
  }, [input, patterns]);

  const totalDetected = detected.reduce((s, d) => s + d.matches.length, 0);

  const anonymize = useMemo(() => {
    let result = input;
    const enabledPatterns = patterns.filter(p => p.enabled);
    
    // Sort by match length (longest first) to avoid partial replacements
    for (const p of enabledPatterns) {
      result = result.replace(p.regex, () => mode === "fake" ? p.fakeFn() : p.mask);
    }
    return result;
  }, [input, patterns, mode]);

  const copy = () => { navigator.clipboard.writeText(anonymize); toast.success("Données anonymisées copiées !"); };
  const download = () => {
    const blob = new Blob([anonymize], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "anonymized-data.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé");
  };

  const categories = [...new Set(patterns.map(p => p.category))];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Shield className="h-8 w-8 text-primary" />
        Data Anonymizer
      </h1>

      {/* Stats bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              {detected.filter(d => d.matches.length > 0).map(d => (
                <Badge key={d.name} variant="destructive" className="text-sm">
                  {d.name}: {d.matches.length}
                </Badge>
              ))}
              {totalDetected === 0 && (
                <span className="text-muted-foreground text-sm">Aucune donnée sensible détectée</span>
              )}
            </div>
            <Badge variant="outline" className="text-sm">
              {totalDetected} élément(s) détecté(s) • {patterns.filter(p => p.enabled).length}/{patterns.length} règles actives
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patterns config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Règles de détection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-sm">Mode d'anonymisation</Label>
              <div className="flex gap-2">
                <Button size="sm" variant={mode === "fake" ? "default" : "outline"} onClick={() => setMode("fake")} className="flex-1">
                  Données réalistes
                </Button>
                <Button size="sm" variant={mode === "mask" ? "default" : "outline"} onClick={() => setMode("mask")} className="flex-1">
                  Masquage (****)
                </Button>
              </div>
            </div>

            {categories.map(cat => (
              <div key={cat}>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{cat}</p>
                <div className="space-y-1">
                  {patterns.map((p, i) => {
                    if (p.category !== cat) return null;
                    const matchCount = detected[i]?.matches.length || 0;
                    return (
                      <div key={p.name} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Switch checked={p.enabled} onCheckedChange={() => togglePattern(i)} />
                          <span className="text-sm">{p.name}</span>
                        </div>
                        {matchCount > 0 && (
                          <Badge variant="secondary" className="text-xs">{matchCount}</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Input / Output */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="side-by-side">
            <TabsList>
              <TabsTrigger value="side-by-side">Côte à côte</TabsTrigger>
              <TabsTrigger value="result-only">Résultat seul</TabsTrigger>
            </TabsList>

            <TabsContent value="side-by-side">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-4 w-4" /> Données originales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea value={input} onChange={e => setInput(e.target.value)} rows={16} className="font-mono text-sm" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 flex-row justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2">
                      <EyeOff className="h-4 w-4" /> Données anonymisées
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={copy}><Copy className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={download}><Download className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-3 rounded-lg overflow-auto text-sm h-[380px] whitespace-pre-wrap font-mono">
                      {anonymize}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="result-only">
              <Card>
                <CardHeader className="flex-row justify-between items-center">
                  <CardTitle>Résultat anonymisé</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copy}><Copy className="h-4 w-4 mr-1" /> Copier</Button>
                    <Button size="sm" onClick={download}><Download className="h-4 w-4 mr-1" /> Télécharger</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea value={input} onChange={e => setInput(e.target.value)} rows={8} className="font-mono text-sm mb-4" placeholder="Collez vos données ici..." />
                  <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-[400px] whitespace-pre-wrap font-mono">
                    {anonymize}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Matched details */}
          {totalDetected > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Détails des détections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detected.filter(d => d.matches.length > 0).map(d => (
                    <div key={d.name} className="flex items-start gap-3 p-2 bg-muted/50 rounded">
                      <Badge variant="destructive" className="text-xs mt-0.5">{d.name}</Badge>
                      <div className="flex flex-wrap gap-1">
                        {d.matches.map((m, i) => (
                          <code key={i} className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                            {m}
                          </code>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
