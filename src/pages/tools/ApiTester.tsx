import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, Copy, Plus, Trash2, Save, FolderOpen, Download, Upload, 
  Code, History, Settings, Play, ChevronRight, FileJson, X
} from "lucide-react";
import { toast } from "sonner";

// Types
interface Header {
  key: string;
  value: string;
}

interface QueryParam {
  key: string;
  value: string;
  enabled: boolean;
}

interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Header[];
  queryParams: QueryParam[];
  body: string;
  timestamp: number;
}

interface Collection {
  id: string;
  name: string;
  requests: SavedRequest[];
}

interface HistoryItem {
  id: string;
  method: string;
  url: string;
  status: number;
  timestamp: number;
  responseTime: number;
}

const STORAGE_KEYS = {
  COLLECTIONS: "api-tester-collections",
  ENVIRONMENTS: "api-tester-environments",
  HISTORY: "api-tester-history",
  ACTIVE_ENV: "api-tester-active-env",
};

const DEFAULT_ENVIRONMENTS: Environment[] = [
  { id: "dev", name: "Development", variables: { BASE_URL: "http://localhost:3000", API_KEY: "" } },
  { id: "staging", name: "Staging", variables: { BASE_URL: "https://staging.example.com", API_KEY: "" } },
  { id: "prod", name: "Production", variables: { BASE_URL: "https://api.example.com", API_KEY: "" } },
];

