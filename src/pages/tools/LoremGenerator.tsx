import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileText, Copy, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ToolPageLayout } from "@/components/ToolPageLayout";

type GeneratorStyle = "lorem" | "hipster" | "tech" | "corporate" | "bacon";

const wordBanks: Record<GeneratorStyle, string[]> = {
  lorem: [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
    "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
    "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
    "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
    "deserunt", "mollit", "anim", "id", "est", "laborum", "semper", "tellus",
    "integer", "feugiat", "scelerisque", "varius", "morbi", "quisque",
  ],
  hipster: [
    "artisan", "craft", "vinyl", "kombucha", "aesthetic", "sustainable", "organic",
    "locally-sourced", "avocado", "toast", "brunch", "fixie", "typewriter", "vegan",
    "gluten-free", "raw", "denim", "beard", "latte", "espresso", "pour-over",
    "cold-brew", "sourdough", "fermented", "microbrewery", "gastropub", "curated",
    "handcrafted", "bespoke", "vintage", "retro", "minimalist", "bohemian",
    "ethical", "fair-trade", "small-batch", "slow-food", "artisanal", "reclaimed",
    "upcycled", "plant-based", "mindful", "intentional", "authentic", "wholesome",
  ],
  tech: [
    "cloud", "API", "microservice", "container", "kubernetes", "serverless",
    "blockchain", "machine-learning", "DevOps", "CI/CD", "pipeline", "deployment",
    "infrastructure", "scalable", "distributed", "asynchronous", "real-time",
    "framework", "architecture", "agile", "sprint", "refactor", "optimize",
    "algorithm", "data-driven", "full-stack", "headless", "edge-computing",
    "observability", "orchestration", "resilient", "fault-tolerant", "immutable",
    "declarative", "event-driven", "mesh", "proxy", "gateway", "monorepo",
    "dependency", "bundler", "transpiler", "linter", "formatter", "runtime",
  ],
  corporate: [
    "synergy", "leverage", "paradigm", "ecosystem", "stakeholder", "deliverable",
    "actionable", "bandwidth", "benchmark", "best-practice", "bottom-line",
    "core-competency", "disruptive", "empowerment", "engagement", "holistic",
    "innovative", "key-performance", "metric", "milestone", "onboarding",
    "optimization", "proactive", "roadmap", "ROI", "scalability", "streamline",
    "thought-leadership", "value-proposition", "vertical", "workflow", "alignment",
    "circle-back", "deep-dive", "drill-down", "game-changer", "growth-hacking",
    "low-hanging-fruit", "move-the-needle", "north-star", "pain-point", "pivot",
  ],
  bacon: [
    "bacon", "ipsum", "dolor", "amet", "brisket", "ribeye", "pork", "belly",
    "sirloin", "tenderloin", "hamburger", "steak", "filet", "mignon", "chuck",
    "flank", "tri-tip", "drumstick", "turkey", "chicken", "sausage", "kielbasa",
    "andouille", "chorizo", "salami", "pepperoni", "prosciutto", "pancetta",
    "capicola", "bresaola", "pastrami", "corned-beef", "jerky", "smoked",
    "grilled", "braised", "roasted", "barbecue", "marinade", "rub", "glaze",
    "brine", "cure", "smoke-ring", "char", "sear", "render", "crispy",
  ],
};

const styleLabels: Record<GeneratorStyle, string> = {
  lorem: "Lorem Ipsum (classique)",
  hipster: "Hipster Ipsum",
  tech: "Tech Ipsum",
  corporate: "Corporate Ipsum",
  bacon: "Bacon Ipsum",
};

