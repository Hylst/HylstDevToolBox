import { useState, useMemo } from "react";
import { Shuffle, Copy, RefreshCw, Search, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

// Faker-like data generators organized by category
const fakerMethods = {
  person: {
    firstName: () => ["Alice", "Bob", "Charlie", "Diana", "Emma", "François", "Gabriel", "Hélène", "Ivan", "Julia", "Kevin", "Laura", "Michel", "Nathalie", "Olivier"][Math.floor(Math.random() * 15)],
    lastName: () => ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent"][Math.floor(Math.random() * 12)],
    fullName: () => `${fakerMethods.person.firstName()} ${fakerMethods.person.lastName()}`,
    gender: () => ["male", "female", "other"][Math.floor(Math.random() * 3)],
    jobTitle: () => ["Développeur", "Designer", "Chef de projet", "Data Analyst", "DevOps", "Product Manager", "UX Designer", "Consultant"][Math.floor(Math.random() * 8)],
    jobType: () => ["CDI", "CDD", "Freelance", "Stage", "Alternance"][Math.floor(Math.random() * 5)],
    bio: () => ["Passionné de technologie", "Créatif et curieux", "Expert en innovation", "Entrepreneur dans l'âme"][Math.floor(Math.random() * 4)],
  },
  internet: {
    email: () => `${fakerMethods.person.firstName().toLowerCase()}.${fakerMethods.person.lastName().toLowerCase()}@${["gmail.com", "yahoo.fr", "outlook.com", "proton.me"][Math.floor(Math.random() * 4)]}`,
    username: () => `${fakerMethods.person.firstName().toLowerCase()}${Math.floor(Math.random() * 1000)}`,
    password: () => Array(12).fill(0).map(() => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"[Math.floor(Math.random() * 68)]).join(''),
    url: () => `https://www.${["example", "test", "demo", "sample"][Math.floor(Math.random() * 4)]}.com`,
    avatar: () => `https://i.pravatar.cc/150?u=${Math.random()}`,
    ip: () => `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    ipv6: () => Array(8).fill(0).map(() => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')).join(':'),
    mac: () => Array(6).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
    userAgent: () => `Mozilla/5.0 (${["Windows NT 10.0", "Macintosh", "X11; Linux x86_64"][Math.floor(Math.random() * 3)]}) AppleWebKit/537.36`,
  },
  location: {
    city: () => ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Bordeaux", "Lille", "Rennes"][Math.floor(Math.random() * 10)],
    country: () => ["France", "Belgique", "Suisse", "Canada", "Luxembourg", "Monaco"][Math.floor(Math.random() * 6)],
    countryCode: () => ["FR", "BE", "CH", "CA", "LU", "MC"][Math.floor(Math.random() * 6)],
    zipCode: () => String(Math.floor(Math.random() * 90000) + 10000),
    street: () => `${Math.floor(Math.random() * 200) + 1} ${["rue", "avenue", "boulevard"][Math.floor(Math.random() * 3)]} ${["de la Paix", "Victor Hugo", "des Lilas", "Jean Jaurès"][Math.floor(Math.random() * 4)]}`,
    latitude: () => (Math.random() * 180 - 90).toFixed(6),
    longitude: () => (Math.random() * 360 - 180).toFixed(6),
    timezone: () => ["Europe/Paris", "Europe/London", "America/New_York", "Asia/Tokyo", "Australia/Sydney"][Math.floor(Math.random() * 5)],
  },
  company: {
    name: () => ["TechCorp", "DataSoft", "InnoVision", "CloudScale", "DigitalWave", "SmartSolutions", "FutureTech", "GlobalServices"][Math.floor(Math.random() * 8)],
    catchPhrase: () => ["Innovation sans limites", "Votre succès, notre mission", "La technologie au service de l'humain"][Math.floor(Math.random() * 3)],
    bs: () => ["solutions cloud", "IA générative", "blockchain", "cybersécurité", "big data"][Math.floor(Math.random() * 5)],
    department: () => ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Legal"][Math.floor(Math.random() * 7)],
  },
  finance: {
    amount: () => (Math.random() * 10000).toFixed(2),
    currency: () => ["EUR", "USD", "GBP", "CHF", "CAD"][Math.floor(Math.random() * 5)],
    currencySymbol: () => ["€", "$", "£", "CHF", "C$"][Math.floor(Math.random() * 5)],
    creditCardNumber: () => `${Math.floor(Math.random() * 10000).toString().padStart(4, '0')} **** **** ${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    creditCardType: () => ["Visa", "Mastercard", "American Express", "Discover"][Math.floor(Math.random() * 4)],
    iban: () => `FR${Math.floor(Math.random() * 100).toString().padStart(2, '0')} ${Array(5).fill(0).map(() => Math.floor(Math.random() * 10000).toString().padStart(4, '0')).join(' ')}`,
    bic: () => `${Array(8).fill(0).map(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]).join('')}`,
  },
  date: {
    past: () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3).toISOString(),
    future: () => new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    recent: () => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    soon: () => new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    month: () => ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"][Math.floor(Math.random() * 12)],
    weekday: () => ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][Math.floor(Math.random() * 7)],
  },
  lorem: {
    word: () => ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit"][Math.floor(Math.random() * 8)],
    words: () => Array(5).fill(0).map(() => fakerMethods.lorem.word()).join(' '),
    sentence: () => "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    sentences: () => Array(3).fill(0).map(() => fakerMethods.lorem.sentence()).join(' '),
    paragraph: () => "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    paragraphs: () => Array(3).fill(0).map(() => fakerMethods.lorem.paragraph()).join('\n\n'),
  },
  datatype: {
    uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }),
    boolean: () => Math.random() > 0.5,
    number: () => Math.floor(Math.random() * 10000),
    float: () => (Math.random() * 1000).toFixed(4),
    hexadecimal: () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
    json: () => JSON.stringify({ id: Math.floor(Math.random() * 100), active: Math.random() > 0.5 }),
    array: () => Array(5).fill(0).map(() => Math.floor(Math.random() * 100)),
  },
  phone: {
    number: () => `+33 ${Math.floor(Math.random() * 9) + 1} ${Array(4).fill(0).map(() => String(Math.floor(Math.random() * 100)).padStart(2, '0')).join(' ')}`,
    imei: () => Array(15).fill(0).map(() => Math.floor(Math.random() * 10)).join(''),
  },
  image: {
    avatar: () => `https://i.pravatar.cc/150?u=${Math.random()}`,
    nature: () => `https://picsum.photos/seed/${Math.random()}/400/300`,
    business: () => `https://picsum.photos/seed/${Math.random()}/800/600`,
    abstract: () => `https://picsum.photos/seed/${Math.random()}/600/400`,
  },
  color: {
    hex: () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
    rgb: () => `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
    hsl: () => `hsl(${Math.floor(Math.random() * 360)}, ${Math.floor(Math.random() * 100)}%, ${Math.floor(Math.random() * 100)}%)`,
    name: () => ["rouge", "bleu", "vert", "jaune", "orange", "violet", "rose", "cyan", "magenta"][Math.floor(Math.random() * 9)],
  },
};

type Category = keyof typeof fakerMethods;

export default function FakerPlayground() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [seed, setSeed] = useState(Date.now());
  const [selectedMethods, setSelectedMethods] = useState<{category: Category; method: string}[]>([]);
  const [generatedValues, setGeneratedValues] = useState<Record<string, unknown>>({});
  const [codeOutput, setCodeOutput] = useState("");

  const categories = Object.keys(fakerMethods) as Category[];

  const filteredMethods = useMemo(() => {
    const results: {category: Category; method: string; fn: () => unknown}[] = [];
    for (const category of categories) {
      const methods = fakerMethods[category];
      for (const [method, fn] of Object.entries(methods)) {
        if (!searchQuery || 
            method.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ category, method, fn: fn as () => unknown });
        }
      }
    }
    return results;
  }, [searchQuery, categories]);

  const regenerate = () => {
    setSeed(Date.now());
    const values: Record<string, unknown> = {};
    for (const { category, method } of selectedMethods) {
      const fn = fakerMethods[category][method as keyof typeof fakerMethods[typeof category]] as () => unknown;
      values[`${category}.${method}`] = fn();
    }
    setGeneratedValues(values);
    generateCode();
  };

  const toggleMethod = (category: Category, method: string) => {
    const key = `${category}.${method}`;
    const exists = selectedMethods.some(m => `${m.category}.${m.method}` === key);
    if (exists) {
      setSelectedMethods(selectedMethods.filter(m => `${m.category}.${m.method}` !== key));
      const newValues = { ...generatedValues };
      delete newValues[key];
      setGeneratedValues(newValues);
    } else {
      setSelectedMethods([...selectedMethods, { category, method }]);
      const fn = fakerMethods[category][method as keyof typeof fakerMethods[typeof category]] as () => unknown;
      setGeneratedValues({ ...generatedValues, [key]: fn() });
    }
  };

  const generateCode = () => {
    if (selectedMethods.length === 0) {
      setCodeOutput("");
      return;
    }

    const code = `import { faker } from '@faker-js/faker';

// Configure seed for reproducibility
faker.seed(${seed});

// Generate data
const data = {
${selectedMethods.map(({ category, method }) => `  ${method}: faker.${category}.${method}(),`).join('\n')}
};

console.log(data);

// Generate multiple records
const records = Array.from({ length: 10 }, () => ({
${selectedMethods.map(({ category, method }) => `  ${method}: faker.${category}.${method}(),`).join('\n')}
}));

console.log(records);`;

    setCodeOutput(code);
  };

  const copyValue = (value: unknown) => {
    navigator.clipboard.writeText(String(value));
    toast({ title: "Copié !", description: "Valeur copiée dans le presse-papiers" });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeOutput);
    toast({ title: "Copié !", description: "Code copié dans le presse-papiers" });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Shuffle className="h-8 w-8 text-primary" />
          Faker Playground
        </h1>
        <p className="text-muted-foreground">
          Explorez et testez les générateurs de données faker.js interactivement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Méthodes Disponibles
            </CardTitle>
            <CardDescription>
              Cliquez pour ajouter à votre sélection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Rechercher une méthode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {categories.map(category => {
                  const categoryMethods = filteredMethods.filter(m => m.category === category);
                  if (categoryMethods.length === 0) return null;
                  return (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {categoryMethods.map(({ method }) => {
                          const isSelected = selectedMethods.some(m => m.category === category && m.method === method);
                          return (
                            <Badge
                              key={method}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/80 transition-colors"
                              onClick={() => toggleMethod(category, method)}
                            >
                              {method}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Valeurs Générées ({selectedMethods.length})</span>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Seed:</Label>
                  <Input
                    type="number"
                    value={seed}
                    onChange={e => setSeed(parseInt(e.target.value) || Date.now())}
                    className="w-32"
                  />
                </div>
                <Button onClick={regenerate} disabled={selectedMethods.length === 0}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Régénérer
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
                <TabsTrigger value="code">Code faker.js</TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
                {selectedMethods.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shuffle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez des méthodes dans la liste pour voir les valeurs générées</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {selectedMethods.map(({ category, method }) => {
                        const key = `${category}.${method}`;
                        const value = generatedValues[key];
                        const fn = fakerMethods[category][method as keyof typeof fakerMethods[typeof category]] as () => unknown;
                        const displayValue = value ?? fn();

                        return (
                          <div
                            key={key}
                            className="p-4 bg-muted/50 rounded-lg flex items-start justify-between gap-4"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">{category}</Badge>
                                <code className="text-sm font-semibold">{method}()</code>
                              </div>
                              <pre className="text-sm font-mono bg-background p-2 rounded mt-2 overflow-x-auto">
                                {typeof displayValue === "object" 
                                  ? JSON.stringify(displayValue, null, 2) 
                                  : String(displayValue)}
                              </pre>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  const newValue = fn();
                                  setGeneratedValues({ ...generatedValues, [key]: newValue });
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => copyValue(displayValue)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="code">
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={copyCode}
                    disabled={!codeOutput}
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copier
                  </Button>
                  <Textarea
                    value={codeOutput || "// Sélectionnez des méthodes puis cliquez sur 'Régénérer' pour voir le code"}
                    readOnly
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Installation de Faker.js</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm mb-2 block">npm</Label>
              <code className="text-sm">npm install @faker-js/faker</code>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm mb-2 block">yarn</Label>
              <code className="text-sm">yarn add @faker-js/faker</code>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Ce playground utilise des générateurs simplifiés. Pour des données plus réalistes et variées, 
            utilisez la vraie bibliothèque faker.js dans vos projets.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
