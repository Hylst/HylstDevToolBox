import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Type, 
  Copy, 
  RotateCcw,
  ArrowRight,
  FileText,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function TextFormatter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const { toast } = useToast();

  const transformations = {
    uppercase: (text: string) => text.toUpperCase(),
    lowercase: (text: string) => text.toLowerCase(),
    capitalize: (text: string) => text.replace(/\b\w/g, l => l.toUpperCase()),
    titleCase: (text: string) => text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
    sentenceCase: (text: string) => text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()),
    snakeCase: (text: string) => text.toLowerCase().replace(/\s+/g, '_'),
    kebabCase: (text: string) => text.toLowerCase().replace(/\s+/g, '-'),
    camelCase: (text: string) => text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, ''),
    pascalCase: (text: string) => text.replace(/(?:^\w|[A-Z]|\b\w)/g, word => 
      word.toUpperCase()).replace(/\s+/g, ''),
    constantCase: (text: string) => text.toUpperCase().replace(/\s+/g, '_'),
    dotCase: (text: string) => text.toLowerCase().replace(/\s+/g, '.'),
    reverse: (text: string) => text.split('').reverse().join(''),
    reverseWords: (text: string) => text.split(' ').reverse().join(' '),
    removeSpaces: (text: string) => text.replace(/\s+/g, ''),
    trimSpaces: (text: string) => text.replace(/\s+/g, ' ').trim(),
    removePunctuation: (text: string) => text.replace(/[^\w\s]|_/g, ''),
    removeNumbers: (text: string) => text.replace(/\d+/g, ''),
    removeAccents: (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    doubleSpace: (text: string) => text.replace(/\n/g, '\n\n'),
    sortLines: (text: string) => text.split('\n').sort().join('\n'),
    sortLinesReverse: (text: string) => text.split('\n').sort().reverse().join('\n'),
    removeDuplicateLines: (text: string) => Array.from(new Set(text.split('\n'))).join('\n'),
    numberLines: (text: string) => text.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n'),
    extractLines: (text: string) => text.split('\n').filter(line => line.trim()).join('\n'),
    base64Encode: (text: string) => btoa(unescape(encodeURIComponent(text))),
    base64Decode: (text: string) => {
      try {
        return decodeURIComponent(escape(atob(text)));
      } catch {
        return "Erreur: texte non valide en Base64";
      }
    },
    urlEncode: (text: string) => encodeURIComponent(text),
    urlDecode: (text: string) => {
      try {
        return decodeURIComponent(text);
      } catch {
        return "Erreur: URL non valide";
      }
    },
    htmlEncode: (text: string) => text.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m] || m)),
    htmlDecode: (text: string) => text.replace(/&(?:amp|lt|gt|quot|#39);/g, m => ({
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    }[m] || m)),
    slugify: (text: string) => text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim(),
    wrapLines: (text: string) => {
      const maxLength = 80;
      return text.split('\n').map(line => {
        if (line.length <= maxLength) return line;
        const words = line.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        words.forEach(word => {
          if ((currentLine + word).length > maxLength) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
          } else {
            currentLine += word + ' ';
          }
        });
        if (currentLine) lines.push(currentLine.trim());
        return lines.join('\n');
      }).join('\n');
    },
  };

  const applyTransform = (transform: keyof typeof transformations) => {
    const result = transformations[transform](inputText);
    setOutputText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    toast({
      title: "Copié !",
      description: "Le texte a été copié dans le presse-papiers.",
    });
  };

  const downloadText = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'texte-formate.txt';
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

  const TransformButton = ({ 
    label, 
    transform,
    description 
  }: { 
    label: string; 
    transform: keyof typeof transformations;
    description?: string;
  }) => (
    <div className="space-y-1">
      <Button 
        onClick={() => applyTransform(transform)} 
        variant="outline" 
        className="w-full justify-start"
        disabled={!inputText}
      >
        <ArrowRight className="h-4 w-4 mr-2" />
        {label}
      </Button>
      {description && (
        <p className="text-xs text-muted-foreground px-2">{description}</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Type className="h-8 w-8 text-primary" />
          Formatage et Transformation de Texte
        </h1>
        <p className="text-muted-foreground">
          Transformez et formatez votre texte avec plus de 40 options de transformation
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Texte source</CardTitle>
            <CardDescription>Entrez ou collez votre texte ici</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Votre texte ici..."
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
            <CardTitle>Texte transformé</CardTitle>
            <CardDescription>Résultat de la transformation</CardDescription>
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
          <CardTitle>Transformations disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="case" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="case">Casse</TabsTrigger>
              <TabsTrigger value="format">Format</TabsTrigger>
              <TabsTrigger value="clean">Nettoyage</TabsTrigger>
              <TabsTrigger value="lines">Lignes</TabsTrigger>
              <TabsTrigger value="encode">Encodage</TabsTrigger>
              <TabsTrigger value="special">Spécial</TabsTrigger>
            </TabsList>

            <TabsContent value="case" className="mt-6">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <TransformButton 
                  label="MAJUSCULES" 
                  transform="uppercase"
                  description="Convertit tout en majuscules"
                />
                <TransformButton 
                  label="minuscules" 
                  transform="lowercase"
                  description="Convertit tout en minuscules"
                />
                <TransformButton 
                  label="Première Majuscule" 
                  transform="capitalize"
                  description="Majuscule au début de chaque mot"
                />
                <TransformButton 
                  label="Title Case" 
                  transform="titleCase"
                  description="Format titre standard"
                />
                <TransformButton 
                  label="Sentence case" 
                  transform="sentenceCase"
                  description="Majuscule après chaque point"
                />
                <TransformButton 
                  label="camelCase" 
                  transform="camelCase"
                  description="Format pour le code"
                />
                <TransformButton 
                  label="PascalCase" 
                  transform="pascalCase"
                  description="Format pour les classes"
                />
              </div>
            </TabsContent>

            <TabsContent value="format" className="mt-6">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <TransformButton 
                  label="snake_case" 
                  transform="snakeCase"
                  description="Mots séparés par des underscores"
                />
                <TransformButton 
                  label="kebab-case" 
                  transform="kebabCase"
                  description="Mots séparés par des tirets"
                />
                <TransformButton 
                  label="CONSTANT_CASE" 
                  transform="constantCase"
                  description="Format pour les constantes"
                />
                <TransformButton 
                  label="dot.case" 
                  transform="dotCase"
                  description="Mots séparés par des points"
                />
                <TransformButton 
                  label="Slugify" 
                  transform="slugify"
                  description="Format URL (URL-friendly)"
                />
                <TransformButton 
                  label="Double espacement" 
                  transform="doubleSpace"
                  description="Ajoute un saut de ligne entre chaque ligne"
                />
                <TransformButton 
                  label="Wrap lignes (80 car.)" 
                  transform="wrapLines"
                  description="Limite à 80 caractères par ligne"
                />
              </div>
            </TabsContent>

            <TabsContent value="clean" className="mt-6">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <TransformButton 
                  label="Supprimer espaces" 
                  transform="removeSpaces"
                  description="Supprime tous les espaces"
                />
                <TransformButton 
                  label="Normaliser espaces" 
                  transform="trimSpaces"
                  description="Un seul espace entre les mots"
                />
                <TransformButton 
                  label="Supprimer ponctuation" 
                  transform="removePunctuation"
                  description="Retire tous les signes de ponctuation"
                />
                <TransformButton 
                  label="Supprimer nombres" 
                  transform="removeNumbers"
                  description="Retire tous les chiffres"
                />
                <TransformButton 
                  label="Supprimer accents" 
                  transform="removeAccents"
                  description="Convertit é en e, à en a, etc."
                />
              </div>
            </TabsContent>

            <TabsContent value="lines" className="mt-6">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <TransformButton 
                  label="Trier lignes A-Z" 
                  transform="sortLines"
                  description="Trie les lignes par ordre alphabétique"
                />
                <TransformButton 
                  label="Trier lignes Z-A" 
                  transform="sortLinesReverse"
                  description="Trie les lignes par ordre inverse"
                />
                <TransformButton 
                  label="Supprimer doublons" 
                  transform="removeDuplicateLines"
                  description="Supprime les lignes en double"
                />
                <TransformButton 
                  label="Numéroter lignes" 
                  transform="numberLines"
                  description="Ajoute des numéros de ligne"
                />
                <TransformButton 
                  label="Lignes non vides" 
                  transform="extractLines"
                  description="Supprime les lignes vides"
                />
              </div>
            </TabsContent>

            <TabsContent value="encode" className="mt-6">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <TransformButton 
                  label="Base64 Encoder" 
                  transform="base64Encode"
                  description="Encode en Base64"
                />
                <TransformButton 
                  label="Base64 Decoder" 
                  transform="base64Decode"
                  description="Décode depuis Base64"
                />
                <TransformButton 
                  label="URL Encoder" 
                  transform="urlEncode"
                  description="Encode pour URL"
                />
                <TransformButton 
                  label="URL Decoder" 
                  transform="urlDecode"
                  description="Décode depuis URL"
                />
                <TransformButton 
                  label="HTML Encoder" 
                  transform="htmlEncode"
                  description="Encode les caractères HTML"
                />
                <TransformButton 
                  label="HTML Decoder" 
                  transform="htmlDecode"
                  description="Décode les entités HTML"
                />
              </div>
            </TabsContent>

            <TabsContent value="special" className="mt-6">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <TransformButton 
                  label="Inverser caractères" 
                  transform="reverse"
                  description="Inverse l'ordre des caractères"
                />
                <TransformButton 
                  label="Inverser mots" 
                  transform="reverseWords"
                  description="Inverse l'ordre des mots"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
