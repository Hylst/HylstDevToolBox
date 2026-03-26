import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Copy, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { hslToRgb, rgbToHex } from "@/lib/color-utils";

interface HslPlaygroundTabProps {
  onColorSelect: (color: string) => void;
}

export default function HslPlaygroundTab({ onColorSelect }: HslPlaygroundTabProps) {
  const [h, setH] = useState(210);
  const [s, setS] = useState(80);
  const [l, setL] = useState(50);

  const hex = useMemo(() => {
    const { r, g, b } = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  }, [h, s, l]);

  const hueStrip = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => {
      const hue = i * 10;
      const { r, g, b } = hslToRgb(hue, s, l);
      return rgbToHex(r, g, b);
    });
  }, [s, l]);

  const satStrip = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => {
      const sat = i * 10;
      const { r, g, b } = hslToRgb(h, sat, l);
      return rgbToHex(r, g, b);
    });
  }, [h, l]);

  const lightStrip = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => {
      const lig = i * 10;
      const { r, g, b } = hslToRgb(h, s, lig);
      return rgbToHex(r, g, b);
    });
  }, [h, s]);

  const copyColor = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${text} copié !`);
  };

  const randomize = () => {
    setH(Math.floor(Math.random() * 360));
    setS(Math.floor(Math.random() * 100));
    setL(20 + Math.floor(Math.random() * 60));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            Playground HSL interactif
            <Button variant="outline" size="sm" onClick={randomize}>
              <Shuffle className="h-4 w-4 mr-1" /> Aléatoire
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview */}
          <div className="flex gap-4 items-center">
            <div
              className="w-24 h-24 rounded-xl border-4 border-border shadow-lg shrink-0"
              style={{ backgroundColor: hex }}
            />
            <div className="space-y-1 flex-1">
              <p className="font-mono text-lg font-bold">{hex.toUpperCase()}</p>
              <p className="font-mono text-sm text-muted-foreground">hsl({h}, {s}%, {l}%)</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyColor(hex)}>
                  <Copy className="h-3 w-3 mr-1" /> HEX
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyColor(`hsl(${h}, ${s}%, ${l}%)`)}>
                  <Copy className="h-3 w-3 mr-1" /> HSL
                </Button>
                <Button size="sm" onClick={() => onColorSelect(hex)}>
                  Utiliser
                </Button>
              </div>
            </div>
          </div>

          {/* H slider */}
          <div className="space-y-2">
            <Label>Teinte (H): {h}°</Label>
            <div
              className="h-4 rounded-full mb-1"
              style={{
                background: `linear-gradient(to right, ${hueStrip.join(", ")})`
              }}
            />
            <Slider value={[h]} max={360} step={1} onValueChange={([v]) => setH(v)} />
          </div>

          {/* S slider */}
          <div className="space-y-2">
            <Label>Saturation (S): {s}%</Label>
            <div
              className="h-4 rounded-full mb-1"
              style={{
                background: `linear-gradient(to right, ${satStrip.join(", ")})`
              }}
            />
            <Slider value={[s]} max={100} step={1} onValueChange={([v]) => setS(v)} />
          </div>

          {/* L slider */}
          <div className="space-y-2">
            <Label>Luminosité (L): {l}%</Label>
            <div
              className="h-4 rounded-full mb-1"
              style={{
                background: `linear-gradient(to right, ${lightStrip.join(", ")})`
              }}
            />
            <Slider value={[l]} max={100} step={1} onValueChange={([v]) => setL(v)} />
          </div>

          {/* Generated shades */}
          <div className="space-y-2">
            <Label>Nuances générées</Label>
            <div className="flex gap-1">
              {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95].map(lig => {
                const { r, g, b } = hslToRgb(h, s, lig);
                const c = rgbToHex(r, g, b);
                return (
                  <button
                    key={lig}
                    onClick={() => { onColorSelect(c); copyColor(c); }}
                    className="flex-1 group relative"
                    title={`L:${lig}% → ${c}`}
                  >
                    <div
                      className="h-12 rounded border border-border hover:scale-y-125 transition-transform origin-bottom"
                      style={{ backgroundColor: c }}
                    />
                    <span className="block text-[9px] text-center text-muted-foreground mt-1">{lig}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
