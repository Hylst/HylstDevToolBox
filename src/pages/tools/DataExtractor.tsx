import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Copy, 
  Download,
  Mail,
  Link as LinkIcon,
  Hash,
  Phone,
  CreditCard,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function DataExtractor() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const patterns = {
    emails: /[\w.-]+@[\w.-]+\.\w+/g,
    urls: /https?:\/\/[^\s]+/g,
    ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    ipv6: /(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/g,
    phones: /(?:\+?[\d\s-()]{10,})/g,
    creditCards: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    dates: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
    times: /\b\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM|am|pm)?\b/g,
    numbers: /\b\d+(?:\.\d+)?\b/g,
    hashtags: /#\w+/g,
    mentions: /@\w+/g,
    hexColors: /#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/g,
    uuids: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    macAddresses: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g,
    bitcoinAddresses: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,
  };

  const extractData = (pattern: RegExp) => {
    const matches = text.match(pattern);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const copyToClipboard = (data: string[]) => {
    navigator.clipboard.writeText(data.join('\n'));
    toast({
      title: "Copié !",
      description: `${data.length} élément(s) copié(s) dans le presse-papiers.`,
    });
  };

  const downloadData = (data: string[], filename: string) => {
    const blob = new Blob([data.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargé",
      description: "Les données ont été téléchargées avec succès.",
    });
  };

  const downloadCSV = () => {
    const emails = extractData(patterns.emails);
    const urls = extractData(patterns.urls);
    const phones = extractData(patterns.phones);
    
    let csv = "Type,Valeur\n";
    emails.forEach(e => csv += `Email,${e}\n`);
    urls.forEach(u => csv += `URL,${u}\n`);
    phones.forEach(p => csv += `Téléphone,${p}\n`);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donnees-extraites.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "CSV exporté",
      description: "Les données ont été exportées au format CSV.",
    });
  };

  const downloadJSON = () => {
    const data = {
      emails: extractData(patterns.emails),
      urls: extractData(patterns.urls),
      phones: extractData(patterns.phones),
      ipv4: extractData(patterns.ipv4),
      ipv6: extractData(patterns.ipv6),
      dates: extractData(patterns.dates),
      times: extractData(patterns.times),
      numbers: extractData(patterns.numbers),
      hashtags: extractData(patterns.hashtags),
      mentions: extractData(patterns.mentions),
      hexColors: extractData(patterns.hexColors),
      uuids: extractData(patterns.uuids),
      macAddresses: extractData(patterns.macAddresses),
      bitcoinAddresses: extractData(patterns.bitcoinAddresses),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donnees-extraites.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "JSON exporté",
      description: "Les données ont été exportées au format JSON.",
    });
  };

  const DataCard = ({ 
    title, 
    icon: Icon, 
    pattern, 
    filename,
    description 
  }: { 
    title: string; 
    icon: any; 
    pattern: RegExp;
    filename: string;
    description: string;
  }) => {
    const data = extractData(pattern);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {title}
            <Badge variant="secondary" className="ml-auto">{data.length}</Badge>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <>
              <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                {data.map((item, index) => (
                  <div key={index} className="p-2 bg-muted rounded font-mono text-sm break-all">
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => copyToClipboard(data)} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copier tout
                </Button>
                <Button onClick={() => downloadData(data, filename)} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucun élément trouvé
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          Extracteur de Données
        </h1>
        <p className="text-muted-foreground">
          Extrayez automatiquement emails, URLs, numéros et autres données structurées
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Texte à analyser</CardTitle>
          <CardDescription>
            Collez votre texte contenant des données à extraire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Collez votre texte ici... Il peut contenir des emails, URLs, numéros de téléphone, etc."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] font-mono"
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={downloadCSV} variant="outline" size="sm" disabled={!text}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
            <Button onClick={downloadJSON} variant="outline" size="sm" disabled={!text}>
              <Download className="h-4 w-4 mr-2" />
              Exporter JSON
            </Button>
            <Badge variant="secondary" className="ml-auto">
              {text.length} caractères
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="technical">Technique</TabsTrigger>
          <TabsTrigger value="dates">Dates & Temps</TabsTrigger>
          <TabsTrigger value="social">Social & Divers</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <DataCard
              title="Emails"
              icon={Mail}
              pattern={patterns.emails}
              filename="emails.txt"
              description="Adresses email détectées"
            />
            <DataCard
              title="Téléphones"
              icon={Phone}
              pattern={patterns.phones}
              filename="telephones.txt"
              description="Numéros de téléphone détectés"
            />
            <DataCard
              title="Cartes bancaires"
              icon={CreditCard}
              pattern={patterns.creditCards}
              filename="cartes.txt"
              description="Numéros de cartes détectés (format: XXXX XXXX XXXX XXXX)"
            />
          </div>
        </TabsContent>

        <TabsContent value="technical" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <DataCard
              title="URLs"
              icon={LinkIcon}
              pattern={patterns.urls}
              filename="urls.txt"
              description="Liens web détectés"
            />
            <DataCard
              title="Adresses IPv4"
              icon={MapPin}
              pattern={patterns.ipv4}
              filename="ipv4.txt"
              description="Adresses IPv4 détectées"
            />
            <DataCard
              title="Adresses IPv6"
              icon={MapPin}
              pattern={patterns.ipv6}
              filename="ipv6.txt"
              description="Adresses IPv6 détectées"
            />
            <DataCard
              title="Nombres"
              icon={Hash}
              pattern={patterns.numbers}
              filename="nombres.txt"
              description="Valeurs numériques détectées"
            />
            <DataCard
              title="Couleurs Hex"
              icon={Hash}
              pattern={patterns.hexColors}
              filename="couleurs.txt"
              description="Codes couleurs hexadécimaux (#RRGGBB)"
            />
            <DataCard
              title="UUIDs"
              icon={Hash}
              pattern={patterns.uuids}
              filename="uuids.txt"
              description="Identifiants uniques universels"
            />
            <DataCard
              title="Adresses MAC"
              icon={MapPin}
              pattern={patterns.macAddresses}
              filename="mac-addresses.txt"
              description="Adresses MAC réseau"
            />
            <DataCard
              title="Adresses Bitcoin"
              icon={Hash}
              pattern={patterns.bitcoinAddresses}
              filename="bitcoin.txt"
              description="Adresses de portefeuilles Bitcoin"
            />
          </div>
        </TabsContent>

        <TabsContent value="dates" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <DataCard
              title="Dates"
              icon={Hash}
              pattern={patterns.dates}
              filename="dates.txt"
              description="Dates détectées (format: JJ/MM/AAAA ou JJ-MM-AAAA)"
            />
            <DataCard
              title="Heures"
              icon={Hash}
              pattern={patterns.times}
              filename="heures.txt"
              description="Heures détectées (format: HH:MM ou HH:MM:SS)"
            />
          </div>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <DataCard
              title="Hashtags"
              icon={Hash}
              pattern={patterns.hashtags}
              filename="hashtags.txt"
              description="Hashtags détectés (#exemple)"
            />
            <DataCard
              title="Mentions"
              icon={Mail}
              pattern={patterns.mentions}
              filename="mentions.txt"
              description="Mentions détectées (@utilisateur)"
            />
            <DataCard
              title="Dates"
              icon={Hash}
              pattern={patterns.dates}
              filename="dates.txt"
              description="Dates détectées (format: JJ/MM/AAAA)"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
