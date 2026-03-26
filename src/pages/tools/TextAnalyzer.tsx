import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/Tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Hash, 
  Clock, 
  BarChart3, 
  Languages,
  AlignLeft,
  ListOrdered,
  Eye,
  Search,
  Download,
  Globe
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TextAnalyzer() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  // Fonction pour détecter la langue (basique)
  const detectLanguage = (text: string): string => {
    const frWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'est', 'sont', 'dans', 'pour', 'que', 'qui', 'avec'];
    const enWords = ['the', 'a', 'an', 'and', 'is', 'are', 'in', 'for', 'that', 'with', 'on', 'at', 'to'];
    const esWords = ['el', 'la', 'los', 'las', 'un', 'una', 'y', 'es', 'son', 'en', 'para', 'que', 'con'];
    
    const words = text.toLowerCase().split(/\s+/);
    const frCount = words.filter(w => frWords.includes(w)).length;
    const enCount = words.filter(w => enWords.includes(w)).length;
    const esCount = words.filter(w => esWords.includes(w)).length;
    
    const max = Math.max(frCount, enCount, esCount);
    if (max === 0) return "Indéterminé";
    if (max === frCount) return "Français";
    if (max === enCount) return "Anglais";
    return "Espagnol";
  };

  // Calcul de l'indice de lisibilité Flesch (adapté au français)
  const calculateFleschScore = (words: number, sentences: number, syllables: number): number => {
    if (sentences === 0 || words === 0) return 0;
    return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  };

  // Estimation du nombre de syllabes (approximation)
  const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    const vowels = word.match(/[aeiouyàâäéèêëïîôùûü]/g);
    return vowels ? Math.max(1, vowels.length) : 1;
  };

  // Add more detailed keyword extraction
  const extractKeywords = (text: string, minLength: number = 4): string[] => {
    const words = text.toLowerCase().match(/\b[a-zàâäéèêëïîôùûüÿç]{${minLength},}\b/gi) || [];
    const frequency: Record<string, number> = {};
    
    // Common stop words in French
    const stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'ce', 'cette', 'ces',
      'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
      'notre', 'votre', 'leur', 'et', 'ou', 'mais', 'donc', 'car', 'ni',
      'que', 'qui', 'quoi', 'dont', 'où', 'pour', 'par', 'avec', 'sans',
      'sur', 'sous', 'dans', 'vers', 'chez', 'être', 'avoir', 'faire',
      'dire', 'aller', 'voir', 'pouvoir', 'vouloir', 'plus', 'très', 'bien',
      'tout', 'tous', 'toute', 'toutes', 'même', 'aussi', 'encore', 'déjà'
    ]);
    
    words.forEach(word => {
      const lower = word.toLowerCase();
      if (!stopWords.has(lower)) {
        frequency[lower] = (frequency[lower] || 0) + 1;
      }
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  };

  const analysis = useMemo(() => {
    if (!text) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        readingTime: 0,
        speakingTime: 0,
        avgWordLength: 0,
        avgSentenceLength: 0,
        longestWord: "",
        wordFrequency: [] as Array<{ word: string; count: number }>,
        uniqueWords: 0,
        lexicalDensity: 0,
        language: "Indéterminé",
        fleschScore: 0,
        fleschLevel: "",
        totalSyllables: 0,
        keywords: [] as Array<{ word: string; count: number }>,
        seoScore: 0,
        emails: [] as string[],
        urls: [] as string[],
        numbers: [] as string[],
      };
    }

    // Caractères
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;

    // Mots
    const wordsArray = text
      .toLowerCase()
      .replace(/[^\w\s'-]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 0);
    const words = wordsArray.length;

    // Phrases
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    // Paragraphes
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;

    // Lignes
    const lines = text.split(/\n/).length;

    // Temps de lecture (250 mots/min) et parole (150 mots/min)
    const readingTime = Math.ceil(words / 250);
    const speakingTime = Math.ceil(words / 150);

    // Longueur moyenne des mots
    const totalWordLength = wordsArray.reduce((sum, word) => sum + word.length, 0);
    const avgWordLength = words > 0 ? (totalWordLength / words).toFixed(2) : 0;

    // Longueur moyenne des phrases
    const avgSentenceLength = sentences > 0 ? (words / sentences).toFixed(2) : 0;

    // Mot le plus long
    const longestWord = wordsArray.reduce((longest, word) => 
      word.length > longest.length ? word : longest, ""
    );

    // Fréquence des mots
    const wordCount = new Map<string, number>();
    wordsArray.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    const wordFrequency = Array.from(wordCount.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const uniqueWords = wordCount.size;
    const lexicalDensity = words > 0 ? ((uniqueWords / words) * 100).toFixed(2) : 0;

    // Détection de langue
    const language = detectLanguage(text);

    // Calcul des syllabes
    const totalSyllables = wordsArray.reduce((sum, word) => sum + countSyllables(word), 0);

    // Score de lisibilité Flesch
    const fleschScore = calculateFleschScore(words, sentences, totalSyllables);
    let fleschLevel = "";
    if (fleschScore >= 90) fleschLevel = "Très facile";
    else if (fleschScore >= 80) fleschLevel = "Facile";
    else if (fleschScore >= 70) fleschLevel = "Assez facile";
    else if (fleschScore >= 60) fleschLevel = "Standard";
    else if (fleschScore >= 50) fleschLevel = "Assez difficile";
    else if (fleschScore >= 30) fleschLevel = "Difficile";
    else fleschLevel = "Très difficile";

    // Mots-clés améliorés avec stop words étendus
    const stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'ce', 'cette', 'ces',
      'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
      'notre', 'votre', 'leur', 'et', 'ou', 'mais', 'donc', 'car', 'ni',
      'que', 'qui', 'quoi', 'dont', 'où', 'pour', 'par', 'avec', 'sans',
      'sur', 'sous', 'dans', 'vers', 'chez', 'être', 'avoir', 'faire',
      'dire', 'aller', 'voir', 'pouvoir', 'vouloir', 'plus', 'très', 'bien',
      'tout', 'tous', 'toute', 'toutes', 'même', 'aussi', 'encore', 'déjà'
    ]);
    
    const keywords = Array.from(wordCount.entries())
      .filter(([word, count]) => word.length > 4 && count > 1 && !stopWords.has(word.toLowerCase()))
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Score SEO basique
    let seoScore = 0;
    if (words >= 300 && words <= 2500) seoScore += 25;
    if (paragraphs >= 3) seoScore += 25;
    if (parseFloat(avgSentenceLength.toString()) < 25) seoScore += 25;
    if (keywords.length >= 3) seoScore += 25;

    // Extraction d'emails
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = text.match(emailRegex) || [];

    // Extraction d'URLs
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlRegex) || [];

    // Extraction de nombres
    const numberRegex = /\b\d+(?:\.\d+)?\b/g;
    const numbers = text.match(numberRegex) || [];

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime,
      avgWordLength,
      avgSentenceLength,
      longestWord,
      wordFrequency,
      uniqueWords,
      lexicalDensity: parseFloat(lexicalDensity as string),
      language,
      fleschScore: Math.round(fleschScore),
      fleschLevel,
      totalSyllables,
      keywords,
      seoScore,
      emails: Array.from(new Set(emails)),
      urls: Array.from(new Set(urls)),
      numbers: Array.from(new Set(numbers)),
    };
  }, [text]);

  const exportAnalysis = () => {
    const report = `
RAPPORT D'ANALYSE DE TEXTE
========================

STATISTIQUES GÉNÉRALES
- Caractères : ${analysis.characters}
- Caractères (sans espaces) : ${analysis.charactersNoSpaces}
- Mots : ${analysis.words}
- Phrases : ${analysis.sentences}
- Paragraphes : ${analysis.paragraphs}
- Lignes : ${analysis.lines}

TEMPS DE LECTURE
- Temps de lecture : ${analysis.readingTime} min
- Temps de parole : ${analysis.speakingTime} min

LISIBILITÉ
- Langue détectée : ${analysis.language}
- Score Flesch : ${analysis.fleschScore} (${analysis.fleschLevel})
- Longueur moyenne des mots : ${analysis.avgWordLength} caractères
- Longueur moyenne des phrases : ${analysis.avgSentenceLength} mots
- Syllabes totales : ${analysis.totalSyllables}

RICHESSE LEXICALE
- Mots uniques : ${analysis.uniqueWords}
- Densité lexicale : ${analysis.lexicalDensity}%
- Mot le plus long : ${analysis.longestWord}

MOTS-CLÉS PRINCIPAUX
${analysis.keywords.map((k, i) => `${i + 1}. ${k.word} (${k.count} fois)`).join('\n')}

SEO
- Score SEO : ${analysis.seoScore}/100

DONNÉES EXTRAITES
- Emails : ${analysis.emails.length > 0 ? analysis.emails.join(', ') : 'Aucun'}
- URLs : ${analysis.urls.length > 0 ? analysis.urls.join(', ') : 'Aucune'}
- Nombres : ${analysis.numbers.length > 0 ? analysis.numbers.join(', ') : 'Aucun'}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analyse-texte.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Rapport exporté",
      description: "Le rapport d'analyse a été téléchargé avec succès.",
    });
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    tooltip 
  }: { 
    icon: any; 
    label: string; 
    value: string | number; 
    tooltip?: string 
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {tooltip ? (
                <Tooltip term={tooltip}>
                  {label}
                </Tooltip>
              ) : (
                label
              )}
            </span>
          </div>
          <span className="text-2xl font-bold">{value}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Analyseur de Texte
        </h1>
        <p className="text-muted-foreground">
          Analysez vos textes en profondeur : statistiques, fréquences, lisibilité
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Zone de texte */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Texte à analyser</CardTitle>
              <CardDescription>Collez ou tapez votre texte ici</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Commencez à taper ou collez votre texte ici..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        {/* Statistiques rapides */}
        <div className="space-y-4">
          <StatCard 
            icon={Hash} 
            label="Caractères" 
            value={analysis.characters}
            tooltip="Nombre total de caractères incluant les espaces"
          />
          <StatCard 
            icon={Hash} 
            label="Sans espaces" 
            value={analysis.charactersNoSpaces}
            tooltip="Nombre de caractères sans compter les espaces"
          />
          <StatCard 
            icon={FileText} 
            label="Mots" 
            value={analysis.words}
            tooltip="Nombre total de mots"
          />
          <StatCard 
            icon={AlignLeft} 
            label="Phrases" 
            value={analysis.sentences}
            tooltip="Nombre de phrases détectées"
          />
          <StatCard 
            icon={ListOrdered} 
            label="Paragraphes" 
            value={analysis.paragraphs}
            tooltip="Nombre de paragraphes (séparés par ligne vide)"
          />
          <StatCard 
            icon={FileText} 
            label="Lignes" 
            value={analysis.lines}
            tooltip="Nombre de lignes dans le texte"
          />
        </div>
      </div>

      {/* Analyses détaillées */}
      {text && (
        <div className="mt-6">
          <Tabs defaultValue="reading" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-full max-w-2xl grid-cols-5">
                <TabsTrigger value="reading">
                  <Clock className="h-4 w-4 mr-2" />
                  Lecture
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistiques
                </TabsTrigger>
                <TabsTrigger value="frequency">
                  <Languages className="h-4 w-4 mr-2" />
                  Fréquence
                </TabsTrigger>
                <TabsTrigger value="seo">
                  <Search className="h-4 w-4 mr-2" />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="extract">
                  <Eye className="h-4 w-4 mr-2" />
                  Extraction
                </TabsTrigger>
              </TabsList>
              <Button onClick={exportAnalysis} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter le rapport
              </Button>
            </div>

            <TabsContent value="reading" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Temps de lecture
                    </CardTitle>
                    <CardDescription>
                      Basé sur une vitesse moyenne de 250 mots/minute
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary">
                      {analysis.readingTime} min
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Pour {analysis.words} mots
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Temps de parole
                    </CardTitle>
                    <CardDescription>
                      Basé sur une vitesse moyenne de 150 mots/minute
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary">
                      {analysis.speakingTime} min
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Pour une présentation orale
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Métriques de lisibilité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Langue détectée</span>
                        <Badge variant="secondary">
                          <Globe className="h-3 w-3 mr-1" />
                          {analysis.language}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Tooltip term="fleschScore">
                          <span className="text-sm font-medium">Score de lisibilité Flesch</span>
                        </Tooltip>
                        <Badge variant="secondary">{analysis.fleschScore} - {analysis.fleschLevel}</Badge>
                      </div>
                      <Progress value={Math.min(analysis.fleschScore, 100)} />
                      <p className="text-xs text-muted-foreground mt-1">
                        Plus le score est élevé, plus le texte est facile à lire
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Tooltip term="avgWordLength">
                          <span className="text-sm font-medium">Longueur moyenne des mots</span>
                        </Tooltip>
                        <Badge variant="secondary">{analysis.avgWordLength} caractères</Badge>
                      </div>
                      <Progress value={Math.min((parseFloat(analysis.avgWordLength.toString()) / 10) * 100, 100)} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Tooltip term="avgSentenceLength">
                          <span className="text-sm font-medium">Longueur moyenne des phrases</span>
                        </Tooltip>
                        <Badge variant="secondary">{analysis.avgSentenceLength} mots</Badge>
                      </div>
                      <Progress value={Math.min((parseFloat(analysis.avgSentenceLength.toString()) / 30) * 100, 100)} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Tooltip term="lexicalDensity">
                          <span className="text-sm font-medium">Densité lexicale</span>
                        </Tooltip>
                        <Badge variant="secondary">{analysis.lexicalDensity}%</Badge>
                      </div>
                      <Progress value={analysis.lexicalDensity} />
                      <p className="text-xs text-muted-foreground mt-1">
                        Ratio mots uniques / total ({analysis.uniqueWords} / {analysis.words})
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Syllabes totales</span>
                        <Badge variant="secondary">{analysis.totalSyllables}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informations complémentaires</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Mot le plus long</span>
                      <p className="text-lg font-mono font-semibold mt-1">
                        {analysis.longestWord} 
                        <span className="text-sm text-muted-foreground ml-2">
                          ({analysis.longestWord.length} caractères)
                        </span>
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground">Mots uniques</span>
                      <p className="text-lg font-semibold mt-1">
                        {analysis.uniqueWords}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground">Variété lexicale</span>
                      <p className="text-lg font-semibold mt-1">
                        {analysis.lexicalDensity > 60 ? "Élevée" : 
                         analysis.lexicalDensity > 40 ? "Moyenne" : "Faible"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analysis.lexicalDensity > 60 ? "Vocabulaire riche et varié" : 
                         analysis.lexicalDensity > 40 ? "Vocabulaire modéré" : "Beaucoup de répétitions"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="frequency" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fréquence des mots</CardTitle>
                  <CardDescription>
                    Les 20 mots les plus utilisés dans votre texte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.wordFrequency.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Badge variant="outline" className="w-8 justify-center">
                          {index + 1}
                        </Badge>
                        <span className="font-mono flex-1">{item.word}</span>
                        <div className="flex items-center gap-2 flex-1">
                          <Progress 
                            value={(item.count / analysis.wordFrequency[0].count) * 100} 
                            className="flex-1"
                          />
                          <Badge>{item.count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {analysis.wordFrequency.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun mot à afficher
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Score SEO
                    </CardTitle>
                    <CardDescription>
                      Analyse de l'optimisation pour les moteurs de recherche
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary mb-4">
                      {analysis.seoScore}/100
                    </div>
                    <Progress value={analysis.seoScore} className="mb-4" />
                    
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Nombre de mots optimal (300-2500)</span>
                        <Badge variant={analysis.words >= 300 && analysis.words <= 2500 ? "default" : "secondary"}>
                          {analysis.words >= 300 && analysis.words <= 2500 ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Structure en paragraphes (≥3)</span>
                        <Badge variant={analysis.paragraphs >= 3 ? "default" : "secondary"}>
                          {analysis.paragraphs >= 3 ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Phrases courtes (&lt;25 mots)</span>
                        <Badge variant={parseFloat(analysis.avgSentenceLength.toString()) < 25 ? "default" : "secondary"}>
                          {parseFloat(analysis.avgSentenceLength.toString()) < 25 ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mots-clés identifiés (≥3)</span>
                        <Badge variant={analysis.keywords.length >= 3 ? "default" : "secondary"}>
                          {analysis.keywords.length >= 3 ? "✓" : "✗"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mots-clés principaux</CardTitle>
                    <CardDescription>
                      Top 10 des mots-clés les plus fréquents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.keywords.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium flex-1">{item.word}</span>
                          <Badge>{item.count}</Badge>
                        </div>
                      ))}
                      {analysis.keywords.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Aucun mot-clé significatif détecté
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="extract" className="mt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Emails</CardTitle>
                    <CardDescription>
                      Adresses email détectées dans le texte
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysis.emails.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.emails.map((email, index) => (
                          <div key={index} className="p-2 bg-muted rounded font-mono text-sm">
                            {email}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Aucune adresse email trouvée
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>URLs</CardTitle>
                    <CardDescription>
                      Liens web détectés dans le texte
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysis.urls.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.urls.map((url, index) => (
                          <div key={index} className="p-2 bg-muted rounded font-mono text-sm break-all">
                            {url}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Aucune URL trouvée
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Nombres</CardTitle>
                    <CardDescription>
                      Valeurs numériques détectées
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysis.numbers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysis.numbers.map((number, index) => (
                          <Badge key={index} variant="secondary">
                            {number}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Aucun nombre trouvé
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
