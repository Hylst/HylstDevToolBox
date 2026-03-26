# HylstDevToolBox

> 🛠️ Boîte à outils universelle pour développeurs — 120+ outils, 100% local, PWA, pédagogique et open-source.
> 
> **Accessible en ligne :** [https://hylst.fr/hdtb/](https://hylst.fr/hdtb/)

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan) ![PWA](https://img.shields.io/badge/PWA-Ready-success)

## ✨ Fonctionnalités

- **120+ outils** répartis en 7 catégories thématiques
- **100% Hors-ligne (PWA)** — Installable sur bureau et mobile, aucune donnée envoyée
- **Pédagogique** — Infobulles explicatives sur les termes techniques et liens mémos
- **Lecteur de Musique Cyberpunk** — 26 titres IA originaux en streaming pendant le dev
- **Recherche globale & Raccourcis clavier** — Trouvez et naviguez rapidement (Ctrl+Shift+Flèches)
- **Historique du presse-papier** — Gardez une trace de vos copies récentes (Ctrl+Shift+V)
- **Favoris, récents & préférences** — Export/Import de vos configurations
- **Mode Présentation (Plein écran)** — Interface optimisée pour la consultation de cheatsheets
- **Thème adaptatif** — Dark / Light mode

## 📦 Catégories d'outils

| Catégorie | Description |
|-----------|-------------|
| **Texte & Formats** | Markdown, analyse, conversion, nettoyage de texte, diff... |
| **Code & Analyse** | Regex, testeurs d'API, formateurs (CSS/SQL/XML), AST, configurations diverses |
| **Design** | Couleurs, générateurs CSS (gradients, shadows, flexbox, animations), contrastes |
| **Utilitaires** | Hash, base64, UUID, meta tags, convertisseurs d'URL, Git |
| **Dates & Temps** | Calculatrices de dates, convertisseurs timezone, cron |
| **Data & Backend** | Mots de passe, JWT, générateurs de données mock, DB Designers |
| **Mémo / Cheatsheets**| Raccourcis clavier Linux, commandes Git, architecture, sécurité, aide mémoire divers |

*(Consultez [features.md](./features.md) pour la liste exhaustive)*

## 🚀 Démarrage rapide en local

```bash
# Cloner le projet
git clone <URL_DU_DEPOT>
cd hylstdevtoolbox

# Installer les dépendances
npm install

# Lancer le serveur de développement local
npm run dev

# Générer le build de production (pour déploiement statique/PWA)
npm run build
```

Pour déployer avec Docker / VPS Nginx, consultez [test_build_deploy.md](./test_build_deploy.md).

## 🏗️ Stack technique

- **Core** : React 18, TypeScript, Vite 5
- **Design System** : Tailwind CSS, shadcn/ui, Lucide Icons
- **Performances & Data** : Progressive Web App (vite-plugin-pwa), React Query, localforage / Dexie
- **Visualisations** : Recharts, Mermaid.js

## 📁 Architecture et Historique

- [STRUCTURE.md](./STRUCTURE.md) : L'architecture détaillée du code.
- [ABOUT.md](./ABOUT.md) : La vision et l'origine du projet.
- [TODO.md](./TODO.md) : L'historique et les objectifs accomplis.
- [CHANGELOG.md](./CHANGELOG.md) : Suivi des modifications par version.

## 👤 Auteur

Créé avec passion pour la communauté par **Geoffroy Streit** ([hylst.fr](https://hylst.fr)).  
*Apprenant perpétuel !*

## 📄 Licence

Ce projet est sous licence MIT (voir le fichier [LICENSE](./LICENSE)). Il est entièrement libre et gratuit d'utilisation.
