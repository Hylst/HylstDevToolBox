import { useState, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, RotateCcw, Shuffle } from "lucide-react";

interface GraphNode {
  id: string;
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

interface GraphDef {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

type VisitState = Map<string, "unvisited" | "visiting" | "visited">;

const defaultGraph: GraphDef = {
  nodes: [
    { id: "A", x: 80, y: 60 },
    { id: "B", x: 220, y: 40 },
    { id: "C", x: 360, y: 60 },
    { id: "D", x: 80, y: 180 },
    { id: "E", x: 220, y: 200 },
    { id: "F", x: 360, y: 180 },
    { id: "G", x: 220, y: 120 },
  ],
  edges: [
    { from: "A", to: "B", weight: 4 },
    { from: "A", to: "D", weight: 2 },
    { from: "B", to: "C", weight: 3 },
    { from: "B", to: "G", weight: 1 },
    { from: "C", to: "F", weight: 5 },
    { from: "D", to: "E", weight: 7 },
    { from: "D", to: "G", weight: 3 },
    { from: "E", to: "F", weight: 1 },
    { from: "E", to: "G", weight: 2 },
    { from: "G", to: "F", weight: 6 },
  ],
};

function generateRandomGraph(): GraphDef {
  const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const count = 6 + Math.floor(Math.random() * 3);
  const nodes: GraphNode[] = labels.slice(0, count).map((id, i) => ({
    id,
    x: 60 + (i % 4) * 110 + Math.random() * 30,
    y: 50 + Math.floor(i / 4) * 140 + Math.random() * 30,
  }));
  const edges: GraphEdge[] = [];
  for (let i = 0; i < count; i++) {
    const targets = new Set<number>();
    const numEdges = 1 + Math.floor(Math.random() * 2);
    for (let e = 0; e < numEdges; e++) {
      const j = Math.floor(Math.random() * count);
      if (j !== i && !targets.has(j)) {
        targets.add(j);
        edges.push({ from: nodes[i].id, to: nodes[j].id, weight: 1 + Math.floor(Math.random() * 9) });
      }
    }
  }
  return { nodes, edges };
}

function buildAdjList(graph: GraphDef): Map<string, { to: string; weight: number }[]> {
  const adj = new Map<string, { to: string; weight: number }[]>();
  for (const n of graph.nodes) adj.set(n.id, []);
  for (const e of graph.edges) {
    adj.get(e.from)?.push({ to: e.to, weight: e.weight });
    adj.get(e.to)?.push({ to: e.from, weight: e.weight });
  }
  return adj;
}

export default function GraphVisualizer() {
  const [graph, setGraph] = useState<GraphDef>(defaultGraph);
  const [algo, setAlgo] = useState<"bfs" | "dfs" | "dijkstra">("dijkstra");
  const [startNode, setStartNode] = useState("A");
  const [visitState, setVisitState] = useState<VisitState>(new Map());
  const [visitOrder, setVisitOrder] = useState<string[]>([]);
  const [distances, setDistances] = useState<Map<string, number>>(new Map());
  const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const runRef = useRef(false);

  const adj = useMemo(() => buildAdjList(graph), [graph]);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const edgeKey = (a: string, b: string) => [a, b].sort().join("-");

  const reset = useCallback(() => {
    setVisitState(new Map());
    setVisitOrder([]);
    setDistances(new Map());
    setActiveEdges(new Set());
    setMessage("");
    runRef.current = false;
    setRunning(false);
  }, []);

  const runBFS = async () => {
    const visited = new Map<string, "unvisited" | "visiting" | "visited">();
    graph.nodes.forEach(n => visited.set(n.id, "unvisited"));
    const queue = [startNode];
    visited.set(startNode, "visiting");
    const order: string[] = [];
    const edges = new Set<string>();

    setVisitState(new Map(visited));
    await sleep(400);

    while (queue.length > 0 && runRef.current) {
      const current = queue.shift()!;
      visited.set(current, "visited");
      order.push(current);
      setVisitOrder([...order]);
      setVisitState(new Map(visited));
      await sleep(500);

      for (const neighbor of adj.get(current) || []) {
        if (visited.get(neighbor.to) === "unvisited" && runRef.current) {
          visited.set(neighbor.to, "visiting");
          queue.push(neighbor.to);
          edges.add(edgeKey(current, neighbor.to));
          setActiveEdges(new Set(edges));
          setVisitState(new Map(visited));
          await sleep(300);
        }
      }
    }
    setMessage(`BFS terminé : ${order.join(" → ")}`);
  };

  const runDFS = async () => {
    const visited = new Map<string, "unvisited" | "visiting" | "visited">();
    graph.nodes.forEach(n => visited.set(n.id, "unvisited"));
    const order: string[] = [];
    const edges = new Set<string>();

    const dfs = async (node: string) => {
      if (!runRef.current) return;
      visited.set(node, "visiting");
      setVisitState(new Map(visited));
      await sleep(400);

      order.push(node);
      setVisitOrder([...order]);

      for (const neighbor of adj.get(node) || []) {
        if (visited.get(neighbor.to) === "unvisited" && runRef.current) {
          edges.add(edgeKey(node, neighbor.to));
          setActiveEdges(new Set(edges));
          await dfs(neighbor.to);
        }
      }

      visited.set(node, "visited");
      setVisitState(new Map(visited));
      await sleep(200);
    };

    await dfs(startNode);
    setMessage(`DFS terminé : ${order.join(" → ")}`);
  };

  const runDijkstra = async () => {
    const dist = new Map<string, number>();
    const prev = new Map<string, string | null>();
    const visited = new Map<string, "unvisited" | "visiting" | "visited">();
    graph.nodes.forEach(n => {
      dist.set(n.id, n.id === startNode ? 0 : Infinity);
      prev.set(n.id, null);
      visited.set(n.id, "unvisited");
    });

    const unvisited = new Set(graph.nodes.map(n => n.id));
    const order: string[] = [];
    const edges = new Set<string>();

    setDistances(new Map(dist));
    setVisitState(new Map(visited));
    await sleep(400);

    while (unvisited.size > 0 && runRef.current) {
      let minNode = "";
      let minDist = Infinity;
      for (const n of unvisited) {
        if ((dist.get(n) ?? Infinity) < minDist) {
          minDist = dist.get(n)!;
          minNode = n;
        }
      }
      if (minDist === Infinity) break;

      unvisited.delete(minNode);
      visited.set(minNode, "visiting");
      setVisitState(new Map(visited));
      await sleep(400);

      order.push(minNode);
      setVisitOrder([...order]);

      for (const neighbor of adj.get(minNode) || []) {
        if (unvisited.has(neighbor.to) && runRef.current) {
          const newDist = (dist.get(minNode) ?? Infinity) + neighbor.weight;
          if (newDist < (dist.get(neighbor.to) ?? Infinity)) {
            dist.set(neighbor.to, newDist);
            prev.set(neighbor.to, minNode);
            edges.add(edgeKey(minNode, neighbor.to));
            setActiveEdges(new Set(edges));
            setDistances(new Map(dist));
          }
        }
      }

      visited.set(minNode, "visited");
      setVisitState(new Map(visited));
      await sleep(300);
    }
    setDistances(new Map(dist));
    setMessage(`Dijkstra terminé depuis ${startNode}`);
  };

  const run = async () => {
    reset();
    await sleep(100);
    runRef.current = true;
    setRunning(true);
    if (algo === "bfs") await runBFS();
    else if (algo === "dfs") await runDFS();
    else await runDijkstra();
    runRef.current = false;
    setRunning(false);
  };

  const nodeRadius = 22;

  const getNodeFill = (id: string) => {
    const state = visitState.get(id);
    if (state === "visited") return "fill-green-500";
    if (state === "visiting") return "fill-orange-500";
    return "fill-muted-foreground/60";
  };

  const getEdgeClass = (from: string, to: string) => {
    const key = edgeKey(from, to);
    return activeEdges.has(key) ? "stroke-primary stroke-[3]" : "stroke-muted-foreground/30 stroke-[2]";
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Graphes</CardTitle>
          <CardDescription>BFS, DFS, Dijkstra</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Algorithme</label>
            <Select value={algo} onValueChange={(v) => { setAlgo(v as any); reset(); }} disabled={running}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bfs">BFS (Breadth-First)</SelectItem>
                <SelectItem value="dfs">DFS (Depth-First)</SelectItem>
                <SelectItem value="dijkstra">Dijkstra (Plus court chemin)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Nœud de départ</label>
            <Select value={startNode} onValueChange={setStartNode} disabled={running}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {graph.nodes.map(n => (
                  <SelectItem key={n.id} value={n.id}>{n.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={run} disabled={running} className="flex-1">
              <Play className="h-4 w-4 mr-2" /> Lancer
            </Button>
            <Button onClick={reset} variant="outline"><RotateCcw className="h-4 w-4" /></Button>
            <Button onClick={() => { reset(); setGraph(generateRandomGraph()); }} variant="outline" disabled={running}>
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>

          {visitOrder.length > 0 && (
            <div className="pt-4 border-t space-y-2">
              <label className="text-sm font-medium">Ordre de visite</label>
              <div className="flex flex-wrap gap-1">
                {visitOrder.map((v, i) => (
                  <Badge key={i} variant="secondary" className="font-mono">{v}</Badge>
                ))}
              </div>
            </div>
          )}

          {algo === "dijkstra" && distances.size > 0 && (
            <div className="pt-4 border-t space-y-2">
              <label className="text-sm font-medium">Distances depuis {startNode}</label>
              <div className="space-y-1">
                {graph.nodes.map(n => (
                  <div key={n.id} className="flex justify-between text-sm font-mono">
                    <span>{n.id}</span>
                    <Badge variant="outline">
                      {(distances.get(n.id) ?? Infinity) === Infinity ? "∞" : distances.get(n.id)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {message && <div className="p-2 bg-muted rounded-md text-sm text-center">{message}</div>}

          <div className="pt-4 border-t text-sm text-muted-foreground space-y-1">
            {algo === "bfs" && <p><strong>BFS</strong> explore niveau par niveau. O(V+E). Trouve le plus court chemin en non-pondéré.</p>}
            {algo === "dfs" && <p><strong>DFS</strong> explore en profondeur. O(V+E). Détecte les cycles, tri topologique.</p>}
            {algo === "dijkstra" && <p><strong>Dijkstra</strong> trouve les plus courts chemins pondérés. O((V+E)·log V). Poids positifs uniquement.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Visualisation SVG</CardTitle>
          <CardDescription>Graphe non-orienté pondéré</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto bg-muted/30 rounded-lg border" style={{ maxHeight: 400 }}>
            <svg width={460} height={260} className="mx-auto">
              {/* Edges */}
              {graph.edges.map((e, i) => {
                const from = graph.nodes.find(n => n.id === e.from)!;
                const to = graph.nodes.find(n => n.id === e.to)!;
                const mx = (from.x + to.x) / 2;
                const my = (from.y + to.y) / 2;
                return (
                  <g key={i}>
                    <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      className={`${getEdgeClass(e.from, e.to)} transition-all duration-300`}
                    />
                    <rect x={mx - 8} y={my - 8} width={16} height={16} rx={3}
                      className="fill-background/80" />
                    <text x={mx} y={my + 4} textAnchor="middle"
                      className="fill-muted-foreground text-[10px] font-mono">
                      {e.weight}
                    </text>
                  </g>
                );
              })}
              {/* Nodes */}
              {graph.nodes.map(n => (
                <g key={n.id}>
                  <circle
                    cx={n.x} cy={n.y} r={nodeRadius}
                    className={`${getNodeFill(n.id)} transition-all duration-300`}
                    opacity={0.9}
                  />
                  <text x={n.x} y={n.y + 5} textAnchor="middle"
                    className="fill-primary-foreground text-sm font-bold" style={{ fontSize: 14 }}>
                    {n.id}
                  </text>
                  {algo === "dijkstra" && distances.has(n.id) && (
                    <text x={n.x} y={n.y - nodeRadius - 6} textAnchor="middle"
                      className="fill-primary text-[10px] font-mono font-bold">
                      {(distances.get(n.id) ?? Infinity) === Infinity ? "∞" : distances.get(n.id)}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-muted-foreground/60" /> Non visité</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /> En cours</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Visité</div>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="js">
              <TabsList><TabsTrigger value="js">JavaScript</TabsTrigger><TabsTrigger value="python">Python</TabsTrigger></TabsList>
              <TabsContent value="js">
                <pre className="p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto whitespace-pre">{algo === "dijkstra" ? `function dijkstra(graph, start) {
  const dist = {}, visited = new Set();
  for (const node of graph.nodes) dist[node] = Infinity;
  dist[start] = 0;

  while (visited.size < graph.nodes.length) {
    // Pick unvisited node with min distance
    let u = null;
    for (const n of graph.nodes)
      if (!visited.has(n) && (!u || dist[n] < dist[u])) u = n;
    if (dist[u] === Infinity) break;
    visited.add(u);
    for (const [v, w] of graph.adj[u]) {
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  return dist;
}` : algo === "bfs" ? `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph.adj[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}` : `function dfs(graph, start) {
  const visited = new Set();
  const order = [];

  function explore(node) {
    visited.add(node);
    order.push(node);
    for (const neighbor of graph.adj[node]) {
      if (!visited.has(neighbor)) explore(neighbor);
    }
  }
  explore(start);
  return order;
}`}</pre>
              </TabsContent>
              <TabsContent value="python">
                <pre className="p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto whitespace-pre">{algo === "dijkstra" ? `import heapq

def dijkstra(graph, start):
    dist = {n: float('inf') for n in graph}
    dist[start] = 0
    pq = [(0, start)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist` : algo === "bfs" ? `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order` : `def dfs(graph, start):
    visited = set()
    order = []

    def explore(node):
        visited.add(node)
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                explore(neighbor)

    explore(start)
    return order`}</pre>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
