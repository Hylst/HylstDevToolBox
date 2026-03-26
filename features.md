# HylstDevToolBox - Fonctionnalités

HylstDevToolBox est une boîte à outils de développement web complète, moderne, rapide et 100% locale, regroupant 129 outils essentiels sous une interface unifiée.

## Caractéristiques Principales

- **100% Local (Local-First)** : Aucune donnée n'est envoyée à un serveur tiers. Tout est traité dans votre navigateur.
- **Rapide & Moderne** : Construit avec React, TypeScript, Vite, et Tailwind CSS. Les outils sont chargés de façon différée (lazy-loading) pour une performance optimale.
- **Pédagogique** : Conçu pour comprendre et apprendre les concepts, avec des explications claires et en français.
- **Responsive** : Interface entièrement adaptative (Desktop, Tablette, Mobile).

## Navigation & Ergonomie

- **Recherche Globale (Command Palette)** : Raccourci `Ctrl+K` (ou `Cmd+K`) pour rechercher instantanément parmi les 129 outils.
- **Raccourcis Clavier** : 
  - `Ctrl+Shift+Flèche Gauche/Droite` : Naviguer rapidement vers l'outil précédent ou suivant dans la même catégorie.
  - `Ctrl+Shift+V` : Ouvrir l'historique du presse-papier.
  - `Ctrl+D` (ou `Cmd+D`) : Basculer entre le mode clair et le mode sombre.
  - `Ctrl+B` (ou `Cmd+B`) : Afficher ou masquer la barre latérale.
- **Favoris** : Mettez en favoris n'importe quel outil pour y accéder rapidement depuis le menu latéral.
- **Historique du Presse-papier** : Tous les éléments copiés depuis l'application sont conservés de manière sécurisée en local.

## Gestion des Préférences

- **Export/Import** : Toutes les préférences (Favoris, Thème, Historique du presse-papier, Notes, etc.) sont enregistrées dans le `localStorage`. Elles peuvent être exportées et importées facilement sous forme de fichier JSON depuis le bouton de paramètres (⚙) dans l'en-tête.

## Catalogue des Outils (129 Outils)

L'application est découpée en 7 grandes catégories :

### Data & Backend (15 Outils)
- **Générateur de données** : Données test, CSV, JSON, SQL.
- **CSV Viewer** : Visualisation, tri et filtrage avancés de CSV.
- **Schémas** : Générateur de schémas (JSON Schema, Zod, Yup).
- **Faker Playground** : Génération de données réalistes avec Faker.js.
- **SQL Builder** : Constructeur visuel de requêtes SQL.
- **API Mocker Pro** : Mocking d'endpoints pour le dev frontend.
- **DB Designer** : Conception visuelle de BDD.
- **OpenAPI Designer** : Éditeur OpenAPI 3.x.
- **JSONPath Explorer** : Requêtage de données JSON avec JSONPath.
- **Anonymizer** : Anonymisation de données sensibles.
- **Test Matcher** : Comparaison visuelle des résultats de test.
- **GraphQL Builder** : Construction de schémas GraphQL.
- **Seed Data** : Générateur de scripts de seed.
- **Prisma Builder** : Éditeur visuel pour schema.prisma.
- **SQL Playground** : Base de données SQLite In-Browser.

### Code & Format (28 Outils)
- **Markdown Editor** : Éditeur MD en temps réel avec prévisualisation complète.
- **Regex Tester** : Validation et test d'expressions régulières.
- **JSON Validator/Formatter** : Validation et embellissement du JSON.
- **Diff Viewer** : Comparateur de code côte à côte.
- **SQL Formatter** : Indentation automatique de requêtes SQL.
- **CSS Formatter** : Minification et indentation de CSS.
- **XML Formatter** : Embellissement et validation XML.
- **Escape/Unescape** : Encodage et décodage HTML, JSON, URL, SQL, etc.
- **Base64** : Encodage/Décodage avec support image/preview.
- **JWT Decoder** : Inspection sécurisée de tokens JWT (Header / Payload / Exp).
- **API Tester** : Envoi de requêtes HTTP (Rest, Headers personnalisés, historique).
- **GraphQL Tester** : Testing GraphQL avec éditeur intégré.
- **WebSocket Tester** : Console en temps réel WebSocket.
- **Code Minifier** : Réduction de la taille JS, CSS et HTML.
- **Cron Builder** : Expressions CRON.
- **AST Explorer** : Arbre syntaxique JS/TS.
- **Package Analyzer** : Analyse de packages.json.
- **Prompt Engineer** : Conception et tests de prompts pour LLM.
- **TOML Editor** : Éditeur TOML.
- **Mermaid Editor** : Générateur live de diagrammes Mermaid.
- **Bundle Analyzer** : Évaluation du poids des librairies NPM.
- **Tailwind ↔ CSS** : Convertisseur bidirectionnel.
- **Dep Graph** : Affichage graphique des dépendances.
- **Docker Compose** : Générateur visuel de docker-compose.yml.
- **Webhook Tester** : Débogage webhooks / endpoints.
- **NPM Compare** : Comparaison des métriques (taille, favoris) des packages npm.
- **Server Config** : Configurations standards serveurs Nginx/Apache.
- **SQL ↔ Prisma** : Convertisseur SQL to Prisma (et inverse).
- **API Docs** : Prévisualisation interactive (Swagger-like).
- **Code Formatter** : Formatage universel multi-langages.

