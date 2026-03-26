import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight, Copy, Check, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tailwind → CSS mapping
const twToCssMap: Record<string, string> = {
  // Display
  "block": "display: block;", "inline-block": "display: inline-block;", "inline": "display: inline;",
  "flex": "display: flex;", "inline-flex": "display: inline-flex;", "grid": "display: grid;",
  "hidden": "display: none;", "table": "display: table;",
  // Position
  "static": "position: static;", "fixed": "position: fixed;", "absolute": "position: absolute;",
  "relative": "position: relative;", "sticky": "position: sticky;",
  // Flex
  "flex-row": "flex-direction: row;", "flex-col": "flex-direction: column;",
  "flex-row-reverse": "flex-direction: row-reverse;", "flex-col-reverse": "flex-direction: column-reverse;",
  "flex-wrap": "flex-wrap: wrap;", "flex-nowrap": "flex-wrap: nowrap;",
  "flex-1": "flex: 1 1 0%;", "flex-auto": "flex: 1 1 auto;", "flex-initial": "flex: 0 1 auto;",
  "flex-none": "flex: none;", "flex-grow": "flex-grow: 1;", "flex-shrink": "flex-shrink: 1;",
  "items-start": "align-items: flex-start;", "items-center": "align-items: center;",
  "items-end": "align-items: flex-end;", "items-stretch": "align-items: stretch;",
  "items-baseline": "align-items: baseline;",
  "justify-start": "justify-content: flex-start;", "justify-center": "justify-content: center;",
  "justify-end": "justify-content: flex-end;", "justify-between": "justify-content: space-between;",
  "justify-around": "justify-content: space-around;", "justify-evenly": "justify-content: space-evenly;",
  "self-auto": "align-self: auto;", "self-start": "align-self: flex-start;",
  "self-center": "align-self: center;", "self-end": "align-self: flex-end;",
  // Text
  "text-left": "text-align: left;", "text-center": "text-align: center;",
  "text-right": "text-align: right;", "text-justify": "text-align: justify;",
  "text-xs": "font-size: 0.75rem; line-height: 1rem;", "text-sm": "font-size: 0.875rem; line-height: 1.25rem;",
  "text-base": "font-size: 1rem; line-height: 1.5rem;", "text-lg": "font-size: 1.125rem; line-height: 1.75rem;",
  "text-xl": "font-size: 1.25rem; line-height: 1.75rem;", "text-2xl": "font-size: 1.5rem; line-height: 2rem;",
  "text-3xl": "font-size: 1.875rem; line-height: 2.25rem;", "text-4xl": "font-size: 2.25rem; line-height: 2.5rem;",
  "text-5xl": "font-size: 3rem; line-height: 1;",
  "font-thin": "font-weight: 100;", "font-light": "font-weight: 300;", "font-normal": "font-weight: 400;",
  "font-medium": "font-weight: 500;", "font-semibold": "font-weight: 600;", "font-bold": "font-weight: 700;",
  "font-extrabold": "font-weight: 800;",
  "italic": "font-style: italic;", "not-italic": "font-style: normal;",
  "underline": "text-decoration-line: underline;", "line-through": "text-decoration-line: line-through;",
  "no-underline": "text-decoration-line: none;",
  "uppercase": "text-transform: uppercase;", "lowercase": "text-transform: lowercase;",
  "capitalize": "text-transform: capitalize;", "normal-case": "text-transform: none;",
  "truncate": "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;",
  "leading-none": "line-height: 1;", "leading-tight": "line-height: 1.25;",
  "leading-snug": "line-height: 1.375;", "leading-normal": "line-height: 1.5;",
  "leading-relaxed": "line-height: 1.625;", "leading-loose": "line-height: 2;",
  // Overflow
  "overflow-auto": "overflow: auto;", "overflow-hidden": "overflow: hidden;",
  "overflow-visible": "overflow: visible;", "overflow-scroll": "overflow: scroll;",
  // Sizing
  "w-full": "width: 100%;", "w-screen": "width: 100vw;", "w-auto": "width: auto;",
  "w-fit": "width: fit-content;", "w-min": "width: min-content;", "w-max": "width: max-content;",
  "h-full": "height: 100%;", "h-screen": "height: 100vh;", "h-auto": "height: auto;",
  "h-fit": "height: fit-content;", "min-h-screen": "min-height: 100vh;", "min-h-full": "min-height: 100%;",
  "max-w-none": "max-width: none;", "max-w-full": "max-width: 100%;",
  "max-w-screen-sm": "max-width: 640px;", "max-w-screen-md": "max-width: 768px;",
  "max-w-screen-lg": "max-width: 1024px;", "max-w-screen-xl": "max-width: 1280px;",
  "max-w-xs": "max-width: 20rem;", "max-w-sm": "max-width: 24rem;", "max-w-md": "max-width: 28rem;",
  "max-w-lg": "max-width: 32rem;", "max-w-xl": "max-width: 36rem;", "max-w-2xl": "max-width: 42rem;",
  "max-w-3xl": "max-width: 48rem;", "max-w-4xl": "max-width: 56rem;", "max-w-5xl": "max-width: 64rem;",
  "max-w-6xl": "max-width: 72rem;", "max-w-7xl": "max-width: 80rem;",
  // Border
  "border": "border-width: 1px;", "border-0": "border-width: 0px;", "border-2": "border-width: 2px;",
  "border-4": "border-width: 4px;", "border-8": "border-width: 8px;",
  "border-solid": "border-style: solid;", "border-dashed": "border-style: dashed;",
  "border-dotted": "border-style: dotted;", "border-none": "border-style: none;",
  "rounded-none": "border-radius: 0;", "rounded-sm": "border-radius: 0.125rem;",
  "rounded": "border-radius: 0.25rem;", "rounded-md": "border-radius: 0.375rem;",
  "rounded-lg": "border-radius: 0.5rem;", "rounded-xl": "border-radius: 0.75rem;",
  "rounded-2xl": "border-radius: 1rem;", "rounded-3xl": "border-radius: 1.5rem;",
  "rounded-full": "border-radius: 9999px;",
  // Shadow
  "shadow-sm": "box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);",
  "shadow": "box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);",
  "shadow-md": "box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);",
  "shadow-lg": "box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);",
  "shadow-xl": "box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);",
  "shadow-none": "box-shadow: 0 0 #0000;",
  // Cursor
  "cursor-pointer": "cursor: pointer;", "cursor-default": "cursor: default;",
  "cursor-wait": "cursor: wait;", "cursor-not-allowed": "cursor: not-allowed;",
  // Misc
  "opacity-0": "opacity: 0;", "opacity-50": "opacity: 0.5;", "opacity-100": "opacity: 1;",
  "pointer-events-none": "pointer-events: none;", "pointer-events-auto": "pointer-events: auto;",
  "select-none": "user-select: none;", "select-text": "user-select: text;", "select-all": "user-select: all;",
  "whitespace-normal": "white-space: normal;", "whitespace-nowrap": "white-space: nowrap;",
  "whitespace-pre": "white-space: pre;", "whitespace-pre-wrap": "white-space: pre-wrap;",
  "break-words": "overflow-wrap: break-word;", "break-all": "word-break: break-all;",
  "transition": "transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms;",
  "transition-all": "transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms;",
  "transition-none": "transition-property: none;",
  "duration-75": "transition-duration: 75ms;", "duration-100": "transition-duration: 100ms;",
  "duration-150": "transition-duration: 150ms;", "duration-200": "transition-duration: 200ms;",
  "duration-300": "transition-duration: 300ms;", "duration-500": "transition-duration: 500ms;",
  "ease-linear": "transition-timing-function: linear;",
  "ease-in": "transition-timing-function: cubic-bezier(0.4, 0, 1, 1);",
  "ease-out": "transition-timing-function: cubic-bezier(0, 0, 0.2, 1);",
  "ease-in-out": "transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);",
  "object-contain": "object-fit: contain;", "object-cover": "object-fit: cover;",
  "object-fill": "object-fit: fill;", "object-none": "object-fit: none;",
  // Grid
  "grid-cols-1": "grid-template-columns: repeat(1, minmax(0, 1fr));",
  "grid-cols-2": "grid-template-columns: repeat(2, minmax(0, 1fr));",
  "grid-cols-3": "grid-template-columns: repeat(3, minmax(0, 1fr));",
  "grid-cols-4": "grid-template-columns: repeat(4, minmax(0, 1fr));",
  "grid-cols-6": "grid-template-columns: repeat(6, minmax(0, 1fr));",
  "grid-cols-12": "grid-template-columns: repeat(12, minmax(0, 1fr));",
  "col-span-1": "grid-column: span 1 / span 1;", "col-span-2": "grid-column: span 2 / span 2;",
  "col-span-3": "grid-column: span 3 / span 3;", "col-span-full": "grid-column: 1 / -1;",
  "gap-0": "gap: 0;", "gap-1": "gap: 0.25rem;", "gap-2": "gap: 0.5rem;", "gap-3": "gap: 0.75rem;",
  "gap-4": "gap: 1rem;", "gap-5": "gap: 1.25rem;", "gap-6": "gap: 1.5rem;", "gap-8": "gap: 2rem;",
  "gap-10": "gap: 2.5rem;", "gap-12": "gap: 3rem;",
  // Inset
  "inset-0": "inset: 0;", "top-0": "top: 0;", "right-0": "right: 0;",
  "bottom-0": "bottom: 0;", "left-0": "left: 0;",
  // Z-index
  "z-0": "z-index: 0;", "z-10": "z-index: 10;", "z-20": "z-index: 20;",
  "z-30": "z-index: 30;", "z-40": "z-index: 40;", "z-50": "z-index: 50;",
};