export default function LoremGenerator() {
  const [output, setOutput] = useState("");
  const [paragraphs, setParagraphs] = useState(3);
  const [words, setWords] = useState(50);
  const [sentences, setSentences] = useState(5);
  const [style, setStyle] = useState<GeneratorStyle>("lorem");
  const [htmlMode, setHtmlMode] = useState(false);
  const { toast } = useToast();

  const bank = wordBanks[style];

  const generateWords = (count: number): string => {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(bank[Math.floor(Math.random() * bank.length)]);
    }
    return result.join(" ");
  };

  const generateSentence = (): string => {
    const wordCount = Math.floor(Math.random() * 10) + 8;
    const sentence = generateWords(wordCount);
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  };

  const generateParagraph = (): string => {
    const sentenceCount = Math.floor(Math.random() * 4) + 4;
    const s: string[] = [];
    for (let i = 0; i < sentenceCount; i++) s.push(generateSentence());
    return s.join(" ");
  };

  const wrap = (tag: string, content: string) => (htmlMode ? `<${tag}>${content}</${tag}>` : content);

  const generateParagraphs = () => {
    const result: string[] = [];
    for (let i = 0; i < paragraphs; i++) result.push(wrap("p", generateParagraph()));
    setOutput(result.join(htmlMode ? "\n\n" : "\n\n"));
  };

  const generateWordsList = () => setOutput(generateWords(words));

  const generateSentencesList = () => {
    const result: string[] = [];
    for (let i = 0; i < sentences; i++) result.push(generateSentence());
    setOutput(result.join(" "));
  };

  const generateList = (type: "ordered" | "unordered") => {
    const items: string[] = [];
    for (let i = 0; i < 8; i++) {
      const item = generateWords(Math.floor(Math.random() * 5) + 3);
      if (htmlMode) {
        items.push(`  <li>${item}</li>`);
      } else {
        items.push(type === "ordered" ? `${i + 1}. ${item}` : `• ${item}`);
      }
    }
    if (htmlMode) {
      const tag = type === "ordered" ? "ol" : "ul";
      setOutput(`<${tag}>\n${items.join("\n")}\n</${tag}>`);
    } else {
      setOutput(items.join("\n"));
    }
  };

  const generateHeadings = () => {
    const result: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const text = generateWords(Math.floor(Math.random() * 4) + 2);
      const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
      result.push(htmlMode ? `<h${i}>${capitalized}</h${i}>` : `${"#".repeat(i)} ${capitalized}`);
    }
    setOutput(result.join("\n\n"));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copié !", description: "Texte copié dans le presse-papiers." });
  };

  const downloadText = () => {
    const ext = htmlMode ? "html" : "txt";
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lorem-ipsum.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Téléchargé" });
  };

  return (
    <ToolPageLayout title="Générateur Lorem Ipsum" description="Générez du texte de remplissage dans 5 styles différents, avec mode HTML optionnel.">

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Options de génération</CardTitle>
            <CardDescription>Personnalisez votre texte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Style selector */}
            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={style} onValueChange={(v) => setStyle(v as GeneratorStyle)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(styleLabels) as GeneratorStyle[]).map((s) => (
                    <SelectItem key={s} value={s}>{styleLabels[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* HTML mode */}
            <div className="flex items-center justify-between">
              <Label htmlFor="html-mode">Mode HTML</Label>
              <Switch id="html-mode" checked={htmlMode} onCheckedChange={setHtmlMode} />
            </div>

            <Tabs defaultValue="paragraphs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paragraphs">Paragraphes</TabsTrigger>
                <TabsTrigger value="custom">Personnalisé</TabsTrigger>
              </TabsList>

              <TabsContent value="paragraphs" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="paragraphs">Nombre de paragraphes</Label>
                  <Input id="paragraphs" type="number" min="1" max="50" value={paragraphs} onChange={(e) => setParagraphs(Number(e.target.value))} />
                </div>
                <Button onClick={generateParagraphs} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" /> Générer Paragraphes
                </Button>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nombre de mots</Label>
                  <Input type="number" min="1" max="500" value={words} onChange={(e) => setWords(Number(e.target.value))} />
                </div>
                <Button onClick={generateWordsList} className="w-full" variant="outline">Générer Mots</Button>

                <div className="space-y-2">
                  <Label>Nombre de phrases</Label>
                  <Input type="number" min="1" max="50" value={sentences} onChange={(e) => setSentences(Number(e.target.value))} />
                </div>
                <Button onClick={generateSentencesList} className="w-full" variant="outline">Générer Phrases</Button>

                <div className="border-t pt-4 space-y-2">
                  <Label>Structures</Label>
                  <Button onClick={() => generateList("ordered")} className="w-full" variant="outline">Liste numérotée</Button>
                  <Button onClick={() => generateList("unordered")} className="w-full" variant="outline">Liste à puces</Button>
                  <Button onClick={generateHeadings} className="w-full" variant="outline">Titres H1–H6</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Texte généré</CardTitle>
            <CardDescription>
              Style : <Badge variant="secondary">{styleLabels[style]}</Badge>
              {htmlMode && <Badge variant="outline" className="ml-2">HTML</Badge>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Cliquez sur un bouton de génération pour créer du texte..."
              value={output}
              readOnly
              className="min-h-[500px] font-mono text-sm"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={copyToClipboard} variant="outline" size="sm" disabled={!output}>
                <Copy className="h-4 w-4 mr-2" /> Copier
              </Button>
              <Button onClick={downloadText} variant="outline" size="sm" disabled={!output}>
                <Download className="h-4 w-4 mr-2" /> Télécharger
              </Button>
              <Badge variant="secondary" className="ml-auto">{output.length} car.</Badge>
              <Badge variant="secondary">{output.split(/\s+/).filter(w => w).length} mots</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
