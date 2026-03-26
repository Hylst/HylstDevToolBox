import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Type, Copy } from "lucide-react";
import { toast } from "sonner";

const conversions = {
  camelCase: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
  PascalCase: (s: string) => s.replace(/(?:^|[^a-zA-Z0-9]+)(.)/g, (_, c) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, ""),
  snake_case: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, ""),
  "kebab-case": (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, ""),
  CONSTANT_CASE: (s: string) => s.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, ""),
  "Title Case": (s: string) => s.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase()),
  "Sentence case": (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
  lowercase: (s: string) => s.toLowerCase(),
  UPPERCASE: (s: string) => s.toUpperCase(),
  "dot.case": (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, ".").replace(/^\.|\.$/g, ""),
};

export default function TextCaseConverter() {
  const [input, setInput] = useState("Hello World Example");
  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copié !"); };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Type className="h-8 w-8 text-primary" />Text Case Converter</h1>
      <Card className="mb-6"><CardContent className="pt-6">
        <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Entrez votre texte..." rows={3} className="text-lg" />
      </CardContent></Card>
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(conversions).map(([name, fn]) => (
          <Card key={name} className="hover:border-primary transition-colors">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-muted-foreground">{name}</span>
                <Button size="sm" variant="ghost" onClick={() => copy(fn(input))}><Copy className="h-4 w-4" /></Button>
              </div>
              <code className="block p-2 bg-muted rounded text-sm break-all">{fn(input)}</code>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
