import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Globe, Check, X, Network, BookOpen } from "lucide-react";

const reservedRanges = [
  { range: "0.0.0.0/8", name: "Current network", rfc: "RFC 1122" },
  { range: "10.0.0.0/8", name: "Privé (Classe A)", rfc: "RFC 1918" },
  { range: "100.64.0.0/10", name: "Shared address space", rfc: "RFC 6598" },
  { range: "127.0.0.0/8", name: "Loopback", rfc: "RFC 1122" },
  { range: "169.254.0.0/16", name: "Link-local", rfc: "RFC 3927" },
  { range: "172.16.0.0/12", name: "Privé (Classe B)", rfc: "RFC 1918" },
  { range: "192.0.0.0/24", name: "IETF Protocol Assignments", rfc: "RFC 6890" },
  { range: "192.0.2.0/24", name: "Documentation (TEST-NET-1)", rfc: "RFC 5737" },
  { range: "192.168.0.0/16", name: "Privé (Classe C)", rfc: "RFC 1918" },
  { range: "198.18.0.0/15", name: "Benchmarking", rfc: "RFC 2544" },
  { range: "224.0.0.0/4", name: "Multicast", rfc: "RFC 5771" },
  { range: "240.0.0.0/4", name: "Réservé (futur)", rfc: "RFC 1112" },
  { range: "255.255.255.255/32", name: "Broadcast limité", rfc: "RFC 919" },
];

function ipv4ToNum(ip: string): number {
  return ip.split(".").reduce((acc, o, i) => acc + (Number(o) << (24 - i * 8)), 0) >>> 0;
}
function numToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}
function isValidIPv4(ip: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && ip.split(".").every(n => Number(n) <= 255);
}
function isValidIPv6(ip: string): boolean {
  // Basic validation for expanded and compressed IPv6
  const expanded = ip.replace(/::/g, () => ":" + Array(9 - ip.split(":").filter(Boolean).length).fill("0").join(":") + ":");
  const clean = expanded.replace(/^:|:$/g, "");
  const parts = clean.split(":");
  return parts.length === 8 && parts.every(p => /^[0-9a-fA-F]{1,4}$/.test(p));
}
function expandIPv6(ip: string): string {
  let expanded = ip;
  if (expanded.includes("::")) {
    const parts = expanded.split("::");
    const left = parts[0] ? parts[0].split(":") : [];
    const right = parts[1] ? parts[1].split(":") : [];
    const fill = 8 - left.length - right.length;
    expanded = [...left, ...Array(fill).fill("0000"), ...right].join(":");
  }
  return expanded.split(":").map(p => p.padStart(4, "0")).join(":");
}

