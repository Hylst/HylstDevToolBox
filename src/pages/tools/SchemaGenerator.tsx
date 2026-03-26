import { useState, useMemo } from "react";
import { FileJson, Copy, Download, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const inferType = (value: unknown): string => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
};

const generateJsonSchema = (obj: unknown, rootName: string = "Root"): object => {
  const schema: Record<string, unknown> = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: rootName,
  };

  const processValue = (value: unknown): Record<string, unknown> => {
    if (value === null) {
      return { type: "null" };
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { type: "array", items: {} };
      }
      return {
        type: "array",
        items: processValue(value[0]),
      };
    }
    switch (typeof value) {
      case "string":
        return { type: "string" };
      case "number":
        return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
      case "boolean":
        return { type: "boolean" };
      case "object": {
        const properties: Record<string, unknown> = {};
        const required: string[] = [];
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
          properties[key] = processValue(val);
          if (val !== null && val !== undefined) {
            required.push(key);
          }
        }
        return {
          type: "object",
          properties,
          required,
        };
      }
      default:
        return {};
    }
  };

  return { ...schema, ...processValue(obj) };
};

const generateTypeScript = (obj: unknown, interfaceName: string = "Root", optionalNulls: boolean = true): string => {
  const interfaces: string[] = [];
  const processedTypes = new Map<string, string>();

  const processValue = (value: unknown, name: string): string => {
    if (value === null) return "null";
    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";
      const itemType = processValue(value[0], `${name}Item`);
      return `${itemType}[]`;
    }
    switch (typeof value) {
      case "string": return "string";
      case "number": return "number";
      case "boolean": return "boolean";
      case "object": {
        const typeName = name.charAt(0).toUpperCase() + name.slice(1);
        const existingType = processedTypes.get(JSON.stringify(value));
        if (existingType) return existingType;

        const properties: string[] = [];
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
          const propType = processValue(val, key);
          const isOptional = optionalNulls && val === null;
          properties.push(`  ${key}${isOptional ? "?" : ""}: ${propType};`);
        }

        const interfaceStr = `interface ${typeName} {\n${properties.join("\n")}\n}`;
        interfaces.push(interfaceStr);
        processedTypes.set(JSON.stringify(value), typeName);
        return typeName;
      }
      default:
        return "unknown";
    }
  };

  processValue(obj, interfaceName);
  return interfaces.reverse().join("\n\n");
};

const generateZodSchema = (obj: unknown, schemaName: string = "schema"): string => {
  const processValue = (value: unknown, indent: number = 0): string => {
    const pad = "  ".repeat(indent);
    if (value === null) return `${pad}z.null()`;
    if (Array.isArray(value)) {
      if (value.length === 0) return `${pad}z.array(z.unknown())`;
      return `${pad}z.array(\n${processValue(value[0], indent + 1)}\n${pad})`;
    }
    switch (typeof value) {
      case "string": return `${pad}z.string()`;
      case "number": return Number.isInteger(value) ? `${pad}z.number().int()` : `${pad}z.number()`;
      case "boolean": return `${pad}z.boolean()`;
      case "object": {
        const properties: string[] = [];
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
          properties.push(`${pad}  ${key}: ${processValue(val, 0).trim()},`);
        }
        return `${pad}z.object({\n${properties.join("\n")}\n${pad}})`;
      }
      default:
        return `${pad}z.unknown()`;
    }
  };

  return `import { z } from "zod";\n\nconst ${schemaName} = ${processValue(obj).trim()};\n\ntype ${schemaName.charAt(0).toUpperCase() + schemaName.slice(1)} = z.infer<typeof ${schemaName}>;`;
};

