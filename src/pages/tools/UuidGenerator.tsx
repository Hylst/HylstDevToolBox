import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, Trash2, Check, Hash } from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/Tooltip";
import { ToolPageLayout } from "@/components/ToolPageLayout";

const UuidGenerator = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [customNamespace, setCustomNamespace] = useState("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
  const [customName, setCustomName] = useState("");
  const [validationInput, setValidationInput] = useState("");
  const [validationResult, setValidationResult] = useState<{ valid: boolean; version?: number } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // UUID v4 generator (random)
  const generateUUIDv4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // UUID v1-like (timestamp based, simplified)
  const generateUUIDv1 = (): string => {
    const now = Date.now();
    const timeHex = now.toString(16).padStart(12, '0');
    const clockSeq = Math.random() * 0x3fff | 0x8000;
    const node = Array.from({ length: 6 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
    
    return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-1${timeHex.slice(0, 3)}-${clockSeq.toString(16)}-${node}`;
  };

  // UUID v5-like (name-based with SHA-1, simplified)
  const generateUUIDv5 = async (namespace: string, name: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(namespace.replace(/-/g, '') + name);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(18, 20)}-${hex.slice(20, 32)}`;
  };

  // Nil UUID (all zeros)
  const generateNilUUID = (): string => {
    return '00000000-0000-0000-0000-000000000000';
  };

  const generateUUIDs = async (version: string) => {
    const newUuids: string[] = [];
    
    for (let i = 0; i < quantity; i++) {
      let uuid: string;
      switch (version) {
        case 'v1':
          uuid = generateUUIDv1();
          break;
        case 'v4':
          uuid = generateUUIDv4();
          break;
        case 'v5':
          uuid = await generateUUIDv5(customNamespace, customName || `name-${i}`);
          break;
        case 'nil':
          uuid = generateNilUUID();
          break;
        default:
          uuid = generateUUIDv4();
      }
      newUuids.push(uuid);
    }
    
    setUuids(newUuids);
    toast.success(`${quantity} UUID${quantity > 1 ? 's' : ''} générés`);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("UUID copié");
  };

  const copyAllUUIDs = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    toast.success("Tous les UUIDs copiés");
  };

  const validateUUID = () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-5])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const nilRegex = /^0{8}-0{4}-0{4}-0{4}-0{12}$/;
    
    if (nilRegex.test(validationInput)) {
      setValidationResult({ valid: true, version: 0 });
    } else if (uuidRegex.test(validationInput)) {
      const version = parseInt(validationInput[14], 16);
      setValidationResult({ valid: true, version });
    } else {
      setValidationResult({ valid: false });
    }
  };

  const getUUIDInfo = (uuid: string) => {
    const version = uuid[14];
    const variant = uuid[19];
    return { version, variant };
  };

  return (
    <ToolPageLayout title="Générateur UUID" description="Génère des identifiants uniques universels (v1, v4, v5) pour vos applications">

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Générer</TabsTrigger>
          <TabsTrigger value="validate">Valider</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Options de génération
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button onClick={() => generateUUIDs('v1')} variant="outline" className="h-20 flex-col">
                  <span className="font-bold">UUID v1</span>
                  <span className="text-xs text-muted-foreground">Timestamp</span>
                </Button>
                <Button onClick={() => generateUUIDs('v4')} variant="default" className="h-20 flex-col">
                  <span className="font-bold">UUID v4</span>
                  <span className="text-xs">Random</span>
                </Button>
                <Button onClick={() => generateUUIDs('v5')} variant="outline" className="h-20 flex-col">
                  <span className="font-bold">UUID v5</span>
                  <span className="text-xs text-muted-foreground">Name-based</span>
                </Button>
                <Button onClick={() => generateUUIDs('nil')} variant="outline" className="h-20 flex-col">
                  <span className="font-bold">Nil UUID</span>
                  <span className="text-xs text-muted-foreground">All zeros</span>
                </Button>
              </div>

              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <Label>Options UUID v5</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Namespace UUID</Label>
                    <Input
                      value={customNamespace}
                      onChange={(e) => setCustomNamespace(e.target.value)}
                      placeholder="Namespace UUID"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Nom pour générer l'UUID"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {uuids.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>UUIDs générés ({uuids.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyAllUUIDs}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copier tout
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setUuids([])}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Effacer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uuids.map((uuid, index) => {
                    const info = getUUIDInfo(uuid);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg font-mono text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">v{info.version}</Badge>
                          <span className="break-all">{uuid}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(uuid, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="validate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Valider un UUID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={validationInput}
                  onChange={(e) => {
                    setValidationInput(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder="Entrez un UUID à valider..."
                  className="font-mono"
                />
                <Button onClick={validateUUID}>
                  <Check className="h-4 w-4 mr-2" />
                  Valider
                </Button>
              </div>

              {validationResult && (
                <div className={`p-4 rounded-lg ${validationResult.valid ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  {validationResult.valid ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">UUID valide</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Version: {validationResult.version === 0 ? 'Nil UUID' : `v${validationResult.version}`}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <span className="font-medium">UUID invalide</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Référence des versions UUID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold">v1</span> - Basé sur le timestamp et l'adresse MAC
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold">v4</span> - Généré aléatoirement (le plus courant)
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold">v5</span> - Basé sur un namespace et un nom (SHA-1)
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold">Nil</span> - UUID spécial avec tous les bits à zéro
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ToolPageLayout>
  );
};

export default UuidGenerator;
