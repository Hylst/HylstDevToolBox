import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Search, 
  Code, 
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import type { ErrorEntry, Language } from "@/lib/error-types";
import { gitErrors } from "@/lib/git-errors-data";

const languages: Language[] = [
  {
    id: "javascript",
    name: "JavaScript",
    color: "bg-yellow-500",
    errors: [
      {
        id: "js-typeerror",
        name: "TypeError",
        message: "Cannot read properties of undefined (reading 'x')",
        cause: "Tentative d'accéder à une propriété sur une valeur undefined ou null.",
        solution: "Vérifiez que l'objet existe avant d'accéder à ses propriétés. Utilisez l'optional chaining (?.) ou une vérification explicite.",
        codeExample: `// Erreur
const user = undefined;
console.log(user.name); // TypeError!

// Aussi courant avec les tableaux
const items = [];
console.log(items[0].id); // TypeError!`,
        fixExample: `// Solution 1: Optional chaining
console.log(user?.name); // undefined, pas d'erreur

// Solution 2: Vérification explicite
if (user && user.name) {
  console.log(user.name);
}

// Solution 3: Valeur par défaut
console.log(user?.name ?? 'Anonyme');`,
        docs: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Errors/Cant_access_property",
        tags: ["runtime", "null", "undefined"]
      },
      {
        id: "js-referenceerror",
        name: "ReferenceError",
        message: "x is not defined",
        cause: "Utilisation d'une variable qui n'a pas été déclarée dans la portée actuelle.",
        solution: "Déclarez la variable avec let, const ou var avant de l'utiliser. Vérifiez les fautes de frappe et la portée.",
        codeExample: `// Erreur
console.log(myVariable); // ReferenceError!

// Aussi avec les fautes de frappe
const username = 'John';
console.log(userName); // ReferenceError (mauvaise casse)`,
        fixExample: `// Solution: Déclarer la variable
const myVariable = 'Hello';
console.log(myVariable);

// Attention à la portée
function example() {
  const localVar = 'local';
}
// console.log(localVar); // ReferenceError - hors portée`,
        docs: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Errors/Not_defined",
        tags: ["runtime", "scope", "declaration"]
      },
      {
        id: "js-syntaxerror",
        name: "SyntaxError",
        message: "Unexpected token",
        cause: "Le code contient une erreur de syntaxe qui empêche le parsing.",
        solution: "Vérifiez les parenthèses, accolades, virgules et points-virgules. Utilisez un linter comme ESLint.",
        codeExample: `// Erreurs courantes
const obj = { name: 'John', }; // Trailing comma (OK en ES5+)
const arr = [1, 2, 3,]; // OK

// Vraies erreurs
const x = { name: 'John' // Accolade manquante
const y = [1, 2 3]; // Virgule manquante
if (true { } // Parenthèse manquante`,
        fixExample: `// Corrections
const obj = { name: 'John' };
const arr = [1, 2, 3];

// Bien fermer toutes les structures
const x = { name: 'John' };
const y = [1, 2, 3];
if (true) { }

// Utilisez un formateur (Prettier) et un linter (ESLint)`,
        tags: ["parse", "syntax", "lint"]
      },
      {
        id: "js-rangeerror",
        name: "RangeError",
        message: "Maximum call stack size exceeded",
        cause: "Récursion infinie ou trop profonde qui dépasse la limite de la pile d'appels.",
        solution: "Ajoutez une condition de sortie à votre récursion. Envisagez une approche itérative pour les grandes structures.",
        codeExample: `// Récursion infinie
function infinite() {
  infinite(); // RangeError!
}

// Récursion sans condition de sortie valide
function factorial(n) {
  return n * factorial(n - 1); // Pas de cas de base!
}`,
        fixExample: `// Avec condition de sortie
function factorial(n) {
  if (n <= 1) return 1; // Cas de base
  return n * factorial(n - 1);
}

// Ou version itérative
function factorialIterative(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}`,
        docs: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Errors/Too_much_recursion",
        tags: ["runtime", "recursion", "stack"]
      },
      {
        id: "js-json-parse",
        name: "SyntaxError",
        message: "Unexpected token in JSON at position x",
        cause: "Tentative de parser un JSON invalide (trailing commas, single quotes, commentaires).",
        solution: "Validez votre JSON avec un outil. Utilisez des doubles guillemets, pas de trailing commas.",
        codeExample: `// JSON invalide
JSON.parse("{'name': 'John'}"); // Single quotes
JSON.parse('{"name": "John",}'); // Trailing comma
JSON.parse('{"name": "John" /* comment */}'); // Comments`,
        fixExample: `// JSON valide
JSON.parse('{"name": "John"}');

// Avec try/catch pour la sécurité
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('Invalid JSON:', e.message);
    return null;
  }
}`,
        tags: ["json", "parse", "syntax"]
      }
    ]
  },
  {
    id: "react",
    name: "React",
    color: "bg-cyan-500",
    errors: [
      {
        id: "react-hooks-rules",
        name: "Invalid Hook Call",
        message: "Hooks can only be called inside of the body of a function component",
        cause: "Hook appelé en dehors d'un composant React, dans une condition, boucle ou après un return.",
        solution: "Appelez les hooks uniquement au niveau supérieur des composants fonctionnels ou des custom hooks.",
        codeExample: `// ❌ Mauvais - Hook dans une condition
function Component({ show }) {
  if (show) {
    const [value, setValue] = useState(0);
  }
}

// ❌ Mauvais - Hook dans une fonction normale
function regularFunction() {
  const [state, setState] = useState(0);
}`,
        fixExample: `// ✅ Bon - Hook au niveau supérieur
function Component({ show }) {
  const [value, setValue] = useState(0);
  
  if (!show) return null;
  return <div>{value}</div>;
}

// ✅ Bon - Custom hook
function useCustomHook() {
  const [state, setState] = useState(0);
  return [state, setState];
}`,
        docs: "https://react.dev/warnings/invalid-hook-call-warning",
        tags: ["hooks", "rules", "components"]
      },
      {
        id: "react-key-prop",
        name: "Warning: Each child should have a unique key prop",
        message: "Each child in a list should have a unique \"key\" prop",
        cause: "Rendu d'une liste sans fournir de prop key unique à chaque élément.",
        solution: "Ajoutez une prop key unique et stable (pas l'index si la liste peut changer).",
        codeExample: `// ❌ Mauvais - Pas de key
{items.map(item => <Item data={item} />)}

// ❌ Mauvais - Index comme key (si liste mutable)
{items.map((item, index) => <Item key={index} data={item} />)}`,
        fixExample: `// ✅ Bon - ID unique comme key
{items.map(item => <Item key={item.id} data={item} />)}

// ✅ OK - Index si liste statique et non réordonnée
{staticItems.map((item, index) => <Item key={index} data={item} />)}`,
        docs: "https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key",
        tags: ["lists", "keys", "performance"]
      },
      {
        id: "react-hydration",
        name: "Hydration Error",
        message: "Text content does not match server-rendered HTML",
        cause: "Le contenu rendu côté serveur diffère du contenu rendu côté client (SSR/SSG).",
        solution: "Évitez les valeurs dynamiques dans le rendu initial (Date.now(), Math.random()). Utilisez useEffect pour les valeurs client-only.",
        codeExample: `// ❌ Mauvais - Contenu différent server/client
function Component() {
  return <div>{Date.now()}</div>;
}

// ❌ Mauvais - typeof window
function Component() {
  return <div>{typeof window !== 'undefined' ? 'Client' : 'Server'}</div>;
}`,
        fixExample: `// ✅ Bon - useEffect pour contenu client-only
function Component() {
  const [time, setTime] = useState(null);
  
  useEffect(() => {
    setTime(Date.now());
  }, []);
  
  return <div>{time ?? 'Loading...'}</div>;
}

// ✅ Bon - suppressHydrationWarning pour cas spéciaux
<time suppressHydrationWarning>{new Date().toISOString()}</time>`,
        docs: "https://react.dev/errors/422",
        tags: ["ssr", "hydration", "nextjs"]
      },
      {
        id: "react-state-update",
        name: "Warning: Cannot update state on unmounted component",
        message: "Can't perform a React state update on an unmounted component",
        cause: "Mise à jour de state après que le composant a été démonté (souvent dans un async callback).",
        solution: "Annulez les requêtes async dans le cleanup de useEffect ou utilisez un flag isMounted.",
        codeExample: `// ❌ Problème - state update après unmount
useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(data => setData(data)); // Peut être appelé après unmount!
}, []);`,
        fixExample: `// ✅ Solution avec cleanup
useEffect(() => {
  let isMounted = true;
  
  fetch('/api/data')
    .then(res => res.json())
    .then(data => {
      if (isMounted) setData(data);
    });
  
  return () => {
    isMounted = false;
  };
}, []);

// ✅ Ou avec AbortController
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') throw err;
    });
  
  return () => controller.abort();
}, []);`,
        tags: ["hooks", "async", "cleanup"]
      },
      {
        id: "react-too-many-rerenders",
        name: "Too many re-renders",
        message: "Too many re-renders. React limits the number of renders to prevent an infinite loop",
        cause: "setState appelé directement dans le corps du composant, créant une boucle infinie de renders.",
        solution: "Appelez setState dans des event handlers ou useEffect, pas directement dans le render.",
        codeExample: `// ❌ Mauvais - setState dans le render
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Infinite loop!
  return <div>{count}</div>;
}

// ❌ Mauvais - Appel de fonction qui fait setState
function Component() {
  const [count, setCount] = useState(0);
  return <button onClick={setCount(count + 1)}>Click</button>; // Appelé immédiatement!
}`,
        fixExample: `// ✅ Bon - setState dans event handler
function Component() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Click: {count}
    </button>
  );
}

// ✅ Bon - setState dans useEffect
function Component({ value }) {
  const [derived, setDerived] = useState(0);
  
  useEffect(() => {
    setDerived(value * 2);
  }, [value]);
  
  return <div>{derived}</div>;
}`,
        tags: ["hooks", "render", "infinite-loop"]
      }
    ]
  },
  {
    id: "typescript",
    name: "TypeScript",
    color: "bg-blue-500",
    errors: [
      {
        id: "ts-2322",
        name: "TS2322",
        message: "Type 'X' is not assignable to type 'Y'",
        cause: "Tentative d'assigner une valeur d'un type incompatible à une variable ou paramètre.",
        solution: "Vérifiez les types attendus. Utilisez des type guards, des assertions de type, ou corrigez le type source.",
        codeExample: `// Erreur
const num: number = "hello"; // TS2322

interface User { name: string; age: number; }
const user: User = { name: "John" }; // Missing 'age'

function greet(name: string) {}
greet(123); // TS2322`,
        fixExample: `// Solutions
const num: number = 42;

const user: User = { name: "John", age: 30 };
// Ou avec Partial si optionnel
const partialUser: Partial<User> = { name: "John" };

greet("John");
// Ou conversion
greet(String(123));`,
        tags: ["types", "assignment", "compile"]
      },
      {
        id: "ts-2339",
        name: "TS2339",
        message: "Property 'x' does not exist on type 'Y'",
        cause: "Accès à une propriété qui n'existe pas dans le type défini.",
        solution: "Ajoutez la propriété au type, utilisez un type guard, ou étendez le type.",
        codeExample: `interface User {
  name: string;
}

const user: User = { name: "John" };
console.log(user.age); // TS2339: 'age' doesn't exist

// Avec union types
function process(value: string | number) {
  console.log(value.toFixed()); // TS2339 - string n'a pas toFixed
}`,
        fixExample: `// Solution 1: Étendre le type
interface User {
  name: string;
  age?: number;
}

// Solution 2: Type guard
function process(value: string | number) {
  if (typeof value === 'number') {
    console.log(value.toFixed());
  }
}

// Solution 3: Index signature
interface FlexibleUser {
  name: string;
  [key: string]: unknown;
}`,
        tags: ["types", "properties", "compile"]
      },
      {
        id: "ts-2345",
        name: "TS2345",
        message: "Argument of type 'X' is not assignable to parameter of type 'Y'",
        cause: "L'argument passé à une fonction a un type différent du paramètre attendu.",
        solution: "Passez le bon type d'argument, ou ajustez la signature de la fonction.",
        codeExample: `function processUser(user: { name: string; age: number }) {
  console.log(user.name);
}

// Erreur - objet incomplet
processUser({ name: "John" }); // TS2345

// Erreur - type différent
const data = JSON.parse('{"name":"John"}');
processUser(data); // 'any' mais structure inconnue`,
        fixExample: `// Solution 1: Objet complet
processUser({ name: "John", age: 30 });

// Solution 2: Type assertion (si sûr)
const data = JSON.parse('{"name":"John","age":30}') as { name: string; age: number };
processUser(data);

// Solution 3: Validation runtime
function isValidUser(obj: unknown): obj is { name: string; age: number } {
  return typeof obj === 'object' && obj !== null 
    && 'name' in obj && 'age' in obj;
}`,
        tags: ["types", "functions", "arguments"]
      },
      {
        id: "ts-7053",
        name: "TS7053",
        message: "Element implicitly has an 'any' type because expression can't be used to index type",
        cause: "Tentative d'accéder à un objet avec une clé dynamique sans index signature.",
        solution: "Ajoutez une index signature au type ou utilisez un type guard.",
        codeExample: `const colors = {
  red: '#ff0000',
  blue: '#0000ff'
};

const key = 'red';
const color = colors[key]; // TS7053 si key est string`,
        fixExample: `// Solution 1: Type assertion sur la clé
const key = 'red' as keyof typeof colors;
const color = colors[key];

// Solution 2: Index signature
const colors: Record<string, string> = {
  red: '#ff0000',
  blue: '#0000ff'
};

// Solution 3: Type guard
function isColorKey(key: string): key is keyof typeof colors {
  return key in colors;
}`,
        tags: ["types", "indexing", "dynamic"]
      }
    ]
  },
  {
    id: "node",
    name: "Node.js",
    color: "bg-green-600",
    errors: [
      {
        id: "node-enoent",
        name: "ENOENT",
        message: "Error: ENOENT: no such file or directory",
        cause: "Tentative d'accéder à un fichier ou dossier qui n'existe pas.",
        solution: "Vérifiez le chemin (relatif vs absolu). Utilisez path.join() et __dirname. Vérifiez l'existence avant l'accès.",
        codeExample: `// Erreur courante - chemin relatif incorrect
fs.readFileSync('./config.json'); // Relatif au CWD, pas au fichier!

// Erreur - fichier manquant
fs.readFileSync('/path/to/nonexistent.txt');`,
        fixExample: `import path from 'path';
import fs from 'fs';

// Chemin relatif au fichier courant
const configPath = path.join(__dirname, 'config.json');
fs.readFileSync(configPath);

// Vérifier l'existence d'abord
if (fs.existsSync(configPath)) {
  const data = fs.readFileSync(configPath);
}

// Ou avec try/catch
try {
  const data = fs.readFileSync(configPath);
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('Fichier non trouvé');
  }
}`,
        tags: ["filesystem", "path", "errors"]
      },
      {
        id: "node-eaddrinuse",
        name: "EADDRINUSE",
        message: "Error: listen EADDRINUSE: address already in use :::3000",
        cause: "Le port est déjà utilisé par un autre processus.",
        solution: "Fermez le processus utilisant le port, ou utilisez un port différent.",
        codeExample: `// Erreur - port déjà utilisé
app.listen(3000, () => {
  console.log('Server running');
});
// EADDRINUSE si un autre serveur est déjà sur 3000`,
        fixExample: `// Solution 1: Trouver et tuer le processus
// Terminal: lsof -i :3000 | grep LISTEN
// Terminal: kill -9 <PID>

// Solution 2: Port dynamique
const PORT = process.env.PORT || 3000;
app.listen(PORT).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(\`Port \${PORT} busy, trying \${PORT + 1}\`);
    app.listen(PORT + 1);
  }
});

// Solution 3: Port 0 pour auto-assignment
const server = app.listen(0, () => {
  console.log(\`Server on port \${server.address().port}\`);
});`,
        tags: ["network", "server", "ports"]
      },
      {
        id: "node-cannot-find-module",
        name: "Cannot find module",
        message: "Error: Cannot find module 'xyz'",
        cause: "Le module n'est pas installé, le chemin est incorrect, ou package.json est mal configuré.",
        solution: "Installez le module avec npm/yarn, vérifiez le chemin et les exports du package.",
        codeExample: `// Module non installé
import express from 'express'; // Cannot find module

// Chemin incorrect
import utils from './utilss'; // Typo

// ESM vs CommonJS
require('./file.mjs'); // Cannot find module`,
        fixExample: `// Installer le module
// npm install express

// Vérifier le chemin
import utils from './utils';

// Configuration ESM dans package.json
{
  "type": "module",
  "exports": {
    ".": "./index.js"
  }
}

// Ou utiliser les bonnes extensions
import data from './data.json' assert { type: 'json' };`,
        tags: ["modules", "imports", "npm"]
      }
    ]
  },
  {
    id: "css",
    name: "CSS",
    color: "bg-purple-500",
    errors: [
      {
        id: "css-z-index",
        name: "z-index not working",
        message: "z-index doesn't seem to have any effect",
        cause: "z-index ne fonctionne que sur les éléments positionnés (relative, absolute, fixed, sticky).",
        solution: "Ajoutez position: relative (ou autre) à l'élément. Vérifiez le stacking context parent.",
        codeExample: `.element {
  z-index: 9999; /* Ne fonctionne pas! */
}

/* Problème de stacking context */
.parent {
  position: relative;
  z-index: 1;
}
.child {
  z-index: 9999; /* Limité par le parent */
}`,
        fixExample: `.element {
  position: relative; /* Nécessaire pour z-index */
  z-index: 10;
}

/* Ou utiliser isolation */
.container {
  isolation: isolate; /* Nouveau stacking context */
}

/* Debug: aplatir la hiérarchie si possible */
.element {
  position: fixed; /* Nouveau stacking context au niveau body */
  z-index: 10;
}`,
        tags: ["layout", "stacking", "position"]
      },
      {
        id: "css-flexbox-overflow",
        name: "Flex items overflow container",
        message: "Flex children are larger than the container",
        cause: "Par défaut, flex items ne shrink pas en dessous de leur contenu minimum.",
        solution: "Utilisez min-width: 0 ou overflow: hidden sur les flex items.",
        codeExample: `.container {
  display: flex;
  width: 300px;
}
.item {
  flex: 1;
  /* Contenu long qui dépasse */
}`,
        fixExample: `.item {
  flex: 1;
  min-width: 0; /* Permet le shrink */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Ou pour le texte */
.item {
  flex: 1;
  overflow-wrap: break-word;
  word-break: break-word;
}`,
        tags: ["flexbox", "overflow", "layout"]
      },
      {
        id: "css-margin-collapse",
        name: "Margin Collapse",
        message: "Margins are not adding up as expected",
        cause: "Les marges verticales adjacentes fusionnent (margin collapsing) - comportement normal CSS.",
        solution: "Utilisez padding, border, ou flexbox/grid (qui désactivent le collapsing).",
        codeExample: `.box1 {
  margin-bottom: 20px;
}
.box2 {
  margin-top: 30px;
}
/* Espace entre = 30px, pas 50px! */`,
        fixExample: `/* Solution 1: Padding sur le parent */
.container {
  padding-top: 1px; /* Empêche le collapsing */
}

/* Solution 2: Display flex/grid */
.container {
  display: flex;
  flex-direction: column;
  gap: 30px; /* Pas de collapsing */
}

/* Solution 3: Border invisible */
.container {
  border-top: 1px solid transparent;
}`,
        tags: ["margin", "layout", "spacing"]
      }
    ]
  },
  {
    id: "git",
    name: "Git",
    color: "bg-orange-500",
    errors: gitErrors,
  }
];

