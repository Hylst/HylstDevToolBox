import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Star, StarOff, Download, ExternalLink, RotateCcw, Brain, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Term {
  id: string;
  term: string;
  definition: string;
  category: string;
  related?: string[];
  link?: string;
}

const glossaryTerms: Term[] = [
  // Web
  { id: "api", term: "API", definition: "Application Programming Interface. Ensemble de règles et protocoles permettant à des applications de communiquer entre elles.", category: "Web", related: ["rest", "graphql", "endpoint"] },
  { id: "rest", term: "REST", definition: "Representational State Transfer. Style d'architecture pour les APIs web utilisant HTTP.", category: "Web", related: ["api", "http", "crud"] },
  { id: "graphql", term: "GraphQL", definition: "Langage de requête pour APIs développé par Facebook, permettant de demander exactement les données nécessaires.", category: "Web", related: ["api", "rest"] },
  { id: "http", term: "HTTP", definition: "HyperText Transfer Protocol. Protocole de communication client-serveur pour le web.", category: "Web", related: ["https", "api"] },
  { id: "https", term: "HTTPS", definition: "HTTP Secure. Version sécurisée de HTTP utilisant SSL/TLS.", category: "Web", related: ["http", "ssl"] },
  { id: "cors", term: "CORS", definition: "Cross-Origin Resource Sharing. Mécanisme permettant à une page web d'accéder à des ressources d'un autre domaine.", category: "Web", related: ["http", "api"] },
  { id: "websocket", term: "WebSocket", definition: "Protocole de communication bidirectionnel en temps réel.", category: "Web", related: ["http"] },
  { id: "cdn", term: "CDN", definition: "Content Delivery Network. Réseau de serveurs distribués pour accélérer la livraison de contenu.", category: "Web", related: ["cache"] },
  { id: "dns", term: "DNS", definition: "Domain Name System. Système traduisant les noms de domaine en adresses IP.", category: "Web" },
  { id: "spa", term: "SPA", definition: "Single Page Application. Application web chargeant une seule page HTML.", category: "Web", related: ["pwa"] },
  { id: "pwa", term: "PWA", definition: "Progressive Web App. Application web offrant une expérience native.", category: "Web", related: ["spa"] },
  { id: "ssr", term: "SSR", definition: "Server-Side Rendering. Rendu des pages côté serveur.", category: "Web", related: ["csr", "ssg"] },
  { id: "ssg", term: "SSG", definition: "Static Site Generation. Génération de pages HTML statiques au build.", category: "Web", related: ["ssr"] },
  { id: "csr", term: "CSR", definition: "Client-Side Rendering. Rendu des pages côté client via JavaScript.", category: "Web", related: ["ssr"] },
  { id: "json", term: "JSON", definition: "JavaScript Object Notation. Format léger d'échange de données.", category: "Web", related: ["xml"] },
  { id: "xml", term: "XML", definition: "eXtensible Markup Language. Format de données structuré.", category: "Web", related: ["json"] },
  { id: "yaml", term: "YAML", definition: "YAML Ain't Markup Language. Format de sérialisation lisible.", category: "Web", related: ["json"] },
  { id: "endpoint", term: "Endpoint", definition: "URL spécifique d'une API où les requêtes sont envoyées.", category: "Web", related: ["api", "rest"] },
  { id: "cookie", term: "Cookie", definition: "Petit fichier stocké par le navigateur pour maintenir l'état.", category: "Web", related: ["session"] },

  // Backend
  { id: "crud", term: "CRUD", definition: "Create, Read, Update, Delete. Les quatre opérations de base sur les données.", category: "Backend", related: ["api", "rest"] },
  { id: "orm", term: "ORM", definition: "Object-Relational Mapping. Mapping entre objets et base de données relationnelle.", category: "Backend", related: ["sql"] },
  { id: "mvc", term: "MVC", definition: "Model-View-Controller. Pattern d'architecture séparant données, logique et présentation.", category: "Backend" },
  { id: "middleware", term: "Middleware", definition: "Logiciel intermédiaire traitant les requêtes entre client et application.", category: "Backend", related: ["api"] },
  { id: "microservices", term: "Microservices", definition: "Architecture décomposant une application en services indépendants.", category: "Backend", related: ["monolith", "docker"] },
  { id: "monolith", term: "Monolith", definition: "Architecture où toute l'application est un seul bloc déployable.", category: "Backend", related: ["microservices"] },
  { id: "serverless", term: "Serverless", definition: "Modèle d'exécution où le cloud gère l'infrastructure serveur.", category: "Backend", related: ["faas"] },
  { id: "faas", term: "FaaS", definition: "Function as a Service. Exécution de fonctions dans le cloud.", category: "Backend", related: ["serverless"] },
  { id: "webhook", term: "Webhook", definition: "Callback HTTP déclenché lors d'événements spécifiques.", category: "Backend", related: ["api"] },
  { id: "queue", term: "Queue", definition: "File d'attente pour traiter les tâches de manière asynchrone.", category: "Backend", related: ["redis"] },
  { id: "cache", term: "Cache", definition: "Stockage temporaire pour accélérer les accès ultérieurs.", category: "Backend", related: ["redis", "cdn"] },
  { id: "singleton", term: "Singleton", definition: "Design pattern garantissant une seule instance d'une classe.", category: "Backend" },
  { id: "factory", term: "Factory", definition: "Design pattern créant des objets sans spécifier leur classe exacte.", category: "Backend" },
  { id: "observer", term: "Observer", definition: "Design pattern où un objet notifie ses dépendants.", category: "Backend" },
  { id: "solid", term: "SOLID", definition: "Cinq principes de conception orientée objet pour un code maintenable.", category: "Backend" },
  { id: "dry", term: "DRY", definition: "Don't Repeat Yourself. Principe évitant la duplication de code.", category: "Backend" },
  { id: "kiss", term: "KISS", definition: "Keep It Simple, Stupid. Principe favorisant la simplicité.", category: "Backend" },
  { id: "yagni", term: "YAGNI", definition: "You Aren't Gonna Need It. Ne pas implémenter avant d'en avoir besoin.", category: "Backend" },
  { id: "regex", term: "Regex", definition: "Regular Expression. Motif de recherche pour correspondance de texte.", category: "Backend" },
  { id: "cqrs", term: "CQRS", definition: "Command Query Responsibility Segregation. Sépare les lectures et écritures en modèles distincts.", category: "Backend" },
  { id: "event-sourcing", term: "Event Sourcing", definition: "Pattern stockant l'état comme séquence d'événements plutôt que comme état courant.", category: "Backend" },
  { id: "hexagonal", term: "Architecture Hexagonale", definition: "Architecture isolant le domaine métier des détails techniques via des ports et adaptateurs.", category: "Backend" },

  // Frontend
  { id: "dom", term: "DOM", definition: "Document Object Model. Représentation arborescente d'une page HTML.", category: "Frontend", related: ["virtualdom"] },
  { id: "virtualdom", term: "Virtual DOM", definition: "Représentation légère du DOM réel pour optimiser les mises à jour.", category: "Frontend", related: ["dom"] },
  { id: "jsx", term: "JSX", definition: "JavaScript XML. Extension permettant d'écrire du HTML dans JavaScript.", category: "Frontend" },
  { id: "component", term: "Component", definition: "Bloc réutilisable encapsulant UI et logique.", category: "Frontend" },
  { id: "state", term: "State", definition: "Données internes d'un composant pouvant changer et déclencher un re-rendu.", category: "Frontend", related: ["props"] },
  { id: "props", term: "Props", definition: "Propriétés passées d'un composant parent à un enfant.", category: "Frontend", related: ["state"] },
  { id: "hooks", term: "Hooks", definition: "Fonctions React pour utiliser state et lifecycle dans les composants fonctionnels.", category: "Frontend" },
  { id: "bundler", term: "Bundler", definition: "Outil regroupant les fichiers sources en bundles optimisés.", category: "Frontend" },
  { id: "npm", term: "npm", definition: "Node Package Manager. Gestionnaire de paquets pour JavaScript.", category: "Frontend" },
  { id: "typescript", term: "TypeScript", definition: "Sur-ensemble typé de JavaScript compilant vers JavaScript.", category: "Frontend" },
  { id: "callback", term: "Callback", definition: "Fonction passée en argument pour être exécutée plus tard.", category: "Frontend", related: ["promise"] },
  { id: "promise", term: "Promise", definition: "Objet représentant une valeur future (succès ou échec async).", category: "Frontend", related: ["async"] },
  { id: "async", term: "Async/Await", definition: "Syntaxe pour écrire du code asynchrone de manière synchrone.", category: "Frontend", related: ["promise"] },
  { id: "localstorage", term: "LocalStorage", definition: "API de stockage persistant côté navigateur.", category: "Frontend" },
  { id: "lazy", term: "Lazy Loading", definition: "Chargement différé des ressources jusqu'au besoin.", category: "Frontend" },
  { id: "debounce", term: "Debounce", definition: "Technique retardant l'exécution d'une fonction jusqu'à une pause.", category: "Frontend", related: ["throttle"] },
  { id: "throttle", term: "Throttle", definition: "Technique limitant les exécutions d'une fonction par période.", category: "Frontend", related: ["debounce"] },
  { id: "css-in-js", term: "CSS-in-JS", definition: "Approche où les styles sont écrits dans les fichiers JavaScript.", category: "Frontend" },
  { id: "hydration", term: "Hydration", definition: "Processus d'attacher les event listeners au HTML rendu côté serveur pour le rendre interactif.", category: "Frontend", related: ["ssr"] },
  { id: "tree-shaking", term: "Tree Shaking", definition: "Élimination du code non utilisé lors du bundling pour réduire la taille du bundle.", category: "Frontend", related: ["bundler"] },
  { id: "code-splitting", term: "Code Splitting", definition: "Technique divisant le bundle en morceaux chargés à la demande.", category: "Frontend", related: ["lazy"] },

  // Database
  { id: "sql", term: "SQL", definition: "Structured Query Language. Langage de requête pour bases relationnelles.", category: "Database" },
  { id: "nosql", term: "NoSQL", definition: "Bases de données non relationnelles (document, clé-valeur, graphe).", category: "Database", related: ["sql"] },
  { id: "index-db", term: "Index", definition: "Structure accélérant la recherche dans une base de données.", category: "Database" },
  { id: "transaction", term: "Transaction", definition: "Ensemble d'opérations exécutées comme une unité atomique.", category: "Database", related: ["acid"] },
  { id: "acid", term: "ACID", definition: "Atomicity, Consistency, Isolation, Durability. Propriétés des transactions fiables.", category: "Database", related: ["transaction"] },
  { id: "normalization", term: "Normalization", definition: "Organisation des données pour réduire la redondance.", category: "Database" },
  { id: "join", term: "JOIN", definition: "Opération SQL combinant des lignes de plusieurs tables.", category: "Database" },
  { id: "primarykey", term: "Primary Key", definition: "Colonne identifiant de façon unique chaque ligne.", category: "Database", related: ["foreignkey"] },
  { id: "foreignkey", term: "Foreign Key", definition: "Colonne référençant la clé primaire d'une autre table.", category: "Database", related: ["primarykey"] },
  { id: "migration", term: "Migration", definition: "Script de modification de la structure de la base de données.", category: "Database" },
  { id: "redis", term: "Redis", definition: "Base de données clé-valeur en mémoire, souvent utilisée comme cache.", category: "Database", related: ["cache"] },
  { id: "sharding", term: "Sharding", definition: "Partitionnement horizontal de la base de données sur plusieurs serveurs pour la scalabilité.", category: "Database" },
  { id: "replication", term: "Replication", definition: "Copie des données sur plusieurs serveurs pour la haute disponibilité.", category: "Database" },

  // DevOps
  { id: "ci", term: "CI", definition: "Continuous Integration. Intégration fréquente avec tests automatisés.", category: "DevOps", related: ["cd"] },
  { id: "cd", term: "CD", definition: "Continuous Deployment/Delivery. Déploiement automatisé après CI.", category: "DevOps", related: ["ci"] },
  { id: "docker", term: "Docker", definition: "Plateforme de containerisation permettant d'empaqueter applications.", category: "DevOps", related: ["container", "kubernetes"] },
  { id: "container", term: "Container", definition: "Environnement isolé et léger pour exécuter des applications.", category: "DevOps", related: ["docker"] },
  { id: "kubernetes", term: "Kubernetes", definition: "Orchestration de conteneurs pour déploiement et scaling automatisés.", category: "DevOps", related: ["docker"] },
  { id: "pipeline", term: "Pipeline", definition: "Séquence automatisée d'étapes pour build, test et déploiement.", category: "DevOps", related: ["ci", "cd"] },
  { id: "terraform", term: "Terraform", definition: "Outil d'Infrastructure as Code pour provisionner des ressources cloud.", category: "DevOps", related: ["iac"] },
  { id: "iac", term: "IaC", definition: "Infrastructure as Code. Gestion de l'infrastructure via fichiers de configuration.", category: "DevOps", related: ["terraform"] },
  { id: "monitoring", term: "Monitoring", definition: "Surveillance des performances et de la santé des applications.", category: "DevOps", related: ["logging"] },
  { id: "logging", term: "Logging", definition: "Enregistrement des événements et erreurs d'une application.", category: "DevOps", related: ["monitoring"] },
  { id: "git", term: "Git", definition: "Système de contrôle de version distribué.", category: "DevOps" },
  { id: "env", term: "Environment Variables", definition: "Variables de configuration définies au niveau du système.", category: "DevOps" },
  { id: "blue-green", term: "Blue-Green Deployment", definition: "Stratégie de déploiement avec deux environnements identiques pour un basculement sans downtime.", category: "DevOps" },
  { id: "canary", term: "Canary Deployment", definition: "Déploiement progressif à un sous-ensemble d'utilisateurs avant le rollout complet.", category: "DevOps" },
  { id: "observability", term: "Observability", definition: "Capacité à comprendre l'état interne d'un système à partir de ses sorties (logs, métriques, traces).", category: "DevOps", related: ["monitoring", "logging"] },

  // Security
  { id: "jwt", term: "JWT", definition: "JSON Web Token. Standard pour créer des tokens d'accès signés.", category: "Security", related: ["oauth"] },
  { id: "oauth", term: "OAuth", definition: "Protocole d'autorisation permettant l'accès délégué à des ressources.", category: "Security", related: ["jwt"] },
  { id: "authentication", term: "Authentication", definition: "Vérification de l'identité d'un utilisateur.", category: "Security", related: ["authorization"] },
  { id: "authorization", term: "Authorization", definition: "Détermination des permissions d'un utilisateur authentifié.", category: "Security", related: ["authentication", "rbac"] },
  { id: "encryption", term: "Encryption", definition: "Transformation de données en format illisible sans clé.", category: "Security", related: ["hashing"] },
  { id: "hashing", term: "Hashing", definition: "Transformation irréversible en empreinte de taille fixe.", category: "Security", related: ["encryption"] },
  { id: "ssl", term: "SSL/TLS", definition: "Protocoles cryptographiques sécurisant les communications réseau.", category: "Security", related: ["https"] },
  { id: "xss", term: "XSS", definition: "Cross-Site Scripting. Injection de scripts malveillants.", category: "Security", related: ["csrf"] },
  { id: "csrf", term: "CSRF", definition: "Cross-Site Request Forgery. Actions non voulues forcées sur un utilisateur.", category: "Security", related: ["xss"] },
  { id: "injection", term: "SQL Injection", definition: "Attaque insérant du code SQL malveillant dans les requêtes.", category: "Security" },
  { id: "rbac", term: "RBAC", definition: "Role-Based Access Control. Gestion des permissions basée sur les rôles.", category: "Security", related: ["authorization"] },
  { id: "2fa", term: "2FA", definition: "Two-Factor Authentication. Authentification à deux facteurs.", category: "Security", related: ["authentication"] },
  { id: "token", term: "Token", definition: "Chaîne représentant une autorisation ou identité.", category: "Security", related: ["jwt"] },
  { id: "session", term: "Session", definition: "Période d'interaction d'un utilisateur avec une application.", category: "Security", related: ["cookie"] },
  { id: "zero-trust", term: "Zero Trust", definition: "Modèle de sécurité ne faisant confiance à aucun utilisateur ou appareil par défaut.", category: "Security" },

  // AI/ML (NEW)
  { id: "llm", term: "LLM", definition: "Large Language Model. Modèle de langage entraîné sur d'immenses corpus de texte (GPT, Claude, Llama).", category: "AI/ML" },
  { id: "rag", term: "RAG", definition: "Retrieval-Augmented Generation. Technique combinant recherche documentaire et génération de texte pour des réponses plus précises.", category: "AI/ML", related: ["llm", "vector-db"] },
  { id: "embedding", term: "Embedding", definition: "Représentation vectorielle dense de données (texte, images) capturant le sens sémantique.", category: "AI/ML", related: ["vector-db"] },
  { id: "fine-tuning", term: "Fine-tuning", definition: "Ré-entraînement d'un modèle pré-entraîné sur des données spécifiques pour l'adapter à un domaine.", category: "AI/ML", related: ["llm"] },
  { id: "transformer", term: "Transformer", definition: "Architecture de réseau de neurones basée sur l'attention, fondement des LLMs modernes.", category: "AI/ML", related: ["llm"] },
  { id: "prompt-eng", term: "Prompt Engineering", definition: "Art de formuler des instructions optimales pour obtenir les meilleurs résultats d'un LLM.", category: "AI/ML", related: ["llm"] },
  { id: "hallucination", term: "Hallucination", definition: "Génération d'informations fausses ou inventées par un modèle de langage avec une apparente confiance.", category: "AI/ML", related: ["llm"] },
  { id: "token-ai", term: "Token (AI)", definition: "Unité de texte (mot, sous-mot) traitée par un modèle de langage. Détermine le coût et les limites.", category: "AI/ML", related: ["llm"] },
  { id: "vector-db", term: "Vector Database", definition: "Base de données spécialisée dans le stockage et la recherche de vecteurs d'embeddings (Pinecone, Weaviate).", category: "AI/ML", related: ["embedding", "rag"] },
  { id: "rlhf", term: "RLHF", definition: "Reinforcement Learning from Human Feedback. Technique d'alignement des LLMs avec les préférences humaines.", category: "AI/ML", related: ["llm"] },
  { id: "diffusion", term: "Diffusion Model", definition: "Modèle génératif apprenant à créer des données en inversant un processus de bruit (Stable Diffusion, DALL-E).", category: "AI/ML" },
  { id: "lora", term: "LoRA", definition: "Low-Rank Adaptation. Technique efficace de fine-tuning réduisant le nombre de paramètres à entraîner.", category: "AI/ML", related: ["fine-tuning"] },
  { id: "agent", term: "AI Agent", definition: "Système autonome utilisant un LLM pour planifier et exécuter des tâches complexes avec des outils.", category: "AI/ML", related: ["llm"] },
  { id: "context-window", term: "Context Window", definition: "Nombre maximal de tokens qu'un LLM peut traiter en une seule requête.", category: "AI/ML", related: ["token-ai", "llm"] },

  // Testing (NEW)
  { id: "unit-test", term: "Unit Test", definition: "Test isolé d'une unité de code (fonction, composant) indépendamment du reste.", category: "Testing", related: ["integration-test"] },
  { id: "integration-test", term: "Integration Test", definition: "Test vérifiant que plusieurs modules fonctionnent correctement ensemble.", category: "Testing", related: ["unit-test", "e2e"] },
  { id: "e2e", term: "E2E Test", definition: "End-to-End. Test simulant le parcours complet d'un utilisateur (Cypress, Playwright).", category: "Testing", related: ["integration-test"] },
  { id: "tdd", term: "TDD", definition: "Test-Driven Development. Écrire les tests avant le code, puis implémenter pour les faire passer.", category: "Testing", related: ["bdd"] },
  { id: "bdd", term: "BDD", definition: "Behavior-Driven Development. Tests exprimés en langage naturel (Given-When-Then).", category: "Testing", related: ["tdd"] },
  { id: "mock", term: "Mock", definition: "Objet simulé remplaçant une dépendance réelle pendant les tests.", category: "Testing", related: ["stub"] },
  { id: "stub", term: "Stub", definition: "Implémentation minimale d'une interface pour les tests, retournant des données prédéfinies.", category: "Testing", related: ["mock"] },
  { id: "fixture", term: "Fixture", definition: "Ensemble de données de test prédéfinies utilisées pour initialiser l'état avant les tests.", category: "Testing" },
  { id: "coverage", term: "Code Coverage", definition: "Pourcentage du code source exécuté par les tests. Mesure la complétude des tests.", category: "Testing" },
  { id: "snapshot-test", term: "Snapshot Testing", definition: "Comparaison du rendu d'un composant avec un instantané de référence sauvegardé.", category: "Testing" },
  { id: "assertion", term: "Assertion", definition: "Vérification qu'une condition est vraie dans un test (expect, assert).", category: "Testing" },

  // Mobile (NEW)
  { id: "react-native", term: "React Native", definition: "Framework créant des apps mobiles natives avec React et JavaScript.", category: "Mobile" },
  { id: "flutter", term: "Flutter", definition: "Framework Google pour créer des apps multi-plateformes avec Dart.", category: "Mobile" },
  { id: "responsive", term: "Responsive Design", definition: "Conception web s'adaptant à toutes les tailles d'écran.", category: "Mobile" },
  { id: "viewport", term: "Viewport", definition: "Zone visible d'une page web dans le navigateur.", category: "Mobile" },
  { id: "touch-events", term: "Touch Events", definition: "Événements tactiles (touchstart, touchmove, touchend) pour interactions mobiles.", category: "Mobile" },
  { id: "service-worker", term: "Service Worker", definition: "Script s'exécutant en arrière-plan pour le cache offline et les push notifications.", category: "Mobile", related: ["pwa"] },
  { id: "deep-linking", term: "Deep Linking", definition: "Liens ouvrant directement une section spécifique d'une app mobile.", category: "Mobile" },

  // Performance (NEW)
  { id: "core-web-vitals", term: "Core Web Vitals", definition: "Métriques Google mesurant la performance UX : LCP, FID/INP, CLS.", category: "Performance", related: ["lcp", "cls"] },
  { id: "lcp", term: "LCP", definition: "Largest Contentful Paint. Temps de rendu du plus grand élément visible (< 2.5s).", category: "Performance", related: ["core-web-vitals"] },
  { id: "inp", term: "INP", definition: "Interaction to Next Paint. Latence maximale des interactions utilisateur (< 200ms).", category: "Performance", related: ["core-web-vitals"] },
  { id: "cls", term: "CLS", definition: "Cumulative Layout Shift. Mesure des décalages visuels inattendus (< 0.1).", category: "Performance", related: ["core-web-vitals"] },
  { id: "tti", term: "TTI", definition: "Time to Interactive. Temps avant que la page soit pleinement interactive.", category: "Performance" },
  { id: "lighthouse", term: "Lighthouse", definition: "Outil Google d'audit automatisé pour performance, accessibilité et SEO.", category: "Performance" },
  { id: "memoization", term: "Memoization", definition: "Technique de cache des résultats de fonctions pour éviter les recalculs.", category: "Performance" },
  { id: "cdn-perf", term: "CDN", definition: "Content Delivery Network. Distribution géographique du contenu pour réduire la latence.", category: "Performance", related: ["cdn"] },
  { id: "prefetch", term: "Prefetch/Preload", definition: "Chargement anticipé de ressources susceptibles d'être nécessaires bientôt.", category: "Performance" },
];

