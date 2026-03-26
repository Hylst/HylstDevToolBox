import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Globe, Copy, Trash2, Send, Clock, FileCode, Play } from "lucide-react";

interface WebhookEvent {
  id: string;
  timestamp: Date;
  method: string;
  headers: Record<string, string>;
  body: string;
  query: Record<string, string>;
}

const webhookTemplates = {
  stripe: {
    name: "Stripe Payment",
    method: "POST",
    headers: { "Content-Type": "application/json", "Stripe-Signature": "t=1234567890,v1=abc123..." },
    body: JSON.stringify({
      id: "evt_1234567890",
      object: "event",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_1234567890",
          amount: 2000,
          currency: "eur",
          status: "succeeded",
          customer: "cus_abc123",
        },
      },
      created: 1234567890,
      livemode: false,
    }, null, 2),
  },
  github: {
    name: "GitHub Push",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-GitHub-Event": "push", "X-Hub-Signature-256": "sha256=abc123..." },
    body: JSON.stringify({
      ref: "refs/heads/main",
      before: "abc123",
      after: "def456",
      repository: { id: 1234, full_name: "user/repo", html_url: "https://github.com/user/repo" },
      pusher: { name: "dev", email: "dev@example.com" },
      commits: [
        { id: "def456", message: "feat: add new feature", timestamp: "2024-01-15T10:30:00Z", author: { name: "Dev", email: "dev@example.com" } },
      ],
    }, null, 2),
  },
  slack: {
    name: "Slack Event",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Slack-Signature": "v0=abc123...", "X-Slack-Request-Timestamp": "1234567890" },
    body: JSON.stringify({
      token: "abc123",
      team_id: "T1234",
      event: {
        type: "message",
        channel: "C1234",
        user: "U1234",
        text: "Hello from Slack!",
        ts: "1234567890.123456",
      },
      type: "event_callback",
      event_id: "Ev1234",
    }, null, 2),
  },
  discord: {
    name: "Discord Interaction",
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Signature-Ed25519": "abc123...", "X-Signature-Timestamp": "1234567890" },
    body: JSON.stringify({
      type: 2,
      id: "1234567890",
      application_id: "9876543210",
      token: "webhook_token_here",
      data: { id: "cmd_123", name: "hello", type: 1 },
      member: { user: { id: "123", username: "dev", discriminator: "0001" } },
      guild_id: "guild_123",
      channel_id: "channel_123",
    }, null, 2),
  },
  custom: {
    name: "Custom",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Hello webhook!", data: { key: "value" } }, null, 2),
  },
};

export default function WebhookTester() {
  const { toast } = useToast();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [template, setTemplate] = useState<keyof typeof webhookTemplates>("custom");
  const [method, setMethod] = useState("POST");
  const [customHeaders, setCustomHeaders] = useState('{"Content-Type": "application/json"}');
  const [customBody, setCustomBody] = useState(webhookTemplates.custom.body);
  const [endpointUrl] = useState(`https://webhook.example.dev/${crypto.randomUUID().slice(0, 8)}`);
  const eventIdRef = useRef(0);

  const applyTemplate = (key: keyof typeof webhookTemplates) => {
    setTemplate(key);
    const t = webhookTemplates[key];
    setMethod(t.method);
    setCustomHeaders(JSON.stringify(t.headers, null, 2));
    setCustomBody(t.body);
  };

  const simulateWebhook = () => {
    let headers: Record<string, string> = {};
    let body = customBody;
    try {
      headers = JSON.parse(customHeaders);
    } catch {
      headers = { "Content-Type": "application/json" };
    }

    const event: WebhookEvent = {
      id: `evt_${++eventIdRef.current}`,
      timestamp: new Date(),
      method,
      headers,
      body,
      query: {},
    };
    setEvents((prev) => [event, ...prev]);
    setSelectedEvent(event);
    toast({ title: "Webhook simulé", description: `${method} reçu à ${event.timestamp.toLocaleTimeString()}` });
  };

  const clearEvents = () => {
    setEvents([]);
    setSelectedEvent(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !" });
  };

  const generateHandlerCode = () => {
    const code = `// Express.js webhook handler
import express from 'express';
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  
  // Verify signature (implement based on provider)
  // if (!verifySignature(req.body, signature, secret)) {
  //   return res.status(401).json({ error: 'Invalid signature' });
  // }

  console.log('Webhook received:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  // Process the webhook event
  const event = req.body;
  switch (event.type) {
    case 'payment.completed':
      // Handle payment
      break;
    case 'user.created':
      // Handle new user
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }

  res.status(200).json({ received: true });
});

app.listen(3000, () => console.log('Webhook server on port 3000'));`;
    copyToClipboard(code);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          Webhook Tester
        </h1>
        <p className="text-muted-foreground mt-1">
          Simulez des webhooks avec des templates Stripe, GitHub, Slack et Discord
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Config */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Endpoint simulé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input value={endpointUrl} readOnly className="text-xs font-mono" />
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(endpointUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                URL simulée — les webhooks sont testés localement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(webhookTemplates).map(([key, t]) => (
                  <Button
                    key={key}
                    variant={template === key ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => applyTemplate(key as keyof typeof webhookTemplates)}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm font-medium">Headers (JSON)</label>
                <Textarea value={customHeaders} onChange={(e) => setCustomHeaders(e.target.value)} className="font-mono text-xs mt-1" rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium">Body</label>
                <Textarea value={customBody} onChange={(e) => setCustomBody(e.target.value)} className="font-mono text-xs mt-1" rows={8} />
              </div>
              <div className="flex gap-2">
                <Button onClick={simulateWebhook} className="flex-1">
                  <Send className="h-4 w-4 mr-2" /> Simuler
                </Button>
                <Button variant="outline" onClick={generateHandlerCode}>
                  <FileCode className="h-4 w-4 mr-2" /> Handler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Events */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Événements reçus ({events.length})</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearEvents} disabled={events.length === 0}>
                  <Trash2 className="h-4 w-4 mr-1" /> Vider
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aucun événement. Cliquez "Simuler" pour envoyer un webhook.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-auto">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedEvent?.id === evt.id ? "bg-primary/10 border border-primary/20" : "bg-muted/50 hover:bg-muted"
                      }`}
                      onClick={() => setSelectedEvent(evt)}
                    >
                      <Badge variant={evt.method === "POST" ? "default" : "secondary"} className="font-mono text-xs">
                        {evt.method}
                      </Badge>
                      <span className="text-sm font-mono">{evt.id}</span>
                      <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {evt.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedEvent && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Détails — {selectedEvent.id}</CardTitle>
                <CardDescription>
                  {selectedEvent.method} • {selectedEvent.timestamp.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="body">
                  <TabsList>
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="body">
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-auto max-h-[400px] whitespace-pre-wrap">
                        {(() => { try { return JSON.stringify(JSON.parse(selectedEvent.body), null, 2); } catch { return selectedEvent.body; } })()}
                      </pre>
                      <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={() => copyToClipboard(selectedEvent.body)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="headers">
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-auto max-h-[400px]">
                        {JSON.stringify(selectedEvent.headers, null, 2)}
                      </pre>
                      <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={() => copyToClipboard(JSON.stringify(selectedEvent.headers, null, 2))}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
