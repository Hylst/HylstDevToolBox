import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RATIOS = [
  { name: "Minor Second", value: 1.067 },
  { name: "Major Second", value: 1.125 },
  { name: "Minor Third", value: 1.2 },
  { name: "Major Third", value: 1.25 },
  { name: "Perfect Fourth", value: 1.333 },
  { name: "Augmented Fourth", value: 1.414 },
  { name: "Perfect Fifth", value: 1.5 },
  { name: "Golden Ratio", value: 1.618 },
];

const SCALE_NAMES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"];

export default function TypographyScale() {
  const { toast } = useToast();
  const [baseSize, setBaseSize] = useState(16);
  const [ratio, setRatio] = useState(1.25);
  const [baseIndex, setBaseIndex] = useState(2); // "base" is index 2
  const [copied, setCopied] = useState<string | null>(null);

  const scale = useMemo(() => {
    return SCALE_NAMES.map((name, i) => {
      const diff = i - baseIndex;
      const size = baseSize * Math.pow(ratio, diff);
      return { name, size: Math.round(size * 100) / 100 };
    });
  }, [baseSize, ratio, baseIndex]);

  const cssCode = useMemo(() => {
    const lines = scale.map(s => `  --font-size-${s.name}: ${s.size.toFixed(2)}px;`);
    return `:root {\n${lines.join("\n")}\n}`;
  }, [scale]);

  const tailwindCode = useMemo(() => {
    const entries = scale.map(s => `        '${s.name}': '${s.size.toFixed(2)}px',`);
    return `// tailwind.config.ts\nmodule.exports = {\n  theme: {\n    fontSize: {\n${entries.join("\n")}\n    },\n  },\n};`;
  }, [scale]);

  const scssCode = useMemo(() => {
    const lines = scale.map(s => `$font-size-${s.name}: ${s.size.toFixed(2)}px;`);
    return lines.join("\n");
  }, [scale]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({ title: "Copié !", description: `${label} copié dans le presse-papier` });
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, label }: { text: string; label: string }) => (
    <Button variant="outline" size="sm" onClick={() => copyToClipboard(text, label)}>
      {copied === label ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Typography Scale Calculator</h1>
        <p className="text-muted-foreground mt-1">Calculez une échelle typographique harmonieuse avec ratio et preview</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paramètres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Taille de base (px)</Label>
              <Input
                type="number"
                value={baseSize}
                onChange={e => setBaseSize(Number(e.target.value) || 16)}
                min={8}
                max={32}
              />
            </div>
            <div>
              <Label>Ratio</Label>
              <Select value={String(ratio)} onValueChange={v => setRatio(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RATIOS.map(r => (
                    <SelectItem key={r.value} value={String(r.value)}>
                      {r.name} ({r.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ratio personnalisé</Label>
              <Input
                type="number"
                step="0.001"
                value={ratio}
                onChange={e => setRatio(Number(e.target.value) || 1.25)}
                min={1}
                max={3}
              />
            </div>
            <div className="p-3 rounded-md bg-muted text-sm">
              <p><strong>Base :</strong> {baseSize}px</p>
              <p><strong>Ratio :</strong> {ratio}</p>
              <p><strong>Échelle :</strong> {scale.length} niveaux</p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
            <CardDescription>Aperçu de l'échelle typographique en temps réel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scale.map(s => (
              <div key={s.name} className="flex items-baseline gap-4 border-b border-border pb-3">
                <span className="text-xs text-muted-foreground w-12 font-mono">{s.name}</span>
                <span className="text-xs text-muted-foreground w-16 font-mono">{s.size.toFixed(1)}px</span>
                <span style={{ fontSize: `${s.size}px`, lineHeight: 1.4 }} className="truncate">
                  Le vif renard brun saute
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Export */}
      <Tabs defaultValue="css">
        <TabsList>
          <TabsTrigger value="css">CSS Custom Properties</TabsTrigger>
          <TabsTrigger value="tailwind">Tailwind Config</TabsTrigger>
          <TabsTrigger value="scss">SCSS Variables</TabsTrigger>
        </TabsList>
        <TabsContent value="css">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">CSS</CardTitle>
              <CopyBtn text={cssCode} label="CSS" />
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto">{cssCode}</pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tailwind">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tailwind</CardTitle>
              <CopyBtn text={tailwindCode} label="Tailwind" />
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto">{tailwindCode}</pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scss">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">SCSS</CardTitle>
              <CopyBtn text={scssCode} label="SCSS" />
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto">{scssCode}</pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
