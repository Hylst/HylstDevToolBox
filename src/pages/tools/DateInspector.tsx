import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { parseISO, isValid, format } from "date-fns";

export default function DateInspector() {
  const [dateString, setDateString] = useState("");
  
  const analyzeDate = () => {
    if (!dateString) return null;

    try {
      const parsed = parseISO(dateString);
      const isValidDate = isValid(parsed);

      if (!isValidDate) {
        return {
          valid: false,
          error: "Format de date invalide"
        };
      }

      // Détection du format
      let detectedFormat = "Unknown";
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString)) {
        detectedFormat = "ISO 8601";
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        detectedFormat = "ISO Date";
      } else if (/^\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
        detectedFormat = "DD/MM/YYYY ou MM/DD/YYYY (ambigu)";
      } else if (/^\d{10}$/.test(dateString)) {
        detectedFormat = "Unix Timestamp (seconds)";
      } else if (/^\d{13}$/.test(dateString)) {
        detectedFormat = "Unix Timestamp (milliseconds)";
      }

      return {
        valid: true,
        detectedFormat,
        parsed,
        iso: parsed.toISOString(),
        timestamp: parsed.getTime(),
        representations: {
          iso8601: parsed.toISOString(),
          rfc2822: parsed.toUTCString(),
          unixSeconds: Math.floor(parsed.getTime() / 1000),
          unixMillis: parsed.getTime(),
          readable: format(parsed, "EEEE dd MMMM yyyy à HH:mm:ss"),
          date: format(parsed, "yyyy-MM-dd"),
          time: format(parsed, "HH:mm:ss"),
        },
        warnings: []
      };
    } catch (error) {
      return {
        valid: false,
        error: "Impossible de parser la date"
      };
    }
  };

  const analysis = analyzeDate();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Search className="h-8 w-8" />
          Inspecteur de Dates
        </h1>
        <p className="text-muted-foreground">
          Analysez et identifiez automatiquement le format de n'importe quelle date
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Entrez une date à analyser</CardTitle>
          <CardDescription>
            Formats supportés : ISO 8601, DD/MM/YYYY, Unix timestamp, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dateInput">Chaîne de date</Label>
              <Input
                id="dateInput"
                placeholder="2025-11-18T12:30:00Z ou 1700312400 ou 18/11/2025..."
                value={dateString}
                onChange={(e) => setDateString(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis && !analysis.valid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{analysis.error}</AlertDescription>
        </Alert>
      )}

      {analysis && analysis.valid && (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Date valide détectée</AlertTitle>
            <AlertDescription>
              <Badge className="mt-2">{analysis.detectedFormat}</Badge>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Représentations équivalentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">ISO 8601</Label>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {analysis.representations.iso8601}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">RFC 2822</Label>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {analysis.representations.rfc2822}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Unix Timestamp (s)</Label>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {analysis.representations.unixSeconds}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Unix Timestamp (ms)</Label>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {analysis.representations.unixMillis}
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Lisible</Label>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {analysis.representations.readable}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Code pour différents langages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge className="mb-2">JavaScript</Badge>
                <pre className="bg-muted p-3 rounded overflow-x-auto text-sm">
                  <code>{`const date = new Date("${analysis.iso}");\nconsole.log(date.toISOString());`}</code>
                </pre>
              </div>
              <div>
                <Badge className="mb-2">Python</Badge>
                <pre className="bg-muted p-3 rounded overflow-x-auto text-sm">
                  <code>{`from datetime import datetime\ndate = datetime.fromisoformat("${analysis.iso}")\nprint(date.isoformat())`}</code>
                </pre>
              </div>
              <div>
                <Badge className="mb-2">PHP</Badge>
                <pre className="bg-muted p-3 rounded overflow-x-auto text-sm">
                  <code>{`$date = new DateTime("${analysis.iso}");\necho $date->format('Y-m-d H:i:s');`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {analysis.detectedFormat.includes("ambigu") && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Attention : Format ambigu</AlertTitle>
              <AlertDescription>
                Le format DD/MM/YYYY peut être confondu avec MM/DD/YYYY. 
                Privilégiez toujours le format ISO 8601 (YYYY-MM-DD) pour éviter toute ambiguïté.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
