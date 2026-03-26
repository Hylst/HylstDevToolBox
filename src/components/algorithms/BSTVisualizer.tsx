import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Trash2, RotateCcw, Shuffle } from "lucide-react";

interface BSTNode {
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

type HighlightState = { type: "none" } | { type: "found"; value: number } | { type: "path"; values: number[] } | { type: "inserted"; value: number; path: number[] } | { type: "deleted"; path: number[] };

function insertNode(root: BSTNode | null, value: number): BSTNode {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) return { ...root, left: insertNode(root.left, value) };
  if (value > root.value) return { ...root, right: insertNode(root.right, value) };
  return root;
}

function searchNode(root: BSTNode | null, value: number, path: number[] = []): number[] | null {
  if (!root) return null;
  path.push(root.value);
  if (value === root.value) return path;
  if (value < root.value) return searchNode(root.left, value, path);
  return searchNode(root.right, value, path);
}

function findMin(root: BSTNode): BSTNode {
  while (root.left) root = root.left;
  return root;
}

function deleteNode(root: BSTNode | null, value: number): BSTNode | null {
  if (!root) return null;
  if (value < root.value) return { ...root, left: deleteNode(root.left, value) };
  if (value > root.value) return { ...root, right: deleteNode(root.right, value) };
  if (!root.left) return root.right;
  if (!root.right) return root.left;
  const successor = findMin(root.right);
  return { ...root, value: successor.value, right: deleteNode(root.right, successor.value) };
}

function countNodes(root: BSTNode | null): number {
  if (!root) return 0;
  return 1 + countNodes(root.left) + countNodes(root.right);
}

function getHeight(root: BSTNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(getHeight(root.left), getHeight(root.right));
}

// Layout: assign x,y positions for each node
interface LayoutNode {
  value: number;
  x: number;
  y: number;
  left: LayoutNode | null;
  right: LayoutNode | null;
}

function layoutTree(root: BSTNode | null, depth: number = 0, minX: { val: number } = { val: 0 }): LayoutNode | null {
  if (!root) return null;
  const left = layoutTree(root.left, depth + 1, minX);
  const x = minX.val;
  minX.val += 1;
  const right = layoutTree(root.right, depth + 1, minX);
  return { value: root.value, x, y: depth, left, right };
}

function collectEdges(node: LayoutNode | null, edges: { x1: number; y1: number; x2: number; y2: number }[] = []): typeof edges {
  if (!node) return edges;
  if (node.left) {
    edges.push({ x1: node.x, y1: node.y, x2: node.left.x, y2: node.left.y });
    collectEdges(node.left, edges);
  }
  if (node.right) {
    edges.push({ x1: node.x, y1: node.y, x2: node.right.x, y2: node.right.y });
    collectEdges(node.right, edges);
  }
  return edges;
}

function collectNodes(node: LayoutNode | null, list: { value: number; x: number; y: number }[] = []): typeof list {
  if (!node) return list;
  collectNodes(node.left, list);
  list.push({ value: node.value, x: node.x, y: node.y });
  collectNodes(node.right, list);
  return list;
}

function getTraversal(root: BSTNode | null, order: "inorder" | "preorder" | "postorder"): number[] {
  if (!root) return [];
  if (order === "inorder") return [...getTraversal(root.left, order), root.value, ...getTraversal(root.right, order)];
  if (order === "preorder") return [root.value, ...getTraversal(root.left, order), ...getTraversal(root.right, order)];
  return [...getTraversal(root.left, order), ...getTraversal(root.right, order), root.value];
}

const defaultValues = [50, 30, 70, 20, 40, 60, 80];

