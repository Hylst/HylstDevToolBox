import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Server, Copy, RefreshCw, Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface MockTemplate {
  id: string;
  name: string;
  schema: string;
  category: string;
}

const templates: MockTemplate[] = [
  {
    id: "user",
    name: "User",
    category: "common",
    schema: `{
  "id": "uuid",
  "firstName": "firstName",
  "lastName": "lastName",
  "email": "email",
  "avatar": "avatar",
  "createdAt": "date",
  "role": ["admin", "user", "moderator"]
}`
  },
  {
    id: "product",
    name: "Product",
    category: "e-commerce",
    schema: `{
  "id": "uuid",
  "name": "productName",
  "description": "sentence",
  "price": "price",
  "currency": "EUR",
  "category": ["electronics", "clothing", "food"],
  "inStock": "boolean",
  "rating": "rating",
  "imageUrl": "imageUrl"
}`
  },
  {
    id: "order",
    name: "Order",
    category: "e-commerce",
    schema: `{
  "id": "uuid",
  "userId": "uuid",
  "status": ["pending", "processing", "shipped", "delivered"],
  "total": "price",
  "items": "array:3",
  "createdAt": "date",
  "shippingAddress": {
    "street": "streetAddress",
    "city": "city",
    "zipCode": "zipCode",
    "country": "country"
  }
}`
  },
  {
    id: "post",
    name: "Blog Post",
    category: "content",
    schema: `{
  "id": "uuid",
  "title": "sentence",
  "slug": "slug",
  "content": "paragraphs",
  "author": {
    "id": "uuid",
    "name": "fullName"
  },
  "tags": "tags",
  "publishedAt": "date",
  "views": "number:1000"
}`
  },
  {
    id: "comment",
    name: "Comment",
    category: "content",
    schema: `{
  "id": "uuid",
  "postId": "uuid",
  "userId": "uuid",
  "content": "sentence",
  "createdAt": "date",
  "likes": "number:100"
}`
  }
];

// Générateur de données fake simplifié
const generateValue = (type: string | any[]): any => {
  const uuid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });

  const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Emma", "Frank", "Grace", "Henry"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"];
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "company.com"];
  const words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing"];
  const cities = ["Paris", "London", "New York", "Tokyo", "Berlin", "Madrid", "Rome"];
  const countries = ["France", "UK", "USA", "Japan", "Germany", "Spain", "Italy"];

  // Gestion des tableaux d'options
  if (Array.isArray(type)) {
    return type[Math.floor(Math.random() * type.length)];
  }

  // Parse le type
  const [baseType, param] = type.split(":");

  switch (baseType) {
    case "uuid":
      return uuid();
    case "firstName":
      return firstNames[Math.floor(Math.random() * firstNames.length)];
    case "lastName":
      return lastNames[Math.floor(Math.random() * lastNames.length)];
    case "fullName":
      return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    case "email":
      return `${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()}${Math.floor(Math.random() * 100)}@${domains[Math.floor(Math.random() * domains.length)]}`;
    case "avatar":
      return `https://i.pravatar.cc/150?u=${uuid()}`;
    case "date":
      const d = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      return d.toISOString();
    case "boolean":
      return Math.random() > 0.5;
    case "number":
      const max = param ? parseInt(param) : 100;
      return Math.floor(Math.random() * max);
    case "price":
      return parseFloat((Math.random() * 1000).toFixed(2));
    case "rating":
      return parseFloat((Math.random() * 4 + 1).toFixed(1));
    case "sentence":
      return words.sort(() => Math.random() - 0.5).slice(0, 8).join(" ") + ".";
    case "paragraphs":
      return Array(3).fill(0).map(() => words.sort(() => Math.random() - 0.5).slice(0, 12).join(" ") + ".").join("\n\n");
    case "productName":
      const adjectives = ["Premium", "Classic", "Modern", "Vintage", "Essential"];
      const nouns = ["Widget", "Gadget", "Device", "Tool", "Kit"];
      return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    case "slug":
      return words.slice(0, 3).join("-");
    case "imageUrl":
      return `https://picsum.photos/seed/${uuid()}/400/300`;
    case "streetAddress":
      return `${Math.floor(Math.random() * 999) + 1} Main Street`;
    case "city":
      return cities[Math.floor(Math.random() * cities.length)];
    case "zipCode":
      return String(Math.floor(Math.random() * 90000) + 10000);
    case "country":
      return countries[Math.floor(Math.random() * countries.length)];
    case "tags":
      return ["tech", "news", "tutorial", "guide", "tips"].sort(() => Math.random() - 0.5).slice(0, 3);
    case "array":
      const count = param ? parseInt(param) : 3;
      return Array(count).fill(0).map((_, i) => ({ id: uuid(), name: `Item ${i + 1}` }));
    default:
      return type; // Retourne la valeur littérale
  }
};

