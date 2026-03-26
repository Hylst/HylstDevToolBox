import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Copy, Download, QrCode, Link, Mail, Phone, Wifi, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/Tooltip";
import QRCodeLib from "qrcode";

const QrCodeGenerator = () => {
  const [content, setContent] = useState("https://example.com");
  const [size, setSize] = useState(256);
  const [errorCorrection, setErrorCorrection] = useState("M");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Presets
  const [urlInput, setUrlInput] = useState("https://");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA");
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardOrg, setVcardOrg] = useState("");

  useEffect(() => {
    if (!content || !canvasRef.current) return;
    QRCodeLib.toCanvas(canvasRef.current, content, {
      width: size,
      margin: 2,
      errorCorrectionLevel: errorCorrection as "L" | "M" | "Q" | "H",
      color: { dark: foregroundColor, light: backgroundColor },
    }).catch(() => {});
  }, [content, size, errorCorrection, foregroundColor, backgroundColor]);

  const downloadQRCode = async (format: 'png' | 'svg') => {
    if (format === 'png') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      try {
        const svgStr = await QRCodeLib.toString(content, {
          type: 'svg',
          width: size,
          margin: 2,
          errorCorrectionLevel: errorCorrection as "L" | "M" | "Q" | "H",
          color: { dark: foregroundColor, light: backgroundColor },
        });
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = 'qrcode.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
      } catch { /* ignore */ }
    }
    toast.success(`QR Code téléchargé en ${format.toUpperCase()}`);
  };

  const applyPreset = (type: string) => {
    let newContent = '';
    
    switch (type) {
      case 'url':
        newContent = urlInput;
        break;
      case 'email':
        newContent = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;
      case 'phone':
        newContent = `tel:${phoneNumber}`;
        break;
      case 'wifi':
        newContent = `WIFI:T:${wifiSecurity};S:${wifiSsid};P:${wifiPassword};;`;
        break;
      case 'vcard':
        newContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${vcardOrg}\nEND:VCARD`;
        break;
    }
    
    setContent(newContent);
    toast.success("Contenu appliqué");
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Générateur de <Tooltip term="QR Code">QR Code</Tooltip>
        </h1>
        <p className="text-muted-foreground">
          Créez des QR codes personnalisés pour URLs, emails, WiFi, contacts et plus
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Tabs defaultValue="text" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="text">Texte</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="wifi">WiFi</TabsTrigger>
              <TabsTrigger value="vcard">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Texte libre</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Entrez votre texte..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="url">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Link className="h-4 w-4" />
                    URL
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                  />
                  <Button onClick={() => applyPreset('url')} className="w-full">
                    Appliquer
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-4 w-4" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Destinataire</Label>
                    <Input
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label>Sujet</Label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Sujet de l'email"
                    />
                  </div>
                  <div>
                    <Label>Corps</Label>
                    <Textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Contenu de l'email"
                      rows={2}
                    />
                  </div>
                  <Button onClick={() => applyPreset('email')} className="w-full">
                    Appliquer
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wifi">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wifi className="h-4 w-4" />
                    Réseau WiFi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>SSID (nom du réseau)</Label>
                    <Input
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MonWiFi"
                    />
                  </div>
                  <div>
                    <Label>Mot de passe</Label>
                    <Input
                      type="password"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <Label>Sécurité</Label>
                    <Select value={wifiSecurity} onValueChange={setWifiSecurity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WPA">WPA/WPA2</SelectItem>
                        <SelectItem value="WEP">WEP</SelectItem>
                        <SelectItem value="nopass">Aucune</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => applyPreset('wifi')} className="w-full">
                    Appliquer
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vcard">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-4 w-4" />
                    Carte de visite
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Nom complet</Label>
                    <Input
                      value={vcardName}
                      onChange={(e) => setVcardName(e.target.value)}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      placeholder="jean@example.com"
                    />
                  </div>
                  <div>
                    <Label>Organisation</Label>
                    <Input
                      value={vcardOrg}
                      onChange={(e) => setVcardOrg(e.target.value)}
                      placeholder="Entreprise"
                    />
                  </div>
                  <Button onClick={() => applyPreset('vcard')} className="w-full">
                    Appliquer
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personnalisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Taille: {size}px</Label>
                <Slider
                  value={[size]}
                  onValueChange={([v]) => setSize(v)}
                  min={128}
                  max={512}
                  step={32}
                />
              </div>

              <div>
                <Label>Correction d'erreur</Label>
                <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">L - 7% (faible)</SelectItem>
                    <SelectItem value="M">M - 15% (moyen)</SelectItem>
                    <SelectItem value="Q">Q - 25% (quartile)</SelectItem>
                    <SelectItem value="H">H - 30% (élevé)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Couleur premier plan</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label>Couleur arrière-plan</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Aperçu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-lg shadow-inner">
                  <canvas ref={canvasRef} className="max-w-full" />
                </div>
                
                <div className="flex gap-3 w-full">
                  <Button onClick={() => downloadQRCode('png')} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    PNG
                  </Button>
                  <Button onClick={() => downloadQRCode('svg')} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    SVG
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contenu encodé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-muted/50 rounded-lg">
                <code className="text-sm break-all">{content}</code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(content);
                  toast.success("Contenu copié");
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier le contenu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QrCodeGenerator;
