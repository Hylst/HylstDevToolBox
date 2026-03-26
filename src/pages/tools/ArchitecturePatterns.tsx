import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Pattern {
  name: string;
  description: string;
  useCases: string[];
  pros: string[];
  cons: string[];
  diagram: string;
  code: string;
}

const patterns: Pattern[] = [
  {
    name: "MVC",
    description: "Model-View-Controller sépare la logique métier (Model), l'interface (View) et le contrôle des flux (Controller).",
    useCases: ["Applications web classiques", "APIs REST", "Rails, Django, Spring MVC"],
    pros: ["Séparation claire des responsabilités", "Testabilité du Model", "Pattern bien documenté"],
    cons: ["Controller peut devenir un 'fat controller'", "Couplage View-Controller", "Moins adapté aux UIs complexes"],
    diagram: `graph LR
    U[Utilisateur] --> C[Controller]
    C --> M[Model]
    M --> C
    C --> V[View]
    V --> U`,
    code: `// Controller
class UserController {
  constructor(private model: UserModel, private view: UserView) {}
  
  async getUser(id: string) {
    const user = await this.model.findById(id);
    this.view.render(user);
  }
}

// Model
class UserModel {
  async findById(id: string): Promise<User> {
    return db.users.find(id);
  }
}

// View
class UserView {
  render(user: User) {
    return \`<div>\${user.name}</div>\`;
  }
}`,
  },
  {
    name: "MVVM",
    description: "Model-View-ViewModel utilise un ViewModel comme intermédiaire avec du data binding bidirectionnel.",
    useCases: ["Applications frontend (React, Vue, Angular)", "Apps mobiles", "WPF, SwiftUI"],
    pros: ["Data binding automatique", "ViewModel testable unitairement", "Découplage View/Logic"],
    cons: ["Over-engineering pour les petits projets", "Debugging du data binding complexe", "Courbe d'apprentissage"],
    diagram: `graph LR
    V[View] <-->|Data Binding| VM[ViewModel]
    VM <--> M[Model]`,
    code: `// ViewModel (React Hook)
function useUserViewModel(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(u => {
      setUser(u);
      setLoading(false);
    });
  }, [userId]);

  const updateName = (name: string) => {
    setUser(prev => prev ? { ...prev, name } : null);
  };

  return { user, loading, updateName };
}

// View
function UserView({ userId }: { userId: string }) {
  const { user, loading, updateName } = useUserViewModel(userId);
  if (loading) return <Spinner />;
  return <input value={user?.name} onChange={e => updateName(e.target.value)} />;
}`,
  },
  {
    name: "Clean Architecture",
    description: "Architecture en couches concentriques : Entities > Use Cases > Interface Adapters > Frameworks. La dépendance pointe vers l'intérieur.",
    useCases: ["Applications enterprise", "Systèmes à longue durée de vie", "Domain-driven design"],
    pros: ["Indépendance des frameworks", "Testabilité maximale", "Règles métier protégées"],
    cons: ["Beaucoup de boilerplate", "Complexité pour les petits projets", "Mapping entre couches"],
    diagram: `graph TB
    FW[Frameworks & Drivers] --> IA[Interface Adapters]
    IA --> UC[Use Cases]
    UC --> E[Entities]
    style E fill:#4ade80,color:#000
    style UC fill:#60a5fa,color:#000
    style IA fill:#facc15,color:#000
    style FW fill:#f87171,color:#000`,
    code: `// Entity
class User {
  constructor(public id: string, public email: string) {}
  isValid() { return this.email.includes('@'); }
}

// Use Case
class CreateUser {
  constructor(private repo: UserRepository) {}
  async execute(email: string): Promise<User> {
    const user = new User(crypto.randomUUID(), email);
    if (!user.isValid()) throw new Error('Invalid email');
    return this.repo.save(user);
  }
}

// Interface Adapter (Repository)
interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
}`,
  },
  {
    name: "Hexagonal",
    description: "Architecture Ports & Adapters : le cœur métier expose des ports (interfaces), les adapters les implémentent.",
    useCases: ["Microservices", "Systèmes multi-sources de données", "Migration de base de données"],
    pros: ["Interchangeabilité des adapters", "Core métier pur", "Tests avec mocks faciles"],
    cons: ["Abstraction supplémentaire", "Nombre de fichiers élevé", "Overkill pour du CRUD simple"],
    diagram: `graph LR
    HA[HTTP Adapter] --> PI((Port In))
    PI --> CORE[Domain Core]
    CORE --> PO((Port Out))
    PO --> DA[DB Adapter]
    PO --> EA[Email Adapter]`,
    code: `// Port (interface)
interface OrderPort {
  createOrder(items: Item[]): Promise<Order>;
  getOrder(id: string): Promise<Order>;
}

// Port Out (driven)
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order>;
}

// Domain Core implements Port In
class OrderService implements OrderPort {
  constructor(private repo: OrderRepository) {}
  
  async createOrder(items: Item[]) {
    const order = Order.create(items);
    await this.repo.save(order);
    return order;
  }
}

// Adapter (HTTP)
app.post('/orders', async (req, res) => {
  const order = await orderService.createOrder(req.body.items);
  res.json(order);
});`,
  },
  {
    name: "Microservices",
    description: "Décomposition en services indépendants communiquant via API/messages. Chaque service a sa propre base de données.",
    useCases: ["Grandes équipes", "Scaling indépendant", "Déploiement continu"],
    pros: ["Scaling granulaire", "Déploiement indépendant", "Polyglotte (tech différente par service)"],
    cons: ["Complexité réseau", "Cohérence des données distribuées", "Debugging plus difficile"],
    diagram: `graph TB
    GW[API Gateway] --> US[User Service]
    GW --> OS[Order Service]
    GW --> PS[Payment Service]
    US --> UDB[(User DB)]
    OS --> ODB[(Order DB)]
    PS --> PDB[(Payment DB)]
    OS -->|Events| MQ[Message Queue]
    MQ --> PS`,
    code: `// User Service (Express)
app.get('/users/:id', async (req, res) => {
  const user = await userRepo.findById(req.params.id);
  res.json(user);
});

// Order Service consomme les events
messageQueue.subscribe('payment.completed', async (event) => {
  await orderRepo.updateStatus(event.orderId, 'paid');
});

// API Gateway (routing)
const routes = {
  '/users/*': 'http://user-service:3001',
  '/orders/*': 'http://order-service:3002',
  '/payments/*': 'http://payment-service:3003',
};`,
  },
  {
    name: "Event-Driven",
    description: "Les composants communiquent via des événements asynchrones. Producteurs émettent, consommateurs réagissent.",
    useCases: ["Systèmes temps réel", "IoT", "CQRS / Event Sourcing"],
    pros: ["Découplage fort", "Scalabilité", "Audit trail naturel"],
    cons: ["Debugging complexe", "Eventual consistency", "Ordre des événements"],
    diagram: `graph LR
    P1[Producer 1] -->|Event| EB[Event Bus]
    P2[Producer 2] -->|Event| EB
    EB -->|Subscribe| C1[Consumer 1]
    EB -->|Subscribe| C2[Consumer 2]
    EB -->|Subscribe| C3[Consumer 3]`,
    code: `// Event Bus simple
class EventBus {
  private handlers = new Map<string, Function[]>();

  on(event: string, handler: Function) {
    const list = this.handlers.get(event) || [];
    list.push(handler);
    this.handlers.set(event, list);
  }

  emit(event: string, data: any) {
    (this.handlers.get(event) || []).forEach(h => h(data));
  }
}

// Usage
const bus = new EventBus();
bus.on('order.created', (order) => sendEmail(order));
bus.on('order.created', (order) => updateAnalytics(order));
bus.emit('order.created', { id: '123', total: 99 });`,
  },
  {
    name: "CQRS",
    description: "Command Query Responsibility Segregation : sépare les opérations de lecture (Query) et d'écriture (Command).",
    useCases: ["Systèmes à forte charge de lecture", "Event sourcing", "Rapports complexes"],
    pros: ["Optimisation lecture/écriture indépendante", "Scalabilité ciblée", "Modèles de lecture simplifiés"],
    cons: ["Complexité accrue", "Synchronisation read/write models", "Eventual consistency"],
    diagram: `graph TB
    Client --> CMD[Command Handler]
    Client --> QRY[Query Handler]
    CMD --> WDB[(Write DB)]
    WDB -->|Sync/Events| RDB[(Read DB)]
    QRY --> RDB`,
    code: `// Command
interface CreateOrderCommand {
  userId: string;
  items: { productId: string; qty: number }[];
}

// Command Handler
class CreateOrderHandler {
  async handle(cmd: CreateOrderCommand) {
    const order = Order.create(cmd);
    await this.writeRepo.save(order);
    await this.eventBus.emit('order.created', order);
  }
}

// Query Handler (optimized read model)
class GetOrdersHandler {
  async handle(userId: string) {
    return this.readRepo.getOrderSummaries(userId);
  }
}`,
  },
  {
    name: "Serverless",
    description: "Fonctions individuelles déployées dans le cloud, exécutées à la demande. Pas de serveur à gérer.",
    useCases: ["APIs légères", "Tâches événementielles", "Startups et MVPs"],
    pros: ["Zero infrastructure", "Pay-per-use", "Auto-scaling"],
    cons: ["Cold starts", "Limites d'exécution (timeout)", "Vendor lock-in"],
    diagram: `graph LR
    API[API Gateway] --> F1[Function: getUser]
    API --> F2[Function: createOrder]
    S3[Storage Event] --> F3[Function: processImage]
    CRON[Scheduler] --> F4[Function: cleanup]
    F1 --> DB[(Database)]
    F2 --> DB
    F3 --> S3B[Storage Bucket]`,
    code: `// Supabase Edge Function
Deno.serve(async (req) => {
  const { userId } = await req.json();
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId);

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// AWS Lambda
export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const result = await processOrder(body);
  return { statusCode: 200, body: JSON.stringify(result) };
};`,
  },
];

