import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Copy, CheckCircle2, XCircle, AlertTriangle, Plus, Key, Eye, EyeOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────

interface DecodedJWT {
  header: any;
  payload: any;
  signature: string;
  isExpired?: boolean;
  expiresAt?: string;
  issuedAt?: string;
}

interface PayloadClaim {
  key: string;
  value: string;
}

// ── Base64URL helpers ──────────────────────────────────────────────────

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return atob(s);
}

// ── Decoder Component ──────────────────────────────────────────────────

function JwtDecoderPanel() {
  const [jwtInput, setJwtInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState("");

  const decodeJWT = () => {
    setError("");
    setDecoded(null);

    if (!jwtInput.trim()) {
      setError("Veuillez entrer un JWT");
      return;
    }

    try {
      const parts = jwtInput.trim().split(".");
      if (parts.length !== 3) {
        throw new Error("Format JWT invalide — doit contenir 3 parties séparées par des points");
      }

      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      const signature = parts[2];

      let isExpired = false;
      let expiresAt: string | undefined;
      let issuedAt: string | undefined;

      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        expiresAt = expDate.toLocaleString("fr-FR");
        isExpired = expDate < new Date();
      }

      if (payload.iat) {
        issuedAt = new Date(payload.iat * 1000).toLocaleString("fr-FR");
      }

      setDecoded({ header, payload, signature, isExpired, expiresAt, issuedAt });
      toast.success("JWT décodé avec succès !");
    } catch (e) {
      setError((e as Error).message);
      toast.error("Erreur lors du décodage du JWT");
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(typeof text === "string" ? text : JSON.stringify(text, null, 2));
    toast.success("Copié !");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Token JWT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="jwt-input">Collez votre JWT</Label>
            <Textarea
              id="jwt-input"
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          <Button onClick={decodeJWT} className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            Décoder le JWT
          </Button>
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-2">
              <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Erreur</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {decoded && (
          <>
            <Card>
              <CardHeader><CardTitle className="text-lg">Statut du Token</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Validité</span>
                  {decoded.isExpired ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Expiré
                    </Badge>
                  ) : (
                    <Badge variant="default" className="flex items-center gap-1 bg-primary">
                      <CheckCircle2 className="h-3 w-3" /> Valide
                    </Badge>
                  )}
                </div>
                {decoded.issuedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Émis le</span>
                    <span className="font-mono">{decoded.issuedAt}</span>
                  </div>
                )}
                {decoded.expiresAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expire le</span>
                    <span className="font-mono">{decoded.expiresAt}</span>
                  </div>
                )}
                {decoded.isExpired && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg mt-2">
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">Ce token a expiré et ne devrait plus être accepté</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Header */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Header
                  <Button size="sm" variant="outline" onClick={() => copyText(decoded.header)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(decoded.header, null, 2)}</pre>
              </CardContent>
            </Card>

            {/* Payload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Payload
                  <Button size="sm" variant="outline" onClick={() => copyText(decoded.payload)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(decoded.payload, null, 2)}</pre>
              </CardContent>
            </Card>

            {/* Signature */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Signature
                  <Button size="sm" variant="outline" onClick={() => copyText(decoded.signature)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="block bg-muted p-4 rounded-lg overflow-auto text-sm break-all">{decoded.signature}</code>
                <p className="text-xs text-muted-foreground mt-2">⚠️ La signature ne peut être vérifiée sans la clé secrète</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ── Generator Component ────────────────────────────────────────────────

function JwtGeneratorPanel() {
  const [algorithm, setAlgorithm] = useState("HS256");
  const [secret, setSecret] = useState("my-secret-key");
  const [showSecret, setShowSecret] = useState(false);
  const [claims, setClaims] = useState<PayloadClaim[]>([
    { key: "sub", value: "1234567890" },
    { key: "name", value: "John Doe" },
    { key: "iat", value: String(Math.floor(Date.now() / 1000)) },
  ]);
  const [expEnabled, setExpEnabled] = useState(true);
  const [expMinutes, setExpMinutes] = useState("60");
  const [generatedToken, setGeneratedToken] = useState("");

  const addClaim = () => setClaims([...claims, { key: "", value: "" }]);

  const removeClaim = (idx: number) => setClaims(claims.filter((_, i) => i !== idx));

  const updateClaim = (idx: number, field: "key" | "value", val: string) => {
    const next = [...claims];
    next[idx] = { ...next[idx], [field]: val };
    setClaims(next);
  };

  const generateToken = useCallback(async () => {
    try {
      const header = { alg: algorithm, typ: "JWT" };

      const payload: Record<string, any> = {};
      for (const c of claims) {
        if (!c.key.trim()) continue;
        // Try to parse numbers and booleans
        let val: any = c.value;
        if (val === "true") val = true;
        else if (val === "false") val = false;
        else if (/^-?\d+(\.\d+)?$/.test(val)) val = Number(val);
        payload[c.key] = val;
      }

      if (expEnabled) {
        payload.exp = Math.floor(Date.now() / 1000) + Number(expMinutes) * 60;
      }

      const headerB64 = base64UrlEncode(JSON.stringify(header));
      const payloadB64 = base64UrlEncode(JSON.stringify(payload));

      // HMAC signature using Web Crypto API
      const enc = new TextEncoder();
      const keyData = enc.encode(secret);
      let sigB64 = "";

      if (algorithm === "none") {
        sigB64 = "";
      } else {
        const algMap: Record<string, { name: string; hash: string }> = {
          HS256: { name: "HMAC", hash: "SHA-256" },
          HS384: { name: "HMAC", hash: "SHA-384" },
          HS512: { name: "HMAC", hash: "SHA-512" },
        };

        const alg = algMap[algorithm];
        if (!alg) {
          toast.error("Seuls HS256, HS384, HS512 et none sont supportés côté client");
          return;
        }

        const cryptoKey = await crypto.subtle.importKey(
          "raw", keyData, { name: alg.name, hash: alg.hash }, false, ["sign"]
        );
        const signature = await crypto.subtle.sign(
          alg.name, cryptoKey, enc.encode(`${headerB64}.${payloadB64}`)
        );
        const sigArr = new Uint8Array(signature);
        const sigStr = String.fromCharCode(...sigArr);
        sigB64 = btoa(sigStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      }

      const token = `${headerB64}.${payloadB64}.${sigB64}`;
      setGeneratedToken(token);
      toast.success("JWT généré avec succès !");
    } catch (e) {
      toast.error("Erreur : " + (e as Error).message);
    }
  }, [algorithm, claims, expEnabled, expMinutes, secret]);

  const copyToken = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    toast.success("Token copié !");
  };

  const refreshIat = () => {
    const now = String(Math.floor(Date.now() / 1000));
    setClaims(prev => prev.map(c => c.key === "iat" ? { ...c, value: now } : c));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Config */}
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Header</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Algorithme</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HS256">HS256</SelectItem>
                  <SelectItem value="HS384">HS384</SelectItem>
                  <SelectItem value="HS512">HS512</SelectItem>
                  <SelectItem value="none">none (non signé)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {algorithm !== "none" && (
              <div>
                <Label>Clé secrète</Label>
                <div className="relative">
                  <Input
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="pr-10 font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Payload (Claims)
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={refreshIat} title="Mettre à jour iat">
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={addClaim}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Claim
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {claims.map((claim, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="clé"
                  value={claim.key}
                  onChange={(e) => updateClaim(i, "key", e.target.value)}
                  className="w-28 font-mono text-sm"
                />
                <Input
                  placeholder="valeur"
                  value={claim.value}
                  onChange={(e) => updateClaim(i, "value", e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeClaim(i)}>
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}

            {/* Expiration */}
            <div className="flex items-center gap-3 pt-2 border-t">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={expEnabled}
                  onChange={(e) => setExpEnabled(e.target.checked)}
                  className="rounded"
                />
                Expiration (exp)
              </label>
              {expEnabled && (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    value={expMinutes}
                    onChange={(e) => setExpMinutes(e.target.value)}
                    className="w-20 text-sm"
                    min={1}
                  />
                  <span className="text-xs text-muted-foreground">minutes</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button onClick={generateToken} className="w-full" size="lg">
          <Key className="h-4 w-4 mr-2" />
          Générer le JWT
        </Button>
      </div>

      {/* Output */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Token Généré
              <Button size="sm" variant="outline" onClick={copyToken} disabled={!generatedToken}>
                <Copy className="h-4 w-4 mr-1" /> Copier
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedToken ? (
              <div className="bg-muted p-4 rounded-lg overflow-auto">
                <code className="text-sm font-mono break-all leading-relaxed text-foreground">{generatedToken}</code>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Key className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Configurez les claims et cliquez sur Générer</p>
              </div>
            )}
          </CardContent>
        </Card>

        {generatedToken && (
          <>
            <Card>
              <CardHeader><CardTitle className="text-lg">Aperçu Header</CardTitle></CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify({ alg: algorithm, typ: "JWT" }, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Aperçu Payload</CardTitle></CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {(() => {
                    const p: Record<string, any> = {};
                    for (const c of claims) {
                      if (!c.key.trim()) continue;
                      let v: any = c.value;
                      if (v === "true") v = true;
                      else if (v === "false") v = false;
                      else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
                      p[c.key] = v;
                    }
                    if (expEnabled) p.exp = Math.floor(Date.now() / 1000) + Number(expMinutes) * 60;
                    return JSON.stringify(p, null, 2);
                  })()}
                </pre>
              </CardContent>
            </Card>

            <div className="p-3 bg-accent/50 border border-accent rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-chart-4 mt-0.5 shrink-0" />
              <p className="text-xs text-foreground">
                Ce JWT est signé côté client avec Web Crypto API. Pour la production, signez côté serveur avec une clé sécurisée.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────

export default function JwtDecoder() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          JWT Generator & Decoder
        </h1>
        <p className="text-muted-foreground">
          Générez des JWT signés (HMAC) ou décodez et analysez des tokens existants
        </p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generator" className="gap-1.5">
            <Key className="h-4 w-4" />
            Générer
          </TabsTrigger>
          <TabsTrigger value="decoder" className="gap-1.5">
            <Eye className="h-4 w-4" />
            Décoder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <JwtGeneratorPanel />
        </TabsContent>

        <TabsContent value="decoder">
          <JwtDecoderPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
