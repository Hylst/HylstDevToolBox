import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, X, RefreshCw, Contrast } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function simulateColorBlindness(hex: string, type: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  let { r, g, b } = rgb;

  switch (type) {
    case "protanopia":
      r = 0.567 * r + 0.433 * g;
      g = 0.558 * r + 0.442 * g;
      b = 0.242 * g + 0.758 * b;
      break;
    case "deuteranopia":
      r = 0.625 * r + 0.375 * g;
      g = 0.7 * r + 0.3 * g;
      b = 0.3 * g + 0.7 * b;
      break;
    case "tritanopia":
      r = 0.95 * r + 0.05 * g;
      g = 0.433 * g + 0.567 * b;
      b = 0.475 * g + 0.525 * b;
      break;
    case "achromatopsia":
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = g = b = gray;
      break;
  }

  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
}

export default function ContrastChecker() {
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");

  const contrastRatio = useMemo(() => getContrastRatio(foreground, background), [foreground, background]);

  const wcagResults = useMemo(() => ({
    aaLargeText: contrastRatio >= 3,
    aaNormalText: contrastRatio >= 4.5,
    aaaLargeText: contrastRatio >= 4.5,
    aaaNormalText: contrastRatio >= 7,
  }), [contrastRatio]);

  const swapColors = () => {
    const temp = foreground;
    setForeground(background);
    setBackground(temp);
  };

  const colorBlindTypes = [
    { id: "normal", name: "Vision normale" },
    { id: "protanopia", name: "Protanopie (rouge)" },
    { id: "deuteranopia", name: "Deutéranopie (vert)" },
    { id: "tritanopia", name: "Tritanopie (bleu)" },
    { id: "achromatopsia", name: "Achromatopsie" },
  ];

  const suggestedColors = useMemo(() => {
    if (contrastRatio >= 7) return [];
    
    const suggestions: string[] = [];
    const bgRgb = hexToRgb(background);
    if (!bgRgb) return [];

    // Suggest darker/lighter variants
    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    
    if (bgLuminance > 0.5) {
      suggestions.push("#000000", "#1a1a1a", "#333333", "#4a4a4a");
    } else {
      suggestions.push("#ffffff", "#f5f5f5", "#e5e5e5", "#d4d4d4");
    }

    return suggestions.filter(s => getContrastRatio(s, background) >= 7);
  }, [background, contrastRatio]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Contrast className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Contrast Checker WCAG</h1>
          <p className="text-muted-foreground">Vérifiez l'accessibilité de vos combinaisons de couleurs</p>
        </div>
      </div>

      <Tabs defaultValue="checker" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checker">Vérificateur</TabsTrigger>
          <TabsTrigger value="simulation">Simulation daltonisme</TabsTrigger>
        </TabsList>

        <TabsContent value="checker" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Color Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>Couleurs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Texte (foreground)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={foreground}
                        onChange={(e) => setForeground(e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={foreground}
                        onChange={(e) => setForeground(e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Arrière-plan (background)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <Button variant="outline" onClick={swapColors} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Inverser les couleurs
                </Button>

                {/* Preview */}
                <div
                  className="p-8 rounded-lg text-center"
                  style={{ backgroundColor: background, color: foreground }}
                >
                  <p className="text-2xl font-bold mb-2">Exemple de texte</p>
                  <p className="text-sm">Ceci est un exemple de texte plus petit pour tester la lisibilité.</p>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Résultats WCAG</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Ratio de contraste</p>
                  <p className="text-5xl font-bold">{contrastRatio.toFixed(2)}:1</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">AA - Texte normal</p>
                      <p className="text-xs text-muted-foreground">Ratio minimum : 4.5:1</p>
                    </div>
                    <Badge variant={wcagResults.aaNormalText ? "default" : "destructive"}>
                      {wcagResults.aaNormalText ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">AA - Grand texte</p>
                      <p className="text-xs text-muted-foreground">Ratio minimum : 3:1 (18pt+ ou 14pt bold+)</p>
                    </div>
                    <Badge variant={wcagResults.aaLargeText ? "default" : "destructive"}>
                      {wcagResults.aaLargeText ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">AAA - Texte normal</p>
                      <p className="text-xs text-muted-foreground">Ratio minimum : 7:1</p>
                    </div>
                    <Badge variant={wcagResults.aaaNormalText ? "default" : "destructive"}>
                      {wcagResults.aaaNormalText ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">AAA - Grand texte</p>
                      <p className="text-xs text-muted-foreground">Ratio minimum : 4.5:1</p>
                    </div>
                    <Badge variant={wcagResults.aaaLargeText ? "default" : "destructive"}>
                      {wcagResults.aaaLargeText ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Badge>
                  </div>
                </div>

                {suggestedColors.length > 0 && (
                  <div className="space-y-2">
                    <Label>Couleurs suggérées (AAA)</Label>
                    <div className="flex gap-2">
                      {suggestedColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            setForeground(color);
                            toast.success("Couleur appliquée");
                          }}
                          className="w-10 h-10 rounded-lg border-2 border-border hover:border-primary transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="simulation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Simulation de daltonisme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colorBlindTypes.map((type) => {
                  const simFg = type.id === "normal" ? foreground : simulateColorBlindness(foreground, type.id);
                  const simBg = type.id === "normal" ? background : simulateColorBlindness(background, type.id);
                  const simRatio = getContrastRatio(simFg, simBg);

                  return (
                    <div key={type.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{type.name}</p>
                        <Badge variant={simRatio >= 4.5 ? "default" : "destructive"} className="text-xs">
                          {simRatio.toFixed(2)}:1
                        </Badge>
                      </div>
                      <div
                        className="p-4 rounded-lg text-center"
                        style={{ backgroundColor: simBg, color: simFg }}
                      >
                        <p className="font-bold">Exemple</p>
                        <p className="text-sm">Texte de test</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
