import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, Copy, Filter } from "lucide-react";
import { toast } from "sonner";

interface FontPair {
  heading: string;
  body: string;
  category: string;
  style: "serif" | "sans" | "mono" | "display";
}

const pairings: FontPair[] = [
  { heading: "Playfair Display", body: "Source Sans 3", category: "Classique", style: "serif" },
  { heading: "Montserrat", body: "Open Sans", category: "Moderne", style: "sans" },
  { heading: "Roboto Slab", body: "Roboto", category: "Technique", style: "serif" },
  { heading: "Oswald", body: "Lato", category: "Impactant", style: "sans" },
  { heading: "Poppins", body: "Inter", category: "Moderne", style: "sans" },
  { heading: "Merriweather", body: "Lato", category: "Classique", style: "serif" },
  { heading: "Raleway", body: "Roboto", category: "Élégant", style: "sans" },
  { heading: "Libre Baskerville", body: "Montserrat", category: "Classique", style: "serif" },
  { heading: "DM Serif Display", body: "DM Sans", category: "Élégant", style: "display" },
  { heading: "Space Grotesk", body: "Space Mono", category: "Technique", style: "mono" },
  { heading: "Archivo Black", body: "Archivo", category: "Impactant", style: "sans" },
  { heading: "Cormorant Garamond", body: "Proza Libre", category: "Classique", style: "serif" },
  { heading: "Work Sans", body: "Bitter", category: "Moderne", style: "sans" },
  { heading: "Bebas Neue", body: "Source Sans 3", category: "Impactant", style: "display" },
  { heading: "Crimson Text", body: "Work Sans", category: "Classique", style: "serif" },
  { heading: "Nunito", body: "Nunito Sans", category: "Moderne", style: "sans" },
  { heading: "IBM Plex Serif", body: "IBM Plex Sans", category: "Technique", style: "serif" },
  { heading: "Fira Code", body: "Fira Sans", category: "Technique", style: "mono" },
  { heading: "Josefin Sans", body: "Lora", category: "Élégant", style: "sans" },
  { heading: "Abril Fatface", body: "Poppins", category: "Impactant", style: "display" },
  { heading: "PT Serif", body: "PT Sans", category: "Classique", style: "serif" },
  { heading: "Quicksand", body: "Mulish", category: "Moderne", style: "sans" },
  { heading: "JetBrains Mono", body: "Inter", category: "Technique", style: "mono" },
  { heading: "Libre Franklin", body: "Libre Baskerville", category: "Élégant", style: "sans" },
];

const styleFilters = [
  { value: "all", label: "Tous" },
  { value: "serif", label: "Serif" },
  { value: "sans", label: "Sans-serif" },
  { value: "mono", label: "Monospace" },
  { value: "display", label: "Display" },
];

// Load Google Fonts dynamically
function useGoogleFonts(fonts: string[]) {
  useEffect(() => {
    const uniqueFonts = [...new Set(fonts)];
    const families = uniqueFonts.map(f => f.replace(/ /g, "+")).join("&family=");
    const id = "google-fonts-pairing";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
  }, [fonts]);
}

