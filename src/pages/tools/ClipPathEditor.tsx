import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Scissors, Copy, Check, RotateCcw, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ShapeType = "polygon" | "circle" | "ellipse" | "inset";

interface Point { x: number; y: number }

const presets: { name: string; type: ShapeType; points?: Point[]; params?: number[] }[] = [
  { name: "Triangle", type: "polygon", points: [{ x: 50, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }] },
  { name: "Losange", type: "polygon", points: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }] },
  { name: "Pentagone", type: "polygon", points: [{ x: 50, y: 0 }, { x: 100, y: 38 }, { x: 82, y: 100 }, { x: 18, y: 100 }, { x: 0, y: 38 }] },
  { name: "Hexagone", type: "polygon", points: [{ x: 25, y: 0 }, { x: 75, y: 0 }, { x: 100, y: 50 }, { x: 75, y: 100 }, { x: 25, y: 100 }, { x: 0, y: 50 }] },
  { name: "Étoile", type: "polygon", points: [{ x: 50, y: 0 }, { x: 61, y: 35 }, { x: 98, y: 35 }, { x: 68, y: 57 }, { x: 79, y: 91 }, { x: 50, y: 70 }, { x: 21, y: 91 }, { x: 32, y: 57 }, { x: 2, y: 35 }, { x: 39, y: 35 }] },
  { name: "Flèche droite", type: "polygon", points: [{ x: 0, y: 25 }, { x: 65, y: 25 }, { x: 65, y: 0 }, { x: 100, y: 50 }, { x: 65, y: 100 }, { x: 65, y: 75 }, { x: 0, y: 75 }] },
  { name: "Croix", type: "polygon", points: [{ x: 33, y: 0 }, { x: 66, y: 0 }, { x: 66, y: 33 }, { x: 100, y: 33 }, { x: 100, y: 66 }, { x: 66, y: 66 }, { x: 66, y: 100 }, { x: 33, y: 100 }, { x: 33, y: 66 }, { x: 0, y: 66 }, { x: 0, y: 33 }, { x: 33, y: 33 }] },
  { name: "Cercle", type: "circle", params: [50, 50, 50] },
  { name: "Ellipse", type: "ellipse", params: [40, 50, 50, 50] },
  { name: "Inset", type: "inset", params: [10, 10, 10, 10, 8] },
];

