import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { QrCode, Download, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// CODE128 encoding tables
const CODE128_START_B = 104;
const CODE128_STOP = 106;

const CODE128B: Record<string, number> = {};
for (let i = 0; i < 95; i++) {
  CODE128B[String.fromCharCode(32 + i)] = i;
}

const CODE128_PATTERNS: number[][] = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
  [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
  [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],
  [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],
  [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
  [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],
  [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],
  [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
  [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],
  [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
  [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],
  [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
  [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],
  [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
  [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],
  [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
  [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],
  [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
  [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],
  [2,1,1,2,3,2],[2,3,3,1,1,1,2],
];

const STOP_PATTERN = [2,3,3,1,1,1,2];

function encodeCode128(text: string): { bars: boolean[]; error?: string } {
  if (!text) return { bars: [], error: "Texte vide" };
  
  const codes: number[] = [CODE128_START_B];
  for (const char of text) {
    const code = CODE128B[char];
    if (code === undefined) return { bars: [], error: `Caractère non supporté: "${char}"` };
    codes.push(code);
  }
  
  // Checksum
  let checksum = codes[0];
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i;
  }
  codes.push(checksum % 103);
  codes.push(CODE128_STOP);
  
  const bars: boolean[] = [];
  for (let i = 0; i < codes.length; i++) {
    const pattern = i === codes.length - 1 ? STOP_PATTERN : CODE128_PATTERNS[codes[i]];
    if (!pattern) return { bars: [], error: "Erreur d'encodage interne" };
    pattern.forEach((width, j) => {
      const isBar = j % 2 === 0;
      for (let k = 0; k < width; k++) bars.push(isBar);
    });
  }
  
  return { bars };
}

// EAN-13 encoding
const EAN_L: string[] = ["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"];
const EAN_G: string[] = ["0100111","0110011","0011011","0100001","0011101","0111001","0000101","0010001","0001001","0010111"];
const EAN_R: string[] = ["1110010","1100110","1101100","1000010","1011100","1001110","1010000","1000100","1001000","1110100"];
const EAN_FIRST: string[] = ["LLLLLL","LLGLGG","LLGGLG","LLGGGL","LGLLGG","LGGLLG","LGGGLL","LGLGLG","LGLGGL","LGGLGL"];

function encodeEAN13(digits: string): { bars: boolean[]; error?: string } {
  if (!/^\d{13}$/.test(digits)) return { bars: [], error: "EAN-13 nécessite exactement 13 chiffres" };
  
  // Verify checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  const check = (10 - (sum % 10)) % 10;
  if (check !== parseInt(digits[12])) return { bars: [], error: `Checksum invalide (attendu: ${check})` };
  
  const first = parseInt(digits[0]);
  const pattern = EAN_FIRST[first];
  
  let binary = "101"; // Start guard
  for (let i = 0; i < 6; i++) {
    const d = parseInt(digits[i + 1]);
    binary += pattern[i] === "L" ? EAN_L[d] : EAN_G[d];
  }
  binary += "01010"; // Center guard
  for (let i = 0; i < 6; i++) {
    binary += EAN_R[parseInt(digits[i + 7])];
  }
  binary += "101"; // End guard
  
  return { bars: binary.split("").map(b => b === "1") };
}

function encodeEAN8(digits: string): { bars: boolean[]; error?: string } {
  if (!/^\d{8}$/.test(digits)) return { bars: [], error: "EAN-8 nécessite exactement 8 chiffres" };
  
  let binary = "101";
  for (let i = 0; i < 4; i++) binary += EAN_L[parseInt(digits[i])];
  binary += "01010";
  for (let i = 4; i < 8; i++) binary += EAN_R[parseInt(digits[i])];
  binary += "101";
  
  return { bars: binary.split("").map(b => b === "1") };
}

function encodeBarcode(value: string, format: string) {
  switch (format) {
    case "CODE128": return encodeCode128(value);
    case "EAN13": return encodeEAN13(value);
    case "EAN8": return encodeEAN8(value);
    default: return encodeCode128(value);
  }
}

const formats = [
  { value: "CODE128", label: "CODE 128", desc: "Texte alphanumérique (ASCII 32-127)" },
  { value: "EAN13", label: "EAN-13", desc: "13 chiffres avec checksum" },
  { value: "EAN8", label: "EAN-8", desc: "8 chiffres avec checksum" },
];

export default function BarcodeGenerator() {
  const [value, setValue] = useState("Hello World!");
  const [format, setFormat] = useState("CODE128");
  const [barHeight, setBarHeight] = useState([80]);
  const [barWidth, setBarWidth] = useState([2]);
  const [showText, setShowText] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const { bars, error } = useMemo(() => encodeBarcode(value, format), [value, format]);

  const svgWidth = bars.length * barWidth[0] + 20;
  const svgHeight = barHeight[0] + (showText ? 24 : 10);

  const generateSvgString = () => {
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
    svg += `<rect width="100%" height="100%" fill="white"/>`;
    bars.forEach((bar, i) => {
      if (bar) {
        svg += `<rect x="${10 + i * barWidth[0]}" y="5" width="${barWidth[0]}" height="${barHeight[0]}" fill="black"/>`;
      }
    });
    if (showText) {
      svg += `<text x="${svgWidth / 2}" y="${barHeight[0] + 18}" text-anchor="middle" font-family="monospace" font-size="14">${value}</text>`;
    }
    svg += `</svg>`;
    return svg;
  };

  const downloadSVG = () => {
    if (error) return;
    const blob = new Blob([generateSvgString()], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcode-${format}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("SVG téléchargé");
  };

  const downloadPNG = () => {
    if (error) return;
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = svgWidth * scale;
    canvas.height = svgHeight * scale;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `barcode-${format}.png`;
      a.click();
      toast.success("PNG téléchargé");
    };
    img.src = "data:image/svg+xml;base64," + btoa(generateSvgString());
  };

  const copySVG = () => {
    navigator.clipboard.writeText(generateSvgString());
    toast.success("SVG copié dans le presse-papiers");
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <QrCode className="h-8 w-8 text-primary" />
        Barcode Generator
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-sm text-muted-foreground">Format</Label>
              <Select value={format} onValueChange={(v) => { setFormat(v); setValue(v === "EAN13" ? "5901234123457" : v === "EAN8" ? "96385074" : "Hello World!"); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {formats.map(f => (
                    <SelectItem key={f.value} value={f.value}>
                      <div>
                        <span className="font-medium">{f.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{f.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Valeur</Label>
              <Input value={value} onChange={e => setValue(e.target.value)} placeholder="Texte à encoder" className="font-mono" />
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Hauteur des barres: {barHeight[0]}px</Label>
              <Slider value={barHeight} onValueChange={setBarHeight} min={40} max={200} step={5} />
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Épaisseur: {barWidth[0]}px</Label>
              <Slider value={barWidth} onValueChange={setBarWidth} min={1} max={5} step={1} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="showText" checked={showText} onChange={e => setShowText(e.target.checked)} className="rounded" />
              <Label htmlFor="showText" className="text-sm">Afficher le texte sous le code</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Prévisualisation</CardTitle></CardHeader>
          <CardContent>
            {error ? (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg flex flex-col items-center overflow-x-auto">
                <svg ref={svgRef} width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                  <rect width="100%" height="100%" fill="white" />
                  {bars.map((bar, i) =>
                    bar ? (
                      <rect key={i} x={10 + i * barWidth[0]} y={5} width={barWidth[0]} height={barHeight[0]} fill="black" />
                    ) : null
                  )}
                  {showText && (
                    <text x={svgWidth / 2} y={barHeight[0] + 18} textAnchor="middle" fontFamily="monospace" fontSize={14} fill="black">
                      {value}
                    </text>
                  )}
                </svg>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button className="flex-1" onClick={downloadSVG} disabled={!!error}>
                <Download className="h-4 w-4 mr-2" />SVG
              </Button>
              <Button className="flex-1" variant="outline" onClick={downloadPNG} disabled={!!error}>
                <Download className="h-4 w-4 mr-2" />PNG
              </Button>
              <Button variant="outline" onClick={copySVG} disabled={!!error}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
