import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Code, Database, Server, Layout, Brain,
  ChevronDown, ChevronUp, Trophy, RotateCcw, Eye, EyeOff,
  Timer, Shield, Paintbrush, Cloud
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  answer: string;
  codeExample?: string;
  level: "junior" | "mid" | "senior";
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  questions: Question[];
}

const categories: Category[] = [
  {
    id: "javascript",
    name: "JavaScript",
    icon: Code,
    questions: [
      { id: "js-1", question: "Quelle est la différence entre var, let et const ?", answer: "var a une portée fonctionnelle et est hoisted. let et const ont une portée de bloc. const ne peut pas être réassigné.", codeExample: `var x = 1;   // function scoped, hoisted\nlet y = 2;   // block scoped\nconst z = 3; // block scoped, cannot reassign\n\nconst obj = { a: 1 };\nobj.a = 2; // OK - mutation allowed`, level: "junior", tags: ["variables", "scope"] },
      { id: "js-2", question: "Expliquez le concept de closure en JavaScript.", answer: "Une closure est une fonction qui a accès aux variables de sa portée externe, même après que la fonction externe a terminé.", codeExample: `function createCounter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    getCount: () => count\n  };\n}\nconst counter = createCounter();\ncounter.increment(); // 1`, level: "mid", tags: ["closure", "scope"] },
      { id: "js-3", question: "Comment fonctionne le prototype chain ?", answer: "Chaque objet JS a un [[Prototype]] qui pointe vers un autre objet. JS cherche les propriétés en remontant la chaîne jusqu'à Object.prototype.", level: "senior", tags: ["prototype", "inheritance"] },
      { id: "js-4", question: "Qu'est-ce que l'Event Loop ?", answer: "Mécanisme permettant à JS d'être non-bloquant. Surveille la Call Stack et la Task Queue. Micro tasks (Promises) avant macro tasks (setTimeout).", codeExample: `console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');\n// Output: 1, 4, 3, 2`, level: "senior", tags: ["event-loop", "async"] },
      { id: "js-5", question: "Différence entre == et === ?", answer: "== effectue une coercion de type. === compare sans coercion (égalité stricte). Toujours préférer ===.", codeExample: `1 == '1'     // true (coercion)\n1 === '1'    // false (strict)\nnull == undefined  // true\nnull === undefined // false`, level: "junior", tags: ["operators", "coercion"] },
    ]
  },
  {
    id: "react",
    name: "React",
    icon: Layout,
    questions: [
      { id: "react-1", question: "Différence entre state et props ?", answer: "Props sont passés par le parent (lecture seule). State est géré en interne et peut être modifié. Les deux déclenchent un re-render.", level: "junior", tags: ["state", "props"] },
      { id: "react-2", question: "Expliquez les règles des Hooks.", answer: "1) N'appelez les Hooks qu'au niveau supérieur. 2) Que depuis des fonctions React. Cela permet de maintenir l'ordre des hooks entre les renders.", level: "mid", tags: ["hooks", "rules"] },
      { id: "react-3", question: "Comment optimiser les performances React ?", answer: "React.memo, useMemo, useCallback, React.lazy (code splitting), virtualisation des listes.", codeExample: `const Expensive = React.memo(({ data }) => {\n  return <div>{/* render */}</div>;\n});\n\nconst sorted = useMemo(() =>\n  items.sort((a, b) => a.value - b.value)\n, [items]);`, level: "senior", tags: ["performance", "optimization"] },
      { id: "react-4", question: "Virtual DOM : qu'est-ce et pourquoi ?", answer: "Représentation légère du DOM en mémoire. React calcule les diffs et applique uniquement les changements nécessaires au vrai DOM.", level: "mid", tags: ["virtual-dom", "reconciliation"] },
      { id: "react-5", question: "Gérer les effets de bord avec useEffect ?", answer: "useEffect s'exécute après le render. Le tableau de dépendances contrôle les re-exécutions. La cleanup function s'exécute au démontage.", codeExample: `useEffect(() => {\n  const sub = api.subscribe(id);\n  return () => sub.unsubscribe();\n}, [id]);`, level: "mid", tags: ["useEffect", "lifecycle"] },
    ]
  },
  {
    id: "nodejs",
    name: "Node.js",
    icon: Server,
    questions: [
      { id: "node-1", question: "Comment Node.js gère les opérations asynchrones ?", answer: "Modèle event-driven non-bloquant avec libuv. Les I/O sont déléguées au thread pool, les callbacks exécutés via l'event loop.", level: "mid", tags: ["async", "event-loop"] },
      { id: "node-2", question: "process.nextTick() vs setImmediate() ?", answer: "nextTick s'exécute avant le prochain tour de l'event loop. setImmediate à la phase check (après I/O). nextTick a priorité.", level: "senior", tags: ["event-loop", "timing"] },
      { id: "node-3", question: "Gestion d'erreurs en Node.js ?", answer: "Try/catch pour sync et async/await. .catch() pour Promises. process.on('uncaughtException'). Middleware d'erreur Express.", level: "mid", tags: ["error-handling", "async"] },
    ]
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: Code,
    questions: [
      { id: "ts-1", question: "Différence entre interface et type alias ?", answer: "Les interfaces supportent la déclaration merging et extends. Les types supportent les unions, intersections et mapped types. Les interfaces sont préférées pour les objets.", codeExample: `interface User {\n  name: string;\n}\ninterface User { // declaration merging\n  age: number;\n}\n\ntype Status = 'active' | 'inactive'; // union\ntype Admin = User & { role: 'admin' }; // intersection`, level: "junior", tags: ["interface", "type"] },
      { id: "ts-2", question: "Expliquez les Generics en TypeScript.", answer: "Les generics permettent de créer des composants réutilisables qui fonctionnent avec plusieurs types tout en gardant le type-safety.", codeExample: `function identity<T>(arg: T): T {\n  return arg;\n}\n\ninterface ApiResponse<T> {\n  data: T;\n  error: string | null;\n}\n\nconst response: ApiResponse<User[]> = await fetchUsers();`, level: "mid", tags: ["generics", "type-safety"] },
      { id: "ts-3", question: "Qu'est-ce qu'un Type Guard et comment l'utiliser ?", answer: "Un type guard est une expression qui restreint le type dans un bloc conditionnel. Utilise typeof, instanceof, ou des fonctions is.", codeExample: `function isString(x: unknown): x is string {\n  return typeof x === 'string';\n}\n\nfunction process(value: string | number) {\n  if (isString(value)) {\n    console.log(value.toUpperCase());\n  }\n}`, level: "mid", tags: ["type-guard", "narrowing"] },
      { id: "ts-4", question: "Expliquez les Utility Types principaux.", answer: "Partial<T> rend tout optionnel. Required<T> tout requis. Pick<T, K> sélectionne. Omit<T, K> exclut. Record<K, V> crée un mapping.", codeExample: `type UserUpdate = Partial<User>;\ntype UserPreview = Pick<User, 'id' | 'name'>;\ntype SafeUser = Omit<User, 'password'>;\ntype Config = Record<string, string>;`, level: "mid", tags: ["utility-types"] },
      { id: "ts-5", question: "Qu'est-ce que le Conditional Type et infer ?", answer: "Les conditional types permettent de créer des types basés sur des conditions. infer permet d'extraire un type dans une condition.", codeExample: `type IsString<T> = T extends string ? 'yes' : 'no';\n\ntype ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;\n\ntype ArrayItem<T> = T extends (infer U)[] ? U : never;\ntype X = ArrayItem<string[]>; // string`, level: "senior", tags: ["conditional-types", "infer"] },
      { id: "ts-6", question: "Mapped Types et template literal types ?", answer: "Les mapped types transforment les propriétés d'un type. Les template literal types permettent la manipulation de chaînes au niveau type.", codeExample: `type Getters<T> = {\n  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];\n};\n\ntype UserGetters = Getters<{ name: string; age: number }>;\n// { getName: () => string; getAge: () => number }`, level: "senior", tags: ["mapped-types", "template-literal"] },
      { id: "ts-7", question: "Discriminated Unions : quand et comment ?", answer: "Pattern utilisant un champ commun (discriminant) pour distinguer les variantes d'un union type. TypeScript narrowe automatiquement.", codeExample: `type Success = { status: 'success'; data: User };\ntype Error = { status: 'error'; message: string };\ntype Result = Success | Error;\n\nfunction handle(result: Result) {\n  if (result.status === 'success') {\n    console.log(result.data); // TypeScript sait que c'est Success\n  }\n}`, level: "mid", tags: ["discriminated-unions", "pattern"] },
    ]
  },
  {
    id: "css",
    name: "CSS/HTML",
    icon: Paintbrush,
    questions: [
      { id: "css-1", question: "Comment fonctionne la spécificité CSS ?", answer: "La spécificité détermine quelle règle s'applique. Inline (1000) > ID (100) > Classe/Attribut (10) > Élément (1). !important surpasse tout.", codeExample: `/* Spécificité: 0-0-1 */\np { color: blue; }\n\n/* Spécificité: 0-1-0 */\n.text { color: red; }\n\n/* Spécificité: 1-0-0 */\n#title { color: green; }\n\n/* Le paragraphe avec class="text" id="title" sera vert */`, level: "junior", tags: ["specificity", "cascade"] },
      { id: "css-2", question: "Flexbox vs Grid : quand utiliser lequel ?", answer: "Flexbox pour les layouts 1D (ligne ou colonne). Grid pour les layouts 2D (lignes et colonnes). Flexbox pour les composants, Grid pour les pages.", codeExample: `/* Flexbox - 1D layout */\n.nav { display: flex; justify-content: space-between; }\n\n/* Grid - 2D layout */\n.page {\n  display: grid;\n  grid-template: \"header header\" auto\n                 \"sidebar main\" 1fr\n                 \"footer footer\" auto / 250px 1fr;\n}`, level: "junior", tags: ["flexbox", "grid"] },
      { id: "css-3", question: "Qu'est-ce que le Block Formatting Context (BFC) ?", answer: "Un BFC est un contexte de rendu indépendant. Il contient les flottants, empêche le margin collapsing et isole le layout. Créé par overflow, display:flow-root, etc.", level: "senior", tags: ["bfc", "layout"] },
      { id: "css-4", question: "Expliquez le stacking context et z-index.", answer: "Un stacking context est un contexte 3D pour l'empilement. z-index ne fonctionne que dans le même stacking context. Créé par position, opacity<1, transform, etc.", level: "mid", tags: ["stacking-context", "z-index"] },
      { id: "css-5", question: "Container Queries vs Media Queries ?", answer: "Media queries = viewport. Container queries = taille du parent. Container queries permettent des composants vraiment responsives indépendants du viewport.", codeExample: `/* Media query - viewport */\n@media (min-width: 768px) { .card { flex-direction: row; } }\n\n/* Container query - parent */\n.wrapper { container-type: inline-size; }\n@container (min-width: 400px) {\n  .card { flex-direction: row; }\n}`, level: "mid", tags: ["container-queries", "responsive"] },
      { id: "css-6", question: "Sémantique HTML : pourquoi c'est important ?", answer: "Le HTML sémantique améliore l'accessibilité (screen readers), le SEO, et la maintenabilité. Utiliser header, nav, main, article, section plutôt que div partout.", level: "junior", tags: ["semantic", "accessibility"] },
      { id: "css-7", question: "CSS Custom Properties vs variables Sass ?", answer: "CSS Custom Properties sont dynamiques (runtime, cascade, JS accessible). Variables Sass sont compilées (statiques). CSS vars permettent le theming dynamique.", codeExample: `:root {\n  --primary: hsl(220 90% 56%);\n  --radius: 8px;\n}\n.dark { --primary: hsl(220 90% 70%); }\n.btn { background: var(--primary); border-radius: var(--radius); }`, level: "mid", tags: ["custom-properties", "theming"] },
    ]
  },
  {
    id: "sql",
    name: "SQL/Database",
    icon: Database,
    questions: [
      { id: "sql-1", question: "INNER JOIN, LEFT JOIN, RIGHT JOIN ?", answer: "INNER: lignes avec correspondance dans les deux tables. LEFT: toutes les lignes de gauche + correspondances. RIGHT: toutes à droite.", codeExample: `-- INNER JOIN\nSELECT * FROM users u\nINNER JOIN orders o ON u.id = o.user_id;\n\n-- LEFT JOIN: all users, even without orders\nSELECT * FROM users u\nLEFT JOIN orders o ON u.id = o.user_id;`, level: "junior", tags: ["joins", "queries"] },
      { id: "sql-2", question: "Quand et comment utiliser les index ?", answer: "Index = structure accélérant les recherches. Sur les colonnes WHERE, JOIN, ORDER BY. Éviter sur colonnes à haute cardinalité d'écriture.", codeExample: `CREATE INDEX idx_users_email ON users(email);\nCREATE INDEX idx_orders_user_date ON orders(user_id, created_at);\n\nEXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@ex.com';`, level: "mid", tags: ["index", "performance"] },
      { id: "sql-3", question: "Transactions et propriétés ACID ?", answer: "ACID: Atomicity (tout ou rien), Consistency (état valide), Isolation (indépendance), Durability (persistance).", codeExample: `BEGIN TRANSACTION;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT; -- ou ROLLBACK si erreur`, level: "mid", tags: ["transactions", "acid"] },
      { id: "sql-4", question: "Window Functions : comment ça marche ?", answer: "Calculs sur un ensemble de lignes liées sans regrouper. OVER() définit la fenêtre. ROW_NUMBER, RANK, LAG, LEAD, SUM OVER.", codeExample: `SELECT name, salary,\n  RANK() OVER (PARTITION BY dept ORDER BY salary DESC) as rank,\n  AVG(salary) OVER (PARTITION BY dept) as dept_avg\nFROM employees;`, level: "senior", tags: ["window-functions", "analytics"] },
      { id: "sql-5", question: "Normalisation : formes normales ?", answer: "1NF: atomicité des valeurs. 2NF: pas de dépendance partielle. 3NF: pas de dépendance transitive. Dénormaliser pour la performance en lecture.", level: "mid", tags: ["normalization", "design"] },
      { id: "sql-6", question: "Deadlocks : comment les prévenir ?", answer: "Deadlock = deux transactions se bloquent mutuellement. Prévention : ordre d'accès consistent, timeouts, lock ordering, transactions courtes.", level: "senior", tags: ["deadlocks", "concurrency"] },
      { id: "sql-7", question: "Sharding vs Replication ?", answer: "Sharding = partitionnement horizontal (données réparties). Replication = copies des données (haute dispo). Souvent combinés.", level: "senior", tags: ["sharding", "replication"] },
    ]
  },
  {
    id: "devops",
    name: "DevOps",
    icon: Cloud,
    questions: [
      { id: "devops-1", question: "Comment fonctionnent les Docker layers ?", answer: "Chaque instruction du Dockerfile crée un layer. Les layers sont mis en cache et réutilisés. Ordre important : dépendances stables d'abord.", codeExample: `# Bon : cache des dépendances\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci             # Layer caché si package.json inchangé\nCOPY . .               # Invalide le cache seulement ici\nCMD ["npm", "start"]`, level: "mid", tags: ["docker", "layers"] },
      { id: "devops-2", question: "Kubernetes : Pod, Service, Deployment ?", answer: "Pod = plus petite unité (1+ containers). Deployment = gère les replicas et rollouts. Service = expose les pods avec load balancing.", codeExample: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app\n  template:\n    spec:\n      containers:\n      - name: app\n        image: my-app:1.0\n        ports:\n        - containerPort: 3000`, level: "mid", tags: ["kubernetes", "orchestration"] },
      { id: "devops-3", question: "CI/CD : différence entre Continuous Delivery et Deployment ?", answer: "Delivery = déploiement automatique jusqu'au staging, promotion manuelle en prod. Deployment = tout automatique jusqu'en prod.", level: "junior", tags: ["ci-cd", "pipeline"] },
      { id: "devops-4", question: "Blue-Green vs Canary deployment ?", answer: "Blue-Green = 2 environnements identiques, switch instantané. Canary = rollout progressif (5% → 25% → 100%). Canary détecte les problèmes plus tôt.", level: "mid", tags: ["deployment", "strategies"] },
      { id: "devops-5", question: "Infrastructure as Code : Terraform vs Ansible ?", answer: "Terraform = déclaratif, provisionnement d'infra (cloud resources). Ansible = impératif/déclaratif, configuration de serveurs. Souvent complémentaires.", level: "mid", tags: ["iac", "terraform"] },
      { id: "devops-6", question: "Monitoring : les 3 piliers de l'observabilité ?", answer: "Logs (événements), Métriques (mesures numériques), Traces (suivi des requêtes). Outils : Grafana, Prometheus, Jaeger, Datadog.", level: "mid", tags: ["monitoring", "observability"] },
      { id: "devops-7", question: "Gestion des secrets en production ?", answer: "Jamais en code/git. Solutions : Vault (HashiCorp), AWS Secrets Manager, env vars injectées, sealed secrets K8s. Rotation automatique.", level: "senior", tags: ["secrets", "security"] },
      { id: "devops-8", question: "Load Balancing : algorithmes courants ?", answer: "Round Robin, Least Connections, IP Hash, Weighted. Layer 4 (TCP) vs Layer 7 (HTTP). Health checks pour éviter les dead servers.", level: "senior", tags: ["load-balancing", "scaling"] },
    ]
  },
  {
    id: "system-design",
    name: "System Design",
    icon: Brain,
    questions: [
      { id: "sd-1", question: "Comment concevoir un URL shortener ?", answer: "API: POST /shorten, GET /{code}. Génération: Base62 d'un ID auto-incrémenté. Storage: KV store + DB. Scaling: cache, sharding.", level: "senior", tags: ["design", "scaling"] },
      { id: "sd-2", question: "Scaling horizontal vs vertical ?", answer: "Vertical = plus de CPU/RAM (limité). Horizontal = plus de machines (illimité mais complexe). Nécessite load balancing et gestion d'état.", level: "mid", tags: ["scaling", "infrastructure"] },
      { id: "sd-3", question: "CAP theorem ?", answer: "Un système distribué ne peut garantir que 2/3 : Consistency, Availability, Partition tolerance. En pratique, on choisit CP ou AP.", level: "senior", tags: ["distributed-systems", "theory"] },
      { id: "sd-4", question: "Comment implémenter un rate limiter ?", answer: "Token Bucket, Sliding Window, Fixed Window. Redis pour l'état distribué.", codeExample: `class RateLimiter {\n  constructor(capacity, refillRate) {\n    this.tokens = capacity;\n    this.lastRefill = Date.now();\n  }\n  allowRequest() {\n    this.refill();\n    if (this.tokens > 0) { this.tokens--; return true; }\n    return false;\n  }\n}`, level: "senior", tags: ["rate-limiting", "algorithms"] },
    ]
  }
];

const levelColors = {
  junior: "bg-green-500/20 text-green-400 border-green-500/30",
  mid: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  senior: "bg-red-500/20 text-red-400 border-red-500/30"
};

const levelLabels = { junior: "Junior", mid: "Intermédiaire", senior: "Senior" };

export default function InterviewQuestions() {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [showAnswers, setShowAnswers] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>({});
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [trainingMode, setTrainingMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const toggleQuestion = (id: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedQuestions(newExpanded);
  };

  const toggleQuizAnswer = (id: string) => setQuizAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  const resetQuiz = () => { setQuizAnswers({}); setTimer(0); setTimerRunning(false); };

  const getQuizScore = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return { answered: 0, total: 0 };
    const answered = category.questions.filter(q => quizAnswers[q.id]).length;
    return { answered, total: category.questions.length };
  };

  const filterQuestions = (questions: Question[]) => {
    if (selectedLevel === "all") return questions;
    return questions.filter(q => q.level === selectedLevel);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalAnswered = Object.values(quizAnswers).filter(Boolean).length;
  const totalQuestions = categories.reduce((sum, c) => sum + c.questions.length, 0);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Questions d'Entretien
        </h1>
        <p className="text-muted-foreground">
          {totalQuestions} questions techniques par technologie — {categories.length} catégories
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Niveau :</span>
              <div className="flex gap-2">
                {["all", "junior", "mid", "senior"].map(level => (
                  <Button key={level} size="sm" variant={selectedLevel === level ? "default" : "outline"} onClick={() => setSelectedLevel(level)}>
                    {level === "all" ? "Tous" : <Badge className={levelColors[level as keyof typeof levelColors]}>{levelLabels[level as keyof typeof levelLabels]}</Badge>}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {quizMode && (
                <>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    <Timer className="h-4 w-4 mr-1 inline" />
                    {formatTime(timer)}
                  </Badge>
                  <Badge variant="outline">{totalAnswered}/{totalQuestions}</Badge>
                  <Button variant="outline" size="sm" onClick={() => setTimerRunning(!timerRunning)}>
                    {timerRunning ? "Pause" : "Start"} Timer
                  </Button>
                </>
              )}
              <Button variant={quizMode ? "default" : "outline"} onClick={() => { setQuizMode(!quizMode); if (!quizMode) { resetQuiz(); setTimerRunning(true); } }} className="gap-2">
                <Trophy className="h-4 w-4" /> Mode Quiz
              </Button>
              {quizMode && <Button variant="outline" onClick={resetQuiz}><RotateCcw className="h-4 w-4" /></Button>}
              {!quizMode && (
                <Button variant="outline" onClick={() => setShowAnswers(!showAnswers)} className="gap-2">
                  {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showAnswers ? "Masquer" : "Afficher"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="javascript">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-2">
          {categories.map(category => {
            const Icon = category.icon;
            const score = getQuizScore(category.id);
            return (
              <TabsTrigger key={category.id} value={category.id} className="gap-2">
                <Icon className="h-4 w-4" />
                {category.name}
                {quizMode && score.answered > 0 && <Badge variant="secondary" className="ml-1">{score.answered}/{score.total}</Badge>}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id}>
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-4 pr-4">
                {filterQuestions(category.questions).map((question, index) => (
                  <Card key={question.id} className={quizAnswers[question.id] ? "border-green-500/50" : ""}>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => quizMode ? toggleQuizAnswer(question.id) : toggleQuestion(question.id)}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-muted-foreground text-sm">Q{index + 1}</span>
                            <Badge className={levelColors[question.level]}>{levelLabels[question.level]}</Badge>
                            {question.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                          </div>
                          <CardTitle className="text-lg font-medium">{question.question}</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon">
                          {(quizMode ? quizAnswers[question.id] : expandedQuestions.has(question.id)) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    {((quizMode && quizAnswers[question.id]) || (!quizMode && showAnswers && expandedQuestions.has(question.id))) && (
                      <CardContent className="border-t bg-muted/30">
                        <div className="pt-4">
                          <h4 className="font-medium mb-2 text-primary">Réponse :</h4>
                          <p className="text-muted-foreground mb-4">{question.answer}</p>
                          {question.codeExample && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2 text-primary">Exemple :</h4>
                              <pre className="bg-background p-4 rounded-lg overflow-x-auto text-sm"><code>{question.codeExample}</code></pre>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
                {filterQuestions(category.questions).length === 0 && (
                  <Card><CardContent className="py-8 text-center text-muted-foreground">Aucune question pour ce niveau</CardContent></Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
