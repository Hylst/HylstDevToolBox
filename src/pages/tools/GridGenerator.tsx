import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Grid3X3 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const presets = [
  { name: "Dashboard", columns: "250px 1fr 1fr", rows: "auto 1fr auto", gap: 16, areas: '"sidebar header header" "sidebar main main" "sidebar footer footer"' },
  { name: "Holy Grail", columns: "200px 1fr 200px", rows: "auto 1fr auto", gap: 0, areas: '"header header header" "nav main aside" "footer footer footer"' },
  { name: "Gallery", columns: "repeat(3, 1fr)", rows: "repeat(2, 200px)", gap: 16, areas: "" },
  { name: "Magazine", columns: "1fr 1fr 1fr", rows: "200px 150px 200px", gap: 12, areas: '"featured featured sidebar" "article1 article2 sidebar" "article3 article3 article4"' },
  { name: "Card Grid", columns: "repeat(auto-fill, minmax(250px, 1fr))", rows: "auto", gap: 24, areas: "" },
];

export default function GridGenerator() {
  const [columns, setColumns] = useState("1fr 1fr 1fr");
  const [rows, setRows] = useState("auto auto");
  const [gap, setGap] = useState(16);
  const [columnGap, setColumnGap] = useState(16);
  const [rowGap, setRowGap] = useState(16);
  const [useUniformGap, setUseUniformGap] = useState(true);
  const [itemCount, setItemCount] = useState(6);

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    gap: useUniformGap ? `${gap}px` : `${rowGap}px ${columnGap}px`,
    minHeight: "300px",
    padding: "16px",
    border: "2px dashed hsl(var(--border))",
    borderRadius: "8px",
    backgroundColor: "hsl(var(--muted))",
  };

  const cssCode = `.container {
  display: grid;
  grid-template-columns: ${columns};
  grid-template-rows: ${rows};
  gap: ${useUniformGap ? `${gap}px` : `${rowGap}px ${columnGap}px`};
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cssCode);
    toast.success("CSS copié !");
  };

  const handleReset = () => {
    setColumns("1fr 1fr 1fr");
    setRows("auto auto");
    setGap(16);
    setColumnGap(16);
    setRowGap(16);
    setItemCount(6);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setColumns(preset.columns);
    setRows(preset.rows);
    setGap(preset.gap);
    setColumnGap(preset.gap);
    setRowGap(preset.gap);
    toast.success(`Preset "${preset.name}" appliqué`);
  };

  const colors = [
    "bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500", 
    "bg-pink-500", "bg-cyan-500", "bg-yellow-500", "bg-red-500",
    "bg-indigo-500", "bg-teal-500", "bg-rose-500", "bg-amber-500"
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Grid3X3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">CSS Grid Generator</h1>
          <p className="text-muted-foreground">Créez des layouts CSS Grid visuellement</p>
        </div>
      </div>

      <Tabs defaultValue="playground" className="space-y-4">
        <TabsList>
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Controls */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Contrôles
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>grid-template-columns</Label>
                  <Input
                    value={columns}
                    onChange={(e) => setColumns(e.target.value)}
                    placeholder="1fr 1fr 1fr"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ex: 1fr 2fr, repeat(3, 1fr), 200px auto 1fr
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>grid-template-rows</Label>
                  <Input
                    value={rows}
                    onChange={(e) => setRows(e.target.value)}
                    placeholder="auto auto"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ex: auto 1fr auto, 100px 200px
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="uniformGap"
                      checked={useUniformGap}
                      onChange={(e) => setUseUniformGap(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="uniformGap">Gap uniforme</Label>
                  </div>

                  {useUniformGap ? (
                    <div className="space-y-2">
                      <Label>gap: {gap}px</Label>
                      <Slider
                        value={[gap]}
                        onValueChange={([v]) => setGap(v)}
                        min={0}
                        max={48}
                        step={4}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>column-gap: {columnGap}px</Label>
                        <Slider
                          value={[columnGap]}
                          onValueChange={([v]) => setColumnGap(v)}
                          min={0}
                          max={48}
                          step={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>row-gap: {rowGap}px</Label>
                        <Slider
                          value={[rowGap]}
                          onValueChange={([v]) => setRowGap(v)}
                          min={0}
                          max={48}
                          step={4}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Nombre d'éléments: {itemCount}</Label>
                  <Slider
                    value={[itemCount]}
                    onValueChange={([v]) => setItemCount(v)}
                    min={1}
                    max={12}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Prévisualisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={containerStyle}>
                  {Array.from({ length: itemCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`${colors[i % colors.length]} text-white font-bold rounded-lg flex items-center justify-center shadow-md min-h-[60px]`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CSS Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Code CSS
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                {cssCode}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <Card key={preset.name} className="cursor-pointer hover:border-primary transition-colors" onClick={() => applyPreset(preset)}>
                <CardHeader>
                  <CardTitle className="text-lg">{preset.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="h-24 bg-muted rounded border-2 border-dashed border-border p-2"
                    style={{
                      display: "grid",
                      gridTemplateColumns: preset.columns.includes("auto-fill") ? "repeat(3, 1fr)" : preset.columns,
                      gridTemplateRows: preset.rows === "auto" ? "auto" : preset.rows,
                      gap: `${preset.gap / 4}px`,
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].slice(0, 6).map((n) => (
                      <div key={n} className="bg-primary rounded text-xs flex items-center justify-center text-primary-foreground min-h-[16px]">
                        {n}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {preset.columns}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
