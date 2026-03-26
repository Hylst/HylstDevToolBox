import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Plus, Trash2, RotateCcw, Type } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TextShadow {
  id: string;
  x: number;
  y: number;
  blur: number;
  color: string;
  opacity: number;
}

const presets = [
  { name: "Subtle", shadows: [{ x: 1, y: 1, blur: 2, color: "#000000", opacity: 30 }] },
  { name: "3D", shadows: [{ x: 1, y: 1, blur: 0, color: "#666666", opacity: 100 }, { x: 2, y: 2, blur: 0, color: "#888888", opacity: 100 }, { x: 3, y: 3, blur: 0, color: "#aaaaaa", opacity: 100 }] },
  { name: "Glow", shadows: [{ x: 0, y: 0, blur: 10, color: "#3b82f6", opacity: 80 }] },
  { name: "Neon", shadows: [{ x: 0, y: 0, blur: 5, color: "#ff00ff", opacity: 100 }, { x: 0, y: 0, blur: 10, color: "#ff00ff", opacity: 80 }, { x: 0, y: 0, blur: 20, color: "#ff00ff", opacity: 60 }] },
  { name: "Retro", shadows: [{ x: 4, y: 4, blur: 0, color: "#e74c3c", opacity: 100 }] },
  { name: "Emboss", shadows: [{ x: -1, y: -1, blur: 1, color: "#ffffff", opacity: 80 }, { x: 1, y: 1, blur: 1, color: "#000000", opacity: 30 }] },
  { name: "Fire", shadows: [{ x: 0, y: 0, blur: 5, color: "#ff0000", opacity: 100 }, { x: 0, y: -5, blur: 10, color: "#ff6600", opacity: 80 }, { x: 0, y: -10, blur: 15, color: "#ffcc00", opacity: 60 }] },
  { name: "Multiple", shadows: [{ x: 3, y: 3, blur: 0, color: "#ff0000", opacity: 100 }, { x: 6, y: 6, blur: 0, color: "#00ff00", opacity: 100 }, { x: 9, y: 9, blur: 0, color: "#0000ff", opacity: 100 }] },
];

const fonts = [
  "Inter", "Arial", "Georgia", "Times New Roman", "Courier New", 
  "Verdana", "Impact", "Comic Sans MS", "Trebuchet MS", "Arial Black"
];

export default function TextShadowGenerator() {
  const [shadows, setShadows] = useState<TextShadow[]>([
    { id: "1", x: 2, y: 2, blur: 4, color: "#000000", opacity: 50 },
  ]);
  const [previewText, setPreviewText] = useState("Text Shadow");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontWeight, setFontWeight] = useState("700");
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#1e293b");

  const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const generateShadowCSS = () => {
    return shadows
      .map((s) => `${s.x}px ${s.y}px ${s.blur}px ${hexToRgba(s.color, s.opacity)}`)
      .join(", ");
  };

  const shadowCSS = generateShadowCSS();

  const addShadow = () => {
    if (shadows.length >= 5) {
      toast.error("Maximum 5 ombres");
      return;
    }
    setShadows([
      ...shadows,
      { id: Date.now().toString(), x: 2, y: 2, blur: 4, color: "#000000", opacity: 50 },
    ]);
  };

  const removeShadow = (id: string) => {
    if (shadows.length <= 1) {
      toast.error("Minimum 1 ombre requise");
      return;
    }
    setShadows(shadows.filter((s) => s.id !== id));
  };

  const updateShadow = (id: string, field: keyof TextShadow, value: number | string) => {
    setShadows(shadows.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setShadows(
      preset.shadows.map((s, i) => ({ ...s, id: Date.now().toString() + i }))
    );
    toast.success(`Preset "${preset.name}" appliqué !`);
  };

  const reset = () => {
    setShadows([{ id: "1", x: 2, y: 2, blur: 4, color: "#000000", opacity: 50 }]);
    setPreviewText("Text Shadow");
    setFontSize(48);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Générateur de Text Shadow</h1>
        <p className="text-muted-foreground">
          Créez des ombres de texte CSS avec plusieurs couches
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Prévisualisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="w-full min-h-[200px] rounded-lg flex items-center justify-center p-8"
              style={{ backgroundColor: bgColor }}
            >
              <span
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily,
                  fontWeight,
                  color: textColor,
                  textShadow: shadowCSS,
                }}
                className="text-center break-words max-w-full"
              >
                {previewText}
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Texte de prévisualisation</Label>
                <Textarea
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="Votre texte..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Taille : {fontSize}px</Label>
                  <Slider
                    value={[fontSize]}
                    min={12}
                    max={120}
                    step={2}
                    onValueChange={([v]) => setFontSize(v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Police</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Poids</Label>
                  <Select value={fontWeight} onValueChange={setFontWeight}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="400">Normal</SelectItem>
                      <SelectItem value="500">Medium</SelectItem>
                      <SelectItem value="600">Semibold</SelectItem>
                      <SelectItem value="700">Bold</SelectItem>
                      <SelectItem value="900">Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Couleur texte</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-10 p-1"
                    />
                    <Input
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fond</Label>
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 p-1"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ombres ({shadows.length})</span>
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
          <CardContent className="space-y-4 max-h-[450px] overflow-y-auto">
            {shadows.map((shadow, index) => (
              <div key={shadow.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Ombre {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeShadow(shadow.id)}
                    disabled={shadows.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>X : {shadow.x}px</Label>
                    <Slider
                      value={[shadow.x]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([v]) => updateShadow(shadow.id, "x", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Y : {shadow.y}px</Label>
                    <Slider
                      value={[shadow.y]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([v]) => updateShadow(shadow.id, "y", v)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Blur : {shadow.blur}px</Label>
                  <Slider
                    value={[shadow.blur]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={([v]) => updateShadow(shadow.id, "blur", v)}
                  />
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
                        className="font-mono text-sm"
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
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={`text-shadow: ${shadowCSS};`}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(`text-shadow: ${shadowCSS};`)}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-4 rounded-lg border-2 border-border hover:border-primary transition-all bg-slate-800"
              >
                <span
                  className="text-2xl font-bold text-white block"
                  style={{
                    textShadow: preset.shadows
                      .map((s) => `${s.x}px ${s.y}px ${s.blur}px rgba(${parseInt(s.color.slice(1, 3), 16)}, ${parseInt(s.color.slice(3, 5), 16)}, ${parseInt(s.color.slice(5, 7), 16)}, ${s.opacity / 100})`)
                      .join(", "),
                  }}
                >
                  Aa
                </span>
                <span className="text-xs text-muted-foreground mt-2 block">{preset.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