// Dynamic pattern converters
function convertDynamic(cls: string): string | null {
  // Spacing: p, px, py, pt, pr, pb, pl, m, mx, my, mt, mr, mb, ml
  const spacingMatch = cls.match(/^([mp])([xytrbl]?)-(\d+(?:\.\d+)?)$/);
  if (spacingMatch) {
    const [, type, dir, val] = spacingMatch;
    const prop = type === "m" ? "margin" : "padding";
    const rem = parseFloat(val) * 0.25;
    const dirs: Record<string, string> = {
      "": prop, "x": `${prop}-left: ${rem}rem; ${prop}-right: ${rem}rem`, "y": `${prop}-top: ${rem}rem; ${prop}-bottom: ${rem}rem`,
      "t": `${prop}-top`, "r": `${prop}-right`, "b": `${prop}-bottom`, "l": `${prop}-left`,
    };
    if (dir === "x" || dir === "y") return dirs[dir] + ";";
    return `${dirs[dir]}: ${rem}rem;`;
  }
  // w-N, h-N
  const sizeMatch = cls.match(/^([wh])-(\d+)$/);
  if (sizeMatch) {
    const [, axis, val] = sizeMatch;
    const prop = axis === "w" ? "width" : "height";
    return `${prop}: ${parseFloat(val) * 0.25}rem;`;
  }
  // text-color (basic colors)
  const colorMatch = cls.match(/^(text|bg|border)-(black|white|transparent|current)$/);
  if (colorMatch) {
    const [, prefix, color] = colorMatch;
    const prop = prefix === "text" ? "color" : prefix === "bg" ? "background-color" : "border-color";
    const val = color === "current" ? "currentColor" : color;
    return `${prop}: ${val};`;
  }
  return null;
}

