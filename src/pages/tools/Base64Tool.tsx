import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileCode2, Copy, Download, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { ToolPageLayout } from "@/components/ToolPageLayout";

type EncodingFormat = "base64" | "base32" | "hex";

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function encodeBase32(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  while (bits.length % 5 !== 0) bits += "0";
  let result = "";
  for (let i = 0; i < bits.length; i += 5) {
    result += BASE32_CHARS[parseInt(bits.slice(i, i + 5), 2)];
  }
  while (result.length % 8 !== 0) result += "=";
  return result;
}

function decodeBase32(input: string): string {
  const cleaned = input.replace(/=+$/, "").toUpperCase();
  let bits = "";
  for (const ch of cleaned) {
    const idx = BASE32_CHARS.indexOf(ch);
    if (idx === -1) throw new Error(`Caractère Base32 invalide : ${ch}`);
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function encodeHex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function decodeHex(input: string): string {
  const cleaned = input.replace(/\s/g, "");
  if (cleaned.length % 2 !== 0) throw new Error("Longueur hexadécimale invalide");
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    const b = parseInt(cleaned.slice(i, i + 2), 16);
    if (isNaN(b)) throw new Error(`Hex invalide à la position ${i}`);
    bytes.push(b);
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function detectFormat(input: string): EncodingFormat {
  const trimmed = input.trim();
  if (/^[0-9a-fA-F\s]+$/.test(trimmed) && trimmed.replace(/\s/g, "").length % 2 === 0) return "hex";
  if (/^[A-Z2-7]+=*$/i.test(trimmed)) return "base32";
  return "base64";
}

export default function Base64Tool() {
  const [textInput, setTextInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [format, setFormat] = useState<EncodingFormat>("base64");
  const [detectedFormat, setDetectedFormat] = useState<EncodingFormat | null>(null);
  const [imageInput, setImageInput] = useState("");
  const [imageOutput, setImageOutput] = useState("");

  const encode = useCallback(() => {
    if (!textInput.trim()) { toast.error("Veuillez entrer du texte"); return; }
    try {
      let encoded: string;
      switch (format) {
        case "base32": encoded = encodeBase32(textInput); break;
        case "hex": encoded = encodeHex(textInput); break;
        default: encoded = btoa(unescape(encodeURIComponent(textInput))); break;
      }
      setTextOutput(encoded);
      toast.success(`Texte encodé en ${format.toUpperCase()} !`);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'encodage");
    }
  }, [textInput, format]);

  const decode = useCallback(() => {
    if (!textInput.trim()) { toast.error("Veuillez entrer du texte encodé"); return; }
    try {
      let decoded: string;
      switch (format) {
        case "base32": decoded = decodeBase32(textInput); break;
        case "hex": decoded = decodeHex(textInput); break;
        default: decoded = decodeURIComponent(escape(atob(textInput))); break;
      }
      setTextOutput(decoded);
      toast.success(`${format.toUpperCase()} décodé !`);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du décodage");
    }
  }, [textInput, format]);

  const autoDetectAndDecode = useCallback(() => {
    if (!textInput.trim()) return;
    const detected = detectFormat(textInput);
    setDetectedFormat(detected);
    setFormat(detected);
    try {
      let decoded: string;
      switch (detected) {
        case "base32": decoded = decodeBase32(textInput); break;
        case "hex": decoded = decodeHex(textInput); break;
        default: decoded = decodeURIComponent(escape(atob(textInput))); break;
      }
      setTextOutput(decoded);
      toast.success(`Détecté : ${detected.toUpperCase()} — décodé !`);
    } catch {
      toast.error("Impossible de décoder automatiquement");
    }
  }, [textInput]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => { setImageInput(event.target?.result as string); toast.success("Image chargée !"); };
    reader.readAsDataURL(file);
  };

  const decodeImage = () => {
    if (!imageOutput.trim()) { toast.error("Veuillez entrer du Base64"); return; }
    if (!imageOutput.startsWith("data:image/")) setImageOutput("data:image/png;base64," + imageOutput);
    toast.success("Image décodée !");
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copié !"); };
  const downloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url); toast.success("Téléchargé !");
  };

  return (
    <ToolPageLayout title="Encodeur/Décodeur Multi-Format" description="Encodez et décodez en Base64, Base32 et Hexadécimal avec détection automatique du format.">

      <Tabs defaultValue="text" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="text">Texte</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Entrée
                  <div className="flex gap-1">
                    {(["base64", "base32", "hex"] as EncodingFormat[]).map(f => (
                      <Badge
                        key={f}
                        variant={format === f ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => { setFormat(f); setDetectedFormat(null); }}
                      >
                        {f.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Entrez votre texte ou données encodées..."
                  className="min-h-[300px] font-mono text-sm"
                />
                {detectedFormat && (
                  <div className="text-xs text-muted-foreground">
                    Format détecté : <Badge variant="secondary">{detectedFormat.toUpperCase()}</Badge>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={encode} className="flex-1">Encoder</Button>
                  <Button onClick={decode} variant="outline" className="flex-1">Décoder</Button>
                  <Button onClick={autoDetectAndDecode} variant="secondary" size="icon" title="Auto-détection">
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Résultat
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(textOutput)} disabled={!textOutput}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadText(textOutput, "encoded-result.txt")} disabled={!textOutput}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={textOutput} readOnly placeholder="Le résultat apparaîtra ici..." className="min-h-[300px] font-mono text-sm" />
                {textOutput && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {textOutput.length} caractères
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Encoder une image</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image-upload">Sélectionner une image</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input id="image-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    <Button onClick={() => document.getElementById("image-upload")?.click()} variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" /> Choisir une image
                    </Button>
                  </div>
                </div>
                {imageInput && (
                  <div className="space-y-2">
                    <img src={imageInput} alt="Preview" className="w-full max-h-[200px] object-contain rounded-lg border" />
                    <Textarea value={imageInput} readOnly className="min-h-[200px] font-mono text-xs" />
                    <div className="flex gap-2">
                      <Button onClick={() => copyToClipboard(imageInput)} variant="outline" className="flex-1"><Copy className="h-4 w-4 mr-2" /> Copier</Button>
                      <Button onClick={() => downloadText(imageInput, "image-base64.txt")} variant="outline" className="flex-1"><Download className="h-4 w-4 mr-2" /> Télécharger</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Décoder une image</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Textarea value={imageOutput} onChange={(e) => setImageOutput(e.target.value)} placeholder="Collez le Base64 de votre image..." className="min-h-[200px] font-mono text-xs" />
                <Button onClick={decodeImage} className="w-full">Décoder l'image</Button>
                {imageOutput && imageOutput.startsWith("data:image/") && (
                  <div>
                    <Label>Aperçu</Label>
                    <img src={imageOutput} alt="Decoded" className="w-full max-h-[300px] object-contain rounded-lg border mt-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ToolPageLayout>
  );
}
