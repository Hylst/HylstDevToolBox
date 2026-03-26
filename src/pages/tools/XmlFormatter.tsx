import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCode, Copy, Download, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function XmlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState("2");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const parseXML = (xmlString: string): Document | null => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      setError(parseError.textContent || "Erreur de parsing XML");
      setIsValid(false);
      return null;
    }
    
    setError("");
    setIsValid(true);
    return xmlDoc;
  };

  const formatXML = (xml: Document, indent: number): string => {
    const serializer = new XMLSerializer();
    let formatted = serializer.serializeToString(xml);
    
    // Simple formatting with indentation
    const reg = /(>)(<)(\/*)/g;
    formatted = formatted.replace(reg, '$1\n$2$3');
    
    let pad = 0;
    const lines = formatted.split('\n');
    const indentStr = ' '.repeat(indent);
    
    formatted = lines
      .map((line) => {
        let indent = 0;
        if (line.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (line.match(/^<\/\w/)) {
          if (pad !== 0) {
            pad -= 1;
          }
        } else if (line.match(/^<\w([^>]*[^\/])?>.*$/)) {
          indent = 1;
        } else {
          indent = 0;
        }
        
        const padding = indentStr.repeat(pad);
        pad += indent;
        
        return padding + line;
      })
      .join('\n');
    
    return formatted;
  };

  const handleFormat = () => {
    if (!input.trim()) {
      toast.error("Veuillez entrer du XML");
      return;
    }

    const xmlDoc = parseXML(input);
    if (!xmlDoc) {
      toast.error("XML invalide");
      return;
    }

    const formatted = formatXML(xmlDoc, parseInt(indentSize));
    setOutput(formatted);
    toast.success("XML formaté avec succès !");
  };

  const handleMinify = () => {
    if (!input.trim()) {
      toast.error("Veuillez entrer du XML");
      return;
    }

    const xmlDoc = parseXML(input);
    if (!xmlDoc) {
      toast.error("XML invalide");
      return;
    }

    const serializer = new XMLSerializer();
    const minified = serializer
      .serializeToString(xmlDoc)
      .replace(/>\s+</g, '><')
      .trim();
    
    setOutput(minified);
    toast.success("XML minifié !");
  };

  const handleValidate = () => {
    if (!input.trim()) {
      toast.error("Veuillez entrer du XML");
      return;
    }

    const xmlDoc = parseXML(input);
    if (xmlDoc) {
      toast.success("XML valide !");
    } else {
      toast.error("XML invalide");
    }
  };

  const convertToJson = () => {
    if (!input.trim()) {
      toast.error("Veuillez entrer du XML");
      return;
    }

    const xmlDoc = parseXML(input);
    if (!xmlDoc) {
      toast.error("XML invalide");
      return;
    }

    const xmlToJson = (node: any): any => {
      const obj: any = {};
      
      if (node.nodeType === 1) {
        if (node.attributes.length > 0) {
          obj["@attributes"] = {};
          for (let i = 0; i < node.attributes.length; i++) {
            const attribute = node.attributes.item(i);
            obj["@attributes"][attribute!.nodeName] = attribute!.nodeValue;
          }
        }
      } else if (node.nodeType === 3) {
        obj.text = node.nodeValue;
      }
      
      if (node.hasChildNodes()) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const item = node.childNodes.item(i);
          const nodeName = item!.nodeName;
          
          if (typeof obj[nodeName] === "undefined") {
            obj[nodeName] = xmlToJson(item);
          } else {
            if (typeof obj[nodeName].push === "undefined") {
              const old = obj[nodeName];
              obj[nodeName] = [];
              obj[nodeName].push(old);
            }
            obj[nodeName].push(xmlToJson(item));
          }
        }
      }
      
      return obj;
    };

    const json = xmlToJson(xmlDoc.documentElement);
    setOutput(JSON.stringify(json, null, 2));
    toast.success("Converti en JSON !");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copié dans le presse-papier !");
  };

  const downloadXml = () => {
    const blob = new Blob([output], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.xml';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé !");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileCode className="h-8 w-8 text-primary" />
          Formateur XML
        </h1>
        <p className="text-muted-foreground">
          Formatez, validez, minifiez et convertissez vos fichiers XML
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Entrée XML
              {isValid !== null && (
                <Badge variant={isValid ? "default" : "destructive"} className="flex items-center gap-1">
                  {isValid ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Valide
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Invalide
                    </>
                  )}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="xml-input">Code XML</Label>
              <Textarea
                id="xml-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="<root><item>value</item></root>"
                className="min-h-[400px] font-mono text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="indent">Indentation</Label>
              <Select value={indentSize} onValueChange={setIndentSize}>
                <SelectTrigger id="indent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 espaces</SelectItem>
                  <SelectItem value="4">4 espaces</SelectItem>
                  <SelectItem value="8">1 tab (8 espaces)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleFormat} className="w-full">
                Formater
              </Button>
              <Button onClick={handleMinify} variant="outline" className="w-full">
                Minifier
              </Button>
              <Button onClick={handleValidate} variant="outline" className="w-full">
                Valider
              </Button>
              <Button onClick={convertToJson} variant="outline" className="w-full">
                → JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Résultat
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  disabled={!output}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadXml}
                  disabled={!output}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              placeholder="Le résultat apparaîtra ici..."
              className="min-h-[400px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