const generateGraphQL = (obj: unknown, typeName: string = "Root"): string => {
  const types: string[] = [];
  const processedTypes = new Map<string, string>();

  const getGraphQLType = (value: unknown, name: string): string => {
    if (value === null) return "String";
    if (Array.isArray(value)) {
      if (value.length === 0) return "[String]";
      return `[${getGraphQLType(value[0], name)}]`;
    }
    switch (typeof value) {
      case "string": return "String";
      case "number": return Number.isInteger(value) ? "Int" : "Float";
      case "boolean": return "Boolean";
      case "object": {
        const typeKey = JSON.stringify(value);
        if (processedTypes.has(typeKey)) return processedTypes.get(typeKey)!;
        
        const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
        processedTypes.set(typeKey, capitalName);
        
        const fields: string[] = [];
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
          fields.push(`  ${key}: ${getGraphQLType(val, key)}`);
        }
        types.push(`type ${capitalName} {\n${fields.join("\n")}\n}`);
        return capitalName;
      }
      default:
        return "String";
    }
  };

  getGraphQLType(obj, typeName);
  return types.reverse().join("\n\n");
};

const generatePrisma = (obj: unknown, modelName: string = "Model"): string => {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return "// Input must be a JSON object";
  }

  const fields: string[] = [];
  fields.push("  id    String   @id @default(cuid())");

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (key === "id") continue;
    let prismaType = "String";
    let optional = "";
    
    if (value === null) {
      optional = "?";
    } else if (Array.isArray(value)) {
      prismaType = "Json";
    } else {
      switch (typeof value) {
        case "string":
          if (key.toLowerCase().includes("email")) prismaType = "String";
          else if (key.toLowerCase().includes("date") || key.toLowerCase().includes("at")) prismaType = "DateTime";
          else prismaType = "String";
          break;
        case "number":
          prismaType = Number.isInteger(value) ? "Int" : "Float";
          break;
        case "boolean":
          prismaType = "Boolean";
          break;
        case "object":
          prismaType = "Json";
          break;
      }
    }
    fields.push(`  ${key.padEnd(10)} ${prismaType}${optional}`);
  }

  fields.push("  createdAt DateTime @default(now())");
  fields.push("  updatedAt DateTime @updatedAt");

  return `model ${modelName} {\n${fields.join("\n")}\n}`;
};

