import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Search, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ReferenceItem {
  code: string;
  name: string;
  description: string;
  category?: string;
}

const httpCodes: ReferenceItem[] = [
  { code: "100", name: "Continue", description: "Le serveur a reçu les en-têtes", category: "1xx Informational" },
  { code: "101", name: "Switching Protocols", description: "Le serveur accepte de changer de protocole", category: "1xx Informational" },
  { code: "200", name: "OK", description: "Requête réussie", category: "2xx Success" },
  { code: "201", name: "Created", description: "Ressource créée avec succès", category: "2xx Success" },
  { code: "204", name: "No Content", description: "Succès mais pas de contenu", category: "2xx Success" },
  { code: "301", name: "Moved Permanently", description: "Ressource déplacée définitivement", category: "3xx Redirection" },
  { code: "302", name: "Found", description: "Redirection temporaire", category: "3xx Redirection" },
  { code: "304", name: "Not Modified", description: "Ressource non modifiée (cache valide)", category: "3xx Redirection" },
  { code: "400", name: "Bad Request", description: "Requête malformée ou invalide", category: "4xx Client Error" },
  { code: "401", name: "Unauthorized", description: "Authentification requise", category: "4xx Client Error" },
  { code: "403", name: "Forbidden", description: "Accès refusé", category: "4xx Client Error" },
  { code: "404", name: "Not Found", description: "Ressource introuvable", category: "4xx Client Error" },
  { code: "405", name: "Method Not Allowed", description: "Méthode HTTP non autorisée", category: "4xx Client Error" },
  { code: "409", name: "Conflict", description: "Conflit avec l'état actuel", category: "4xx Client Error" },
  { code: "422", name: "Unprocessable Entity", description: "Entité non traitable (validation)", category: "4xx Client Error" },
  { code: "429", name: "Too Many Requests", description: "Rate limiting", category: "4xx Client Error" },
  { code: "500", name: "Internal Server Error", description: "Erreur interne du serveur", category: "5xx Server Error" },
  { code: "502", name: "Bad Gateway", description: "Mauvaise réponse du serveur amont", category: "5xx Server Error" },
  { code: "503", name: "Service Unavailable", description: "Service temporairement indisponible", category: "5xx Server Error" },
  { code: "504", name: "Gateway Timeout", description: "Délai dépassé du serveur amont", category: "5xx Server Error" },
];

const commonPorts: ReferenceItem[] = [
  { code: "22", name: "SSH", description: "Secure Shell", category: "Remote Access" },
  { code: "25", name: "SMTP", description: "Envoi d'emails", category: "Email" },
  { code: "53", name: "DNS", description: "Domain Name System", category: "Network" },
  { code: "80", name: "HTTP", description: "Web non sécurisé", category: "Web" },
  { code: "443", name: "HTTPS", description: "Web sécurisé (SSL/TLS)", category: "Web" },
  { code: "3000", name: "Node.js/React Dev", description: "Serveur de développement", category: "Development" },
  { code: "3306", name: "MySQL", description: "Base de données MySQL", category: "Database" },
  { code: "5432", name: "PostgreSQL", description: "Base de données PostgreSQL", category: "Database" },
  { code: "5173", name: "Vite Dev", description: "Serveur Vite", category: "Development" },
  { code: "6379", name: "Redis", description: "Cache/Store Redis", category: "Database" },
  { code: "8080", name: "HTTP Alternate", description: "Proxy/serveur alternatif", category: "Web" },
  { code: "27017", name: "MongoDB", description: "Base de données MongoDB", category: "Database" },
];

