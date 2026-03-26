import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, Wand2, Minimize2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Language = "json" | "javascript" | "css" | "html" | "sql" | "xml";

const SAMPLE_CODE: Record<Language, string> = {
  json: '{"name":"devtoolbox","version":"2.0.0","dependencies":{"react":"^18.3.1","typescript":"^5.0.0"},"scripts":{"dev":"vite","build":"vite build"}}',
  javascript: 'const fetchData=async(url,options={})=>{try{const response=await fetch(url,{method:"GET",headers:{"Content-Type":"application/json"},...options});if(!response.ok){throw new Error(`HTTP ${response.status}`)}const data=await response.json();return{success:true,data}}catch(error){console.error("Fetch failed:",error);return{success:false,error:error.message}}}',
  css: '.container{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;margin:0 auto;max-width:1200px}.container .header{font-size:2rem;font-weight:bold;color:#333;margin-bottom:1rem}.container .content{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 10px rgba(0,0,0,0.1)}',
  html: '<div class="app"><header class="header"><nav><ul><li><a href="/">Home</a></li><li><a href="/about">About</a></li></ul></nav></header><main><section class="hero"><h1>Welcome</h1><p>Lorem ipsum dolor sit amet</p></section></main><footer><p>&copy; 2026</p></footer></div>',
  sql: "SELECT u.id,u.name,u.email,COUNT(o.id) as order_count,SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE u.created_at>'2024-01-01' AND u.status='active' GROUP BY u.id,u.name,u.email HAVING COUNT(o.id)>5 ORDER BY total_spent DESC LIMIT 20",
  xml: '<?xml version="1.0" encoding="UTF-8"?><catalog><book id="1"><title>Clean Code</title><author>Robert C. Martin</author><year>2008</year><price>39.99</price></book><book id="2"><title>Design Patterns</title><author>GoF</author><year>1994</year><price>49.99</price></book></catalog>',
};

function detectLanguage(code: string): Language {
  const trimmed = code.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  if (trimmed.startsWith("<?xml") || (trimmed.startsWith("<") && trimmed.includes("/>"))) return "xml";
  if (trimmed.startsWith("<")) return "html";
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(trimmed)) return "sql";
  if (/[{};]/.test(trimmed) && /[.#@]?\w+\s*\{/.test(trimmed) && !/\b(const|let|var|function|=>)\b/.test(trimmed)) return "css";
  return "javascript";
}

function formatJSON(code: string, indent: number): string {
  return JSON.stringify(JSON.parse(code), null, indent);
}

function formatCSS(code: string, indent: number): string {
  const tab = " ".repeat(indent);
  let result = "";
  let depth = 0;
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (inString) {
      result += ch;
      if (ch === stringChar && code[i - 1] !== "\\") inString = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      result += ch;
    } else if (ch === "{") {
      result = result.trimEnd() + " {\n";
      depth++;
      result += tab.repeat(depth);
    } else if (ch === "}") {
      depth = Math.max(0, depth - 1);
      result = result.trimEnd() + "\n" + tab.repeat(depth) + "}\n\n" + tab.repeat(depth);
    } else if (ch === ";") {
      result += ";\n" + tab.repeat(depth);
    } else if (ch === "\n" || ch === "\r") {
      // skip
    } else {
      result += ch;
    }
  }
  return result.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+\n/g, "\n").trim();
}

function formatHTML(code: string, indent: number): string {
  const tab = " ".repeat(indent);
  const selfClosing = new Set(["br", "hr", "img", "input", "meta", "link", "area", "base", "col", "embed", "source", "track", "wbr"]);
  let result = "";
  let depth = 0;
  const regex = /(<\/?[^>]+\/?>)|([^<]+)/g;
  let match;

  while ((match = regex.exec(code)) !== null) {
    const token = match[0].trim();
    if (!token) continue;

    if (token.startsWith("</")) {
      depth = Math.max(0, depth - 1);
      result += tab.repeat(depth) + token + "\n";
    } else if (token.startsWith("<")) {
      result += tab.repeat(depth) + token + "\n";
      const tagName = token.match(/<(\w+)/)?.[1]?.toLowerCase();
      if (tagName && !selfClosing.has(tagName) && !token.endsWith("/>")) {
        depth++;
      }
    } else {
      result += tab.repeat(depth) + token + "\n";
    }
  }
  return result.trim();
}

