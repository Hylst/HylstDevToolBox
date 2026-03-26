import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import sql from "highlight.js/lib/languages/sql";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import "highlight.js/styles/github-dark.css";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("dockerfile", dockerfile);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);

interface CheatItem {
  title: string;
  code: string;
  description: string;
}

const htmlCheatsheet: CheatItem[] = [
  { title: "Structure de base", code: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Page</title>\n</head>\n<body>\n  <h1>Titre</h1>\n</body>\n</html>", description: "Structure HTML minimale" },
  { title: "Titres", code: "<h1>Titre 1</h1>\n<h2>Titre 2</h2>\n<h3>Titre 3</h3>", description: "Hiérarchie de titres" },
  { title: "Paragraphe & Texte", code: "<p>Paragraphe</p>\n<strong>Gras</strong>\n<em>Italique</em>", description: "Balises de texte" },
  { title: "Lien", code: '<a href="url">Texte du lien</a>', description: "Lien hypertexte" },
  { title: "Image", code: '<img src="image.jpg" alt="Description">', description: "Insertion d'image" },
  { title: "Liste non ordonnée", code: "<ul>\n  <li>Élément 1</li>\n  <li>Élément 2</li>\n</ul>", description: "Liste à puces" },
  { title: "Liste ordonnée", code: "<ol>\n  <li>Élément 1</li>\n  <li>Élément 2</li>\n</ol>", description: "Liste numérotée" },
  { title: "Div & Span", code: '<div class="container">Bloc</div>\n<span class="text">Inline</span>', description: "Conteneurs génériques" },
  { title: "Formulaire", code: '<form action="/submit">\n  <input type="text" name="nom">\n  <button>Envoyer</button>\n</form>', description: "Formulaire de base" },
  { title: "Table", code: "<table>\n  <tr>\n    <th>En-tête</th>\n  </tr>\n  <tr>\n    <td>Donnée</td>\n  </tr>\n</table>", description: "Tableau HTML" },
];

const cssCheatsheet: CheatItem[] = [
  { title: "Sélecteur de classe", code: ".ma-classe {\n  color: blue;\n}", description: "Cible les éléments avec class=\"ma-classe\"" },
  { title: "Sélecteur d'ID", code: "#mon-id {\n  font-size: 20px;\n}", description: "Cible l'élément avec id=\"mon-id\"" },
  { title: "Flexbox", code: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}", description: "Disposition flexible" },
  { title: "Grid", code: ".grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 20px;\n}", description: "Grille CSS" },
  { title: "Transition", code: ".btn {\n  transition: all 0.3s ease;\n}\n.btn:hover {\n  transform: scale(1.1);\n}", description: "Animation au survol" },
  { title: "Media Query", code: "@media (max-width: 768px) {\n  .mobile {\n    font-size: 14px;\n  }\n}", description: "Responsive design" },
];

const jsCheatsheet: CheatItem[] = [
  { title: "Variables", code: "let x = 10;\nconst y = 20;\nvar z = 30;", description: "Déclaration de variables" },
  { title: "Arrow Function", code: "const double = (x) => x * 2;", description: "Fonction fléchée" },
  { title: "Array Methods", code: "const arr = [1, 2, 3];\narr.map(x => x * 2);\narr.filter(x => x > 1);\narr.reduce((a,b) => a+b);", description: "Méthodes de tableau" },
  { title: "Destructuring", code: "const {name, age} = user;\nconst [first, second] = array;", description: "Déstructuration" },
  { title: "Template Literals", code: "const name = 'John';\nconst msg = `Hello ${name}!`;", description: "Chaînes avec variables" },
  { title: "Async/Await", code: "async function getData() {\n  const res = await fetch(url);\n  const data = await res.json();\n  return data;\n}", description: "Syntaxe async/await" },
  { title: "Promise", code: "fetch(url)\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));", description: "Promesse asynchrone" },
  { title: "Spread Operator", code: "const newArr = [...oldArr, 4];\nconst newObj = {...oldObj, key: 'value'};", description: "Opérateur de décomposition" },
];

const gitCheatsheet: CheatItem[] = [
  { title: "Init & Clone", code: "git init\ngit clone <url>", description: "Initialiser ou cloner" },
  { title: "Add & Commit", code: "git add .\ngit commit -m \"Message\"", description: "Ajouter et commiter" },
  { title: "Branch", code: "git branch <nom>\ngit checkout -b <nom>", description: "Gérer les branches" },
  { title: "Merge & Rebase", code: "git merge <branche>\ngit rebase main", description: "Fusionner" },
  { title: "Log", code: "git log --oneline --graph", description: "Historique" },
  { title: "Stash", code: "git stash\ngit stash pop", description: "Remiser les changements" },
];

const pythonCheatsheet: CheatItem[] = [
  { title: "Variables", code: "x = 10\nname = 'John'\nis_valid = True", description: "Déclaration" },
  { title: "Listes", code: "fruits = ['pomme', 'banane']\nfruits.append('orange')", description: "Manipulation de listes" },
  { title: "Dictionnaires", code: "user = {'name': 'John', 'age': 30}\nuser['email'] = 'john@mail.com'", description: "Clé-valeur" },
  { title: "List Comprehension", code: "squares = [x**2 for x in range(10)]\neven = [x for x in nums if x % 2 == 0]", description: "Création concise" },
  { title: "Classe", code: "class User:\n    def __init__(self, name):\n        self.name = name\n    \n    def greet(self):\n        return f'Hi {self.name}'", description: "POO" },
  { title: "Try/Except", code: "try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print('Erreur!')\nfinally:\n    print('Terminé')", description: "Gestion d'erreurs" },
];

const bashCheatsheet: CheatItem[] = [
  { title: "Variables", code: "NAME='John'\necho $NAME\necho \"Hello $NAME\"", description: "Déclaration et usage" },
  { title: "Conditions", code: "if [ $x -gt 10 ]; then\n    echo 'Plus grand'\nfi", description: "Structure conditionnelle" },
  { title: "Boucle for", code: "for i in {1..5}; do\n    echo $i\ndone", description: "Itération" },
  { title: "Pipes", code: "cat file.txt | grep 'error' | wc -l", description: "Chaînage de commandes" },
  { title: "Recherche", code: "grep 'pattern' file.txt\nfind . -name '*.js'", description: "Recherche de texte" },
];

const dockerCheatsheet: CheatItem[] = [
  { title: "Run", code: "docker run -d -p 8080:80 --name my-app nginx", description: "Lancer un conteneur" },
  { title: "Build", code: "docker build -t my-image .", description: "Construire une image" },
  { title: "Compose", code: "docker-compose up -d\ndocker-compose down", description: "Multi-conteneurs" },
  { title: "Dockerfile", code: "FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"npm\", \"start\"]", description: "Fichier de build" },
  { title: "Volumes", code: "docker run -v my-vol:/data nginx\ndocker volume create my-vol", description: "Persistance" },
];

const tailwindCheatsheet: CheatItem[] = [
  { title: "Flexbox", code: "flex items-center justify-between\nflex-col gap-4", description: "Disposition flexible" },
  { title: "Grid", code: "grid grid-cols-3 gap-4\ngrid-cols-1 md:grid-cols-2", description: "Grille responsive" },
  { title: "Responsive", code: "w-full md:w-1/2 lg:w-1/3\nhidden md:block", description: "Breakpoints" },
  { title: "Hover/Focus", code: "hover:bg-accent hover:scale-105\nfocus:ring-2 transition-all", description: "États interactifs" },
  { title: "Animation", code: "animate-spin animate-pulse\ntransition-all duration-300", description: "Animations" },
];

const reactCheatsheet: CheatItem[] = [
  { title: "useState", code: "const [count, setCount] = useState(0);\nsetCount(prev => prev + 1);", description: "État local" },
  { title: "useEffect", code: "useEffect(() => {\n  fetchData();\n  return () => cleanup();\n}, [dependency]);", description: "Effets de bord" },
  { title: "useMemo", code: "const expensive = useMemo(() => {\n  return computeExpensive(data);\n}, [data]);", description: "Mémoïsation" },
  { title: "Custom Hook", code: "function useLocalStorage<T>(key: string, initial: T) {\n  const [value, setValue] = useState<T>(() => {\n    const stored = localStorage.getItem(key);\n    return stored ? JSON.parse(stored) : initial;\n  });\n  return [value, setValue] as const;\n}", description: "Hook personnalisé" },
  { title: "Conditional Render", code: "{isLoading && <Spinner />}\n{error ? <Error /> : <Content />}\n{items.map(item => <Item key={item.id} />)}", description: "Rendu conditionnel" },
];

const typescriptCheatsheet: CheatItem[] = [
  { title: "Types de base", code: "let name: string = 'John';\nlet age: number = 30;\nlet items: string[] = [];", description: "Typage primitif" },
  { title: "Interface", code: "interface User {\n  id: number;\n  name: string;\n  email?: string;\n  readonly createdAt: Date;\n}", description: "Définition d'objet" },
  { title: "Generics", code: "function identity<T>(arg: T): T {\n  return arg;\n}\ninterface Box<T> { value: T; }", description: "Types génériques" },
  { title: "Utility Types", code: "Partial<User>\nRequired<User>\nPick<User, 'id' | 'name'>\nOmit<User, 'password'>\nRecord<string, number>", description: "Types utilitaires" },
  { title: "Type Guards", code: "function isString(x: unknown): x is string {\n  return typeof x === 'string';\n}", description: "Vérification de type" },
  { title: "Mapped Types", code: "type Readonly<T> = {\n  readonly [K in keyof T]: T[K];\n};", description: "Types mappés" },
];

const sqlCheatsheet: CheatItem[] = [
  { title: "SELECT", code: "SELECT id, name\nFROM users\nWHERE active = true\nORDER BY created_at DESC\nLIMIT 10;", description: "Requête de sélection" },
  { title: "JOIN", code: "SELECT u.name, o.total\nFROM users u\nINNER JOIN orders o ON o.user_id = u.id;", description: "Jointures" },
  { title: "GROUP BY", code: "SELECT category, COUNT(*)\nFROM products\nGROUP BY category\nHAVING COUNT(*) > 5;", description: "Agrégation" },
  { title: "Window Functions", code: "SELECT name, salary,\n  ROW_NUMBER() OVER (ORDER BY salary DESC) as rank\nFROM employees;", description: "Fenêtrage" },
  { title: "CTE", code: "WITH active AS (\n  SELECT * FROM users WHERE active = true\n)\nSELECT * FROM active;", description: "Common Table Expression" },
];

// ===== NEW TABS =====

const nextjsCheatsheet: CheatItem[] = [
  { title: "App Router - Page", code: "// app/page.tsx\nexport default function Home() {\n  return <h1>Home</h1>;\n}", description: "Page de base App Router" },
  { title: "Layout", code: "// app/layout.tsx\nexport default function RootLayout({\n  children\n}: { children: React.ReactNode }) {\n  return (\n    <html><body>{children}</body></html>\n  );\n}", description: "Layout racine" },
  { title: "Server Component", code: "// Default: Server Component\nasync function UserList() {\n  const users = await db.user.findMany();\n  return (\n    <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>\n  );\n}", description: "Composant serveur (défaut)" },
  { title: "Client Component", code: "'use client';\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c+1)}>{count}</button>;\n}", description: "Composant client" },
  { title: "Server Action", code: "'use server';\n\nexport async function createUser(formData: FormData) {\n  const name = formData.get('name');\n  await db.user.create({ data: { name } });\n  revalidatePath('/users');\n}", description: "Action serveur" },
  { title: "Route Handler", code: "// app/api/users/route.ts\nimport { NextResponse } from 'next/server';\n\nexport async function GET() {\n  const users = await db.user.findMany();\n  return NextResponse.json(users);\n}\n\nexport async function POST(req: Request) {\n  const body = await req.json();\n  const user = await db.user.create({ data: body });\n  return NextResponse.json(user, { status: 201 });\n}", description: "API Route" },
  { title: "Dynamic Route", code: "// app/users/[id]/page.tsx\nexport default async function UserPage({\n  params\n}: { params: { id: string } }) {\n  const user = await getUser(params.id);\n  return <div>{user.name}</div>;\n}", description: "Route dynamique" },
  { title: "Middleware", code: "// middleware.ts\nimport { NextResponse } from 'next/server';\nimport type { NextRequest } from 'next/server';\n\nexport function middleware(request: NextRequest) {\n  if (!request.cookies.get('token')) {\n    return NextResponse.redirect(new URL('/login', request.url));\n  }\n}", description: "Middleware auth" },
  { title: "Loading & Error", code: "// app/loading.tsx\nexport default function Loading() {\n  return <div>Loading...</div>;\n}\n\n// app/error.tsx\n'use client';\nexport default function Error({ error, reset }) {\n  return <button onClick={reset}>Retry</button>;\n}", description: "États de chargement/erreur" },
  { title: "Metadata", code: "import type { Metadata } from 'next';\n\nexport const metadata: Metadata = {\n  title: 'My App',\n  description: 'Description SEO',\n  openGraph: { title: 'My App', images: ['/og.png'] },\n};", description: "SEO & Metadata" },
  { title: "Image Optimization", code: "import Image from 'next/image';\n\n<Image\n  src=\"/hero.jpg\"\n  alt=\"Hero\"\n  width={800}\n  height={400}\n  priority\n  placeholder=\"blur\"\n/>", description: "Optimisation d'images" },
  { title: "Caching", code: "// Revalidate every 60s\nexport const revalidate = 60;\n\n// Force dynamic\nexport const dynamic = 'force-dynamic';\n\n// Fetch with cache\nfetch(url, { next: { revalidate: 3600 } });", description: "Stratégies de cache" },
];

const prismaCheatsheet: CheatItem[] = [
  { title: "Schema Model", code: "model User {\n  id        Int      @id @default(autoincrement())\n  email     String   @unique\n  name      String?\n  posts     Post[]\n  createdAt DateTime @default(now())\n}", description: "Définition de modèle" },
  { title: "Relations", code: "model Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  author   User   @relation(fields: [authorId], references: [id])\n  authorId Int\n}\n\nmodel User {\n  id    Int    @id @default(autoincrement())\n  posts Post[]\n}", description: "Relations entre modèles" },
  { title: "CRUD - Create", code: "const user = await prisma.user.create({\n  data: {\n    email: 'john@mail.com',\n    name: 'John',\n    posts: {\n      create: { title: 'First post' }\n    }\n  },\n  include: { posts: true }\n});", description: "Création avec relation" },
  { title: "CRUD - Read", code: "// Find unique\nconst user = await prisma.user.findUnique({\n  where: { email: 'john@mail.com' },\n  include: { posts: true }\n});\n\n// Find many with filters\nconst users = await prisma.user.findMany({\n  where: { name: { contains: 'John' } },\n  orderBy: { createdAt: 'desc' },\n  take: 10\n});", description: "Lecture de données" },
  { title: "CRUD - Update", code: "const user = await prisma.user.update({\n  where: { id: 1 },\n  data: { name: 'Jane' }\n});\n\n// Upsert\nawait prisma.user.upsert({\n  where: { email: 'john@mail.com' },\n  update: { name: 'John Updated' },\n  create: { email: 'john@mail.com', name: 'John' }\n});", description: "Mise à jour et upsert" },
  { title: "CRUD - Delete", code: "await prisma.user.delete({\n  where: { id: 1 }\n});\n\nawait prisma.user.deleteMany({\n  where: { active: false }\n});", description: "Suppression" },
  { title: "Transactions", code: "const [user, post] = await prisma.$transaction([\n  prisma.user.create({ data: { email: 'a@b.com' } }),\n  prisma.post.create({ data: { title: 'Hi', authorId: 1 } })\n]);\n\n// Interactive transaction\nawait prisma.$transaction(async (tx) => {\n  const user = await tx.user.findUnique({ where: { id: 1 } });\n  await tx.user.update({ where: { id: 1 }, data: { balance: user.balance - 100 } });\n});", description: "Transactions atomiques" },
  { title: "Migrations", code: "# Créer une migration\nnpx prisma migrate dev --name init\n\n# Appliquer en production\nnpx prisma migrate deploy\n\n# Générer le client\nnpx prisma generate\n\n# Ouvrir Prisma Studio\nnpx prisma studio", description: "Commandes CLI" },
  { title: "Enum & Types", code: "enum Role {\n  USER\n  ADMIN\n  MODERATOR\n}\n\nmodel User {\n  id   Int  @id @default(autoincrement())\n  role Role @default(USER)\n}", description: "Énumérations" },
  { title: "Filters avancés", code: "const users = await prisma.user.findMany({\n  where: {\n    OR: [\n      { email: { endsWith: '@gmail.com' } },\n      { name: { startsWith: 'A' } }\n    ],\n    posts: { some: { published: true } }\n  }\n});", description: "Filtres complexes" },
];

const supabaseCheatsheet: CheatItem[] = [
  { title: "Client Setup", code: "import { createClient } from '@supabase/supabase-js';\n\nconst supabase = createClient(\n  process.env.SUPABASE_URL!,\n  process.env.SUPABASE_ANON_KEY!\n);", description: "Initialisation du client" },
  { title: "Select", code: "const { data, error } = await supabase\n  .from('users')\n  .select('id, name, posts(title, body)')\n  .eq('active', true)\n  .order('created_at', { ascending: false })\n  .limit(10);", description: "Lecture avec relations" },
  { title: "Insert", code: "const { data, error } = await supabase\n  .from('users')\n  .insert({ name: 'John', email: 'john@mail.com' })\n  .select();", description: "Insertion" },
  { title: "Update", code: "const { data, error } = await supabase\n  .from('users')\n  .update({ name: 'Jane' })\n  .eq('id', 1)\n  .select();", description: "Mise à jour" },
  { title: "Delete", code: "const { error } = await supabase\n  .from('users')\n  .delete()\n  .eq('id', 1);", description: "Suppression" },
  { title: "Auth - Sign Up", code: "const { data, error } = await supabase.auth.signUp({\n  email: 'user@mail.com',\n  password: 'password123'\n});\n\n// Sign in\nconst { data } = await supabase.auth.signInWithPassword({\n  email: 'user@mail.com',\n  password: 'password123'\n});", description: "Inscription et connexion" },
  { title: "Auth - OAuth", code: "const { data, error } = await supabase.auth.signInWithOAuth({\n  provider: 'google',\n  options: {\n    redirectTo: 'http://localhost:3000/callback'\n  }\n});", description: "Connexion OAuth" },
  { title: "Realtime", code: "const channel = supabase\n  .channel('changes')\n  .on('postgres_changes', {\n    event: 'INSERT',\n    schema: 'public',\n    table: 'messages'\n  }, (payload) => {\n    console.log('New message:', payload.new);\n  })\n  .subscribe();", description: "Écoute en temps réel" },
  { title: "Storage", code: "// Upload\nconst { data, error } = await supabase.storage\n  .from('avatars')\n  .upload('user1/avatar.png', file);\n\n// Get public URL\nconst { data: { publicUrl } } = supabase.storage\n  .from('avatars')\n  .getPublicUrl('user1/avatar.png');", description: "Stockage de fichiers" },
  { title: "RLS Policy", code: "-- Allow users to read own data\nCREATE POLICY \"Users can read own data\"\nON users FOR SELECT\nUSING (auth.uid() = id);\n\n-- Allow insert for authenticated\nCREATE POLICY \"Auth users can insert\"\nON posts FOR INSERT\nTO authenticated\nWITH CHECK (auth.uid() = author_id);", description: "Row Level Security" },
  { title: "Edge Function", code: "// supabase/functions/hello/index.ts\nimport { serve } from 'https://deno.land/std/http/server.ts';\n\nserve(async (req) => {\n  const { name } = await req.json();\n  return new Response(\n    JSON.stringify({ message: `Hello ${name}!` }),\n    { headers: { 'Content-Type': 'application/json' } }\n  );\n});", description: "Edge Functions (Deno)" },
  { title: "RPC", code: "// Call a PostgreSQL function\nconst { data, error } = await supabase\n  .rpc('get_user_stats', { user_id: 1 });", description: "Appel de fonctions SQL" },
];

const goCheatsheet: CheatItem[] = [
  { title: "Hello World", code: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}", description: "Programme de base" },
  { title: "Variables", code: "var x int = 10\ny := 20 // short declaration\nconst Pi = 3.14\n\nvar (\n    name string = \"Go\"\n    version int = 1\n)", description: "Déclaration de variables" },
  { title: "Fonctions", code: "func add(a, b int) int {\n    return a + b\n}\n\n// Multiple return values\nfunc divide(a, b float64) (float64, error) {\n    if b == 0 {\n        return 0, fmt.Errorf(\"division by zero\")\n    }\n    return a / b, nil\n}", description: "Fonctions et retours multiples" },
  { title: "Structs", code: "type User struct {\n    ID   int    `json:\"id\"`\n    Name string `json:\"name\"`\n    Age  int    `json:\"age\"`\n}\n\nfunc (u User) Greet() string {\n    return fmt.Sprintf(\"Hi, I'm %s\", u.Name)\n}", description: "Structures et méthodes" },
  { title: "Interfaces", code: "type Shape interface {\n    Area() float64\n    Perimeter() float64\n}\n\ntype Circle struct {\n    Radius float64\n}\n\nfunc (c Circle) Area() float64 {\n    return math.Pi * c.Radius * c.Radius\n}", description: "Interfaces et polymorphisme" },
  { title: "Goroutines", code: "func main() {\n    go func() {\n        fmt.Println(\"Running in goroutine\")\n    }()\n\n    // WaitGroup\n    var wg sync.WaitGroup\n    wg.Add(1)\n    go func() {\n        defer wg.Done()\n        doWork()\n    }()\n    wg.Wait()\n}", description: "Concurrence" },
  { title: "Channels", code: "ch := make(chan string)\n\ngo func() {\n    ch <- \"hello\"\n}()\n\nmsg := <-ch\nfmt.Println(msg)\n\n// Buffered channel\nbuf := make(chan int, 10)", description: "Communication inter-goroutines" },
  { title: "Error Handling", code: "result, err := doSomething()\nif err != nil {\n    log.Fatal(err)\n}\n\n// Custom error\ntype AppError struct {\n    Code    int\n    Message string\n}\n\nfunc (e *AppError) Error() string {\n    return e.Message\n}", description: "Gestion d'erreurs idiomatique" },
];

const rustCheatsheet: CheatItem[] = [
  { title: "Hello World", code: "fn main() {\n    println!(\"Hello, World!\");\n}", description: "Programme de base" },
  { title: "Variables", code: "let x = 5;           // immutable\nlet mut y = 10;      // mutable\ny += 1;\nconst MAX: u32 = 100;\nlet (a, b) = (1, 2); // destructuring", description: "Déclaration et mutabilité" },
  { title: "Ownership", code: "let s1 = String::from(\"hello\");\nlet s2 = s1; // s1 is moved, no longer valid\n\n// Borrow (reference)\nlet s3 = String::from(\"hello\");\nlet len = calculate_length(&s3); // s3 still valid\n\nfn calculate_length(s: &String) -> usize {\n    s.len()\n}", description: "Système de propriété" },
  { title: "Structs", code: "#[derive(Debug)]\nstruct User {\n    name: String,\n    age: u32,\n}\n\nimpl User {\n    fn new(name: &str, age: u32) -> Self {\n        User { name: name.to_string(), age }\n    }\n\n    fn greet(&self) -> String {\n        format!(\"Hi, I'm {}\", self.name)\n    }\n}", description: "Structures et implémentations" },
  { title: "Enums & Pattern Matching", code: "enum Shape {\n    Circle(f64),\n    Rectangle(f64, f64),\n}\n\nfn area(shape: &Shape) -> f64 {\n    match shape {\n        Shape::Circle(r) => std::f64::consts::PI * r * r,\n        Shape::Rectangle(w, h) => w * h,\n    }\n}", description: "Enums et match" },
  { title: "Option & Result", code: "fn find_user(id: u32) -> Option<String> {\n    if id == 1 { Some(\"Alice\".to_string()) }\n    else { None }\n}\n\nfn parse_number(s: &str) -> Result<i32, String> {\n    s.parse::<i32>()\n        .map_err(|e| format!(\"Parse error: {}\", e))\n}\n\n// ? operator\nlet n = parse_number(\"42\")?;", description: "Gestion d'erreurs idiomatique" },
  { title: "Traits", code: "trait Drawable {\n    fn draw(&self);\n    fn area(&self) -> f64 { 0.0 } // default impl\n}\n\nimpl Drawable for Circle {\n    fn draw(&self) {\n        println!(\"Drawing circle r={}\", self.radius);\n    }\n    fn area(&self) -> f64 {\n        PI * self.radius * self.radius\n    }\n}", description: "Traits (interfaces)" },
  { title: "Iterators", code: "let v = vec![1, 2, 3, 4, 5];\n\nlet sum: i32 = v.iter().sum();\nlet doubled: Vec<i32> = v.iter().map(|x| x * 2).collect();\nlet even: Vec<&i32> = v.iter().filter(|x| *x % 2 == 0).collect();\n\n// Chaining\nlet result: Vec<i32> = (0..10)\n    .filter(|x| x % 2 == 0)\n    .map(|x| x * x)\n    .collect();", description: "Itérateurs et chaînage" },
  { title: "Lifetimes", code: "fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() > y.len() { x } else { y }\n}\n\nstruct Important<'a> {\n    content: &'a str,\n}", description: "Durées de vie" },
  { title: "Closures", code: "let add = |a, b| a + b;\nprintln!(\"{}\", add(1, 2));\n\nlet mut count = 0;\nlet mut increment = || {\n    count += 1;\n    count\n};\nprintln!(\"{}\", increment());", description: "Fonctions anonymes" },
  { title: "Async", code: "async fn fetch_data(url: &str) -> Result<String, reqwest::Error> {\n    let response = reqwest::get(url).await?;\n    let body = response.text().await?;\n    Ok(body)\n}\n\n#[tokio::main]\nasync fn main() {\n    let data = fetch_data(\"https://api.example.com\").await.unwrap();\n}", description: "Programmation asynchrone" },
  { title: "Cargo", code: "# Nouveau projet\ncargo new my_project\n\n# Build & Run\ncargo build --release\ncargo run\n\n# Tests\ncargo test\n\n# Ajouter dépendance\ncargo add serde --features derive", description: "Gestionnaire de paquets" },
];

const langMap: Record<string, string> = {
  html: "xml", css: "css", js: "javascript", ts: "typescript",
  react: "javascript", sql: "sql", python: "python", bash: "bash",
  docker: "dockerfile", tailwind: "css", git: "bash",
  nextjs: "typescript", prisma: "typescript", supabase: "typescript",
  go: "go", rust: "rust",
};

export default function Cheatsheets() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("html");

  const highlightAll = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.querySelectorAll("pre code:not(.hljs)").forEach((el) => {
        hljs.highlightElement(el as HTMLElement);
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(highlightAll, 50);
    return () => clearTimeout(timer);
  }, [activeTab, search, highlightAll]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copié !", description: "Le code a été copié dans le presse-papier" });
  };

  const filterItems = (items: CheatItem[]) => {
    if (!search) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase())
    );
  };

  const CheatsheetSection = ({ items, lang }: { items: CheatItem[]; lang: string }) => {
    const filtered = filterItems(items);
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((item, index) => (
          <Card key={index} className="hover:shadow-lg transition-smooth">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyCode(item.code)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="p-3 bg-[#0d1117] rounded-md overflow-x-auto">
                <code className={`language-${lang} text-sm font-mono`}>{item.code}</code>
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const tabs = [
    { value: "html", label: "HTML", items: htmlCheatsheet },
    { value: "css", label: "CSS", items: cssCheatsheet },
    { value: "js", label: "JavaScript", items: jsCheatsheet },
    { value: "ts", label: "TypeScript", items: typescriptCheatsheet },
    { value: "react", label: "React", items: reactCheatsheet },
    { value: "nextjs", label: "Next.js", items: nextjsCheatsheet },
    { value: "sql", label: "SQL", items: sqlCheatsheet },
    { value: "prisma", label: "Prisma", items: prismaCheatsheet },
    { value: "supabase", label: "Supabase", items: supabaseCheatsheet },
    { value: "python", label: "Python", items: pythonCheatsheet },
    { value: "go", label: "Go", items: goCheatsheet },
    { value: "rust", label: "Rust", items: rustCheatsheet },
    { value: "bash", label: "Bash", items: bashCheatsheet },
    { value: "docker", label: "Docker", items: dockerCheatsheet },
    { value: "tailwind", label: "Tailwind", items: tailwindCheatsheet },
    { value: "git", label: "Git", items: gitCheatsheet },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl" ref={contentRef}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Cheatsheets
        </h1>
        <p className="text-muted-foreground">
          Mémos rapides avec coloration syntaxique — {tabs.length} langages et outils
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un snippet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <CheatsheetSection items={tab.items} lang={langMap[tab.value] || "plaintext"} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
