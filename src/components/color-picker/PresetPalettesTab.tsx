import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { materialPalettes, tailwindPalettes, flatUiPalettes, type PaletteCollection } from "@/lib/color-palettes";

interface PresetPalettesTabProps {
  onColorSelect: (color: string) => void;
}

export default function PresetPalettesTab({ onColorSelect }: PresetPalettesTabProps) {
  const [activeCollection, setActiveCollection] = useState<string>("tailwind");
  const [search, setSearch] = useState("");

  const collections: Record<string, PaletteCollection> = {
    material: materialPalettes,
    tailwind: tailwindPalettes,
    flatui: flatUiPalettes,
  };

  const current = collections[activeCollection];
  const filtered = current.palettes.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`${hex} copié !`);
  };

  const exportCollection = (format: "css" | "json") => {
    let content = "";
    if (format === "css") {
      content = `:root {\n${filtered.flatMap(p =>
        Object.entries(p.shades).map(([k, v]) => `  --${p.name.toLowerCase().replace(/\s+/g, "-")}-${k}: ${v};`)
      ).join("\n")}\n}`;
    } else {
      const obj = Object.fromEntries(filtered.map(p => [p.name.toLowerCase().replace(/\s+/g, "-"), p.shades]));
      content = JSON.stringify(obj, null, 2);
    }
    navigator.clipboard.writeText(content);
    toast.success(`Collection exportée en ${format.toUpperCase()} !`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {Object.entries(collections).map(([key, col]) => (
            <Button
              key={key}
              variant={activeCollection === key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCollection(key)}
            >
              {col.name}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCollection("css")}>
            <Download className="h-4 w-4 mr-1" /> CSS
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCollection("json")}>
            <Download className="h-4 w-4 mr-1" /> JSON
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une palette..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((palette) => (
          <Card key={palette.name}>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                {palette.name}
                <Badge variant="secondary" className="text-xs">
                  {Object.keys(palette.shades).length} nuances
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="flex gap-1">
                {Object.entries(palette.shades).map(([shade, hex]) => (
                  <button
                    key={shade}
                    onClick={() => {
                      onColorSelect(hex);
                      copyColor(hex);
                    }}
                    className="flex-1 group relative"
                    title={`${shade}: ${hex}`}
                  >
                    <div
                      className="h-10 rounded border border-border hover:scale-y-125 transition-transform origin-bottom"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="block text-[9px] text-center text-muted-foreground mt-1 truncate">
                      {shade}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Aucune palette trouvée</p>
      )}
    </div>
  );
}