function formatSQL(code: string): string {
  const keywords = ["SELECT", "FROM", "WHERE", "AND", "OR", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "JOIN", "ON", "GROUP BY", "HAVING", "ORDER BY", "LIMIT", "OFFSET", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE", "ALTER TABLE", "DROP TABLE"];
  let result = code.trim();
  
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    result = result.replace(regex, `\n${kw.toUpperCase()}`);
  });
  
  result = result.replace(/,\s*/g, ",\n  ");
  return result.trim();
}

function formatXML(code: string, indent: number): string {
  const tab = " ".repeat(indent);
  let result = "";
  let depth = 0;
  const tokens = code.replace(/>\s*</g, ">\n<").split("\n");

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("</")) {
      depth = Math.max(0, depth - 1);
      result += tab.repeat(depth) + trimmed + "\n";
    } else if (trimmed.startsWith("<?")) {
      result += trimmed + "\n";
    } else if (trimmed.endsWith("/>")) {
      result += tab.repeat(depth) + trimmed + "\n";
    } else if (trimmed.startsWith("<") && !trimmed.startsWith("</")) {
      result += tab.repeat(depth) + trimmed + "\n";
      depth++;
    } else {
      result += tab.repeat(depth) + trimmed + "\n";
    }
  }
  return result.trim();
}

function formatJS(code: string, indent: number, useSemicolons: boolean): string {
  const tab = " ".repeat(indent);
  let result = "";
  let depth = 0;
  let inString = false;
  let stringChar = "";
  let inTemplate = false;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];

    if (inString) {
      result += ch;
      if (ch === stringChar && code[i - 1] !== "\\") inString = false;
      continue;
    }
    if (inTemplate) {
      result += ch;
      if (ch === "`" && code[i - 1] !== "\\") inTemplate = false;
      continue;
    }

    if (ch === '"' || ch === "'") { inString = true; stringChar = ch; result += ch; }
    else if (ch === "`") { inTemplate = true; result += ch; }
    else if (ch === "{") { result += " {\n" + tab.repeat(++depth); }
    else if (ch === "}") { depth = Math.max(0, depth - 1); result = result.trimEnd() + "\n" + tab.repeat(depth) + "}"; }
    else if (ch === ";") { result += (useSemicolons ? ";" : "") + "\n" + tab.repeat(depth); }
    else if (ch === "," && depth > 0) { result += ",\n" + tab.repeat(depth); }
    else if (ch === "\n" || ch === "\r") { /* skip */ }
    else { result += ch; }
  }
  return result.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+\n/g, "\n").trim();
}

function minifyCode(code: string, lang: Language): string {
  switch (lang) {
    case "json": return JSON.stringify(JSON.parse(code));
    case "css": return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s*([{}:;,])\s*/g, "$1").replace(/;\}/g, "}").trim();
    case "html": return code.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
    case "sql": return code.replace(/\s+/g, " ").trim();
    case "xml": return code.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
    default: return code.replace(/\s+/g, " ").replace(/\s*([{}();,=+\-*/<>!&|?:])\s*/g, "$1").trim();
  }
}

