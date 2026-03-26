import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Activity, Play, Pause, RotateCcw, Shuffle, Search, ArrowRight } from "lucide-react";
import BSTVisualizer from "@/components/algorithms/BSTVisualizer";
import GraphVisualizer from "@/components/algorithms/GraphVisualizer";

// ===================== SORTING =====================
interface AlgorithmInfo {
  name: string;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  stable: boolean;
  description: string;
  jsCode: string;
  pythonCode: string;
}

const sortingAlgorithms: Record<string, AlgorithmInfo> = {
  bubble: {
    name: "Bubble Sort",
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)", stable: true,
    description: "Compare les éléments adjacents et les échange si nécessaire.",
    jsCode: `function bubbleSort(arr) {\n  for (let i = 0; i < arr.length - 1; i++)\n    for (let j = 0; j < arr.length - i - 1; j++)\n      if (arr[j] > arr[j+1])\n        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];\n  return arr;\n}`,
    pythonCode: `def bubble_sort(arr):\n    for i in range(len(arr) - 1):\n        for j in range(len(arr) - i - 1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr`,
  },
  insertion: {
    name: "Insertion Sort",
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)", stable: true,
    description: "Insère chaque élément à sa position correcte dans la partie triée.",
    jsCode: `function insertionSort(arr) {\n  for (let i = 1; i < arr.length; i++) {\n    let key = arr[i], j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j+1] = arr[j]; j--;\n    }\n    arr[j+1] = key;\n  }\n  return arr;\n}`,
    pythonCode: `def insertion_sort(arr):\n    for i in range(1, len(arr)):\n        key = arr[i]\n        j = i - 1\n        while j >= 0 and arr[j] > key:\n            arr[j+1] = arr[j]\n            j -= 1\n        arr[j+1] = key\n    return arr`,
  },
  selection: {
    name: "Selection Sort",
    timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)", stable: false,
    description: "Sélectionne le minimum et le place au début.",
    jsCode: `function selectionSort(arr) {\n  for (let i = 0; i < arr.length - 1; i++) {\n    let min = i;\n    for (let j = i+1; j < arr.length; j++)\n      if (arr[j] < arr[min]) min = j;\n    [arr[i], arr[min]] = [arr[min], arr[i]];\n  }\n  return arr;\n}`,
    pythonCode: `def selection_sort(arr):\n    for i in range(len(arr) - 1):\n        min_idx = i\n        for j in range(i+1, len(arr)):\n            if arr[j] < arr[min_idx]: min_idx = j\n        arr[i], arr[min_idx] = arr[min_idx], arr[i]\n    return arr`,
  },
  quick: {
    name: "Quick Sort",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
    spaceComplexity: "O(log n)", stable: false,
    description: "Diviser pour régner avec pivot. Très efficace en pratique.",
    jsCode: `function quickSort(arr, lo=0, hi=arr.length-1) {\n  if (lo < hi) {\n    let pivot = arr[hi], i = lo - 1;\n    for (let j = lo; j < hi; j++)\n      if (arr[j] <= pivot) { i++; [arr[i],arr[j]] = [arr[j],arr[i]]; }\n    [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];\n    quickSort(arr, lo, i); quickSort(arr, i+2, hi);\n  }\n  return arr;\n}`,
    pythonCode: `def quick_sort(arr, lo=0, hi=None):\n    if hi is None: hi = len(arr) - 1\n    if lo < hi:\n        pivot = partition(arr, lo, hi)\n        quick_sort(arr, lo, pivot-1)\n        quick_sort(arr, pivot+1, hi)\n    return arr`,
  },
  merge: {
    name: "Merge Sort",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    spaceComplexity: "O(n)", stable: true,
    description: "Diviser pour régner. Toujours O(n log n) mais utilise plus de mémoire.",
    jsCode: `function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}`,
    pythonCode: `def merge_sort(arr):\n    if len(arr) <= 1: return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)`,
  },
};

