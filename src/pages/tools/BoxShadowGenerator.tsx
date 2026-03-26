import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Copy, Plus, Trash2, RotateCcw, Layers } from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/Tooltip";

interface Shadow {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

const presets = [
  { name: "Subtle", shadows: [{ x: 0, y: 1, blur: 3, spread: 0, color: "#000000", opacity: 10, inset: false }] },
  { name: "Medium", shadows: [{ x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10 }, { x: 0, y: 2, blur: 4, spread: -2, color: "#000000", opacity: 10 }] },
  { name: "Large", shadows: [{ x: 0, y: 10, blur: 15, spread: -3, color: "#000000", opacity: 10 }, { x: 0, y: 4, blur: 6, spread: -4, color: "#000000", opacity: 10 }] },
  { name: "Sharp", shadows: [{ x: 4, y: 4, blur: 0, spread: 0, color: "#000000", opacity: 100, inset: false }] },
  { name: "Glow", shadows: [{ x: 0, y: 0, blur: 20, spread: 5, color: "#3b82f6", opacity: 50, inset: false }] },
  { name: "Inner", shadows: [{ x: 0, y: 2, blur: 4, spread: 0, color: "#000000", opacity: 20, inset: true }] },
  { name: "Neumorphism Light", shadows: [{ x: 10, y: 10, blur: 20, spread: 0, color: "#d1d9e6", opacity: 100, inset: false }, { x: -10, y: -10, blur: 20, spread: 0, color: "#ffffff", opacity: 100, inset: false }] },
  { name: "Neumorphism Dark", shadows: [{ x: 5, y: 5, blur: 10, spread: 0, color: "#1a1a1a", opacity: 100, inset: false }, { x: -5, y: -5, blur: 10, spread: 0, color: "#2a2a2a", opacity: 100, inset: false }] },
];

export default function BoxShadowGenerator() {
  const [shadows, setShadows] = useState<Shadow[]>([
    { id: "1", x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, inset: false },
  ]);
  const [previewBg, setPreviewBg] = useState("#f1f5f9");
  const [previewBoxBg, setPreviewBoxBg] = useState("#ffffff");

  const generateShadowCSS = () => {
    return shadows
      .map((s) => {
        const rgba = hexToRgba(s.color, s.opacity);
        return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${rgba}`;
      })
      .join(", ");
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const shadowCSS = generateShadowCSS();

  const addShadow = () => {
    if (shadows.length >= 5) {
      toast.error("Maximum 5 ombres");
      return;
    }
    setShadows([
      ...shadows,
      { id: Date.now().toString(), x: 0, y: 4, blur: 6, spread: 0, color: "#000000", opacity: 20, inset: false },
    ]);
  };

  const removeShadow = (id: string) => {
    if (shadows.length <= 1) {
      toast.error("Minimum 1 ombre requise");
      return;
    }
    setShadows(shadows.filter((s) => s.id !== id));
  };

  const updateShadow = (id: string, field: keyof Shadow, value: number | string | boolean) => {
    setShadows(shadows.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setShadows(
      preset.shadows.map((s, i) => ({
        ...s,
        id: Date.now().toString() + i,
        inset: s.inset || false,
      }))
    );
    toast.success(`Preset "${preset.name}" appliqué !`);
  };

  const reset = () => {
    setShadows([{ id: "1", x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, inset: false }]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Générateur de Box Shadow</h1>
        <p className="text-muted-foreground">
          Créez des ombres CSS complexes avec plusieurs couches
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
              className="w-full h-64 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: previewBg }}
            >
              <div
                className="w-32 h-32 rounded-lg"
                style={{ backgroundColor: previewBoxBg, boxShadow: shadowCSS }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Arrière-plan</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={previewBg}
                    onChange={(e) => setPreviewBg(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input value={previewBg} onChange={(e) => setPreviewBg(e.target.value)} className="font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Couleur box</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={previewBoxBg}
                    onChange={(e) => setPreviewBoxBg(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input value={previewBoxBg} onChange={(e) => setPreviewBoxBg(e.target.value)} className="font-mono" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Ombres ({shadows.length})
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={addShadow}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[500px] overflow-y-auto">
            {shadows.map((shadow, index) => (
              <div key={shadow.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Ombre {index + 1}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`inset-${shadow.id}`} className="text-sm">
                        <Tooltip content="Ombre intérieure au lieu d'extérieure">Inset</Tooltip>
                      </Label>
                      <Switch
                        id={`inset-${shadow.id}`}
                        checked={shadow.inset}
                        onCheckedChange={(v) => updateShadow(shadow.id, "inset", v)}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeShadow(shadow.id)} disabled={shadows.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      <Tooltip content="Décalage horizontal">X : {shadow.x}px</Tooltip>
                    </Label>
                    <Slider
                      value={[shadow.x]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([v]) => updateShadow(shadow.id, "x", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      <Tooltip content="Décalage vertical">Y : {shadow.y}px</Tooltip>
                    </Label>
                    <Slider
                      value={[shadow.y]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([v]) => updateShadow(shadow.id, "y", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      <Tooltip content="Rayon de flou de l'ombre">Blur : {shadow.blur}px</Tooltip>
                    </Label>
                    <Slider
                      value={[shadow.blur]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([v]) => updateShadow(shadow.id, "blur", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      <Tooltip content="Étalement de l'ombre">Spread : {shadow.spread}px</Tooltip>
                    </Label>
                    <Slider
                      value={[shadow.spread]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([v]) => updateShadow(shadow.id, "spread", v)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Couleur</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={shadow.color}
                        onChange={(e) => updateShadow(shadow.id, "color", e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={shadow.color}
                        onChange={(e) => updateShadow(shadow.id, "color", e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Opacité : {shadow.opacity}%</Label>
                    <Slider
                      value={[shadow.opacity]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([v]) => updateShadow(shadow.id, "opacity", v)}
                    />
                  </div>
                </div>
              </div>
            ))}
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
            <Input value={`box-shadow: ${shadowCSS};`} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(`box-shadow: ${shadowCSS};`)}>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-4 rounded-lg border-2 border-border hover:border-primary transition-all bg-muted/50"
              >
                <div
                  className="w-12 h-12 mx-auto mb-2 rounded bg-background"
                  style={{
                    boxShadow: preset.shadows
                      .map((s) => `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px rgba(0,0,0,${(s.opacity || 20) / 100})`)
                      .join(", "),
                  }}
                />
                <span className="text-sm font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