export default function BSTVisualizer() {
  const [root, setRoot] = useState<BSTNode | null>(() => {
    let r: BSTNode | null = null;
    for (const v of defaultValues) r = insertNode(r, v);
    return r;
  });
  const [inputValue, setInputValue] = useState("");
  const [highlight, setHighlight] = useState<HighlightState>({ type: "none" });
  const [message, setMessage] = useState("");
  const [traversalOrder, setTraversalOrder] = useState<"inorder" | "preorder" | "postorder">("inorder");

  const handleInsert = useCallback(() => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    const path = searchNode(root, val);
    if (path) { setMessage(`${val} existe déjà`); return; }
    const searchPath: number[] = [];
    let cur = root;
    while (cur) {
      searchPath.push(cur.value);
      cur = val < cur.value ? cur.left : cur.right;
    }
    setRoot(prev => insertNode(prev, val));
    setHighlight({ type: "inserted", value: val, path: searchPath });
    setMessage(`${val} inséré`);
    setInputValue("");
    setTimeout(() => setHighlight({ type: "none" }), 1500);
  }, [inputValue, root]);

  const handleSearch = useCallback(() => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    const path = searchNode(root, val);
    if (path) {
      setHighlight({ type: "path", values: path });
      setMessage(`${val} trouvé (${path.length} nœuds visités)`);
    } else {
      setMessage(`${val} non trouvé`);
      setHighlight({ type: "none" });
    }
    setTimeout(() => setHighlight({ type: "none" }), 2000);
  }, [inputValue, root]);

  const handleDelete = useCallback(() => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    const path = searchNode(root, val);
    if (!path) { setMessage(`${val} non trouvé`); return; }
    setHighlight({ type: "deleted", path });
    setMessage(`${val} supprimé`);
    setTimeout(() => {
      setRoot(prev => deleteNode(prev, val));
      setHighlight({ type: "none" });
    }, 800);
    setInputValue("");
  }, [inputValue, root]);

  const handleReset = () => {
    let r: BSTNode | null = null;
    for (const v of defaultValues) r = insertNode(r, v);
    setRoot(r);
    setHighlight({ type: "none" });
    setMessage("");
  };

  const handleRandom = () => {
    let r: BSTNode | null = null;
    const vals = Array.from({ length: 9 }, () => Math.floor(Math.random() * 99) + 1);
    const unique = [...new Set(vals)];
    for (const v of unique) r = insertNode(r, v);
    setRoot(r);
    setHighlight({ type: "none" });
    setMessage(`Arbre aléatoire (${unique.length} nœuds)`);
  };

  const layout = useMemo(() => layoutTree(root), [root]);
  const nodeCount = useMemo(() => countNodes(root), [root]);
  const height = useMemo(() => getHeight(root), [root]);
  const traversal = useMemo(() => getTraversal(root, traversalOrder), [root, traversalOrder]);

  const allNodes = useMemo(() => collectNodes(layout), [layout]);
  const allEdges = useMemo(() => collectEdges(layout), [layout]);

  const highlightedValues = useMemo(() => {
    if (highlight.type === "path") return new Set(highlight.values);
    if (highlight.type === "inserted") return new Set([...highlight.path, highlight.value]);
    if (highlight.type === "deleted") return new Set(highlight.path);
    if (highlight.type === "found") return new Set([highlight.value]);
    return new Set<number>();
  }, [highlight]);

  const nodeRadius = 18;
  const xSpacing = 48;
  const ySpacing = 56;
  const padding = 30;

  const svgWidth = allNodes.length > 0 ? (Math.max(...allNodes.map(n => n.x)) + 1) * xSpacing + padding * 2 : 200;
  const svgHeight = allNodes.length > 0 ? (Math.max(...allNodes.map(n => n.y)) + 1) * ySpacing + padding * 2 : 200;

  const getNodeColor = (value: number) => {
    if (highlight.type === "inserted" && value === highlight.value) return "fill-green-500";
    if (highlight.type === "deleted" && value === highlight.path[highlight.path.length - 1]) return "fill-destructive";
    if (highlightedValues.has(value)) return "fill-orange-500";
    return "fill-primary";
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Arbre BST</CardTitle>
          <CardDescription>Insert, Search, Delete</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Valeur</label>
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ex: 25"
              onKeyDown={(e) => e.key === "Enter" && handleInsert()}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={handleInsert} size="sm" className="w-full">
              <Plus className="h-3 w-3 mr-1" /> Insérer
            </Button>
            <Button onClick={handleSearch} size="sm" variant="secondary" className="w-full">
              <Search className="h-3 w-3 mr-1" /> Chercher
            </Button>
            <Button onClick={handleDelete} size="sm" variant="destructive" className="w-full">
              <Trash2 className="h-3 w-3 mr-1" /> Supprimer
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" size="sm"><RotateCcw className="h-3 w-3 mr-1" /> Reset</Button>
            <Button onClick={handleRandom} variant="outline" size="sm"><Shuffle className="h-3 w-3 mr-1" /> Aléatoire</Button>
          </div>

          {message && (
            <div className="p-2 bg-muted rounded-md text-sm text-center">{message}</div>
          )}

          <div className="pt-4 border-t space-y-2">
            <div className="flex gap-2">
              <Badge variant="outline">Nœuds : {nodeCount}</Badge>
              <Badge variant="outline">Hauteur : {height}</Badge>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <label className="text-sm font-medium">Parcours</label>
            <div className="flex gap-1">
              {(["inorder", "preorder", "postorder"] as const).map(o => (
                <Button key={o} size="sm" variant={traversalOrder === o ? "default" : "outline"} onClick={() => setTraversalOrder(o)}>
                  {o === "inorder" ? "In-order" : o === "preorder" ? "Pre-order" : "Post-order"}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {traversal.map((v, i) => (
                <Badge key={i} variant="secondary" className="font-mono text-xs">{v}</Badge>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t text-sm text-muted-foreground space-y-1">
            <p><strong>Insert/Search</strong> : O(log n) moyen, O(n) pire cas</p>
            <p><strong>Delete</strong> : O(log n) moyen</p>
            <p><strong>In-order</strong> : nœuds triés croissant</p>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Visualisation SVG</CardTitle>
          <CardDescription>Arbre binaire de recherche interactif</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto bg-muted/30 rounded-lg border" style={{ maxHeight: 400 }}>
            {root ? (
              <svg width={svgWidth} height={svgHeight} className="mx-auto">
                {allEdges.map((e, i) => (
                  <line
                    key={i}
                    x1={e.x1 * xSpacing + padding}
                    y1={e.y1 * ySpacing + padding}
                    x2={e.x2 * xSpacing + padding}
                    y2={e.y2 * ySpacing + padding}
                    className="stroke-muted-foreground/40"
                    strokeWidth={2}
                  />
                ))}
                {allNodes.map((n, i) => (
                  <g key={i}>
                    <circle
                      cx={n.x * xSpacing + padding}
                      cy={n.y * ySpacing + padding}
                      r={nodeRadius}
                      className={`${getNodeColor(n.value)} transition-all duration-300`}
                      opacity={0.9}
                    />
                    <text
                      x={n.x * xSpacing + padding}
                      y={n.y * ySpacing + padding + 5}
                      textAnchor="middle"
                      className="fill-primary-foreground text-xs font-bold"
                      style={{ fontSize: 12 }}
                    >
                      {n.value}
                    </text>
                  </g>
                ))}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                Arbre vide — insérez un nœud
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary" /> Normal</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /> Chemin</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Inséré</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-destructive" /> Supprimé</div>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="js">
              <TabsList><TabsTrigger value="js">JavaScript</TabsTrigger><TabsTrigger value="python">Python</TabsTrigger></TabsList>
              <TabsContent value="js">
                <pre className="p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto whitespace-pre">{`class Node {
  constructor(val) { this.val = val; this.left = this.right = null; }
}
function insert(root, val) {
  if (!root) return new Node(val);
  if (val < root.val) root.left = insert(root.left, val);
  else if (val > root.val) root.right = insert(root.right, val);
  return root;
}
function search(root, val) {
  if (!root || root.val === val) return root;
  return val < root.val ? search(root.left, val) : search(root.right, val);
}
function inorder(root) {
  if (!root) return [];
  return [...inorder(root.left), root.val, ...inorder(root.right)];
}`}</pre>
              </TabsContent>
              <TabsContent value="python">
                <pre className="p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto whitespace-pre">{`class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

def insert(root, val):
    if not root: return Node(val)
    if val < root.val: root.left = insert(root.left, val)
    elif val > root.val: root.right = insert(root.right, val)
    return root

def search(root, val):
    if not root or root.val == val: return root
    return search(root.left, val) if val < root.val else search(root.right, val)

def inorder(root):
    return inorder(root.left) + [root.val] + inorder(root.right) if root else []`}</pre>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