const complexityComparison = [
  { name: "Bubble Sort", best: "n", average: "n²", worst: "n²", space: "1", stable: "Oui" },
  { name: "Insertion Sort", best: "n", average: "n²", worst: "n²", space: "1", stable: "Oui" },
  { name: "Selection Sort", best: "n²", average: "n²", worst: "n²", space: "1", stable: "Non" },
  { name: "Quick Sort", best: "n log n", average: "n log n", worst: "n²", space: "log n", stable: "Non" },
  { name: "Merge Sort", best: "n log n", average: "n log n", worst: "n log n", space: "n", stable: "Oui" },
  { name: "Heap Sort", best: "n log n", average: "n log n", worst: "n log n", space: "1", stable: "Non" },
  { name: "Linear Search", best: "1", average: "n", worst: "n", space: "1", stable: "-" },
  { name: "Binary Search", best: "1", average: "log n", worst: "log n", space: "1", stable: "-" },
  { name: "BST Insert/Search", best: "log n", average: "log n", worst: "n", space: "n", stable: "-" },
  { name: "BFS", best: "V+E", average: "V+E", worst: "V+E", space: "V", stable: "-" },
  { name: "DFS", best: "V+E", average: "V+E", worst: "V+E", space: "V", stable: "-" },
  { name: "Dijkstra", best: "(V+E)·log V", average: "(V+E)·log V", worst: "(V+E)·log V", space: "V", stable: "-" },
];

// ===================== SEARCH =====================
interface SearchState {
  array: number[];
  target: number;
  current: number;
  low: number;
  high: number;
  found: number;
  visited: number[];
  done: boolean;
  steps: number;
}

// ===================== DP =====================
interface DPCell { value: number; computed: boolean; }

