import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlaskConical, Copy, Check, X, Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface DiffResult {
  path: string;
  expected: any;
  actual: any;
  match: boolean;
  matcher?: string;
}

const matchers = {
  any: { label: "any()", description: "N'importe quelle valeur" },
  anyString: { label: "anyString()", description: "N'importe quelle chaîne" },
  anyNumber: { label: "anyNumber()", description: "N'importe quel nombre" },
  anyBoolean: { label: "anyBoolean()", description: "N'importe quel booléen" },
  anyArray: { label: "anyArray()", description: "N'importe quel tableau" },
  anyObject: { label: "anyObject()", description: "N'importe quel objet" },
  anyUUID: { label: "anyUUID()", description: "N'importe quel UUID" },
  anyDate: { label: "anyDate()", description: "N'importe quelle date ISO" },
};

const sampleExpected = `{
  "id": "{{anyUUID}}",
  "name": "John Doe",
  "email": "{{anyString}}",
  "age": "{{anyNumber}}",
  "createdAt": "{{anyDate}}",
  "roles": ["admin", "user"],
  "metadata": {
    "verified": "{{anyBoolean}}"
  }
}`;

const sampleActual = `{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "createdAt": "2024-01-15T10:30:00Z",
  "roles": ["admin", "user"],
  "metadata": {
    "verified": true
  }
}`;