export default function ClipPathEditor() {
  const { toast } = useToast();
  const [shapeType, setShapeType] = useState<ShapeType>("polygon");
  const [points, setPoints] = useState<Point[]>(presets[0].points!);
  const [circleRadius, setCircleRadius] = useState(50);
  const [circleCx, setCircleCx] = useState(50);
  const [circleCy, setCircleCy] = useState(50);
  const [ellipseRx, setEllipseRx] = useState(40);
  const [ellipseRy, setEllipseRy] = useState(50);
  const [ellipseCx, setEllipseCx] = useState(50);
  const [ellipseCy, setEllipseCy] = useState(50);
  const [inset, setInset] = useState([10, 10, 10, 10]);
  const [insetRadius, setInsetRadius] = useState(8);
  const [bgColor, setBgColor] = useState("#6366f1");
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getClipPath = useCallback(() => {
    switch (shapeType) {
      case "polygon":
        return `polygon(${points.map(p => `${p.x.toFixed(1)}% ${p.y.toFixed(1)}%`).join(", ")})`;
      case "circle":
        return `circle(${circleRadius}% at ${circleCx}% ${circleCy}%)`;
      case "ellipse":
        return `ellipse(${ellipseRx}% ${ellipseRy}% at ${ellipseCx}% ${ellipseCy}%)`;
      case "inset":
        return `inset(${inset.map(v => `${v}%`).join(" ")}${insetRadius > 0 ? ` round ${insetRadius}px` : ""})`;
    }
  }, [shapeType, points, circleRadius, circleCx, circleCy, ellipseRx, ellipseRy, ellipseCx, ellipseCy, inset, insetRadius]);

  const clipPath = getClipPath();
  const css = `clip-path: ${clipPath};`;

  const applyPreset = (preset: typeof presets[0]) => {
    setShapeType(preset.type);
    if (preset.type === "polygon" && preset.points) {
      setPoints([...preset.points]);
    } else if (preset.type === "circle" && preset.params) {
      setCircleRadius(preset.params[0]);
      setCircleCx(preset.params[1]);
      setCircleCy(preset.params[2]);
    } else if (preset.type === "ellipse" && preset.params) {
      setEllipseRx(preset.params[0]);
      setEllipseRy(preset.params[1]);
      setEllipseCx(preset.params[2]);
      setEllipseCy(preset.params[3]);
    } else if (preset.type === "inset" && preset.params) {
      setInset(preset.params.slice(0, 4));
      setInsetRadius(preset.params[4] ?? 0);
    }
  };

  const handleSvgMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(index);
  };

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (dragging === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setPoints(prev => prev.map((p, i) => i === dragging ? { x, y } : p));
  }, [dragging]);

  const handleSvgMouseUp = useCallback(() => setDragging(null), []);

  const addPoint = () => {
    if (shapeType !== "polygon") return;
    const last = points[points.length - 1];
    const first = points[0];
    setPoints([...points, { x: (last.x + first.x) / 2, y: (last.y + first.y) / 2 }]);
  };

  const removePoint = (index: number) => {
    if (points.length <= 3) return;
    setPoints(points.filter((_, i) => i !== index));
  };

  const copy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    toast({ title: "CSS copié !" });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Scissors className="h-8 w-8 text-primary" />
          CSS Clip-path Editor
        </h1>
        <p className="text-muted-foreground mt-1">
          Éditeur visuel de formes clip-path — glissez les points pour modifier la forme
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {presets.map(p => (
          <Button key={p.name} variant="outline" size="sm" onClick={() => applyPreset(p)}>{p.name}</Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive canvas */}
        <Card>
          <CardHeader><CardTitle>Éditeur interactif</CardTitle></CardHeader>
          <CardContent>
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {/* Background grid */}
              <div className="absolute inset-0" style={{
                backgroundImage: "linear-gradient(rgba(128,128,128,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.15) 1px, transparent 1px)",
                backgroundSize: "10% 10%",
              }} />

              {/* Clipped shape preview */}
              <div
                className="absolute inset-0"
                style={{ clipPath: clipPath, backgroundColor: bgColor, transition: dragging !== null ? "none" : "clip-path 0.15s ease" }}
              />

              {/* SVG overlay for draggable points (polygon only) */}
              {shapeType === "polygon" && (
                <svg
                  ref={svgRef}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  viewBox="0 0 100 100"
                  onMouseMove={handleSvgMouseMove}
                  onMouseUp={handleSvgMouseUp}
                  onMouseLeave={handleSvgMouseUp}
                >
                  {/* Lines */}
                  <polygon
                    points={points.map(p => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.3"
                    strokeDasharray="1 0.5"
                  />
                  {/* Points */}
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={dragging === i ? 2.5 : 1.8}
                      fill="hsl(var(--primary))"
                      stroke="hsl(var(--background))"
                      strokeWidth="0.5"
                      className="cursor-grab active:cursor-grabbing"
                      onMouseDown={handleSvgMouseDown(i)}
                    />
                  ))}
                </svg>
              )}

              {/* Circle/Ellipse center indicator */}
              {(shapeType === "circle" || shapeType === "ellipse") && (
                <div
                  className="absolute w-3 h-3 rounded-full bg-primary border-2 border-background -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: `${shapeType === "circle" ? circleCx : ellipseCx}%`, top: `${shapeType === "circle" ? circleCy : ellipseCy}%` }}
                />
              )}
            </div>

            <div className="flex items-center gap-3 mt-3">
              <Label>Couleur</Label>
              <Input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-12 h-9 p-1 cursor-pointer" />
              <span className="text-sm text-muted-foreground font-mono">{bgColor}</span>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Paramètres</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Type de forme</Label>
                <Select value={shapeType} onValueChange={(v) => {
                  const type = v as ShapeType;
                  setShapeType(type);
                  if (type === "polygon" && points.length < 3) {
                    setPoints(presets[0].points!);
                  }
                }}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="ellipse">Ellipse</SelectItem>
                    <SelectItem value="inset">Inset</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {shapeType === "polygon" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>{points.length} points</Label>
                    <Button variant="outline" size="sm" onClick={addPoint}>
                      <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </div>
                  <div className="max-h-[240px] overflow-y-auto space-y-1.5">
                    {points.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-5 text-muted-foreground">{i + 1}</span>
                        <Input type="number" value={Math.round(p.x)} onChange={e => setPoints(prev => prev.map((pt, j) => j === i ? { ...pt, x: +e.target.value } : pt))} className="h-8 w-20" min={0} max={100} />
                        <span className="text-muted-foreground">%</span>
                        <Input type="number" value={Math.round(p.y)} onChange={e => setPoints(prev => prev.map((pt, j) => j === i ? { ...pt, y: +e.target.value } : pt))} className="h-8 w-20" min={0} max={100} />
                        <span className="text-muted-foreground">%</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removePoint(i)} disabled={points.length <= 3}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shapeType === "circle" && (
                <div className="space-y-3">
                  <div>
                    <Label className="flex justify-between"><span>Rayon</span><span className="text-muted-foreground">{circleRadius}%</span></Label>
                    <Slider value={[circleRadius]} onValueChange={([v]) => setCircleRadius(v)} min={1} max={100} className="mt-2" />
                  </div>
                  <div>
                    <Label className="flex justify-between"><span>Centre X</span><span className="text-muted-foreground">{circleCx}%</span></Label>
                    <Slider value={[circleCx]} onValueChange={([v]) => setCircleCx(v)} min={0} max={100} className="mt-2" />
                  </div>
                  <div>
                    <Label className="flex justify-between"><span>Centre Y</span><span className="text-muted-foreground">{circleCy}%</span></Label>
                    <Slider value={[circleCy]} onValueChange={([v]) => setCircleCy(v)} min={0} max={100} className="mt-2" />
                  </div>
                </div>
              )}

              {shapeType === "ellipse" && (
                <div className="space-y-3">
                  <div>
                    <Label className="flex justify-between"><span>Rayon X</span><span className="text-muted-foreground">{ellipseRx}%</span></Label>
                    <Slider value={[ellipseRx]} onValueChange={([v]) => setEllipseRx(v)} min={1} max={100} className="mt-2" />
                  </div>
                  <div>
                    <Label className="flex justify-between"><span>Rayon Y</span><span className="text-muted-foreground">{ellipseRy}%</span></Label>
                    <Slider value={[ellipseRy]} onValueChange={([v]) => setEllipseRy(v)} min={1} max={100} className="mt-2" />
                  </div>
                  <div>
                    <Label className="flex justify-between"><span>Centre X</span><span className="text-muted-foreground">{ellipseCx}%</span></Label>
                    <Slider value={[ellipseCx]} onValueChange={([v]) => setEllipseCx(v)} min={0} max={100} className="mt-2" />
                  </div>
                  <div>
                    <Label className="flex justify-between"><span>Centre Y</span><span className="text-muted-foreground">{ellipseCy}%</span></Label>
                    <Slider value={[ellipseCy]} onValueChange={([v]) => setEllipseCy(v)} min={0} max={100} className="mt-2" />
                  </div>
                </div>
              )}

              {shapeType === "inset" && (
                <div className="space-y-3">
                  {["Haut", "Droite", "Bas", "Gauche"].map((label, i) => (
                    <div key={label}>
                      <Label className="flex justify-between"><span>{label}</span><span className="text-muted-foreground">{inset[i]}%</span></Label>
                      <Slider value={[inset[i]]} onValueChange={([v]) => setInset(prev => prev.map((val, j) => j === i ? v : val))} min={0} max={50} className="mt-2" />
                    </div>
                  ))}
                  <div>
                    <Label className="flex justify-between"><span>Border Radius</span><span className="text-muted-foreground">{insetRadius}px</span></Label>
                    <Slider value={[insetRadius]} onValueChange={([v]) => setInsetRadius(v)} min={0} max={50} className="mt-2" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CSS Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                CSS
                <Button variant="outline" size="sm" onClick={copy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted rounded-lg p-4 text-sm font-mono whitespace-pre-wrap break-all">{css}</pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
