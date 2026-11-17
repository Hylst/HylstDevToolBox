# Changelog

Toutes les modifications notables de HylstDevToolBox sont documentées ici.  
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

---

## [Non publié]

- Source regroupée dans `D:\0CODE\0FINAL\it\hdtb` (17/11/2026, réorganisation des plateformes). Aucun chemin de l'ancien emplacement dans le dépôt ; build inchangé, identique à celui publié.

## [3.0.6] - 2026-11-16

### Confidentialite : presse-papiers, testeur d'API, reinitialisation

- **Historique du presse-papiers** : l'application garde les 50 dernieres copies (boutons « Copier » et Ctrl+C dans ses pages) pour la fenetre Ctrl+Maj+V. Elles etaient enregistrees en clair dans `localStorage`, d'une visite a l'autre et sans avertissement, alors qu'on y copie des mots de passe, jetons JWT ou cles. Elles ne sont plus gardees que le temps de l'onglet (`sessionStorage`). L'ancien historique durable est retire au premier chargement, avec un message, et reste visible jusqu'a la fermeture de l'onglet. Il ne fait plus partie de l'export des preferences, et un ancien export qui le contient est importe sans lui.
- **Testeur d'API** : les valeurs des variables d'environnement, en-tetes et parametres au nom sensible (cle, jeton, secret, mot de passe, cookie, `Authorization`, session) ne sont plus enregistrees dans `localStorage` : elles restent dans `sessionStorage` le temps de l'onglet. Une valeur faite seulement de references (`Bearer {{TOKEN}}`) reste enregistree. L'historique des requetes garde l'URL sans la valeur des parametres sensibles. Les anciennes valeurs sont retirees du stockage durable au premier chargement, avec un message ; l'export des collections (fichier en clair) permet de les garder. Module `src/lib/sensitive-storage.ts`.
- **Reinitialisation** : le bouton « Reinitialiser l'application » appelait `localStorage.clear()`. L'origine hylst.fr etant partagee par toutes les apps de la plateforme, il effacait aussi leurs donnees (progressions, profils, reglages). Il ne retire plus que les cles de la boite a outils (`src/lib/devtoolbox-storage.ts`) ; le theme, cle commune a d'autres apps, est garde.
- **Export des preferences** : les favoris etaient lus sous une cle inexistante (`hylst-favorites`) et sortaient vides ; ils sont lus sous `devtoolbox-favorites`.
- **Textes** : fenetre de l'historique, reglages, testeur d'API et fenetre d'informations (rubriques Preferences et Vos donnees) disent ce qui est garde et pour combien de temps.

### Performance : lecteur de musique

- **Prechargement** : a chaque visite, le lecteur assignait sa premiere piste avec le prechargement par defaut, et le navigateur telechargeait le MP3 (6,9 Mo) sans que personne ne lance la lecture. La source n'est plus assignee qu'au premier clic sur Lecture (Chromium telechargeait la piste meme avec `preload = "none"`) ; la duree s'affiche des que la piste demarre.

## [3.0.5] - 2026-11-15

### Securite : 0 faille en production, Mermaid en mode strict

- **Dependances** : React Router 6 a 7.18.5 (redirection ouverte GHSA-wrjc-x8rr-h8h6 ; API `BrowserRouter`, `Routes`, `NavLink` et `useNavigate` inchangees ici), Mermaid 11 a 12.3.0 (embarque KaTeX 0.18.10, corrige GHSA-238p-pmpm-9mq7), Tailwind 3.4.19 et `npm audit fix` (sucrase, glob, minimatch). `npm audit --omit=dev` : 0 (etait 5 moderees et 2 faibles).
- **Mermaid** : `securityLevel` passe de `loose` a `strict` dans l'editeur Mermaid, l'editeur Markdown et le graphe de dependances. En `loose`, un libelle de diagramme colle depuis une source douteuse pouvait inserer du HTML actif, execute sur l'origine hylst.fr partagee par toutes les apps de la plateforme. Les 13 modeles de l'editeur s'affichent a l'identique.
- **Controles** : TypeScript 0, build OK ; apercu de production : 13 modeles Mermaid rendus, diagramme dans l'apercu Markdown, graphe de dependances, navigation interne, retour et page 404 ; sonde d'injection dans un libelle non executee. Le lint signale 167 erreurs anterieures (surtout `no-explicit-any`), sans lien avec ces changements.
- **Plateforme** : les liens directs vers un outil (`/hdtb/mermaid-editor`...) renvoyaient la page 404 de hylst.fr faute de repli SPA ; bloc Nginx ajoute cote plateforme le meme jour.

## [3.0.4] - 2026-11-14

### Images d'exemple locales, dependances