export default function TestDataMatcher() {
  const [expected, setExpected] = useState(sampleExpected);
  const [actual, setActual] = useState(sampleActual);
  const [outputFormat, setOutputFormat] = useState<"jest" | "vitest" | "mocha">("jest");
  const [ignoreExtraFields, setIgnoreExtraFields] = useState(false);

  const parseWithMatchers = (json: string): any => {
    try {
      // Remplacer les matchers par des placeholders
      const withPlaceholders = json
        .replace(/"{{any}}"/g, '"__MATCHER_ANY__"')
        .replace(/"{{anyString}}"/g, '"__MATCHER_STRING__"')
        .replace(/"{{anyNumber}}"/g, '"__MATCHER_NUMBER__"')
        .replace(/"{{anyBoolean}}"/g, '"__MATCHER_BOOLEAN__"')
        .replace(/"{{anyArray}}"/g, '"__MATCHER_ARRAY__"')
        .replace(/"{{anyObject}}"/g, '"__MATCHER_OBJECT__"')
        .replace(/"{{anyUUID}}"/g, '"__MATCHER_UUID__"')
        .replace(/"{{anyDate}}"/g, '"__MATCHER_DATE__"');

      return JSON.parse(withPlaceholders);
    } catch {
      return null;
    }
  };

  const isMatcher = (value: any): string | null => {
    if (typeof value !== "string") return null;
    if (value === "__MATCHER_ANY__") return "any";
    if (value === "__MATCHER_STRING__") return "anyString";
    if (value === "__MATCHER_NUMBER__") return "anyNumber";
    if (value === "__MATCHER_BOOLEAN__") return "anyBoolean";
    if (value === "__MATCHER_ARRAY__") return "anyArray";
    if (value === "__MATCHER_OBJECT__") return "anyObject";
    if (value === "__MATCHER_UUID__") return "anyUUID";
    if (value === "__MATCHER_DATE__") return "anyDate";
    return null;
  };

  const matchValue = (expectedVal: any, actualVal: any): boolean => {
    const matcher = isMatcher(expectedVal);
    if (matcher) {
      switch (matcher) {
        case "any": return true;
        case "anyString": return typeof actualVal === "string";
        case "anyNumber": return typeof actualVal === "number";
        case "anyBoolean": return typeof actualVal === "boolean";
        case "anyArray": return Array.isArray(actualVal);
        case "anyObject": return typeof actualVal === "object" && actualVal !== null && !Array.isArray(actualVal);
        case "anyUUID": return typeof actualVal === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actualVal);
        case "anyDate": return typeof actualVal === "string" && !isNaN(Date.parse(actualVal));
      }
    }
    return JSON.stringify(expectedVal) === JSON.stringify(actualVal);
  };

  const compareObjects = (exp: any, act: any, path = ""): DiffResult[] => {
    const results: DiffResult[] = [];

    if (exp === null || exp === undefined) {
      results.push({ path: path || "root", expected: exp, actual: act, match: exp === act });
      return results;
    }

    const matcher = isMatcher(exp);
    if (matcher) {
      const match = matchValue(exp, act);
      results.push({ path: path || "root", expected: `{{${matcher}}}`, actual: act, match, matcher });
      return results;
    }

    if (Array.isArray(exp)) {
      if (!Array.isArray(act)) {
        results.push({ path, expected: exp, actual: act, match: false });
        return results;
      }
      exp.forEach((item, idx) => {
        results.push(...compareObjects(item, act[idx], `${path}[${idx}]`));
      });
      if (!ignoreExtraFields && act.length > exp.length) {
        for (let i = exp.length; i < act.length; i++) {
          results.push({ path: `${path}[${i}]`, expected: undefined, actual: act[i], match: false });
        }
      }
      return results;
    }

    if (typeof exp === "object") {
      if (typeof act !== "object" || act === null) {
        results.push({ path, expected: exp, actual: act, match: false });
        return results;
      }
      Object.keys(exp).forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        results.push(...compareObjects(exp[key], act[key], newPath));
      });
      if (!ignoreExtraFields) {
        Object.keys(act).forEach(key => {
          if (!(key in exp)) {
            const newPath = path ? `${path}.${key}` : key;
            results.push({ path: newPath, expected: undefined, actual: act[key], match: false });
          }
        });
      }
      return results;
    }

    results.push({ path: path || "root", expected: exp, actual: act, match: exp === act });
    return results;
  };

  const results = useMemo(() => {
    const parsedExpected = parseWithMatchers(expected);
    let parsedActual: any;
    try {
      parsedActual = JSON.parse(actual);
    } catch {
      return { valid: false, results: [], error: "JSON actual invalide" };
    }

    if (!parsedExpected) {
      return { valid: false, results: [], error: "JSON expected invalide" };
    }

    const diff = compareObjects(parsedExpected, parsedActual);
    return { valid: true, results: diff, error: null };
  }, [expected, actual, ignoreExtraFields]);

  const allMatch = results.valid && results.results.every(r => r.match);

  const generateTestCode = (): string => {
    if (!results.valid) return "";

    const formatValue = (val: any): string => {
      if (val === undefined) return "undefined";
      return JSON.stringify(val);
    };

    if (outputFormat === "jest" || outputFormat === "vitest") {
      return `${outputFormat === "vitest" ? "import { expect, test } from 'vitest';\n\n" : ""}test('should match expected structure', () => {
  const actual = ${actual};

  ${results.results.filter(r => r.matcher).map(r => {
    switch (r.matcher) {
      case "anyString": return `expect(typeof actual.${r.path}).toBe('string');`;
      case "anyNumber": return `expect(typeof actual.${r.path}).toBe('number');`;
      case "anyBoolean": return `expect(typeof actual.${r.path}).toBe('boolean');`;
      case "anyArray": return `expect(Array.isArray(actual.${r.path})).toBe(true);`;
      case "anyUUID": return `expect(actual.${r.path}).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);`;
      case "anyDate": return `expect(new Date(actual.${r.path}).toString()).not.toBe('Invalid Date');`;
      default: return `expect(actual.${r.path}).toBeDefined();`;
    }
  }).join('\n  ')}

  ${results.results.filter(r => !r.matcher && r.expected !== undefined).map(r => 
    `expect(actual.${r.path}).toEqual(${formatValue(r.expected)});`
  ).join('\n  ')}
});`;
    }

    return `const assert = require('assert');

describe('Data Matching', function() {
  it('should match expected structure', function() {
    const actual = ${actual};

    ${results.results.filter(r => r.matcher).map(r => {
      switch (r.matcher) {
        case "anyString": return `assert.strictEqual(typeof actual.${r.path}, 'string');`;
        case "anyNumber": return `assert.strictEqual(typeof actual.${r.path}, 'number');`;
        default: return `assert.ok(actual.${r.path} !== undefined);`;
      }
    }).join('\n    ')}
  });
});`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateTestCode());
    toast.success("Code copié");
  };

  const insertMatcher = (matcher: string) => {
    setExpected(prev => prev + `"{{${matcher}}}"`);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FlaskConical className="h-8 w-8 text-primary" />
          Test Data Matcher
        </h1>
        <p className="text-muted-foreground mt-1">
          Comparez des données de test avec des matchers flexibles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expected */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Expected (avec matchers)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="JSON attendu avec {{matchers}}..."
            />
            <div className="mt-3">
              <Label className="text-xs text-muted-foreground">Insérer un matcher</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(matchers).map(([key, { label }]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => insertMatcher(key)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actual */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Actual (données réelles)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="JSON de données réelles..."
            />
          </CardContent>
        </Card>

        {/* Résultats */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Résultats</CardTitle>
              <Badge variant={allMatch ? "default" : "destructive"}>
                {allMatch ? (
                  <><Check className="h-3 w-3 mr-1" /> Match</>
                ) : (
                  <><X className="h-3 w-3 mr-1" /> Différences</>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!results.valid ? (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {results.error}
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                  {results.results.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-sm flex items-start gap-2 ${
                        r.match ? "bg-green-500/10" : "bg-red-500/10"
                      }`}
                    >
                      {r.match ? (
                        <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <code className="text-xs font-mono">{r.path}</code>
                        {!r.match && (
                          <div className="text-xs text-muted-foreground mt-1">
                            <p>Attendu: {JSON.stringify(r.expected)}</p>
                            <p>Reçu: {JSON.stringify(r.actual)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Générer le code de test</CardTitle>
            <div className="flex gap-2">
              <Select value={outputFormat} onValueChange={(v: any) => setOutputFormat(v)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jest">Jest</SelectItem>
                  <SelectItem value="vitest">Vitest</SelectItem>
                  <SelectItem value="mocha">Mocha</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={copyCode} disabled={!results.valid}>
                <Copy className="h-4 w-4 mr-1" /> Copier
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="text-sm font-mono p-4 bg-muted rounded-md overflow-auto max-h-[300px]">
            {results.valid ? generateTestCode() : "Corrigez les erreurs JSON"}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
