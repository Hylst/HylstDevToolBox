import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";

interface Header {
  key: string;
  value: string;
}

export default function GraphQLTester() {
  const [endpoint, setEndpoint] = useState("https://api.spacex.land/graphql/");
  const [query, setQuery] = useState(`query {
  launchesPast(limit: 5) {
    mission_name
    launch_date_local
    launch_success
    rocket {
      rocket_name
    }
  }
}`);
  const [variables, setVariables] = useState("{}");
  const [headers, setHeaders] = useState<Header[]>([{ key: "Content-Type", value: "application/json" }]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const executeQuery = async () => {
    if (!endpoint.trim()) {
      toast.error("Veuillez entrer une URL d'endpoint");
      return;
    }

    if (!query.trim()) {
      toast.error("Veuillez entrer une query GraphQL");
      return;
    }

    setLoading(true);
    setResponse("");
    setStatusCode(null);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      let parsedVariables = {};
      if (variables.trim()) {
        parsedVariables = JSON.parse(variables);
      }

      const headersObj: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key.trim() && h.value.trim()) {
          headersObj[h.key] = h.value;
        }
      });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: headersObj,
        body: JSON.stringify({
          query,
          variables: parsedVariables
        })
      });

      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setStatusCode(res.status);

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));

      if (res.ok && !data.errors) {
        toast.success("Query exécutée avec succès !");
      } else if (data.errors) {
        toast.error("La query a retourné des erreurs");
      } else {
        toast.error(`Erreur ${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      setResponse(JSON.stringify({ error: (error as Error).message }, null, 2));
      toast.error("Erreur lors de l'exécution de la query");
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    toast.success("Réponse copiée !");
  };

  const loadExample = (type: "query" | "mutation") => {
    if (type === "query") {
      setQuery(`query GetLaunches($limit: Int!) {
  launchesPast(limit: $limit) {
    mission_name
    launch_date_local
    launch_success
    rocket {
      rocket_name
    }
  }
}`);
      setVariables(`{
  "limit": 5
}`);
    } else {
      setQuery(`mutation CreateUser($name: String!, $email: String!) {
  createUser(input: { name: $name, email: $email }) {
    id
    name
    email
  }
}`);
      setVariables(`{
  "name": "John Doe",
  "email": "john@example.com"
}`);
    }
    toast.success("Exemple chargé !");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Play className="h-8 w-8 text-primary" />
          GraphQL Tester
        </h1>
        <p className="text-muted-foreground">
          Testez vos queries et mutations GraphQL avec variables et headers personnalisés
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="endpoint">Endpoint GraphQL</Label>
                <Input
                  id="endpoint"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://api.example.com/graphql"
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => loadExample("query")}>
                  Exemple Query
                </Button>
                <Button size="sm" variant="outline" onClick={() => loadExample("mutation")}>
                  Exemple Mutation
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Query / Mutation</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Entrez votre query GraphQL..."
                className="min-h-[200px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variables (JSON)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                placeholder='{"key": "value"}'
                className="min-h-[100px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Headers
                <Button size="sm" variant="outline" onClick={addHeader}>
                  + Ajouter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => updateHeader(index, "key", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => updateHeader(index, "value", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeHeader(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button onClick={executeQuery} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exécution...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Exécuter la Query
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {statusCode !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Statut
                  {response && (
                    <Button size="sm" variant="outline" onClick={copyResponse}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge variant={statusCode === 200 ? "default" : "destructive"}>
                    {statusCode}
                  </Badge>
                  {responseTime !== null && (
                    <span className="text-sm text-muted-foreground">
                      {responseTime}ms
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Réponse</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={response}
                readOnly
                placeholder="La réponse apparaîtra ici..."
                className="min-h-[500px] font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
