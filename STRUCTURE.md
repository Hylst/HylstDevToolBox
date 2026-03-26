# Structure du projet

```
devtoolbox/
├── public/                          # Assets statiques
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/
│   ├── main.tsx                     # Point d'entrée React et init Service Worker (PWA)
│   ├── App.tsx                      # Providers globaux et LayoutManager
│   ├── App.css                      # Styles globaux
│   ├── index.css                    # Design tokens (CSS variables)
│   ├── vite-env.d.ts                # Types incluant vite-plugin-pwa
│   │
│   ├── contexts/                    # États Globaux
│   │   ├── ClipboardContext.tsx     # Interception et histo du presse-papier
│   │   ├── FavoritesContext.tsx     # Gestion des favoris
│   │   ├── PresentationContext.tsx  # Mode plein écran (Présentation)
│   │   └── MusicPlayerContext.tsx   # Lecteur de musique ambiant intégré
│   │
│   ├── components/
│   │   ├── AppSidebar.tsx           # Sidebar navigation (7 catégories)
│   │   ├── Header.tsx               # Barre de navigation principale avec mini-player
│   │   ├── InfoModal.tsx            # Fenêtre d'info, principes, créateur
│   │   ├── MusicPlayerModal.tsx     # Interface complète du lecteur audio IA
│   │   ├── NavLink.tsx              # Composant de lien actif
│   │   ├── Tooltip.tsx              # Tooltip pédagogique
│   │   │
│   │   ├── algorithms/             # Composants spécifiques
│   │   │   ├── BSTVisualizer.tsx
│   │   │   └── GraphVisualizer.tsx
│   │   │
│   │   ├── color-picker/
│   │   │   ├── HslPlaygroundTab.tsx
│   │   │   └── PresetPalettesTab.tsx
│   │   │
│   │   └── ui/                      # shadcn/ui (40+ composants)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── tabs.tsx
│   │       └── ...
│   │
│   ├── pages/
│   │   ├── Index.tsx                # Page d'accueil (grille de toutes les catégories)
│   │   ├── NotFound.tsx             # Page 404
│   │   │
│   │   └── tools/                   # 110+ pages d'outils
│   │       │
│   │       │── # Texte & Formats (12)
│   │       ├── MarkdownEditor.tsx
│   │       ├── DiffViewer.tsx
│   │       ├── TextAnalyzer.tsx
│   │       ├── TextFormatter.tsx
│   │       ├── DataExtractor.tsx
│   │       ├── LoremGenerator.tsx
│   │       ├── TextCleaner.tsx
│   │       ├── FormatConverter.tsx
│   │       ├── HtmlMarkdownConverter.tsx
│   │       ├── TextCaseConverter.tsx
│   │       ├── CharacterEncoding.tsx
│   │       ├── WordCounterPro.tsx
│   │       │
│   │       │── # Code & Analyse (25+)
│   │       ├── RegexTester.tsx
│   │       ├── JsonValidator.tsx
│   │       ├── SqlFormatter.tsx
│   │       ├── CSSFormatter.tsx
│   │       ├── XmlFormatter.tsx
│   │       ├── EscapeTool.tsx
│   │       ├── Base64Tool.tsx
│   │       ├── JwtDecoder.tsx
│   │       ├── ApiTester.tsx
│   │       ├── CodeMinifier.tsx
│   │       ├── GraphQLTester.tsx
│   │       ├── WebSocketTester.tsx
│   │       ├── CronBuilder.tsx
│   │       ├── AstExplorer.tsx
│   │       ├── PackageAnalyzer.tsx
│   │       ├── PromptEngineer.tsx
│   │       ├── TomlEditor.tsx
│   │       ├── MermaidEditor.tsx
│   │       ├── BundleSizeAnalyzer.tsx
│   │       ├── HttpHeadersAnalyzer.tsx
│   │       ├── TailwindCssConverter.tsx
│   │       ├── DependencyGraph.tsx
│   │       ├── DockerComposeBuilder.tsx
│   │       ├── WebhookTester.tsx          # Phase 2
│   │       ├── NpmCompare.tsx             # Phase 2
│   │       ├── CodeFormatter.tsx          # Phase 2
│   │       │
│   │       │── # Design (21)
│   │       ├── ColorPicker.tsx
│   │       ├── GradientGenerator.tsx
│   │       ├── BoxShadowGenerator.tsx
│   │       ├── BorderRadiusGenerator.tsx
│   │       ├── TextShadowGenerator.tsx
│   │       ├── CSSAnimationGenerator.tsx
│   │       ├── FlexboxPlayground.tsx
│   │       ├── GridGenerator.tsx
│   │       ├── ContrastChecker.tsx
│   │       ├── SVGIconBrowser.tsx
│   │       ├── SpacingCalculator.tsx
│   │       ├── FontPairingTool.tsx
│   │       ├── ResponsivePreview.tsx
│   │       ├── CssSpecificity.tsx
│   │       ├── A11yChecklist.tsx
│   │       ├── GlassmorphismGenerator.tsx
│   │       ├── ClipPathEditor.tsx
│   │       ├── ColorPaletteGenerator.tsx
│   │       ├── CssFilterEditor.tsx
│   │       ├── TypographyScale.tsx         # Phase 1
│   │       ├── CssVariablesGenerator.tsx   # Phase 1
│   │       │
│   │       │── # Utilitaires (21)
│   │       ├── PasswordGenerator.tsx
│   │       ├── HashCalculator.tsx
│   │       ├── Converters.tsx
│   │       ├── UuidGenerator.tsx
│   │       ├── QrCodeGenerator.tsx
│   │       ├── MetaTagsGenerator.tsx
│   │       ├── SlugGenerator.tsx
│   │       ├── UnixPermissions.tsx
│   │       ├── NumberBaseConverter.tsx
│   │       ├── UrlParser.tsx
│   │       ├── EnvParser.tsx
│   │       ├── TimestampConverter.tsx
│   │       ├── IpAnalyzer.tsx
│   │       ├── BarcodeGenerator.tsx
│   │       ├── GitCommitGenerator.tsx
│   │       ├── ChangelogGenerator.tsx
│   │       ├── GitignoreBuilder.tsx
│   │       ├── FaviconGenerator.tsx
│   │       ├── SpecialCharacters.tsx
│   │       ├── RobotsTxtBuilder.tsx        # Phase 1
│   │       ├── ServerConfigGenerator.tsx   # Phase 2
│   │       │
│   │       │── # Dates & Temps (9)
│   │       ├── DateCalculator.tsx
│   │       ├── DateFormats.tsx
│   │       ├── DateInspector.tsx
│   │       ├── TimezoneConverter.tsx
│   │       ├── DateTimelines.tsx
│   │       ├── DateCalendars.tsx
│   │       ├── DateReference.tsx
│   │       ├── DateToolbox.tsx
│   │       ├── CountdownTimer.tsx
│   │       │
│   │       │── # Data & Backend (16)
│   │       ├── DataGenerator.tsx
│   │       ├── CSVViewer.tsx
│   │       ├── SchemaGenerator.tsx
│   │       ├── FakerPlayground.tsx
│   │       ├── SqlQueryBuilder.tsx
│   │       ├── ApiMockerPro.tsx
│   │       ├── DbSchemaDesigner.tsx
│   │       ├── OpenApiDesigner.tsx
│   │       ├── JsonPathExplorer.tsx
│   │       ├── DataAnonymizer.tsx
│   │       ├── TestDataMatcher.tsx
│   │       ├── GraphQLSchemaBuilder.tsx
│   │       ├── SeedDataGenerator.tsx
│   │       ├── PrismaSchemaBuilder.tsx
│   │       ├── SqlPrismaConverter.tsx      # Phase 2
│   │       ├── ApiDocsGenerator.tsx        # Phase 2
│   │       │
│   │       │── # Mémo (18)
│   │       ├── Cheatsheets.tsx
│   │       ├── HttpStatusCodes.tsx
│   │       ├── Glossary.tsx
│   │       ├── PersonalNotes.tsx
│   │       ├── SnippetsLibrary.tsx
│   │       ├── KeyboardShortcuts.tsx
│   │       ├── QuickReference.tsx
│   │       ├── AsciiUnicode.tsx
│   │       ├── DesignTokens.tsx
│   │       ├── BestPractices.tsx
│   │       ├── AlgorithmsVisualizer.tsx
│   │       ├── InterviewQuestions.tsx
│   │       ├── ErrorReference.tsx
│   │       ├── RegexCheatsheet.tsx
│   │       ├── CssSelectorReference.tsx
│   │       ├── GitCheatsheet.tsx
│   │       ├── ArchitecturePatterns.tsx    # Phase 1
│   │       └── SecurityCheatsheet.tsx     # Phase 1
│   │
│   ├── contexts/
│   │   └── FavoritesContext.tsx      # Gestion favoris + récents (localStorage)
│   │
│   ├── hooks/
│   │   ├── use-favorites.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   └── lib/
│       ├── utils.ts                  # Utilitaires (cn, etc.)
│       ├── color-utils.ts            # Fonctions couleur
│       ├── color-palettes.ts         # Palettes prédéfinies
│       ├── data-generator-utils.ts
│       ├── format-converter-utils.ts
│       ├── holidays.ts               # Jours fériés
│       └── ics-utils.ts              # Export calendrier
│
├── CHANGELOG.md                      # Historique des versions
├── STRUCTURE.md                      # Ce fichier
├── TODO.md                           # Roadmap d'implémentation
├── ABOUT.md                          # À propos du projet
│
├── index.html                        # HTML racine
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```
