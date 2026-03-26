import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RefreshCw, Shield, Download, Zap, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Tooltip } from "@/components/Tooltip";
import { toast } from "sonner";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Liste de mots pour les passphrases
const WORD_LIST = [
  "maison", "soleil", "jardin", "montagne", "océan", "forêt", "lumière", "étoile",
  "rivière", "nuage", "fleur", "papillon", "livre", "musique", "voyage", "sourire",
  "ami", "famille", "bonheur", "rêve", "liberté", "nature", "temps", "vent",
  "arbre", "plage", "ciel", "terre", "feu", "eau", "pierre", "sable",
  "lune", "pluie", "neige", "printemps", "été", "automne", "hiver", "matin",
  "soir", "nuit", "jour", "silence", "paix", "joie", "espoir", "courage",
  "force", "doux", "calme", "rapide", "lent", "grand", "petit", "beau",
  "simple", "facile", "difficile", "nouveau", "ancien", "jeune", "vieux", "chaud",
  "cheval", "tigre", "lapin", "canard", "hibou", "aigle", "dauphin", "requin",
  "baleine", "tortue", "serpent", "lion", "loup", "renard", "cerf", "ours",
  "pomme", "orange", "citron", "cerise", "fraise", "banane", "raisin", "poire",
  "tomate", "carotte", "salade", "olive", "melon", "mangue", "prune", "figue",
  "piano", "guitare", "violon", "flûte", "tambour", "harpe", "orgue", "trompette",
  "rouge", "bleu", "vert", "jaune", "violet", "blanc", "noir", "gris",
  "bronze", "argent", "doré", "rose", "marron", "turquoise", "indigo", "corail",
  "château", "pont", "tour", "temple", "palais", "cabane", "grotte", "phare",
  "village", "forteresse", "abri", "refuge", "sentier", "chemin", "route", "fleuve",
  "tigre", "dragon", "phoenix", "licorne", "sphinx", "minotaure", "chimère", "griffon",
  "comète", "galaxie", "plasma", "quasar", "nébuleuse", "aurore", "zénith", "horizon",
  "cristal", "rubis", "saphir", "émeraude", "diamant", "opale", "topaze", "améthyste",
  "clavier", "écran", "souris", "serveur", "réseau", "module", "pixel", "octet",
  "signal", "orbite", "fusion", "prisme", "vortex", "éclipse", "spectre", "atome",
  "cactus", "bambou", "lotus", "tulipe", "jasmin", "orchidée", "iris", "magnolia",
  "vapeur", "brume", "orage", "cyclone", "tornade", "volcan", "séisme", "marée",
];

