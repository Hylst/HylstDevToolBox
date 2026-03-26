import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, Copy, RotateCcw, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Filter {
  name: string;
  prop: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

const filters: Filter[] = [
  { name: "Blur", prop: "blur", unit: "px", min: 0, max: 20, step: 0.5, default: 0 },
  { name: "Brightness", prop: "brightness", unit: "%", min: 0, max: 300, step: 5, default: 100 },
  { name: "Contrast", prop: "contrast", unit: "%", min: 0, max: 300, step: 5, default: 100 },
  { name: "Grayscale", prop: "grayscale", unit: "%", min: 0, max: 100, step: 1, default: 0 },
  { name: "Hue Rotate", prop: "hue-rotate", unit: "deg", min: 0, max: 360, step: 1, default: 0 },
  { name: "Invert", prop: "invert", unit: "%", min: 0, max: 100, step: 1, default: 0 },
  { name: "Opacity", prop: "opacity", unit: "%", min: 0, max: 100, step: 1, default: 100 },
  { name: "Saturate", prop: "saturate", unit: "%", min: 0, max: 300, step: 5, default: 100 },
  { name: "Sepia", prop: "sepia", unit: "%", min: 0, max: 100, step: 1, default: 0 },
];

const presets = [
  { name: "Aucun", values: {} },
  { name: "Noir & Blanc", values: { grayscale: 100 } },
  { name: "Vintage", values: { sepia: 60, contrast: 120, brightness: 90 } },
  { name: "Pop Art", values: { saturate: 250, contrast: 150, brightness: 110 } },
  { name: "Négatif", values: { invert: 100 } },
  { name: "Flou doux", values: { blur: 3, brightness: 105 } },
  { name: "Chaleureux", values: { "hue-rotate": 15, saturate: 130, brightness: 105 } },
  { name: "Froid", values: { "hue-rotate": 200, saturate: 80, brightness: 95 } },
  { name: "Dramatique", values: { contrast: 200, brightness: 80, saturate: 150 } },
];

const demoImages = [
  { name: "Paysage", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop" },
  { name: "Portrait", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=400&fit=crop" },
  { name: "Architecture", url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=400&fit=crop" },
  { name: "Nature", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop" },
];

export default function CssFilterEditor() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [selectedImage, setSelectedImage] = useState(demoImages[0].url);

  const getValue = (f: Filter) => values[f.prop] ?? f.default;

  const filterString = filters
    .filter(f => getValue(f) !== f.default)
    .map(f => {
      const v = getValue(f);
      return f.prop === "blur" ? `blur(${v}px)` : f.prop === "hue-rotate" ? `hue-rotate(${v}deg)` : `${f.prop}(${v}%)`;
    })
    .join(" ") || "none";

  const cssCode = `filter: ${filterString};`;

  const reset = () => setValues({});

  const applyPreset = (preset: typeof presets[0]) => {
    const newValues: Record<string, number> = {};
    for (const [key, val] of Object.entries(preset.values)) {
      newValues[key] = val;
    }
    setValues(newValues);
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
    toast.success("CSS copié !");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <SlidersHorizontal className="h-8 w-8 text-primary" />CSS Filter Editor
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Aperçu</CardTitle>
                <Select value={selectedImage} onValueChange={setSelectedImage}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {demoImages.map(img => (
                      <SelectItem key={img.name} value={img.url}>{img.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-center">Avant</p>
                  <img src={selectedImage} alt="Original" className="rounded-lg w-full h-48 object-cover" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-center">Après</p>
                  <img src={selectedImage} alt="Filtered" className="rounded-lg w-full h-48 object-cover" style={{ filter: filterString }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Code CSS</CardTitle></CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm break-all">{cssCode}</div>
              <div className="flex gap-2 mt-3">
                <Button onClick={copyCSS} size="sm" className="flex-1"><Copy className="h-4 w-4 mr-1" />Copier</Button>
                <Button onClick={reset} size="sm" variant="outline"><RotateCcw className="h-4 w-4 mr-1" />Reset</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Presets</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {presets.map(p => (
                <Button key={p.name} variant="outline" size="sm" onClick={() => applyPreset(p)}>{p.name}</Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Filtres</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {filters.map(f => {
              const val = getValue(f);
              const isModified = val !== f.default;
              return (
                <div key={f.prop}>
                  <div className="flex items-center justify-between mb-1">
                    <Label className={`text-xs ${isModified ? "text-primary font-medium" : ""}`}>
                      {f.name}: {val}{f.unit}
                    </Label>
                    {isModified && (
                      <button
                        onClick={() => setValues(prev => { const n = { ...prev }; delete n[f.prop]; return n; })}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <Slider
                    value={[val]}
                    onValueChange={([v]) => setValues(prev => ({ ...prev, [f.prop]: v }))}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