const allCategories = ["Tous", "Web", "Backend", "Frontend", "Database", "DevOps", "Security", "AI/ML", "Testing", "Mobile", "Performance"];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("glossary-favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [mode, setMode] = useState<"browse" | "flashcard" | "quiz">("browse");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardRevealed, setFlashcardRevealed] = useState(false);
  const [flashcardKnown, setFlashcardKnown] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("glossary-flashcard-known");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [quizQuestion, setQuizQuestion] = useState<{ term: Term; options: string[]; correct: string } | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(() => {
    const saved = localStorage.getItem("glossary-quiz-score");
    return saved ? JSON.parse(saved) : { correct: 0, total: 0 };
  });
  const [quizBest, setQuizBest] = useState(() => {
    const saved = localStorage.getItem("glossary-quiz-best");
    return saved ? JSON.parse(saved) : { correct: 0, total: 0 };
  });
  const [quizStreak, setQuizStreak] = useState(0);
  const { toast } = useToast();

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter((term) => {
      const matchesSearch = term.term.toLowerCase().includes(search.toLowerCase()) || term.definition.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "Tous" || term.category === selectedCategory;
      const matchesLetter = !selectedLetter || term.term.toUpperCase().startsWith(selectedLetter);
      return matchesSearch && matchesCategory && matchesLetter;
    });
  }, [search, selectedCategory, selectedLetter]);

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem("glossary-favorites", JSON.stringify(newFavorites));
  };

  const exportFavorites = () => {
    const favoriteTerms = glossaryTerms.filter((t) => favorites.includes(t.id));
    const blob = new Blob([JSON.stringify(favoriteTerms, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "glossary-favorites.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exporté !", description: `${favoriteTerms.length} termes favoris exportés` });
  };

  const findTermById = (id: string) => glossaryTerms.find((t) => t.id === id);

  // Flashcard logic
  const flashcardTerms = useMemo(() => {
    const terms = selectedCategory === "Tous" ? glossaryTerms : glossaryTerms.filter(t => t.category === selectedCategory);
    return terms.filter(t => !flashcardKnown.has(t.id));
  }, [selectedCategory, flashcardKnown]);

  const currentFlashcard = flashcardTerms[flashcardIndex % Math.max(flashcardTerms.length, 1)];

  const markFlashcard = useCallback((known: boolean) => {
    if (!currentFlashcard) return;
    if (known) {
      const newKnown = new Set(flashcardKnown);
      newKnown.add(currentFlashcard.id);
      setFlashcardKnown(newKnown);
      localStorage.setItem("glossary-flashcard-known", JSON.stringify([...newKnown]));
    }
    setFlashcardRevealed(false);
    setFlashcardIndex(i => i + 1);
  }, [currentFlashcard, flashcardKnown]);

  const resetFlashcards = () => {
    setFlashcardKnown(new Set());
    setFlashcardIndex(0);
    setFlashcardRevealed(false);
    localStorage.removeItem("glossary-flashcard-known");
  };

  // Quiz logic
  const generateQuizQuestion = useCallback(() => {
    const pool = selectedCategory === "Tous" ? glossaryTerms : glossaryTerms.filter(t => t.category === selectedCategory);
    if (pool.length < 4) return;
    const term = pool[Math.floor(Math.random() * pool.length)];
    const wrongOptions = pool.filter(t => t.id !== term.id).sort(() => Math.random() - 0.5).slice(0, 3).map(t => t.definition);
    const options = [...wrongOptions, term.definition].sort(() => Math.random() - 0.5);
    setQuizQuestion({ term, options, correct: term.definition });
    setQuizAnswer(null);
  }, [selectedCategory]);

  const answerQuiz = (answer: string) => {
    if (quizAnswer) return;
    setQuizAnswer(answer);
    const isCorrect = answer === quizQuestion?.correct;
    const newScore = {
      correct: quizScore.correct + (isCorrect ? 1 : 0),
      total: quizScore.total + 1
    };
    setQuizScore(newScore);
    localStorage.setItem("glossary-quiz-score", JSON.stringify(newScore));
    
    if (isCorrect) {
      setQuizStreak(s => s + 1);
    } else {
      setQuizStreak(0);
    }
    
    // Update best score
    if (newScore.total >= 5 && (newScore.correct / newScore.total) > (quizBest.total > 0 ? quizBest.correct / quizBest.total : 0)) {
      setQuizBest(newScore);
      localStorage.setItem("glossary-quiz-best", JSON.stringify(newScore));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Glossaire Dev
        </h1>
        <p className="text-muted-foreground">
          {glossaryTerms.length}+ termes de développement expliqués
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button variant={mode === "browse" ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => setMode("browse")}>
                <BookOpen className="h-4 w-4 mr-2" /> Parcourir
              </Button>
              <Button variant={mode === "flashcard" ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => { setMode("flashcard"); setFlashcardRevealed(false); }}>
                <Brain className="h-4 w-4 mr-2" /> Flashcards
              </Button>
              <Button variant={mode === "quiz" ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => { setMode("quiz"); generateQuizQuestion(); setQuizScore({ correct: 0, total: 0 }); }}>
                <HelpCircle className="h-4 w-4 mr-2" /> Quiz
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Catégories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {allCategories.map((cat) => (
                <Button key={cat} variant={selectedCategory === cat ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => setSelectedCategory(cat)}>
                  {cat}
                  <Badge variant="secondary" className="ml-auto">
                    {cat === "Tous" ? glossaryTerms.length : glossaryTerms.filter((t) => t.category === cat).length}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {mode === "browse" && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Index A-Z</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {alphabet.map((letter) => {
                    const hasTerms = glossaryTerms.some((t) => t.term.toUpperCase().startsWith(letter));
                    return (
                      <Button key={letter} variant={selectedLetter === letter ? "default" : "ghost"} size="sm" className="w-8 h-8 p-0" disabled={!hasTerms}
                        onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}>
                        {letter}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {favorites.length > 0 && mode === "browse" && (
            <Button onClick={exportFavorites} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />Exporter favoris ({favorites.length})
            </Button>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {mode === "browse" && (
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Tous ({filteredTerms.length})</TabsTrigger>
                <TabsTrigger value="favorites">Favoris ({favorites.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-3 pr-4">
                    {filteredTerms.map((term) => (
                      <Card key={term.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {term.term}
                                {term.link && <a href={term.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" /></a>}
                              </CardTitle>
                              <Badge variant="outline">{term.category}</Badge>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => toggleFavorite(term.id)}>
                              {favorites.includes(term.id) ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-4 w-4" />}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-2">{term.definition}</p>
                          {term.related && term.related.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-muted-foreground">Voir aussi:</span>
                              {term.related.map((relId) => {
                                const relTerm = findTermById(relId);
                                return relTerm ? (
                                  <Badge key={relId} variant="secondary" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground" onClick={() => setSearch(relTerm.term)}>
                                    {relTerm.term}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="favorites" className="mt-4">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-3 pr-4">
                    {favorites.length === 0 ? (
                      <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun favori.</CardContent></Card>
                    ) : favorites.map((id) => {
                      const term = findTermById(id);
                      if (!term) return null;
                      return (
                        <Card key={term.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div><CardTitle className="text-lg">{term.term}</CardTitle><Badge variant="outline">{term.category}</Badge></div>
                              <Button variant="ghost" size="sm" onClick={() => toggleFavorite(term.id)}>
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent><p className="text-muted-foreground">{term.definition}</p></CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}

          {mode === "flashcard" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{flashcardKnown.size} maîtrisés</Badge>
                  <Badge variant="outline">{flashcardTerms.length} restants</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={resetFlashcards}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>

              {flashcardTerms.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Bravo ! 🎉</h3>
                    <p className="text-muted-foreground mb-4">Vous avez maîtrisé tous les termes de cette catégorie.</p>
                    <Button onClick={resetFlashcards}>Recommencer</Button>
                  </CardContent>
                </Card>
              ) : currentFlashcard && (
                <Card className="min-h-[300px] flex flex-col justify-center cursor-pointer" onClick={() => setFlashcardRevealed(!flashcardRevealed)}>
                  <CardContent className="text-center py-12">
                    <Badge variant="outline" className="mb-4">{currentFlashcard.category}</Badge>
                    <h2 className="text-3xl font-bold mb-6">{currentFlashcard.term}</h2>
                    {flashcardRevealed ? (
                      <div>
                        <p className="text-lg text-muted-foreground mb-6">{currentFlashcard.definition}</p>
                        <div className="flex justify-center gap-4">
                          <Button variant="outline" onClick={(e) => { e.stopPropagation(); markFlashcard(false); }}>
                            <XCircle className="h-4 w-4 mr-2" /> À revoir
                          </Button>
                          <Button onClick={(e) => { e.stopPropagation(); markFlashcard(true); }}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Je sais
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Cliquez pour révéler la définition</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {mode === "quiz" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Score : {quizScore.correct}/{quizScore.total}</Badge>
                  {quizScore.total > 0 && (
                    <Badge variant="outline">{Math.round((quizScore.correct / quizScore.total) * 100)}%</Badge>
                  )}
                  {quizStreak >= 3 && (
                    <Badge variant="default">🔥 {quizStreak} de suite</Badge>
                  )}
                  {quizBest.total >= 5 && (
                    <Badge variant="secondary" className="text-xs">Record : {Math.round((quizBest.correct / quizBest.total) * 100)}%</Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => { generateQuizQuestion(); setQuizScore({ correct: 0, total: 0 }); setQuizStreak(0); localStorage.setItem("glossary-quiz-score", JSON.stringify({ correct: 0, total: 0 })); }}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Nouveau quiz
                </Button>
              </div>

              {quizQuestion && (
                <Card>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">{quizQuestion.term.category}</Badge>
                    <CardTitle className="text-2xl">Quelle est la définition de « {quizQuestion.term.term} » ?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quizQuestion.options.map((option, i) => {
                      const isCorrect = option === quizQuestion.correct;
                      const isSelected = quizAnswer === option;
                      let variant: "outline" | "default" | "destructive" = "outline";
                      if (quizAnswer) {
                        if (isCorrect) variant = "default";
                        else if (isSelected) variant = "destructive";
                      }
                      return (
                        <Button
                          key={i}
                          variant={variant}
                          className="w-full text-left justify-start h-auto py-3 whitespace-normal"
                          onClick={() => answerQuiz(option)}
                          disabled={!!quizAnswer}
                        >
                          <span className="font-mono mr-2">{String.fromCharCode(65 + i)}.</span>
                          {option}
                        </Button>
                      );
                    })}
                    {quizAnswer && (
                      <Button className="w-full mt-4" onClick={generateQuizQuestion}>
                        Question suivante →
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
