import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, ArrowRightLeft, Calculator, Binary } from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/Tooltip";

const NumberBaseConverter = () => {
  const [decimal, setDecimal] = useState("255");
  const [binary, setBinary] = useState("11111111");
  const [octal, setOctal] = useState("377");
  const [hexadecimal, setHexadecimal] = useState("FF");
  const [customBase, setCustomBase] = useState("");
  const [customBaseValue, setCustomBaseValue] = useState(36);
  const [lastEdited, setLastEdited] = useState<string>("decimal");

  const [bitwiseA, setBitwiseA] = useState("10101010");
  const [bitwiseB, setBitwiseB] = useState("11001100");
  const [bitwiseResults, setBitwiseResults] = useState({
    and: "",
    or: "",
    xor: "",
    notA: "",
    notB: "",
    leftShift: "",
    rightShift: ""
  });

  const isValidNumber = (value: string, base: number): boolean => {
    if (!value) return true;
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, base);
    const regex = new RegExp(`^[${chars}]+$`, 'i');
    return regex.test(value);
  };

  const convertFromDecimal = (dec: number) => {
    if (isNaN(dec) || dec < 0) return;
    
    setBinary(dec.toString(2));
    setOctal(dec.toString(8));
    setHexadecimal(dec.toString(16).toUpperCase());
    setCustomBase(dec.toString(customBaseValue).toUpperCase());
  };

  const updateFromDecimal = (value: string) => {
    setDecimal(value);
    setLastEdited("decimal");
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      convertFromDecimal(num);
    }
  };

  const updateFromBinary = (value: string) => {
    if (!isValidNumber(value, 2)) return;
    setBinary(value);
    setLastEdited("binary");
    const num = parseInt(value, 2);
    if (!isNaN(num)) {
      setDecimal(num.toString());
      setOctal(num.toString(8));
      setHexadecimal(num.toString(16).toUpperCase());
      setCustomBase(num.toString(customBaseValue).toUpperCase());
    }
  };

  const updateFromOctal = (value: string) => {
    if (!isValidNumber(value, 8)) return;
    setOctal(value);
    setLastEdited("octal");
    const num = parseInt(value, 8);
    if (!isNaN(num)) {
      setDecimal(num.toString());
      setBinary(num.toString(2));
      setHexadecimal(num.toString(16).toUpperCase());
      setCustomBase(num.toString(customBaseValue).toUpperCase());
    }
  };

  const updateFromHex = (value: string) => {
    if (!isValidNumber(value, 16)) return;
    setHexadecimal(value.toUpperCase());
    setLastEdited("hex");
    const num = parseInt(value, 16);
    if (!isNaN(num)) {
      setDecimal(num.toString());
      setBinary(num.toString(2));
      setOctal(num.toString(8));
      setCustomBase(num.toString(customBaseValue).toUpperCase());
    }
  };

  const updateFromCustom = (value: string) => {
    if (!isValidNumber(value, customBaseValue)) return;
    setCustomBase(value.toUpperCase());
    setLastEdited("custom");
    const num = parseInt(value, customBaseValue);
    if (!isNaN(num)) {
      setDecimal(num.toString());
      setBinary(num.toString(2));
      setOctal(num.toString(8));
      setHexadecimal(num.toString(16).toUpperCase());
    }
  };

  useEffect(() => {
    // Recalculate custom base when base changes
    const num = parseInt(decimal, 10);
    if (!isNaN(num) && num >= 0) {
      setCustomBase(num.toString(customBaseValue).toUpperCase());
    }
  }, [customBaseValue]);

  useEffect(() => {
    // Calculate bitwise operations
    const a = parseInt(bitwiseA, 2);
    const b = parseInt(bitwiseB, 2);
    
    if (!isNaN(a) && !isNaN(b)) {
      const maxBits = Math.max(bitwiseA.length, bitwiseB.length, 8);
      setBitwiseResults({
        and: (a & b).toString(2).padStart(maxBits, '0'),
        or: (a | b).toString(2).padStart(maxBits, '0'),
        xor: (a ^ b).toString(2).padStart(maxBits, '0'),
        notA: (~a >>> 0).toString(2).slice(-maxBits),
        notB: (~b >>> 0).toString(2).slice(-maxBits),
        leftShift: (a << 1).toString(2).padStart(maxBits + 1, '0'),
        rightShift: (a >> 1).toString(2).padStart(maxBits - 1, '0')
      });
    }
  }, [bitwiseA, bitwiseB]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié`);
  };

  const formatBinary = (bin: string): string => {
    return bin.replace(/(.{4})/g, '$1 ').trim();
  };

  const presets = [
    { label: "Byte max", decimal: "255" },
    { label: "Kilobyte", decimal: "1024" },
    { label: "Megabyte", decimal: "1048576" },
    { label: "IPv4 max", decimal: "4294967295" },
    { label: "0xFF", decimal: "255" },
    { label: "0x100", decimal: "256" },
    { label: "ASCII 'A'", decimal: "65" },
    { label: "ASCII 'a'", decimal: "97" },
  ];

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Convertisseur de <Tooltip term="Base numérique">Bases Numériques</Tooltip>
        </h1>
        <p className="text-muted-foreground">
          Convertissez entre décimal, binaire, octal, hexadécimal et bases personnalisées
        </p>
      </div>

      <Tabs defaultValue="converter" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Convertisseur</TabsTrigger>
          <TabsTrigger value="bitwise">Opérations Bitwise</TabsTrigger>
        </TabsList>

        <TabsContent value="converter" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Bases standards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Décimal (base 10)</Label>
                    <Badge variant={lastEdited === "decimal" ? "default" : "outline"}>DEC</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={decimal}
                      onChange={(e) => updateFromDecimal(e.target.value.replace(/[^0-9]/g, ''))}
                      className="font-mono text-lg"
                      placeholder="0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(decimal, "Décimal")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Binaire (base 2)</Label>
                    <Badge variant={lastEdited === "binary" ? "default" : "outline"}>BIN</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={binary}
                      onChange={(e) => updateFromBinary(e.target.value.replace(/[^01]/g, ''))}
                      className="font-mono text-lg"
                      placeholder="0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(binary, "Binaire")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {formatBinary(binary)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Octal (base 8)</Label>
                    <Badge variant={lastEdited === "octal" ? "default" : "outline"}>OCT</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={octal}
                      onChange={(e) => updateFromOctal(e.target.value.replace(/[^0-7]/g, ''))}
                      className="font-mono text-lg"
                      placeholder="0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(octal, "Octal")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Hexadécimal (base 16)</Label>
                    <Badge variant={lastEdited === "hex" ? "default" : "outline"}>HEX</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={hexadecimal}
                      onChange={(e) => updateFromHex(e.target.value.replace(/[^0-9A-Fa-f]/g, ''))}
                      className="font-mono text-lg"
                      placeholder="0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(hexadecimal, "Hex")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    0x{hexadecimal}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-1">
                    <Label>Base personnalisée ({customBaseValue})</Label>
                    <Badge variant={lastEdited === "custom" ? "default" : "outline"}>B{customBaseValue}</Badge>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      type="number"
                      min={2}
                      max={36}
                      value={customBaseValue}
                      onChange={(e) => setCustomBaseValue(Math.min(36, Math.max(2, parseInt(e.target.value) || 2)))}
                      className="w-20"
                    />
                    <Input
                      value={customBase}
                      onChange={(e) => updateFromCustom(e.target.value)}
                      className="font-mono text-lg flex-1"
                      placeholder="0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(customBase, "Custom")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Presets rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        onClick={() => updateFromDecimal(preset.decimal)}
                        className="justify-start"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Représentation des bits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-8 gap-1 mb-2">
                      {binary.padStart(Math.max(8, Math.ceil(binary.length / 8) * 8), '0').split('').map((bit, i) => (
                        <div
                          key={i}
                          className={`aspect-square flex items-center justify-center text-sm font-mono rounded ${
                            bit === '1' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}
                        >
                          {bit}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {binary.length} bits
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Formats de programmation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <code className="text-sm">0b{binary}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`0b${binary}`, "Binary")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <code className="text-sm">0o{octal}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`0o${octal}`, "Octal")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <code className="text-sm">0x{hexadecimal}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`0x${hexadecimal}`, "Hex")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bitwise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Binary className="h-5 w-5" />
                Opérations Bitwise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Valeur A (binaire)</Label>
                  <Input
                    value={bitwiseA}
                    onChange={(e) => setBitwiseA(e.target.value.replace(/[^01]/g, ''))}
                    className="font-mono"
                    placeholder="10101010"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    = {parseInt(bitwiseA, 2) || 0} (décimal)
                  </div>
                </div>
                <div>
                  <Label>Valeur B (binaire)</Label>
                  <Input
                    value={bitwiseB}
                    onChange={(e) => setBitwiseB(e.target.value.replace(/[^01]/g, ''))}
                    className="font-mono"
                    placeholder="11001100"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    = {parseInt(bitwiseB, 2) || 0} (décimal)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: "AND (A & B)", value: bitwiseResults.and, op: "&" },
                  { label: "OR (A | B)", value: bitwiseResults.or, op: "|" },
                  { label: "XOR (A ^ B)", value: bitwiseResults.xor, op: "^" },
                  { label: "NOT A (~A)", value: bitwiseResults.notA, op: "~" },
                  { label: "Left Shift (A << 1)", value: bitwiseResults.leftShift, op: "<<" },
                  { label: "Right Shift (A >> 1)", value: bitwiseResults.rightShift, op: ">>" },
                ].map((result) => (
                  <div key={result.label} className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">{result.label}</div>
                    <div className="font-mono text-lg">{result.value || '0'}</div>
                    <div className="text-xs text-muted-foreground">
                      = {parseInt(result.value, 2) || 0}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Référence des opérateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="p-2 bg-muted/50 rounded">
                    <code className="font-bold">&</code> AND - 1 si les deux bits sont 1
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <code className="font-bold">|</code> OR - 1 si au moins un bit est 1
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <code className="font-bold">^</code> XOR - 1 si les bits sont différents
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-2 bg-muted/50 rounded">
                    <code className="font-bold">~</code> NOT - Inverse tous les bits
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <code className="font-bold">&lt;&lt;</code> Left Shift - Décale à gauche
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <code className="font-bold">&gt;&gt;</code> Right Shift - Décale à droite
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NumberBaseConverter;
