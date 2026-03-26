import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip } from "@/components/Tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, Replace, Play, BookOpen, Lightbulb, Code, Bug, Layers, FileText, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ToolPageLayout } from "@/components/ToolPageLayout";

const patternCategories = [
  {
    category: "Validation",
    patterns: [
      { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g", description: "Adresses email valides" },
      { name: "URL", pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)", flags: "gi", description: "URLs HTTP/HTTPS" },
      { name: "Téléphone FR", pattern: "(?:(?:\\+|00)33|0)\\s*[1-9](?:[\\s.-]*\\d{2}){4}", flags: "g", description: "Numéros français" },
      { name: "Téléphone US", pattern: "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}", flags: "g", description: "Format US (xxx) xxx-xxxx" },
      { name: "Code postal FR", pattern: "\\b(?:0[1-9]|[1-8]\\d|9[0-5])\\d{3}\\b", flags: "g", description: "Codes postaux français" },
      { name: "Code postal US", pattern: "\\b\\d{5}(?:-\\d{4})?\\b", flags: "g", description: "ZIP codes américains" },
      { name: "IBAN", pattern: "[A-Z]{2}\\d{2}[A-Z0-9]{4}\\d{7}(?:[A-Z0-9]?){0,16}", flags: "g", description: "Numéros IBAN" },
      { name: "Carte bancaire", pattern: "\\b(?:\\d{4}[\\s-]?){3}\\d{4}\\b", flags: "g", description: "Numéros de carte" },
      { name: "SIRET", pattern: "\\b\\d{3}\\s?\\d{3}\\s?\\d{3}\\s?\\d{5}\\b", flags: "g", description: "Numéro SIRET" },
      { name: "NIR (Sécu)", pattern: "[12]\\s?\\d{2}\\s?(?:0[1-9]|1[0-2]|[2-9]\\d)\\s?(?:0[1-9]|[1-9]\\d)\\s?\\d{3}\\s?\\d{3}\\s?\\d{2}", flags: "g", description: "Numéro de sécurité sociale" },
    ],
  },
  {
    category: "Réseau & Web",
    patterns: [
      { name: "IPv4", pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b", flags: "g", description: "Adresses IPv4 valides" },
      { name: "IPv6", pattern: "(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}", flags: "gi", description: "Adresses IPv6" },
      { name: "MAC Address", pattern: "(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}", flags: "gi", description: "Adresses MAC" },
      { name: "Domain", pattern: "(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}", flags: "g", description: "Noms de domaine" },
      { name: "Slug URL", pattern: "[a-z0-9]+(?:-[a-z0-9]+)*", flags: "gi", description: "Slugs URL-friendly" },
      { name: "Query String", pattern: "\\?(?:[a-zA-Z0-9_]+=[^&]*&?)+", flags: "g", description: "Paramètres d'URL" },
    ],
  },
  {
    category: "Code & Dev",
    patterns: [
      { name: "Couleur HEX", pattern: "#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b", flags: "gi", description: "#RGB ou #RRGGBB" },
      { name: "Couleur RGB", pattern: "rgba?\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*(?:,\\s*[01]?\\.?\\d*)?\\s*\\)", flags: "gi", description: "Format rgb()/rgba()" },
      { name: "Couleur HSL", pattern: "hsla?\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}%?\\s*,\\s*\\d{1,3}%?\\s*(?:,\\s*[01]?\\.?\\d*)?\\s*\\)", flags: "gi", description: "Format hsl()/hsla()" },
      { name: "UUID", pattern: "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}", flags: "gi", description: "Identifiants UUID" },
      { name: "Variable JS", pattern: "(?:const|let|var)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*=", flags: "g", description: "Déclarations de variables" },
      { name: "Fonction JS", pattern: "(?:function\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*\\(|(?:const|let|var)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*=\\s*(?:async\\s+)?(?:function|\\([^)]*\\)\\s*=>))", flags: "g", description: "Déclarations de fonctions" },
      { name: "Import ES6", pattern: "import\\s+(?:\\{[^}]*\\}|\\*\\s+as\\s+\\w+|\\w+)\\s+from\\s+['\"]([^'\"]+)['\"]", flags: "g", description: "Imports JavaScript/TS" },
      { name: "Classe CSS", pattern: "\\.[a-zA-Z_-][a-zA-Z0-9_-]*", flags: "g", description: "Sélecteurs de classe" },
      { name: "ID CSS", pattern: "#[a-zA-Z_-][a-zA-Z0-9_-]*", flags: "g", description: "Sélecteurs d'ID" },
      { name: "HTML Tag", pattern: "<([a-z][a-z0-9]*)\\b[^>]*>", flags: "gi", description: "Balises HTML ouvrantes" },
      { name: "HTML Attribute", pattern: "([a-z][a-z0-9-]*)=['\"]([^'\"]*)['\"]", flags: "gi", description: "Attributs HTML" },
      { name: "TODO/FIXME", pattern: "(?:TODO|FIXME|XXX|HACK|BUG)(?:\\([^)]*\\))?:?\\s*(.+?)$", flags: "gim", description: "Commentaires TODO" },
      { name: "Console Log", pattern: "console\\.(?:log|warn|error|info|debug)\\([^)]*\\);?", flags: "g", description: "Appels console" },
      { name: "Env Variable", pattern: "process\\.env\\.([A-Z_][A-Z0-9_]*)|\\$\\{?([A-Z_][A-Z0-9_]*)\\}?", flags: "g", description: "Variables d'environnement" },
    ],
  },
  {
    category: "Dates & Temps",
    patterns: [
      { name: "Date FR (DD/MM/YYYY)", pattern: "(?:0[1-9]|[12][0-9]|3[01])[/.-](?:0[1-9]|1[0-2])[/.-](?:19|20)\\d{2}", flags: "g", description: "Format français" },
      { name: "Date US (MM/DD/YYYY)", pattern: "(?:0[1-9]|1[0-2])[/.-](?:0[1-9]|[12][0-9]|3[01])[/.-](?:19|20)\\d{2}", flags: "g", description: "Format américain" },
      { name: "Date ISO", pattern: "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])", flags: "g", description: "Format YYYY-MM-DD" },
      { name: "Datetime ISO", pattern: "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})?", flags: "g", description: "Format ISO 8601 complet" },
      { name: "Heure 24h", pattern: "(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?", flags: "g", description: "Format HH:MM:SS" },
      { name: "Heure 12h", pattern: "(?:0?[1-9]|1[0-2]):[0-5]\\d(?::[0-5]\\d)?\\s*(?:AM|PM|am|pm)", flags: "gi", description: "Format avec AM/PM" },
      { name: "Unix Timestamp", pattern: "\\b1[0-9]{9}\\b", flags: "g", description: "Timestamps Unix (10 chiffres)" },
    ],
  },
  {
    category: "Texte & Contenu",
    patterns: [
      { name: "Hashtag", pattern: "#[a-zA-Z][a-zA-Z0-9_]*", flags: "g", description: "Hashtags réseaux sociaux" },
      { name: "Mention @", pattern: "@[a-zA-Z][a-zA-Z0-9_]*", flags: "g", description: "Mentions utilisateur" },
      { name: "Emoji", pattern: "[\\u{1F300}-\\u{1F9FF}]", flags: "gu", description: "Caractères emoji" },
      { name: "Mot en majuscules", pattern: "\\b[A-Z]{2,}\\b", flags: "g", description: "Mots tout en caps" },
      { name: "Double espace", pattern: "  +", flags: "g", description: "Espaces multiples" },
      { name: "Ligne vide", pattern: "^\\s*$", flags: "gm", description: "Lignes vides ou blanches" },
      { name: "Début de phrase", pattern: "(?:^|[.!?]\\s+)([A-Z])", flags: "gm", description: "Majuscules après ponctuation" },
      { name: "Citation", pattern: "[\"']([^\"']+)[\"']", flags: "g", description: "Texte entre guillemets" },
      { name: "Parenthèses", pattern: "\\(([^)]+)\\)", flags: "g", description: "Contenu entre parenthèses" },
      { name: "Markdown Link", pattern: "\\[([^\\]]+)\\]\\(([^)]+)\\)", flags: "g", description: "Liens Markdown" },
      { name: "Markdown Image", pattern: "!\\[([^\\]]+)\\]\\(([^)]+)\\)", flags: "g", description: "Images Markdown" },
    ],
  },
  {
    category: "Sécurité",
    patterns: [
      { name: "JWT Token", pattern: "eyJ[a-zA-Z0-9_-]*\\.eyJ[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*", flags: "g", description: "Tokens JWT" },
      { name: "API Key", pattern: "(?:api[_-]?key|apikey|access[_-]?token)[\"'\\s:=]+[\"']?([a-zA-Z0-9_-]{20,})[\"']?", flags: "gi", description: "Clés API potentielles" },
      { name: "Secret/Password", pattern: "(?:password|secret|passwd|pwd)[\"'\\s:=]+[\"']?([^\"'\\s]+)[\"']?", flags: "gi", description: "Secrets potentiels" },
      { name: "Base64", pattern: "[A-Za-z0-9+/]{20,}={0,2}", flags: "g", description: "Données Base64" },
      { name: "Hash MD5", pattern: "\\b[a-f0-9]{32}\\b", flags: "gi", description: "Hash MD5 (32 chars)" },
      { name: "Hash SHA-1", pattern: "\\b[a-f0-9]{40}\\b", flags: "gi", description: "Hash SHA-1 (40 chars)" },
      { name: "Hash SHA-256", pattern: "\\b[a-f0-9]{64}\\b", flags: "gi", description: "Hash SHA-256 (64 chars)" },
    ],
  },
];

const codeTemplates = [
  {
    name: "JavaScript - test()",
    language: "javascript",
    template: (pattern: string, flags: string) => `const regex = /${pattern}/${flags};
const text = "votre texte ici";
const isValid = regex.test(text);
console.log(isValid);`,
  },
  {
    name: "JavaScript - match()",
    language: "javascript",
    template: (pattern: string, flags: string) => `const regex = /${pattern}/${flags};
const text = "votre texte ici";
const matches = text.match(regex);
console.log(matches);`,
  },
  {
    name: "JavaScript - matchAll()",
    language: "javascript",
    template: (pattern: string, flags: string) => `const regex = /${pattern}/${flags.includes('g') ? flags : flags + 'g'};
const text = "votre texte ici";
const matches = [...text.matchAll(regex)];
matches.forEach((match, i) => {
  console.log(\`Match \${i + 1}:\`, match[0]);
  match.slice(1).forEach((group, j) => {
    console.log(\`  Group \${j + 1}:\`, group);
  });
});`,
  },
  {
    name: "JavaScript - replace()",
    language: "javascript",
    template: (pattern: string, flags: string) => `const regex = /${pattern}/${flags};
const text = "votre texte ici";
const result = text.replace(regex, "remplacement");
console.log(result);`,
  },
  {
    name: "Python - re.search()",
    language: "python",
    template: (pattern: string, flags: string) => `import re

pattern = r'${pattern}'
text = "votre texte ici"
${flags.includes('i') ? 'match = re.search(pattern, text, re.IGNORECASE)' : 'match = re.search(pattern, text)'}
if match:
    print(f"Match trouvé: {match.group()}")`,
  },
  {
    name: "Python - re.findall()",
    language: "python",
    template: (pattern: string, flags: string) => `import re

pattern = r'${pattern}'
text = "votre texte ici"
${flags.includes('i') ? 'matches = re.findall(pattern, text, re.IGNORECASE)' : 'matches = re.findall(pattern, text)'}
for match in matches:
    print(f"  - {match}")`,
  },
  {
    name: "PHP - preg_match()",
    language: "php",
    template: (pattern: string, flags: string) => `<?php
$pattern = '/${pattern}/${flags}';
$text = "votre texte ici";

if (preg_match($pattern, $text, $matches)) {
    echo "Match trouvé: " . $matches[0] . "\\n";
}`,
  },
];

const regexCheatsheet = [
  { symbol: ".", description: "N'importe quel caractère sauf nouvelle ligne" },
  { symbol: "\\d", description: "Chiffre [0-9]" },
  { symbol: "\\D", description: "Non-chiffre" },
  { symbol: "\\w", description: "Alphanumérique [a-zA-Z0-9_]" },
  { symbol: "\\W", description: "Non-alphanumérique" },
  { symbol: "\\s", description: "Espace blanc (espace, tab, newline)" },
  { symbol: "\\S", description: "Non-espace" },
  { symbol: "^", description: "Début de ligne" },
  { symbol: "$", description: "Fin de ligne" },
  { symbol: "\\b", description: "Limite de mot" },
  { symbol: "*", description: "0 ou plus" },
  { symbol: "+", description: "1 ou plus" },
  { symbol: "?", description: "0 ou 1 (optionnel)" },
  { symbol: "{n}", description: "Exactement n fois" },
  { symbol: "{n,}", description: "n fois ou plus" },
  { symbol: "{n,m}", description: "Entre n et m fois" },
  { symbol: "[abc]", description: "Un caractère parmi a, b, c" },
  { symbol: "[^abc]", description: "Aucun de ces caractères" },
  { symbol: "[a-z]", description: "Plage de caractères" },
  { symbol: "(abc)", description: "Groupe de capture" },
  { symbol: "(?:abc)", description: "Groupe non-capturant" },
  { symbol: "a|b", description: "a OU b" },
  { symbol: "(?=abc)", description: "Lookahead positif" },
  { symbol: "(?!abc)", description: "Lookahead négatif" },
  { symbol: "(?<=abc)", description: "Lookbehind positif" },
  { symbol: "(?<!abc)", description: "Lookbehind négatif" },
];

// === Debugger logic (from RegexDebugger) ===

interface RegexPart {
  pattern: string;
  description: string;
  type: "literal" | "metachar" | "quantifier" | "group" | "anchor" | "class";
}

const regexDescriptions: Record<string, string> = {
  "^": "Début de la ligne",
  "$": "Fin de la ligne",
  ".": "N'importe quel caractère (sauf nouvelle ligne)",
  "*": "0 ou plusieurs occurrences",
  "+": "1 ou plusieurs occurrences",
  "?": "0 ou 1 occurrence",
  "\\d": "Un chiffre (0-9)",
  "\\D": "Tout sauf un chiffre",
  "\\w": "Un caractère de mot (a-z, A-Z, 0-9, _)",
  "\\W": "Tout sauf un caractère de mot",
  "\\s": "Un espace blanc",
  "\\S": "Tout sauf un espace blanc",
  "\\b": "Frontière de mot",
  "\\B": "Non-frontière de mot",
  "\\n": "Nouvelle ligne",
  "\\t": "Tabulation",
  "|": "Alternance (ou)",
};

function parseRegexParts(regex: string): RegexPart[] {
  const parts: RegexPart[] = [];
  let i = 0;
  while (i < regex.length) {
    const char = regex[i];
    if (char === "(") {
      let depth = 1;
      let groupEnd = i + 1;
      while (groupEnd < regex.length && depth > 0) {
        if (regex[groupEnd] === "(") depth++;
        if (regex[groupEnd] === ")") depth--;
        groupEnd++;
      }
      parts.push({ pattern: regex.slice(i, groupEnd), description: `Groupe capturant: ${regex.slice(i, groupEnd)}`, type: "group" });
      i = groupEnd;
      continue;
    }
    if (char === "[") {
      let classEnd = i + 1;
      while (classEnd < regex.length && regex[classEnd] !== "]") {
        if (regex[classEnd] === "\\") classEnd++;
        classEnd++;
      }
      const classContent = regex.slice(i, classEnd + 1);
      parts.push({ pattern: classContent, description: `Classe de caractères: ${classContent}`, type: "class" });
      i = classEnd + 1;
      continue;
    }
    if (char === "\\") {
      const escaped = regex.slice(i, i + 2);
      parts.push({ pattern: escaped, description: regexDescriptions[escaped] || `Caractère échappé: ${escaped}`, type: "metachar" });
      i += 2;
      continue;
    }
    if ("*+?".includes(char)) {
      parts.push({ pattern: char, description: regexDescriptions[char], type: "quantifier" });
      i++;
      continue;
    }
    if (char === "{") {
      let quantEnd = i + 1;
      while (quantEnd < regex.length && regex[quantEnd] !== "}") quantEnd++;
      parts.push({ pattern: regex.slice(i, quantEnd + 1), description: `Quantificateur: ${regex.slice(i, quantEnd + 1)}`, type: "quantifier" });
      i = quantEnd + 1;
      continue;
    }
    if ("^$".includes(char)) {
      parts.push({ pattern: char, description: regexDescriptions[char], type: "anchor" });
      i++;
      continue;
    }
    if (char === ".") {
      parts.push({ pattern: char, description: regexDescriptions[char], type: "metachar" });
      i++;
      continue;
    }
    if (char === "|") {
      parts.push({ pattern: char, description: regexDescriptions[char], type: "metachar" });
      i++;
      continue;
    }
    parts.push({ pattern: char, description: `Caractère littéral "${char}"`, type: "literal" });
    i++;
  }
  return parts;
}

function getTypeColor(type: RegexPart["type"]): string {
  switch (type) {
    case "group": return "bg-blue-500/20 text-blue-700 dark:text-blue-300";
    case "metachar": return "bg-purple-500/20 text-purple-700 dark:text-purple-300";
    case "quantifier": return "bg-orange-500/20 text-orange-700 dark:text-orange-300";
    case "anchor": return "bg-green-500/20 text-green-700 dark:text-green-300";
    case "class": return "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300";
    default: return "bg-muted text-muted-foreground";
  }
}

// === Main component ===

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [replaceResult, setReplaceResult] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false });
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(patternCategories[0].category);

  const flagStr = Object.entries(flags)
    .filter(([_, enabled]) => enabled)
    .map(([flag]) => flag)
    .join("");

  useEffect(() => {
    if (!pattern) { setMatches([]); setError(""); return; }
    try {
      const regex = new RegExp(pattern, flagStr);
      const allMatches: RegExpMatchArray[] = [];
      if (flags.g) {
        let match;
        const tempRegex = new RegExp(pattern, flagStr);
        while ((match = tempRegex.exec(testText)) !== null) {
          allMatches.push(match);
          if (match.index === tempRegex.lastIndex) tempRegex.lastIndex++;
        }
      } else {
        const match = testText.match(regex);
        if (match) allMatches.push(match);
      }
      setMatches(allMatches);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setMatches([]);
    }
  }, [pattern, testText, flags]);

  const regexParts = useMemo(() => parseRegexParts(pattern), [pattern]);

  const debugMatches = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flagStr);
      const results: Array<{ match: string; groups: string[]; index: number }> = [];
      let match;
      if (flags.g) {
        while ((match = regex.exec(testText)) !== null) {
          results.push({ match: match[0], groups: match.slice(1), index: match.index });
        }
      } else {
        match = regex.exec(testText);
        if (match) results.push({ match: match[0], groups: match.slice(1), index: match.index });
      }
      return results;
    } catch { return []; }
  }, [pattern, testText, flagStr, flags.g]);

  const highlightMatches = () => {
    if (!matches.length || !testText) return testText;
    const parts: { text: string; isMatch: boolean; matchIndex?: number }[] = [];
    let lastIndex = 0;
    matches.forEach((match, idx) => {
      const index = match.index ?? 0;
      if (index > lastIndex) parts.push({ text: testText.slice(lastIndex, index), isMatch: false });
      parts.push({ text: match[0], isMatch: true, matchIndex: idx });
      lastIndex = index + match[0].length;
    });
    if (lastIndex < testText.length) parts.push({ text: testText.slice(lastIndex), isMatch: false });
    return parts.map((part, i) => (
      <span key={i} className={part.isMatch ? "bg-primary/30 border-b-2 border-primary font-medium rounded px-0.5" : ""} title={part.isMatch ? `Match ${(part.matchIndex ?? 0) + 1}` : undefined}>
        {part.text}
      </span>
    ));
  };

  const loadPattern = (p: { name: string; pattern: string; flags: string }) => {
    setPattern(p.pattern);
    setFlags({ g: p.flags.includes("g"), i: p.flags.includes("i"), m: p.flags.includes("m"), s: p.flags.includes("s"), u: p.flags.includes("u") });
    toast.success(`Pattern "${p.name}" chargé`);
  };

  const handleReplace = () => {
    if (!pattern) { toast.error("Veuillez entrer un pattern"); return; }
    try {
      const regex = new RegExp(pattern, flagStr);
      setReplaceResult(testText.replace(regex, replaceText));
      toast.success("Remplacement effectué !");
    } catch (e) { toast.error((e as Error).message); }
  };

  const copyToClipboard = (text: string, label: string = "Texte") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
  };

  const downloadResult = () => {
    const blob = new Blob([replaceResult || testText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regex-result.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé !");
  };

  const getRegexLiteral = () => `/${pattern}/${flagStr}`;

  // Shared flag checkboxes
  const flagCheckboxes = (
    <div className="flex flex-wrap gap-4">
      {[
        { key: 'g', label: 'g', tooltip: 'Global : trouve toutes les occurrences' },
        { key: 'i', label: 'i', tooltip: 'Insensible à la casse' },
        { key: 'm', label: 'm', tooltip: 'Multi-lignes : ^ et $ correspondent au début/fin de chaque ligne' },
        { key: 's', label: 's', tooltip: 'Dotall : . correspond aussi aux nouvelles lignes' },
        { key: 'u', label: 'u', tooltip: 'Unicode : active le support Unicode complet' },
      ].map(({ key, label, tooltip }) => (
        <div key={key} className="flex items-center space-x-2">
          <Checkbox id={`flag-${key}`} checked={flags[key as keyof typeof flags]} onCheckedChange={(checked) => setFlags({ ...flags, [key]: !!checked })} />
          <Label htmlFor={`flag-${key}`} className="cursor-pointer">
            <Tooltip content={tooltip}>{label}</Tooltip>
          </Label>
        </div>
      ))}
    </div>
  );

  return (
    <ToolPageLayout title="Regex Pro" description="Testez, debuggez et générez des expressions régulières avec plus de 50 templates">

      <Tabs defaultValue="tester" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="tester" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Tester
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug
          </TabsTrigger>
          <TabsTrigger value="railroad" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Railroad
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="reference" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Référence
          </TabsTrigger>
        </TabsList>

        {/* === TESTER TAB === */}
        <TabsContent value="tester" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Configuration</span>
                  {pattern && (
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(getRegexLiteral(), "Regex")}>
                      <Copy className="h-4 w-4 mr-2" />
                      {getRegexLiteral()}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Pattern <Tooltip content="L'expression régulière à tester">Regex</Tooltip></Label>
                  <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="[a-z]+" className="font-mono" />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                {flagCheckboxes}
                <div className="space-y-2">
                  <Label>Texte de test</Label>
                  <Textarea value={testText} onChange={(e) => setTestText(e.target.value)} placeholder="Entrez le texte à tester..." className="min-h-[150px] font-mono text-sm" />
                </div>
                {matches.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Résultat <Badge variant="secondary">{matches.length} correspondance{matches.length > 1 ? "s" : ""}</Badge>
                    </Label>
                    <div className="p-4 bg-muted/50 border border-border rounded-lg font-mono text-sm whitespace-pre-wrap max-h-[200px] overflow-auto">
                      {highlightMatches()}
                    </div>
                  </div>
                )}
                {matches.length > 0 && matches.some(m => m.length > 1) && (
                  <div className="space-y-2">
                    <Label><Tooltip content="Parties de la regex entre parenthèses">Groupes de capture</Tooltip></Label>
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-2">
                        {matches.map((match, i) => match.length > 1 && (
                          <div key={i} className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              Match {i + 1}: <code className="text-primary">{match[0]}</code>
                            </p>
                            <div className="grid gap-1">
                              {match.slice(1).map((group, j) => group !== undefined && (
                                <p key={j} className="text-sm font-mono flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">Groupe {j + 1}</Badge>
                                  <span className="text-primary">{group}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
                <div className="border-t pt-4 space-y-3">
                  <Label>Rechercher & Remplacer</Label>
                  <div className="flex gap-2">
                    <Input value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Texte de remplacement (ex: $1, $2...)" className="font-mono" />
                    <Button onClick={handleReplace}>
                      <Replace className="h-4 w-4 mr-2" />Remplacer
                    </Button>
                  </div>
                  {replaceResult && (
                    <div className="space-y-2">
                      <div className="p-4 bg-muted/50 border border-border rounded-lg font-mono text-sm whitespace-pre-wrap max-h-[150px] overflow-auto">{replaceResult}</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(replaceResult, "Résultat")}><Copy className="h-4 w-4 mr-2" />Copier</Button>
                        <Button variant="outline" size="sm" onClick={downloadResult}><Download className="h-4 w-4 mr-2" />Télécharger</Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Patterns rapides</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {patternCategories.slice(0, 3).flatMap(cat => cat.patterns.slice(0, 4)).map((p, i) => (
                      <button key={i} onClick={() => loadPattern(p)} className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-border">
                        <p className="font-medium text-sm">{p.name}</p>
                        <code className="text-xs text-muted-foreground break-all line-clamp-1">{p.pattern}</code>
                      </button>
                    ))}
                    <p className="text-xs text-muted-foreground text-center pt-2">Voir l'onglet Templates pour plus de patterns</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === DEBUG TAB (from RegexDebugger) === */}
        <TabsContent value="debug" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">Expression régulière</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground font-mono text-lg">/</span>
                    <Input value={pattern} onChange={(e) => setPattern(e.target.value)} className="font-mono flex-1" placeholder="Votre regex..." />
                    <span className="text-muted-foreground font-mono text-lg">/{flagStr}</span>
                  </div>
                  {flagCheckboxes}
                  {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">Texte de test</CardTitle></CardHeader>
                <CardContent>
                  <Textarea value={testText} onChange={(e) => setTestText(e.target.value)} className="min-h-[150px] font-mono" placeholder="Texte à tester..." />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">Résultats ({debugMatches.length} correspondances)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap">
                    {highlightMatches()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Tabs defaultValue="explain">
                <TabsList className="w-full">
                  <TabsTrigger value="explain" className="flex-1">Explication</TabsTrigger>
                  <TabsTrigger value="groups" className="flex-1">Groupes</TabsTrigger>
                  <TabsTrigger value="tree" className="flex-1">Structure</TabsTrigger>
                </TabsList>
                <TabsContent value="explain" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Explication en français</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {regexParts.map((part, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                              <Badge className={`${getTypeColor(part.type)} font-mono shrink-0`}>{part.pattern}</Badge>
                              <span className="text-sm">{part.description}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="groups" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5" />Groupes de capture</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        {debugMatches.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">Aucune correspondance trouvée</p>
                        ) : (
                          <div className="space-y-4">
                            {debugMatches.map((result, idx) => (
                              <div key={idx} className="p-3 bg-muted rounded-md">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">Match #{idx + 1}</Badge>
                                  <span className="text-xs text-muted-foreground">Index: {result.index}</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex gap-2">
                                    <Badge className="bg-primary/20 text-primary">Groupe 0</Badge>
                                    <code className="text-sm">{result.match}</code>
                                  </div>
                                  {result.groups.map((group, gIdx) => (
                                    <div key={gIdx} className="flex gap-2">
                                      <Badge variant="secondary">Groupe {gIdx + 1}</Badge>
                                      <code className="text-sm">{group || "(vide)"}</code>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tree" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-lg">Structure arborescente</CardTitle></CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="font-mono text-sm space-y-1">
                          <div className="text-muted-foreground">Regex: /{pattern}/{flagStr}</div>
                          <div className="pl-4 border-l-2 border-muted mt-2 space-y-1">
                            {regexParts.map((part, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <span className={`px-1 rounded ${getTypeColor(part.type)}`}>{part.pattern}</span>
                                <span className="text-xs text-muted-foreground">({part.type})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-lg">Légende des types</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(["literal", "metachar", "quantifier", "group", "anchor", "class"] as const).map(type => (
                      <Badge key={type} className={getTypeColor(type)}>{type === "literal" ? "Littéral" : type === "metachar" ? "Métacaractère" : type === "quantifier" ? "Quantificateur" : type === "group" ? "Groupe" : type === "anchor" ? "Ancre" : "Classe"}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* === RAILROAD TAB === */}
        <TabsContent value="railroad" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" /> Diagramme Railroad
                <span className="text-sm font-normal text-muted-foreground">— Visualisation graphique du regex</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Pattern</Label>
                <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="[a-z]+" className="font-mono" />
              </div>
              {pattern ? (
                <div className="mt-4 overflow-x-auto">
                  <svg className="min-w-full" height={Math.max(80, regexParts.length > 10 ? 120 : 80)} viewBox={`0 0 ${Math.max(800, regexParts.length * 120 + 120)} ${regexParts.length > 10 ? 120 : 80}`}>
                    {/* Start circle */}
                    <circle cx="30" cy="40" r="8" className="fill-primary" />
                    <line x1="38" y1="40" x2="60" y2="40" className="stroke-primary" strokeWidth="2" />
                    
                    {regexParts.map((part, i) => {
                      const x = 60 + i * 110;
                      const isQuant = part.type === "quantifier";
                      const isGroup = part.type === "group";
                      const isClass = part.type === "class";
                      const isAnchor = part.type === "anchor";
                      const width = Math.max(80, part.pattern.length * 10 + 20);
                      const colors: Record<string, { fill: string; stroke: string; text: string }> = {
                        literal: { fill: "hsl(var(--muted))", stroke: "hsl(var(--border))", text: "hsl(var(--foreground))" },
                        metachar: { fill: "hsl(var(--primary) / 0.1)", stroke: "hsl(var(--primary))", text: "hsl(var(--primary))" },
                        quantifier: { fill: "hsl(var(--accent))", stroke: "hsl(var(--border))", text: "hsl(var(--foreground))" },
                        group: { fill: "hsl(var(--primary) / 0.15)", stroke: "hsl(var(--primary))", text: "hsl(var(--primary))" },
                        anchor: { fill: "hsl(var(--muted))", stroke: "hsl(var(--primary) / 0.5)", text: "hsl(var(--foreground))" },
                        class: { fill: "hsl(var(--primary) / 0.1)", stroke: "hsl(var(--primary) / 0.6)", text: "hsl(var(--primary))" },
                      };
                      const c = colors[part.type] || colors.literal;
                      
                      return (
                        <g key={i}>
                          {/* Connector line */}
                          {i > 0 && <line x1={x - 50} y1="40" x2={x} y2="40" className="stroke-muted-foreground" strokeWidth="1.5" markerEnd="url(#arrow)" />}
                          
                          {/* Node */}
                          {isQuant ? (
                            <ellipse cx={x + width / 2} cy="40" rx={width / 2} ry="18" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
                          ) : isGroup || isClass ? (
                            <rect x={x} y="22" width={width} height="36" rx="8" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" strokeDasharray={isGroup ? "5,3" : "none"} />
                          ) : isAnchor ? (
                            <><line x1={x + width / 2} y1="24" x2={x + width / 2} y2="56" stroke={c.stroke} strokeWidth="2" /><circle cx={x + width / 2} cy="40" r="4" fill={c.stroke} /></>
                          ) : (
                            <rect x={x} y="22" width={width} height="36" rx="4" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
                          )}
                          
                          {/* Label */}
                          <text x={x + width / 2} y="44" textAnchor="middle" className="text-xs font-mono" fill={c.text} fontSize="11">
                            {part.pattern.length > 12 ? part.pattern.slice(0, 12) + "…" : part.pattern}
                          </text>
                          
                          {/* Quantifier loop arrow */}
                          {isQuant && (
                            <path d={`M ${x + width / 2 - 10} 58 Q ${x + width / 2} 72 ${x + width / 2 + 10} 58`} fill="none" stroke={c.stroke} strokeWidth="1" />
                          )}
                        </g>
                      );
                    })}
                    
                    {/* End connector and circle */}
                    {regexParts.length > 0 && (
                      <>
                        <line x1={60 + (regexParts.length - 1) * 110 + Math.max(80, regexParts[regexParts.length - 1].pattern.length * 10 + 20)} y1="40" x2={60 + (regexParts.length - 1) * 110 + Math.max(80, regexParts[regexParts.length - 1].pattern.length * 10 + 20) + 30} y2="40" className="stroke-primary" strokeWidth="2" />
                        <circle cx={60 + (regexParts.length - 1) * 110 + Math.max(80, regexParts[regexParts.length - 1].pattern.length * 10 + 20) + 38} cy="40" r="8" className="fill-none stroke-primary" strokeWidth="3" />
                      </>
                    )}
                    
                    <defs>
                      <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6" className="fill-muted-foreground" />
                      </marker>
                    </defs>
                  </svg>
                  
                  {/* Legend below diagram */}
                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                    {regexParts.map((part, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        <Badge className={`${getTypeColor(part.type)} text-[10px] px-1.5`}>{part.pattern}</Badge>
                        <span className="text-muted-foreground">{part.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-12 mt-4">Entrez un pattern regex pour voir le diagramme</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === TEMPLATES TAB === */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {patternCategories.map((cat) => (
              <Button key={cat.category} variant={selectedCategory === cat.category ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat.category)}>
                {cat.category}
                <Badge variant="secondary" className="ml-2">{cat.patterns.length}</Badge>
              </Button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patternCategories.find(cat => cat.category === selectedCategory)?.patterns.map((p, i) => (
              <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => loadPattern(p)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{p.name}</h3>
                    <Badge variant="outline" className="text-xs">{p.flags}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                  <code className="text-xs bg-muted p-2 rounded block overflow-x-auto whitespace-nowrap">{p.pattern}</code>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* === CODE GENERATOR TAB === */}
        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Générer du code</CardTitle></CardHeader>
            <CardContent>
              {!pattern ? (
                <p className="text-muted-foreground">Entrez d'abord un pattern dans l'onglet Tester</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {codeTemplates.map((template, i) => (
                    <Card key={i}>
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{template.name}</CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(template.template(pattern, flagStr), "Code")}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="py-0 pb-3">
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-[150px]">
                          <code>{template.template(pattern, flagStr)}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === REFERENCE TAB === */}
        <TabsContent value="reference" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Aide-mémoire Regex</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {regexCheatsheet.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <code className="font-mono font-bold text-primary min-w-[60px]">{item.symbol}</code>
                    <span className="text-sm text-muted-foreground">{item.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Flags</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { flag: 'g', name: 'Global', desc: 'Trouve toutes les correspondances, pas seulement la première' },
                  { flag: 'i', name: 'Case Insensitive', desc: 'Ignore la casse des caractères' },
                  { flag: 'm', name: 'Multiline', desc: '^ et $ matchent le début/fin de chaque ligne' },
                  { flag: 's', name: 'Dotall', desc: 'Le point (.) matche aussi les nouvelles lignes' },
                  { flag: 'u', name: 'Unicode', desc: 'Active le support complet Unicode' },
                  { flag: 'y', name: 'Sticky', desc: 'Matche à partir de lastIndex seulement' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>{item.flag}</Badge>
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ToolPageLayout>
  );
}