export default function ArchitecturePatterns() {
  const [selected, setSelected] = useState(0);
  const pattern = patterns[selected];

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Architecture Patterns</h1>
        <p className="text-muted-foreground mt-1">Référence interactive des patterns d'architecture logicielle</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {patterns.map((p, i) => (
          <Button
            key={p.name}
            variant={i === selected ? "default" : "outline"}
            size="sm"
            onClick={() => setSelected(i)}
          >
            {p.name}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{pattern.name}</CardTitle>
          <CardDescription className="text-base">{pattern.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {pattern.useCases.map(uc => (
              <Badge key={uc} variant="secondary">{uc}</Badge>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-green-500">✅ Avantages</h3>
              <ul className="space-y-1">
                {pattern.pros.map(p => (
                  <li key={p} className="text-sm flex gap-2"><span className="text-green-500">•</span>{p}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-red-500">❌ Inconvénients</h3>
              <ul className="space-y-1">
                {pattern.cons.map(c => (
                  <li key={c} className="text-sm flex gap-2"><span className="text-red-500">•</span>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <Tabs defaultValue="diagram">
            <TabsList>
              <TabsTrigger value="diagram">Diagramme</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <TabsContent value="diagram">
              <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto">{pattern.diagram}</pre>
              <p className="text-xs text-muted-foreground mt-2">💡 Copiez ce code dans l'éditeur Mermaid pour visualiser le diagramme interactif</p>
            </TabsContent>
            <TabsContent value="code">
              <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-96">{pattern.code}</pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