export default function FontPairingTool() {
  const [preview, setPreview] = useState("The quick brown fox jumps over the lazy dog");
  const [selected, setSelected] = useState(pairings[0]);
  const [styleFilter, setStyleFilter] = useState("all");
  const [headingSize, setHeadingSize] = useState(32);
  const [bodySize, setBodySize] = useState(16);
  const [headingWeight, setHeadingWeight] = useState(700);
  const [bodyWeight, setBodyWeight] = useState(400);
  const [lineHeight, setLineHeight] = useState(1.6);

  const allFonts = useMemo(() => pairings.flatMap(p => [p.heading, p.body]), []);
  useGoogleFonts(allFonts);

  const filtered = useMemo(() =>
    styleFilter === "all" ? pairings : pairings.filter(p => p.style === styleFilter),
    [styleFilter]
  );

  const copyCSS = () => {
    const h = selected.heading;
    const b = selected.body;
    const css = `/* Heading */\nfont-family: "${h}", ${selected.style === "mono" ? "monospace" : selected.style === "serif" ? "serif" : "sans-serif"};\nfont-size: ${headingSize}px;\nfont-weight: ${headingWeight};\n\n/* Body */\nfont-family: "${b}", sans-serif;\nfont-size: ${bodySize}px;\nfont-weight: ${bodyWeight};\nline-height: ${lineHeight};`;
    navigator.clipboard.writeText(css);
    toast.success("CSS copié !");
  };

  const copyLink = () => {
    const families = [selected.heading, selected.body].map(f => f.replace(/ /g, "+")).join("&family=");
    const link = `<link href="https://fonts.googleapis.com/css2?family=${families}&display=swap" rel="stylesheet">`;
    navigator.clipboard.writeText(link);
    toast.success("Lien Google Fonts copié !");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Type className="h-8 w-8 text-primary" />Font Pairing Tool
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Texte de prévisualisation</CardTitle></CardHeader>
            <CardContent>
              <Input value={preview} onChange={e => setPreview(e.target.value)} placeholder="Texte..." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Filter className="h-4 w-4" />Filtrer par style</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {styleFilters.map(f => (
                <Badge
                  key={f.value}
                  variant={styleFilter === f.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setStyleFilter(f.value)}
                >
                  {f.label}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Ajustements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Taille titre : {headingSize}px</Label>
                <Slider value={[headingSize]} onValueChange={([v]) => setHeadingSize(v)} min={18} max={72} step={1} />
              </div>
              <div>
                <Label className="text-xs">Poids titre : {headingWeight}</Label>
                <Slider value={[headingWeight]} onValueChange={([v]) => setHeadingWeight(v)} min={300} max={900} step={100} />
              </div>
              <div>
                <Label className="text-xs">Taille corps : {bodySize}px</Label>
                <Slider value={[bodySize]} onValueChange={([v]) => setBodySize(v)} min={12} max={24} step={1} />
              </div>
              <div>
                <Label className="text-xs">Poids corps : {bodyWeight}</Label>
                <Slider value={[bodyWeight]} onValueChange={([v]) => setBodyWeight(v)} min={300} max={700} step={100} />
              </div>
              <div>
                <Label className="text-xs">Interligne : {lineHeight}</Label>
                <Slider value={[lineHeight * 10]} onValueChange={([v]) => setLineHeight(v / 10)} min={10} max={24} step={1} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="text-sm"><strong>Sélection :</strong> {selected.heading} + {selected.body}</div>
              <div className="flex gap-2">
                <Button onClick={copyCSS} size="sm" className="flex-1"><Copy className="h-4 w-4 mr-1" />CSS</Button>
                <Button onClick={copyLink} size="sm" variant="outline" className="flex-1"><Copy className="h-4 w-4 mr-1" />Link</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Pairing grid */}
        <div className="lg:col-span-1">
          <div className="grid gap-3 max-h-[700px] overflow-y-auto pr-1">
            {filtered.map((pair, i) => (
              <Card
                key={i}
                className={`cursor-pointer transition-all hover:border-primary ${selected === pair ? "border-primary ring-2 ring-primary/20" : ""}`}
                onClick={() => setSelected(pair)}
              >
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">{pair.category}</Badge>
                    <Badge variant="outline" className="text-xs">{pair.style}</Badge>
                  </div>
                  <h3 style={{ fontFamily: `"${pair.heading}", serif`, fontSize: 20, fontWeight: 700 }} className="mb-1 truncate">{preview.slice(0, 30)}</h3>
                  <p style={{ fontFamily: `"${pair.body}", sans-serif`, fontSize: 13 }} className="text-muted-foreground truncate">{preview.slice(0, 40)}</p>
                  <div className="mt-2 text-xs text-muted-foreground"><strong>{pair.heading}</strong> + {pair.body}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Preview */}
        <div>
          <Tabs defaultValue="hero">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="article">Article</TabsTrigger>
              <TabsTrigger value="ui">Interface</TabsTrigger>
            </TabsList>

            <TabsContent value="hero">
              <Card>
                <CardContent className="pt-6 text-center space-y-4">
                  <h2 style={{ fontFamily: `"${selected.heading}", serif`, fontSize: headingSize, fontWeight: headingWeight, lineHeight: 1.2 }}>
                    {preview}
                  </h2>
                  <p style={{ fontFamily: `"${selected.body}", sans-serif`, fontSize: bodySize, fontWeight: bodyWeight, lineHeight }} className="text-muted-foreground max-w-md mx-auto">
                    Un sous-titre descriptif qui accompagne le titre principal avec la police de corps sélectionnée.
                  </p>
                  <Button>Call to Action</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="article">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h2 style={{ fontFamily: `"${selected.heading}", serif`, fontSize: headingSize * 0.8, fontWeight: headingWeight }}>
                    Titre de l'article
                  </h2>
                  <p style={{ fontFamily: `"${selected.body}", sans-serif`, fontSize: bodySize, fontWeight: bodyWeight, lineHeight }} className="text-muted-foreground">
                    {preview}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                  <h3 style={{ fontFamily: `"${selected.heading}", serif`, fontSize: headingSize * 0.6, fontWeight: headingWeight }}>
                    Sous-titre
                  </h3>
                  <p style={{ fontFamily: `"${selected.body}", sans-serif`, fontSize: bodySize, fontWeight: bodyWeight, lineHeight }} className="text-muted-foreground">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ui">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="border border-border rounded-lg p-4 space-y-2">
                    <h3 style={{ fontFamily: `"${selected.heading}", serif`, fontSize: 18, fontWeight: 600 }}>Dashboard</h3>
                    <p style={{ fontFamily: `"${selected.body}", sans-serif`, fontSize: 14, fontWeight: bodyWeight }} className="text-muted-foreground">
                      Bienvenue dans votre espace personnel
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Projets", "Statistiques", "Messages", "Paramètres"].map(item => (
                      <div key={item} className="border border-border rounded-lg p-3 text-center">
                        <span style={{ fontFamily: `"${selected.body}", sans-serif`, fontSize: 13, fontWeight: 500 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button style={{ fontFamily: `"${selected.body}", sans-serif` }} className="w-full">Nouveau projet</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