export default function IpAnalyzer() {
  const [ip, setIp] = useState("192.168.1.100");
  const [cidr, setCidr] = useState("24");
  const [splitTo, setSplitTo] = useState("26");

  const ipv4Analysis = useMemo(() => {
    if (!isValidIPv4(ip)) return null;
    const octets = ip.split(".").map(Number);
    const prefix = parseInt(cidr) || 24;
    if (prefix < 0 || prefix > 32) return null;
    const mask = prefix === 0 ? 0 : ~((1 << (32 - prefix)) - 1) >>> 0;
    const wildcard = (~mask) >>> 0;
    const ipNum = ipv4ToNum(ip);
    const network = (ipNum & mask) >>> 0;
    const broadcast = (network | ~mask) >>> 0;
    const isPrivate = (octets[0] === 10) || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || (octets[0] === 192 && octets[1] === 168);
    const isLoopback = octets[0] === 127;
    const isMulticast = octets[0] >= 224 && octets[0] <= 239;
    const cls = octets[0] < 128 ? "A" : octets[0] < 192 ? "B" : octets[0] < 224 ? "C" : octets[0] < 240 ? "D" : "E";
    const hostCount = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.pow(2, 32 - prefix) - 2;

    return {
      valid: true, isPrivate, isLoopback, isMulticast, class: cls,
      networkAddr: numToIp(network),
      broadcastAddr: numToIp(broadcast),
      subnetMask: numToIp(mask),
      wildcardMask: numToIp(wildcard),
      hostCount,
      firstHost: prefix >= 31 ? numToIp(network) : numToIp(network + 1),
      lastHost: prefix >= 31 ? numToIp(broadcast) : numToIp(broadcast - 1),
      binary: octets.map(o => o.toString(2).padStart(8, "0")).join("."),
    };
  }, [ip, cidr]);

  const ipv6Analysis = useMemo(() => {
    if (!isValidIPv6(ip)) return null;
    const expanded = expandIPv6(ip);
    const compressed = ip;
    return { expanded, compressed, type: ip.startsWith("fe80") ? "Link-local" : ip.startsWith("fc") || ip.startsWith("fd") ? "Unique local" : ip === "::1" ? "Loopback" : "Global unicast" };
  }, [ip]);

  const subnets = useMemo(() => {
    if (!ipv4Analysis) return [];
    const parentPrefix = parseInt(cidr) || 24;
    const targetPrefix = parseInt(splitTo);
    if (targetPrefix <= parentPrefix || targetPrefix > 32) return [];
    const network = ipv4ToNum(ipv4Analysis.networkAddr);
    const subnetSize = Math.pow(2, 32 - targetPrefix);
    const count = Math.pow(2, targetPrefix - parentPrefix);
    const result = [];
    for (let i = 0; i < Math.min(count, 64); i++) {
      const start = (network + i * subnetSize) >>> 0;
      const end = (start + subnetSize - 1) >>> 0;
      result.push({
        network: numToIp(start) + "/" + targetPrefix,
        first: targetPrefix >= 31 ? numToIp(start) : numToIp(start + 1),
        last: targetPrefix >= 31 ? numToIp(end) : numToIp(end - 1),
        broadcast: numToIp(end),
        hosts: targetPrefix >= 31 ? (targetPrefix === 32 ? 1 : 2) : subnetSize - 2,
      });
    }
    return result;
  }, [ipv4Analysis, cidr, splitTo]);

  const isV6 = !isValidIPv4(ip) && isValidIPv6(ip);
  const isInvalid = !isValidIPv4(ip) && !isValidIPv6(ip);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Globe className="h-8 w-8 text-primary" />IP Analyzer
      </h1>

      <Card className="mb-6">
        <CardContent className="pt-6 flex gap-4 items-end">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Adresse IPv4 ou IPv6</Label>
            <Input value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.1 ou 2001:db8::1" className="font-mono" />
          </div>
          {!isV6 && (
            <>
              <span className="text-2xl text-muted-foreground pb-1">/</span>
              <div className="w-20">
                <Label className="text-xs text-muted-foreground">CIDR</Label>
                <Input value={cidr} onChange={e => setCidr(e.target.value)} placeholder="24" className="font-mono" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isInvalid && (
        <Card><CardContent className="py-8 text-center text-destructive flex items-center justify-center gap-2"><X className="h-5 w-5" />Adresse IP invalide</CardContent></Card>
      )}

      {isV6 && ipv6Analysis && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card><CardContent className="pt-4"><span className="text-muted-foreground text-sm">Type</span><div className="flex items-center gap-2 mt-1"><Check className="h-4 w-4 text-green-500" />IPv6 — {ipv6Analysis.type}</div></CardContent></Card>
          <Card><CardContent className="pt-4"><span className="text-muted-foreground text-sm">Étendue</span><p className="font-mono text-sm mt-1 break-all">{ipv6Analysis.expanded}</p></CardContent></Card>
        </div>
      )}

      {!isV6 && ipv4Analysis && (
        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analysis"><Globe className="h-4 w-4 mr-1" />Analyse</TabsTrigger>
            <TabsTrigger value="subnets"><Network className="h-4 w-4 mr-1" />Sous-réseaux</TabsTrigger>
            <TabsTrigger value="ranges"><BookOpen className="h-4 w-4 mr-1" />Plages réservées</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            <div className="grid md:grid-cols-2 gap-4">
              <Card><CardContent className="pt-4"><span className="text-muted-foreground text-sm">Validité</span><div className="flex items-center gap-2 mt-1"><Check className="h-4 w-4 text-green-500" />IPv4 valide — Classe {ipv4Analysis.class}</div></CardContent></Card>
              <Card><CardContent className="pt-4"><span className="text-muted-foreground text-sm">Type</span><div className="flex gap-2 mt-1">
                <Badge variant={ipv4Analysis.isPrivate ? "secondary" : "default"}>{ipv4Analysis.isPrivate ? "Privée" : "Publique"}</Badge>
                {ipv4Analysis.isLoopback && <Badge variant="outline">Loopback</Badge>}
                {ipv4Analysis.isMulticast && <Badge variant="outline">Multicast</Badge>}
              </div></CardContent></Card>
              <Card><CardContent className="pt-4"><span className="text-muted-foreground text-sm">Réseau</span><p className="font-mono mt-1">{ipv4Analysis.networkAddr}</p></CardContent></Card>
              <Card><CardContent className="pt-4"><span className="text-muted-foreground text-sm">Broadcast</span><p className="font-mono mt-1">{ipv4Analysis.broadcastAddr}</p></CardContent></Card>
              <Card><CardContent className="pt-4"><span className="text-muted-foreground text-sm">Masque</span><p className="font-mono mt-1">{ipv4Analysis.subnetMask}</p></CardContent></Card>
              <Card><CardContent className="pt-4"><span className="text-muted-foreground text-sm">Wildcard</span><p className="font-mono mt-1">{ipv4Analysis.wildcardMask}</p></CardContent></Card>
              <Card><CardContent className="pt-4"><span className="text-muted-foreground text-sm">Hôtes disponibles</span><p className="font-mono mt-1">{ipv4Analysis.hostCount.toLocaleString()}</p></CardContent></Card>
              <Card><CardContent className="pt-4"><span className="text-muted-foreground text-sm">Plage d'hôtes</span><p className="font-mono text-sm mt-1">{ipv4Analysis.firstHost} → {ipv4Analysis.lastHost}</p></CardContent></Card>
              <Card className="md:col-span-2"><CardContent className="pt-4"><span className="text-muted-foreground text-sm">Binaire</span><p className="font-mono text-sm mt-1 break-all">{ipv4Analysis.binary}</p></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="subnets">
            <Card className="mb-4">
              <CardContent className="pt-6 flex items-end gap-4">
                <div>
                  <Label className="text-xs">Réseau parent</Label>
                  <div className="font-mono text-sm mt-1">{ipv4Analysis.networkAddr}/{cidr}</div>
                </div>
                <div>
                  <Label className="text-xs">Découper en /{splitTo}</Label>
                  <Input value={splitTo} onChange={e => setSplitTo(e.target.value)} className="font-mono w-20" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {subnets.length > 0 && `${subnets.length} sous-réseaux, ${subnets[0]?.hosts} hôtes chacun`}
                </div>
              </CardContent>
            </Card>
            {subnets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    <th className="text-left p-2 font-medium text-muted-foreground">Réseau</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Premier hôte</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Dernier hôte</th>
                    <th className="text-left p-2 font-medium text-muted-foreground">Broadcast</th>
                    <th className="text-right p-2 font-medium text-muted-foreground">Hôtes</th>
                  </tr></thead>
                  <tbody>
                    {subnets.map((s, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-2 font-mono">{s.network}</td>
                        <td className="p-2 font-mono">{s.first}</td>
                        <td className="p-2 font-mono">{s.last}</td>
                        <td className="p-2 font-mono">{s.broadcast}</td>
                        <td className="p-2 font-mono text-right">{s.hosts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Entrez un préfixe cible supérieur à /{cidr} pour découper le réseau</CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="ranges">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left p-2 font-medium text-muted-foreground">Plage</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Nom</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">RFC</th>
                </tr></thead>
                <tbody>
                  {reservedRanges.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-2 font-mono">{r.range}</td>
                      <td className="p-2">{r.name}</td>
                      <td className="p-2"><Badge variant="outline" className="text-xs">{r.rfc}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
