import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Minimize2, Download, Copy, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type CodeType = "javascript" | "css" | "html" | "json";

export default function CodeMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [codeType, setCodeType] = useState<CodeType>("javascript");
  const [stats, setStats] = useState({ original: 0, minified: 0, reduction: 0 });

  const minifyJavaScript = (code: string): string => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\/\/.*/g, '') // Remove single-line comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*([{};,:])\s*/g, '$1') // Remove spaces around operators
      .replace(/;\}/g, '}') // Remove semicolons before closing braces
      .trim();
  };

  const minifyCSS = (code: string): string => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*([{};,:])\s*/g, '$1') // Remove spaces around operators
      .replace(/;\}/g, '}') // Remove last semicolon in block
      .replace(/:\s+/g, ':') // Remove space after colon
      .trim();
  };

  const minifyHTML = (code: string): string => {
    return code
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/>\s+</g, '><') // Remove spaces between tags
      .trim();
  };

  const minifyJSON = (code: string): string => {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed);
    } catch (e) {
      throw new Error("JSON invalide");
    }
  };

  const minifyCode = () => {
    if (!input.trim()) {
      toast.error("Veuillez entrer du code à minifier");
      return;
    }

    try {
      let minified = "";
      
      switch (codeType) {
        case "javascript":
          minified = minifyJavaScript(input);
          break;
        case "css":
          minified = minifyCSS(input);
          break;
        case "html":
          minified = minifyHTML(input);
          break;
        case "json":
          minified = minifyJSON(input);
          break;
      }

      setOutput(minified);
      
      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
      
      setStats({
        original: originalSize,
        minified: minifiedSize,
        reduction: parseFloat(reduction)
      });

      toast.success("Code minifié avec succès !");
    } catch (error) {
      toast.error((error as Error).message || "Erreur lors de la minification");
    }
  };

  const beautifyJSON = () => {
    if (!input.trim()) {
      toast.error("Veuillez entrer du JSON");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const beautified = JSON.stringify(parsed, null, 2);
      setOutput(beautified);
      toast.success("JSON formaté avec succès !");
    } catch (error) {
      toast.error("JSON invalide");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copié dans le presse-papier !");
  };

  const downloadFile = () => {
    const extensions = {
      javascript: 'js',
      css: 'css',
      html: 'html',
      json: 'json'
    };
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minified.${extensions[codeType]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé !");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Minimize2 className="h-8 w-8 text-primary" />
          Code Minifier
        </h1>
        <p className="text-muted-foreground">
          Minifiez votre code JavaScript, CSS, HTML ou JSON pour réduire sa taille
        </p>
      </div>

      <Tabs value={codeType} onValueChange={(v) => setCodeType(v as CodeType)} className="mb-6">
        <TabsList>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Code Original</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Collez votre code ${codeType.toUpperCase()} ici...`}
              className="min-h-[400px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Code Minifié
              {output && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadFile}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              placeholder="Le code minifié apparaîtra ici..."
              className="min-h-[400px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={minifyCode} className="flex-1">
          <Minimize2 className="mr-2 h-4 w-4" />
          Minifier
        </Button>
        {codeType === "json" && (
          <Button onClick={beautifyJSON} variant="outline" className="flex-1">
            Beautify JSON
          </Button>
        )}
      </div>

      {stats.original > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm text-muted-foreground">Taille originale</Label>
                <p className="text-2xl font-bold">{stats.original} bytes</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm text-muted-foreground">Taille minifiée</Label>
                <p className="text-2xl font-bold">{stats.minified} bytes</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm text-muted-foreground">Réduction</Label>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {stats.reduction}%
                  <Badge variant={stats.reduction > 30 ? "default" : "secondary"}>
                    {stats.reduction > 30 ? "Excellent" : "Bon"}
                  </Badge>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
