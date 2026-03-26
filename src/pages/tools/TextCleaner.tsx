import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function TextCleaner() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const { toast } = useToast();

  const [options, setOptions] = useState({
    removeExtraSpaces: true,
    removeEmptyLines: true,
    trimLines: true,
    fixPunctuation: true,
    fixQuotes: true,
    removeSpecialChars: false,
    normalizeLineBreaks: true,
    fixFrenchSpacing: true,
  });

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const cleanText = () => {
    let result = inputText;

    // Normaliser les sauts de ligne
    if (options.normalizeLineBreaks) {
      result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    // Supprimer les espaces multiples
    if (options.removeExtraSpaces) {
      result = result.replace(/[ \t]+/g, ' ');
    }

    // Nettoyer les lignes
    if (options.trimLines) {
      result = result.split('\n').map(line => line.trim()).join('\n');
    }

    // Supprimer les lignes vides
    if (options.removeEmptyLines) {
      result = result.split('\n').filter(line => line.trim()).join('\n');
    }

    // Corriger la ponctuation française
    if (options.fixFrenchSpacing) {
      // Espaces avant les signes de ponctuation doubles (: ; ! ?)
      result = result.replace(/\s*([;:!?])/g, ' $1');
      // Pas d'espace avant les signes simples (. ,)
      result = result.replace(/\s+([.,])/g, '$1');
      // Espaces après la ponctuation
      result = result.replace(/([.,;:!?])([^\s\d])/g, '$1 $2');
      // Guillemets français
      result = result.replace(/«\s*/g, '« ');
      result = result.replace(/\s*»/g, ' »');
    }

    // Corriger la ponctuation générale
    if (options.fixPunctuation) {
      // Espace après virgule, point
      result = result.replace(/([.,])([^\s\d])/g, '$1 $2');
      // Pas d'espace avant virgule, point
      result = result.replace(/\s+([.,])/g, '$1');
      // Pas de multiples ponctuations
      result = result.replace(/([.,;:!?]){2,}/g, '$1');
    }

    // Corriger les guillemets
    if (options.fixQuotes) {
      // Convertir les guillemets droits en guillemets courbes
      let inQuote = false;
      result = result.split('').map(char => {
        if (char === '"') {
          inQuote = !inQuote;
          return inQuote ? '\u201C' : '\u201D';
        }
        if (char === "'") {
          return '\u2019';
        }
        return char;
      }).join('');
    }

    // Supprimer les caractères spéciaux
    if (options.removeSpecialChars) {
      result = result.replace(/[^\w\s.,;:!?'"\-\n]/g, '');
    }

    // Nettoyer les espaces finaux
    result = result.replace(/[ \t]+$/gm, '');
    
    setOutputText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    toast({
      title: "Copié !",
      description: "Le texte nettoyé a été copié dans le presse-papiers.",
    });
  };

  const downloadText = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'texte-nettoye.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargé",
      description: "Le texte a été téléchargé avec succès.",
    });
  };

  const reset = () => {
    setInputText("");
    setOutputText("");
  };

  const quickClean = () => {
    setOptions({
      removeExtraSpaces: true,
      removeEmptyLines: true,
      trimLines: true,
      fixPunctuation: true,
      fixQuotes: true,
      removeSpecialChars: false,
      normalizeLineBreaks: true,
      fixFrenchSpacing: true,
    });
    setTimeout(cleanText, 100);
  };

  const CheckboxOption = ({ 
    id, 
    label, 
    description 
  }: { 
    id: keyof typeof options; 
    label: string; 
    description: string;
  }) => (
    <div className="flex items-start space-x-3 space-y-0">
      <Checkbox
        id={id}
        checked={options[id]}
        onCheckedChange={() => toggleOption(id)}
      />
      <div className="space-y-1 leading-none">
        <Label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Nettoyeur de Texte
        </h1>
        <p className="text-muted-foreground">
          Corrigez automatiquement les espaces, ponctuation et formatage de vos textes
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Texte original</CardTitle>
            <CardDescription>Entrez ou collez votre texte à nettoyer</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Collez votre texte ici..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[400px] font-mono"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={reset} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              <Badge variant="secondary" className="ml-auto">
                {inputText.length} caractères
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Texte nettoyé</CardTitle>
            <CardDescription>Résultat après nettoyage</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Le résultat apparaîtra ici..."
              value={outputText}
              readOnly
              className="min-h-[400px] font-mono bg-muted"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={copyToClipboard} variant="outline" size="sm" disabled={!outputText}>
                <Copy className="h-4 w-4 mr-2" />
                Copier
              </Button>
              <Button onClick={downloadText} variant="outline" size="sm" disabled={!outputText}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Badge variant="secondary" className="ml-auto">
                {outputText.length} caractères
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Options de nettoyage</CardTitle>
          <CardDescription>Personnalisez les corrections à appliquer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <CheckboxOption
                id="removeExtraSpaces"
                label="Supprimer espaces multiples"
                description="Remplace plusieurs espaces par un seul"
              />
              <CheckboxOption
                id="removeEmptyLines"
                label="Supprimer lignes vides"
                description="Retire les lignes sans contenu"
              />
              <CheckboxOption
                id="trimLines"
                label="Nettoyer début/fin de lignes"
                description="Supprime les espaces au début et à la fin"
              />
              <CheckboxOption
                id="normalizeLineBreaks"
                label="Normaliser sauts de ligne"
                description="Unifie les retours à la ligne"
              />
            </div>
            
            <div className="space-y-4">
              <CheckboxOption
                id="fixFrenchSpacing"
                label="Corriger espacement français"
                description="Ajoute espaces avant : ; ! ? et guillemets « »"
              />
              <CheckboxOption
                id="fixPunctuation"
                label="Corriger ponctuation"
                description="Espaces corrects autour de la ponctuation"
              />
              <CheckboxOption
                id="fixQuotes"
                label="Corriger guillemets"
                description="Convertit les guillemets droits en guillemets courbes"
              />
              <CheckboxOption
                id="removeSpecialChars"
                label="Supprimer caractères spéciaux"
                description="Garde uniquement lettres, chiffres et ponctuation de base"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={quickClean} disabled={!inputText}>
              <Sparkles className="h-4 w-4 mr-2" />
              Nettoyage rapide (tout activer)
            </Button>
            <Button onClick={cleanText} variant="outline" disabled={!inputText}>
              Nettoyer avec options sélectionnées
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
