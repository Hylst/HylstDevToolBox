import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Palette, Upload, Pipette, Eye, Download, History, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToHsv, rgbToCmyk,
  getContrastRatio, getWcagLevel, generatePaletteColors,
} from "@/lib/color-utils";
import PresetPalettesTab from "@/components/color-picker/PresetPalettesTab";
import HslPlaygroundTab from "@/components/color-picker/HslPlaygroundTab";
import { ToolPageLayout } from "@/components/ToolPageLayout";

interface ColorHistory {
  hex: string;
  timestamp: number;
}

export default function ColorPicker() {
  const [color, setColor] = useState("#3b82f6");
  const [history, setHistory] = useState<ColorHistory[]>([]);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const contrastWhite = getContrastRatio(color, "#ffffff");
  const contrastBlack = getContrastRatio(color, "#000000");
  const palettes = generatePaletteColors(hsl);

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${format} copié !`);
  };

  const addToHistory = (hex: string) => {
    setHistory(prev => {
      const filtered = prev.filter(c => c.hex !== hex);
      return [{ hex, timestamp: Date.now() }, ...filtered].slice(0, 20);
    });
  };

  const handleColorChange = (newColor: string) => {
    if (/^#[0-9a-f]{6}$/i.test(newColor)) {
      setColor(newColor);
      addToHistory(newColor);
    }
  };

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // Scale down for performance but keep visible
      const maxDim = 600;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colors = extractDominantColors(imageData.data, 8);
      setExtractedColors(colors);
      setImagePreviewUrl(objectUrl);
      toast.success("Couleurs extraites de l'image !");
    };
    img.src = objectUrl;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    handleColorChange(hex);
    toast.success(`Couleur ${hex} sélectionnée !`);
  };

  const extractDominantColors = (data: Uint8ClampedArray, count: number): string[] => {
    const colorMap: Record<string, number> = {};
    for (let i = 0; i < data.length; i += 16) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const key = `${r},${g},${b}`;
      colorMap[key] = (colorMap[key] || 0) + 1;
    }
    return Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([key]) => {
        const [r, g, b] = key.split(",").map(Number);
        return rgbToHex(r, g, b);
      });
  };

  const exportPalette = (format: "css" | "json" | "tailwind") => {
    const palette = palettes.monochromatic;
    let content = "";
    if (format === "css") {
      content = `:root {\n${palette.map((c, i) => `  --color-${i * 100 + 100}: ${c};`).join("\n")}\n}`;
    } else if (format === "json") {
      content = JSON.stringify(palette.reduce((acc, c, i) => ({ ...acc, [`${i * 100 + 100}`]: c }), {}), null, 2);
    } else {
      content = `colors: {\n  primary: {\n${palette.map((c, i) => `    ${i * 100 + 100}: '${c}',`).join("\n")}\n  }\n}`;
    }
    navigator.clipboard.writeText(content);
    toast.success(`Palette exportée en ${format.toUpperCase()} !`);
  };

  return (
    <ToolPageLayout title="Sélecteur de couleur Pro" description="Outil complet de gestion des couleurs avec conversions, palettes et accessibilité">

      {!imagePreviewUrl && <canvas ref={canvasRef} className="hidden" />}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      <Tabs defaultValue="picker" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="picker">Sélecteur</TabsTrigger>
          <TabsTrigger value="hsl">HSL Lab</TabsTrigger>
          <TabsTrigger value="palettes">Palettes</TabsTrigger>
          <TabsTrigger value="presets">Préconstruites</TabsTrigger>
          <TabsTrigger value="contrast">Contraste</TabsTrigger>
          <TabsTrigger value="extract">Extraction</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* === Sélecteur === */}
        <TabsContent value="picker" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pipette className="h-5 w-5" /> Couleur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="w-full h-40 rounded-lg border-4 border-border shadow-lg" style={{ backgroundColor: color }} />
                <Input type="color" value={color} onChange={(e) => handleColorChange(e.target.value)} className="w-full h-12 cursor-pointer" />
                <div className="space-y-4">
                  {[
                    { label: `Teinte (H): ${hsl.h}°`, value: hsl.h, max: 360, onChange: (v: number) => { const { r, g, b } = hslToRgb(v, hsl.s, hsl.l); handleColorChange(rgbToHex(r, g, b)); } },
                    { label: `Saturation (S): ${hsl.s}%`, value: hsl.s, max: 100, onChange: (v: number) => { const { r, g, b } = hslToRgb(hsl.h, v, hsl.l); handleColorChange(rgbToHex(r, g, b)); } },
                    { label: `Luminosité (L): ${hsl.l}%`, value: hsl.l, max: 100, onChange: (v: number) => { const { r, g, b } = hslToRgb(hsl.h, hsl.s, v); handleColorChange(rgbToHex(r, g, b)); } },
                  ].map((slider) => (
                    <div key={slider.label} className="space-y-2">
                      <Label>{slider.label}</Label>
                      <Slider value={[slider.value]} max={slider.max} step={1} onValueChange={([v]) => slider.onChange(v)} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Formats</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "HEX", value: color.toUpperCase(), tooltip: "Hexadécimal : représentation en base 16" },
                  { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, tooltip: "Red Green Blue : modèle additif" },
                  { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, tooltip: "Hue Saturation Lightness" },
                  { label: "HSV", value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`, tooltip: "Hue Saturation Value" },
                  { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, tooltip: "Cyan Magenta Yellow Key (impression)" },
                ].map((format) => (
                  <div key={format.label} className="space-y-1">
                    <Label><Tooltip content={format.tooltip}>{format.label}</Tooltip></Label>
                    <div className="flex gap-2">
                      <Input value={format.value} readOnly className="font-mono text-sm" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(format.value, format.label)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === HSL Lab === */}
        <TabsContent value="hsl">
          <HslPlaygroundTab onColorSelect={handleColorChange} />
        </TabsContent>

        {/* === Palettes générées === */}
        <TabsContent value="palettes" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => exportPalette("css")}>
              <Download className="h-4 w-4 mr-2" /> CSS Variables
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportPalette("json")}>
              <Download className="h-4 w-4 mr-2" /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportPalette("tailwind")}>
              <Download className="h-4 w-4 mr-2" /> Tailwind
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Monochromatique", colors: palettes.monochromatic, tooltip: "Variations de luminosité" },
              { title: "Complémentaire", colors: [color, palettes.complementary], tooltip: "Couleur opposée sur le cercle" },
              { title: "Triadique", colors: palettes.triadic, tooltip: "3 couleurs équidistantes" },
              { title: "Analogues", colors: palettes.analogous, tooltip: "Couleurs adjacentes" },
              { title: "Split-complémentaire", colors: palettes.splitComplementary, tooltip: "Variations de la complémentaire" },
              { title: "Tétradique", colors: palettes.tetradic, tooltip: "4 couleurs équidistantes" },
            ].map((palette) => (
              <Card key={palette.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm"><Tooltip content={palette.tooltip}>{palette.title}</Tooltip></CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {palette.colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => { copyToClipboard(c, "Couleur"); handleColorChange(c); }}
                        className="flex-1 aspect-square rounded-lg border-2 border-border hover:scale-105 transition-transform cursor-pointer relative group"
                        style={{ backgroundColor: c }}
                        title={c}
                      >
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 bg-background/80 px-1 rounded">{c}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* === Palettes Préconstruites === */}
        <TabsContent value="presets">
          <PresetPalettesTab onColorSelect={handleColorChange} />
        </TabsContent>

        {/* === Contraste === */}
        <TabsContent value="contrast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <Tooltip content="Web Content Accessibility Guidelines - normes d'accessibilité web">Vérificateur WCAG</Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { label: "Texte blanc", textColor: "#ffffff", ratio: contrastWhite },
                  { label: "Texte noir", textColor: "#000000", ratio: contrastBlack },
                ].map(({ label, textColor, ratio }) => (
                  <div key={label} className="space-y-4">
                    <div className="p-6 rounded-lg text-center" style={{ backgroundColor: color, color: textColor }}>
                      <p className="text-2xl font-bold">{label}</p>
                      <p className="text-sm">Ratio: {ratio.toFixed(2)}:1</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Contraste avec {label.toLowerCase().replace("texte ", "")}</span>
                      <div className="flex gap-2">
                        <Badge className={getWcagLevel(ratio).color}>{getWcagLevel(ratio).level}</Badge>
                        <span className="font-mono">{ratio.toFixed(2)}:1</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Niveaux WCAG</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li><Badge className="bg-green-500 mr-2">AAA</Badge> ≥ 7:1 - Excellent (texte normal)</li>
                  <li><Badge className="bg-yellow-500 mr-2">AA</Badge> ≥ 4.5:1 - Bon (texte normal)</li>
                  <li><Badge className="bg-orange-500 mr-2">AA Large</Badge> ≥ 3:1 - Acceptable (grand texte 18px+)</li>
                  <li><Badge className="bg-red-500 mr-2">Échec</Badge> {"<"} 3:1 - Non conforme</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Extraction === */}
        <TabsContent value="extract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Extraction de couleurs depuis une image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" /> Charger une image
              </Button>
              
              {imagePreviewUrl && (
                <div className="space-y-2">
                  <Label>Cliquez sur l'image pour extraire une couleur</Label>
                  <div className="relative border rounded-lg overflow-hidden cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      className="w-full h-auto max-h-[400px] object-contain block"
                    />
                  </div>
                </div>
              )}
              
              {!imagePreviewUrl && (
                <canvas ref={canvasRef} className="hidden" />
              )}
              
              {extractedColors.length > 0 && (
                <div className="space-y-2">
                  <Label>Couleurs dominantes extraites</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {extractedColors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => { handleColorChange(c); copyToClipboard(c, "Couleur"); }}
                        className="aspect-square rounded-lg border-2 border-border hover:scale-105 transition-transform cursor-pointer relative group"
                        style={{ backgroundColor: c }}
                        title={c}
                      >
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100">{c}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Historique === */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><History className="h-5 w-5" /> Historique des couleurs</span>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setHistory([])}><Trash2 className="h-4 w-4 mr-2" /> Effacer</Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Aucune couleur dans l'historique</p>
              ) : (
                <div className="grid grid-cols-10 gap-2">
                  {history.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { setColor(item.hex); copyToClipboard(item.hex, "Couleur"); }}
                      className="aspect-square rounded-lg border-2 border-border hover:scale-105 transition-transform cursor-pointer relative group"
                      style={{ backgroundColor: item.hex }}
                      title={item.hex}
                    >
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100">{item.hex}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ToolPageLayout>
  );
}
