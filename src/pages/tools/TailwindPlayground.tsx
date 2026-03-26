import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Paintbrush, Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const presets = [
  {
    name: "Button Primary",
    classes: "px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 active:scale-95",
    html: "Click Me",
    tag: "button",
  },
  {
    name: "Card",
    classes: "max-w-sm p-6 bg-white rounded-xl shadow-md border border-gray-100 space-y-3",
    html: '<h3 class="text-lg font-bold text-gray-900">Card Title</h3><p class="text-gray-600 text-sm">Card description goes here with some text.</p>',
    tag: "div",
  },
  {
    name: "Badge",
    classes: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800",
    html: "Active",
    tag: "span",
  },
  {
    name: "Alert",
    classes: "flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm",
    html: "⚠️ Attention : cette action est irréversible.",
    tag: "div",
  },
  {
    name: "Avatar",
    classes: "w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg",
    html: "JD",
    tag: "div",
  },
  {
    name: "Input",
    classes: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm placeholder:text-gray-400",
    html: "",
    tag: "input",
  },
  {
    name: "Navbar",
    classes: "flex items-center justify-between px-6 py-4 bg-gray-900 text-white rounded-xl shadow-xl",
    html: '<span class="font-bold text-lg">Brand</span><div class="flex gap-4 text-sm text-gray-300"><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></div>',
    tag: "nav",
  },
];

const tailwindDocs: Record<string, string> = {
  "p-": "padding", "px-": "padding-left/right", "py-": "padding-top/bottom", "pt-": "padding-top",
  "m-": "margin", "mx-": "margin-left/right", "my-": "margin-top/bottom",
  "w-": "width", "h-": "height", "min-w-": "min-width", "max-w-": "max-width",
  "text-": "font-size/color", "font-": "font-weight/family", "leading-": "line-height",
  "bg-": "background-color", "border-": "border", "rounded-": "border-radius",
  "shadow-": "box-shadow", "flex": "display: flex", "grid": "display: grid",
  "gap-": "gap", "space-": "space between children", "items-": "align-items",
  "justify-": "justify-content", "absolute": "position: absolute", "relative": "position: relative",
  "transition-": "transition", "duration-": "transition-duration", "opacity-": "opacity",
  "hover:": "on hover pseudo", "focus:": "on focus pseudo", "active:": "on active pseudo",
  "sm:": "≥640px", "md:": "≥768px", "lg:": "≥1024px", "xl:": "≥1280px",
};

export default function TailwindPlayground() {
  const { toast } = useToast();
  const [classes, setClasses] = useState(presets[0].classes);
  const [content, setContent] = useState(presets[0].html);
  const [tag, setTag] = useState(presets[0].tag);

  const classTokens = classes.trim().split(/\s+/).filter(Boolean);
  const resolvedDocs = classTokens.map(cls => {
    const match = Object.entries(tailwindDocs).find(([prefix]) => cls.startsWith(prefix));
    return { cls, doc: match ? match[1] : null };
  });

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !" });
  };

  const loadPreset = (preset: typeof presets[0]) => {
    setClasses(preset.classes);
    setContent(preset.html);
    setTag(preset.tag);
  };

  const htmlOutput = tag === "input"
    ? `<input class="${classes}" placeholder="Type here..." />`
    : `<${tag} class="${classes}">${content}</${tag}>`;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Paintbrush className="h-8 w-8 text-primary" />
          Tailwind Playground
        </h1>
        <p className="text-muted-foreground">Sandbox interactive : tapez des classes Tailwind et voyez le rendu en direct</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map(p => (
          <Button key={p.name} size="sm" variant="outline" onClick={() => loadPreset(p)}>{p.name}</Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Classes Tailwind</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={classes}
                onChange={e => setClasses(e.target.value)}
                className="font-mono text-sm min-h-[100px]"
                placeholder="px-4 py-2 bg-blue-500 text-white rounded-lg..."
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tag HTML</Label>
                  <Input value={tag} onChange={e => setTag(e.target.value)} placeholder="div" />
                </div>
                <div>
                  <Label>Contenu</Label>
                  <Input value={content} onChange={e => setContent(e.target.value)} placeholder="Hello World" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Documentation des classes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[300px] overflow-auto">
                {resolvedDocs.map(({ cls, doc }, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted/50">
                    <Badge variant="secondary" className="font-mono text-xs">{cls}</Badge>
                    <span className="text-muted-foreground">{doc || "—"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                HTML
                <Button size="sm" variant="ghost" onClick={() => copy(htmlOutput)}><Copy className="h-3 w-3 mr-1" /> Copier</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono bg-muted/50 p-3 rounded-lg overflow-auto">{htmlOutput}</pre>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader><CardTitle className="text-lg">Aperçu en direct</CardTitle></CardHeader>
          <CardContent>
            <div className="min-h-[400px] border border-dashed border-muted-foreground/30 rounded-lg p-8 flex items-center justify-center bg-background">
              {tag === "input" ? (
                <input className={classes} placeholder="Type here..." />
              ) : (
                <div className={classes} dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Le rendu utilise les classes Tailwind natives du projet
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
