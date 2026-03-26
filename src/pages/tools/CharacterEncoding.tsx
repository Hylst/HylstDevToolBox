import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FileText, Copy, ArrowRightLeft, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";

const htmlEntities: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'",
  "&nbsp;": " ", "&copy;": "©", "&reg;": "®", "&trade;": "™",
  "&euro;": "€", "&pound;": "£", "&yen;": "¥", "&cent;": "¢",
  "&mdash;": "—", "&ndash;": "–", "&laquo;": "«", "&raquo;": "»",
  "&bull;": "•", "&hellip;": "…", "&times;": "×", "&divide;": "÷",
};

// Common mojibake patterns
const mojibakePatterns = [
  { broken: "Ã©", fixed: "é", desc: "UTF-8 lu comme Latin-1" },
  { broken: "Ã¨", fixed: "è", desc: "UTF-8 lu comme Latin-1" },
  { broken: "Ã ", fixed: "à", desc: "UTF-8 lu comme Latin-1" },
  { broken: "Ã¢", fixed: "â", desc: "UTF-8 lu comme Latin-1" },
  { broken: "Ã®", fixed: "î", desc: "UTF-8 lu comme Latin-1" },
  { broken: "Ã´", fixed: "ô", desc: "UTF-8 lu comme Latin-1" },
  { broken: "Ã¹", fixed: "ù", desc: "UTF-8 lu comme Latin-1" },
  { broken: "Ã§", fixed: "ç", desc: "UTF-8 lu comme Latin-1" },
  { broken: "Ã«", fixed: "ë", desc: "UTF-8 lu comme Latin-1" },
  { broken: "Ã¼", fixed: "ü", desc: "UTF-8 lu comme Latin-1" },
  { broken: "Ã¶", fixed: "ö", desc: "UTF-8 lu comme Latin-1" },
  { broken: "Ã¤", fixed: "ä", desc: "UTF-8 lu comme Latin-1" },
  { broken: "\u00E2\u0080\u0099", fixed: "\u2019", desc: "Guillemet intelligent corrompu" },
  { broken: "\u00E2\u0080\u009C", fixed: "\u201C", desc: "Guillemet ouvrant corrompu" },
  { broken: "\u00E2\u0080\u009D", fixed: "\u201D", desc: "Guillemet fermant corrompu" },
  { broken: "\u00E2\u0080\u0094", fixed: "\u2014", desc: "Tiret cadratin corrompu" },
  { broken: "\u00C2\u00A0", fixed: " ", desc: "Espace insecable mal encode" },
];

function detectEncoding(text: string): string[] {
  const issues: string[] = [];
  if (/[\x80-\x9F]/.test(text)) issues.push("Caractères de contrôle Windows-1252 détectés");
  for (const p of mojibakePatterns) {
    if (text.includes(p.broken)) issues.push(`Mojibake détecté : "${p.broken}" → "${p.fixed}" (${p.desc})`);
  }
  if (/\u00C3[\u0080-\u00BF]/.test(text)) issues.push("Pattern UTF-8 interprété comme Latin-1 (ISO-8859-1)");
  if (text.includes("\uFFFD")) issues.push("Caractères de remplacement Unicode (U+FFFD) trouvés");
  if (text.includes("\xEF\xBB\xBF") || text.charCodeAt(0) === 0xFEFF) issues.push("BOM (Byte Order Mark) UTF-8 détecté");
  if (issues.length === 0) issues.push("Aucun problème d'encodage détecté ✓");
  return issues;
}

function fixMojibake(text: string): string {
  let result = text;
  for (const p of mojibakePatterns) {
    result = result.split(p.broken).join(p.fixed);
  }
  result = result.replace(/Â /g, " ");
  return result;
}

function textToCodePoints(text: string): string {
  return [...text].map(ch => {
    const cp = ch.codePointAt(0)!;
    return cp > 127 ? `U+${cp.toString(16).toUpperCase().padStart(4, "0")}` : ch;
  }).join(" ");
}

