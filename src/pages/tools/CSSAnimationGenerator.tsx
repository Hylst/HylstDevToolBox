import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Play, Pause, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/Tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface Keyframe {
  percent: number;
  transform: string;
  opacity: number;
  scale: number;
}

const presetAnimations = [
  {
    name: "Bounce",
    keyframes: [
      { percent: 0, transform: "translateY(0)", opacity: 1, scale: 1 },
      { percent: 50, transform: "translateY(-30px)", opacity: 1, scale: 1 },
      { percent: 100, transform: "translateY(0)", opacity: 1, scale: 1 },
    ],
    duration: 0.6,
    timing: "ease",
  },
  {
    name: "Fade In",
    keyframes: [
      { percent: 0, transform: "translateY(20px)", opacity: 0, scale: 1 },
      { percent: 100, transform: "translateY(0)", opacity: 1, scale: 1 },
    ],
    duration: 0.5,
    timing: "ease-out",
  },
  {
    name: "Pulse",
    keyframes: [
      { percent: 0, transform: "translateY(0)", opacity: 1, scale: 1 },
      { percent: 50, transform: "translateY(0)", opacity: 1, scale: 1.1 },
      { percent: 100, transform: "translateY(0)", opacity: 1, scale: 1 },
    ],
    duration: 1,
    timing: "ease-in-out",
  },
  {
    name: "Shake",
    keyframes: [
      { percent: 0, transform: "translateX(0)", opacity: 1, scale: 1 },
      { percent: 25, transform: "translateX(-10px)", opacity: 1, scale: 1 },
      { percent: 50, transform: "translateX(10px)", opacity: 1, scale: 1 },
      { percent: 75, transform: "translateX(-10px)", opacity: 1, scale: 1 },
      { percent: 100, transform: "translateX(0)", opacity: 1, scale: 1 },
    ],
    duration: 0.5,
    timing: "ease-in-out",
  },
  {
    name: "Spin",
    keyframes: [
      { percent: 0, transform: "rotate(0deg)", opacity: 1, scale: 1 },
      { percent: 100, transform: "rotate(360deg)", opacity: 1, scale: 1 },
    ],
    duration: 1,
    timing: "linear",
  },
  {
    name: "Slide In",
    keyframes: [
      { percent: 0, transform: "translateX(-100%)", opacity: 0, scale: 1 },
      { percent: 100, transform: "translateX(0)", opacity: 1, scale: 1 },
    ],
    duration: 0.5,
    timing: "ease-out",
  },
  {
    name: "Zoom In",
    keyframes: [
      { percent: 0, transform: "translateY(0)", opacity: 0, scale: 0.5 },
      { percent: 100, transform: "translateY(0)", opacity: 1, scale: 1 },
    ],
    duration: 0.4,
    timing: "ease-out",
  },
  {
    name: "Flip",
    keyframes: [
      { percent: 0, transform: "perspective(400px) rotateY(0)", opacity: 1, scale: 1 },
      { percent: 50, transform: "perspective(400px) rotateY(180deg)", opacity: 1, scale: 1 },
      { percent: 100, transform: "perspective(400px) rotateY(360deg)", opacity: 1, scale: 1 },
    ],
    duration: 1,
    timing: "ease-in-out",
  },
];