function tailwindToCSS(input: string): string {
  const classes = input.trim().split(/\s+/).filter(Boolean);
  const rules: string[] = [];
  const unknown: string[] = [];

  for (const cls of classes) {
    if (twToCssMap[cls]) {
      rules.push(twToCssMap[cls]);
    } else {
      const dynamic = convertDynamic(cls);
      if (dynamic) rules.push(dynamic);
      else unknown.push(cls);
    }
  }

  let result = `.element {\n${rules.map(r => `  ${r}`).join("\n")}\n}`;
  if (unknown.length > 0) {
    result += `\n\n/* ⚠️ Non reconnus: ${unknown.join(", ")} */`;
  }
  return result;
}

// CSS → Tailwind (reverse lookup)
const cssToTwMap: Record<string, string> = {};
Object.entries(twToCssMap).forEach(([tw, css]) => {
  cssToTwMap[css.trim()] = tw;
});

function cssToTailwind(input: string): string {
  const lines = input.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("{") && !l.startsWith("}") && !l.startsWith(".") && !l.startsWith("/*"));
  const classes: string[] = [];
  const unknown: string[] = [];

  for (const line of lines) {
    const clean = line.endsWith(";") ? line : line + ";";
    if (cssToTwMap[clean]) {
      classes.push(cssToTwMap[clean]);
    } else {
      // Try spacing reverse
      const propVal = clean.match(/^(margin|padding)(?:-(top|right|bottom|left))?\s*:\s*([\d.]+)rem;?$/);
      if (propVal) {
        const [, prop, dir, val] = propVal;
        const prefix = prop === "margin" ? "m" : "p";
        const dirMap: Record<string, string> = { top: "t", right: "r", bottom: "b", left: "l" };
        const suffix = dir ? dirMap[dir] : "";
        const twVal = parseFloat(val) / 0.25;
        classes.push(`${prefix}${suffix}-${twVal}`);
      } else {
        unknown.push(line.replace(/;$/, ""));
      }
    }
  }

  let result = `className="${classes.join(" ")}"`;
  if (unknown.length > 0) {
    result += `\n\n/* ⚠️ Non reconnus:\n${unknown.map(u => `   ${u}`).join("\n")}\n*/`;
  }
  return result;
}

