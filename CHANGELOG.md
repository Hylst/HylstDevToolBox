# Changelog

Toutes les modifications notables de HylstDevToolBox sont documentées ici.  
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

---

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
