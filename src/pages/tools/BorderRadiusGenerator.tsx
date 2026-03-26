import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Copy, RotateCcw, Link2, Link2Off } from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/Tooltip";

const presets = [
  { name: "Carré", tl: 0, tr: 0, br: 0, bl: 0 },
  { name: "Arrondi", tl: 8, tr: 8, br: 8, bl: 8 },
  { name: "Rond", tl: 50, tr: 50, br: 50, bl: 50, unit: "%" },
  { name: "Pilule", tl: 9999, tr: 9999, br: 9999, bl: 9999 },
  { name: "Blob 1", tl: 30, tr: 70, br: 70, bl: 30 },
  { name: "Blob 2", tl: 60, tr: 40, br: 30, bl: 70 },
  { name: "Leaf", tl: 0, tr: 50, br: 0, bl: 50 },
  { name: "Message", tl: 20, tr: 20, br: 0, bl: 20 },
];

export default function BorderRadiusGenerator() {
  const [linked, setLinked] = useState(true);
  const [topLeft, setTopLeft] = useState(12);
  const [topRight, setTopRight] = useState(12);
  const [bottomRight, setBottomRight] = useState(12);
  const [bottomLeft, setBottomLeft] = useState(12);
  const [unit, setUnit] = useState<"px" | "%">("px");
  const [previewSize, setPreviewSize] = useState(150);
  const [previewBg, setPreviewBg] = useState("#3b82f6");

  const setAllCorners = (value: number) => {
    setTopLeft(value);
    setTopRight(value);
    setBottomRight(value);
    setBottomLeft(value);
  };

  const handleCornerChange = (corner: string, value: number) => {
    if (linked) {
      setAllCorners(value);
    } else {
      switch (corner) {
        case "tl": setTopLeft(value); break;
        case "tr": setTopRight(value); break;
        case "br": setBottomRight(value); break;
        case "bl": setBottomLeft(value); break;
      }
    }
  };

  const borderRadiusCSS = 
    topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft
      ? `${topLeft}${unit}`
      : `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setTopLeft(preset.tl);
    setTopRight(preset.tr);
    setBottomRight(preset.br);
    setBottomLeft(preset.bl);
    if (preset.unit) setUnit(preset.unit as "px" | "%");
    toast.success(`Preset "${preset.name}" appliqué !`);
  };

  const reset = () => {
    setAllCorners(12);
    setUnit("px");
    setLinked(true);
  };

  const randomize = () => {
    setLinked(false);
    setTopLeft(Math.floor(Math.random() * 100));
    setTopRight(Math.floor(Math.random() * 100));
    setBottomRight(Math.floor(Math.random() * 100));
    setBottomLeft(Math.floor(Math.random() * 100));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Générateur de Border Radius</h1>
        <p className="text-muted-foreground">
          Créez des coins arrondis personnalisés pour vos éléments
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Prévisualisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-8 bg-muted rounded-lg min-h-[300px]">
              <div
                style={{
                  width: previewSize,
                  height: previewSize,
                  backgroundColor: previewBg,
                  borderRadius: borderRadiusCSS,
                }}
                className="transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taille : {previewSize}px</Label>
                <Slider
                  value={[previewSize]}
                  min={50}
                  max={250}
                  step={10}
                  onValueChange={([v]) => setPreviewSize(v)}
                />
              </div>
              <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={previewBg}
                    onChange={(e) => setPreviewBg(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={previewBg}
                    onChange={(e) => setPreviewBg(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Configuration</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={randomize}>
                  Aléatoire
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Unit toggle */}
            <div className="flex items-center justify-between">
              <Label>Unité</Label>
              <div className="flex gap-2">
                <Button
                  variant={unit === "px" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUnit("px")}
                >
                  px
                </Button>
                <Button
                  variant={unit === "%" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUnit("%")}
                >
                  %
                </Button>
              </div>
            </div>

            {/* Link toggle */}
            <div className="flex items-center justify-between">
              <Label>
                <Tooltip content="Lier tous les coins pour les modifier ensemble">
                  Lier les coins
                </Tooltip>
              </Label>
              <Button
                variant={linked ? "default" : "outline"}
                size="sm"
                onClick={() => setLinked(!linked)}
              >
                {linked ? <Link2 className="h-4 w-4 mr-2" /> : <Link2Off className="h-4 w-4 mr-2" />}
                {linked ? "Liés" : "Indépendants"}
              </Button>
            </div>

            {/* Corner controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>↖ Haut gauche : {topLeft}{unit}</Label>
                <Slider
                  value={[topLeft]}
                  min={0}
                  max={unit === "%" ? 50 : 200}
                  step={1}
                  onValueChange={([v]) => handleCornerChange("tl", v)}
                />
              </div>
              <div className="space-y-2">
                <Label>↗ Haut droit : {topRight}{unit}</Label>
                <Slider
                  value={[topRight]}
                  min={0}
                  max={unit === "%" ? 50 : 200}
                  step={1}
                  onValueChange={([v]) => handleCornerChange("tr", v)}
                />
              </div>
              <div className="space-y-2">
                <Label>↙ Bas gauche : {bottomLeft}{unit}</Label>
                <Slider
                  value={[bottomLeft]}
                  min={0}
                  max={unit === "%" ? 50 : 200}
                  step={1}
                  onValueChange={([v]) => handleCornerChange("bl", v)}
                />
              </div>
              <div className="space-y-2">
                <Label>↘ Bas droit : {bottomRight}{unit}</Label>
                <Slider
                  value={[bottomRight]}
                  min={0}
                  max={unit === "%" ? 50 : 200}
                  step={1}
                  onValueChange={([v]) => handleCornerChange("br", v)}
                />
              </div>
            </div>

            {/* Visual corner selector */}
            <div className="relative w-48 h-48 mx-auto border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <div
                className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary cursor-pointer hover:border-primary/70"
                style={{ borderTopLeftRadius: `${topLeft}${unit}` }}
                onClick={() => setLinked(false)}
              />
              <div
                className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary cursor-pointer hover:border-primary/70"
                style={{ borderTopRightRadius: `${topRight}${unit}` }}
                onClick={() => setLinked(false)}
              />
              <div
                className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary cursor-pointer hover:border-primary/70"
                style={{ borderBottomLeftRadius: `${bottomLeft}${unit}` }}
                onClick={() => setLinked(false)}
              />
              <div
                className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary cursor-pointer hover:border-primary/70"
                style={{ borderBottomRightRadius: `${bottomRight}${unit}` }}
                onClick={() => setLinked(false)}
              />
              <span className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                Cliquez sur un coin
              </span>
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
          <div className="flex gap-2">
            <Input
              value={`border-radius: ${borderRadiusCSS};`}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(`border-radius: ${borderRadiusCSS};`)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={`rounded-[${borderRadiusCSS}]`}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(`rounded-[${borderRadiusCSS}]`)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-3 rounded-lg border-2 border-border hover:border-primary transition-all flex flex-col items-center gap-2"
              >
                <div
                  className="w-12 h-12 bg-primary"
                  style={{
                    borderRadius: `${preset.tl}${preset.unit || "px"} ${preset.tr}${preset.unit || "px"} ${preset.br}${preset.unit || "px"} ${preset.bl}${preset.unit || "px"}`,
                  }}
                />
                <span className="text-xs font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