const mimeTypes: ReferenceItem[] = [
  { code: "text/html", name: "HTML", description: ".html, .htm", category: "Text" },
  { code: "text/css", name: "CSS", description: ".css", category: "Text" },
  { code: "text/javascript", name: "JavaScript", description: ".js, .mjs", category: "Text" },
  { code: "application/json", name: "JSON", description: ".json", category: "Application" },
  { code: "application/pdf", name: "PDF", description: ".pdf", category: "Application" },
  { code: "application/zip", name: "ZIP", description: ".zip", category: "Application" },
  { code: "multipart/form-data", name: "Form Data", description: "Upload de fichiers", category: "Multipart" },
  { code: "image/jpeg", name: "JPEG", description: ".jpg, .jpeg", category: "Image" },
  { code: "image/png", name: "PNG", description: ".png", category: "Image" },
  { code: "image/svg+xml", name: "SVG", description: ".svg", category: "Image" },
  { code: "image/webp", name: "WebP", description: ".webp", category: "Image" },
  { code: "font/woff2", name: "WOFF2", description: ".woff2", category: "Font" },
];

const exitCodes: ReferenceItem[] = [
  { code: "0", name: "Success", description: "Exécution réussie", category: "Standard" },
  { code: "1", name: "General Error", description: "Erreur générale", category: "Standard" },
  { code: "2", name: "Misuse of Shell", description: "Mauvais usage de commande", category: "Standard" },
  { code: "126", name: "Cannot Execute", description: "Commande non exécutable", category: "Shell" },
  { code: "127", name: "Command Not Found", description: "Commande introuvable", category: "Shell" },
  { code: "130", name: "SIGINT (Ctrl+C)", description: "Interruption utilisateur", category: "Signals" },
  { code: "137", name: "SIGKILL", description: "Processus tué (kill -9)", category: "Signals" },
  { code: "143", name: "SIGTERM", description: "Terminaison demandée", category: "Signals" },
];

const httpHeaders: ReferenceItem[] = [
  { code: "Accept", name: "Accept", description: "Types MIME acceptés", category: "Request" },
  { code: "Authorization", name: "Authorization", description: "Credentials d'authentification", category: "Request" },
  { code: "Content-Type", name: "Content-Type", description: "Type MIME du corps", category: "Request/Response" },
  { code: "Cookie", name: "Cookie", description: "Cookies envoyés au serveur", category: "Request" },
  { code: "Cache-Control", name: "Cache-Control", description: "Directives de mise en cache", category: "Response" },
  { code: "Set-Cookie", name: "Set-Cookie", description: "Définir un cookie", category: "Response" },
  { code: "Access-Control-Allow-Origin", name: "CORS Allow Origin", description: "Origines autorisées (CORS)", category: "Security" },
  { code: "Content-Security-Policy", name: "CSP", description: "Politique de sécurité du contenu", category: "Security" },
  { code: "Strict-Transport-Security", name: "HSTS", description: "Forcer HTTPS", category: "Security" },
];

