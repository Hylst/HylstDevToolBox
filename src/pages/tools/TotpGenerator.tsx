import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Shield, Copy, RefreshCw, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CryptoJS from "crypto-js";

function base32Decode(encoded: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = encoded.replace(/[=\s]/g, "").toUpperCase();
  let bits = "";
  for (const c of clean) {
    const val = alphabet.indexOf(c);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return bytes;
}

function generateTOTP(secret: string, period: number, digits: number, algorithm: string): string {
  try {
    const keyBytes = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / period);

    // Convert counter to 8-byte big-endian
    const counterHex = counter.toString(16).padStart(16, "0");
    const counterWords = CryptoJS.enc.Hex.parse(counterHex);
    const keyWords = CryptoJS.enc.Hex.parse(Array.from(keyBytes).map(b => b.toString(16).padStart(2, "0")).join(""));

    let hmac: CryptoJS.lib.WordArray;
    if (algorithm === "SHA256") {
      hmac = CryptoJS.HmacSHA256(counterWords, keyWords);
    } else if (algorithm === "SHA512") {
      hmac = CryptoJS.HmacSHA512(counterWords, keyWords);
    } else {
      hmac = CryptoJS.HmacSHA1(counterWords, keyWords);
    }

    const hmacHex = hmac.toString(CryptoJS.enc.Hex);
    const offset = parseInt(hmacHex.slice(-1), 16);
    const truncated = parseInt(hmacHex.slice(offset * 2, offset * 2 + 8), 16) & 0x7fffffff;
    const code = (truncated % Math.pow(10, digits)).toString().padStart(digits, "0");

    return code;
  } catch {
    return "------";
  }
}

function generateRandomSecret(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 32; i++) {
    secret += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return secret;
}

export default function TotpGenerator() {
  const { toast } = useToast();
  const [secret, setSecret] = useState("JBSWY3DPEHPK3PXP");
  const [period, setPeriod] = useState(30);
  const [digits, setDigits] = useState(6);
  const [algorithm, setAlgorithm] = useState("SHA1");
  const [issuer, setIssuer] = useState("DevToolbox");
  const [account, setAccount] = useState("user@example.com");
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<number>();

  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = period - (now % period);
      setTimeLeft(remaining);
      setCode(generateTOTP(secret, period, digits, algorithm));
    };
    update();
    intervalRef.current = window.setInterval(update, 1000);
    return () => clearInterval(intervalRef.current);
  }, [secret, period, digits, algorithm]);

  const otpauthUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=${algorithm}&digits=${digits}&period=${period}`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !", description: label });
  };

  const genNewSecret = () => {
    const s = generateRandomSecret();
    setSecret(s);
    toast({ title: "Nouveau secret généré" });
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          TOTP / 2FA Generator
        </h1>
        <p className="text-muted-foreground">Générateur de codes TOTP compatible Google Authenticator</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Clé secrète (Base32)</Label>
              <div className="flex gap-2">
                <Input value={secret} onChange={e => setSecret(e.target.value.replace(/\s/g, "").toUpperCase())} className="font-mono" />
                <Button variant="outline" onClick={genNewSecret}><RefreshCw className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Issuer</Label>
                <Input value={issuer} onChange={e => setIssuer(e.target.value)} />
              </div>
              <div>
                <Label>Compte</Label>
                <Input value={account} onChange={e => setAccount(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Période (s)</Label>
                <Select value={period.toString()} onValueChange={v => setPeriod(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30s</SelectItem>
                    <SelectItem value="60">60s</SelectItem>
                    <SelectItem value="90">90s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Digits</Label>
                <Select value={digits.toString()} onValueChange={v => setDigits(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Algorithme</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHA1">SHA-1</SelectItem>
                    <SelectItem value="SHA256">SHA-256</SelectItem>
                    <SelectItem value="SHA512">SHA-512</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>URI otpauth://</Label>
              <div className="relative">
                <pre className="text-xs font-mono bg-muted/50 p-3 rounded-lg overflow-auto break-all">{otpauthUri}</pre>
                <Button size="sm" variant="ghost" className="absolute top-1 right-1" onClick={() => copy(otpauthUri, "URI copiée")}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Key className="h-5 w-5" /> Code TOTP</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div
                className="text-6xl font-mono font-bold tracking-[0.3em] text-primary cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => copy(code, "Code TOTP copié")}
                title="Cliquer pour copier"
              >
                {code.slice(0, Math.ceil(code.length / 2))}{" "}{code.slice(Math.ceil(code.length / 2))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">Cliquer pour copier</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Temps restant</span>
                <span className="font-mono font-bold">{timeLeft}s</span>
              </div>
              <Progress value={(timeLeft / period) * 100} className={timeLeft <= 5 ? "[&>div]:bg-destructive" : ""} />
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issuer</span>
                <span className="font-medium">{issuer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Compte</span>
                <span className="font-medium">{account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Algorithme</span>
                <span className="font-medium">{algorithm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Période</span>
                <span className="font-medium">{period}s</span>
              </div>
            </div>

            <div className="bg-accent/50 border border-accent p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                ⚠️ Cet outil est à usage de développement/test uniquement. Ne stockez jamais de vrais secrets 2FA dans un navigateur.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
