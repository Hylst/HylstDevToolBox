import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ArrowRightLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const escapeTypes = [
  {
    id: "json",
    name: "JSON",
    escape: (s: string) => JSON.stringify(s).slice(1, -1),
    unescape: (s: string) => {
      try {
        return JSON.parse(`"${s}"`);
      } catch {
        return s;
      }
    },
  },
  {
    id: "html",
    name: "HTML Entities",
    escape: (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;"),
    unescape: (s: string) =>
      s
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/"),
  },
  {
    id: "url",
    name: "URL Encode",
    escape: (s: string) => encodeURIComponent(s),
    unescape: (s: string) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    },
  },
  {
    id: "base64",
    name: "Base64",
    escape: (s: string) => {
      try {
        return btoa(unescape(encodeURIComponent(s)));
      } catch {
        return btoa(s);
      }
    },
    unescape: (s: string) => {
      try {
        return decodeURIComponent(escape(atob(s)));
      } catch {
        try {
          return atob(s);
        } catch {
          return s;
        }
      }
    },
  },
  {
    id: "js",
    name: "JavaScript String",
    escape: (s: string) =>
      s
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t"),
    unescape: (s: string) =>
      s
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, "\\"),
  },
  {
    id: "sql",
    name: "SQL",
    escape: (s: string) => s.replace(/'/g, "''").replace(/\\/g, "\\\\"),
    unescape: (s: string) => s.replace(/''/g, "'").replace(/\\\\/g, "\\"),
  },
  {
    id: "csv",
    name: "CSV",
    escape: (s: string) => {
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    },
    unescape: (s: string) => {
      if (s.startsWith('"') && s.endsWith('"')) {
        return s.slice(1, -1).replace(/""/g, '"');
      }
      return s;
    },
  },
  {
    id: "regex",
    name: "Regex",
    escape: (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    unescape: (s: string) => s.replace(/\\([.*+?^${}()|[\]\\])/g, "$1"),
  },
];

export default function EscapeTool() {
  const [activeType, setActiveType] = useState("json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("escape");

  const currentType = escapeTypes.find((t) => t.id === activeType)!;

  const handleProcess = () => {
    try {
      const result = mode === "escape" 
        ? currentType.escape(input) 
        : currentType.unescape(input);
      setOutput(result);
      toast.success(mode === "escape" ? "Encodé !" : "Décodé !");
    } catch (e) {
      toast.error("Erreur lors du traitement");
    }
  };

  const handleSwap = () => {
    setInput(output);
    setOutput("");
    setMode(mode === "escape" ? "unescape" : "escape");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copié !");
  };

  const examples: Record<string, string> = {
    json: 'Hello "World"\nNew line here',
    html: '<script>alert("XSS")</script>',
    url: "Hello World! @#$%&",
    base64: "Données secrètes à encoder",
    js: 'var msg = "Hello\\nWorld";',
    sql: "O'Brien's Database",
    csv: 'Field with, comma and "quotes"',
    regex: "file.txt (copy) [2024]",
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Escape / Unescape Tool</h1>
          <p className="text-muted-foreground">Encodez et décodez différents formats</p>
        </div>
      </div>

      <Tabs value={activeType} onValueChange={setActiveType} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          {escapeTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id}>
              {type.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {escapeTypes.map((type) => (
          <TabsContent key={type.id} value={type.id} className="space-y-6">
            {/* Mode Toggle */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={mode === "escape" ? "default" : "outline"}
                    onClick={() => setMode("escape")}
                    className="flex-1 max-w-[200px]"
                  >
                    Encoder (Escape)
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleSwap}>
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={mode === "unescape" ? "default" : "outline"}
                    onClick={() => setMode("unescape")}
                    className="flex-1 max-w-[200px]"
                  >
                    Décoder (Unescape)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Editor */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {mode === "escape" ? "Texte original" : "Texte encodé"}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInput(examples[type.id] || "")}
                    >
                      Exemple
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Entrez votre texte ici..."
                    className="min-h-[250px] font-mono text-sm"
                  />
                  <Button onClick={handleProcess} className="w-full">
                    {mode === "escape" ? "Encoder →" : "Décoder →"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {mode === "escape" ? "Texte encodé" : "Texte décodé"}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!output}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={output}
                    readOnly
                    placeholder="Le résultat apparaîtra ici..."
                    className="min-h-[250px] font-mono text-sm bg-muted"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">
                  <strong>{type.name}</strong> :{" "}
                  {type.id === "json" && "Échappe les caractères spéciaux pour les chaînes JSON (guillemets, retours à la ligne, etc.)"}
                  {type.id === "html" && "Convertit les caractères spéciaux HTML en entités (&lt;, &gt;, &amp;, etc.)"}
                  {type.id === "url" && "Encode les caractères spéciaux pour les URLs (espaces → %20, etc.)"}
                  {type.id === "base64" && "Encode/décode en Base64 (supporte UTF-8)"}
                  {type.id === "js" && "Échappe les caractères pour les chaînes JavaScript"}
                  {type.id === "sql" && "Échappe les apostrophes pour les requêtes SQL (prévention injection)"}
                  {type.id === "csv" && "Échappe les champs CSV avec virgules ou guillemets"}
                  {type.id === "regex" && "Échappe les métacaractères des expressions régulières"}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