- **Images** : plus aucune image chargee depuis Unsplash, pravatar.cc, picsum.photos ou via.placeholder.com. Les photos d'exemple de l'editeur de filtres CSS, les avatars et les photos des generateurs de donnees (generateur, playground Faker, simulateur de reponses d'API) sont seize images webp creees pour l'application avec Qwen Image 2.1 Turbo execute en local (`public/samples/`, 539 Ko, hors precache). Module commun `src/lib/sample-images.ts`.
- **Editeur Markdown** : le modele README n'affiche plus de badges shields.io, l'insertion d'image propose un chemin relatif.
- **Fenetre d'informations** : liste des services exterieurs reduite au registre npm, a Google Fonts et a l'adresse saisie dans le testeur d'API.
- **Dependances** : `npm audit fix` (jspdf 4.2.1, mermaid 11.17.2, dompurify 3.4.18), zod 4. Plus aucune faille haute ou critique dans les dependances de production ; restent 5 moderees et 2 faibles (react-router 6, katex, outils de build).

## [3.0.3] - 2026-11-14

### Mentions legales et confidentialite

- **Fenetre d'informations** : onglet Createur complete par une rubrique « Mentions legales et confidentialite » (editeur non professionnel, hebergeur Hostinger avec serveur au Royaume-Uni, journaux douze mois au plus, donnees gardees dans le navigateur, liste des services exterieurs contactes par certains outils, messagerie Infomaniak) et lien vers les mentions de la plateforme hylst.fr. Licence MIT et assistance IA mentionnees.
- **Contact** : adresse `geoffroy.streit@ik.me`.
- **Textes** : « 100% local », « Aucune donnee n'est envoyee a un serveur » et « aucune donnee envoyee » (accueil et fenetre d'informations) remplaces par une formulation exacte (quelques outils contactent un service tiers : registre npm, Google Fonts, Unsplash, shields.io, pravatar, picsum, via.placeholder, URL du testeur d'API).
- **index.html** : polices servies par la plateforme (`/assets/fonts/fonts.css`) au lieu de Google Fonts, correctif applique jusqu'ici a la main sur le build publie.
- **public/sitemap.xml** : sitemap de l'application, jusqu'ici ajoute a la main sur hylst.fr.
- **Mobile** : la page d'accueil depassait de l'ecran a 390 px (colonne principale sans `min-w-0`, boutons de fin de page sans retour a la ligne), ce qui coupait aussi la fenetre d'informations a gauche. Les onglets de cette fenetre defilent desormais horizontalement sur petit ecran.

## [3.0.0] - 2026-03-26

### Ajouté & Amélioré — Phases 5 à 7 : Polissage, UX & PWA

- **Rebranding** — Application renommée en `HylstDevToolBox` (100% propre)
- **PWA & Hors-Ligne** — Intégration de `vite-plugin-pwa` et Service Worker pour une installation bureau/mobile et fonctionnement hors ligne
- **Clipboard History** — Nouvel onglet d'historique du presse-papier global (Raccourci: `Ctrl+Shift+V`)
- **Navigation Rapide** — Raccourcis clavier globaux (`Ctrl+Shift+Flèche Gauche/Droite`) pour passer d'un outil à l'autre
- **Mode Présentation** — Bouton Plein Écran pour masquer la navigation et se concentrer sur le contenu (idéal pour les cheatsheets)
- **Export / Import** — Sauvegarde et restauration des préférences utilisateur, favoris et historique du presse-papier au format JSON
- **SEO & Performances** — URL canonique, meta tags OpenGraph & Twitter avec images générées, base URL `/hdtb/`
- **Documentation Master** — `features.md`, `test_build_deploy.md`, `ABOUT.md` et `STRUCTURE.md` entièrement mis à jour et validés
- **Expérience Utilisateur** — Outils portés au nombre de 129, interface humanisée, code commenté.
- **UI/UX Cyberpunk (Phase 8)** — Remplacement des coeurs et du favicon par des assets pixel-art Hylst, ajout d'animations glitch/pulse sur le Header et sur la home page.
- **Music Player (Phase 9)** — Lecteur de musique ambiante intégré (`Hylst Cyber Player`) avec contrôles compacts dans le Header et modal dédié (26 titres IA originaux).
- **Core Fixes** — Résolution du problème 404 au chargement en sous-répertoire via injection de `basename` dans React Router.
---

## [2.2.0] - 2026-03-08

### Amélioré — Phase 4 : Enrichissement d'outils existants (groupe 2)

- **Countdown Timer** — Pomodoro complet avec 4 presets, sessions, compteur, notification sonore, laps chronomètre
- **Meta Tags Generator** — JSON-LD pour Product (prix/devise) et FAQ, score SEO détaillé avec 9 critères, canonical

---

## [2.1.0] - 2026-03-08

### Amélioré — Phase 3 : Enrichissement d'outils existants

- **Lorem Generator** — 5 styles (Lorem, Hipster, Tech, Corporate, Bacon) + mode HTML + titres H1–H6
- **Base64 Tool** — Support Base32, Base16 (hex), détection automatique du format, bouton auto-detect
- **Diff Viewer** — Drag & drop de fichiers, boutons upload, compteur total de changements
- **Converters** — 3 nouveaux onglets : données (B→PB), vitesse (m/s, km/h, mph, nœuds), pression (Pa, bar, atm, psi)
- **Slug Generator** — Mode bulk (conversion en masse), URL de base configurable, copie URLs complètes

---

## [2.0.0] - 2026-03-08

### Ajouté — Phase 2 : Outils avancés

- **Webhook Tester** (`/webhook-tester`) — Simulation de webhooks avec templates Stripe, GitHub, Slack, Discord
- **NPM Package Comparator** (`/npm-compare`) — Comparaison côte à côte de packages npm (popularité, taille, dépendances)
- **Server Config Generator** (`/server-config`) — Générateur de configurations Nginx et Apache (SSL, CORS, cache, sécurité)
- **SQL ↔ Prisma Converter** (`/sql-prisma`) — Conversion bidirectionnelle entre SQL DDL et schema Prisma
- **API Docs Generator** (`/api-docs`) — Génération de documentation depuis un schema OpenAPI/Swagger
- **Code Formatter** (`/code-formatter`) — Formateur universel multi-langage (JS/TS/JSON/CSS/HTML/SQL/XML) avec détection auto

### Intégration

- Routes, sidebar et dashboard mis à jour pour les 6 outils Phase 2

---

## [1.1.0] - 2026-03-08

### Ajouté — Phase 1 : Nouveaux outils

- **Typography Scale Calculator** (`/type-scale`) — Calculateur d'échelle typographique avec export CSS/Tailwind/SCSS
- **CSS Variables Generator** (`/css-variables`) — Générateur de thème complet en CSS custom properties
- **Robots.txt Builder** (`/robots-builder`) — Constructeur visuel de robots.txt avec templates CMS
- **Architecture Patterns** (`/architecture`) — Référence interactive des patterns d'architecture logicielle
- **Security Cheatsheet** (`/security-cheatsheet`) — Référence OWASP Top 10 avec code vulnérable vs sécurisé
- **Word Counter Pro** (`/word-counter`) — Compteur avancé avec lisibilité Flesch-Kincaid et densité de mots-clés

---

## [1.0.0] - 2026-03-01

### Fondation

- 100 outils de développement répartis en 7 catégories
- Interface 100% en français avec approche pédagogique
- Système de favoris et outils récents (localStorage)
- Recherche globale dans la sidebar et la page d'accueil
- Dark/Light mode
- Architecture React + TypeScript + Vite + Tailwind + shadcn/ui

### Catégories initiales

- **Texte & Formats** : Markdown, Diff, Analyseur, Lorem, Nettoyeur, Convertisseur, HTML↔MD, Encodage
- **Code & Analyse** : Regex Pro, JSON/YAML, SQL/CSS/XML Formatter, Base64, JWT, API Tester, GraphQL, WebSocket, Cron, AST, Mermaid, Docker Compose, Tailwind↔CSS, Dep Graph
- **Design** : Color Picker, Gradients, Box Shadow, Border Radius, Text Shadow, Animations, Flexbox, Grid, Contrast Checker, SVG Icons, Spacing, Font Pairing, Glassmorphism, Clip-path, CSS Filter
- **Utilitaires** : Password, Hash, UUID, QR Code, Meta Tags, Slug, Unix Permissions, Number Base, URL Parser, Env Manager, Timestamp, IP Analyzer, Barcode, Git Commit, Changelog, .gitignore, Favicon
- **Dates & Temps** : Calculateur, Formats, Inspecteur, Timezone, Timelines, Calendriers, Date Reference, Date Toolbox, Countdown
- **Data & Backend** : Data Generator, CSV Viewer, Schema Generator, Faker, SQL Builder, API Mocker Pro, DB Designer, OpenAPI Designer, JSONPath, Anonymizer, Test Matcher, GraphQL Builder, Seed Data, Prisma Builder
- **Mémo** : Cheatsheets, HTTP Status, Glossaire, Notes, Snippets, Raccourcis, Quick Ref, ASCII/Unicode, Design Tokens, Best Practices, Algorithmes, Interview, Erreurs, Regex/CSS/Git Cheatsheets

### Fusions réalisées

- Regex Tester + Regex Debugger → **Regex Pro**
- Env Parser + Env Diff → **Env Manager**
- Mock API + Response Mocker → **API Mocker Pro**
- Date Sandbox + Date Issues + Date Docs → **Date Reference**
- Date API + Date Validation → **Date Toolbox**