export default function CodeFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState<Language>("json");
  const [indentSize, setIndentSize] = useState(2);
  const [useSemicolons, setUseSemicolons] = useState(true);
  const [autoDetect, setAutoDetect] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    setError("");
    const lang = autoDetect ? detectLanguage(input) : language;
    if (autoDetect) setLanguage(lang);

    try {
      let formatted: string;
      switch (lang) {
        case "json": formatted = formatJSON(input, indentSize); break;
        case "css": formatted = formatCSS(input, indentSize); break;
        case "html": formatted = formatHTML(input, indentSize); break;
        case "sql": formatted = formatSQL(input); break;
        case "xml": formatted = formatXML(input, indentSize); break;
        default: formatted = formatJS(input, indentSize, useSemicolons); break;
      }
      setOutput(formatted);
    } catch (e: any) {
      setError(e.message || "Erreur de formatage");
    }
  }, [input, language, indentSize, useSemicolons, autoDetect]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    setError("");
    const lang = autoDetect ? detectLanguage(input) : language;
    if (autoDetect) setLanguage(lang);
    try {
      setOutput(minifyCode(input, lang));
    } catch (e: any) {
      setError(e.message || "Erreur de minification");
    }
  }, [input, language, autoDetect]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copié !" });
  };

  const loadSample = (lang: Language) => {
    setLanguage(lang);
    setAutoDetect(false);
    setInput(SAMPLE_CODE[lang]);
    setOutput("");
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Code Formatter</h1>
        <p className="text-muted-foreground">
          Formatage et minification universels — JS/TS, JSON, CSS, HTML, SQL, XML avec détection automatique.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Options panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="autodetect">Auto-détection</Label>
              <Switch id="autodetect" checked={autoDetect} onCheckedChange={setAutoDetect} />
            </div>

            <div className="space-y-2">
              <Label>Langage</Label>
              <Select value={language} onValueChange={(v) => { setLanguage(v as Language); setAutoDetect(false); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="javascript">JavaScript / TS</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Indentation</Label>
              <Select value={String(indentSize)} onValueChange={(v) => setIndentSize(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 espaces</SelectItem>
                  <SelectItem value="4">4 espaces</SelectItem>
                  <SelectItem value="1">1 tab</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {language === "javascript" && (
              <div className="flex items-center justify-between">
                <Label htmlFor="semicolons">Points-virgules</Label>
                <Switch id="semicolons" checked={useSemicolons} onCheckedChange={setUseSemicolons} />
              </div>
            )}

            <div className="space-y-2">
              <Label>Exemples</Label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(SAMPLE_CODE) as Language[]).map((lang) => (
                  <Badge
                    key={lang}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => loadSample(lang)}
                  >
                    {lang.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleFormat} className="flex-1">
                <Wand2 className="h-4 w-4 mr-1" /> Formatter
              </Button>
              <Button onClick={handleMinify} variant="outline" className="flex-1">
                <Minimize2 className="h-4 w-4 mr-1" /> Minifier
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Editor panel */}
        <div className="lg:col-span-3 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Tabs defaultValue="split" className="w-full">
            <TabsList>
              <TabsTrigger value="split">Split</TabsTrigger>
              <TabsTrigger value="input">Entrée</TabsTrigger>
              <TabsTrigger value="output">Sortie</TabsTrigger>
            </TabsList>

            <TabsContent value="split" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Entrée</Label>
                    {autoDetect && input && (
                      <Badge variant="secondary" className="text-xs">
                        Détecté : {detectLanguage(input).toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Collez votre code ici..."
                    className="font-mono text-sm min-h-[400px] resize-y"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Sortie</Label>
                    {output && (
                      <Button variant="ghost" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        {copied ? "Copié" : "Copier"}
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={output}
                    readOnly
                    placeholder="Le code formaté apparaîtra ici..."
                    className="font-mono text-sm min-h-[400px] resize-y bg-muted/30"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="input" className="mt-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Collez votre code ici..."
                className="font-mono text-sm min-h-[500px] resize-y"
              />
            </TabsContent>

            <TabsContent value="output" className="mt-4 space-y-2">
              <div className="flex justify-end">
                {output && (
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copied ? "Copié" : "Copier"}
                  </Button>
                )}
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder="Le code formaté apparaîtra ici..."
                className="font-mono text-sm min-h-[500px] resize-y bg-muted/30"
              />
            </TabsContent>
          </Tabs>

          {output && (
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Entrée : {input.length} caractères</span>
              <span>Sortie : {output.length} caractères</span>
              <span>
                {output.length < input.length
                  ? `−${((1 - output.length / input.length) * 100).toFixed(1)}%`
                  : `+${((output.length / input.length - 1) * 100).toFixed(1)}%`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
