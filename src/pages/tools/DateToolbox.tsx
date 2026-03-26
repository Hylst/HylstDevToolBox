import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Code, Shield, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- API Services Tab ---
function DateAPITab() {
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 10));
  const [results, setResults] = useState<Record<string, string>>({});

  const runAPIs = () => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      setResults({ error: "Date invalide" });
      return;
    }
    setResults({
      "ISO 8601": d.toISOString(),
      "Timestamp (ms)": String(d.getTime()),
      "Timestamp (s)": String(Math.floor(d.getTime() / 1000)),
      "UTC": d.toUTCString(),
      "Locale FR": d.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      "Locale US": d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      "Jour de l'année": String(Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)),
      "Semaine ISO": `W${String(getISOWeek(d)).padStart(2, "0")}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Code className="h-5 w-5" /> API Services</CardTitle>
        <CardDescription>Simulez des appels API de conversion de dates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} />
          <Button onClick={runAPIs}>Convertir</Button>
        </div>
        {Object.keys(results).length > 0 && (
          <div className="space-y-2">
            {Object.entries(results).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                <span className="font-medium">{k}</span>
                <code className="text-muted-foreground">{v}</code>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getISOWeek(d: Date): number {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

// --- Validation Tab ---
function DateValidationTab() {
  const [input, setInput] = useState("");
  const [checks, setChecks] = useState<{ label: string; ok: boolean; detail: string }[]>([]);

  const validate = () => {
    const results: { label: string; ok: boolean; detail: string }[] = [];
    const d = new Date(input);
    const isValid = !isNaN(d.getTime());

    results.push({ label: "Parsable", ok: isValid, detail: isValid ? d.toISOString() : "Impossible de parser" });
    results.push({ label: "Format ISO 8601", ok: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(input), detail: "YYYY-MM-DD[THH:mm:ss]" });
    results.push({ label: "Pas dans le futur", ok: isValid && d <= new Date(), detail: isValid ? (d <= new Date() ? "OK" : "Date future") : "N/A" });
    results.push({ label: "Après epoch Unix", ok: isValid && d.getTime() >= 0, detail: isValid ? (d.getTime() >= 0 ? "OK" : "Avant 1970") : "N/A" });

    if (isValid) {
      const y2038 = new Date("2038-01-19T03:14:07Z");
      results.push({ label: "Safe pour 32-bit", ok: d < y2038, detail: d < y2038 ? "OK" : "Après le bug Y2038" });
    }

    setChecks(results);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Validation de dates</CardTitle>
        <CardDescription>Vérifiez la validité et la sécurité d'une date</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="ex: 2025-03-08 ou March 8, 2025" value={input} onChange={e => setInput(e.target.value)} />
          <Button onClick={validate}>Valider</Button>
        </div>
        {checks.length > 0 && (
          <div className="space-y-2">
            {checks.map(c => (
              <div key={c.label} className="flex items-center gap-3 p-2 bg-muted rounded text-sm">
                {c.ok ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                <span className="font-medium flex-1">{c.label}</span>
                <Badge variant={c.ok ? "default" : "destructive"}>{c.detail}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main ---
export default function DateToolbox() {
  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wrench className="h-8 w-8 text-primary" />
          Date Toolbox
        </h1>
        <p className="text-muted-foreground mt-1">
          Services API simulés et validation de dates
        </p>
      </div>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />API Services
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />Validation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api"><DateAPITab /></TabsContent>
        <TabsContent value="validation"><DateValidationTab /></TabsContent>
      </Tabs>
    </div>
  );
}
