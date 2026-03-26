import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Harmony = "complementary" | "analogous" | "triadic" | "split-complementary" | "tetradic" | "monochromatic";

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generateHarmony(h: number, s: number, l: number, type: Harmony): { h: number; s: number; l: number }[] {
  const base = { h, s, l };
  switch (type) {
    case "complementary":
      return [base, { h: (h + 180) % 360, s, l }];
    case "analogous":
      return [{ h: (h - 30 + 360) % 360, s, l }, base, { h: (h + 30) % 360, s, l }];
    case "triadic":
      return [base, { h: (h + 120) % 360, s, l }, { h: (h + 240) % 360, s, l }];
    case "split-complementary":
      return [base, { h: (h + 150) % 360, s, l }, { h: (h + 210) % 360, s, l }];
    case "tetradic":
      return [base, { h: (h + 90) % 360, s, l }, { h: (h + 180) % 360, s, l }, { h: (h + 270) % 360, s, l }];
    case "monochromatic":
      return [
        { h, s, l: Math.max(0, l - 0.3) },
        { h, s, l: Math.max(0, l - 0.15) },
        base,
        { h, s, l: Math.min(1, l + 0.15) },
        { h, s, l: Math.min(1, l + 0.3) },
      ];
  }
}

function generateShades(h: number, s: number): { h: number; s: number; l: number; label: string }[] {
  return [
    { h, s, l: 0.95, label: "50" }, { h, s, l: 0.9, label: "100" },
    { h, s, l: 0.8, label: "200" }, { h, s, l: 0.7, label: "300" },
    { h, s, l: 0.6, label: "400" }, { h, s, l: 0.5, label: "500" },
    { h, s, l: 0.4, label: "600" }, { h, s, l: 0.3, label: "700" },
    { h, s, l: 0.2, label: "800" }, { h, s, l: 0.15, label: "900" },
    { h, s, l: 0.1, label: "950" },
  ];
}

const harmonies: { value: Harmony; label: string }[] = [
  { value: "complementary", label: "Complémentaire" },
  { value: "analogous", label: "Analogue" },
  { value: "triadic", label: "Triadique" },
  { value: "split-complementary", label: "Split-Complémentaire" },
  { value: "tetradic", label: "Tétradique" },
  { value: "monochromatic", label: "Monochromatique" },
];

export default function ColorPaletteGenerator() {
  const [hue, setHue] = useState(210);
  const [sat, setSat] = useState(0.8);
  const [light, setLight] = useState(0.5);
  const [harmony, setHarmony] = useState<Harmony>("complementary");

  const colors = useMemo(() => generateHarmony(hue, sat, light, harmony), [hue, sat, light, harmony]);
  const shades = useMemo(() => generateShades(hue, sat), [hue, sat]);

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`${hex} copié !`);
  };

  const copyCSS = () => {
    const vars = colors.map((c, i) => `  --color-${i + 1}: hsl(${Math.round(c.h)}, ${Math.round(c.s * 100)}%, ${Math.round(c.l * 100)}%);`).join("\n");
    navigator.clipboard.writeText(`:root {\n${vars}\n}`);
    toast.success("Variables CSS copiées !");
  };

  const copyTailwind = () => {
    const obj = shades.map(s => `        '${s.label}': '${hslToHex(s.h, s.s, s.l)}',`).join("\n");
    navigator.clipboard.writeText(`colors: {\n  primary: {\n${obj}\n  }\n}`);
    toast.success("Config Tailwind copiée !");
  };

  const randomize = () => {
    setHue(Math.floor(Math.random() * 360));
    setSat(0.5 + Math.random() * 0.5);
    setLight(0.35 + Math.random() * 0.3);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Palette className="h-8 w-8 text-primary" />Color Palette Generator
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Couleur de base</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="h-20 rounded-lg shadow-inner" style={{ background: hslToHex(hue, sat, light) }} />
              <div>
                <Label className="text-xs">Teinte : {hue}°</Label>
                <div className="h-3 rounded-full mt-1 mb-1" style={{ background: "linear-gradient(to right, hsl(0,80%,50%), hsl(60,80%,50%), hsl(120,80%,50%), hsl(180,80%,50%), hsl(240,80%,50%), hsl(300,80%,50%), hsl(360,80%,50%))" }} />
                <Slider value={[hue]} onValueChange={([v]) => setHue(v)} min={0} max={360} step={1} />
              </div>
              <div>
                <Label className="text-xs">Saturation : {Math.round(sat * 100)}%</Label>
                <Slider value={[sat * 100]} onValueChange={([v]) => setSat(v / 100)} min={0} max={100} step={1} />
              </div>
              <div>
                <Label className="text-xs">Luminosité : {Math.round(light * 100)}%</Label>
                <Slider value={[light * 100]} onValueChange={([v]) => setLight(v / 100)} min={5} max={95} step={1} />
              </div>
              <Button variant="outline" onClick={randomize} className="w-full"><RefreshCw className="h-4 w-4 mr-2" />Aléatoire</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Harmonie</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {harmonies.map(h => (
                <Badge key={h.value} variant={harmony === h.value ? "default" : "outline"} className="cursor-pointer" onClick={() => setHarmony(h.value)}>
                  {h.label}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button onClick={copyCSS} size="sm" className="w-full"><Copy className="h-4 w-4 mr-1" />Exporter CSS</Button>
              <Button onClick={copyTailwind} size="sm" variant="outline" className="w-full"><Copy className="h-4 w-4 mr-1" />Exporter Tailwind</Button>
            </CardContent>
          </Card>
        </div>

        {/* Palette */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Palette {harmonies.find(h => h.value === harmony)?.label}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                {colors.map((c, i) => {
                  const hex = hslToHex(c.h, c.s, c.l);
                  return (
                    <div key={i} className="flex-1 min-w-[80px] cursor-pointer group" onClick={() => copyColor(hex)}>
                      <div className="h-24 rounded-lg shadow-md transition-transform group-hover:scale-105" style={{ background: hex }} />
                      <p className="text-xs font-mono text-center mt-2 text-muted-foreground">{hex}</p>
                      <p className="text-xs text-center text-muted-foreground">
                        hsl({Math.round(c.h)}, {Math.round(c.s * 100)}%, {Math.round(c.l * 100)}%)
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Nuances (Shades)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-1">
                {shades.map((s, i) => {
                  const hex = hslToHex(s.h, s.s, s.l);
                  return (
                    <div key={i} className="flex-1 cursor-pointer group" onClick={() => copyColor(hex)}>
                      <div className="h-16 rounded transition-transform group-hover:scale-105" style={{ background: hex }} />
                      <p className="text-xs text-center mt-1 font-mono text-muted-foreground">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Aperçu UI</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-lg" style={{ background: hslToHex(hue, sat, 0.95) }}>
                <h3 className="font-bold" style={{ color: hslToHex(hue, sat, 0.2) }}>Titre d'exemple</h3>
                <p className="text-sm" style={{ color: hslToHex(hue, sat * 0.6, 0.35) }}>Un paragraphe de démonstration avec la palette générée.</p>
                <div className="flex gap-2 mt-3">
                  <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: hslToHex(hue, sat, light) }}>
                    Bouton principal
                  </button>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ color: hslToHex(hue, sat, light), borderColor: hslToHex(hue, sat, light) }}>
                    Secondaire
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
