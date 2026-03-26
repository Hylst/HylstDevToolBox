import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Info, CheckCircle, ArrowRight, AlertTriangle, XCircle, Server } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HttpStatus {
  code: number;
  name: string;
  description: string;
  details: string;
  common?: boolean;
}

const httpStatusCodes: HttpStatus[] = [
  // 1xx Informational
  { code: 100, name: "Continue", description: "Le serveur a reçu les en-têtes de requête", details: "Le client peut continuer à envoyer le corps de la requête." },
  { code: 101, name: "Switching Protocols", description: "Le serveur accepte de changer de protocole", details: "Utilisé pour WebSocket ou HTTP/2 upgrade." },
  { code: 102, name: "Processing", description: "Le serveur traite la requête", details: "WebDAV. Évite le timeout côté client." },
  { code: 103, name: "Early Hints", description: "Envoi précoce d'en-têtes", details: "Permet au client de précharger des ressources." },

  // 2xx Success
  { code: 200, name: "OK", description: "La requête a réussi", details: "Réponse standard pour les requêtes HTTP réussies.", common: true },
  { code: 201, name: "Created", description: "Ressource créée avec succès", details: "Typiquement retourné après un POST réussi.", common: true },
  { code: 202, name: "Accepted", description: "Requête acceptée pour traitement", details: "Le traitement n'est pas encore terminé." },
  { code: 203, name: "Non-Authoritative Information", description: "Informations transformées par un proxy", details: "La réponse provient d'une copie locale ou tierce." },
  { code: 204, name: "No Content", description: "Succès sans contenu à retourner", details: "Utilisé pour DELETE ou PUT sans body de réponse.", common: true },
  { code: 205, name: "Reset Content", description: "Réinitialiser la vue du document", details: "Le client doit réinitialiser la vue du document." },
  { code: 206, name: "Partial Content", description: "Contenu partiel retourné", details: "Utilisé avec l'en-tête Range pour le téléchargement partiel." },
  { code: 207, name: "Multi-Status", description: "Plusieurs codes de statut", details: "WebDAV. Le corps contient plusieurs codes de statut." },

  // 3xx Redirection
  { code: 300, name: "Multiple Choices", description: "Plusieurs options disponibles", details: "Le client peut choisir parmi plusieurs ressources." },
  { code: 301, name: "Moved Permanently", description: "Ressource déplacée définitivement", details: "La nouvelle URL doit être utilisée à l'avenir.", common: true },
  { code: 302, name: "Found", description: "Ressource temporairement déplacée", details: "Redirection temporaire (anciennement 'Moved Temporarily').", common: true },
  { code: 303, name: "See Other", description: "Voir une autre ressource", details: "La réponse se trouve à une autre URI (GET)." },
  { code: 304, name: "Not Modified", description: "Ressource non modifiée", details: "Utilisé avec le cache conditionnel (If-Modified-Since).", common: true },
  { code: 307, name: "Temporary Redirect", description: "Redirection temporaire", details: "Comme 302 mais préserve la méthode HTTP." },
  { code: 308, name: "Permanent Redirect", description: "Redirection permanente", details: "Comme 301 mais préserve la méthode HTTP." },

  // 4xx Client Errors
  { code: 400, name: "Bad Request", description: "Requête mal formée", details: "Le serveur ne peut pas comprendre la requête.", common: true },
  { code: 401, name: "Unauthorized", description: "Authentification requise", details: "Le client doit s'authentifier pour accéder à la ressource.", common: true },
  { code: 402, name: "Payment Required", description: "Paiement requis", details: "Réservé pour une utilisation future." },
  { code: 403, name: "Forbidden", description: "Accès refusé", details: "Le serveur refuse d'exécuter la requête.", common: true },
  { code: 404, name: "Not Found", description: "Ressource non trouvée", details: "La ressource demandée n'existe pas sur le serveur.", common: true },
  { code: 405, name: "Method Not Allowed", description: "Méthode non autorisée", details: "La méthode HTTP n'est pas supportée pour cette ressource.", common: true },
  { code: 406, name: "Not Acceptable", description: "Contenu non acceptable", details: "Le serveur ne peut pas produire un contenu acceptable." },
  { code: 407, name: "Proxy Authentication Required", description: "Authentification proxy requise", details: "Le client doit d'abord s'authentifier auprès du proxy." },
  { code: 408, name: "Request Timeout", description: "Timeout de la requête", details: "Le client n'a pas envoyé la requête dans le délai imparti." },
  { code: 409, name: "Conflict", description: "Conflit avec l'état actuel", details: "La requête est en conflit avec l'état de la ressource.", common: true },
  { code: 410, name: "Gone", description: "Ressource définitivement supprimée", details: "La ressource n'est plus disponible et ne le sera plus." },
  { code: 411, name: "Length Required", description: "Content-Length requis", details: "Le serveur exige l'en-tête Content-Length." },
  { code: 412, name: "Precondition Failed", description: "Précondition échouée", details: "Une condition préalable de l'en-tête n'est pas satisfaite." },
  { code: 413, name: "Payload Too Large", description: "Corps de requête trop grand", details: "La requête dépasse la limite de taille du serveur." },
  { code: 414, name: "URI Too Long", description: "URI trop longue", details: "L'URI demandée est trop longue pour le serveur." },
  { code: 415, name: "Unsupported Media Type", description: "Type de média non supporté", details: "Le format de la requête n'est pas supporté." },
  { code: 416, name: "Range Not Satisfiable", description: "Plage non satisfaisable", details: "La plage spécifiée dans Range ne peut pas être satisfaite." },
  { code: 417, name: "Expectation Failed", description: "Attente non satisfaite", details: "Le serveur ne peut pas satisfaire l'en-tête Expect." },
  { code: 418, name: "I'm a teapot", description: "Je suis une théière", details: "Poisson d'avril RFC 2324. Le serveur refuse de préparer du café." },
  { code: 422, name: "Unprocessable Entity", description: "Entité non traitable", details: "La syntaxe est correcte mais le contenu est invalide.", common: true },
  { code: 423, name: "Locked", description: "Ressource verrouillée", details: "WebDAV. La ressource est verrouillée." },
  { code: 429, name: "Too Many Requests", description: "Trop de requêtes", details: "Rate limiting. Le client a envoyé trop de requêtes.", common: true },
  { code: 451, name: "Unavailable For Legal Reasons", description: "Indisponible pour raisons légales", details: "La ressource est bloquée pour des raisons légales." },

  // 5xx Server Errors
  { code: 500, name: "Internal Server Error", description: "Erreur interne du serveur", details: "Une erreur inattendue s'est produite côté serveur.", common: true },
  { code: 501, name: "Not Implemented", description: "Fonctionnalité non implémentée", details: "Le serveur ne supporte pas la fonctionnalité requise." },
  { code: 502, name: "Bad Gateway", description: "Mauvaise passerelle", details: "Le serveur a reçu une réponse invalide d'un serveur amont.", common: true },
  { code: 503, name: "Service Unavailable", description: "Service indisponible", details: "Le serveur est temporairement indisponible.", common: true },
  { code: 504, name: "Gateway Timeout", description: "Timeout de la passerelle", details: "Le serveur amont n'a pas répondu à temps.", common: true },
  { code: 505, name: "HTTP Version Not Supported", description: "Version HTTP non supportée", details: "Le serveur ne supporte pas la version HTTP utilisée." },
  { code: 507, name: "Insufficient Storage", description: "Stockage insuffisant", details: "WebDAV. Le serveur n'a plus d'espace de stockage." },
  { code: 508, name: "Loop Detected", description: "Boucle détectée", details: "WebDAV. Le serveur a détecté une boucle infinie." },
  { code: 511, name: "Network Authentication Required", description: "Authentification réseau requise", details: "Le client doit s'authentifier pour accéder au réseau." },
];

