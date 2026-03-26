import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Copy, Download } from "lucide-react";
import { toast } from "sonner";

export default function SqlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState("2");
  const [caseStyle, setCaseStyle] = useState("upper");

  const formatSql = () => {
    if (!input.trim()) {
      toast.error("Veuillez entrer du code SQL");
      return;
    }

    try {
      let formatted = input.trim();
      const indent = " ".repeat(parseInt(indentSize));
      
      // Convert to desired case
      const keywords = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", 
        "ON", "AND", "OR", "GROUP BY", "ORDER BY", "HAVING", "INSERT", "INTO", "VALUES", 
        "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "ALTER", "DROP", "AS", "LIMIT", 
        "OFFSET", "UNION", "DISTINCT", "COUNT", "SUM", "AVG", "MAX", "MIN"];
      
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, caseStyle === "upper" ? keyword : keyword.toLowerCase());
      });
      
      // Add line breaks and indentation
      formatted = formatted
        .replace(/\bSELECT\b/gi, '\nSELECT\n' + indent)
        .replace(/\bFROM\b/gi, '\nFROM\n' + indent)
        .replace(/\bWHERE\b/gi, '\nWHERE\n' + indent)
        .replace(/\bJOIN\b/gi, '\nJOIN\n' + indent)
        .replace(/\bLEFT\s+JOIN\b/gi, '\nLEFT JOIN\n' + indent)
        .replace(/\bRIGHT\s+JOIN\b/gi, '\nRIGHT JOIN\n' + indent)
        .replace(/\bINNER\s+JOIN\b/gi, '\nINNER JOIN\n' + indent)
        .replace(/\bON\b/gi, '\nON\n' + indent)
        .replace(/\bAND\b/gi, '\n' + indent + 'AND ')
        .replace(/\bOR\b/gi, '\n' + indent + 'OR ')
        .replace(/\bGROUP\s+BY\b/gi, '\nGROUP BY\n' + indent)
        .replace(/\bORDER\s+BY\b/gi, '\nORDER BY\n' + indent)
        .replace(/,(?=\s*\S)/g, ',\n' + indent);

      // Clean up extra whitespace
      formatted = formatted.replace(/\n\s*\n/g, '\n').trim();
      
      setOutput(formatted);
      toast.success("SQL formaté avec succès !");
    } catch (e) {
      toast.error("Erreur lors du formatage");
    }
  };

  const minifySql = () => {
    if (!input.trim()) {
      toast.error("Veuillez entrer du code SQL");
      return;
    }

    const minified = input
      .replace(/\s+/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\s*,\s*/g, ',')
      .trim();
    
    setOutput(minified);
    toast.success("SQL minifié !");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copié dans le presse-papier !");
  };

  const downloadSql = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.sql';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé !");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          Formateur SQL
        </h1>
        <p className="text-muted-foreground">
          Formatez, minifiez et embellissez vos requêtes SQL
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Entrée SQL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sql-input">Code SQL</Label>
              <Textarea
                id="sql-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="SELECT * FROM users WHERE id = 1;"
                className="min-h-[400px] font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <Label htmlFor="case">Casse des mots-clés</Label>
                <Select value={caseStyle} onValueChange={setCaseStyle}>
                  <SelectTrigger id="case">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upper">MAJUSCULES</SelectItem>
                    <SelectItem value="lower">minuscules</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={formatSql} className="flex-1">
                Formater
              </Button>
              <Button onClick={minifySql} variant="outline" className="flex-1">
                Minifier
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
                  onClick={downloadSql}
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