function encodeUrl(text: string): string { return encodeURIComponent(text); }
function decodeUrl(text: string): string { try { return decodeURIComponent(text); } catch { return text; } }
function encodeHtmlEntities(text: string): string {
  return text.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[ch] || ch));
}
function decodeHtmlEntities(text: string): string {
  let result = text;
  for (const [entity, char] of Object.entries(htmlEntities)) {
    result = result.split(entity).join(char);
  }
  return result.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

export default function CharacterEncoding() {
  const [input, setInput] = useState("Bonjour, ça va ? C'est l'été !");
  const [searchEntity, setSearchEntity] = useState("");

  const issues = useMemo(() => detectEncoding(input), [input]);
  const fixed = useMemo(() => fixMojibake(input), [input]);
  const codePoints = useMemo(() => textToCodePoints(input), [input]);
  const urlEncoded = useMemo(() => encodeUrl(input), [input]);
  const htmlEncoded = useMemo(() => encodeHtmlEntities(input), [input]);

  const filteredEntities = useMemo(() => {
    const entries = Object.entries(htmlEntities);
    if (!searchEntity) return entries;
    return entries.filter(([k, v]) => k.includes(searchEntity) || v.includes(searchEntity));
  }, [searchEntity]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FileText className="h-8 w-8 text-primary" />Encodage de Caractères
      </h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Entrez votre texte..." rows={4} className="font-mono" />
        </CardContent>
      </Card>

      <Tabs defaultValue="detect" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="detect">Détection</TabsTrigger>
          <TabsTrigger value="convert">Conversion</TabsTrigger>
          <TabsTrigger value="entities">Entités HTML</TabsTrigger>
          <TabsTrigger value="mojibake">Mojibake</TabsTrigger>
        </TabsList>

        <TabsContent value="detect" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Diagnostic</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {issue.includes("✓") ? (
                    <Badge variant="secondary" className="text-xs">OK</Badge>
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  )}
                  <span>{issue}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Code Points Unicode</CardTitle></CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs break-all max-h-40 overflow-auto">{codePoints}</div>
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => copy(codePoints, "Code points")}><Copy className="h-4 w-4 mr-1" />Copier</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Statistiques</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-2xl font-bold">{input.length}</div><div className="text-xs text-muted-foreground">Caractères</div></div>
                <div><div className="text-2xl font-bold">{new Blob([input]).size}</div><div className="text-xs text-muted-foreground">Octets (UTF-8)</div></div>
                <div><div className="text-2xl font-bold">{[...input].filter(c => c.codePointAt(0)! > 127).length}</div><div className="text-xs text-muted-foreground">Non-ASCII</div></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convert" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">URL Encode</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs break-all">{urlEncoded}</div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" onClick={() => copy(urlEncoded, "URL encodé")}><Copy className="h-4 w-4 mr-1" />Copier</Button>
                  <Button size="sm" variant="ghost" onClick={() => setInput(decodeUrl(input))}><ArrowRightLeft className="h-4 w-4 mr-1" />Décoder</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Entités HTML</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs break-all">{htmlEncoded}</div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" onClick={() => copy(htmlEncoded, "HTML encodé")}><Copy className="h-4 w-4 mr-1" />Copier</Button>
                  <Button size="sm" variant="ghost" onClick={() => setInput(decodeHtmlEntities(input))}><ArrowRightLeft className="h-4 w-4 mr-1" />Décoder</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Base64</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs break-all">{btoa(unescape(encodeURIComponent(input)))}</div>
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => copy(btoa(unescape(encodeURIComponent(input))), "Base64")}><Copy className="h-4 w-4 mr-1" />Copier</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Hex</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs break-all">
                  {[...new TextEncoder().encode(input)].map(b => b.toString(16).padStart(2, "0")).join(" ")}
                </div>
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => copy([...new TextEncoder().encode(input)].map(b => b.toString(16).padStart(2, "0")).join(" "), "Hex")}><Copy className="h-4 w-4 mr-1" />Copier</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entities">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Table des entités HTML</CardTitle>
                <div className="flex-1" />
                <div className="relative w-48">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={searchEntity} onChange={e => setSearchEntity(e.target.value)} placeholder="Rechercher..." className="pl-8 h-8 text-sm" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-96 overflow-auto">
                {filteredEntities.map(([entity, char]) => (
                  <div
                    key={entity}
                    className="flex items-center gap-2 p-2 rounded border border-border/50 hover:bg-muted/50 cursor-pointer"
                    onClick={() => { navigator.clipboard.writeText(entity); toast.success(`${entity} copié`); }}
                  >
                    <span className="text-2xl w-8 text-center">{char}</span>
                    <code className="text-xs text-muted-foreground">{entity}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mojibake" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Correcteur de Mojibake</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Texte corrigé</Label>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm">{fixed}</div>
              </div>
              {fixed !== input && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setInput(fixed)}>Appliquer la correction</Button>
                  <Button size="sm" variant="ghost" onClick={() => copy(fixed, "Texte corrigé")}><Copy className="h-4 w-4 mr-1" />Copier</Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Patterns de mojibake connus</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-2 text-muted-foreground">Cassé</th>
                    <th className="text-left p-2 text-muted-foreground">Correct</th>
                    <th className="text-left p-2 text-muted-foreground">Cause</th>
                  </tr></thead>
                  <tbody>
                    {mojibakePatterns.slice(0, 12).map((p, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="p-2 font-mono text-destructive">{p.broken}</td>
                        <td className="p-2 font-mono">{p.fixed}</td>
                        <td className="p-2 text-xs text-muted-foreground">{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