export default function AlgorithmsVisualizer() {
  // Sorting state
  const [array, setArray] = useState<number[]>([]);
  const [sorting, setSorting] = useState(false);
  const [algorithm, setAlgorithm] = useState("bubble");
  const [speed, setSpeed] = useState([50]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [codeTab, setCodeTab] = useState<"js" | "python">("js");
  const sortingRef = useRef(false);

  // Search state
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [searchAlgo, setSearchAlgo] = useState<"linear" | "binary">("binary");
  const [searchTarget, setSearchTarget] = useState("42");
  const searchingRef = useRef(false);

  // DP state
  const [dpN, setDpN] = useState(10);
  const [dpCells, setDpCells] = useState<DPCell[]>([]);
  const [dpRunning, setDpRunning] = useState(false);
  const [dpMethod, setDpMethod] = useState<"naive" | "memo" | "tabulation">("tabulation");
  const dpRef = useRef(false);

  const generateArray = (size = 30) => {
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 5);
    setArray(newArray);
    setSorted([]);
    setComparing([]);
  };

  useEffect(() => { generateArray(); }, []);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // =================== SORTING ===================
  const bubbleSort = async () => {
    const arr = [...array];
    for (let i = 0; i < arr.length - 1 && sortingRef.current; i++) {
      for (let j = 0; j < arr.length - i - 1 && sortingRef.current; j++) {
        setComparing([j, j + 1]);
        await sleep(101 - speed[0]);
        if (arr[j] > arr[j + 1]) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; setArray([...arr]); }
      }
      setSorted(prev => [...prev, arr.length - i - 1]);
    }
    if (sortingRef.current) setSorted(Array.from({ length: arr.length }, (_, i) => i));
    setComparing([]);
  };

  const insertionSort = async () => {
    const arr = [...array];
    for (let i = 1; i < arr.length && sortingRef.current; i++) {
      const key = arr[i]; let j = i - 1;
      while (j >= 0 && arr[j] > key && sortingRef.current) {
        setComparing([j, j + 1]); await sleep(101 - speed[0]);
        arr[j + 1] = arr[j]; setArray([...arr]); j--;
      }
      arr[j + 1] = key; setArray([...arr]); setSorted(prev => [...prev, i]);
    }
    if (sortingRef.current) setSorted(Array.from({ length: arr.length }, (_, i) => i));
    setComparing([]);
  };

  const selectionSort = async () => {
    const arr = [...array];
    for (let i = 0; i < arr.length - 1 && sortingRef.current; i++) {
      let minIdx = i;
      for (let j = i + 1; j < arr.length && sortingRef.current; j++) {
        setComparing([minIdx, j]); await sleep(101 - speed[0]);
        if (arr[j] < arr[minIdx]) minIdx = j;
      }
      if (minIdx !== i) { [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; setArray([...arr]); }
      setSorted(prev => [...prev, i]);
    }
    if (sortingRef.current) setSorted(Array.from({ length: arr.length }, (_, i) => i));
    setComparing([]);
  };

  const startSort = async () => {
    if (sorting) { sortingRef.current = false; setSorting(false); return; }
    setSorting(true); sortingRef.current = true; setSorted([]);
    switch (algorithm) {
      case "bubble": await bubbleSort(); break;
      case "insertion": await insertionSort(); break;
      case "selection": await selectionSort(); break;
      default: await bubbleSort();
    }
    setSorting(false); sortingRef.current = false;
  };

  const resetSort = () => { sortingRef.current = false; setSorting(false); generateArray(); };

  // =================== SEARCH ===================
  const generateSearchArray = () => {
    const arr = Array.from({ length: 20 }, (_, i) => (i + 1) * 3 + Math.floor(Math.random() * 3));
    arr.sort((a, b) => a - b);
    setSearchState({ array: arr, target: parseInt(searchTarget) || 42, current: -1, low: 0, high: arr.length - 1, found: -1, visited: [], done: false, steps: 0 });
  };

  useEffect(() => { generateSearchArray(); }, [searchAlgo]);

  const runSearch = async () => {
    if (!searchState || searchState.done) generateSearchArray();
    await sleep(100);
    const target = parseInt(searchTarget) || 42;
    const arr = searchState?.array || [];
    searchingRef.current = true;

    if (searchAlgo === "linear") {
      for (let i = 0; i < arr.length && searchingRef.current; i++) {
        setSearchState(prev => prev ? { ...prev, current: i, visited: [...prev.visited, i], steps: i + 1 } : prev);
        await sleep(300);
        if (arr[i] === target) {
          setSearchState(prev => prev ? { ...prev, found: i, done: true } : prev);
          searchingRef.current = false; return;
        }
      }
      setSearchState(prev => prev ? { ...prev, done: true, found: -1 } : prev);
    } else {
      let low = 0, high = arr.length - 1, steps = 0;
      while (low <= high && searchingRef.current) {
        const mid = Math.floor((low + high) / 2);
        steps++;
        setSearchState(prev => prev ? { ...prev, current: mid, low, high, visited: [...prev.visited, mid], steps } : prev);
        await sleep(500);
        if (arr[mid] === target) {
          setSearchState(prev => prev ? { ...prev, found: mid, done: true } : prev);
          searchingRef.current = false; return;
        }
        if (arr[mid] < target) low = mid + 1; else high = mid - 1;
      }
      setSearchState(prev => prev ? { ...prev, done: true, found: -1 } : prev);
    }
    searchingRef.current = false;
  };

  // =================== DP: FIBONACCI ===================
  const runDP = async () => {
    dpRef.current = true; setDpRunning(true);
    const cells: DPCell[] = Array.from({ length: dpN + 1 }, () => ({ value: 0, computed: false }));
    cells[0] = { value: 0, computed: true };
    if (dpN >= 1) cells[1] = { value: 1, computed: true };
    setDpCells([...cells]);
    await sleep(300);

    for (let i = 2; i <= dpN && dpRef.current; i++) {
      cells[i] = { value: cells[i - 1].value + cells[i - 2].value, computed: true };
      setDpCells([...cells]);
      await sleep(200);
    }
    dpRef.current = false; setDpRunning(false);
  };

  const currentAlgo = sortingAlgorithms[algorithm];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          Algorithmes Visuels
        </h1>
        <p className="text-muted-foreground">Visualisation animée des algorithmes de tri, recherche, arbres, graphes et programmation dynamique</p>
      </div>

      <Tabs defaultValue="sort" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="sort">Tri</TabsTrigger>
          <TabsTrigger value="search">Recherche</TabsTrigger>
          <TabsTrigger value="bst">Arbres (BST)</TabsTrigger>
          <TabsTrigger value="graph">Graphes</TabsTrigger>
          <TabsTrigger value="dp">Prog. Dynamique</TabsTrigger>
          <TabsTrigger value="complexity">Complexités</TabsTrigger>
        </TabsList>

        {/* ============ SORT TAB ============ */}
        <TabsContent value="sort">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Contrôles</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Algorithme</label>
                  <Select value={algorithm} onValueChange={setAlgorithm} disabled={sorting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(sortingAlgorithms).map(([key, algo]) => (
                        <SelectItem key={key} value={key}>{algo.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Vitesse: {speed[0]}%</label>
                  <Slider value={speed} onValueChange={setSpeed} min={1} max={100} step={1} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={startSort} className="flex-1">
                    {sorting ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {sorting ? "Pause" : "Démarrer"}
                  </Button>
                  <Button onClick={resetSort} variant="outline"><RotateCcw className="h-4 w-4" /></Button>
                  <Button onClick={() => generateArray()} variant="outline" disabled={sorting}><Shuffle className="h-4 w-4" /></Button>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-medium">{currentAlgo.name}</h4>
                  <p className="text-sm text-muted-foreground">{currentAlgo.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Best: {currentAlgo.timeComplexity.best}</Badge>
                    <Badge variant="outline">Avg: {currentAlgo.timeComplexity.average}</Badge>
                    <Badge variant="outline">Worst: {currentAlgo.timeComplexity.worst}</Badge>
                    <Badge variant="outline">Space: {currentAlgo.spaceComplexity}</Badge>
                    <Badge variant={currentAlgo.stable ? "default" : "secondary"}>{currentAlgo.stable ? "Stable" : "Non stable"}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Visualisation</CardTitle><CardDescription>Barres oranges = comparées, vertes = triées</CardDescription></CardHeader>
              <CardContent>
                <div className="flex items-end justify-center gap-[2px] h-64 bg-muted/50 rounded-lg p-4">
                  {array.map((value, idx) => (
                    <div key={idx} className={`w-full max-w-3 rounded-t transition-all duration-75 ${sorted.includes(idx) ? "bg-green-500" : comparing.includes(idx) ? "bg-orange-500" : "bg-primary"}`} style={{ height: `${value}%` }} />
                  ))}
                </div>
                <div className="mt-6">
                  <Tabs value={codeTab} onValueChange={(v) => setCodeTab(v as "js" | "python")}>
                    <TabsList><TabsTrigger value="js">JavaScript</TabsTrigger><TabsTrigger value="python">Python</TabsTrigger></TabsList>
                    <TabsContent value="js"><ScrollArea className="h-48"><pre className="p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto">{currentAlgo.jsCode}</pre></ScrollArea></TabsContent>
                    <TabsContent value="python"><ScrollArea className="h-48"><pre className="p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto">{currentAlgo.pythonCode}</pre></ScrollArea></TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============ SEARCH TAB ============ */}
        <TabsContent value="search">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Recherche</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Algorithme</label>
                  <Select value={searchAlgo} onValueChange={(v) => { setSearchAlgo(v as any); searchingRef.current = false; }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear Search — O(n)</SelectItem>
                      <SelectItem value="binary">Binary Search — O(log n)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Valeur cible</label>
                  <Input type="number" value={searchTarget} onChange={(e) => setSearchTarget(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={runSearch} className="flex-1">
                    <Search className="h-4 w-4 mr-2" /> Chercher
                  </Button>
                  <Button onClick={generateSearchArray} variant="outline"><Shuffle className="h-4 w-4" /></Button>
                </div>
                {searchState && (
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <p>Étapes : <Badge variant="outline">{searchState.steps}</Badge></p>
                    <p>Résultat : {searchState.done ? (searchState.found >= 0 ? <Badge className="bg-green-500/20 text-green-400">Trouvé à l'index {searchState.found}</Badge> : <Badge variant="destructive">Non trouvé</Badge>) : <Badge variant="secondary">En cours...</Badge>}</p>
                  </div>
                )}
                <div className="pt-4 border-t text-sm text-muted-foreground">
                  {searchAlgo === "binary" ? (
                    <p><strong>Binary Search</strong> divise l'espace de recherche en 2 à chaque étape. Requiert un tableau trié. O(log n).</p>
                  ) : (
                    <p><strong>Linear Search</strong> parcourt chaque élément un par un. Fonctionne sur tout tableau. O(n).</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Visualisation — {searchAlgo === "binary" ? "Binary" : "Linear"} Search</CardTitle></CardHeader>
              <CardContent>
                {searchState && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {searchState.array.map((val, idx) => {
                      let bg = "bg-muted";
                      if (searchState.found === idx) bg = "bg-green-500 text-white";
                      else if (searchState.current === idx) bg = "bg-orange-500 text-white";
                      else if (searchState.visited.includes(idx)) bg = "bg-muted-foreground/30";
                      else if (searchAlgo === "binary" && idx >= searchState.low && idx <= searchState.high) bg = "bg-primary/20";
                      return (
                        <div key={idx} className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono text-sm font-bold transition-all ${bg}`}>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500" /> Courant</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /> Trouvé</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-muted-foreground/30" /> Visité</div>
                  {searchAlgo === "binary" && <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary/20" /> Zone active</div>}
                </div>

                <div className="mt-6">
                  <Tabs defaultValue="js">
                    <TabsList><TabsTrigger value="js">JavaScript</TabsTrigger><TabsTrigger value="python">Python</TabsTrigger></TabsList>
                    <TabsContent value="js">
                      <pre className="p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                        {searchAlgo === "binary" ? `function binarySearch(arr, target) {\n  let low = 0, high = arr.length - 1;\n  while (low <= high) {\n    const mid = Math.floor((low + high) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}` : `function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) return i;\n  }\n  return -1;\n}`}
                      </pre>
                    </TabsContent>
                    <TabsContent value="python">
                      <pre className="p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                        {searchAlgo === "binary" ? `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1` : `def linear_search(arr, target):\n    for i, val in enumerate(arr):\n        if val == target:\n            return i\n    return -1`}
                      </pre>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============ BST TAB ============ */}
        <TabsContent value="bst">
          <BSTVisualizer />
        </TabsContent>

        {/* ============ GRAPH TAB ============ */}
        <TabsContent value="graph">
          <GraphVisualizer />
        </TabsContent>

        {/* ============ DP TAB ============ */}
        <TabsContent value="dp">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Programmation Dynamique</CardTitle><CardDescription>Fibonacci — Tabulation</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">N = {dpN}</label>
                  <Slider value={[dpN]} onValueChange={([v]) => setDpN(v)} min={2} max={30} step={1} />
                </div>
                <Button onClick={runDP} disabled={dpRunning} className="w-full">
                  <Play className="h-4 w-4 mr-2" /> Calculer Fibonacci({dpN})
                </Button>
                {dpCells.length > 0 && dpCells[dpN]?.computed && (
                  <div className="pt-4 border-t">
                    <p className="text-sm">Résultat : <Badge variant="secondary" className="text-lg">{dpCells[dpN].value}</Badge></p>
                  </div>
                )}
                <div className="pt-4 border-t text-sm text-muted-foreground space-y-2">
                  <p><strong>Naïf (récursif)</strong> : O(2^n) — recalcule les mêmes sous-problèmes</p>
                  <p><strong>Mémoïsation</strong> : O(n) — cache top-down</p>
                  <p><strong>Tabulation</strong> : O(n) — remplissage bottom-up du tableau</p>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Tableau de Fibonacci</CardTitle><CardDescription>Chaque cellule = somme des deux précédentes</CardDescription></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dpCells.map((cell, idx) => (
                    <div key={idx} className={`flex flex-col items-center justify-center rounded-lg border p-2 min-w-[48px] transition-all ${cell.computed ? "bg-primary/20 border-primary" : "bg-muted border-border"}`}>
                      <span className="text-xs text-muted-foreground">F({idx})</span>
                      <span className="font-mono font-bold text-sm">{cell.computed ? cell.value : "?"}</span>
                    </div>
                  ))}
                </div>
                {dpCells.length > 2 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg text-sm font-mono">
                    <p className="text-muted-foreground mb-1">Formule :</p>
                    <p>F(n) = F(n-1) + F(n-2), F(0)=0, F(1)=1</p>
                  </div>
                )}
                <div className="mt-6">
                  <Tabs defaultValue="js">
                    <TabsList><TabsTrigger value="js">JavaScript</TabsTrigger><TabsTrigger value="python">Python</TabsTrigger></TabsList>
                    <TabsContent value="js">
                      <pre className="p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto">{`// Tabulation - O(n) time, O(n) space\nfunction fibonacci(n) {\n  const dp = [0, 1];\n  for (let i = 2; i <= n; i++) {\n    dp[i] = dp[i-1] + dp[i-2];\n  }\n  return dp[n];\n}\n\n// Memoization - O(n) time\nfunction fibMemo(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  memo[n] = fibMemo(n-1, memo) + fibMemo(n-2, memo);\n  return memo[n];\n}`}</pre>
                    </TabsContent>
                    <TabsContent value="python">
                      <pre className="p-4 bg-muted rounded-md text-sm font-mono overflow-x-auto">{`# Tabulation - O(n)\ndef fibonacci(n):\n    dp = [0, 1]\n    for i in range(2, n + 1):\n        dp.append(dp[i-1] + dp[i-2])\n    return dp[n]\n\n# Memoization\nfrom functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib_memo(n):\n    if n <= 1: return n\n    return fib_memo(n-1) + fib_memo(n-2)`}</pre>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============ COMPLEXITY TAB ============ */}
        <TabsContent value="complexity">
          <Card>
            <CardHeader><CardTitle>Comparaison des complexités</CardTitle><CardDescription>Big O des algorithmes courants</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Algorithme</TableHead><TableHead>Best</TableHead><TableHead>Average</TableHead><TableHead>Worst</TableHead><TableHead>Space</TableHead><TableHead>Stable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complexityComparison.map((algo) => (
                    <TableRow key={algo.name}>
                      <TableCell className="font-medium">{algo.name}</TableCell>
                      <TableCell><Badge variant="outline">O({algo.best})</Badge></TableCell>
                      <TableCell><Badge variant="outline">O({algo.average})</Badge></TableCell>
                      <TableCell><Badge variant="outline">O({algo.worst})</Badge></TableCell>
                      <TableCell><Badge variant="secondary">O({algo.space})</Badge></TableCell>
                      <TableCell>{algo.stable}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Notation Big O — Rappel</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><Badge className="mb-1">O(1)</Badge> - Constant <p className="text-muted-foreground">Accès direct (array[i])</p></div>
                  <div><Badge className="mb-1">O(log n)</Badge> - Logarithmique <p className="text-muted-foreground">Recherche binaire</p></div>
                  <div><Badge className="mb-1">O(n)</Badge> - Linéaire <p className="text-muted-foreground">Parcours simple</p></div>
                  <div><Badge className="mb-1">O(n log n)</Badge> - Linéarithmique <p className="text-muted-foreground">Merge sort, Quick sort</p></div>
                  <div><Badge variant="destructive" className="mb-1">O(n²)</Badge> - Quadratique <p className="text-muted-foreground">Boucles imbriquées</p></div>
                  <div><Badge variant="destructive" className="mb-1">O(2^n)</Badge> - Exponentiel <p className="text-muted-foreground">Fibonacci récursif naïf</p></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