const TEMPLATES = [
  { name: "WiFi Sécurisé", config: { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true }, icon: "📶" },
  { name: "Admin Serveur", config: { length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true }, icon: "🔐" },
  { name: "Bancaire", config: { length: 20, uppercase: true, lowercase: true, numbers: true, symbols: false }, icon: "🏦" },
  { name: "Email", config: { length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false }, icon: "📧" },
  { name: "PIN Code", config: { length: 6, uppercase: false, lowercase: false, numbers: true, symbols: false }, icon: "🔢" },
];

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [passwords, setPasswords] = useState<string[]>([]);
  const [length, setLength] = useState(16);
  const [batchCount, setBatchCount] = useState(5);
  const [passphraseWords, setPassphraseWords] = useState(4);
  const [passphraseSeparator, setPassphraseSeparator] = useState("-");
  const [passphraseCapitalize, setPassphraseCapitalize] = useState(false);
  const [passphraseAddNumber, setPassphraseAddNumber] = useState(false);
  const [pattern, setPattern] = useState("CVC-999-CVC");
  const [crackTime, setCrackTime] = useState<{entropy: number; online: string; cpu: string; gpu: string; cluster: string} | null>(null);
  const [hibpStatus, setHibpStatus] = useState<"checking" | "safe" | "compromised" | null>(null);
  const [hibpCount, setHibpCount] = useState(0);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });

  // Calculer l'entropie et le temps de crack
  const calculateCrackTime = (pwd: string) => {
    let charsetSize = 0;
    
    if (/[a-z]/.test(pwd)) charsetSize += 26;
    if (/[A-Z]/.test(pwd)) charsetSize += 26;
    if (/[0-9]/.test(pwd)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) charsetSize += 32;

    const entropy = pwd.length * Math.log2(charsetSize || 1);
    const combinations = Math.pow(charsetSize || 1, pwd.length);
    
    const speeds = {
      online: 1000,
      cpu: 10_000_000,
      gpu: 100_000_000_000,
      cluster: 1_000_000_000_000,
    };

    const formatTime = (seconds: number): string => {
      if (seconds < 1) return "< 1 seconde";
      if (seconds < 60) return `${Math.round(seconds)} secondes`;
      if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
      if (seconds < 86400) return `${Math.round(seconds / 3600)} heures`;
      if (seconds < 31536000) return `${Math.round(seconds / 86400)} jours`;
      if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} ans`;
      if (seconds < 31536000 * 1000) return `${Math.round(seconds / 31536000 / 100)} siècles`;
      if (seconds < 31536000 * 1_000_000) return `${Math.round(seconds / 31536000 / 1000)} millénaires`;
      return "plusieurs millions d'années";
    };

    return {
      entropy: Math.round(entropy * 10) / 10,
      online: formatTime(combinations / 2 / speeds.online),
      cpu: formatTime(combinations / 2 / speeds.cpu),
      gpu: formatTime(combinations / 2 / speeds.gpu),
      cluster: formatTime(combinations / 2 / speeds.cluster),
    };
  };

  // Vérifier via Have I Been Pwned (k-Anonymity)
  const checkHIBP = async (pwd: string) => {
    if (!pwd || pwd.length < 4) return;
    
    setHibpStatus("checking");
    
    try {
      // Hash SHA-1 du mot de passe
      const encoder = new TextEncoder();
      const data = encoder.encode(pwd);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      
      // k-Anonymity: on envoie seulement les 5 premiers caractères
      const prefix = hashHex.slice(0, 5);
      const suffix = hashHex.slice(5);
      
      // Appel à l'API HIBP
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        throw new Error("Erreur lors de la vérification");
      }
      
      const text = await response.text();
      const hashes = text.split('\n');
      
      // Chercher notre suffixe dans les résultats
      for (const line of hashes) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix === suffix) {
          setHibpStatus("compromised");
          setHibpCount(parseInt(count));
          toast.error(`⚠️ Ce mot de passe a été compromis ${parseInt(count).toLocaleString()} fois !`);
          return;
        }
      }
      
      setHibpStatus("safe");
      toast.success("✓ Ce mot de passe n'a pas été compromis");
      
    } catch (error) {
      console.error("Erreur HIBP:", error);
      setHibpStatus(null);
      toast.error("Impossible de vérifier le mot de passe");
    }
  };

  useEffect(() => {
    if (password) {
      const time = calculateCrackTime(password);
      setCrackTime(time);
      checkHIBP(password);
    } else {
      setCrackTime(null);
      setHibpStatus(null);
    }
  }, [password]);

  const generatePassword = () => {
    const chars = {
      uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
      lowercase: "abcdefghjkmnpqrstuvwxyz",
      numbers: "23456789",
      symbols: "!@#$%^&*-_=+",
      ambiguous: "il1Lo0O",
    };

    let charset = "";
    if (options.uppercase) charset += options.excludeAmbiguous ? chars.uppercase : chars.uppercase + "IO";
    if (options.lowercase) charset += options.excludeAmbiguous ? chars.lowercase : chars.lowercase + "lo";
    if (options.numbers) charset += options.excludeAmbiguous ? chars.numbers : chars.numbers + "01";
    if (options.symbols) charset += chars.symbols;

    if (!charset) {
      toast.error("Sélectionnez au moins une option !");
      return;
    }

    let result = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }

    setPassword(result);
  };

  const generateFromPattern = () => {
    if (!pattern.trim()) {
      toast.error("Entrez un pattern !");
      return;
    }

    const vowels = "aeiouy";
    const consonants = "bcdfghjklmnpqrstvwxz";
    const uppercaseVowels = "AEIOUY";
    const uppercaseConsonants = "BCDFGHJKLMNPQRSTVWXZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*-_=+";

    let result = "";
    for (const char of pattern) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      
      switch (char) {
        case 'c': // consonne minuscule
          result += consonants[array[0] % consonants.length];
          break;
        case 'C': // consonne majuscule
          result += uppercaseConsonants[array[0] % uppercaseConsonants.length];
          break;
        case 'v': // voyelle minuscule
          result += vowels[array[0] % vowels.length];
          break;
        case 'V': // voyelle majuscule
          result += uppercaseVowels[array[0] % uppercaseVowels.length];
          break;
        case 'l': // lettre minuscule
          result += (vowels + consonants)[array[0] % (vowels + consonants).length];
          break;
        case 'L': // lettre majuscule
          result += (uppercaseVowels + uppercaseConsonants)[array[0] % (uppercaseVowels + uppercaseConsonants).length];
          break;
        case '9': // chiffre
          result += numbers[array[0] % numbers.length];
          break;
        case 's': // symbole
          result += symbols[array[0] % symbols.length];
          break;
        default: // caractère littéral
          result += char;
      }
    }

    setPassword(result);
    toast.success("Mot de passe généré depuis le pattern !");
  };

  const generatePassphrase = () => {
    const selectedWords: string[] = [];
    const array = new Uint32Array(passphraseWords);
    crypto.getRandomValues(array);

    for (let i = 0; i < passphraseWords; i++) {
      let word = WORD_LIST[array[i] % WORD_LIST.length];
      if (passphraseCapitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      selectedWords.push(word);
    }

    let result = selectedWords.join(passphraseSeparator);
    if (passphraseAddNumber) {
      const numArr = new Uint32Array(1);
      crypto.getRandomValues(numArr);
      result += passphraseSeparator + (numArr[0] % 9000 + 1000);
    }
    setPassword(result);
    toast.success("Phrase de passe générée !");
  };

  const generateBatch = () => {
    const batch: string[] = [];
    
    for (let i = 0; i < batchCount; i++) {
      const chars = {
        uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
        lowercase: "abcdefghjkmnpqrstuvwxyz",
        numbers: "23456789",
        symbols: "!@#$%^&*-_=+",
      };

      let charset = "";
      if (options.uppercase) charset += options.excludeAmbiguous ? chars.uppercase : chars.uppercase + "IO";
      if (options.lowercase) charset += options.excludeAmbiguous ? chars.lowercase : chars.lowercase + "lo";
      if (options.numbers) charset += options.excludeAmbiguous ? chars.numbers : chars.numbers + "01";
      if (options.symbols) charset += chars.symbols;

      if (!charset) continue;

      let result = "";
      const array = new Uint32Array(length);
      crypto.getRandomValues(array);
      
      for (let j = 0; j < length; j++) {
        result += charset[array[j] % charset.length];
      }

      batch.push(result);
    }

    setPasswords(batch);
    toast.success(`${batch.length} mots de passe générés !`);
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setLength(template.config.length);
    setOptions({
      uppercase: template.config.uppercase,
      lowercase: template.config.lowercase,
      numbers: template.config.numbers,
      symbols: template.config.symbols,
      excludeAmbiguous: false,
    });
    toast.success(`Template "${template.name}" appliqué !`);
  };

  const calculateStrength = () => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (password.length >= 16) strength += 20;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "bg-destructive";
    if (strength < 70) return "bg-warning";
    return "bg-success";
  };

  const strength = calculateStrength();

  const copyToClipboard = (text?: string) => {
    const textToCopy = text || password;
    if (!textToCopy) {
      toast.error("Rien à copier !");
      return;
    }
    navigator.clipboard.writeText(textToCopy);
    toast.success("Copié !");
  };

  const downloadPasswords = () => {
    if (passwords.length === 0) {
      toast.error("Générez d'abord des mots de passe !");
      return;
    }
    const blob = new Blob([passwords.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passwords.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Fichier téléchargé !");
  };

  return (
    <ToolPageLayout title="Générateur de mot de passe Pro" description="Créez des mots de passe sécurisés avec patterns, phrases de passe et génération par lots">

      {/* Templates rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Templates rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((template) => (
              <Button
                key={template.name}
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(template)}
              >
                <span className="mr-2">{template.icon}</span>
                {template.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Résultat unique */}
      {password && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Votre mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={password}
                readOnly
                className="font-mono text-lg"
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard()}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label>
                  <Tooltip content="Force estimée du mot de passe basée sur sa longueur et sa complexité">Force</Tooltip>
                </Label>
                <span className="font-medium">{strength}%</span>
              </div>
              <Progress value={strength} className={getStrengthColor(strength)} />
            </div>

            {/* Temps de crack */}
            {crackTime && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Entropie</span>
                      <Badge variant="outline" className="font-mono">{crackTime.entropy} bits</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between p-1.5 rounded bg-muted/50">
                        <span className="text-muted-foreground">🌐 Online (1K/s)</span>
                        <span className="font-mono">{crackTime.online}</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-muted/50">
                        <span className="text-muted-foreground">💻 CPU (10M/s)</span>
                        <span className="font-mono">{crackTime.cpu}</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-muted/50">
                        <span className="text-muted-foreground">🎮 GPU (100G/s)</span>
                        <span className="font-mono">{crackTime.gpu}</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-muted/50">
                        <span className="text-muted-foreground">🏢 Cluster (1T/s)</span>
                        <span className="font-mono">{crackTime.cluster}</span>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Statut Have I Been Pwned */}
            {hibpStatus === "checking" && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Vérification dans les bases de données de fuites...
                </AlertDescription>
              </Alert>
            )}

            {hibpStatus === "safe" && (
              <Alert className="border-green-500 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <div className="text-sm">
                    <Tooltip content="Ce mot de passe n'apparaît pas dans les bases de données de mots de passe compromis (Have I Been Pwned)">
                      ✓ Mot de passe non compromis
                    </Tooltip>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {hibpStatus === "compromised" && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-destructive">
                      ⚠️ Mot de passe compromis !
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Tooltip content="Ce mot de passe a été trouvé dans des fuites de données publiques. Ne l'utilisez jamais !">
                        Trouvé {hibpCount.toLocaleString()} fois dans des fuites de données
                      </Tooltip>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modes de génération */}
      <Tabs defaultValue="random" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="random">Aléatoire</TabsTrigger>
          <TabsTrigger value="pattern">Pattern</TabsTrigger>
          <TabsTrigger value="passphrase">Phrase</TabsTrigger>
          <TabsTrigger value="batch">Par lots</TabsTrigger>
        </TabsList>

        {/* Tab Aléatoire */}
        <TabsContent value="random">
          <Card>
            <CardHeader>
              <CardTitle>Génération aléatoire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Longueur : {length} caractères</Label>
                </div>
                <Slider
                  value={[length]}
                  onValueChange={(values) => setLength(values[0])}
                  min={8}
                  max={128}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={options.uppercase}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, uppercase: !!checked })
                    }
                  />
                  <Label htmlFor="uppercase" className="cursor-pointer">
                    Majuscules (A-Z)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={options.lowercase}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, lowercase: !!checked })
                    }
                  />
                  <Label htmlFor="lowercase" className="cursor-pointer">
                    Minuscules (a-z)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={options.numbers}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, numbers: !!checked })
                    }
                  />
                  <Label htmlFor="numbers" className="cursor-pointer">
                    Chiffres (0-9)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={options.symbols}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, symbols: !!checked })
                    }
                  />
                  <Label htmlFor="symbols" className="cursor-pointer">
                    Symboles (!@#$%...)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excludeAmbiguous"
                    checked={options.excludeAmbiguous}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, excludeAmbiguous: !!checked })
                    }
                  />
                  <Label htmlFor="excludeAmbiguous" className="cursor-pointer">
                    <Tooltip content="Exclut les caractères qui se ressemblent : i, l, 1, L, o, 0, O">
                      Exclure caractères ambigus
                    </Tooltip>
                  </Label>
                </div>
              </div>

              <Button onClick={generatePassword} className="w-full" size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Générer un mot de passe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Pattern */}
        <TabsContent value="pattern">
          <Card>
            <CardHeader>
              <CardTitle>Génération par pattern</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  <Tooltip content="c=consonne, C=CONSONNE, v=voyelle, V=VOYELLE, l=lettre, L=LETTRE, 9=chiffre, s=symbole">
                    Pattern personnalisé
                  </Tooltip>
                </Label>
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Ex: CVC-999-CVC"
                  className="font-mono"
                />
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                <p className="font-semibold">Légende du pattern :</p>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="secondary">c = consonne (a-z)</Badge>
                  <Badge variant="secondary">C = CONSONNE (A-Z)</Badge>
                  <Badge variant="secondary">v = voyelle (a-z)</Badge>
                  <Badge variant="secondary">V = VOYELLE (A-Z)</Badge>
                  <Badge variant="secondary">l = lettre (a-z)</Badge>
                  <Badge variant="secondary">L = LETTRE (A-Z)</Badge>
                  <Badge variant="secondary">9 = chiffre (0-9)</Badge>
                  <Badge variant="secondary">s = symbole</Badge>
                </div>
                <p className="text-muted-foreground mt-2">
                  Exemples : <code>CVC-999</code>, <code>Llll9999</code>, <code>999-CVC-999</code>
                </p>
              </div>

              <Button onClick={generateFromPattern} className="w-full" size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Générer depuis le pattern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Passphrase */}
        <TabsContent value="passphrase">
          <Card>
            <CardHeader>
              <CardTitle>Phrase de passe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de mots : {passphraseWords}</Label>
                <Slider
                  value={[passphraseWords]}
                  onValueChange={(values) => setPassphraseWords(values[0])}
                  min={3}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="pp-capitalize" checked={passphraseCapitalize} onCheckedChange={(c) => setPassphraseCapitalize(!!c)} />
                <Label htmlFor="pp-capitalize" className="cursor-pointer">Capitaliser chaque mot</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="pp-number" checked={passphraseAddNumber} onCheckedChange={(c) => setPassphraseAddNumber(!!c)} />
                <Label htmlFor="pp-number" className="cursor-pointer">Ajouter un nombre (4 chiffres)</Label>
              </div>

              <div className="space-y-2">
                <Label>Séparateur</Label>
                <Input
                  value={passphraseSeparator}
                  onChange={(e) => setPassphraseSeparator(e.target.value)}
                  placeholder="-"
                  maxLength={3}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg text-sm">
                <p className="text-muted-foreground">
                  Les phrases de passe sont plus faciles à mémoriser et peuvent être très sécurisées.
                  Exemple : <code>soleil-montagne-jardin-océan</code>
                </p>
              </div>

              <Button onClick={generatePassphrase} className="w-full" size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Générer une phrase de passe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Par lots */}
        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Génération par lots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de mots de passe : {batchCount}</Label>
                <Slider
                  value={[batchCount]}
                  onValueChange={(values) => setBatchCount(values[0])}
                  min={2}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Longueur : {length} caractères</Label>
                <Slider
                  value={[length]}
                  onValueChange={(values) => setLength(values[0])}
                  min={8}
                  max={32}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="batch-uppercase"
                    checked={options.uppercase}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, uppercase: !!checked })
                    }
                  />
                  <Label htmlFor="batch-uppercase" className="cursor-pointer">
                    Majuscules
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="batch-lowercase"
                    checked={options.lowercase}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, lowercase: !!checked })
                    }
                  />
                  <Label htmlFor="batch-lowercase" className="cursor-pointer">
                    Minuscules
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="batch-numbers"
                    checked={options.numbers}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, numbers: !!checked })
                    }
                  />
                  <Label htmlFor="batch-numbers" className="cursor-pointer">
                    Chiffres
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="batch-symbols"
                    checked={options.symbols}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, symbols: !!checked })
                    }
                  />
                  <Label htmlFor="batch-symbols" className="cursor-pointer">
                    Symboles
                  </Label>
                </div>
              </div>

              <Button onClick={generateBatch} className="w-full" size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Générer {batchCount} mots de passe
              </Button>

              {passwords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{passwords.length} mots de passe générés</Label>
                    <Button variant="outline" size="sm" onClick={downloadPasswords}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                  <Textarea
                    value={passwords.join('\n')}
                    readOnly
                    className="font-mono text-sm min-h-[200px]"
                  />
                  <div className="flex gap-2 flex-wrap">
                    {passwords.slice(0, 5).map((pwd, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(pwd)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        #{idx + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ToolPageLayout>
  );
}
