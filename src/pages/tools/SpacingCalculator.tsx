import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Copy, RotateCcw, Ruler } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip } from "@/components/Tooltip";

const spacingScales = {
  tailwind: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96],
  bootstrap: [0, 0.25, 0.5, 1, 1.5, 3],
  material: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64],
};

const typographyScales = {
  "Major Third (1.25)": 1.25,
  "Perfect Fourth (1.333)": 1.333,
  "Augmented Fourth (1.414)": 1.414,
  "Perfect Fifth (1.5)": 1.5,
  "Golden Ratio (1.618)": 1.618,
};

export default function SpacingCalculator() {
  const [baseSize, setBaseSize] = useState(16);
  const [scale, setScale] = useState<keyof typeof spacingScales>("tailwind");
  const [customSpacing, setCustomSpacing] = useState(16);
  const [paddingTop, setPaddingTop] = useState(16);
  const [paddingRight, setPaddingRight] = useState(16);
  const [paddingBottom, setPaddingBottom] = useState(16);
  const [paddingLeft, setPaddingLeft] = useState(16);
  const [marginTop, setMarginTop] = useState(0);
  const [marginRight, setMarginRight] = useState(0);
  const [marginBottom, setMarginBottom] = useState(0);
  const [marginLeft, setMarginLeft] = useState(0);
  const [typoScale, setTypoScale] = useState<keyof typeof typographyScales>("Perfect Fourth (1.333)");
  const [typoBase, setTypoBase] = useState(16);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
  };

  const pxToRem = (px: number) => (px / baseSize).toFixed(3).replace(/\.?0+$/, "");
  const pxToEm = (px: number) => (px / baseSize).toFixed(3).replace(/\.?0+$/, "");

  const generateSpacingScale = () => {
    return spacingScales[scale].map((multiplier) => ({
      name: scale === "tailwind" ? multiplier.toString() : `${multiplier}rem`,
      px: multiplier * (scale === "tailwind" ? 4 : baseSize),
      rem: multiplier * (scale === "tailwind" ? 0.25 : 1),
    }));
  };

  const generateTypographyScale = () => {
    const ratio = typographyScales[typoScale];
    const sizes = [];
    for (let i = -2; i <= 6; i++) {
      const size = typoBase * Math.pow(ratio, i);
      sizes.push({
        step: i,
        px: Math.round(size),
        rem: (size / 16).toFixed(3),
        name: ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"][i + 2] || `${i}`,
      });
    }
    return sizes;
  };

  const paddingCSS = `padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;`;
  const marginCSS = `margin: ${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px;`;
  const tailwindPadding = `p-[${paddingTop}px_${paddingRight}px_${paddingBottom}px_${paddingLeft}px]`;
  const tailwindMargin = `m-[${marginTop}px_${marginRight}px_${marginBottom}px_${marginLeft}px]`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Calculateur d'Espacement</h1>
        <p className="text-muted-foreground">
          Gérez les espacements, marges et échelles typographiques
        </p>
      </div>

      <Tabs defaultValue="box-model" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="box-model">Box Model</TabsTrigger>
          <TabsTrigger value="scale">Échelle</TabsTrigger>
          <TabsTrigger value="typography">Typographie</TabsTrigger>
          <TabsTrigger value="converter">Convertisseur</TabsTrigger>
        </TabsList>

        <TabsContent value="box-model" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  <Tooltip content="Modèle de boîte CSS : margin, border, padding, content">
                    Box Model Visuel
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-4">
                  {/* Margin box */}
                  <div
                    className="bg-orange-200 dark:bg-orange-900/50 flex items-center justify-center relative"
                    style={{
                      padding: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
                    }}
                  >
                    <span className="absolute top-1 left-1 text-[10px] text-orange-600 dark:text-orange-400">margin</span>
                    {/* Padding box */}
                    <div
                      className="bg-green-200 dark:bg-green-900/50 flex items-center justify-center relative"
                      style={{
                        padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
                      }}
                    >
                      <span className="absolute top-1 left-1 text-[10px] text-green-600 dark:text-green-400">padding</span>
                      {/* Content */}
                      <div className="w-24 h-24 bg-blue-200 dark:bg-blue-900/50 flex items-center justify-center text-xs text-blue-600 dark:text-blue-400">
                        content
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-green-600">Padding</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Top: {paddingTop}px</Label>
                      <Slider value={[paddingTop]} min={0} max={64} onValueChange={([v]) => setPaddingTop(v)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Right: {paddingRight}px</Label>
                      <Slider value={[paddingRight]} min={0} max={64} onValueChange={([v]) => setPaddingRight(v)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Bottom: {paddingBottom}px</Label>
                      <Slider value={[paddingBottom]} min={0} max={64} onValueChange={([v]) => setPaddingBottom(v)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Left: {paddingLeft}px</Label>
                      <Slider value={[paddingLeft]} min={0} max={64} onValueChange={([v]) => setPaddingLeft(v)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-orange-600">Margin</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Top: {marginTop}px</Label>
                      <Slider value={[marginTop]} min={0} max={64} onValueChange={([v]) => setMarginTop(v)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Right: {marginRight}px</Label>
                      <Slider value={[marginRight]} min={0} max={64} onValueChange={([v]) => setMarginRight(v)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Bottom: {marginBottom}px</Label>
                      <Slider value={[marginBottom]} min={0} max={64} onValueChange={([v]) => setMarginBottom(v)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Left: {marginLeft}px</Label>
                      <Slider value={[marginLeft]} min={0} max={64} onValueChange={([v]) => setMarginLeft(v)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>CSS généré</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input value={paddingCSS} readOnly className="font-mono text-xs" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(paddingCSS, "Padding")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input value={marginCSS} readOnly className="font-mono text-xs" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(marginCSS, "Margin")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scale" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Échelle d'espacement
                <Select value={scale} onValueChange={(v) => setScale(v as typeof scale)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                    <SelectItem value="bootstrap">Bootstrap</SelectItem>
                    <SelectItem value="material">Material Design</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Nom</th>
                      <th className="text-left py-2 px-4">Pixels</th>
                      <th className="text-left py-2 px-4">REM</th>
                      <th className="text-left py-2 px-4">Prévisualisation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateSpacingScale().slice(0, 20).map((item, i) => (
                      <tr key={i} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4 font-mono">{item.name}</td>
                        <td className="py-2 px-4">{item.px}px</td>
                        <td className="py-2 px-4">{item.rem}rem</td>
                        <td className="py-2 px-4">
                          <div className="h-4 bg-primary rounded" style={{ width: Math.min(item.px, 200) }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <Tooltip content="Échelle modulaire pour créer une hiérarchie typographique harmonieuse">
                  Échelle typographique
                </Tooltip>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Base:</Label>
                    <Input
                      type="number"
                      value={typoBase}
                      onChange={(e) => setTypoBase(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                  <Select value={typoScale} onValueChange={(v) => setTypoScale(v as typeof typoScale)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(typographyScales).map((scale) => (
                        <SelectItem key={scale} value={scale}>
                          {scale}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generateTypographyScale().map((item) => (
                  <div key={item.step} className="flex items-center gap-4 border-b pb-2">
                    <span className="w-12 font-mono text-xs text-muted-foreground">{item.name}</span>
                    <span className="w-16 font-mono text-sm">{item.px}px</span>
                    <span className="w-20 font-mono text-sm text-muted-foreground">{item.rem}rem</span>
                    <span style={{ fontSize: `${item.px}px` }} className="flex-1 truncate">
                      The quick brown fox
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`font-size: ${item.rem}rem;`, "Font size")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="converter" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Convertisseur d'unités</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Taille de base (root font-size)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={baseSize}
                      onChange={(e) => setBaseSize(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="flex items-center text-muted-foreground">px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Valeur à convertir</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={customSpacing}
                      onChange={(e) => setCustomSpacing(Number(e.target.value))}
                    />
                    <span className="flex items-center text-muted-foreground">px</span>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Pixels:</span>
                    <span className="font-mono">{customSpacing}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>REM:</span>
                    <span className="font-mono">{pxToRem(customSpacing)}rem</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EM:</span>
                    <span className="font-mono">{pxToEm(customSpacing)}em</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tailwind:</span>
                    <span className="font-mono">{Math.round(customSpacing / 4)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Références rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Tailwind spacing</Label>
                    <p className="text-xs font-mono mt-1">1 unit = 0.25rem = 4px</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Bootstrap spacing</Label>
                    <p className="text-xs font-mono mt-1">$spacer = 1rem = 16px</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Material Design</Label>
                    <p className="text-xs font-mono mt-1">8px grid system</p>
                  </div>
                  <div className="pt-4 border-t">
                    <Label className="text-sm text-muted-foreground">Formules</Label>
                    <ul className="text-xs font-mono mt-2 space-y-1">
                      <li>px → rem: px / {baseSize}</li>
                      <li>rem → px: rem × {baseSize}</li>
                      <li>px → tw: px / 4</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
