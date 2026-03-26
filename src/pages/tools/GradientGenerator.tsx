import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Plus, Trash2, RotateCcw, Shuffle, Download } from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/Tooltip";

interface ColorStop {
  color: string;
  position: number;
}

interface GradientPreset {
  name: string;
  colors: ColorStop[];
  type: "linear" | "radial" | "conic";
  angle: number;
}

const presets: GradientPreset[] = [
  { name: "Sunset", colors: [{ color: "#ff7e5f", position: 0 }, { color: "#feb47b", position: 100 }], type: "linear", angle: 135 },
  { name: "Ocean", colors: [{ color: "#2193b0", position: 0 }, { color: "#6dd5ed", position: 100 }], type: "linear", angle: 90 },
  { name: "Purple Haze", colors: [{ color: "#7028e4", position: 0 }, { color: "#e5b2ca", position: 100 }], type: "linear", angle: 45 },
  { name: "Fresh Mint", colors: [{ color: "#00b09b", position: 0 }, { color: "#96c93d", position: 100 }], type: "linear", angle: 180 },
  { name: "Cherry", colors: [{ color: "#eb3349", position: 0 }, { color: "#f45c43", position: 100 }], type: "linear", angle: 90 },
  { name: "Cosmic", colors: [{ color: "#ff00cc", position: 0 }, { color: "#333399", position: 100 }], type: "linear", angle: 135 },
  { name: "Forest", colors: [{ color: "#134e5e", position: 0 }, { color: "#71b280", position: 100 }], type: "linear", angle: 120 },
  { name: "Royal", colors: [{ color: "#141e30", position: 0 }, { color: "#243b55", position: 100 }], type: "linear", angle: 90 },
  { name: "Aurora", colors: [{ color: "#00c6ff", position: 0 }, { color: "#0072ff", position: 50 }, { color: "#7c3aed", position: 100 }], type: "linear", angle: 135 },
  { name: "Fire", colors: [{ color: "#f12711", position: 0 }, { color: "#f5af19", position: 100 }], type: "radial", angle: 0 },
  { name: "Rainbow", colors: [{ color: "#ff0000", position: 0 }, { color: "#ff7f00", position: 17 }, { color: "#ffff00", position: 33 }, { color: "#00ff00", position: 50 }, { color: "#0000ff", position: 67 }, { color: "#8b00ff", position: 100 }], type: "conic", angle: 0 },
];