const generateFromSchema = (schema: any): any => {
  if (typeof schema === "string") {
    return generateValue(schema);
  }

  if (Array.isArray(schema)) {
    return generateValue(schema);
  }

  if (typeof schema === "object" && schema !== null) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(schema)) {
      result[key] = generateFromSchema(value);
    }
    return result;
  }

  return schema;
};

export default function ApiResponseMocker() {
  const [schema, setSchema] = useState(templates[0].schema);
  const [count, setCount] = useState(5);
  const [wrapInArray, setWrapInArray] = useState(true);
  const [addPagination, setAddPagination] = useState(false);
  const [addDelay, setAddDelay] = useState(false);
  const [delayMs, setDelayMs] = useState(500);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const generateData = () => {
    try {
      const parsed = JSON.parse(schema);
      const items = Array(count).fill(0).map(() => generateFromSchema(parsed));

      let result: any;

      if (wrapInArray) {
        if (addPagination) {
          result = {
            data: items,
            meta: {
              total: count * 10,
              page: 1,
              perPage: count,
              totalPages: 10,
              hasNextPage: true,
              hasPrevPage: false
            }
          };
        } else {
          result = items;
        }
      } else {
        result = items[0];
      }

      setGeneratedData(result);
      toast.success(`${count} entrée(s) générée(s)`);
    } catch (e) {
      toast.error("Schéma JSON invalide");
    }
  };

  const loadTemplate = (template: MockTemplate) => {
    setSchema(template.schema);
    toast.success(`Template "${template.name}" chargé`);
  };

  const copyOutput = () => {
    if (generatedData) {
      navigator.clipboard.writeText(JSON.stringify(generatedData, null, 2));
      toast.success("Données copiées");
    }
  };

  const generateMswHandler = (): string => {
    return `import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/items', ${addDelay ? `async () => {
    await new Promise(resolve => setTimeout(resolve, ${delayMs}));
    return HttpResponse.json(${JSON.stringify(generatedData, null, 4)});
  }` : `() => {
    return HttpResponse.json(${JSON.stringify(generatedData, null, 4)});
  }`})
];`;
  };

  const downloadMswHandler = () => {
    const blob = new Blob([generateMswHandler()], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "handlers.ts";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Handler MSW téléchargé");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Server className="h-8 w-8 text-primary" />
          API Response Mocker
        </h1>
        <p className="text-muted-foreground mt-1">
          Générez des réponses API mock réalistes à partir de schémas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-4">
          {/* Templates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <Button
                    key={t.id}
                    variant="outline"
                    size="sm"
                    onClick={() => loadTemplate(t)}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schema */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Schéma</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                className="min-h-[250px] font-mono text-sm"
                placeholder="Définissez votre schéma..."
              />
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="w-32">Nombre</Label>
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="w-24"
                  min={1}
                  max={100}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Encapsuler dans un tableau</Label>
                <Switch checked={wrapInArray} onCheckedChange={setWrapInArray} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Ajouter pagination</Label>
                <Switch checked={addPagination} onCheckedChange={setAddPagination} disabled={!wrapInArray} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Simuler délai</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={addDelay} onCheckedChange={setAddDelay} />
                  {addDelay && (
                    <Input
                      type="number"
                      value={delayMs}
                      onChange={(e) => setDelayMs(parseInt(e.target.value) || 0)}
                      className="w-20"
                      min={0}
                      max={5000}
                    />
                  )}
                </div>
              </div>

              <Button className="w-full" onClick={generateData}>
                <RefreshCw className="h-4 w-4 mr-2" /> Générer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Données générées</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyOutput} disabled={!generatedData}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadMswHandler} disabled={!generatedData}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <pre className="text-sm font-mono p-3 bg-muted rounded-md whitespace-pre-wrap">
                  {generatedData ? JSON.stringify(generatedData, null, 2) : "Cliquez sur Générer pour voir les données"}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Types disponibles */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Types disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 text-xs">
        {(["uuid", "firstName", "lastName", "fullName", "email", "avatar", "date", "boolean", 
                  "number:max", "price", "rating", "sentence", "paragraphs", "productName", "slug", 
                  "imageUrl", "streetAddress", "city", "zipCode", "country", "tags", "array:count"] as const).map(t => (
                  <Badge key={t} variant="secondary" className="font-mono">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
