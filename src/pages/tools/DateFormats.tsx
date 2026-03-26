import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Code2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export default function DateFormats() {
  const [inputDate, setInputDate] = useState(new Date().toISOString());

  const formats = {
    iso: {
      name: "ISO 8601 / RFC 3339",
      examples: [
        { label: "ISO 8601", value: format(parseISO(inputDate), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx") },
        { label: "ISO Date", value: format(parseISO(inputDate), "yyyy-MM-dd") },
        { label: "ISO Time", value: format(parseISO(inputDate), "HH:mm:ss") },
      ]
    },
    javascript: {
      name: "JavaScript / TypeScript",
      examples: [
        { label: "toISOString()", code: `new Date("${inputDate}").toISOString()`, value: new Date(inputDate).toISOString() },
        { label: "toLocaleString()", code: `new Date("${inputDate}").toLocaleString("fr-FR")`, value: new Date(inputDate).toLocaleString("fr-FR") },
        { label: "getTime()", code: `new Date("${inputDate}").getTime()`, value: new Date(inputDate).getTime().toString() },
      ]
    },
    php: {
      name: "PHP",
      examples: [
        { label: "date('Y-m-d H:i:s')", code: `date('Y-m-d H:i:s', ${Math.floor(new Date(inputDate).getTime() / 1000)})`, value: format(parseISO(inputDate), "yyyy-MM-dd HH:mm:ss") },
        { label: "DateTime::format", code: `(new DateTime('${inputDate}'))->format('Y-m-d')`, value: format(parseISO(inputDate), "yyyy-MM-dd") },
        { label: "strtotime", code: `strtotime('${inputDate}')`, value: Math.floor(new Date(inputDate).getTime() / 1000).toString() },
      ]
    },
    python: {
      name: "Python",
      examples: [
        { label: "strftime", code: `datetime.strptime('${inputDate}', '%Y-%m-%dT%H:%M:%S').strftime('%Y-%m-%d %H:%M:%S')`, value: format(parseISO(inputDate), "yyyy-MM-dd HH:mm:ss") },
        { label: "isoformat()", code: `datetime.fromisoformat('${inputDate}').isoformat()`, value: inputDate },
        { label: "timestamp()", code: `datetime.fromisoformat('${inputDate}').timestamp()`, value: (new Date(inputDate).getTime() / 1000).toString() },
      ]
    },
    sql: {
      name: "SQL",
      examples: [
        { label: "MySQL DATETIME", value: format(parseISO(inputDate), "yyyy-MM-dd HH:mm:ss") },
        { label: "PostgreSQL TIMESTAMP", value: format(parseISO(inputDate), "yyyy-MM-dd HH:mm:ss") },
        { label: "UNIX_TIMESTAMP", value: Math.floor(new Date(inputDate).getTime() / 1000).toString() },
      ]
    },
    other: {
      name: "Autres formats",
      examples: [
        { label: "Unix Timestamp", value: Math.floor(new Date(inputDate).getTime() / 1000).toString() },
        { label: "Excel Serial", value: ((new Date(inputDate).getTime() / 86400000) + 25569).toString() },
        { label: "RFC 2822", value: new Date(inputDate).toUTCString() },
      ]
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Code2 className="h-8 w-8" />
          Convertisseur & Générateur de Formats de Date
        </h1>
        <p className="text-muted-foreground">
          Convertissez instantanément une date vers tous les formats de programmation
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Date d'entrée</CardTitle>
          <CardDescription>Entrez une date au format ISO 8601</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="datetime-local"
            value={inputDate.slice(0, 16)}
            onChange={(e) => setInputDate(new Date(e.target.value).toISOString())}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="iso" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="iso">ISO</TabsTrigger>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          <TabsTrigger value="php">PHP</TabsTrigger>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="sql">SQL</TabsTrigger>
          <TabsTrigger value="other">Autres</TabsTrigger>
        </TabsList>

        {Object.entries(formats).map(([key, category]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.examples.map((example, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{example.label}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(example.value)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {example.code && (
                      <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
                        <code>{example.code}</code>
                      </pre>
                    )}
                    <div className="bg-background border rounded p-2 font-mono text-sm">
                      {example.value}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Templates & Snippets auto-générés</CardTitle>
          <CardDescription>Code prêt à l'emploi pour chaque langage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Badge className="mb-2">JavaScript - Parsing</Badge>
              <pre className="bg-muted p-4 rounded overflow-x-auto">
                <code>{`const date = new Date("${inputDate}");
const formatted = date.toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
console.log(formatted); // ${new Date(inputDate).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => copyToClipboard(`const date = new Date("${inputDate}");\nconst formatted = date.toLocaleString("fr-FR", { timeZone: "Europe/Paris" });\nconsole.log(formatted);`)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier le code
              </Button>
            </div>

            <div>
              <Badge className="mb-2">Python - Parsing</Badge>
              <pre className="bg-muted p-4 rounded overflow-x-auto">
                <code>{`from datetime import datetime

date = datetime.fromisoformat("${inputDate}")
formatted = date.strftime("%d/%m/%Y %H:%M:%S")
print(formatted) # ${format(parseISO(inputDate), "dd/MM/yyyy HH:mm:ss")}`}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => copyToClipboard(`from datetime import datetime\n\ndate = datetime.fromisoformat("${inputDate}")\nformatted = date.strftime("%d/%m/%Y %H:%M:%S")\nprint(formatted)`)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier le code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