const categories = [
  { range: "1xx", label: "Informational", icon: Info, color: "bg-blue-500" },
  { range: "2xx", label: "Success", icon: CheckCircle, color: "bg-green-500" },
  { range: "3xx", label: "Redirection", icon: ArrowRight, color: "bg-yellow-500" },
  { range: "4xx", label: "Client Error", icon: AlertTriangle, color: "bg-orange-500" },
  { range: "5xx", label: "Server Error", icon: XCircle, color: "bg-red-500" },
];

export default function HttpStatusCodes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<HttpStatus | null>(null);

  const filteredCodes = useMemo(() => {
    if (!searchQuery) return httpStatusCodes;
    const query = searchQuery.toLowerCase();
    return httpStatusCodes.filter(
      (status) =>
        status.code.toString().includes(query) ||
        status.name.toLowerCase().includes(query) ||
        status.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const getCategory = (code: number) => {
    const prefix = Math.floor(code / 100);
    return categories.find((c) => c.range.startsWith(prefix.toString()));
  };

  const commonCodes = httpStatusCodes.filter((s) => s.common);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Server className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">HTTP Status Codes</h1>
          <p className="text-muted-foreground">Référence complète des codes de statut HTTP</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher par code ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Codes de statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4 flex-wrap h-auto">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="common">Courants</TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger key={cat.range} value={cat.range}>
                    {cat.range}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {filteredCodes.map((status) => {
                      const cat = getCategory(status.code);
                      return (
                        <div
                          key={status.code}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:border-primary ${
                            selectedCode?.code === status.code ? "border-primary bg-muted" : ""
                          }`}
                          onClick={() => setSelectedCode(status)}
                        >
                          <div className="flex items-center gap-3">
                            <Badge className={cat?.color}>{status.code}</Badge>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{status.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {status.description}
                              </p>
                            </div>
                            {status.common && (
                              <Badge variant="outline" className="text-xs">
                                Courant
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="common">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {commonCodes.map((status) => {
                      const cat = getCategory(status.code);
                      return (
                        <div
                          key={status.code}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:border-primary ${
                            selectedCode?.code === status.code ? "border-primary bg-muted" : ""
                          }`}
                          onClick={() => setSelectedCode(status)}
                        >
                          <div className="flex items-center gap-3">
                            <Badge className={cat?.color}>{status.code}</Badge>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{status.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {status.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              {categories.map((cat) => {
                const catCodes = filteredCodes.filter(
                  (s) => Math.floor(s.code / 100).toString() === cat.range[0]
                );
                return (
                  <TabsContent key={cat.range} value={cat.range}>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {catCodes.map((status) => (
                          <div
                            key={status.code}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors hover:border-primary ${
                              selectedCode?.code === status.code ? "border-primary bg-muted" : ""
                            }`}
                            onClick={() => setSelectedCode(status)}
                          >
                            <div className="flex items-center gap-3">
                              <Badge className={cat.color}>{status.code}</Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{status.name}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {status.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCode ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <Badge className={`${getCategory(selectedCode.code)?.color} text-2xl px-4 py-2`}>
                    {selectedCode.code}
                  </Badge>
                  <h3 className="text-xl font-bold mt-4">{selectedCode.name}</h3>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Description</p>
                  <p className="text-muted-foreground">{selectedCode.description}</p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Détails</p>
                  <p className="text-muted-foreground">{selectedCode.details}</p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Catégorie</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const cat = getCategory(selectedCode.code);
                      if (!cat) return null;
                      const Icon = cat.icon;
                      return (
                        <>
                          <Icon className="h-4 w-4" />
                          <span>{cat.label}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un code de statut pour voir les détails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const count = httpStatusCodes.filter(
            (s) => Math.floor(s.code / 100).toString() === cat.range[0]
          ).length;
          const Icon = cat.icon;
          return (
            <Card key={cat.range}>
              <CardContent className="pt-6 text-center">
                <div className={`w-12 h-12 rounded-full ${cat.color} mx-auto flex items-center justify-center mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-bold text-lg">{cat.range}</p>
                <p className="text-sm text-muted-foreground">{cat.label}</p>
                <Badge variant="secondary" className="mt-2">{count} codes</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
