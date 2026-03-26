import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Tablet, Monitor, RotateCcw, Maximize, Grid3x3 } from "lucide-react";

interface Device {
  name: string;
  width: number;
  height: number;
  icon: typeof Smartphone;
  category: string;
}

const devices: Device[] = [
  { name: "iPhone SE", width: 375, height: 667, icon: Smartphone, category: "phone" },
  { name: "iPhone 14", width: 390, height: 844, icon: Smartphone, category: "phone" },
  { name: "iPhone 14 Pro Max", width: 430, height: 932, icon: Smartphone, category: "phone" },
  { name: "Galaxy S23", width: 360, height: 780, icon: Smartphone, category: "phone" },
  { name: "Pixel 7", width: 412, height: 915, icon: Smartphone, category: "phone" },
  { name: "iPad Mini", width: 768, height: 1024, icon: Tablet, category: "tablet" },
  { name: "iPad Air", width: 820, height: 1180, icon: Tablet, category: "tablet" },
  { name: "iPad Pro 12.9\"", width: 1024, height: 1366, icon: Tablet, category: "tablet" },
  { name: "Galaxy Tab S8", width: 800, height: 1280, icon: Tablet, category: "tablet" },
  { name: "Laptop", width: 1366, height: 768, icon: Monitor, category: "desktop" },
  { name: "MacBook Air", width: 1440, height: 900, icon: Monitor, category: "desktop" },
  { name: "Desktop HD", width: 1920, height: 1080, icon: Monitor, category: "desktop" },
  { name: "Ultrawide", width: 2560, height: 1080, icon: Monitor, category: "desktop" },
];

const breakpoints = [
  { name: "sm", min: 640, color: "text-blue-500" },
  { name: "md", min: 768, color: "text-green-500" },
  { name: "lg", min: 1024, color: "text-yellow-500" },
  { name: "xl", min: 1280, color: "text-orange-500" },
  { name: "2xl", min: 1536, color: "text-red-500" },
];

function getActiveBreakpoints(w: number) {
  return breakpoints.filter(bp => w >= bp.min);
}

export default function ResponsivePreview() {
  const [url, setUrl] = useState("https://example.com");
  const [selectedDevice, setSelectedDevice] = useState(devices[0]);
  const [rotated, setRotated] = useState(false);
  const [customW, setCustomW] = useState("375");
  const [customH, setCustomH] = useState("667");
  const [useCustom, setUseCustom] = useState(false);
  const [multiView, setMultiView] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");

  const width = useCustom ? (parseInt(customW) || 375) : (rotated ? selectedDevice.height : selectedDevice.width);
  const height = useCustom ? (parseInt(customH) || 667) : (rotated ? selectedDevice.width : selectedDevice.height);

  const active = getActiveBreakpoints(width);

  const filteredDevices = filterCat === "all" ? devices : devices.filter(d => d.category === filterCat);

  const multiDevices = [
    devices.find(d => d.name === "iPhone 14")!,
    devices.find(d => d.name === "iPad Mini")!,
    devices.find(d => d.name === "Laptop")!,
  ];

  const renderIframe = (w: number, h: number, maxW: number, maxH: number) => {
    const scale = Math.min(maxW / w, maxH / h, 1);
    return (
      <div className="border-2 border-muted rounded-lg overflow-hidden bg-background" style={{ width: w * scale, height: h * scale }}>
        <iframe
          src={url}
          className="w-full h-full"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: w, height: h }}
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Monitor className="h-8 w-8 text-primary" />Responsive Preview
      </h1>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-4">
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="flex-1" />
            <Button variant={multiView ? "default" : "outline"} onClick={() => setMultiView(!multiView)}>
              <Grid3x3 className="h-4 w-4 mr-1" />{multiView ? "Multi" : "Simple"}
            </Button>
            <Button variant="outline" onClick={() => setRotated(!rotated)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {!multiView && (
            <>
              <div className="flex gap-2 flex-wrap">
                {["all", "phone", "tablet", "desktop"].map(cat => (
                  <Badge key={cat} variant={filterCat === cat ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilterCat(cat)}>
                    {cat === "all" ? "Tous" : cat === "phone" ? "📱 Phones" : cat === "tablet" ? "📱 Tablets" : "🖥 Desktop"}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                {filteredDevices.map(device => {
                  const Icon = device.icon;
                  return (
                    <Button
                      key={device.name}
                      variant={!useCustom && selectedDevice === device ? "default" : "outline"}
                      size="sm"
                      onClick={() => { setSelectedDevice(device); setUseCustom(false); }}
                      className="text-xs"
                    >
                      <Icon className="h-3 w-3 mr-1" />{device.name}
                    </Button>
                  );
                })}
              </div>

              <div className="flex gap-4 items-end">
                <div>
                  <Label className="text-xs">Largeur</Label>
                  <Input value={useCustom ? customW : String(width)} onChange={e => { setCustomW(e.target.value); setUseCustom(true); }} className="w-24 font-mono" />
                </div>
                <span className="pb-2 text-muted-foreground">×</span>
                <div>
                  <Label className="text-xs">Hauteur</Label>
                  <Input value={useCustom ? customH : String(height)} onChange={e => { setCustomH(e.target.value); setUseCustom(true); }} className="w-24 font-mono" />
                </div>
                <Button variant="outline" size="sm" onClick={() => setUseCustom(true)}>
                  <Maximize className="h-4 w-4 mr-1" />Custom
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!multiView ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{useCustom ? "Custom" : selectedDevice.name} — {width}×{height}px</CardTitle>
              <div className="flex gap-1">
                {active.map(bp => (
                  <Badge key={bp.name} variant="outline" className={`text-xs ${bp.color}`}>{bp.name}</Badge>
                ))}
                {active.length === 0 && <Badge variant="outline" className="text-xs">xs</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            {renderIframe(width, height, 900, 600)}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {multiDevices.map(device => {
            const dw = rotated ? device.height : device.width;
            const dh = rotated ? device.width : device.height;
            return (
              <Card key={device.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{device.name} — {dw}×{dh}</CardTitle>
                  <div className="flex gap-1">
                    {getActiveBreakpoints(dw).map(bp => (
                      <Badge key={bp.name} variant="outline" className={`text-xs ${bp.color}`}>{bp.name}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {renderIframe(dw, dh, 350, 400)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