export default function ErrorReference() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copié !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filterErrors = (errors: ErrorEntry[]) => {
    if (!searchQuery) return errors;
    const query = searchQuery.toLowerCase();
    return errors.filter(error => 
      error.name.toLowerCase().includes(query) ||
      error.message.toLowerCase().includes(query) ||
      error.tags.some(tag => tag.toLowerCase().includes(query)) ||
      error.cause.toLowerCase().includes(query)
    );
  };

  const allErrors = languages.flatMap(lang => 
    lang.errors.map(err => ({ ...err, language: lang.name, color: lang.color }))
  );
  const filteredAllErrors = filterErrors(allErrors);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          Référence des Erreurs
        </h1>
        <p className="text-muted-foreground">
          Catalogue d'erreurs courantes avec explications et solutions
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une erreur (nom, message, tag...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="mb-6 flex flex-wrap h-auto gap-2">
          <TabsTrigger value="all" className="gap-2">
            <Code className="h-4 w-4" />
            Toutes ({filteredAllErrors.length})
          </TabsTrigger>
          {languages.map(lang => (
            <TabsTrigger key={lang.id} value={lang.id} className="gap-2">
              <div className={`w-3 h-3 rounded-full ${lang.color}`} />
              {lang.name} ({filterErrors(lang.errors).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="space-y-4 pr-4">
              {filteredAllErrors.map(error => (
                <ErrorCard 
                  key={error.id} 
                  error={error} 
                  languageName={(error as any).language}
                  languageColor={(error as any).color}
                  onCopy={copyCode}
                  copiedId={copiedId}
                />
              ))}
              {filteredAllErrors.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Aucune erreur trouvée pour "{searchQuery}"
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {languages.map(lang => (
          <TabsContent key={lang.id} value={lang.id}>
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-4 pr-4">
                {filterErrors(lang.errors).map(error => (
                  <ErrorCard 
                    key={error.id} 
                    error={error}
                    languageName={lang.name}
                    languageColor={lang.color}
                    onCopy={copyCode}
                    copiedId={copiedId}
                  />
                ))}
                {filterErrors(lang.errors).length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Aucune erreur trouvée pour "{searchQuery}"
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface ErrorCardProps {
  error: ErrorEntry;
  languageName: string;
  languageColor: string;
  onCopy: (code: string, id: string) => void;
  copiedId: string | null;
}

function ErrorCard({ error, languageName, languageColor, onCopy, copiedId }: ErrorCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`${languageColor} text-white`}>
                {languageName}
              </Badge>
              <Badge variant="destructive">{error.name}</Badge>
              {error.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="text-base font-mono text-destructive">
              {error.message}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="border-t space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-yellow-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Cause
            </h4>
            <p className="text-muted-foreground">{error.cause}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-green-500 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Solution
            </h4>
            <p className="text-muted-foreground">{error.solution}</p>
          </div>

          {error.codeExample && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-destructive">❌ Code problématique</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(error.codeExample!, `${error.id}-bad`);
                  }}
                >
                  {copiedId === `${error.id}-bad` ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{error.codeExample}</code>
              </pre>
            </div>
          )}

          {error.fixExample && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-500">✅ Solution</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(error.fixExample!, `${error.id}-fix`);
                  }}
                >
                  {copiedId === `${error.id}-fix` ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{error.fixExample}</code>
              </pre>
            </div>
          )}

          {error.docs && (
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild>
                <a href={error.docs} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Documentation officielle
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
