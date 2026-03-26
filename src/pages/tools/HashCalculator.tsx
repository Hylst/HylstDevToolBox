import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/Tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Hash, Upload, Key, Check, Zap, Clock, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import CryptoJS from 'crypto-js';
import { sha3_256, sha3_512 } from 'js-sha3';
import { blake2b, blake2s } from 'blakejs';
import CRC32 from 'crc-32';

interface HashResult {
  algorithm: string;
  hash: string;
  time: number;
}

interface HistoryEntry {
  id: string;
  type: 'text' | 'file';
  input: string;
  timestamp: number;
  results: HashResult[];
}

export default function HashCalculator() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [hmacKey, setHmacKey] = useState("");
  const [hmacResults, setHmacResults] = useState<HashResult[]>([]);
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);
  const [benchmarkResults, setBenchmarkResults] = useState<HashResult[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([
    "MD5", "SHA-1", "SHA-256", "SHA-512"
  ]);

  const ALL_ALGORITHMS = [
    "MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512",
    "SHA3-256", "SHA3-512", "BLAKE2b", "BLAKE2s",
    "RIPEMD-160", "CRC32"
  ];

  // Calculer hash pour texte
  const calculateHash = async (data: Uint8Array | string, algorithm: string): Promise<string> => {
    // Toujours convertir en string d'abord pour uniformiser
    const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
    
    switch (algorithm) {
      case "MD5":
        return CryptoJS.MD5(text).toString();
      case "SHA-1":
      case "SHA-256":
      case "SHA-384":
      case "SHA-512": {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest(algorithm, bytes);
        return Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");
      }
      case "SHA3-256":
        return sha3_256(text);
      case "SHA3-512":
        return sha3_512(text);
      case "BLAKE2b": {
        const encoder = new TextEncoder();
        const hash = blake2b(encoder.encode(text), undefined, 64);
        return Array.from(hash).map(b => b.toString(16).padStart(2, "0")).join("");
      }
      case "BLAKE2s": {
        const encoder = new TextEncoder();
        const hash = blake2s(encoder.encode(text), undefined, 32);
        return Array.from(hash).map(b => b.toString(16).padStart(2, "0")).join("");
      }
      case "RIPEMD-160":
        return CryptoJS.RIPEMD160(text).toString();
      case "CRC32": {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(text);
        const crc = CRC32.buf(bytes);
        return (crc >>> 0).toString(16).padStart(8, '0');
      }
      default:
        return "";
    }
  };

  // Calculer HMAC
  const calculateHMAC = (text: string, key: string, algorithm: string): string => {
    switch (algorithm) {
      case "MD5":
        return CryptoJS.HmacMD5(text, key).toString();
      case "SHA-1":
        return CryptoJS.HmacSHA1(text, key).toString();
      case "SHA-256":
        return CryptoJS.HmacSHA256(text, key).toString();
      case "SHA-384":
        return CryptoJS.HmacSHA384(text, key).toString();
      case "SHA-512":
        return CryptoJS.HmacSHA512(text, key).toString();
      case "RIPEMD-160":
        return CryptoJS.HmacRIPEMD160(text, key).toString();
      default:
        return "";
    }
  };

  // Calculer tous les hashs pour le texte
  const calculateTextHashes = async () => {
    if (!input) {
      toast.error("Entrez du texte !");
      return;
    }

    const results: HashResult[] = [];
    
    for (const algo of selectedAlgorithms) {
      const start = performance.now();
      const hash = await calculateHash(input, algo);
      const time = performance.now() - start;
      results.push({ algorithm: algo, hash, time });
    }

    setHashes(results);
    
    // Ajouter à l'historique
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      type: 'text',
      input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
      timestamp: Date.now(),
      results
    };
    setHistory(prev => [entry, ...prev].slice(0, 20));
    
    toast.success(`${results.length} hashs calculés !`);
  };

  // Calculer hash de fichier
  const calculateFileHash = async () => {
    if (!file) {
      toast.error("Sélectionnez un fichier !");
      return;
    }

    const results: HashResult[] = [];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);

      for (const algo of selectedAlgorithms) {
        const start = performance.now();
        const hash = await calculateHash(bytes, algo);
        const time = performance.now() - start;
        results.push({ algorithm: algo, hash, time });
      }

      setHashes(results);
      
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        type: 'file',
        input: file.name,
        timestamp: Date.now(),
        results
      };
      setHistory(prev => [entry, ...prev].slice(0, 20));
      
      toast.success(`Fichier hashé avec ${results.length} algorithmes !`);
    };

    reader.readAsArrayBuffer(file);
  };

  // Calculer HMAC
  const calculateHMACHashes = () => {
    if (!input || !hmacKey) {
      toast.error("Entrez le texte et la clé HMAC !");
      return;
    }

    const hmacAlgorithms = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512", "RIPEMD-160"];
    const results: HashResult[] = [];

    for (const algo of hmacAlgorithms) {
      const start = performance.now();
      const hash = calculateHMAC(input, hmacKey, algo);
      const time = performance.now() - start;
      if (hash) results.push({ algorithm: `HMAC-${algo}`, hash, time });
    }

    setHmacResults(results);
    toast.success(`${results.length} HMACs calculés !`);
  };

  // Vérifier hash
  const verifyHashMatch = async () => {
    if (!input || !verifyHash) {
      toast.error("Entrez le texte et le hash à vérifier !");
      return;
    }

    const cleanHash = verifyHash.toLowerCase().trim();
    
    for (const algo of ALL_ALGORITHMS) {
      const calculated = await calculateHash(input, algo);
      if (calculated.toLowerCase() === cleanHash) {
        setVerifyResult(algo);
        toast.success(`✓ Hash valide ! Algorithme: ${algo}`);
        return;
      }
    }

    setVerifyResult("invalid");
    toast.error("✗ Hash invalide ou algorithme non reconnu");
  };

  // Benchmark
  const runBenchmark = async () => {
    if (!input) {
      toast.error("Entrez du texte pour le benchmark !");
      return;
    }

    setBenchmarkProgress(0);
    const results: HashResult[] = [];
    const iterations = 1000;

    for (let i = 0; i < ALL_ALGORITHMS.length; i++) {
      const algo = ALL_ALGORITHMS[i];
      const start = performance.now();
      
      for (let j = 0; j < iterations; j++) {
        await calculateHash(input, algo);
      }
      
      const totalTime = performance.now() - start;
      const avgTime = totalTime / iterations;
      
      results.push({ 
        algorithm: algo, 
        hash: `${iterations} itérations`, 
        time: avgTime 
      });
      
      setBenchmarkProgress(((i + 1) / ALL_ALGORITHMS.length) * 100);
    }

    // Trier par vitesse
    results.sort((a, b) => a.time - b.time);
    setBenchmarkResults(results);
    toast.success("Benchmark terminé !");
  };

  // Export
  const exportResults = (format: 'json' | 'csv') => {
    if (hashes.length === 0) {
      toast.error("Aucun résultat à exporter !");
      return;
    }

    let content = "";
    let filename = "";

    if (format === 'json') {
      content = JSON.stringify({ input: input.substring(0, 50), results: hashes }, null, 2);
      filename = 'hashes.json';
    } else {
      content = "Algorithm,Hash,Time (ms)\n";
      hashes.forEach(r => {
        content += `${r.algorithm},"${r.hash}",${r.time.toFixed(2)}\n`;
      });
      filename = 'hashes.csv';
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exporté en ${format.toUpperCase()} !`);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Hash copié !");
  };

  const toggleAlgorithm = (algo: string) => {
    setSelectedAlgorithms(prev => 
      prev.includes(algo) 
        ? prev.filter(a => a !== algo)
        : [...prev, algo]
    );
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success("Historique effacé !");
  };

  return (
    <ToolPageLayout title="Calculateur de Hash Pro" description="Générez des empreintes cryptographiques avec 11 algorithmes, HMAC, vérification et benchmark">

      {/* Sélection des algorithmes */}
      <Card>
        <CardHeader>
          <CardTitle>Algorithmes sélectionnés ({selectedAlgorithms.length})</CardTitle>
          <CardDescription>Choisissez les algorithmes à utiliser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALL_ALGORITHMS.map(algo => (
              <Badge
                key={algo}
                variant={selectedAlgorithms.includes(algo) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleAlgorithm(algo)}
              >
                {algo}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="text">Texte</TabsTrigger>
          <TabsTrigger value="file">Fichier</TabsTrigger>
          <TabsTrigger value="hmac">HMAC</TabsTrigger>
          <TabsTrigger value="verify">Vérifier</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
        </TabsList>

        {/* Tab Texte */}
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Hash de texte</CardTitle>
              <CardDescription>Calculez les hashs d'un texte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>
                  <Tooltip content="Le texte dont vous souhaitez calculer l'empreinte cryptographique">
                    Texte à hasher
                  </Tooltip>
                </Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Entrez votre texte ici..."
                  className="min-h-[150px] font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={calculateTextHashes} disabled={!input || selectedAlgorithms.length === 0}>
                  <Hash className="h-4 w-4 mr-2" />
                  Calculer les hashs
                </Button>
                {hashes.length > 0 && (
                  <>
                    <Button variant="outline" onClick={() => exportResults('json')}>
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                    <Button variant="outline" onClick={() => exportResults('csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </>
                )}
              </div>

              {hashes.length > 0 && (
                <div className="space-y-3 pt-4">
                  {hashes.map((result) => (
                    <div key={result.algorithm} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label>{result.algorithm}</Label>
                          <Badge variant="secondary" className="text-xs">
                            {result.time.toFixed(2)}ms
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyHash(result.hash)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                        {result.hash}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Fichier */}
        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Hash de fichier
              </CardTitle>
              <CardDescription>Calculez les hashs d'un fichier (max 20 MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>
                  <Tooltip content="Sélectionnez un fichier pour calculer son empreinte">
                    Fichier
                  </Tooltip>
                </Label>
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Fichier: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <Button onClick={calculateFileHash} disabled={!file || selectedAlgorithms.length === 0}>
                <Hash className="h-4 w-4 mr-2" />
                Calculer les hashs du fichier
              </Button>

              {hashes.length > 0 && (
                <div className="space-y-3 pt-4">
                  {hashes.map((result) => (
                    <div key={result.algorithm} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label>{result.algorithm}</Label>
                          <Badge variant="secondary" className="text-xs">
                            {result.time.toFixed(2)}ms
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyHash(result.hash)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                        {result.hash}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab HMAC */}
        <TabsContent value="hmac">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                HMAC (Hash-based Message Authentication Code)
              </CardTitle>
              <CardDescription>
                <Tooltip content="HMAC ajoute une clé secrète au hash pour authentifier le message">
                  Calculez des HMACs avec une clé secrète
                </Tooltip>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Message</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Entrez votre message..."
                  className="min-h-[100px] font-mono"
                />
              </div>

              <div>
                <Label>
                  <Tooltip content="Clé secrète utilisée pour l'authentification">
                    Clé secrète
                  </Tooltip>
                </Label>
                <Input
                  type="password"
                  value={hmacKey}
                  onChange={(e) => setHmacKey(e.target.value)}
                  placeholder="Entrez votre clé secrète..."
                />
              </div>

              <Button onClick={calculateHMACHashes} disabled={!input || !hmacKey}>
                <Key className="h-4 w-4 mr-2" />
                Calculer les HMACs
              </Button>

              {hmacResults.length > 0 && (
                <div className="space-y-3 pt-4">
                  {hmacResults.map((result) => (
                    <div key={result.algorithm} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{result.algorithm}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyHash(result.hash)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                        {result.hash}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Vérifier */}
        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Vérification de hash
              </CardTitle>
              <CardDescription>Vérifiez si un hash correspond à un texte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Texte original</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Entrez le texte original..."
                  className="min-h-[100px] font-mono"
                />
              </div>

              <div>
                <Label>Hash à vérifier</Label>
                <Input
                  value={verifyHash}
                  onChange={(e) => setVerifyHash(e.target.value)}
                  placeholder="Collez le hash à vérifier..."
                  className="font-mono"
                />
              </div>

              <Button onClick={verifyHashMatch} disabled={!input || !verifyHash}>
                <Check className="h-4 w-4 mr-2" />
                Vérifier le hash
              </Button>

              {verifyResult && (
                <div className={`p-4 rounded-lg ${verifyResult === 'invalid' ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                  {verifyResult === 'invalid' ? (
                    <div className="flex items-center gap-2 text-destructive">
                      <span className="text-2xl">✗</span>
                      <div>
                        <p className="font-semibold">Hash invalide</p>
                        <p className="text-sm">Le hash ne correspond à aucun algorithme connu</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="text-2xl">✓</span>
                      <div>
                        <p className="font-semibold">Hash valide !</p>
                        <p className="text-sm">Algorithme détecté: <Badge>{verifyResult}</Badge></p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Benchmark */}
        <TabsContent value="benchmark">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Benchmark des algorithmes
              </CardTitle>
              <CardDescription>
                <Tooltip content="Compare la vitesse de tous les algorithmes sur 1000 itérations">
                  Comparez les performances des algorithmes
                </Tooltip>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Texte de test</Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Entrez un texte pour le benchmark..."
                  className="min-h-[100px] font-mono"
                />
              </div>

              <Button onClick={runBenchmark} disabled={!input}>
                <Clock className="h-4 w-4 mr-2" />
                Lancer le benchmark (1000 itérations)
              </Button>

              {benchmarkProgress > 0 && benchmarkProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{benchmarkProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={benchmarkProgress} />
                </div>
              )}

              {benchmarkResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Résultats (classés par vitesse)</Label>
                  {benchmarkResults.map((result, idx) => (
                    <div key={result.algorithm} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-3">
                        <Badge variant={idx === 0 ? "default" : "secondary"}>
                          #{idx + 1}
                        </Badge>
                        <span className="font-medium">{result.algorithm}</span>
                      </div>
                      <Badge variant="outline">
                        {result.time.toFixed(3)}ms / itération
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Historique */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historique (20 derniers)</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((entry) => (
                <div key={entry.id} className="p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.type}</Badge>
                      <span className="text-sm font-mono">{entry.input}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.results.length} algorithmes calculés
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </ToolPageLayout>
  );
}