### Utilitaires (21 Outils)
- **Mot de passe** : Générateur complet et sécurisé avec multiples règles de force.
- **Hash** : Calcul local de hash d'un texte ou fichier (MD5, SHA1/256/512...).
- **Unités & Mesures** : Convertisseur dimensions, taille de fichiers, températures.
- **UUID Generator** : Standard UUID V4 à la volée.
- **QR Code** : Génération de QR interactifs et téléchargement SVG / PNG.
- **Meta Tags** : Outil SEO (OpenGraph, Twitter).
- **Slug Generator** : Nettoyage d'url.
- **TOTP / 2FA** : Code basé sur la date pour la vérification à 2 facteurs.
- **Permissions Unix** : CHMOD visuel en système octal.
- **Bases numériques** : Decimal, Binaire, Octal, Hexa...
- **URL Parser** : Décomposition query-string / baseUrl / params.
- **Env Manager** : Gestionnaire / valideur de fichier `.env`.
- **IP Analyzer** : Outils de masque de sous-réseaux et CIDR IPV4 / IPV6.
- **Barcode** : Générateur de codebarres conventionnel.
- **Git Commit** : Rédacteur guidé "Conventional Commits".
- **Changelog** : Constructeur guidé Markdown.
- **.gitignore Builder** : Modèles d'ignores automatiques (node, python, windows).
- **Favicon** : Créateur de favicons web (Emoji/Texte) 16x16, 32x32, etc.
- **Caractères Spéciaux** : Bibliothèque d'Emojis et unicodes.
- **Robots.txt** : Constructeur d'indexation SEO robots.txt.
- **Timestamp** : Convertisseur absolu EPOCH / Humain.

### Design (22 Outils)
- **Couleurs** : Sélecteur et extracteur Hex/RGB/HSL.
- **Gradients CSS** : Design de gradients Linear, Radial, Conic.
- **Box Shadow** : Générateur pour ombres portées avec multiples layers.
- **Border Radius** : Constructeur complet 8 faces de border-radius.
- **Text Shadow** : Customisation d'ombres sur éléments textuels.
- **Animations CSS** : Générateur keyframes complet.
- **Flexbox** : Sandbox et assistant visuel Flex.
- **CSS Grid** : Génération Layout Grid moderne.
- **Contraste WCAG** : Évaluation du score a11y colorimétrique.
- **Icônes SVG** : Liste Lucide / Tailwind / Bootstrap exportable.
- **Espacements** : Générateur d'échelles rythmiques / rem scale.
- **Font Pairing** : Bibliothèque de mix de typos harmonieuses.
- **Responsive Preview** : Simulation multi-formats iFrames.
- **CSS Specificity** : Evaluateur de poids (1-0-1 vs 0-1-0).
- **A11y Checklist** : Validation guidée pour dev Frontend.
- **Glassmorphism** : Filtre backdrop blur et border translucide.
- **Clip-path Editor** : Masking CSS polygon/circle/ellipse.
- **Color Palette** : Générateur Triad / Analogous / Complementary.
- **CSS Filter** : Effets de contrastes, sepia, luminance, ...
- **Type Scale** : Échelles typographiques (Minor third, Major second, Golden ratio...).
- **CSS Variables** : Extracteurs root values.
- **Tailwind Playground** : Sandboxing pour classes tailwind sans configuration.

### Dates & Temps (9 Outils)
- **Calculateur de dates** : Addition ou soustraction de durées à une date.
- **Formats de dates** : Parsers entre divers standards (ISO, RFC...).
- **Inspecteur de dates** : Analyse profonde (bissextile, we, n° de semaine).
- **Timezone** : Modificateur et ajusteur mondial de temporalité.
- **Flux temporels** : Timelines.
- **Calendriers** : Fériés et agendas.
- **Date Reference** : Doc d'API de manipulation date javascript, fns et stringify.
- **Date Toolbox** : Divers calculs orienté dates pures Javascript.
- **Countdown** : Minuteur paramétrable avec visuel fullscreen.

### Texte (12 Outils)
- **Analyseur de texte** : Compteur de mots et statistiques de lecture.
- **Formatage texte** : Casse alternative / Kebab-case / Snake_case...
- **Extraction données** : Regex finding et extracteur de mails, urls, telephones.
- **Générateur Lorem** : Dummy Text Maker sur-mesure.
- **Nettoyeur texte** : Remove double breaks, espaces inutiles, HTML Tags extirpator.
- **Convertisseur format** : CSV ↔ JSON ↔ XML ↔ YAML avec détections malformées.
- **HTML ↔ Markdown** : Dual conversion WYSIWYG pour développeurs Markdown.
- **Changement de casse** : Transformation entre majuscules, camelCase, etc.
- **Générateur de tables** : Tables Markdown rapides à partir de colonnes manuelles ou CSV.
- **Encodage / ISO** : Manipulation des charsets, UTF8/ANSI.
- **ReadMe Editor** : Interface orientée composition de ReadMe performant de dépot.
- **Word Counter Pro** : Compteurs avec sémantique et ranking de redondance.

### Mémo (12 Outils)
- **Cheatsheets** : Résumés sur les différents cas pratiques. (Javascript, React, etc.)
- **HTTP Status** : Le lexique des erreurs (200, 301, 302, 403, 404, 500, etc.) avec causes.
- **Glossaire** : Termes employés quotidiennement dans le web dev.
- **Notes** : Scratchpad 100% local en persist.
- **Snippets** : Code source partiel prêt à l'emploi.
- **Raccourcis** : Mappage des IDE et du Finder / Windows Explorer / GitBash.
- **Quick Ref** : Ports réseau, Mime types.
- **ASCII/Unicode** : Lookup visuel et décimal.
- **Algorithmes** : Parcours / complexités / O(n) visuels interactifs et ludiques.
- **Interview** : Quizz pour préparation des techniques à des postes dev.
- **Erreurs** : Les solutions des grosses erreurs de build (React error #xxx).
- **Architecture** : Documentation MVC / MVVM / DDD / Solid.

(Ces listes sont construites à l'image du 'Tool Registry' interne central)
