import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Copy, Check, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sizes = [16, 32, 48, 64, 128, 192, 512];
const shapes = ["square", "rounded", "circle"] as const;

export default function FaviconGenerator() {
  const { toast } = useToast();
  const [mode, setMode] = useState<"emoji" | "text">("emoji");
  const [emoji, setEmoji] = useState("🚀");
  const [text, setText] = useState("A");
  const [bgColor, setBgColor] = useState("#6366f1");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(70);
  const [shape, setShape] = useState<typeof shapes[number]>("rounded");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const renderFavicon = useCallback((size: number, canvas?: HTMLCanvasElement): string => {
    const cvs = canvas || document.createElement("canvas");
    cvs.width = size;
    cvs.height = size;
    const ctx = cvs.getContext("2d")!;

    // Background
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = bgColor;
    const r = shape === "circle" ? size / 2 : shape === "rounded" ? size * 0.15 : 0;

    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    } else {
      ctx.roundRect(0, 0, size, size, r);
    }
    ctx.fill();

    // Text/Emoji
    const content = mode === "emoji" ? emoji : text;
    const fSize = (size * fontSize) / 100;
    ctx.font = `bold ${fSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(content, size / 2, size / 2 + fSize * 0.05);

    return cvs.toDataURL("image/png");
  }, [bgColor, emoji, fontSize, mode, shape, text, textColor]);

  useEffect(() => {
    setPreviewUrl(renderFavicon(128));
  }, [renderFavicon]);

  const downloadPNG = (size: number) => {
    const url = renderFavicon(size);
    const a = document.createElement("a");
    a.href = url;
    a.download = `favicon-${size}x${size}.png`;
    a.click();
  };

  const downloadAll = () => {
    sizes.forEach((s, i) => {
      setTimeout(() => downloadPNG(s), i * 200);
    });
    toast({ title: `${sizes.length} favicons téléchargés !` });
  };

  const downloadSVG = () => {
    const content = mode === "emoji" ? emoji : text;
    const r = shape === "circle" ? '50' : shape === "rounded" ? '15' : '0';
    const clipShape = shape === "circle"
      ? `<circle cx="50" cy="50" r="50"/>`
      : `<rect width="100" height="100" rx="${r}"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><clipPath id="clip">${clipShape}</clipPath></defs>
  <rect width="100" height="100" rx="${r}" fill="${bgColor}" clip-path="url(#clip)"/>
  <text x="50" y="50" dominant-baseline="central" text-anchor="middle" font-size="${fontSize}" fill="${textColor}" font-family="sans-serif" font-weight="bold">${content}</text>
</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "favicon.svg";
    a.click();
  };

  const htmlTags = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="192x192" href="/favicon-192x192.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">`;

  const copyTags = () => {
    navigator.clipboard.writeText(htmlTags);
    setCopied(true);
    toast({ title: "Balises HTML copiées !" });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Image className="h-8 w-8 text-primary" />
          Favicon Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Créez des favicons à partir de texte ou d'emoji — export multi-taille PNG & SVG
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "emoji" | "text")}>
              <TabsList className="w-full">
                <TabsTrigger value="emoji" className="flex-1">Emoji</TabsTrigger>
                <TabsTrigger value="text" className="flex-1">Texte</TabsTrigger>
              </TabsList>
              <TabsContent value="emoji" className="mt-3">
                <Label>Emoji</Label>
                <Input value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} className="text-2xl text-center mt-1" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {["🚀", "⚡", "🔥", "💎", "🎯", "✨", "🌍", "📦", "🔧", "💡", "🎨", "🐱"].map(e => (
                    <button key={e} className="text-xl hover:scale-125 transition-transform" onClick={() => setEmoji(e)}>{e}</button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="text" className="mt-3">
                <Label>Texte (1-2 caractères)</Label>
                <Input value={text} onChange={e => setText(e.target.value.slice(0, 2))} maxLength={2} className="text-2xl text-center font-bold mt-1" />
              </TabsContent>
            </Tabs>

            <div>
              <Label>Forme</Label>
              <Select value={shape} onValueChange={(v) => setShape(v as typeof shapes[number])}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Carré</SelectItem>
                  <SelectItem value="rounded">Arrondi</SelectItem>
                  <SelectItem value="circle">Cercle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Fond</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-12 h-9 p-1 cursor-pointer" />
                  <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="font-mono text-sm" />
                </div>
              </div>
              {mode === "text" && (
                <div className="flex-1">
                  <Label>Texte</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-12 h-9 p-1 cursor-pointer" />
                    <Input value={textColor} onChange={e => setTextColor(e.target.value)} className="font-mono text-sm" />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label className="flex justify-between"><span>Taille du contenu</span><span className="text-muted-foreground">{fontSize}%</span></Label>
              <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={30} max={90} step={5} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Preview & Export */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Aperçu</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 flex-wrap">
                {/* Large preview */}
                <div className="bg-muted rounded-xl p-6 flex items-center justify-center">
                  {previewUrl && <img src={previewUrl} alt="Favicon preview" className="w-32 h-32 image-rendering-pixelated" />}
                </div>
                {/* Size previews */}
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">Tailles disponibles</p>
                  <div className="flex items-end gap-3 flex-wrap">
                    {[16, 32, 48, 64].map(s => (
                      <div key={s} className="flex flex-col items-center gap-1">
                        <div className="bg-muted rounded p-1">
                          <img src={renderFavicon(s)} alt={`${s}x${s}`} style={{ width: s, height: s }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Browser tab mockup */}
                <div className="bg-muted rounded-lg p-3 flex-1 min-w-[200px]">
                  <p className="text-xs text-muted-foreground mb-2">Aperçu onglet navigateur</p>
                  <div className="bg-background rounded-t-lg p-2 flex items-center gap-2 border border-b-0">
                    <img src={renderFavicon(16)} alt="tab" className="w-4 h-4" />
                    <span className="text-xs truncate">Mon Site — Accueil</span>
                    <span className="text-muted-foreground text-xs ml-auto">×</span>
                  </div>
                  <div className="bg-background/50 rounded-b-lg p-4 border text-center text-xs text-muted-foreground">
                    Contenu de la page
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Télécharger
                <Button onClick={downloadAll} size="sm">
                  <Download className="h-4 w-4 mr-1" /> Tout télécharger
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <Button key={s} variant="outline" size="sm" onClick={() => downloadPNG(s)}>
                    PNG {s}×{s}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={downloadSVG}>
                  SVG
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Balises HTML
                <Button variant="outline" size="sm" onClick={copyTags}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted rounded-lg p-4 text-sm font-mono whitespace-pre-wrap">{htmlTags}</pre>
            </CardContent>
          </Card>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
