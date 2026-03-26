import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Layers, Copy, Check, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const presets = [
  { name: "Subtle", blur: 8, opacity: 0.15, border: 0.2, saturation: 100, bgColor: "#ffffff" },
  { name: "Frosted", blur: 16, opacity: 0.25, border: 0.3, saturation: 120, bgColor: "#ffffff" },
  { name: "Bold", blur: 24, opacity: 0.35, border: 0.5, saturation: 140, bgColor: "#ffffff" },
  { name: "Dark Glass", blur: 20, opacity: 0.2, border: 0.15, saturation: 100, bgColor: "#1a1a2e" },
  { name: "Neon", blur: 30, opacity: 0.1, border: 0.4, saturation: 180, bgColor: "#0a0a0a" },
  { name: "Pastel", blur: 12, opacity: 0.4, border: 0.25, saturation: 80, bgColor: "#fef3f2" },
];

export default function GlassmorphismGenerator() {
  const { toast } = useToast();
  const [blur, setBlur] = useState(16);
  const [opacity, setOpacity] = useState(0.25);
  const [borderOpacity, setBorderOpacity] = useState(0.3);
  const [saturation, setSaturation] = useState(120);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [borderRadius, setBorderRadius] = useState(16);
  const [showBorder, setShowBorder] = useState(true);
  const [showShadow, setShowShadow] = useState(true);
  const [copied, setCopied] = useState(false);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const { r, g, b } = hexToRgb(bgColor);

  const glassStyle: React.CSSProperties = {
    background: `rgba(${r}, ${g}, ${b}, ${opacity})`,
    backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    borderRadius: `${borderRadius}px`,
    border: showBorder ? `1px solid rgba(${r}, ${g}, ${b}, ${borderOpacity})` : "none",
    boxShadow: showShadow ? `0 8px 32px 0 rgba(0, 0, 0, 0.15)` : "none",
  };

  const cssCode = `background: rgba(${r}, ${g}, ${b}, ${opacity});
backdrop-filter: blur(${blur}px) saturate(${saturation}%);
-webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
border-radius: ${borderRadius}px;${showBorder ? `\nborder: 1px solid rgba(${r}, ${g}, ${b}, ${borderOpacity});` : ""}${showShadow ? `\nbox-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.15);` : ""}`;

  const tailwindCode = `className="backdrop-blur-[${blur}px] backdrop-saturate-[${saturation}%] bg-[rgba(${r},${g},${b},${opacity})] rounded-[${borderRadius}px]${showBorder ? ` border border-[rgba(${r},${g},${b},${borderOpacity})]` : ""}${showShadow ? " shadow-xl" : ""}"`;

  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    toast({ title: "CSS copié !" });
    setTimeout(() => setCopied(false), 1500);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setBlur(preset.blur);
    setOpacity(preset.opacity);
    setBorderOpacity(preset.border);
    setSaturation(preset.saturation);
    setBgColor(preset.bgColor);
  };

  const reset = () => {
    setBlur(16);
    setOpacity(0.25);
    setBorderOpacity(0.3);
    setSaturation(120);
    setBgColor("#ffffff");
    setBorderRadius(16);
    setShowBorder(true);
    setShowShadow(true);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Layers className="h-8 w-8 text-primary" />
          Glassmorphism Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Créez des effets verre modernes avec backdrop-filter, blur et transparence
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {presets.map((p) => (
          <Button key={p.name} variant="outline" size="sm" onClick={() => applyPreset(p)}>
            {p.name}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <Card>
          <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
          <CardContent>
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                height: 400,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
              }}
            >
              {/* Decorative shapes */}
              <div className="absolute top-8 left-8 w-32 h-32 rounded-full bg-yellow-400/60" />
              <div className="absolute bottom-12 right-12 w-40 h-40 rounded-full bg-blue-400/60" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-pink-400/60" />

              {/* Glass card */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 p-6"
                style={glassStyle}
              >
                <h3 className="text-white text-xl font-bold mb-2">Glass Card</h3>
                <p className="text-white/80 text-sm mb-4">
                  Cet effet utilise backdrop-filter pour créer une surface semi-transparente et floue.
                </p>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/30" />
                  <div className="h-8 w-8 rounded-full bg-white/20" />
                  <div className="h-8 w-8 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Contrôles</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="flex justify-between"><span>Blur</span><span className="text-muted-foreground">{blur}px</span></Label>
                <Slider value={[blur]} onValueChange={([v]) => setBlur(v)} min={0} max={50} step={1} className="mt-2" />
              </div>
              <div>
                <Label className="flex justify-between"><span>Opacité du fond</span><span className="text-muted-foreground">{(opacity * 100).toFixed(0)}%</span></Label>
                <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={0} max={1} step={0.01} className="mt-2" />
              </div>
              <div>
                <Label className="flex justify-between"><span>Saturation</span><span className="text-muted-foreground">{saturation}%</span></Label>
                <Slider value={[saturation]} onValueChange={([v]) => setSaturation(v)} min={0} max={200} step={5} className="mt-2" />
              </div>
              <div>
                <Label className="flex justify-between"><span>Border Radius</span><span className="text-muted-foreground">{borderRadius}px</span></Label>
                <Slider value={[borderRadius]} onValueChange={([v]) => setBorderRadius(v)} min={0} max={50} step={1} className="mt-2" />
              </div>
              <div>
                <Label className="flex justify-between"><span>Opacité bordure</span><span className="text-muted-foreground">{(borderOpacity * 100).toFixed(0)}%</span></Label>
                <Slider value={[borderOpacity]} onValueChange={([v]) => setBorderOpacity(v)} min={0} max={1} step={0.01} className="mt-2" />
              </div>
              <div className="flex items-center gap-4">
                <Label>Couleur de fond</Label>
                <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-16 h-9 p-1 cursor-pointer" />
                <span className="text-sm text-muted-foreground">{bgColor}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={showBorder} onCheckedChange={setShowBorder} />
                  <Label>Bordure</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showShadow} onCheckedChange={setShowShadow} />
                  <Label>Ombre</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSS Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                CSS
                <Button variant="outline" size="sm" onClick={copyCSS}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto whitespace-pre-wrap font-mono">{cssCode}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tailwind</CardTitle></CardHeader>
            <CardContent>
              <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto whitespace-pre-wrap font-mono break-all">{tailwindCode}</pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
