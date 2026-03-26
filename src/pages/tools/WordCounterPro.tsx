import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Target, BarChart3 } from "lucide-react";

function fleschKincaid(text: string): { score: number; grade: string; label: string } {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  if (words.length === 0 || sentences.length === 0) return { score: 0, grade: "-", label: "Aucun texte" };

  const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  let grade: string, label: string;
  if (clamped >= 90) { grade = "5e"; label = "Très facile"; }
  else if (clamped >= 80) { grade = "6e"; label = "Facile"; }
  else if (clamped >= 70) { grade = "3e"; label = "Assez facile"; }
  else if (clamped >= 60) { grade = "2nde"; label = "Standard"; }
  else if (clamped >= 50) { grade = "Terminale"; label = "Assez difficile"; }
  else if (clamped >= 30) { grade = "Université"; label = "Difficile"; }
  else { grade = "Expert"; label = "Très difficile"; }

  return { score: clamped, grade, label };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüÿç]/g, "");
  if (word.length <= 3) return 1;
  const vowels = word.match(/[aeiouyàâäéèêëïîôùûüÿ]+/g);
  return vowels ? Math.max(1, vowels.length) : 1;
}

function getKeywordDensity(text: string): { word: string; count: number; percent: number }[] {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3).map(w => w.replace(/[^a-zàâäéèêëïîôùûüÿç-]/g, "")).filter(Boolean);
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  const total = words.length || 1;
  return Array.from(freq.entries())
    .map(([word, count]) => ({ word, count, percent: Math.round((count / total) * 10000) / 100 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

export default function WordCounterPro() {
  const [text, setText] = useState("");
  const [wordGoal, setWordGoal] = useState(500);

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const speakingTime = Math.max(1, Math.ceil(words / 130));
    const readability = fleschKincaid(text);
    const keywords = getKeywordDensity(text);
    const goalProgress = Math.min(100, Math.round((words / wordGoal) * 100));

    return { chars, charsNoSpaces, words, sentences, paragraphs, readingTime, speakingTime, readability, keywords, goalProgress };
  }, [text, wordGoal]);

  const readabilityColor = stats.readability.score >= 60 ? "text-green-500" : stats.readability.score >= 30 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Word Counter Pro</h1>
        <p className="text-muted-foreground mt-1">Compteur de mots avancé avec lisibilité, densité de mots-clés et objectifs</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Text Input */}
        <div className="lg:col-span-2 space-y-4">
          <Textarea
            placeholder="Collez ou tapez votre texte ici..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: FileText, label: "Mots", value: stats.words },
              { icon: FileText, label: "Caractères", value: stats.chars },
              { icon: FileText, label: "Sans espaces", value: stats.charsNoSpaces },
              { icon: FileText, label: "Phrases", value: stats.sentences },
              { icon: FileText, label: "Paragraphes", value: stats.paragraphs },
              { icon: Clock, label: "Lecture", value: `${stats.readingTime} min` },
              { icon: Clock, label: "Oral", value: `${stats.speakingTime} min` },
            ].map(s => (
              <Card key={s.label} className="flex-1 min-w-[120px]">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Word Goal */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" /> Objectif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input type="number" value={wordGoal} onChange={e => setWordGoal(Number(e.target.value) || 100)} className="h-8 w-24" />
                <span className="text-sm text-muted-foreground">mots</span>
              </div>
              <Progress value={stats.goalProgress} />
              <p className="text-xs text-muted-foreground">
                {stats.words} / {wordGoal} ({stats.goalProgress}%)
                {stats.words >= wordGoal && " ✅ Objectif atteint !"}
              </p>
            </CardContent>
          </Card>

          {/* Readability */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Lisibilité (Flesch-Kincaid)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-center">
                <span className={`text-4xl font-bold ${readabilityColor}`}>{stats.readability.score}</span>
                <span className="text-sm text-muted-foreground"> / 100</span>
              </div>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary">{stats.readability.label}</Badge>
                <Badge variant="outline">Niveau : {stats.readability.grade}</Badge>
              </div>
              <Progress value={stats.readability.score} />
            </CardContent>
          </Card>

          {/* Keyword Density */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">🔑 Densité de mots-clés</CardTitle>
              <CardDescription className="text-xs">Top 20 des mots (&gt;3 lettres)</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.keywords.length === 0 ? (
                <p className="text-xs text-muted-foreground">Tapez du texte pour voir les mots-clés</p>
              ) : (
                <div className="space-y-1 max-h-60 overflow-auto">
                  {stats.keywords.map(k => (
                    <div key={k.word} className="flex items-center gap-2 text-xs">
                      <span className="font-mono flex-1 truncate">{k.word}</span>
                      <span className="text-muted-foreground">{k.count}×</span>
                      <span className="font-medium w-14 text-right">{k.percent}%</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
