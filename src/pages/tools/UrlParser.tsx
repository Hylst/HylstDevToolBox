import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Link, Plus, Trash2, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/Tooltip";

interface QueryParam {
  key: string;
  value: string;
}

interface ParsedUrl {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  host: string;
}

const UrlParser = () => {
  const [urlInput, setUrlInput] = useState("https://example.com:8080/path/to/page?name=John&age=30&city=Paris#section1");
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [error, setError] = useState<string>("");

  // Builder state
  const [protocol, setProtocol] = useState("https");
  const [hostname, setHostname] = useState("example.com");
  const [port, setPort] = useState("");
  const [pathname, setPathname] = useState("/");
  const [hash, setHash] = useState("");
  const [builderParams, setBuilderParams] = useState<QueryParam[]>([{ key: "", value: "" }]);
  const [builtUrl, setBuiltUrl] = useState("");

  const parseUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      
      setParsedUrl({
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
        origin: parsed.origin,
        host: parsed.host
      });

      const params: QueryParam[] = [];
      parsed.searchParams.forEach((value, key) => {
        params.push({ key, value });
      });
      setQueryParams(params);
      setError("");
    } catch {
      setParsedUrl(null);
      setQueryParams([]);
      setError("URL invalide");
    }
  };

  useEffect(() => {
    if (urlInput) {
      parseUrl(urlInput);
    }
  }, [urlInput]);

  useEffect(() => {
    // Build URL from components
    try {
      let url = `${protocol}://${hostname}`;
      if (port) url += `:${port}`;
      url += pathname || '/';
      
      const validParams = builderParams.filter(p => p.key);
      if (validParams.length > 0) {
        const searchParams = new URLSearchParams();
        validParams.forEach(p => searchParams.append(p.key, p.value));
        url += `?${searchParams.toString()}`;
      }
      
      if (hash) url += `#${hash.replace(/^#/, '')}`;
      
      setBuiltUrl(url);
    } catch {
      setBuiltUrl("");
    }
  }, [protocol, hostname, port, pathname, hash, builderParams]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié`);
  };

  const addBuilderParam = () => {
    setBuilderParams([...builderParams, { key: "", value: "" }]);
  };

  const removeBuilderParam = (index: number) => {
    setBuilderParams(builderParams.filter((_, i) => i !== index));
  };

  const updateBuilderParam = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...builderParams];
    updated[index][field] = value;
    setBuilderParams(updated);
  };

  const encodeUrl = (text: string): string => {
    return encodeURIComponent(text);
  };

  const decodeUrl = (text: string): string => {
    try {
      return decodeURIComponent(text);
    } catch {
      return text;
    }
  };

  const [encodeInput, setEncodeInput] = useState("");
  const [encodeOutput, setEncodeOutput] = useState("");

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Analyseur d'<Tooltip term="URL">URL</Tooltip>
        </h1>
        <p className="text-muted-foreground">
          Analysez, construisez et encodez/décodez des URLs
        </p>
      </div>

      <Tabs defaultValue="parser" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="parser">Analyser</TabsTrigger>
          <TabsTrigger value="builder">Construire</TabsTrigger>
          <TabsTrigger value="encode">Encoder/Décoder</TabsTrigger>
        </TabsList>

        <TabsContent value="parser" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                URL à analyser
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/path?param=value#hash"
                className="font-mono"
              />
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
            </CardContent>
          </Card>

          {parsedUrl && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Composants de l'URL</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Protocol", value: parsedUrl.protocol, color: "bg-blue-500/10 text-blue-600" },
                      { label: "Hostname", value: parsedUrl.hostname, color: "bg-green-500/10 text-green-600" },
                      { label: "Port", value: parsedUrl.port || "(default)", color: "bg-yellow-500/10 text-yellow-600" },
                      { label: "Pathname", value: parsedUrl.pathname, color: "bg-purple-500/10 text-purple-600" },
                      { label: "Search", value: parsedUrl.search || "(none)", color: "bg-orange-500/10 text-orange-600" },
                      { label: "Hash", value: parsedUrl.hash || "(none)", color: "bg-pink-500/10 text-pink-600" },
                      { label: "Origin", value: parsedUrl.origin, color: "bg-cyan-500/10 text-cyan-600" },
                      { label: "Host", value: parsedUrl.host, color: "bg-indigo-500/10 text-indigo-600" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                          <code className={`text-sm px-2 py-0.5 rounded ${item.color}`}>
                            {item.value}
                          </code>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.value, item.label)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {queryParams.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres de requête ({queryParams.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {queryParams.map((param, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <Badge variant="outline" className="font-mono">
                            {param.key}
                          </Badge>
                          <span className="text-muted-foreground">=</span>
                          <code className="flex-1 text-sm">{param.value}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`${param.key}=${param.value}`, "Paramètre")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Visualisation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg overflow-x-auto">
                    <code className="text-sm whitespace-nowrap">
                      <span className="text-blue-500">{parsedUrl.protocol}</span>
                      <span className="text-muted-foreground">//</span>
                      <span className="text-green-500">{parsedUrl.hostname}</span>
                      {parsedUrl.port && (
                        <>
                          <span className="text-muted-foreground">:</span>
                          <span className="text-yellow-500">{parsedUrl.port}</span>
                        </>
                      )}
                      <span className="text-purple-500">{parsedUrl.pathname}</span>
                      {parsedUrl.search && (
                        <span className="text-orange-500">{parsedUrl.search}</span>
                      )}
                      {parsedUrl.hash && (
                        <span className="text-pink-500">{parsedUrl.hash}</span>
                      )}
                    </code>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    <Badge variant="outline" className="text-blue-500">Protocol</Badge>
                    <Badge variant="outline" className="text-green-500">Hostname</Badge>
                    <Badge variant="outline" className="text-yellow-500">Port</Badge>
                    <Badge variant="outline" className="text-purple-500">Pathname</Badge>
                    <Badge variant="outline" className="text-orange-500">Search</Badge>
                    <Badge variant="outline" className="text-pink-500">Hash</Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Constructeur d'URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Protocol</Label>
                  <Input
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
                    placeholder="https"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Hostname</Label>
                  <Input
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    placeholder="example.com"
                  />
                </div>
                <div>
                  <Label>Port</Label>
                  <Input
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="8080"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pathname</Label>
                  <Input
                    value={pathname}
                    onChange={(e) => setPathname(e.target.value)}
                    placeholder="/path/to/resource"
                  />
                </div>
                <div>
                  <Label>Hash (fragment)</Label>
                  <Input
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    placeholder="section1"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Query Parameters</Label>
                  <Button variant="outline" size="sm" onClick={addBuilderParam}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-2">
                  {builderParams.map((param, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={param.key}
                        onChange={(e) => updateBuilderParam(index, 'key', e.target.value)}
                        placeholder="Clé"
                        className="flex-1"
                      />
                      <Input
                        value={param.value}
                        onChange={(e) => updateBuilderParam(index, 'value', e.target.value)}
                        placeholder="Valeur"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBuilderParam(index)}
                        disabled={builderParams.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>URL générée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={builtUrl}
                  readOnly
                  className="font-mono"
                />
                <Button onClick={() => copyToClipboard(builtUrl, "URL")}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
              </div>
              <Button
                variant="link"
                className="mt-2 p-0"
                onClick={() => setUrlInput(builtUrl)}
              >
                <ArrowRightLeft className="h-4 w-4 mr-1" />
                Utiliser dans l'analyseur
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encode" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Encoder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Texte à encoder</Label>
                  <Input
                    value={encodeInput}
                    onChange={(e) => {
                      setEncodeInput(e.target.value);
                      setEncodeOutput(encodeUrl(e.target.value));
                    }}
                    placeholder="Hello World!"
                  />
                </div>
                <div>
                  <Label>Résultat encodé</Label>
                  <div className="flex gap-2">
                    <Input
                      value={encodeOutput}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(encodeOutput, "Encodé")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Décoder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Texte encodé</Label>
                  <Input
                    placeholder="Hello%20World%21"
                    onChange={(e) => {
                      const decoded = decodeUrl(e.target.value);
                      (document.getElementById('decode-output') as HTMLInputElement).value = decoded;
                    }}
                  />
                </div>
                <div>
                  <Label>Résultat décodé</Label>
                  <div className="flex gap-2">
                    <Input
                      id="decode-output"
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const output = document.getElementById('decode-output') as HTMLInputElement;
                        copyToClipboard(output.value, "Décodé");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Caractères spéciaux courants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                {[
                  { char: " ", encoded: "%20" },
                  { char: "!", encoded: "%21" },
                  { char: "#", encoded: "%23" },
                  { char: "$", encoded: "%24" },
                  { char: "%", encoded: "%25" },
                  { char: "&", encoded: "%26" },
                  { char: "'", encoded: "%27" },
                  { char: "(", encoded: "%28" },
                  { char: ")", encoded: "%29" },
                  { char: "*", encoded: "%2A" },
                  { char: "+", encoded: "%2B" },
                  { char: ",", encoded: "%2C" },
                  { char: "/", encoded: "%2F" },
                  { char: ":", encoded: "%3A" },
                  { char: ";", encoded: "%3B" },
                  { char: "=", encoded: "%3D" },
                  { char: "?", encoded: "%3F" },
                  { char: "@", encoded: "%40" },
                ].map((item) => (
                  <div
                    key={item.encoded}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded"
                  >
                    <code>{item.char}</code>
                    <span className="text-muted-foreground">→</span>
                    <code className="text-primary">{item.encoded}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UrlParser;
