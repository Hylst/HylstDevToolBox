import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  type: "sent" | "received" | "system";
  content: string;
  timestamp: string;
}

export default function WebSocketTester() {
  const [url, setUrl] = useState("wss://echo.websocket.org/");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (type: Message["type"], content: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    setMessages(prev => [...prev, { type, content, timestamp }]);
  };

  const connect = () => {
    if (!url.trim()) {
      toast.error("Veuillez entrer une URL WebSocket");
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        addMessage("system", "Connecté au serveur WebSocket");
        toast.success("Connexion établie !");
      };

      ws.onmessage = (event) => {
        addMessage("received", event.data);
      };

      ws.onerror = (error) => {
        addMessage("system", "Erreur WebSocket");
        toast.error("Erreur de connexion");
      };

      ws.onclose = () => {
        setConnected(false);
        addMessage("system", "Connexion fermée");
        toast.info("Connexion fermée");
      };
    } catch (error) {
      toast.error("Impossible de se connecter");
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const sendMessage = () => {
    if (!wsRef.current || !connected) {
      toast.error("Non connecté au serveur");
      return;
    }

    if (!message.trim()) {
      toast.error("Veuillez entrer un message");
      return;
    }

    try {
      wsRef.current.send(message);
      addMessage("sent", message);
      setMessage("");
      toast.success("Message envoyé !");
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const clearMessages = () => {
    setMessages([]);
    toast.success("Messages effacés");
  };

  const sendJSON = () => {
    const jsonExample = JSON.stringify({
      type: "ping",
      timestamp: Date.now(),
      data: { message: "Hello WebSocket!" }
    }, null, 2);
    setMessage(jsonExample);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Wifi className="h-8 w-8 text-primary" />
          WebSocket Tester
        </h1>
        <p className="text-muted-foreground">
          Testez vos connexions WebSocket en temps réel
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Configuration
                <Badge variant={connected ? "default" : "secondary"}>
                  {connected ? (
                    <>
                      <Wifi className="h-3 w-3 mr-1" />
                      Connecté
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 mr-1" />
                      Déconnecté
                    </>
                  )}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ws-url">URL WebSocket</Label>
                <Input
                  id="ws-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="wss://example.com/socket"
                  disabled={connected}
                />
              </div>

              <div className="flex gap-2">
                {!connected ? (
                  <Button onClick={connect} className="flex-1">
                    <Wifi className="mr-2 h-4 w-4" />
                    Se connecter
                  </Button>
                ) : (
                  <Button onClick={disconnect} variant="destructive" className="flex-1">
                    <WifiOff className="mr-2 h-4 w-4" />
                    Déconnecter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4 p-4 bg-muted rounded-lg">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucun message pour le moment
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.type === "sent"
                          ? "bg-primary text-primary-foreground ml-8"
                          : msg.type === "received"
                          ? "bg-secondary mr-8"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {msg.type === "sent" ? "Envoyé" : msg.type === "received" ? "Reçu" : "Système"}
                        </Badge>
                        <span className="text-xs opacity-70">{msg.timestamp}</span>
                      </div>
                      <pre className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </pre>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2 mb-4">
                <Button size="sm" variant="outline" onClick={sendJSON}>
                  Exemple JSON
                </Button>
                <Button size="sm" variant="outline" onClick={clearMessages}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Nouveau message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Entrez votre message..."
                  className="min-h-[100px] font-mono text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      sendMessage();
                    }
                  }}
                />
                <Button onClick={sendMessage} disabled={!connected} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer (Ctrl+Enter)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exemples d'URLs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => setUrl("wss://echo.websocket.org/")}
              >
                <div className="text-xs">
                  <div className="font-semibold">Echo Server</div>
                  <div className="text-muted-foreground truncate">
                    wss://echo.websocket.org/
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => setUrl("wss://ws.postman-echo.com/raw")}
              >
                <div className="text-xs">
                  <div className="font-semibold">Postman Echo</div>
                  <div className="text-muted-foreground truncate">
                    wss://ws.postman-echo.com/raw
                  </div>
                </div>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">💡 Conseils</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Utilisez wss:// pour les connexions sécurisées</li>
                <li>• Testez avec l'echo server pour débuter</li>
                <li>• Ctrl+Enter pour envoyer rapidement</li>
                <li>• Les messages JSON sont automatiquement formatés</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
