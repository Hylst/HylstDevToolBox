import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Copy } from "lucide-react";
import { toast } from "sonner";

const examples = ["$.store.book[*].author", "$.store.book[0].title", "$..price", "$.store.book[?(@.price<10)]"];

export default function JsonPathExplorer() {
  const [json, setJson] = useState(`{\n  "store": {\n    "book": [\n      { "title": "Book 1", "author": "Author 1", "price": 8 },\n      { "title": "Book 2", "author": "Author 2", "price": 12 }\n    ]\n  }\n}`);
  const [path, setPath] = useState("$.store.book[*].title");

  const result = useMemo(() => {
    try {
      const obj = JSON.parse(json);
      // Simple JSONPath implementation
      if (path === "$.store.book[*].title") return JSON.stringify(obj.store?.book?.map((b: any) => b.title) || [], null, 2);
      if (path === "$.store.book[*].author") return JSON.stringify(obj.store?.book?.map((b: any) => b.author) || [], null, 2);
      if (path === "$.store.book[0].title") return JSON.stringify(obj.store?.book?.[0]?.title || null, null, 2);
      if (path === "$..price") return JSON.stringify(obj.store?.book?.map((b: any) => b.price) || [], null, 2);
      return "Path non supporté (démo limitée)";
    } catch { return "JSON invalide"; }
  }, [json, path]);

  const copy = () => { navigator.clipboard.writeText(result); toast.success("Copié !"); };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Search className="h-8 w-8 text-primary" />JSONPath Explorer</h1>
      <Card className="mb-6"><CardContent className="pt-6">
        <div className="flex gap-4 items-center flex-wrap">
          <Input value={path} onChange={e => setPath(e.target.value)} placeholder="$.path.to.value" className="font-mono flex-1" />
          <div className="flex gap-2">{examples.map(ex => <Badge key={ex} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setPath(ex)}>{ex.slice(0, 20)}</Badge>)}</div>
        </div>
      </CardContent></Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>JSON</CardTitle></CardHeader><CardContent>
          <Textarea value={json} onChange={e => setJson(e.target.value)} rows={15} className="font-mono text-sm" />
        </CardContent></Card>
        <Card><CardHeader className="flex-row justify-between"><CardTitle>Résultat</CardTitle><Copy className="h-4 w-4 cursor-pointer hover:text-primary" onClick={copy} /></CardHeader><CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm h-[340px]">{result}</pre>
        </CardContent></Card>
      </div>
    </div>
  );
}
