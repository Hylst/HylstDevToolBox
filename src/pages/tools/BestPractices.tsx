import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Award, Search, CheckCircle, XCircle, AlertTriangle, BookOpen, Star,
  Trophy, Filter, RotateCcw, ChevronDown, ChevronUp, Lightbulb,
  Shield, Zap, Code, TestTube, Accessibility, GitBranch, FileCode,
  Bookmark, BookmarkCheck, Eye, EyeOff,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

type Difficulty = "débutant" | "intermédiaire" | "avancé";
type DifficultyColor = "default" | "secondary" | "destructive";

interface Practice {
  title: string;
  description: string;
  good?: string;
  bad?: string;
  tip?: string;
  difficulty: Difficulty;
  tags: string[];
  links?: { label: string; url: string }[];
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  intro: string;
  practices: Practice[];
}

// ── Data ───────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: "clean-code",
    title: "Clean Code",
    icon: <Code className="h-4 w-4" />,
    color: "text-chart-1",
    intro: "Écrire du code lisible, maintenable et élégant. Le code est lu 10x plus souvent qu'il n'est écrit.",
    practices: [
      {
        title: "Noms significatifs",
        description: "Utilisez des noms descriptifs qui révèlent l'intention. Un bon nom élimine le besoin de commentaires.",
        good: `const daysSinceLastLogin = 5;
const isEligibleForDiscount = user.purchases > 10;

function calculateMonthlyRevenue(orders: Order[]) {
  return orders.reduce((sum, o) => sum + o.total, 0);
}`,
        bad: `const d = 5;
const flag = user.purchases > 10;

function calc(arr) {
  return arr.reduce((s, x) => s + x.total, 0);
}`,
        tip: "Si vous devez ajouter un commentaire pour expliquer une variable, renommez-la.",
        difficulty: "débutant",
        tags: ["nommage", "lisibilité"],
      },
      {
        title: "Fonctions courtes et focalisées",
        description: "Une fonction = une seule responsabilité. Idéalement 5-15 lignes, max 30. Si elle fait trop, décomposez-la.",
        good: `function validateEmail(email: string): boolean {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

function sanitizeInput(input: string): string {
  return input.trim().toLowerCase();
}

function createUser(data: UserInput) {
  const email = sanitizeInput(data.email);
  if (!validateEmail(email)) throw new InvalidEmailError();
  return userRepository.save({ ...data, email });
}`,
        bad: `function processUser(data) {
  // validate email
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)) {
    throw new Error('Invalid email');
  }
  // sanitize
  data.email = data.email.trim().toLowerCase();
  // save to db
  const user = db.save(data);
  // send email
  mailer.send(user.email, 'Welcome!');
  // update analytics
  analytics.track('user_created', user);
  // ... 150 more lines
}`,
        tip: "Extrait de Robert C. Martin : « La première règle des fonctions est qu'elles doivent être petites. La deuxième règle est qu'elles doivent être encore plus petites. »",
        difficulty: "débutant",
        tags: ["fonctions", "SRP", "refactoring"],
      },
      {
        title: "Éviter les commentaires inutiles",
        description: "Le code doit être auto-documenté. Commentez le 'pourquoi', jamais le 'quoi'. Les commentaires menteurs sont pires que pas de commentaires.",
        good: `// Workaround: Safari 14 ne supporte pas gap dans flexbox
const useFallbackSpacing = isSafari14;

// Limite de 100 résultats imposée par l'API tierce
const MAX_RESULTS = 100;`,
        bad: `// Vérifie si l'utilisateur est admin
if (user.role === 'admin') { ... }

// Incrémente le compteur
counter++;

// Cette fonction retourne true si l'utilisateur est connecté
function isLoggedIn() { return !!token; }`,
        difficulty: "débutant",
        tags: ["commentaires", "documentation"],
      },
      {
        title: "DRY — Don't Repeat Yourself",
        description: "Chaque connaissance doit avoir une représentation unique et non ambiguë dans le système. Attention : l'abstraction prématurée est pire que la duplication.",
        good: `const formatCurrency = (amount: number, currency = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);

// Utilisé partout
formatCurrency(price);
formatCurrency(tax);
formatCurrency(shipping);`,
        bad: `console.log(price.toFixed(2) + ' €');
console.log(tax.toFixed(2) + ' €');
console.log(shipping.toFixed(2) + ' €');`,
        tip: "La règle de 3 : dupliquez une fois, c'est OK. À la 3ème, refactorisez.",
        difficulty: "débutant",
        tags: ["DRY", "refactoring", "abstraction"],
      },
      {
        title: "KISS — Keep It Simple, Stupid",
        description: "La simplicité est la sophistication suprême. Ne résolvez pas des problèmes qui n'existent pas encore.",
        good: `const isAdult = age >= 18;

const greeting = user.name ? \`Bonjour \${user.name}\` : 'Bonjour';`,
        bad: `const isAdult = AgeValidatorFactory
  .create(AgePolicy.DEFAULT)
  .withThreshold(AdultThreshold.LEGAL)
  .validate(age);

const greeting = new GreetingBuilder()
  .setLocale('fr')
  .setFormality(Formality.CASUAL)
  .build(user);`,
        difficulty: "intermédiaire",
        tags: ["simplicité", "sur-ingénierie"],
      },
      {
        title: "Composition over Inheritance",
        description: "Préférez la composition à l'héritage. L'héritage crée du couplage fort et des hiérarchies fragiles.",
        good: `const withLogging = (fn) => (...args) => {
  console.log(\`Calling \${fn.name}\`);
  return fn(...args);
};

const withRetry = (fn, retries = 3) => async (...args) => {
  for (let i = 0; i < retries; i++) {
    try { return await fn(...args); }
    catch (e) { if (i === retries - 1) throw e; }
  }
};

const fetchUser = withRetry(withLogging(api.getUser));`,
        bad: `class LoggableRetryableFetchableUser extends RetryableFetcher
  extends LoggableFetcher extends BaseFetcher { ... }`,
        tip: "En React, les hooks et HOCs sont de la composition. Les class components avec héritage profond sont un anti-pattern.",
        difficulty: "intermédiaire",
        tags: ["composition", "héritage", "design"],
      },
      {
        title: "Guard Clauses (Early Returns)",
        description: "Retournez tôt pour éviter l'imbrication excessive. Chaque niveau d'indentation augmente la charge cognitive.",
        good: `function processOrder(order: Order) {
  if (!order) throw new Error('Order required');
  if (order.items.length === 0) return { error: 'Empty order' };
  if (!order.payment) return { error: 'Payment required' };

  // Happy path — code principal non indenté
  const total = calculateTotal(order.items);
  return submitOrder({ ...order, total });
}`,
        bad: `function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.payment) {
        const total = calculateTotal(order.items);
        return submitOrder({ ...order, total });
      } else { return { error: 'Payment required' }; }
    } else { return { error: 'Empty order' }; }
  } else { throw new Error('Order required'); }
}`,
        difficulty: "débutant",
        tags: ["guard clause", "lisibilité", "indentation"],
      },
      {
        title: "Immutabilité et pureté",
        description: "Préférez les données immuables et les fonctions pures. Elles sont prévisibles, testables et thread-safe.",
        good: `// Immuable
const addItem = (cart: Item[], item: Item): Item[] =>
  [...cart, item];

// Pure — même entrée = même sortie
const calculateDiscount = (price: number, rate: number): number =>
  price * (1 - rate);`,
        bad: `// Mutable
function addItem(cart, item) {
  cart.push(item); // modifie l'original
  return cart;
}

// Impure — dépend de l'état externe
let discountRate = 0.1;
function calculateDiscount(price) {
  return price * (1 - discountRate);
}`,
        difficulty: "intermédiaire",
        tags: ["immutabilité", "fonctionnel", "pureté"],
      },
    ],
  },
  {
    id: "solid",
    title: "SOLID",
    icon: <BookOpen className="h-4 w-4" />,
    color: "text-chart-2",
    intro: "5 principes fondamentaux de la conception orientée objet, formulés par Robert C. Martin.",
    practices: [
      {
        title: "S — Single Responsibility Principle",
        description: "Une classe ne doit avoir qu'une seule raison de changer. Chaque module gère un seul aspect du système.",
        good: `class UserValidator {
  validate(user: User): ValidationResult { ... }
}

class UserRepository {
  save(user: User): Promise<User> { ... }
}

class WelcomeEmailSender {
  send(user: User): Promise<void> { ... }
}`,
        bad: `class UserService {
  validate(user: User) { ... }
  save(user: User) { ... }
  sendEmail(user: User) { ... }
  generateReport() { ... }
  updateUI() { ... }
}`,
        tip: "Demandez-vous : « Si je change X, est-ce que cette classe doit changer ? » Si oui pour plusieurs X, séparez.",
        difficulty: "intermédiaire",
        tags: ["SRP", "responsabilité", "découpage"],
      },
      {
        title: "O — Open/Closed Principle",
        description: "Ouvert à l'extension, fermé à la modification. Ajoutez des fonctionnalités sans modifier le code existant.",
        good: `abstract class Shape {
  abstract area(): number;
}

class Circle extends Shape {
  constructor(private radius: number) { super(); }
  area() { return Math.PI * this.radius ** 2; }
}

class Rectangle extends Shape {
  constructor(private w: number, private h: number) { super(); }
  area() { return this.w * this.h; }
}

// Ajouter un Triangle ne modifie rien d'existant
function totalArea(shapes: Shape[]) {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}`,
        bad: `function totalArea(shapes: any[]) {
  return shapes.reduce((sum, s) => {
    if (s.type === 'circle') return sum + Math.PI * s.r ** 2;
    if (s.type === 'rect') return sum + s.w * s.h;
    // Ajouter un triangle = modifier cette fonction
  }, 0);
}`,
        difficulty: "intermédiaire",
        tags: ["extension", "polymorphisme"],
      },
      {
        title: "L — Liskov Substitution Principle",
        description: "Un sous-type doit être substituable à son type de base sans altérer le comportement correct du programme.",
        good: `interface Flyable { fly(): void; }

class Sparrow implements Flyable {
  fly() { /* vole normalement */ }
}

// Le pingouin n'implémente PAS Flyable
class Penguin {
  swim() { /* nage */ }
}`,
        bad: `class Bird { fly() { /* vole */ } }

class Penguin extends Bird {
  fly() { throw new Error('Cannot fly!'); }
  // Viole LSP : le code qui attend un Bird plante
}`,
        tip: "Si ça ressemble à un canard mais a besoin de piles, c'est une mauvaise abstraction.",
        difficulty: "avancé",
        tags: ["substitution", "héritage", "contrat"],
      },
      {
        title: "I — Interface Segregation Principle",
        description: "Pas de client ne devrait être forcé de dépendre de méthodes qu'il n'utilise pas. Interfaces fines > interfaces grasses.",
        good: `interface Printable { print(): void; }
interface Scannable { scan(): void; }
interface Faxable { fax(): void; }

class ModernPrinter implements Printable, Scannable {
  print() { ... }
  scan() { ... }
}

class SimplePrinter implements Printable {
  print() { ... }
}`,
        bad: `interface Machine {
  print(): void;
  scan(): void;
  fax(): void;
  staple(): void;
}

// SimplePrinter forcé d'implémenter scan, fax, staple
class SimplePrinter implements Machine {
  print() { ... }
  scan() { throw new Error('Not supported'); }
  fax() { throw new Error('Not supported'); }
  staple() { throw new Error('Not supported'); }
}`,
        difficulty: "avancé",
        tags: ["interfaces", "découplage"],
      },
      {
        title: "D — Dependency Inversion Principle",
        description: "Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions.",
        good: `interface OrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
}

class OrderService {
  constructor(private repo: OrderRepository) {}

  async createOrder(data: OrderInput) {
    return this.repo.save(new Order(data));
  }
}

// En prod : new OrderService(new PostgresOrderRepo())
// En test : new OrderService(new InMemoryOrderRepo())`,
        bad: `class OrderService {
  private db = new PostgresDatabase();
  private cache = new RedisCache();

  async createOrder(data) {
    // Couplé à Postgres et Redis
    // Impossible à tester unitairement
  }
}`,
        tip: "L'injection de dépendances est la clé. En React, les Context et hooks sont une forme d'injection.",
        difficulty: "avancé",
        tags: ["injection", "abstraction", "testabilité"],
      },
    ],
  },
  {
    id: "patterns",
    title: "Design Patterns",
    icon: <Lightbulb className="h-4 w-4" />,
    color: "text-chart-3",
    intro: "Solutions éprouvées à des problèmes récurrents de conception logicielle.",
    practices: [
      {
        title: "Singleton",
        description: "Garantit une instance unique d'une classe avec un point d'accès global.",
        good: `class Database {
  private static instance: Database;
  private constructor() { /* connect */ }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

// En TypeScript/modules, un simple export suffit souvent :
export const db = createConnection(config);`,
        tip: "Cas d'usage : configuration globale, pools de connexions, caches. Attention : rend les tests plus difficiles.",
        difficulty: "intermédiaire",
        tags: ["créationnel", "instance unique"],
      },
      {
        title: "Factory Method",
        description: "Délègue la création d'objets à des sous-classes ou fonctions dédiées.",
        good: `type NotificationType = 'email' | 'sms' | 'push';

function createNotification(type: NotificationType): Notification {
  const map = {
    email: () => new EmailNotification(),
    sms: () => new SMSNotification(),
    push: () => new PushNotification(),
  };
  return map[type]();
}

// Usage
const notif = createNotification('email');
notif.send(user, message);`,
        tip: "Utile quand la logique de création est complexe ou dépend de la config.",
        difficulty: "intermédiaire",
        tags: ["créationnel", "factory"],
      },
      {
        title: "Observer / Pub-Sub",
        description: "Un objet (sujet) notifie automatiquement une liste d'observateurs de tout changement d'état.",
        good: `class EventBus {
  private listeners = new Map<string, Set<Function>>();

  on(event: string, cb: Function) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)!.delete(cb);
  }

  emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

// Usage
const bus = new EventBus();
bus.on('order:created', sendConfirmationEmail);
bus.on('order:created', updateInventory);
bus.emit('order:created', order);`,
        tip: "Utilisé dans : React state, DOM events, WebSockets, message queues.",
        difficulty: "intermédiaire",
        tags: ["comportemental", "événements", "découplage"],
      },
      {
        title: "Strategy",
        description: "Définit une famille d'algorithmes interchangeables encapsulés dans des classes/fonctions.",
        good: `interface CompressionStrategy {
  compress(data: Buffer): Buffer;
}

class GzipCompression implements CompressionStrategy {
  compress(data: Buffer) { return gzip(data); }
}

class BrotliCompression implements CompressionStrategy {
  compress(data: Buffer) { return brotli(data); }
}

class FileProcessor {
  constructor(private compression: CompressionStrategy) {}
  process(file: Buffer) {
    return this.compression.compress(file);
  }
}`,
        tip: "Élimine les longues chaînes if/else ou switch. En fonctionnel, un simple objet de fonctions suffit.",
        difficulty: "intermédiaire",
        tags: ["comportemental", "algorithme", "flexibilité"],
      },
      {
        title: "Adapter",
        description: "Convertit l'interface d'une classe en une autre interface attendue par le client.",
        good: `// API tierce avec une interface étrange
class LegacyPaymentGateway {
  makePayment(amountCents: number, curr: string) { ... }
}

// Notre interface propre
interface PaymentProvider {
  charge(amount: number, currency: string): Promise<Receipt>;
}

class LegacyPaymentAdapter implements PaymentProvider {
  constructor(private legacy: LegacyPaymentGateway) {}
  
  async charge(amount: number, currency: string) {
    return this.legacy.makePayment(Math.round(amount * 100), currency);
  }
}`,
        tip: "Parfait pour intégrer des librairies tierces sans polluer votre code métier.",
        difficulty: "avancé",
        tags: ["structurel", "intégration", "wrapper"],
      },
      {
        title: "Decorator",
        description: "Ajoute des responsabilités à un objet dynamiquement, sans modifier sa classe.",
        good: `// Décorateurs fonctionnels
const withLogging = <T extends (...args: any[]) => any>(fn: T) =>
  (...args: Parameters<T>): ReturnType<T> => {
    console.log(\`→ \${fn.name}(\${args.join(', ')})\`);
    const result = fn(...args);
    console.log(\`← \${fn.name} = \${result}\`);
    return result;
  };

const withTiming = <T extends (...args: any[]) => any>(fn: T) =>
  (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args);
    console.log(\`⏱ \${fn.name}: \${(performance.now() - start).toFixed(2)}ms\`);
    return result;
  };

const enhancedFetch = withTiming(withLogging(fetchUser));`,
        tip: "HOCs en React, middlewares Express, décorateurs TypeScript sont tous des variantes.",
        difficulty: "avancé",
        tags: ["structurel", "composition", "middleware"],
      },
    ],
  },
  {
    id: "security",
    title: "Sécurité",
    icon: <Shield className="h-4 w-4" />,
    color: "text-chart-4",
    intro: "La sécurité n'est pas optionnelle. OWASP Top 10 et bonnes pratiques essentielles.",
    practices: [
      {
        title: "Injection SQL",
        description: "Toujours utiliser des requêtes préparées/paramétrées. Jamais de concaténation de chaînes.",
        good: `// Node.js + pg
const result = await db.query(
  'SELECT * FROM users WHERE email = $1 AND active = $2',
  [email, true]
);

// Prisma (ORM)
const user = await prisma.user.findUnique({
  where: { email }
});`,
        bad: `// ⚠️ VULNÉRABLE — SQL injection
const result = await db.query(
  \`SELECT * FROM users WHERE email = '\${email}'\`
);
// email = "'; DROP TABLE users; --"`,
        difficulty: "débutant",
        tags: ["injection", "SQL", "OWASP"],
      },
      {
        title: "XSS — Cross-Site Scripting",
        description: "Échapper toute entrée utilisateur avant affichage. React le fait automatiquement, sauf avec dangerouslySetInnerHTML.",
        good: `// React échappe automatiquement
<p>{userInput}</p>

// Si HTML nécessaire, sanitizer d'abord
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userHtml)
}} />`,
        bad: `// ⚠️ VULNÉRABLE
element.innerHTML = userInput;

// React sans sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} />`,
        tip: "CSP (Content-Security-Policy) est une couche de défense supplémentaire essentielle.",
        difficulty: "débutant",
        tags: ["XSS", "sanitization", "OWASP"],
      },
      {
        title: "Authentification et sessions",
        description: "Hasher les mots de passe avec bcrypt/argon2 (jamais MD5/SHA1). Tokens JWT courts avec refresh tokens.",
        good: `// Hashage
const hash = await bcrypt.hash(password, 12);
const valid = await bcrypt.compare(input, hash);

// JWT avec expiration courte
const token = jwt.sign({ userId }, secret, { expiresIn: '15m' });
// + refresh token en httpOnly cookie`,
        bad: `// ⚠️ DANGEREUX
const hash = md5(password);
const hash = sha1(password);

// JWT sans expiration
const token = jwt.sign({ userId, role: 'admin' }, secret);
localStorage.setItem('token', token);`,
        difficulty: "intermédiaire",
        tags: ["auth", "mots de passe", "JWT"],
      },
      {
        title: "CORS et CSRF",
        description: "Configurer CORS strictement. Utiliser des tokens CSRF pour les formulaires sensibles. Cookies SameSite.",
        good: `// CORS restrictif
app.use(cors({
  origin: 'https://myapp.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Cookie sécurisé
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600000,
});`,
        bad: `// ⚠️ Trop permissif
app.use(cors({ origin: '*' }));

// Cookie non sécurisé
res.cookie('session', token);`,
        difficulty: "intermédiaire",
        tags: ["CORS", "CSRF", "cookies"],
      },
      {
        title: "Secrets et variables d'environnement",
        description: "Ne jamais committer de secrets. Utiliser des variables d'environnement et un gestionnaire de secrets.",
        good: `// .env (dans .gitignore)
DATABASE_URL=postgresql://...
API_KEY=sk-...

// Code
const apiKey = process.env.API_KEY;

// .gitignore
.env
.env.local
.env.production`,
        bad: `// ⚠️ COMMITÉ DANS GIT
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'admin123';`,
        tip: "Utilisez un vault (AWS Secrets Manager, HashiCorp Vault) en production.",
        difficulty: "débutant",
        tags: ["secrets", "env", "gitignore"],
      },
      {
        title: "Validation des entrées",
        description: "Valider côté client ET serveur. Ne jamais faire confiance aux données entrantes.",
        good: `// Zod pour la validation
const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
  name: z.string().min(1).max(100).trim(),
});

// Validation serveur
app.post('/users', (req, res) => {
  const result = UserSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json(result.error);
  // ... utiliser result.data
});`,
        bad: `// ⚠️ Aucune validation
app.post('/users', (req, res) => {
  db.save(req.body); // Quoi qu'il envoie...
});`,
        difficulty: "débutant",
        tags: ["validation", "zod", "sanitization"],
      },
    ],
  },
  {
    id: "performance",
    title: "Performance",
    icon: <Zap className="h-4 w-4" />,
    color: "text-chart-5",
    intro: "Chaque milliseconde compte. Mesurez d'abord, optimisez ensuite.",
    practices: [
      {
        title: "React.memo et useMemo",
        description: "Évitez les re-renders inutiles avec React.memo et mémoïsez les calculs coûteux.",
        good: `const ExpensiveList = React.memo(({ items }: Props) => {
  const sorted = useMemo(
    () => items.sort((a, b) => b.score - a.score),
    [items]
  );
  return sorted.map(item => <ListItem key={item.id} item={item} />);
});

const handleClick = useCallback(
  (id: string) => dispatch({ type: 'select', id }),
  [dispatch]
);`,
        bad: `// Re-render à chaque render du parent
const ExpensiveList = ({ items }) => {
  const sorted = items.sort((a, b) => b.score - a.score); // recalcul
  return sorted.map((item, i) => <ListItem key={i} item={item} />);
  //                                       ^^^ key={index} = mauvais
};`,
        tip: "N'optimisez pas prématurément. Utilisez React DevTools Profiler pour identifier les goulots.",
        difficulty: "intermédiaire",
        tags: ["React", "memo", "re-render"],
      },
      {
        title: "Code Splitting et Lazy Loading",
        description: "Divisez le bundle en chunks chargés à la demande. Route-based splitting est le plus efficace.",
        good: `// Route-based splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Lazy loading d'images
<img loading="lazy" src={imageUrl} alt="..." />`,
        tip: "Analysez votre bundle avec 'vite-plugin-visualizer' pour trouver les dépendances lourdes.",
        difficulty: "intermédiaire",
        tags: ["bundle", "lazy", "Suspense"],
      },
      {
        title: "Debounce et Throttle",
        description: "Limitez la fréquence d'exécution des fonctions coûteuses déclenchées par des événements fréquents.",
        good: `// Debounce : attend que l'utilisateur arrête de taper
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    fetchResults(query);
  }, 300),
  []
);

// Throttle : max 1 exécution toutes les 100ms
const throttledScroll = throttle(handleScroll, 100);
window.addEventListener('scroll', throttledScroll);`,
        tip: "Debounce = après une pause (recherche). Throttle = max X fois/seconde (scroll, resize).",
        difficulty: "débutant",
        tags: ["debounce", "throttle", "événements"],
      },
      {
        title: "Virtualisation de listes",
        description: "Pour les longues listes (>100 éléments), ne rendez que les éléments visibles à l'écran.",
        good: `import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(row => (
          <div key={row.key} style={{
            position: 'absolute',
            top: row.start,
            height: row.size,
          }}>
            {items[row.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}`,
        tip: "TanStack Virtual, react-window, react-virtuoso sont les options principales.",
        difficulty: "avancé",
        tags: ["virtualisation", "listes", "DOM"],
      },
      {
        title: "Images optimisées",
        description: "WebP/AVIF, dimensions correctes, lazy loading, CDN, et srcset pour le responsive.",
        good: `<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img
    src="hero.jpg"
    alt="Hero banner"
    loading="lazy"
    decoding="async"
    width="1200"
    height="600"
    srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w"
    sizes="(max-width: 768px) 100vw, 1200px"
  />
</picture>`,
        tip: "Spécifier width/height évite le CLS (Cumulative Layout Shift).",
        difficulty: "débutant",
        tags: ["images", "WebP", "CLS"],
      },
    ],
  },
  {
    id: "testing",
    title: "Testing",
    icon: <TestTube className="h-4 w-4" />,
    color: "text-chart-1",
    intro: "Le code sans tests est du code legacy. Tests unitaires, d'intégration et E2E forment la pyramide de tests.",
    practices: [
      {
        title: "Pyramide des tests",
        description: "Beaucoup de tests unitaires (rapides), quelques tests d'intégration, peu de tests E2E (lents et fragiles).",
        good: `// Unitaire — teste une fonction isolée
test('calculateDiscount applies 10% for orders > 100€', () => {
  expect(calculateDiscount(150, 0.1)).toBe(135);
});

// Intégration — teste un flux
test('user registration flow', async () => {
  const user = await registerUser({ email: 'test@test.com', password: 'Pass123!' });
  expect(user.id).toBeDefined();
  expect(user.verified).toBe(false);
});

// E2E — teste le comportement utilisateur réel
test('user can login and see dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'user@test.com');
  await page.click('button[type=submit]');
  await expect(page.locator('h1')).toHaveText('Dashboard');
});`,
        tip: "Ratio idéal : 70% unitaires, 20% intégration, 10% E2E.",
        difficulty: "intermédiaire",
        tags: ["pyramide", "unitaire", "intégration", "E2E"],
      },
      {
        title: "Arrange-Act-Assert (AAA)",
        description: "Structure chaque test en 3 phases claires : préparer, agir, vérifier.",
        good: `test('addToCart increases item count', () => {
  // Arrange
  const cart = createEmptyCart();
  const item = { id: '1', name: 'Widget', price: 9.99 };

  // Act
  const updatedCart = addToCart(cart, item);

  // Assert
  expect(updatedCart.items).toHaveLength(1);
  expect(updatedCart.total).toBe(9.99);
});`,
        bad: `test('cart works', () => {
  const c = addToCart(createEmptyCart(), { id: '1', name: 'W', price: 9.99 });
  expect(c.items.length).toBe(1);
  removeFromCart(c, '1');
  expect(c.items.length).toBe(0);
  // Teste trop de choses, pas de structure claire
});`,
        difficulty: "débutant",
        tags: ["AAA", "structure", "lisibilité"],
      },
      {
        title: "Mocks et Stubs judicieux",
        description: "Mockez les dépendances externes (API, DB), pas la logique interne. Trop de mocks = tests fragiles.",
        good: `// Mock une API externe
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({
    id: '1', name: 'Alice', email: 'alice@test.com'
  }),
}));

test('UserProfile displays user name', async () => {
  render(<UserProfile userId="1" />);
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});`,
        bad: `// ⚠️ Mock TOUT — le test ne vérifie plus rien d'utile
vi.mock('./utils');
vi.mock('./hooks');
vi.mock('./components/Button');
vi.mock('./components/Input');

test('Page renders', () => {
  render(<Page />); // tout est mocké, que teste-t-on ?
});`,
        tip: "Test Doubles : Stub (retourne une valeur), Mock (vérifie un appel), Spy (observe sans modifier).",
        difficulty: "intermédiaire",
        tags: ["mocks", "stubs", "isolation"],
      },
      {
        title: "Testing Library — bonnes pratiques",
        description: "Testez le comportement utilisateur, pas l'implémentation. Utilisez les queries par rôle/texte.",
        good: `// Queries par rôle et texte accessible
const button = screen.getByRole('button', { name: /soumettre/i });
const input = screen.getByLabelText('Email');
const alert = screen.getByRole('alert');

// Interactions utilisateur
await userEvent.type(input, 'test@test.com');
await userEvent.click(button);

// Assertions sur ce que l'utilisateur voit
expect(screen.getByText('Inscription réussie')).toBeInTheDocument();`,
        bad: `// ⚠️ Teste l'implémentation, pas le comportement
const { container } = render(<Form />);
const input = container.querySelector('.email-input');
const btn = container.querySelector('#submit-btn');

expect(component.state.isValid).toBe(true);`,
        tip: "Règle d'or : « Plus vos tests ressemblent à la façon dont le logiciel est utilisé, plus ils vous donnent confiance. »",
        difficulty: "intermédiaire",
        tags: ["testing-library", "accessibilité", "queries"],
      },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibilité",
    icon: <Accessibility className="h-4 w-4" />,
    color: "text-chart-2",
    intro: "Le web est pour tout le monde. L'accessibilité (a11y) n'est pas un nice-to-have, c'est un devoir.",
    practices: [
      {
        title: "HTML sémantique",
        description: "Utilisez les éléments HTML natifs qui portent un sens. Les lecteurs d'écran s'en servent pour naviguer.",
        good: `<header>...</header>
<nav aria-label="Navigation principale">
  <ul>
    <li><a href="/home">Accueil</a></li>
  </ul>
</nav>
<main>
  <article>
    <h1>Titre de l'article</h1>
    <p>Contenu...</p>
  </article>
</main>
<footer>...</footer>`,
        bad: `<div class="header">...</div>
<div class="nav">
  <div class="link" onclick="goto('/home')">Accueil</div>
</div>
<div class="main">
  <div class="article">
    <div class="title">Titre</div>
    <div class="text">Contenu...</div>
  </div>
</div>`,
        difficulty: "débutant",
        tags: ["sémantique", "HTML", "landmarks"],
      },
      {
        title: "Labels et formulaires",
        description: "Chaque champ de formulaire doit avoir un label associé. Utilisez aria-describedby pour les messages d'erreur.",
        good: `<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? 'email-error' : undefined}
  />
  {error && (
    <p id="email-error" role="alert" className="text-destructive">
      {error}
    </p>
  )}
</div>`,
        bad: `<input placeholder="Email..." />
<!-- Pas de label, pas d'association, pas d'erreur accessible -->`,
        tip: "Le placeholder n'est PAS un substitut au label. Il disparaît quand on tape.",
        difficulty: "débutant",
        tags: ["formulaires", "labels", "aria"],
      },
      {
        title: "Contraste et couleurs",
        description: "Ratio de contraste minimum : 4.5:1 pour le texte normal, 3:1 pour le grand texte (>18px bold).",
        good: `/* Bon contraste */
.text { color: #1a1a2e; background: #ffffff; }
/* Ratio: 16.75:1 ✅ */

/* Ne pas communiquer par la couleur seule */
.error {
  color: #dc2626;
  border-left: 3px solid #dc2626;
  /* + icône + texte d'erreur */
}`,
        bad: `/* Faible contraste */
.text { color: #999999; background: #ffffff; }
/* Ratio: 2.85:1 ❌ */

/* Couleur seule pour indiquer le statut */
.status-ok { color: green; }
.status-error { color: red; }
/* Les daltoniens ne distinguent pas */`,
        tip: "Utilisez l'outil Contrast Checker de ce toolkit pour vérifier vos ratios.",
        difficulty: "débutant",
        tags: ["contraste", "couleurs", "WCAG"],
        links: [{ label: "Contrast Checker", url: "/contrast-checker" }],
      },
      {
        title: "Navigation au clavier",
        description: "Tout ce qui est interactif doit être focusable et opérable au clavier. Tab, Enter, Escape, flèches.",
        good: `// Bouton accessible
<button onClick={handleAction} onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') handleAction();
}}>
  Action
</button>

// Focus visible
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

// Piège de focus dans les modales
<dialog onKeyDown={(e) => {
  if (e.key === 'Escape') close();
}}>`,
        bad: `// ⚠️ div cliquable non focusable
<div onClick={handleAction}>Action</div>

// ⚠️ Suppression du focus visible
*:focus { outline: none; }`,
        tip: "Testez votre app sans souris pendant 5 minutes. Pouvez-vous tout faire ?",
        difficulty: "intermédiaire",
        tags: ["clavier", "focus", "navigation"],
      },
    ],
  },
  {
    id: "git",
    title: "Git & Workflow",
    icon: <GitBranch className="h-4 w-4" />,
    color: "text-chart-3",
    intro: "Un bon workflow Git est la fondation d'une collaboration efficace.",
    practices: [
      {
        title: "Commits conventionnels",
        description: "Format : type(scope): description. Types : feat, fix, docs, style, refactor, test, chore.",
        good: `feat(auth): add Google OAuth login
fix(cart): prevent negative quantities
docs(readme): update installation instructions
refactor(api): extract validation middleware
test(user): add registration flow tests
chore(deps): upgrade React to 18.3`,
        bad: `fixed stuff
update
WIP
asdfgh
changes
final version (for real this time)`,
        tip: "Utilisez commitlint + husky pour automatiser la validation des messages de commit.",
        difficulty: "débutant",
        tags: ["commits", "conventionnel", "historique"],
      },
      {
        title: "Branches et Pull Requests",
        description: "Branches courtes, PRs focalisées. Nommage : feature/, fix/, hotfix/, chore/.",
        good: `# Branches descriptives
feature/user-authentication
fix/cart-total-calculation
hotfix/security-patch-xss
chore/upgrade-dependencies

# PR small et focalisée
- Titre clair
- Description du pourquoi
- Screenshots si UI
- Tests ajoutés/modifiés
- Reviewer assigné`,
        bad: `# Branches vagues
my-branch
dev2
test
fix

# PR de 2000 lignes touchant 30 fichiers
# Impossible à reviewer correctement`,
        tip: "Règle d'or : une PR ne devrait pas prendre plus de 30 min à reviewer. Au-delà, découpez.",
        difficulty: "débutant",
        tags: ["branches", "PR", "review"],
      },
      {
        title: "Git Rebase vs Merge",
        description: "Rebase pour un historique linéaire et propre. Merge pour préserver l'historique des branches.",
        good: `# Rebase interactif avant de pusher
git rebase -i HEAD~3
# Squash les commits WIP
# Reformuler les messages

# Rebase sur main avant merge
git checkout feature/auth
git rebase main
git checkout main
git merge feature/auth --no-ff`,
        tip: "Règle d'or : ne jamais rebase une branche partagée. Rebase local, merge distant.",
        difficulty: "intermédiaire",
        tags: ["rebase", "merge", "historique"],
      },
    ],
  },
  {
    id: "typescript",
    title: "TypeScript",
    icon: <FileCode className="h-4 w-4" />,
    color: "text-chart-5",
    intro: "TypeScript rend le code plus sûr et auto-documenté. Utilisez-le à son plein potentiel.",
    practices: [
      {
        title: "Éviter any, préférer unknown",
        description: "any désactive le type-checking. unknown force la vérification avant usage.",
        good: `function parseJSON(raw: string): unknown {
  return JSON.parse(raw);
}

// Forcer la vérification
const data = parseJSON(input);
if (isUser(data)) {
  console.log(data.name); // ✅ type-safe
}

// Type guard
function isUser(val: unknown): val is User {
  return typeof val === 'object' && val !== null && 'name' in val;
}`,
        bad: `function parseJSON(raw: string): any {
  return JSON.parse(raw);
}

const data = parseJSON(input);
console.log(data.name); // ⚠️ Pas d'erreur, mais peut crasher
data.foo.bar.baz; // ⚠️ any se propage partout`,
        tip: "Activez 'strict: true' dans tsconfig.json. C'est non négociable.",
        difficulty: "intermédiaire",
        tags: ["any", "unknown", "type-safety"],
      },
      {
        title: "Discriminated Unions",
        description: "Modélisez les états mutuellement exclusifs avec des unions discriminées. Élimine les états impossibles.",
        good: `type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderState(state: AsyncState<User>) {
  switch (state.status) {
    case 'idle': return <Placeholder />;
    case 'loading': return <Spinner />;
    case 'success': return <UserCard user={state.data} />;
    case 'error': return <ErrorBanner error={state.error} />;
  }
}`,
        bad: `// ⚠️ États impossibles possibles
interface State {
  isLoading: boolean;
  data: User | null;
  error: Error | null;
}
// isLoading: true, data: User, error: Error ← incohérent`,
        tip: "Exhaustive check : ajoutez 'default: const _: never = state;' pour que TS vous alerte si vous oubliez un cas.",
        difficulty: "avancé",
        tags: ["unions", "états", "type-safety"],
      },
      {
        title: "Utility Types natifs",
        description: "Maîtrisez Pick, Omit, Partial, Required, Record, Readonly pour manipuler les types efficacement.",
        good: `interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
}

type CreateUserInput = Omit<User, 'id'>;
type UpdateUserInput = Partial<Pick<User, 'name' | 'email' | 'avatar'>>;
type UserPublicProfile = Pick<User, 'name' | 'avatar'>;
type ReadonlyUser = Readonly<User>;

// Record pour les maps typées
type RolePermissions = Record<User['role'], string[]>;
const perms: RolePermissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read'],
};`,
        tip: "Combinez-les : Required<Pick<User, 'name' | 'email'>> & Partial<Omit<User, 'name' | 'email'>>",
        difficulty: "intermédiaire",
        tags: ["utility types", "Pick", "Omit", "Partial"],
      },
      {
        title: "Generics et contraintes",
        description: "Les generics rendent le code réutilisable tout en gardant le type-safety.",
        good: `// Fonction générique contrainte
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Hook générique
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  const set = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, set] as const;
}

// Usage typé automatiquement
const [theme, setTheme] = useLocalStorage('theme', 'dark');
// theme: string, setTheme: (v: string) => void`,
        difficulty: "avancé",
        tags: ["generics", "contraintes", "réutilisabilité"],
      },
    ],
  },
  {
    id: "react-patterns",
    title: "React Patterns",
    icon: <Zap className="h-4 w-4" />,
    color: "text-chart-4",
    intro: "Patterns avancés React pour des composants maintenables, réutilisables et robustes.",
    practices: [
      {
        title: "Custom Hooks — extraction de logique",
        description: "Extrayez la logique réutilisable dans des hooks personnalisés. Chaque hook = une responsabilité.",
        good: `function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

// Usage
const debouncedSearch = useDebounce(query);
const isMobile = useMediaQuery('(max-width: 768px)');`,
        bad: `// ⚠️ Logique dupliquée dans chaque composant
function SearchPage() {
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(id);
  }, [query]);
  // ...
}

function FilterPage() {
  // Même logique copiée-collée...
}`,
        tip: "Convention : préfixez toujours par 'use'. Un hook ne doit pas retourner de JSX — c'est un composant.",
        difficulty: "intermédiaire",
        tags: ["hooks", "réutilisabilité", "DRY"],
      },
      {
        title: "useReducer pour l'état complexe",
        description: "Préférez useReducer à useState quand l'état a plusieurs sous-valeurs interdépendantes.",
        good: `type Action =
  | { type: 'fetch' }
  | { type: 'success'; data: User[] }
  | { type: 'error'; error: string }
  | { type: 'reset' };

interface State {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: User[];
  error: string | null;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'fetch':  return { ...state, status: 'loading', error: null };
    case 'success': return { status: 'success', data: action.data, error: null };
    case 'error':  return { ...state, status: 'error', error: action.error };
    case 'reset':  return { status: 'idle', data: [], error: null };
  }
}

const [state, dispatch] = useReducer(reducer, initialState);`,
        bad: `// ⚠️ Plusieurs useState interdépendants
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);
const [error, setError] = useState(null);
// Bug facile : oublier de reset error quand loading = true`,
        tip: "useReducer est aussi testable unitairement car le reducer est une fonction pure.",
        difficulty: "intermédiaire",
        tags: ["useReducer", "état", "actions"],
      },
      {
        title: "Context + Provider Pattern",
        description: "Créez un contexte typé avec un Provider dédié et un hook d'accès pour éviter le prop-drilling.",
        good: `interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggle = useCallback(
    () => setTheme(t => t === 'light' ? 'dark' : 'light'),
    []
  );
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}`,
        bad: `// ⚠️ Prop drilling sur 5 niveaux
<App theme={theme} toggleTheme={toggle}>
  <Layout theme={theme} toggleTheme={toggle}>
    <Sidebar theme={theme} toggleTheme={toggle}>
      <NavItem theme={theme} toggleTheme={toggle} />`,
        tip: "Séparez les contextes par domaine (auth, theme, i18n). Un contexte fourre-tout cause des re-renders inutiles.",
        difficulty: "intermédiaire",
        tags: ["context", "provider", "prop-drilling"],
      },
      {
        title: "Compound Components",
        description: "Composants qui partagent un état implicite via Context, offrant une API flexible et déclarative.",
        good: `const TabsContext = createContext<{
  active: string;
  setActive: (id: string) => void;
} | null>(null);

function Tabs({ children, defaultValue }: Props) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div role="tablist">{children}</div>
    </TabsContext.Provider>
  );
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const ctx = useContext(TabsContext)!;
  return (
    <button
      role="tab"
      aria-selected={ctx.active === id}
      onClick={() => ctx.setActive(id)}
    >
      {children}
    </button>
  );
}

function Panel({ id, children }: { id: string; children: ReactNode }) {
  const ctx = useContext(TabsContext)!;
  if (ctx.active !== id) return null;
  return <div role="tabpanel">{children}</div>;
}

Tabs.Tab = Tab;
Tabs.Panel = Panel;

// Usage déclaratif
<Tabs defaultValue="a">
  <Tabs.Tab id="a">Onglet A</Tabs.Tab>
  <Tabs.Tab id="b">Onglet B</Tabs.Tab>
  <Tabs.Panel id="a">Contenu A</Tabs.Panel>
  <Tabs.Panel id="b">Contenu B</Tabs.Panel>
</Tabs>`,
        bad: `// ⚠️ API rigide avec config objet
<Tabs
  tabs={[
    { id: 'a', label: 'Onglet A', content: <div>Contenu A</div> },
    { id: 'b', label: 'Onglet B', content: <div>Contenu B</div> },
  ]}
/>
// Impossible de customiser le rendu de chaque tab`,
        tip: "Utilisé par Radix UI, Headless UI, Reach UI. Pensez-y pour Select, Accordion, Menu…",
        difficulty: "avancé",
        tags: ["compound", "composition", "API design"],
      },
      {
        title: "Error Boundaries",
        description: "Capturez les erreurs React au rendu pour afficher un fallback au lieu de crasher toute l'app.",
        good: `class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    // Envoyer à un service de monitoring (Sentry, etc.)
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div role="alert" className="p-4 border rounded">
          <h2>Quelque chose s'est mal passé</h2>
          <pre>{this.state.error.message}</pre>
          <button onClick={() => this.setState({ error: null })}>
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage stratégique
<ErrorBoundary fallback={<PageError />}>
  <Dashboard />
</ErrorBoundary>`,
        bad: `// ⚠️ Pas de boundary — une erreur crashe tout
function App() {
  return (
    <Layout>
      <Dashboard />   {/* Si ça crash... */}
      <Sidebar />     {/* ...tout disparaît */}
    </Layout>
  );
}`,
        tip: "Placez des boundaries autour de chaque route et des widgets indépendants. react-error-boundary simplifie l'API.",
        difficulty: "avancé",
        tags: ["error boundary", "résilience", "fallback"],
      },
      {
        title: "Render Props & Children as Function",
        description: "Passez une fonction comme children pour déléguer le rendu au parent tout en partageant de la logique.",
        good: `function MouseTracker({ children }: {
  children: (pos: { x: number; y: number }) => ReactNode;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) =>
      setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return <>{children(pos)}</>;
}

// Usage — le parent décide du rendu
<MouseTracker>
  {({ x, y }) => (
    <div style={{ position: 'fixed', left: x, top: y }}>
      🎯 {x}, {y}
    </div>
  )}
</MouseTracker>`,
        tip: "Aujourd'hui les hooks remplacent souvent ce pattern, mais il reste utile pour les composants headless.",
        difficulty: "avancé",
        tags: ["render props", "headless", "flexibilité"],
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

const LS_KEY_PROGRESS = "best-practices-progress";
const LS_KEY_BOOKMARKS = "best-practices-bookmarks";

function loadSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}

function saveSet(key: string, s: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...s]));
}

