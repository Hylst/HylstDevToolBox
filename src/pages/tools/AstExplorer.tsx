import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers, ChevronRight, ChevronDown } from "lucide-react";

interface ASTNode { type: string; name?: string; value?: string; children?: ASTNode[]; }

function parseSimpleAST(code: string): ASTNode {
  const root: ASTNode = { type: "Program", children: [] };
  const lines = code.split("\n");
  lines.forEach(line => {
    const trimmed = line.trim();
    if (/^(const|let|var)\s/.test(trimmed)) root.children?.push({ type: "VariableDeclaration", name: trimmed.match(/(?:const|let|var)\s+(\w+)/)?.[1] });
    else if (/^function\s/.test(trimmed)) root.children?.push({ type: "FunctionDeclaration", name: trimmed.match(/function\s+(\w+)/)?.[1] });
    else if (/^class\s/.test(trimmed)) root.children?.push({ type: "ClassDeclaration", name: trimmed.match(/class\s+(\w+)/)?.[1] });
    else if (/^import\s/.test(trimmed)) root.children?.push({ type: "ImportDeclaration", value: trimmed });
    else if (/^export\s/.test(trimmed)) root.children?.push({ type: "ExportDeclaration", value: trimmed });
  });
  return root;
}

function TreeNode({ node, depth = 0 }: { node: ASTNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div className="flex items-center gap-1 py-1 hover:bg-muted/50 rounded cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {hasChildren ? (expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <span className="w-4" />}
        <span className="text-primary font-medium">{node.type}</span>
        {node.name && <span className="text-muted-foreground ml-2">"{node.name}"</span>}
      </div>
      {expanded && hasChildren && node.children?.map((child, i) => <TreeNode key={i} node={child} depth={depth + 1} />)}
    </div>
  );
}

export default function AstExplorer() {
  const [code, setCode] = useState(`const greeting = "Hello";\nfunction sayHello(name) {\n  console.log(greeting + name);\n}\nclass User {\n  constructor(name) {\n    this.name = name;\n  }\n}`);
  const ast = useMemo(() => parseSimpleAST(code), [code]);
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Layers className="h-8 w-8 text-primary" />AST Explorer</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Code JavaScript</CardTitle></CardHeader><CardContent>
          <Textarea value={code} onChange={e => setCode(e.target.value)} rows={15} className="font-mono text-sm" />
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Arbre AST</CardTitle></CardHeader><CardContent>
          <ScrollArea className="h-[400px]"><TreeNode node={ast} /></ScrollArea>
        </CardContent></Card>
      </div>
    </div>
  );
}