export default function TailwindCssConverter() {
  const { toast } = useToast();
  const [direction, setDirection] = useState<"tw2css" | "css2tw">("tw2css");
  const [input, setInput] = useState("flex items-center justify-between p-4 rounded-lg shadow-md bg-white text-sm font-medium");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return direction === "tw2css" ? tailwindToCSS(input) : cssToTailwind(input);
  }, [input, direction]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: "Résultat copié !" });
    setTimeout(() => setCopied(false), 1500);
  };

  const swap = () => {
    setDirection(d => d === "tw2css" ? "css2tw" : "tw2css");
    setInput(direction === "tw2css"
      ? "display: flex;\nalign-items: center;\njustify-content: space-between;\npadding: 1rem;\nborder-radius: 0.5rem;"
      : "flex items-center justify-between p-4 rounded-lg shadow-md"
    );
  };

  const examples = direction === "tw2css"
    ? [
      "flex items-center gap-4 p-6 rounded-xl shadow-lg",
      "grid grid-cols-3 gap-4 max-w-7xl mx-auto",
      "absolute inset-0 bg-black opacity-50 z-10",
      "text-2xl font-bold uppercase tracking-wider",
    ]
    : [
      "display: flex;\nalign-items: center;\ngap: 1rem;\npadding: 1.5rem;",
      "border-radius: 0.75rem;\nbox-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);",
    ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ArrowLeftRight className="h-8 w-8 text-primary" />
          Tailwind ↔ CSS Converter
        </h1>
        <p className="text-muted-foreground mt-1">
          Convertissez entre classes Tailwind et CSS vanilla — 200+ propriétés supportées
        </p>
      </div>

      {/* Direction toggle */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant={direction === "tw2css" ? "default" : "outline"}
          onClick={() => { setDirection("tw2css"); setInput("flex items-center justify-between p-4 rounded-lg shadow-md"); }}
        >
          Tailwind → CSS
        </Button>
        <Button variant="ghost" size="icon" onClick={swap}>
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
        <Button
          variant={direction === "css2tw" ? "default" : "outline"}
          onClick={() => { setDirection("css2tw"); setInput("display: flex;\nalign-items: center;\npadding: 1rem;"); }}
        >
          CSS → Tailwind
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>{direction === "tw2css" ? "Classes Tailwind" : "CSS"}</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full bg-muted rounded-lg p-4 text-sm font-mono min-h-[300px] resize-y border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={direction === "tw2css" ? "Entrez des classes Tailwind..." : "Entrez du CSS..."}
            />
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Exemples :</p>
              <div className="flex flex-wrap gap-1.5">
                {examples.map((ex, i) => (
                  <Button key={i} variant="outline" size="sm" className="text-xs h-7" onClick={() => setInput(ex)}>
                    Exemple {i + 1}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {direction === "tw2css" ? "CSS" : "Classes Tailwind"}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setInput("")}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={copy} disabled={!output}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted rounded-lg p-4 text-sm font-mono whitespace-pre-wrap min-h-[300px]">
              {output || "Le résultat apparaîtra ici..."}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card className="mt-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>📊 {Object.keys(twToCssMap).length}+ classes Tailwind supportées</span>
            <span>Spacing, sizing et couleurs dynamiques inclus</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