const DIFFICULTY_CONFIG: Record<Difficulty, { color: DifficultyColor; label: string }> = {
  débutant: { color: "default", label: "Débutant" },
  intermédiaire: { color: "secondary", label: "Intermédiaire" },
  avancé: { color: "destructive", label: "Avancé" },
};

function practiceKey(sectionId: string, idx: number) {
  return `${sectionId}::${idx}`;
}

// ── Practice Card ──────────────────────────────────────────────────────

function PracticeCard({
  practice,
  sectionId,
  idx,
  completed,
  bookmarked,
  onToggleComplete,
  onToggleBookmark,
}: {
  practice: Practice;
  sectionId: string;
  idx: number;
  completed: boolean;
  bookmarked: boolean;
  onToggleComplete: () => void;
  onToggleBookmark: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const diff = DIFFICULTY_CONFIG[practice.difficulty];

  return (
    <Card className={`transition-all ${completed ? "opacity-70 border-primary/30 bg-primary/5" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-base">{practice.title}</CardTitle>
              <Badge variant={diff.color} className="text-[10px] px-1.5 py-0">
                {diff.label}
              </Badge>
              {practice.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardDescription className="text-sm">{practice.description}</CardDescription>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleBookmark}
              title={bookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {bookmarked ? (
                <BookmarkCheck className="h-3.5 w-3.5 text-chart-4" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleComplete}
              title={completed ? "Marquer comme non lu" : "Marquer comme lu"}
            >
              {completed ? (
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/40" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-3 pt-0">
          {practice.good && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Bon exemple</span>
              </div>
              <pre className="p-3 bg-primary/5 border border-primary/20 rounded-lg overflow-x-auto">
                <code className="text-xs font-mono leading-relaxed text-foreground">{practice.good}</code>
              </pre>
            </div>
          )}
          {practice.bad && (
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <XCircle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-semibold text-destructive uppercase tracking-wider">Mauvais exemple</span>
              </div>
              <pre className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg overflow-x-auto">
                <code className="text-xs font-mono leading-relaxed text-foreground">{practice.bad}</code>
              </pre>
            </div>
          )}
          {practice.tip && (
            <div className="flex items-start gap-2.5 p-3 bg-accent/50 border border-accent rounded-lg">
              <Lightbulb className="h-4 w-4 text-chart-4 mt-0.5 shrink-0" />
              <span className="text-sm text-foreground">{practice.tip}</span>
            </div>
          )}
          {practice.links && practice.links.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {practice.links.map((link) => (
                <a key={link.url} href={link.url} className="text-xs text-primary hover:underline">
                  → {link.label}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export default function BestPractices() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(SECTIONS[0].id);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [completedSet, setCompletedSet] = useState(() => loadSet(LS_KEY_PROGRESS));
  const [bookmarkSet, setBookmarkSet] = useState(() => loadSet(LS_KEY_BOOKMARKS));

  useEffect(() => saveSet(LS_KEY_PROGRESS, completedSet), [completedSet]);
  useEffect(() => saveSet(LS_KEY_BOOKMARKS, bookmarkSet), [bookmarkSet]);

  const toggleCompleted = useCallback((key: string) => {
    setCompletedSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((key: string) => {
    setBookmarkSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const resetProgress = () => {
    setCompletedSet(new Set());
    setBookmarkSet(new Set());
    toast({ title: "Progression réinitialisée" });
  };

  // Stats
  const totalPractices = SECTIONS.reduce((sum, s) => sum + s.practices.length, 0);
  const completedCount = completedSet.size;
  const progressPercent = totalPractices > 0 ? Math.round((completedCount / totalPractices) * 100) : 0;

  // Filter
  const filterPractices = (section: Section) => {
    return section.practices
      .map((p, i) => ({ practice: p, idx: i }))
      .filter(({ practice, idx }) => {
        const key = practiceKey(section.id, idx);
        if (showBookmarksOnly && !bookmarkSet.has(key)) return false;
        if (difficultyFilter !== "all" && practice.difficulty !== difficultyFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            practice.title.toLowerCase().includes(q) ||
            practice.description.toLowerCase().includes(q) ||
            practice.tags.some((t) => t.toLowerCase().includes(q))
          );
        }
        return true;
      });
  };

  // Section stats
  const sectionStats = (section: Section) => {
    const total = section.practices.length;
    const done = section.practices.filter((_, i) => completedSet.has(practiceKey(section.id, i))).length;
    return { total, done };
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Award className="h-7 w-7 text-primary" />
            </div>
            Bonnes Pratiques
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Clean Code, SOLID, Design Patterns, Sécurité, Performance, Testing, Accessibilité, Git, TypeScript et React Patterns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={resetProgress}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Réinitialiser
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Trophy className="h-5 w-5 text-chart-4 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  Progression globale
                </span>
                <span className="text-muted-foreground">
                  {completedCount}/{totalPractices} pratiques maîtrisées ({progressPercent}%)
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une pratique, un tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            <SelectItem value="débutant">Débutant</SelectItem>
            <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
            <SelectItem value="avancé">Avancé</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showBookmarksOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
        >
          <BookmarkCheck className="h-3.5 w-3.5 mr-1" />
          Favoris
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          {SECTIONS.map((section) => {
            const stats = sectionStats(section);
            return (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20"
              >
                {section.icon}
                <span className="hidden sm:inline">{section.title}</span>
                <span className="text-[10px] text-muted-foreground ml-0.5">
                  {stats.done}/{stats.total}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {SECTIONS.map((section) => {
          const filtered = filterPractices(section);

          return (
            <TabsContent key={section.id} value={section.id}>
              {/* Section intro */}
              <div className="mb-4 p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-foreground">{section.intro}</p>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>Aucune pratique trouvée pour ces filtres</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-420px)]">
                  <div className="space-y-3 pr-4">
                    {filtered.map(({ practice, idx }) => {
                      const key = practiceKey(section.id, idx);
                      return (
                        <PracticeCard
                          key={key}
                          practice={practice}
                          sectionId={section.id}
                          idx={idx}
                          completed={completedSet.has(key)}
                          bookmarked={bookmarkSet.has(key)}
                          onToggleComplete={() => toggleCompleted(key)}
                          onToggleBookmark={() => toggleBookmark(key)}
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