export default function SchemaGenerator() {
  const { toast } = useToast();
  const [input, setInput] = useState('{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com",\n  "age": 30,\n  "active": true,\n  "tags": ["developer", "designer"],\n  "address": {\n    "street": "123 Main St",\n    "city": "Paris"\n  }\n}');
  const [schemaName, setSchemaName] = useState("User");
  const [outputTab, setOutputTab] = useState("jsonschema");
  const [optionalNulls, setOptionalNulls] = useState(true);
  const [validationInput, setValidationInput] = useState("");
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);

  const parsedInput = useMemo(() => {
    try {
      return { success: true, data: JSON.parse(input) };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }, [input]);

  const generatedSchema = useMemo(() => {
    if (!parsedInput.success) return "";
    switch (outputTab) {
      case "jsonschema":
        return JSON.stringify(generateJsonSchema(parsedInput.data, schemaName), null, 2);
      case "typescript":
        return generateTypeScript(parsedInput.data, schemaName, optionalNulls);
      case "zod":
        return generateZodSchema(parsedInput.data, schemaName.toLowerCase());
      case "graphql":
        return generateGraphQL(parsedInput.data, schemaName);
      case "prisma":
        return generatePrisma(parsedInput.data, schemaName);
      default:
        return "";
    }
  }, [parsedInput, outputTab, schemaName, optionalNulls]);

  const validateAgainstSchema = () => {
    if (!parsedInput.success) {
      setValidationResult({ valid: false, errors: ["Schema source is invalid JSON"] });
      return;
    }
    try {
      const dataToValidate = JSON.parse(validationInput);
      const schema = generateJsonSchema(parsedInput.data, schemaName) as Record<string, unknown>;
      const errors: string[] = [];

      const validateObject = (data: unknown, schemaObj: Record<string, unknown>, path: string = "") => {
        const schemaType = schemaObj.type as string;
        const actualType = inferType(data);

        if (schemaType === "object" && actualType === "object") {
          const props = schemaObj.properties as Record<string, Record<string, unknown>> | undefined;
          const required = schemaObj.required as string[] | undefined;
          const dataObj = data as Record<string, unknown>;

          if (required) {
            for (const key of required) {
              if (!(key in dataObj)) {
                errors.push(`Missing required field: ${path ? `${path}.${key}` : key}`);
              }
            }
          }

          if (props) {
            for (const [key, propSchema] of Object.entries(props)) {
              if (key in dataObj) {
                validateObject(dataObj[key], propSchema, path ? `${path}.${key}` : key);
              }
            }
          }
        } else if (schemaType === "array" && actualType === "array") {
          const items = schemaObj.items as Record<string, unknown> | undefined;
          if (items) {
            (data as unknown[]).forEach((item, index) => {
              validateObject(item, items, `${path}[${index}]`);
            });
          }
        } else if (schemaType !== actualType && !(schemaType === "integer" && actualType === "number" && Number.isInteger(data))) {
          errors.push(`Type mismatch at ${path || "root"}: expected ${schemaType}, got ${actualType}`);
        }
      };

      validateObject(dataToValidate, schema);
      setValidationResult({ valid: errors.length === 0, errors });
    } catch (e) {
      setValidationResult({ valid: false, errors: [e instanceof Error ? e.message : "Validation failed"] });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSchema);
    toast({ title: "Copié !", description: "Schéma copié dans le presse-papiers" });
  };

  const downloadSchema = () => {
    const extensions: Record<string, string> = {
      jsonschema: "json",
      typescript: "ts",
      zod: "ts",
      graphql: "graphql",
      prisma: "prisma",
    };
    const blob = new Blob([generatedSchema], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${schemaName.toLowerCase()}.${extensions[outputTab]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FileJson className="h-8 w-8 text-primary" />
          Générateur de Schémas
        </h1>
        <p className="text-muted-foreground">
          Générez des schémas JSON Schema, TypeScript, Zod, GraphQL et Prisma à partir de JSON
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>JSON Source</CardTitle>
              <CardDescription>Collez votre exemple JSON ici</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder='{"name": "example"}'
              />
              {!parsedInput.success && (
                <div className="p-3 bg-destructive/20 text-destructive rounded-lg text-sm">
                  {parsedInput.error}
                </div>
              )}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Nom du schéma/type</Label>
                  <Input value={schemaName} onChange={e => setSchemaName(e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                  <Switch checked={optionalNulls} onCheckedChange={setOptionalNulls} />
                  <Label>Nulls optionnels</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validation</CardTitle>
              <CardDescription>Validez un JSON contre le schéma généré</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={validationInput}
                onChange={e => setValidationInput(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
                placeholder="Collez le JSON à valider..."
              />
              <Button onClick={validateAgainstSchema} disabled={!parsedInput.success}>
                <Check className="h-4 w-4 mr-2" /> Valider
              </Button>
              {validationResult && (
                <div className={`p-4 rounded-lg ${validationResult.valid ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    {validationResult.valid ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    {validationResult.valid ? "JSON valide !" : "JSON invalide"}
                  </div>
                  {validationResult.errors.length > 0 && (
                    <ul className="list-disc list-inside text-sm">
                      {validationResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Schéma Généré</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyToClipboard} disabled={!generatedSchema}>
                  <Copy className="h-4 w-4 mr-1" /> Copier
                </Button>
                <Button size="sm" variant="outline" onClick={downloadSchema} disabled={!generatedSchema}>
                  <Download className="h-4 w-4 mr-1" /> Télécharger
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={outputTab} onValueChange={setOutputTab} className="mb-4">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="jsonschema">JSON Schema</TabsTrigger>
                <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                <TabsTrigger value="zod">Zod</TabsTrigger>
                <TabsTrigger value="graphql">GraphQL</TabsTrigger>
                <TabsTrigger value="prisma">Prisma</TabsTrigger>
              </TabsList>
            </Tabs>
            <Textarea
              value={generatedSchema}
              readOnly
              className="min-h-[450px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