const timingFunctions = [
  { value: "linear", label: "Linear" },
  { value: "ease", label: "Ease" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In Out" },
  { value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", label: "Elastic" },
  { value: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", label: "Back" },
  { value: "steps(4, end)", label: "Steps" },
];

export default function CSSAnimationGenerator() {
  const [animationName, setAnimationName] = useState("myAnimation");
  const [duration, setDuration] = useState(1);
  const [timing, setTiming] = useState("ease");
  const [delay, setDelay] = useState(0);
  const [iterationCount, setIterationCount] = useState("1");
  const [direction, setDirection] = useState("normal");
  const [fillMode, setFillMode] = useState("none");
  const [isPlaying, setIsPlaying] = useState(true);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([
    { percent: 0, transform: "translateY(0)", opacity: 1, scale: 1 },
    { percent: 100, transform: "translateY(-20px)", opacity: 0.5, scale: 1.1 },
  ]);
  const [customCSS, setCustomCSS] = useState("");

  const generateKeyframesCSS = () => {
    const sortedKeyframes = [...keyframes].sort((a, b) => a.percent - b.percent);
    return `@keyframes ${animationName} {
${sortedKeyframes.map((kf) => `  ${kf.percent}% {
    transform: ${kf.transform} scale(${kf.scale});
    opacity: ${kf.opacity};
  }`).join("\n")}
}`;
  };

  const generateAnimationCSS = () => {
    return `animation: ${animationName} ${duration}s ${timing} ${delay}s ${iterationCount} ${direction} ${fillMode};`;
  };

  const fullCSS = `${generateKeyframesCSS()}

.animated-element {
  ${generateAnimationCSS()}
}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié !`);
  };

  const applyPreset = (preset: typeof presetAnimations[0]) => {
    setKeyframes(preset.keyframes);
    setDuration(preset.duration);
    setTiming(preset.timing);
    toast.success(`Animation "${preset.name}" appliquée !`);
  };

  const addKeyframe = () => {
    if (keyframes.length >= 10) {
      toast.error("Maximum 10 keyframes");
      return;
    }
    const lastPercent = keyframes[keyframes.length - 1]?.percent || 0;
    const newPercent = Math.min(lastPercent + 25, 100);
    setKeyframes([...keyframes, { percent: newPercent, transform: "translateY(0)", opacity: 1, scale: 1 }]);
  };

  const removeKeyframe = (index: number) => {
    if (keyframes.length <= 2) {
      toast.error("Minimum 2 keyframes requis");
      return;
    }
    setKeyframes(keyframes.filter((_, i) => i !== index));
  };

  const updateKeyframe = (index: number, field: keyof Keyframe, value: number | string) => {
    setKeyframes(keyframes.map((kf, i) => (i === index ? { ...kf, [field]: value } : kf)));
  };

  const reset = () => {
    setKeyframes([
      { percent: 0, transform: "translateY(0)", opacity: 1, scale: 1 },
      { percent: 100, transform: "translateY(-20px)", opacity: 0.5, scale: 1.1 },
    ]);
    setDuration(1);
    setTiming("ease");
    setDelay(0);
    setIterationCount("1");
    setDirection("normal");
    setFillMode("none");
  };

  // Generate inline style for preview
  const previewStyle: React.CSSProperties = {
    animation: isPlaying
      ? `preview-animation ${duration}s ${timing} ${delay}s ${iterationCount === "infinite" ? "infinite" : iterationCount} ${direction} ${fillMode}`
      : "none",
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <style>
        {`@keyframes preview-animation {
${keyframes.sort((a, b) => a.percent - b.percent).map((kf) => `  ${kf.percent}% {
    transform: ${kf.transform} scale(${kf.scale});
    opacity: ${kf.opacity};
  }`).join("\n")}
}`}
      </style>

      <div>
        <h1 className="text-3xl font-bold mb-2">Générateur d'Animations CSS</h1>
        <p className="text-muted-foreground">
          Créez des animations CSS personnalisées avec keyframes
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Prévisualisation
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 rounded-lg bg-muted flex items-center justify-center">
              <div
                key={isPlaying ? "playing" : "stopped"}
                className="w-24 h-24 rounded-lg bg-primary"
                style={previewStyle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="properties">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="properties">Propriétés</TabsTrigger>
                <TabsTrigger value="keyframes">Keyframes</TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nom de l'animation</Label>
                  <Input
                    value={animationName}
                    onChange={(e) => setAnimationName(e.target.value.replace(/\s/g, "-"))}
                    placeholder="myAnimation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Durée : {duration}s</Label>
                    <Slider
                      value={[duration]}
                      min={0.1}
                      max={5}
                      step={0.1}
                      onValueChange={([v]) => setDuration(v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Délai : {delay}s</Label>
                    <Slider
                      value={[delay]}
                      min={0}
                      max={3}
                      step={0.1}
                      onValueChange={([v]) => setDelay(v)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    <Tooltip content="Fonction qui définit la progression de l'animation">
                      Timing Function
                    </Tooltip>
                  </Label>
                  <Select value={timing} onValueChange={setTiming}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timingFunctions.map((tf) => (
                        <SelectItem key={tf.value} value={tf.value}>
                          {tf.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Répétitions</Label>
                    <Select value={iterationCount} onValueChange={setIterationCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="infinite">Infini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Direction</Label>
                    <Select value={direction} onValueChange={setDirection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="reverse">Reverse</SelectItem>
                        <SelectItem value="alternate">Alternate</SelectItem>
                        <SelectItem value="alternate-reverse">Alt-Reverse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fill Mode</Label>
                    <Select value={fillMode} onValueChange={setFillMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="forwards">Forwards</SelectItem>
                        <SelectItem value="backwards">Backwards</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="keyframes" className="space-y-4 mt-4 max-h-[300px] overflow-y-auto">
                <Button variant="outline" size="sm" onClick={addKeyframe} className="w-full">
                  Ajouter un keyframe
                </Button>

                {keyframes.map((kf, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{kf.percent}%</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeKeyframe(index)}
                        disabled={keyframes.length <= 2}
                      >
                        ×
                      </Button>
                    </div>
                    <Slider
                      value={[kf.percent]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([v]) => updateKeyframe(index, "percent", v)}
                    />
                    <div className="space-y-2">
                      <Label className="text-xs">Transform</Label>
                      <Input
                        value={kf.transform}
                        onChange={(e) => updateKeyframe(index, "transform", e.target.value)}
                        className="text-xs"
                        placeholder="translateY(0)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Opacity: {kf.opacity}</Label>
                        <Slider
                          value={[kf.opacity]}
                          min={0}
                          max={1}
                          step={0.1}
                          onValueChange={([v]) => updateKeyframe(index, "opacity", v)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Scale: {kf.scale}</Label>
                        <Slider
                          value={[kf.scale]}
                          min={0.1}
                          max={2}
                          step={0.1}
                          onValueChange={([v]) => updateKeyframe(index, "scale", v)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* CSS Output */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Code CSS généré
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(fullCSS, "CSS")}>
              <Copy className="h-4 w-4 mr-2" />
              Copier tout
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono">
            {fullCSS}
          </pre>
        </CardContent>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Animations prédéfinies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presetAnimations.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-4 rounded-lg border-2 border-border hover:border-primary transition-all flex flex-col items-center gap-2"
              >
                <div className="w-8 h-8 rounded bg-primary animate-pulse" />
                <span className="text-sm font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
