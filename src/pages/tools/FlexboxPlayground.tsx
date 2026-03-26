import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Box } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const presets = [
  { name: "Navbar", desc: "Navigation horizontale classique", flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "nowrap", gap: 16 },
  { name: "Card Grid", desc: "Grille de cartes responsive", flexDirection: "row", justifyContent: "flex-start", alignItems: "stretch", flexWrap: "wrap", gap: 16 },
  { name: "Centré", desc: "Centrage parfait horizontal + vertical", flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "nowrap", gap: 0 },
  { name: "Sidebar Layout", desc: "Sidebar fixe + contenu flexible", flexDirection: "row", justifyContent: "flex-start", alignItems: "stretch", flexWrap: "nowrap", gap: 0 },
  { name: "Stack vertical", desc: "Empilement vertical d'éléments", flexDirection: "column", justifyContent: "flex-start", alignItems: "stretch", flexWrap: "nowrap", gap: 8 },
  { name: "Footer", desc: "Pied de page distribué", flexDirection: "row", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", gap: 24 },
  { name: "Holy Grail", desc: "Header + sidebar + content + footer", flexDirection: "column", justifyContent: "flex-start", alignItems: "stretch", flexWrap: "nowrap", gap: 0 },
  { name: "Masonry-like", desc: "Colonnes avec wrap dense", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", flexWrap: "wrap", gap: 8 },
];

const tailwindMap: Record<string, Record<string, string>> = {
  flexDirection: { row: "flex-row", "row-reverse": "flex-row-reverse", column: "flex-col", "column-reverse": "flex-col-reverse" },
  justifyContent: { "flex-start": "justify-start", "flex-end": "justify-end", center: "justify-center", "space-between": "justify-between", "space-around": "justify-around", "space-evenly": "justify-evenly" },
  alignItems: { stretch: "items-stretch", "flex-start": "items-start", "flex-end": "items-end", center: "items-center", baseline: "items-baseline" },
  flexWrap: { nowrap: "flex-nowrap", wrap: "flex-wrap", "wrap-reverse": "flex-wrap-reverse" },
};

const gapToTailwind = (gap: number) => {
  const map: Record<number, string> = { 0: "gap-0", 4: "gap-1", 8: "gap-2", 12: "gap-3", 16: "gap-4", 20: "gap-5", 24: "gap-6", 28: "gap-7", 32: "gap-8", 36: "gap-9", 40: "gap-10", 44: "gap-11", 48: "gap-12" };
  return map[gap] || `gap-[${gap}px]`;
};

export default function FlexboxPlayground() {
  const [flexDirection, setFlexDirection] = useState("row");
  const [justifyContent, setJustifyContent] = useState("flex-start");
  const [alignItems, setAlignItems] = useState("stretch");
  const [flexWrap, setFlexWrap] = useState("nowrap");
  const [gap, setGap] = useState(8);
  const [itemCount, setItemCount] = useState(5);
  const [codeFormat, setCodeFormat] = useState<"css" | "tailwind">("css");

  const containerStyle = {
    display: "flex",
    flexDirection: flexDirection as "row" | "column" | "row-reverse" | "column-reverse",
    justifyContent,
    alignItems,
    flexWrap: flexWrap as "nowrap" | "wrap" | "wrap-reverse",
    gap: `${gap}px`,
    minHeight: "300px",
    padding: "16px",
    border: "2px dashed hsl(var(--border))",
    borderRadius: "8px",
    backgroundColor: "hsl(var(--muted))",
  };

  const cssCode = `.container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${gap}px;
}`;

  const tailwindCode = `<div class="flex ${tailwindMap.flexDirection[flexDirection]} ${tailwindMap.justifyContent[justifyContent]} ${tailwindMap.alignItems[alignItems]} ${tailwindMap.flexWrap[flexWrap]} ${gapToTailwind(gap)}">
  <!-- children -->
</div>`;

  const outputCode = codeFormat === "css" ? cssCode : tailwindCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    toast.success(`${codeFormat.toUpperCase()} copié !`);
  };

  const handleReset = () => {
    setFlexDirection("row");
    setJustifyContent("flex-start");
    setAlignItems("stretch");
    setFlexWrap("nowrap");
    setGap(8);
    setItemCount(5);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setFlexDirection(preset.flexDirection);
    setJustifyContent(preset.justifyContent);
    setAlignItems(preset.alignItems);
    setFlexWrap(preset.flexWrap);
    setGap(preset.gap);
    toast.success(`Preset "${preset.name}" appliqué`);
  };

  const colors = [
    "bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500",
    "bg-pink-500", "bg-cyan-500", "bg-yellow-500", "bg-red-500"
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Box className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Flexbox Playground</h1>
          <p className="text-muted-foreground">Apprenez Flexbox de manière interactive</p>
        </div>
      </div>

      <Tabs defaultValue="playground" className="space-y-4">
        <TabsList>
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Contrôles
                  <Button variant="ghost" size="sm" onClick={handleReset}><RotateCcw className="h-4 w-4" /></Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>flex-direction</Label>
                  <Select value={flexDirection} onValueChange={setFlexDirection}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["row", "row-reverse", "column", "column-reverse"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>justify-content</Label>
                  <Select value={justifyContent} onValueChange={setJustifyContent}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>align-items</Label>
                  <Select value={alignItems} onValueChange={setAlignItems}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["stretch", "flex-start", "flex-end", "center", "baseline"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>flex-wrap</Label>
                  <Select value={flexWrap} onValueChange={setFlexWrap}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["nowrap", "wrap", "wrap-reverse"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>gap: {gap}px</Label>
                  <Slider value={[gap]} onValueChange={([v]) => setGap(v)} min={0} max={48} step={4} />
                </div>
                <div className="space-y-2">
                  <Label>Éléments: {itemCount}</Label>
                  <Slider value={[itemCount]} onValueChange={([v]) => setItemCount(v)} min={1} max={12} step={1} />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Prévisualisation</CardTitle></CardHeader>
              <CardContent>
                <div style={containerStyle}>
                  {Array.from({ length: itemCount }).map((_, i) => (
                    <div key={i} className={`${colors[i % colors.length]} text-white font-bold rounded-lg flex items-center justify-center shadow-md`} style={{ minWidth: "60px", minHeight: "60px", padding: "16px" }}>
                      {i + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Code
                  <div className="flex gap-1">
                    <Button variant={codeFormat === "css" ? "default" : "outline"} size="sm" onClick={() => setCodeFormat("css")}>CSS</Button>
                    <Button variant={codeFormat === "tailwind" ? "default" : "outline"} size="sm" onClick={() => setCodeFormat("tailwind")}>Tailwind</Button>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopy}><Copy className="h-4 w-4 mr-2" />Copier</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">{outputCode}</pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {presets.map((preset) => (
              <Card key={preset.name} className="cursor-pointer hover:border-primary transition-colors" onClick={() => { applyPreset(preset); }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{preset.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{preset.desc}</p>
                </CardHeader>
                <CardContent>
                  <div className="h-24 bg-muted rounded border-2 border-dashed border-border p-2"
                    style={{ display: "flex", flexDirection: preset.flexDirection as any, justifyContent: preset.justifyContent, alignItems: preset.alignItems, flexWrap: preset.flexWrap as any, gap: `${preset.gap / 4}px` }}>
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-primary w-6 h-6 rounded text-xs flex items-center justify-center text-primary-foreground">{n}</div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs">{preset.flexDirection}</Badge>
                    <Badge variant="outline" className="text-xs">{preset.justifyContent}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
