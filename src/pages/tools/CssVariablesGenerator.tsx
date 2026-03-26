import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  borderRadius: number;
  spacingBase: number;
  fontSans: string;
  fontMono: string;
}

const DEFAULT_THEME: ThemeConfig = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  accent: "#f59e0b",
  background: "#ffffff",
  foreground: "#0f172a",
  muted: "#f1f5f9",
  borderRadius: 8,
  spacingBase: 4,
  fontSans: "Inter, system-ui, sans-serif",
  fontMono: "JetBrains Mono, monospace",
};

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function CssVariablesGenerator() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [copied, setCopied] = useState<string | null>(null);

  const update = (key: keyof ThemeConfig, value: string | number) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const spacings = useMemo(() => {
    const b = theme.spacingBase;
    return [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map(m => ({
      name: m === 0 ? "0" : String(m),
      value: `${b * m}px`,
    }));
  }, [theme.spacingBase]);

  const cssOutput = useMemo(() => {
    const lines = [
      `:root {`,
      `  /* Colors */`,
      `  --color-primary: ${theme.primary};`,
      `  --color-secondary: ${theme.secondary};`,
      `  --color-accent: ${theme.accent};`,
      `  --color-background: ${theme.background};`,
      `  --color-foreground: ${theme.foreground};`,
      `  --color-muted: ${theme.muted};`,
      ``,
      `  /* Typography */`,
      `  --font-sans: ${theme.fontSans};`,
      `  --font-mono: ${theme.fontMono};`,
      ``,
      `  /* Border Radius */`,
      `  --radius-sm: ${Math.round(theme.borderRadius * 0.5)}px;`,
      `  --radius-md: ${theme.borderRadius}px;`,
      `  --radius-lg: ${Math.round(theme.borderRadius * 1.5)}px;`,
      `  --radius-xl: ${theme.borderRadius * 2}px;`,
      `  --radius-full: 9999px;`,
      ``,
      `  /* Spacing */`,
      ...spacings.map(s => `  --spacing-${s.name}: ${s.value};`),
      `}`,
    ];
    return lines.join("\n");
  }, [theme, spacings]);

  const tailwindOutput = useMemo(() => {
    return `// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${theme.primary}',
        secondary: '${theme.secondary}',
        accent: '${theme.accent}',
        background: '${theme.background}',
        foreground: '${theme.foreground}',
        muted: '${theme.muted}',
      },
      borderRadius: {
        sm: '${Math.round(theme.borderRadius * 0.5)}px',
        md: '${theme.borderRadius}px',
        lg: '${Math.round(theme.borderRadius * 1.5)}px',
        xl: '${theme.borderRadius * 2}px',
      },
      fontFamily: {
        sans: ['${theme.fontSans.split(",")[0].trim()}', 'system-ui', 'sans-serif'],
        mono: ['${theme.fontMono.split(",")[0].trim()}', 'monospace'],
      },
    },
  },
};`;
  }, [theme]);

  const scssOutput = useMemo(() => {
    return [
      `// Colors`,
      `$color-primary: ${theme.primary};`,
      `$color-secondary: ${theme.secondary};`,
      `$color-accent: ${theme.accent};`,
      `$color-background: ${theme.background};`,
      `$color-foreground: ${theme.foreground};`,
      `$color-muted: ${theme.muted};`,
      ``,
      `// Typography`,
      `$font-sans: ${theme.fontSans};`,
      `$font-mono: ${theme.fontMono};`,
      ``,
      `// Border Radius`,
      `$radius-md: ${theme.borderRadius}px;`,
      ``,
      `// Spacing base`,
      `$spacing-base: ${theme.spacingBase}px;`,
    ].join("\n");
  }, [theme]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({ title: "Copié !", description: `${label} copié` });
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, label }: { text: string; label: string }) => (
    <Button variant="outline" size="sm" onClick={() => copyToClipboard(text, label)}>
      {copied === label ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CSS Variables Generator</h1>
          <p className="text-muted-foreground mt-1">Générez un thème complet avec export CSS, Tailwind et SCSS</p>
        </div>
        <Button variant="outline" onClick={() => setTheme(DEFAULT_THEME)}>
          <RotateCcw className="h-4 w-4 mr-2" /> Reset
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">Thème</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(["primary", "secondary", "accent", "background", "foreground", "muted"] as const).map(key => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme[key]}
                  onChange={e => update(key, e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-border"
                />
                <div className="flex-1">
                  <Label className="capitalize text-xs">{key}</Label>
                  <Input
                    value={theme[key]}
                    onChange={e => update(key, e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            ))}
            <div>
              <Label>Border Radius (px)</Label>
              <Input type="number" value={theme.borderRadius} onChange={e => update("borderRadius", Number(e.target.value))} min={0} max={24} />
            </div>
            <div>
              <Label>Spacing Base (px)</Label>
              <Input type="number" value={theme.spacingBase} onChange={e => update("spacingBase", Number(e.target.value))} min={1} max={16} />
            </div>
            <div>
              <Label>Font Sans</Label>
              <Input value={theme.fontSans} onChange={e => update("fontSans", e.target.value)} className="text-xs" />
            </div>
            <div>
              <Label>Font Mono</Label>
              <Input value={theme.fontMono} onChange={e => update("fontMono", e.target.value)} className="text-xs" />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden" style={{ backgroundColor: theme.background, color: theme.foreground, fontFamily: theme.fontSans }}>
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">Titre principal</h2>
                <p style={{ color: theme.foreground + "cc" }}>Un paragraphe de texte pour visualiser le thème choisi.</p>
                <div className="flex gap-3 flex-wrap">
                  <button className="px-4 py-2 text-white font-medium" style={{ backgroundColor: theme.primary, borderRadius: `${theme.borderRadius}px` }}>
                    Primary
                  </button>
                  <button className="px-4 py-2 text-white font-medium" style={{ backgroundColor: theme.secondary, borderRadius: `${theme.borderRadius}px` }}>
                    Secondary
                  </button>
                  <button className="px-4 py-2 font-medium" style={{ backgroundColor: theme.accent, borderRadius: `${theme.borderRadius}px`, color: theme.foreground }}>
                    Accent
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {spacings.slice(0, 8).map(s => (
                    <div key={s.name} className="flex flex-col items-center">
                      <div style={{ width: s.value, height: s.value, backgroundColor: theme.primary + "33", borderRadius: `${theme.borderRadius * 0.5}px`, minWidth: 4, minHeight: 4 }} />
                      <span className="text-[10px] mt-1" style={{ fontFamily: theme.fontMono }}>{s.name}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3" style={{ backgroundColor: theme.muted, borderRadius: `${theme.borderRadius}px` }}>
                  <code style={{ fontFamily: theme.fontMono, fontSize: "0.875rem" }}>const theme = "custom";</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export */}
      <Tabs defaultValue="css">
        <TabsList>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="tailwind">Tailwind</TabsTrigger>
          <TabsTrigger value="scss">SCSS</TabsTrigger>
        </TabsList>
        <TabsContent value="css">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">CSS Custom Properties</CardTitle>
              <CopyBtn text={cssOutput} label="CSS" />
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-96">{cssOutput}</pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tailwind">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tailwind Config</CardTitle>
              <CopyBtn text={tailwindOutput} label="Tailwind" />
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-96">{tailwindOutput}</pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scss">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">SCSS Variables</CardTitle>
              <CopyBtn text={scssOutput} label="SCSS" />
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-96">{scssOutput}</pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