const regexPatterns: ReferenceItem[] = [
  { code: "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$", name: "Email", description: "Adresse email valide", category: "Validation" },
  { code: "^https?:\\/\\/[\\w.-]+(?:\\.[a-zA-Z]{2,})(?:\\/[^\\s]*)?$", name: "URL", description: "URL HTTP(S)", category: "Validation" },
  { code: "^(?:\\+33|0)[1-9](?:[0-9]{2}){4}$", name: "Téléphone FR", description: "Numéro français", category: "Validation" },
  { code: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)$", name: "IPv4", description: "Adresse IPv4", category: "Réseau" },
  { code: "^\\d{4}-\\d{2}-\\d{2}$", name: "Date ISO", description: "Format YYYY-MM-DD", category: "Date/Heure" },
  { code: "^4[0-9]{12}(?:[0-9]{3})?$", name: "Visa", description: "Numéro de carte Visa", category: "Paiement" },
  { code: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", name: "Mot de passe fort", description: "Min 8 chars, maj, min, chiffre, spécial", category: "Sécurité" },
  { code: "^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$", name: "UUID", description: "Format UUID v1-5", category: "Identifiants" },
  { code: "^#(?:[0-9a-fA-F]{3}){1,2}$", name: "Couleur Hex", description: "Code couleur hexadécimal", category: "Design" },
];

const cronExpressions: ReferenceItem[] = [
  { code: "* * * * *", name: "Chaque minute", description: "Exécution toutes les minutes", category: "Fréquent" },
  { code: "*/5 * * * *", name: "Toutes les 5 min", description: "Toutes les 5 minutes", category: "Fréquent" },
  { code: "0 * * * *", name: "Chaque heure", description: "À chaque heure pile", category: "Fréquent" },
  { code: "0 0 * * *", name: "Chaque jour minuit", description: "À minuit chaque jour", category: "Quotidien" },
  { code: "0 0 * * 1-5", name: "Jours ouvrés", description: "Lundi au vendredi à minuit", category: "Hebdomadaire" },
  { code: "0 0 1 * *", name: "1er du mois", description: "Premier jour de chaque mois", category: "Mensuel" },
  { code: "@reboot", name: "Au démarrage", description: "Exécution au redémarrage", category: "Spécial" },
  { code: "@daily", name: "@daily", description: "Équivalent à 0 0 * * *", category: "Spécial" },
  { code: "@weekly", name: "@weekly", description: "Équivalent à 0 0 * * 0", category: "Spécial" },
];

const envVariables: ReferenceItem[] = [
  { code: "NODE_ENV", name: "Node Environment", description: "Environnement d'exécution : development, production, test", category: "Node.js" },
  { code: "PORT", name: "Port", description: "Port d'écoute du serveur (défaut: 3000)", category: "Node.js" },
  { code: "DATABASE_URL", name: "Database URL", description: "Chaîne de connexion à la base de données (postgres://user:pass@host:port/db)", category: "Database" },
  { code: "REDIS_URL", name: "Redis URL", description: "URL de connexion Redis (redis://host:6379)", category: "Database" },
  { code: "API_KEY", name: "API Key", description: "Clé d'API pour authentification aux services externes", category: "Auth & Secrets" },
  { code: "JWT_SECRET", name: "JWT Secret", description: "Secret pour signer les JSON Web Tokens", category: "Auth & Secrets" },
  { code: "SESSION_SECRET", name: "Session Secret", description: "Secret pour signer les cookies de session", category: "Auth & Secrets" },
  { code: "NEXT_PUBLIC_*", name: "Next.js Public", description: "Variables exposées côté client dans Next.js (préfixe obligatoire)", category: "Frameworks" },
  { code: "VITE_*", name: "Vite Public", description: "Variables exposées côté client dans Vite (préfixe obligatoire)", category: "Frameworks" },
  { code: "REACT_APP_*", name: "CRA Public", description: "Variables exposées dans Create React App (préfixe obligatoire)", category: "Frameworks" },
  { code: "AWS_ACCESS_KEY_ID", name: "AWS Access Key", description: "Identifiant d'accès AWS", category: "Cloud" },
  { code: "AWS_SECRET_ACCESS_KEY", name: "AWS Secret Key", description: "Clé secrète AWS", category: "Cloud" },
  { code: "AWS_REGION", name: "AWS Region", description: "Région AWS (ex: eu-west-1, us-east-1)", category: "Cloud" },
  { code: "SUPABASE_URL", name: "Supabase URL", description: "URL du projet Supabase", category: "Cloud" },
  { code: "SUPABASE_ANON_KEY", name: "Supabase Anon Key", description: "Clé anonyme publique Supabase", category: "Cloud" },
  { code: "STRIPE_SECRET_KEY", name: "Stripe Secret", description: "Clé secrète Stripe (sk_live_* ou sk_test_*)", category: "Paiement" },
  { code: "STRIPE_PUBLISHABLE_KEY", name: "Stripe Publishable", description: "Clé publique Stripe (pk_live_* ou pk_test_*)", category: "Paiement" },
  { code: "SMTP_HOST", name: "SMTP Host", description: "Serveur SMTP pour l'envoi d'emails", category: "Email" },
  { code: "SMTP_PORT", name: "SMTP Port", description: "Port SMTP (587 pour TLS, 465 pour SSL)", category: "Email" },
  { code: "SMTP_USER", name: "SMTP User", description: "Utilisateur SMTP", category: "Email" },
  { code: "LOG_LEVEL", name: "Log Level", description: "Niveau de log : debug, info, warn, error", category: "Config" },
  { code: "TZ", name: "Timezone", description: "Fuseau horaire du serveur (ex: Europe/Paris)", category: "Config" },
  { code: "CI", name: "CI", description: "Indique l'exécution dans un environnement CI (true en CI)", category: "CI/CD" },
];

export default function QuickReference() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copié !", description: `"${code}" copié dans le presse-papier` });
  };

  const filterItems = (items: ReferenceItem[]) => {
    if (!search) return items;
    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    );
  };

  const ReferenceTable = ({ items, codeLabel = "Code" }: { items: ReferenceItem[]; codeLabel?: string }) => {
    const filtered = filterItems(items);
    const categories = [...new Set(filtered.map((i) => i.category).filter(Boolean))];

    return (
      <ScrollArea className="h-[calc(100vh-350px)]">
        {categories.map((category) => (
          <div key={category} className="mb-6">
            <h3 className="font-semibold mb-2 text-muted-foreground">{category}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">{codeLabel}</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.filter((i) => i.category === category).map((item) => (
                  <TableRow key={item.code}>
                    <TableCell><Badge variant="secondary" className="font-mono">{item.code}</Badge></TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.description}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => copyCode(item.code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </ScrollArea>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Quick Reference
        </h1>
        <p className="text-muted-foreground">
          Référence rapide : codes HTTP, ports, MIME types, regex, cron, variables d'environnement
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Tabs defaultValue="http" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="http">HTTP Codes</TabsTrigger>
          <TabsTrigger value="ports">Ports</TabsTrigger>
          <TabsTrigger value="mime">MIME Types</TabsTrigger>
          <TabsTrigger value="headers">HTTP Headers</TabsTrigger>
          <TabsTrigger value="exit">Exit Codes</TabsTrigger>
          <TabsTrigger value="regex">Regex Patterns</TabsTrigger>
          <TabsTrigger value="cron">Cron</TabsTrigger>
          <TabsTrigger value="env">Variables d'env</TabsTrigger>
        </TabsList>

        <TabsContent value="http">
          <Card><CardHeader><CardTitle>Codes de statut HTTP</CardTitle><CardDescription>Codes de réponse HTTP standard</CardDescription></CardHeader>
          <CardContent><ReferenceTable items={httpCodes} codeLabel="Code" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="ports">
          <Card><CardHeader><CardTitle>Ports réseau standards</CardTitle><CardDescription>Ports TCP/UDP courants</CardDescription></CardHeader>
          <CardContent><ReferenceTable items={commonPorts} codeLabel="Port" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="mime">
          <Card><CardHeader><CardTitle>Types MIME</CardTitle><CardDescription>Content-Type pour les ressources web</CardDescription></CardHeader>
          <CardContent><ReferenceTable items={mimeTypes} codeLabel="MIME Type" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="headers">
          <Card><CardHeader><CardTitle>En-têtes HTTP</CardTitle><CardDescription>Headers courants</CardDescription></CardHeader>
          <CardContent><ReferenceTable items={httpHeaders} codeLabel="Header" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="exit">
          <Card><CardHeader><CardTitle>Codes de sortie</CardTitle><CardDescription>Exit codes Unix/Linux</CardDescription></CardHeader>
          <CardContent><ReferenceTable items={exitCodes} codeLabel="Code" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="regex">
          <Card><CardHeader><CardTitle>Patterns Regex</CardTitle><CardDescription>Expressions régulières courantes</CardDescription></CardHeader>
          <CardContent><ReferenceTable items={regexPatterns} codeLabel="Pattern" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="cron">
          <Card><CardHeader><CardTitle>Expressions Cron</CardTitle><CardDescription>Syntaxe cron pour la planification</CardDescription></CardHeader>
          <CardContent><ReferenceTable items={cronExpressions} codeLabel="Expression" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="env">
          <Card>
            <CardHeader>
              <CardTitle>Variables d'environnement</CardTitle>
              <CardDescription>Variables courantes pour la configuration d'applications</CardDescription>
            </CardHeader>
            <CardContent>
              <ReferenceTable items={envVariables} codeLabel="Variable" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
