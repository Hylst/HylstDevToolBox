import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Code, FileText, AlertTriangle, Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// --- Sandbox Tab ---
function DateSandboxTab() {
  const [code, setCode] = useState(`const now = new Date();
console.log("ISO:", now.toISOString());
console.log("Locale FR:", now.toLocaleString('fr-FR'));
console.log("UTC:", now.toUTCString());`);
  const [output, setOutput] = useState("");

  const runCode = () => {
    try {
      const logs: string[] = [];
      const mockConsole = { log: (...args: unknown[]) => logs.push(args.map(String).join(" ")) };
      const fn = new Function("console", code);
      fn(mockConsole);
      setOutput(logs.join("\n"));
    } catch (e: unknown) {
      setOutput(`Erreur: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Code className="h-5 w-5" /> Sandbox Date</CardTitle>
        <CardDescription>Testez du code JavaScript avec les dates en temps réel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={code} onChange={e => setCode(e.target.value)} rows={6} className="font-mono text-sm" />
        <Button onClick={runCode} className="gap-2"><Play className="h-4 w-4" /> Exécuter</Button>
        {output && <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">{output}</pre>}
      </CardContent>
    </Card>
  );
}

// --- Issues Tab ---
const commonIssues = [
  { id: "leap-years", title: "Années bissextiles", severity: "high", description: "Les années bissextiles ajoutent un jour supplémentaire tous les 4 ans, avec des exceptions.", solution: "Utilisez des bibliothèques testées qui gèrent automatiquement les années bissextiles.", code: `// ✅ BON\nconst isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;` },
  { id: "dst", title: "Changements d'heure (DST)", severity: "high", description: "Le changement d'heure peut causer des écarts d'une heure et des timestamps ambigus.", solution: "Stockez toujours les dates en UTC et convertissez à l'affichage.", code: `const utc = new Date().toISOString();\nconst local = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });` },
  { id: "end-of-month", title: "Fin de mois irréguliers", severity: "medium", description: "Ajouter 1 mois au 31 janvier ne donne pas le 31 février.", solution: "Les bibliothèques comme date-fns ajustent automatiquement au dernier jour du mois.", code: `import { addMonths } from 'date-fns';\naddMonths(new Date('2025-01-31'), 1); // 28 fév` },
  { id: "timezone-offset", title: "Fuseaux horaires et offsets", severity: "high", description: "Les offsets ne sont pas constants (DST) et peuvent varier.", solution: "Utilisez des noms de fuseaux IANA (Europe/Paris), jamais d'offset fixe.", code: `// ✅ Fuseau IANA\nnew Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });` },
];

function DateIssuesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" /> Pièges fréquents</CardTitle>
        <CardDescription>Solutions éprouvées pour les problèmes courants</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {commonIssues.map(issue => (
            <AccordionItem key={issue.id} value={issue.id}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Badge variant={issue.severity === "high" ? "destructive" : "default"}>
                    {issue.severity === "high" ? "Critique" : "Moyen"}
                  </Badge>
                  <span>{issue.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <p className="text-muted-foreground">{issue.description}</p>
                  <p className="text-muted-foreground"><strong>Solution :</strong> {issue.solution}</p>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto"><code>{issue.code}</code></pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

// --- Docs Tab ---
function DateDocsTab() {
  const methods = [
    { name: "Date.now()", desc: "Timestamp en millisecondes depuis le 1er janvier 1970 UTC" },
    { name: "new Date().toISOString()", desc: "Format ISO 8601 : 2025-03-08T12:30:00.000Z" },
    { name: "toLocaleString(locale, opts)", desc: "Formatage localisé avec options de fuseau horaire" },
    { name: "getTime() / valueOf()", desc: "Nombre de ms depuis l'epoch Unix" },
    { name: "toUTCString()", desc: "Format lisible en UTC" },
    { name: "Date.parse(string)", desc: "Parse une chaîne de date et retourne un timestamp" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> API Date JavaScript</CardTitle>
        <CardDescription>Référence rapide des méthodes les plus utilisées</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {methods.map(m => (
            <div key={m.name} className="flex flex-col gap-1 p-3 bg-muted rounded">
              <code className="font-semibold text-sm">{m.name}</code>
              <span className="text-sm text-muted-foreground">{m.desc}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main Component ---
export default function DateReference() {
  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          Date Reference
        </h1>
        <p className="text-muted-foreground mt-1">
          Sandbox, problèmes courants et documentation des dates — tout en un
        </p>
      </div>

      <Tabs defaultValue="sandbox" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sandbox" className="flex items-center gap-2">
            <Code className="h-4 w-4" />Sandbox
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />Problèmes
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sandbox"><DateSandboxTab /></TabsContent>
        <TabsContent value="issues"><DateIssuesTab /></TabsContent>
        <TabsContent value="docs"><DateDocsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