export default function ApiTester() {
  // Request state
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Header[]>([{ key: "", value: "" }]);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([{ key: "", value: "", enabled: true }]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Collections & History
  const [collections, setCollections] = useState<Collection[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Environments
  const [environments, setEnvironments] = useState<Environment[]>(DEFAULT_ENVIRONMENTS);
  const [activeEnvId, setActiveEnvId] = useState<string | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState("params");
  const [showCodeGen, setShowCodeGen] = useState(false);
  const [codeGenLang, setCodeGenLang] = useState("curl");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newRequestName, setNewRequestName] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const savedCollections = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    const savedEnvs = localStorage.getItem(STORAGE_KEYS.ENVIRONMENTS);
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const savedActiveEnv = localStorage.getItem(STORAGE_KEYS.ACTIVE_ENV);

    if (savedCollections) setCollections(JSON.parse(savedCollections));
    if (savedEnvs) setEnvironments(JSON.parse(savedEnvs));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedActiveEnv) setActiveEnvId(savedActiveEnv);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENVIRONMENTS, JSON.stringify(environments));
  }, [environments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 50)));
  }, [history]);

  useEffect(() => {
    if (activeEnvId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ENV, activeEnvId);
    }
  }, [activeEnvId]);

  // Get active environment
  const activeEnv = environments.find(e => e.id === activeEnvId);

  // Replace environment variables in string
  const replaceEnvVariables = (str: string): string => {
    if (!activeEnv) return str;
    let result = str;
    Object.entries(activeEnv.variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return result;
  };

  // Build URL with query params
  const buildUrl = (): string => {
    let finalUrl = replaceEnvVariables(url);
    const enabledParams = queryParams.filter(p => p.enabled && p.key);
    
    if (enabledParams.length > 0) {
      const searchParams = new URLSearchParams();
      enabledParams.forEach(p => {
        searchParams.append(p.key, replaceEnvVariables(p.value));
      });
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl += separator + searchParams.toString();
    }
    
    return finalUrl;
  };

  // Header management
  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  // Query param management
  const addQueryParam = () => setQueryParams([...queryParams, { key: "", value: "", enabled: true }]);
  const removeQueryParam = (index: number) => setQueryParams(queryParams.filter((_, i) => i !== index));
  const updateQueryParam = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newParams = [...queryParams];
    (newParams[index] as any)[field] = value;
    setQueryParams(newParams);
  };

  // Send request
  const sendRequest = async () => {
    const finalUrl = buildUrl();
    if (!finalUrl.trim()) {
      toast.error("Veuillez entrer une URL");
      return;
    }

    setLoading(true);
    setResponse(null);
    const startTime = performance.now();

    try {
      const requestHeaders: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key && h.value) {
          requestHeaders[h.key] = replaceEnvVariables(h.value);
        }
      });

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (method !== "GET" && method !== "HEAD" && body) {
        options.body = replaceEnvVariables(body);
      }

      const res = await fetch(finalUrl, options);
      const endTime = performance.now();
      const time = Math.round(endTime - startTime);
      setResponseTime(time);

      const contentType = res.headers.get('content-type');
      let responseData;

      if (contentType?.includes('application/json')) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: responseData,
      });

      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        method,
        url: finalUrl,
        status: res.status,
        timestamp: Date.now(),
        responseTime: time,
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 49)]);

      toast.success("Requête envoyée avec succès !");
    } catch (e) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      
      setResponse({
        error: true,
        message: (e as Error).message,
      });
      toast.error("Erreur lors de la requête");
    } finally {
      setLoading(false);
    }
  };

  // Copy response
  const copyResponse = () => {
    const text = JSON.stringify(response, null, 2);
    navigator.clipboard.writeText(text);
    toast.success("Réponse copiée !");
  };

  // Generate code
  const generateCode = (): string => {
    const finalUrl = buildUrl();
    const activeHeaders = headers.filter(h => h.key && h.value);
    const hasBody = method !== "GET" && method !== "HEAD" && body;

    switch (codeGenLang) {
      case "curl":
        let curl = `curl -X ${method} "${finalUrl}"`;
        activeHeaders.forEach(h => {
          curl += ` \\\n  -H "${h.key}: ${replaceEnvVariables(h.value)}"`;
        });
        if (hasBody) {
          curl += ` \\\n  -d '${replaceEnvVariables(body)}'`;
        }
        return curl;

      case "fetch":
        const fetchOptions: any = { method };
        if (activeHeaders.length > 0) {
          fetchOptions.headers = {};
          activeHeaders.forEach(h => {
            fetchOptions.headers[h.key] = replaceEnvVariables(h.value);
          });
        }
        if (hasBody) {
          fetchOptions.body = "body";
        }
        
        let fetchCode = `const response = await fetch("${finalUrl}", ${JSON.stringify(fetchOptions, null, 2)});`;
        if (hasBody) {
          fetchCode = `const body = ${replaceEnvVariables(body)};\n\n${fetchCode}`;
          fetchCode = fetchCode.replace('"body"', 'JSON.stringify(body)');
        }
        fetchCode += "\nconst data = await response.json();";
        return fetchCode;

      case "axios":
        let axiosCode = `import axios from 'axios';\n\n`;
        const axiosConfig: any = {
          method: method.toLowerCase(),
          url: finalUrl,
        };
        if (activeHeaders.length > 0) {
          axiosConfig.headers = {};
          activeHeaders.forEach(h => {
            axiosConfig.headers[h.key] = replaceEnvVariables(h.value);
          });
        }
        if (hasBody) {
          axiosConfig.data = "BODY_PLACEHOLDER";
        }
        
        let configStr = JSON.stringify(axiosConfig, null, 2);
        if (hasBody) {
          configStr = configStr.replace('"BODY_PLACEHOLDER"', replaceEnvVariables(body));
        }
        axiosCode += `const response = await axios(${configStr});`;
        return axiosCode;

      case "python":
        let pyCode = `import requests\n\n`;
        pyCode += `url = "${finalUrl}"\n`;
        if (activeHeaders.length > 0) {
          pyCode += `headers = {\n`;
          activeHeaders.forEach(h => {
            pyCode += `    "${h.key}": "${replaceEnvVariables(h.value)}",\n`;
          });
          pyCode += `}\n`;
        }
        if (hasBody) {
          pyCode += `data = ${replaceEnvVariables(body)}\n`;
        }
        pyCode += `\nresponse = requests.${method.toLowerCase()}(url`;
        if (activeHeaders.length > 0) pyCode += `, headers=headers`;
        if (hasBody) pyCode += `, json=data`;
        pyCode += `)\nprint(response.json())`;
        return pyCode;

      default:
        return "";
    }
  };

  // Collection management
  const createCollection = () => {
    if (!newCollectionName.trim()) return;
    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName,
      requests: [],
    };
    setCollections([...collections, newCollection]);
    setNewCollectionName("");
    toast.success("Collection créée !");
  };

  const deleteCollection = (id: string) => {
    setCollections(collections.filter(c => c.id !== id));
    toast.success("Collection supprimée");
  };

  const saveRequestToCollection = (collectionId: string) => {
    if (!newRequestName.trim()) return;
    
    const request: SavedRequest = {
      id: Date.now().toString(),
      name: newRequestName,
      method,
      url,
      headers,
      queryParams,
      body,
      timestamp: Date.now(),
    };

    setCollections(collections.map(c => 
      c.id === collectionId 
        ? { ...c, requests: [...c.requests, request] }
        : c
    ));
    setNewRequestName("");
    toast.success("Requête sauvegardée !");
  };

  const loadRequest = (request: SavedRequest) => {
    setMethod(request.method);
    setUrl(request.url);
    setHeaders(request.headers.length > 0 ? request.headers : [{ key: "", value: "" }]);
    setQueryParams(request.queryParams?.length > 0 ? request.queryParams : [{ key: "", value: "", enabled: true }]);
    setBody(request.body);
    toast.success("Requête chargée !");
  };

  const deleteRequest = (collectionId: string, requestId: string) => {
    setCollections(collections.map(c => 
      c.id === collectionId 
        ? { ...c, requests: c.requests.filter(r => r.id !== requestId) }
        : c
    ));
  };

  // Import/Export
  const exportCollections = () => {
    const data = {
      version: "1.0",
      collections,
      environments,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "api-tester-export.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export réussi !");
  };

  const importCollections = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Try to parse as our format
        if (data.collections) {
          setCollections(prev => [...prev, ...data.collections]);
          if (data.environments) {
            setEnvironments(data.environments);
          }
          toast.success("Import réussi !");
          return;
        }
        
        // Try to parse as Postman format
        if (data.info && data.item) {
          const imported: Collection = {
            id: Date.now().toString(),
            name: data.info.name || "Postman Import",
            requests: data.item.map((item: any) => ({
              id: Date.now().toString() + Math.random(),
              name: item.name,
              method: item.request?.method || "GET",
              url: typeof item.request?.url === 'string' ? item.request.url : item.request?.url?.raw || "",
              headers: item.request?.header?.map((h: any) => ({ key: h.key, value: h.value })) || [],
              queryParams: item.request?.url?.query?.map((q: any) => ({ key: q.key, value: q.value, enabled: !q.disabled })) || [],
              body: item.request?.body?.raw || "",
              timestamp: Date.now(),
            })),
          };
          setCollections(prev => [...prev, imported]);
          toast.success("Collection Postman importée !");
          return;
        }

        toast.error("Format non reconnu");
      } catch (err) {
        toast.error("Erreur lors de l'import");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // Environment management
  const updateEnvVariable = (envId: string, key: string, value: string) => {
    setEnvironments(environments.map(e => 
      e.id === envId 
        ? { ...e, variables: { ...e.variables, [key]: value } }
        : e
    ));
  };

  const addEnvVariable = (envId: string, key: string) => {
    if (!key.trim()) return;
    setEnvironments(environments.map(e => 
      e.id === envId 
        ? { ...e, variables: { ...e.variables, [key]: "" } }
        : e
    ));
  };

  const removeEnvVariable = (envId: string, key: string) => {
    setEnvironments(environments.map(e => 
      e.id === envId 
        ? { ...e, variables: Object.fromEntries(Object.entries(e.variables).filter(([k]) => k !== key)) }
        : e
    ));
  };

  // Status color
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500";
    if (status >= 300 && status < 400) return "bg-blue-500";
    if (status >= 400 && status < 500) return "bg-orange-500";
    return "bg-red-500";
  };

  const getMethodColor = (m: string) => {
    const colors: Record<string, string> = {
      GET: "text-green-500",
      POST: "text-yellow-500",
      PUT: "text-blue-500",
      PATCH: "text-purple-500",
      DELETE: "text-red-500",
      HEAD: "text-gray-500",
      OPTIONS: "text-gray-500",
    };
    return colors[m] || "text-gray-500";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Tester Pro</h1>
          <p className="text-muted-foreground">
            Testez vos API avec collections, environnements et génération de code
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Environment Selector */}
          <Select value={activeEnvId || ""} onValueChange={setActiveEnvId}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Environnement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              {environments.map(env => (
                <SelectItem key={env.id} value={env.id}>{env.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Environment Settings */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Gestion des environnements</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue={environments[0]?.id}>
                <TabsList className="mb-4">
                  {environments.map(env => (
                    <TabsTrigger key={env.id} value={env.id}>{env.name}</TabsTrigger>
                  ))}
                </TabsList>
                {environments.map(env => (
                  <TabsContent key={env.id} value={env.id} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Utilisez <code className="bg-muted px-1 rounded">{"{{VARIABLE}}"}</code> dans l'URL, headers ou body
                    </p>
                    {Object.entries(env.variables).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <Input value={key} disabled className="w-40" />
                        <Input 
                          value={value} 
                          onChange={(e) => updateEnvVariable(env.id, key, e.target.value)}
                          placeholder="Valeur"
                          className="flex-1"
                        />
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => removeEnvVariable(env.id, key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Nouvelle variable" 
                        id={`new-var-${env.id}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addEnvVariable(env.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById(`new-var-${env.id}`) as HTMLInputElement;
                          addEnvVariable(env.id, input.value);
                          input.value = '';
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </DialogContent>
          </Dialog>

          {/* Import/Export */}
          <Button variant="outline" size="icon" onClick={exportCollections}>
            <Download className="h-4 w-4" />
          </Button>
          <label>
            <Button variant="outline" size="icon" asChild>
              <span><Upload className="h-4 w-4" /></span>
            </Button>
            <input type="file" accept=".json" className="hidden" onChange={importCollections} />
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Collections & History */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Collections
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouvelle collection</DialogTitle>
                    </DialogHeader>
                    <Input 
                      placeholder="Nom de la collection"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={createCollection}>Créer</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <ScrollArea className="h-[200px]">
                {collections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune collection
                  </p>
                ) : (
                  <div className="space-y-2">
                    {collections.map(collection => (
                      <div key={collection.id} className="border rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{collection.name}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={() => deleteCollection(collection.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {collection.requests.map(req => (
                          <div 
                            key={req.id}
                            className="flex items-center gap-2 py-1 px-2 hover:bg-muted rounded cursor-pointer text-xs"
                            onClick={() => loadRequest(req)}
                          >
                            <span className={`font-mono font-bold ${getMethodColor(req.method)}`}>
                              {req.method.substring(0, 3)}
                            </span>
                            <span className="truncate flex-1">{req.name}</span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5 opacity-0 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRequest(collection.id, req.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" />
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <ScrollArea className="h-[200px]">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun historique
                  </p>
                ) : (
                  <div className="space-y-1">
                    {history.map(item => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted rounded cursor-pointer text-xs"
                        onClick={() => setUrl(item.url)}
                      >
                        <span className={`font-mono font-bold ${getMethodColor(item.method)}`}>
                          {item.method.substring(0, 3)}
                        </span>
                        <Badge variant="outline" className={`${getStatusColor(item.status)} text-white text-xs px-1`}>
                          {item.status}
                        </Badge>
                        <span className="truncate flex-1 text-muted-foreground">
                          {item.url.replace(/^https?:\/\//, '').substring(0, 30)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Request URL */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="HEAD">HEAD</SelectItem>
                    <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="{{BASE_URL}}/api/endpoint ou https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />

                <Button onClick={sendRequest} disabled={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "..." : "Envoyer"}
                </Button>

                {/* Save to Collection */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Save className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sauvegarder la requête</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input 
                        placeholder="Nom de la requête"
                        value={newRequestName}
                        onChange={(e) => setNewRequestName(e.target.value)}
                      />
                      <Select value={selectedCollectionId || ""} onValueChange={setSelectedCollectionId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une collection" />
                        </SelectTrigger>
                        <SelectContent>
                          {collections.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button 
                          onClick={() => selectedCollectionId && saveRequestToCollection(selectedCollectionId)}
                          disabled={!selectedCollectionId || !newRequestName}
                        >
                          Sauvegarder
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Code Generator */}
                <Dialog open={showCodeGen} onOpenChange={setShowCodeGen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Code className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Générer du code</DialogTitle>
                    </DialogHeader>
                    <Tabs value={codeGenLang} onValueChange={setCodeGenLang}>
                      <TabsList>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="fetch">Fetch</TabsTrigger>
                        <TabsTrigger value="axios">Axios</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                      </TabsList>
                      <TabsContent value={codeGenLang} className="mt-4">
                        <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm font-mono max-h-[300px]">
                          {generateCode()}
                        </pre>
                        <Button 
                          className="mt-4"
                          onClick={() => {
                            navigator.clipboard.writeText(generateCode());
                            toast.success("Code copié !");
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copier
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardContent className="pt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="params">Query Params</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="body" disabled={method === "GET" || method === "HEAD"}>
                    Body
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="params" className="mt-4 space-y-2">
                  {queryParams.map((param, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        checked={param.enabled}
                        onChange={(e) => updateQueryParam(index, 'enabled', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Input
                        placeholder="Clé"
                        value={param.key}
                        onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Valeur"
                        value={param.value}
                        onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removeQueryParam(index)}
                        disabled={queryParams.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addQueryParam}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un paramètre
                  </Button>
                </TabsContent>

                <TabsContent value="headers" className="mt-4 space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Clé"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Valeur"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removeHeader(index)}
                        disabled={headers.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addHeader}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un header
                  </Button>
                </TabsContent>

                <TabsContent value="body" className="mt-4">
                  <Textarea
                    placeholder='{"key": "value"}'
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Response */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center justify-between">
                <span>Réponse</span>
                {response && !response.error && (
                  <div className="flex items-center gap-4">
                    <Badge className={`${getStatusColor(response.status)} text-white`}>
                      {response.status} {response.statusText}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {responseTime}ms
                    </span>
                    <Button size="sm" variant="outline" onClick={copyResponse}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {response ? (
                <div>
                  {!response.error ? (
                    <Tabs defaultValue="body">
                      <TabsList>
                        <TabsTrigger value="body">Body</TabsTrigger>
                        <TabsTrigger value="headers">Headers</TabsTrigger>
                      </TabsList>

                      <TabsContent value="body" className="mt-4">
                        <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-[400px] font-mono">
                          {typeof response.data === 'string'
                            ? response.data
                            : JSON.stringify(response.data, null, 2)}
                        </pre>
                      </TabsContent>

                      <TabsContent value="headers" className="mt-4">
                        <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-[400px] font-mono">
                          {JSON.stringify(response.headers, null, 2)}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                      <p className="font-medium text-destructive">Erreur</p>
                      <p className="text-sm text-destructive/80 mt-1">{response.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Temps: {responseTime}ms
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  La réponse apparaîtra ici après l'envoi de la requête
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
