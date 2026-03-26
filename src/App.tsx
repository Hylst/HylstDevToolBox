import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { ClipboardProvider } from "./contexts/ClipboardContext";
import { CommandPalette } from "./components/CommandPalette";
import { ClipboardModal } from "./components/ClipboardModal";
import { PresentationProvider, usePresentation } from "./contexts/PresentationContext";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import { MusicPlayerModal } from "./components/MusicPlayerModal";

import { ToolSkeleton } from "./components/ToolSkeleton";
import { ToolRouteShell } from "./components/ToolRouteShell";
import Index from "./pages/Index";

// Lazy-loaded tool pages
const MarkdownEditor = lazy(() => import("./pages/tools/MarkdownEditor"));
const RegexTester = lazy(() => import("./pages/tools/RegexTester"));
const ColorPicker = lazy(() => import("./pages/tools/ColorPicker"));
const PasswordGenerator = lazy(() => import("./pages/tools/PasswordGenerator"));
const HashCalculator = lazy(() => import("./pages/tools/HashCalculator"));
const JsonValidator = lazy(() => import("./pages/tools/JsonValidator"));
const Converters = lazy(() => import("./pages/tools/Converters"));
const Cheatsheets = lazy(() => import("./pages/tools/Cheatsheets"));
const DiffViewer = lazy(() => import("./pages/tools/DiffViewer"));
const TextAnalyzer = lazy(() => import("./pages/tools/TextAnalyzer"));
const TextFormatter = lazy(() => import("./pages/tools/TextFormatter"));
const DataExtractor = lazy(() => import("./pages/tools/DataExtractor"));
const SqlFormatter = lazy(() => import("./pages/tools/SqlFormatter"));
const Base64Tool = lazy(() => import("./pages/tools/Base64Tool"));
const JwtDecoder = lazy(() => import("./pages/tools/JwtDecoder"));
const ApiTester = lazy(() => import("./pages/tools/ApiTester"));
const XmlFormatter = lazy(() => import("./pages/tools/XmlFormatter"));
const CodeMinifier = lazy(() => import("./pages/tools/CodeMinifier"));
const GraphQLTester = lazy(() => import("./pages/tools/GraphQLTester"));
const WebSocketTester = lazy(() => import("./pages/tools/WebSocketTester"));
const CronBuilder = lazy(() => import("./pages/tools/CronBuilder"));
const LoremGenerator = lazy(() => import("./pages/tools/LoremGenerator"));
const TextCleaner = lazy(() => import("./pages/tools/TextCleaner"));
const FormatConverter = lazy(() => import("./pages/tools/FormatConverter"));
const DateCalculator = lazy(() => import("./pages/tools/DateCalculator"));
const DateFormats = lazy(() => import("./pages/tools/DateFormats"));
const DateInspector = lazy(() => import("./pages/tools/DateInspector"));
const DateTimelines = lazy(() => import("./pages/tools/DateTimelines"));
const DateCalendars = lazy(() => import("./pages/tools/DateCalendars"));
const DateReference = lazy(() => import("./pages/tools/DateReference"));
const DateToolbox = lazy(() => import("./pages/tools/DateToolbox"));
const GradientGenerator = lazy(() => import("./pages/tools/GradientGenerator"));
const BoxShadowGenerator = lazy(() => import("./pages/tools/BoxShadowGenerator"));
const BorderRadiusGenerator = lazy(() => import("./pages/tools/BorderRadiusGenerator"));
const TextShadowGenerator = lazy(() => import("./pages/tools/TextShadowGenerator"));
const CSSAnimationGenerator = lazy(() => import("./pages/tools/CSSAnimationGenerator"));
const SVGIconBrowser = lazy(() => import("./pages/tools/SVGIconBrowser"));
const SpacingCalculator = lazy(() => import("./pages/tools/SpacingCalculator"));
const UuidGenerator = lazy(() => import("./pages/tools/UuidGenerator"));
const QrCodeGenerator = lazy(() => import("./pages/tools/QrCodeGenerator"));
const UnixPermissions = lazy(() => import("./pages/tools/UnixPermissions"));
const NumberBaseConverter = lazy(() => import("./pages/tools/NumberBaseConverter"));
const UrlParser = lazy(() => import("./pages/tools/UrlParser"));
const EnvParser = lazy(() => import("./pages/tools/EnvParser"));
const DataGenerator = lazy(() => import("./pages/tools/DataGenerator"));
const SchemaGenerator = lazy(() => import("./pages/tools/SchemaGenerator"));
const FakerPlayground = lazy(() => import("./pages/tools/FakerPlayground"));
const SqlQueryBuilder = lazy(() => import("./pages/tools/SqlQueryBuilder"));
const ApiMockerPro = lazy(() => import("./pages/tools/ApiMockerPro"));
const DbSchemaDesigner = lazy(() => import("./pages/tools/DbSchemaDesigner"));
const HttpHeadersAnalyzer = lazy(() => import("./pages/tools/HttpHeadersAnalyzer"));
const Glossary = lazy(() => import("./pages/tools/Glossary"));
const PersonalNotes = lazy(() => import("./pages/tools/PersonalNotes"));
const SnippetsLibrary = lazy(() => import("./pages/tools/SnippetsLibrary"));
const KeyboardShortcuts = lazy(() => import("./pages/tools/KeyboardShortcuts"));
const QuickReference = lazy(() => import("./pages/tools/QuickReference"));
const AsciiUnicode = lazy(() => import("./pages/tools/AsciiUnicode"));
const DesignTokens = lazy(() => import("./pages/tools/DesignTokens"));
const BestPractices = lazy(() => import("./pages/tools/BestPractices"));
const AlgorithmsVisualizer = lazy(() => import("./pages/tools/AlgorithmsVisualizer"));
const FlexboxPlayground = lazy(() => import("./pages/tools/FlexboxPlayground"));
const GridGenerator = lazy(() => import("./pages/tools/GridGenerator"));
const ContrastChecker = lazy(() => import("./pages/tools/ContrastChecker"));
const CSSFormatter = lazy(() => import("./pages/tools/CSSFormatter"));
const EscapeTool = lazy(() => import("./pages/tools/EscapeTool"));
const MetaTagsGenerator = lazy(() => import("./pages/tools/MetaTagsGenerator"));
const SlugGenerator = lazy(() => import("./pages/tools/SlugGenerator"));
const TimezoneConverter = lazy(() => import("./pages/tools/TimezoneConverter"));
const CSVViewer = lazy(() => import("./pages/tools/CSVViewer"));
const HttpStatusCodes = lazy(() => import("./pages/tools/HttpStatusCodes"));
const HtmlMarkdownConverter = lazy(() => import("./pages/tools/HtmlMarkdownConverter"));
const TextCaseConverter = lazy(() => import("./pages/tools/TextCaseConverter"));
const AstExplorer = lazy(() => import("./pages/tools/AstExplorer"));
const ChangelogGenerator = lazy(() => import("./pages/tools/ChangelogGenerator"));
const PackageAnalyzer = lazy(() => import("./pages/tools/PackageAnalyzer"));
const FontPairingTool = lazy(() => import("./pages/tools/FontPairingTool"));
const ResponsivePreview = lazy(() => import("./pages/tools/ResponsivePreview"));
const TimestampConverter = lazy(() => import("./pages/tools/TimestampConverter"));
const IpAnalyzer = lazy(() => import("./pages/tools/IpAnalyzer"));
const BarcodeGenerator = lazy(() => import("./pages/tools/BarcodeGenerator"));
const CountdownTimer = lazy(() => import("./pages/tools/CountdownTimer"));
const OpenApiDesigner = lazy(() => import("./pages/tools/OpenApiDesigner"));
const JsonPathExplorer = lazy(() => import("./pages/tools/JsonPathExplorer"));
const DataAnonymizer = lazy(() => import("./pages/tools/DataAnonymizer"));
const InterviewQuestions = lazy(() => import("./pages/tools/InterviewQuestions"));
const ErrorReference = lazy(() => import("./pages/tools/ErrorReference"));
const PromptEngineer = lazy(() => import("./pages/tools/PromptEngineer"));
const TomlEditor = lazy(() => import("./pages/tools/TomlEditor"));
const TestDataMatcher = lazy(() => import("./pages/tools/TestDataMatcher"));
const BundleSizeAnalyzer = lazy(() => import("./pages/tools/BundleSizeAnalyzer"));
const CssSpecificity = lazy(() => import("./pages/tools/CssSpecificity"));
const GitCommitGenerator = lazy(() => import("./pages/tools/GitCommitGenerator"));
const A11yChecklist = lazy(() => import("./pages/tools/A11yChecklist"));
const MermaidEditor = lazy(() => import("./pages/tools/MermaidEditor"));
const GlassmorphismGenerator = lazy(() => import("./pages/tools/GlassmorphismGenerator"));
const GitignoreBuilder = lazy(() => import("./pages/tools/GitignoreBuilder"));
const FaviconGenerator = lazy(() => import("./pages/tools/FaviconGenerator"));
const TailwindCssConverter = lazy(() => import("./pages/tools/TailwindCssConverter"));
const ClipPathEditor = lazy(() => import("./pages/tools/ClipPathEditor"));
const DependencyGraph = lazy(() => import("./pages/tools/DependencyGraph"));
const GraphQLSchemaBuilder = lazy(() => import("./pages/tools/GraphQLSchemaBuilder"));
const SeedDataGenerator = lazy(() => import("./pages/tools/SeedDataGenerator"));
const ColorPaletteGenerator = lazy(() => import("./pages/tools/ColorPaletteGenerator"));
const CssFilterEditor = lazy(() => import("./pages/tools/CssFilterEditor"));
const CharacterEncoding = lazy(() => import("./pages/tools/CharacterEncoding"));
const DockerComposeBuilder = lazy(() => import("./pages/tools/DockerComposeBuilder"));
const SpecialCharacters = lazy(() => import("./pages/tools/SpecialCharacters"));
const RegexCheatsheet = lazy(() => import("./pages/tools/RegexCheatsheet"));
const CssSelectorReference = lazy(() => import("./pages/tools/CssSelectorReference"));
const GitCheatsheet = lazy(() => import("./pages/tools/GitCheatsheet"));
const PrismaSchemaBuilder = lazy(() => import("./pages/tools/PrismaSchemaBuilder"));
const TypographyScale = lazy(() => import("./pages/tools/TypographyScale"));
const CssVariablesGenerator = lazy(() => import("./pages/tools/CssVariablesGenerator"));
const RobotsTxtBuilder = lazy(() => import("./pages/tools/RobotsTxtBuilder"));
const ArchitecturePatterns = lazy(() => import("./pages/tools/ArchitecturePatterns"));
const SecurityCheatsheet = lazy(() => import("./pages/tools/SecurityCheatsheet"));
const WordCounterPro = lazy(() => import("./pages/tools/WordCounterPro"));
const WebhookTester = lazy(() => import("./pages/tools/WebhookTester"));
const NpmCompare = lazy(() => import("./pages/tools/NpmCompare"));
const ServerConfigGenerator = lazy(() => import("./pages/tools/ServerConfigGenerator"));
const SqlPrismaConverter = lazy(() => import("./pages/tools/SqlPrismaConverter"));
const ApiDocsGenerator = lazy(() => import("./pages/tools/ApiDocsGenerator"));
const CodeFormatter = lazy(() => import("./pages/tools/CodeFormatter"));
const ReadmeGenerator = lazy(() => import("./pages/tools/ReadmeGenerator"));
const TableGenerator = lazy(() => import("./pages/tools/TableGenerator"));
const LinuxCommands = lazy(() => import("./pages/tools/LinuxCommands"));
const TotpGenerator = lazy(() => import("./pages/tools/TotpGenerator"));
const TailwindPlayground = lazy(() => import("./pages/tools/TailwindPlayground"));
const SqlPlayground = lazy(() => import("./pages/tools/SqlPlayground"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const Loading = () => <ToolSkeleton />;

const LayoutManager = () => {
  // On récupère l'état global du mode « Présentation »
  // Si vrai, on cache la Sidebar et le Header pour maximiser l'espace (idéal pour les cheatsheets)
  const { isPresenting } = usePresentation();

  return (
    <div className="flex min-h-screen w-full">
      {/* Affichage de la barre latérale (Sidebar) uniquement en mode classique */}
      {!isPresenting && <AppSidebar />}
      
      <div className="flex-1 flex flex-col">
        {/* Pareil pour l'en-tête (Header), on le masque en mode présentation */}
        {!isPresenting && <Header />}
        
        {/* Contenu principal de l'application. On ajuste le padding (pt-16) selon la présence du Header */}
        <main className={`flex-1 ${isPresenting ? 'pt-0' : 'pt-16'}`}>
          <Suspense fallback={<Loading />}>
            <Routes>
                  <Route path="/" element={<Index />} />
                  <Route element={<ToolRouteShell />}>
                    <Route path="/markdown" element={<MarkdownEditor />} />
                    <Route path="/regex" element={<RegexTester />} />
                    <Route path="/colors" element={<ColorPicker />} />
                    <Route path="/password" element={<PasswordGenerator />} />
                    <Route path="/hash" element={<HashCalculator />} />
                    <Route path="/json" element={<JsonValidator />} />
                    <Route path="/converters" element={<Converters />} />
                    <Route path="/cheatsheets" element={<Cheatsheets />} />
                    <Route path="/diff" element={<DiffViewer />} />
                    <Route path="/text-analyzer" element={<TextAnalyzer />} />
                    <Route path="/text-formatter" element={<TextFormatter />} />
                    <Route path="/data-extractor" element={<DataExtractor />} />
                    <Route path="/lorem" element={<LoremGenerator />} />
                    <Route path="/text-cleaner" element={<TextCleaner />} />
                    <Route path="/format-converter" element={<FormatConverter />} />
                    <Route path="/sql" element={<SqlFormatter />} />
                    <Route path="/base64" element={<Base64Tool />} />
                    <Route path="/jwt" element={<JwtDecoder />} />
                    <Route path="/api-tester" element={<ApiTester />} />
                    <Route path="/xml" element={<XmlFormatter />} />
                    <Route path="/code-minifier" element={<CodeMinifier />} />
                    <Route path="/graphql" element={<GraphQLTester />} />
                    <Route path="/websocket" element={<WebSocketTester />} />
                    <Route path="/cron" element={<CronBuilder />} />
                    <Route path="/date-calculator" element={<DateCalculator />} />
                    <Route path="/date-formats" element={<DateFormats />} />
                    <Route path="/date-inspector" element={<DateInspector />} />
                    <Route path="/timelines" element={<DateTimelines />} />
                    <Route path="/calendars" element={<DateCalendars />} />
                    <Route path="/date-reference" element={<DateReference />} />
                    <Route path="/date-toolbox" element={<DateToolbox />} />
                    <Route path="/gradients" element={<GradientGenerator />} />
                    <Route path="/box-shadow" element={<BoxShadowGenerator />} />
                    <Route path="/border-radius" element={<BorderRadiusGenerator />} />
                    <Route path="/text-shadow" element={<TextShadowGenerator />} />
                    <Route path="/css-animations" element={<CSSAnimationGenerator />} />
                    <Route path="/svg-icons" element={<SVGIconBrowser />} />
                    <Route path="/spacing" element={<SpacingCalculator />} />
                    <Route path="/uuid" element={<UuidGenerator />} />
                    <Route path="/qrcode" element={<QrCodeGenerator />} />
                    <Route path="/unix-permissions" element={<UnixPermissions />} />
                    <Route path="/number-base" element={<NumberBaseConverter />} />
                    <Route path="/url-parser" element={<UrlParser />} />
                    <Route path="/env-parser" element={<EnvParser />} />
                    <Route path="/data-generator" element={<DataGenerator />} />
                    <Route path="/schema-generator" element={<SchemaGenerator />} />
                    <Route path="/faker-playground" element={<FakerPlayground />} />
                    <Route path="/sql-builder" element={<SqlQueryBuilder />} />
                    <Route path="/mock-api" element={<ApiMockerPro />} />
                    <Route path="/db-designer" element={<DbSchemaDesigner />} />
                    <Route path="/http-headers" element={<HttpHeadersAnalyzer />} />
                    <Route path="/glossary" element={<Glossary />} />
                    <Route path="/notes" element={<PersonalNotes />} />
                    <Route path="/snippets" element={<SnippetsLibrary />} />
                    <Route path="/shortcuts" element={<KeyboardShortcuts />} />
                    <Route path="/quick-reference" element={<QuickReference />} />
                    <Route path="/ascii" element={<AsciiUnicode />} />
                    <Route path="/design-tokens" element={<DesignTokens />} />
                    <Route path="/best-practices" element={<BestPractices />} />
                    <Route path="/algorithms" element={<AlgorithmsVisualizer />} />
                    <Route path="/flexbox" element={<FlexboxPlayground />} />
                    <Route path="/grid" element={<GridGenerator />} />
                    <Route path="/contrast" element={<ContrastChecker />} />
                    <Route path="/css-formatter" element={<CSSFormatter />} />
                    <Route path="/escape" element={<EscapeTool />} />
                    <Route path="/meta-tags" element={<MetaTagsGenerator />} />
                    <Route path="/slug" element={<SlugGenerator />} />
                    <Route path="/timezone" element={<TimezoneConverter />} />
                    <Route path="/csv" element={<CSVViewer />} />
                    <Route path="/http-status" element={<HttpStatusCodes />} />
                    <Route path="/html-md" element={<HtmlMarkdownConverter />} />
                    <Route path="/text-case" element={<TextCaseConverter />} />
                    <Route path="/ast" element={<AstExplorer />} />
                    <Route path="/changelog" element={<ChangelogGenerator />} />
                    <Route path="/package-analyzer" element={<PackageAnalyzer />} />
                    <Route path="/font-pairing" element={<FontPairingTool />} />
                    <Route path="/responsive-preview" element={<ResponsivePreview />} />
                    <Route path="/timestamp" element={<TimestampConverter />} />
                    <Route path="/ip-analyzer" element={<IpAnalyzer />} />
                    <Route path="/barcode" element={<BarcodeGenerator />} />
                    <Route path="/countdown" element={<CountdownTimer />} />
                    <Route path="/openapi-designer" element={<OpenApiDesigner />} />
                    <Route path="/jsonpath" element={<JsonPathExplorer />} />
                    <Route path="/anonymize" element={<DataAnonymizer />} />
                    <Route path="/interview" element={<InterviewQuestions />} />
                    <Route path="/errors" element={<ErrorReference />} />
                    <Route path="/prompt-engineer" element={<PromptEngineer />} />
                    <Route path="/toml-editor" element={<TomlEditor />} />
                    <Route path="/test-matcher" element={<TestDataMatcher />} />
                    <Route path="/bundle-analyzer" element={<BundleSizeAnalyzer />} />
                    <Route path="/css-specificity" element={<CssSpecificity />} />
                    <Route path="/git-commit" element={<GitCommitGenerator />} />
                    <Route path="/a11y-checklist" element={<A11yChecklist />} />
                    <Route path="/mermaid-editor" element={<MermaidEditor />} />
                    <Route path="/glassmorphism" element={<GlassmorphismGenerator />} />
                    <Route path="/gitignore" element={<GitignoreBuilder />} />
                    <Route path="/favicon" element={<FaviconGenerator />} />
                    <Route path="/tailwind-css" element={<TailwindCssConverter />} />
                    <Route path="/clip-path" element={<ClipPathEditor />} />
                    <Route path="/dep-graph" element={<DependencyGraph />} />
                    <Route path="/graphql-builder" element={<GraphQLSchemaBuilder />} />
                    <Route path="/seed-data" element={<SeedDataGenerator />} />
                    <Route path="/color-palette" element={<ColorPaletteGenerator />} />
                    <Route path="/css-filter" element={<CssFilterEditor />} />
                    <Route path="/char-encoding" element={<CharacterEncoding />} />
                    <Route path="/docker-compose" element={<DockerComposeBuilder />} />
                    <Route path="/special-chars" element={<SpecialCharacters />} />
                    <Route path="/regex-cheatsheet" element={<RegexCheatsheet />} />
                    <Route path="/css-selectors" element={<CssSelectorReference />} />
                    <Route path="/git-cheatsheet" element={<GitCheatsheet />} />
                    <Route path="/prisma-builder" element={<PrismaSchemaBuilder />} />
                    <Route path="/type-scale" element={<TypographyScale />} />
                    <Route path="/css-variables" element={<CssVariablesGenerator />} />
                    <Route path="/robots-builder" element={<RobotsTxtBuilder />} />
                    <Route path="/architecture" element={<ArchitecturePatterns />} />
                    <Route path="/security-cheatsheet" element={<SecurityCheatsheet />} />
                    <Route path="/word-counter" element={<WordCounterPro />} />
                    <Route path="/webhook-tester" element={<WebhookTester />} />
                    <Route path="/npm-compare" element={<NpmCompare />} />
                    <Route path="/server-config" element={<ServerConfigGenerator />} />
                    <Route path="/sql-prisma" element={<SqlPrismaConverter />} />
                    <Route path="/api-docs" element={<ApiDocsGenerator />} />
                    <Route path="/code-formatter" element={<CodeFormatter />} />
                    <Route path="/readme-generator" element={<ReadmeGenerator />} />
                    <Route path="/table-generator" element={<TableGenerator />} />
                    <Route path="/linux-commands" element={<LinuxCommands />} />
                    <Route path="/totp-generator" element={<TotpGenerator />} />
                    <Route path="/tailwind-playground" element={<TailwindPlayground />} />
                    <Route path="/sql-playground" element={<SqlPlayground />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MusicPlayerProvider>
      <FavoritesProvider>
        <PresentationProvider>
          <ClipboardProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ClipboardModal />
              <MusicPlayerModal />
              {/* 
              Le BrowserRouter gère la navigation côté client.
              On injecte le basename (ex: '/hdtb/') défini dans vite.config.ts 
              pour éviter les erreurs 404 au chargement initial.
            */}
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <SidebarProvider>
                  <CommandPalette />
                  <LayoutManager />
                </SidebarProvider>
              </BrowserRouter>
            </TooltipProvider>
          </ClipboardProvider>
        </PresentationProvider>
      </FavoritesProvider>
    </MusicPlayerProvider>
  </QueryClientProvider>
);

export default App;