export default function GradientGenerator() {
  const [gradientType, setGradientType] = useState<"linear" | "radial" | "conic">("linear");
  const [angle, setAngle] = useState(135);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { color: "#667eea", position: 0 },
    { color: "#764ba2", position: 100 },
  ]);
  const [radialShape, setRadialShape] = useState<"circle" | "ellipse">("circle");
  const [radialPosition, setRadialPosition] = useState({ x: 50, y: 50 });

  const generateGradientCSS = () => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsCSS = sortedStops.map(s => `${s.color} ${s.position}%`).join(", ");

    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${stopsCSS})`;
    } else if (gradientType === "radial") {
      return `radial-gradient(${radialShape} at ${radialPosition.x}% ${radialPosition.y}%, ${stopsCSS})`;
    } else {
      return `conic-gradient(from ${angle}deg at ${radialPosition.x}% ${radialPosition.y}%, ${stopsCSS})`;
    }
  };

  const gradientCSS = generateGradientCSS();

  const addColorStop = () => {
    if (colorStops.length >= 10) {
      toast.error("Maximum 10 couleurs");
      return;
    }
    const newPosition = Math.round((colorStops[colorStops.length - 1]?.position || 0 + 50) / 2);
    setColorStops([...colorStops, { color: "#ffffff", position: Math.min(newPosition + 25, 100) }]);
  };

  const removeColorStop = (index: number) => {
    if (colorStops.length <= 2) {
      toast.error("Minimum 2 couleurs requises");
      return;
    }
    setColorStops(colorStops.filter((_, i) => i !== index));
  };

  const updateColorStop = (index: number, field: "color" | "position", value: string | number) => {
    setColorStops(colorStops.map((stop, i) => 
      i === index ? { ...stop, [field]: value } : stop
    ));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
  };

  const applyPreset = (preset: GradientPreset) => {
    setColorStops(preset.colors);
    setGradientType(preset.type);
    setAngle(preset.angle);
    toast.success(`Preset "${preset.name}" appliqué !`);
  };

  const randomGradient = () => {
    const randomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    setColorStops([
      { color: randomColor(), position: 0 },
      { color: randomColor(), position: 100 },
    ]);
    setAngle(Math.floor(Math.random() * 360));
    toast.success("Gradient aléatoire généré !");
  };

  const reset = () => {
    setColorStops([
      { color: "#667eea", position: 0 },
      { color: "#764ba2", position: 100 },
    ]);
    setGradientType("linear");
    setAngle(135);
    setRadialPosition({ x: 50, y: 50 });
  };

  const exportCSS = () => {
    const css = `.gradient {\n  background: ${gradientCSS};\n}`;
    copyToClipboard(css, "CSS");
  };

  const fullCSS = `background: ${gradientCSS};`;
  const tailwindCSS = `bg-gradient-to-${angle >= 315 || angle < 45 ? "t" : angle < 135 ? "tr" : angle < 225 ? "r" : angle < 315 ? "br" : "b"}`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Générateur de Gradients CSS</h1>
        <p className="text-muted-foreground">
          Créez des dégradés CSS personnalisés avec prévisualisation en temps réel
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Prévisualisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="w-full h-64 rounded-lg border-2 border-border shadow-lg"
              style={{ background: gradientCSS }}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={randomGradient}>
                <Shuffle className="h-4 w-4 mr-2" />
                Aléatoire
              </Button>
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSS}>
                <Download className="h-4 w-4 mr-2" />
                Export CSS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={gradientType} onValueChange={(v) => setGradientType(v as typeof gradientType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="linear">
                  <Tooltip content="Dégradé linéaire suivant une direction">Linéaire</Tooltip>
                </TabsTrigger>
                <TabsTrigger value="radial">
                  <Tooltip content="Dégradé circulaire depuis un point central">Radial</Tooltip>
                </TabsTrigger>
                <TabsTrigger value="conic">
                  <Tooltip content="Dégradé en rotation autour d'un point">Conique</Tooltip>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="linear" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Angle : {angle}°</Label>
                  <Slider
                    value={[angle]}
                    max={360}
                    step={1}
                    onValueChange={([v]) => setAngle(v)}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                      <Button
                        key={a}
                        variant={angle === a ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAngle(a)}
                      >
                        {a}°
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="radial" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Forme</Label>
                  <Select value={radialShape} onValueChange={(v) => setRadialShape(v as typeof radialShape)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Cercle</SelectItem>
                      <SelectItem value="ellipse">Ellipse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Position X : {radialPosition.x}%</Label>
                  <Slider
                    value={[radialPosition.x]}
                    max={100}
                    step={1}
                    onValueChange={([x]) => setRadialPosition({ ...radialPosition, x })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position Y : {radialPosition.y}%</Label>
                  <Slider
                    value={[radialPosition.y]}
                    max={100}
                    step={1}
                    onValueChange={([y]) => setRadialPosition({ ...radialPosition, y })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="conic" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Angle de départ : {angle}°</Label>
                  <Slider
                    value={[angle]}
                    max={360}
                    step={1}
                    onValueChange={([v]) => setAngle(v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position X : {radialPosition.x}%</Label>
                  <Slider
                    value={[radialPosition.x]}
                    max={100}
                    step={1}
                    onValueChange={([x]) => setRadialPosition({ ...radialPosition, x })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position Y : {radialPosition.y}%</Label>
                  <Slider
                    value={[radialPosition.y]}
                    max={100}
                    step={1}
                    onValueChange={([y]) => setRadialPosition({ ...radialPosition, y })}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Color Stops */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Couleurs ({colorStops.length})</Label>
                <Button variant="outline" size="sm" onClick={addColorStop}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {colorStops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateColorStop(index, "color", e.target.value)}
                      className="w-12 h-10 cursor-pointer p-1"
                    />
                    <Input
                      value={stop.color}
                      onChange={(e) => updateColorStop(index, "color", e.target.value)}
                      className="w-24 font-mono text-sm"
                    />
                    <div className="flex-1">
                      <Slider
                        value={[stop.position]}
                        max={100}
                        step={1}
                        onValueChange={([v]) => updateColorStop(index, "position", v)}
                      />
                    </div>
                    <span className="w-10 text-sm text-muted-foreground">{stop.position}%</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeColorStop(index)}
                      disabled={colorStops.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSS Output */}
      <Card>
        <CardHeader>
          <CardTitle>Code CSS généré</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>CSS Standard</Label>
            <div className="flex gap-2">
              <Input value={fullCSS} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(fullCSS, "CSS")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tailwind (approximatif)</Label>
            <div className="flex gap-2">
              <Input value={tailwindCSS} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(tailwindCSS, "Tailwind")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Presets populaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="group relative h-20 rounded-lg border-2 border-border hover:border-primary transition-all overflow-hidden"
                style={{
                  background: preset.type === "linear"
                    ? `linear-gradient(${preset.angle}deg, ${preset.colors.map(c => `${c.color} ${c.position}%`).join(", ")})`
                    : preset.type === "radial"
                    ? `radial-gradient(circle, ${preset.colors.map(c => `${c.color} ${c.position}%`).join(", ")})`
                    : `conic-gradient(${preset.colors.map(c => `${c.color} ${c.position}%`).join(", ")})`
                }}
              >
                <span className="absolute bottom-1 left-1 text-xs font-medium text-white bg-black/50 px-1 rounded">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
