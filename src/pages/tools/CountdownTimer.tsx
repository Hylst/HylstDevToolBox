import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Play, Pause, RotateCcw, SkipForward, Coffee, Zap, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PomodoroPhase = "work" | "short-break" | "long-break";

const PRESETS = [
  { label: "Pomodoro 25/5", work: 25, shortBreak: 5, longBreak: 15, sessions: 4 },
  { label: "Court 15/3", work: 15, shortBreak: 3, longBreak: 10, sessions: 4 },
  { label: "Long 50/10", work: 50, shortBreak: 10, longBreak: 30, sessions: 4 },
  { label: "Sprint 10/2", work: 10, shortBreak: 2, longBreak: 5, sessions: 6 },
];

// Simple beep sound using Web Audio API
function playNotification() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.frequency.value = 1000; gain2.gain.value = 0.3;
      osc2.start(); gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc2.stop(ctx.currentTime + 1);
    }, 300);
  } catch { /* silent fail */ }
}

export default function CountdownTimer() {
  const [targetDate, setTargetDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 16); });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [stopwatch, setStopwatch] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"countdown" | "stopwatch" | "pomodoro" | "timebox">("pomodoro");
  const { toast } = useToast();

  // Timebox state
  const [timeboxTasks, setTimeboxTasks] = useState<{ name: string; minutes: number }[]>([
    { name: "Tâche 1", minutes: 25 },
    { name: "Pause", minutes: 5 },
    { name: "Tâche 2", minutes: 25 },
  ]);
  const [timeboxIndex, setTimeboxIndex] = useState(0);
  const [timeboxSeconds, setTimeboxSeconds] = useState(0);
  const [timeboxRunning, setTimeboxRunning] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);

  // Pomodoro state
  const [preset, setPreset] = useState(PRESETS[0]);
  const [pomPhase, setPomPhase] = useState<PomodoroPhase>("work");
  const [pomSeconds, setPomSeconds] = useState(25 * 60);
  const [pomRunning, setPomRunning] = useState(false);
  const [pomSession, setPomSession] = useState(1);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [laps, setLaps] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown
  useEffect(() => {
    if (mode !== "countdown") return;
    const interval = setInterval(() => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, mode]);

  // Stopwatch
  useEffect(() => {
    if (mode !== "stopwatch") return;
    if (!isRunning) return;
    const interval = setInterval(() => setStopwatch(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [mode, isRunning]);

  // Pomodoro
  useEffect(() => {
    if (mode !== "pomodoro" || !pomRunning) return;
    intervalRef.current = setInterval(() => {
      setPomSeconds(s => {
        if (s <= 1) { handlePhaseComplete(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [mode, pomRunning, pomPhase, pomSession, preset]);

  // Timebox
  useEffect(() => {
    if (mode !== "timebox" || !timeboxRunning || timeboxIndex >= timeboxTasks.length) return;
    const interval = setInterval(() => {
      setTimeboxSeconds(s => {
        if (s <= 1) {
          playNotification();
          if (timeboxIndex < timeboxTasks.length - 1) {
            setTimeboxIndex(i => i + 1);
            setTimeboxSeconds(timeboxTasks[timeboxIndex + 1].minutes * 60);
            toast({ title: "⏭ Tâche suivante", description: timeboxTasks[timeboxIndex + 1].name });
          } else {
            setTimeboxRunning(false);
            toast({ title: "🎉 Timebox terminé !", description: "Toutes les tâches sont terminées" });
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, timeboxRunning, timeboxIndex, timeboxTasks, toast]);

  const handlePhaseComplete = useCallback(() => {
    setPomRunning(false);
    playNotification();

    if (pomPhase === "work") {
      setTotalCompleted(c => c + 1);
      if (pomSession >= preset.sessions) {
        setPomPhase("long-break");
        setPomSeconds(preset.longBreak * 60);
        setPomSession(1);
        toast({ title: "🎉 Cycle complet !", description: `Pause longue de ${preset.longBreak} min` });
      } else {
        setPomPhase("short-break");
        setPomSeconds(preset.shortBreak * 60);
        toast({ title: "⏸ Pause courte", description: `${preset.shortBreak} min — Session ${pomSession}/${preset.sessions}` });
      }
    } else {
      setPomPhase("work");
      setPomSeconds(preset.work * 60);
      if (pomPhase === "short-break") setPomSession(s => s + 1);
      toast({ title: "💪 Au travail !", description: `Session ${pomPhase === "short-break" ? pomSession + 1 : 1}` });
    }
  }, [pomPhase, pomSession, preset, toast]);

  const resetPomodoro = () => {
    setPomRunning(false);
    setPomPhase("work");
    setPomSeconds(preset.work * 60);
    setPomSession(1);
  };

  const skipPhase = () => {
    setPomRunning(false);
    handlePhaseComplete();
  };

  const selectPreset = (p: typeof PRESETS[0]) => {
    setPreset(p);
    setPomPhase("work");
    setPomSeconds(p.work * 60);
    setPomSession(1);
    setPomRunning(false);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const formatStopwatch = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const phaseLabel: Record<PomodoroPhase, string> = { work: "Travail", "short-break": "Pause courte", "long-break": "Pause longue" };
  const phaseColor: Record<PomodoroPhase, string> = { work: "text-primary", "short-break": "text-green-500", "long-break": "text-blue-500" };
  const totalPomMinutes = (pomPhase === "work" ? preset.work : pomPhase === "short-break" ? preset.shortBreak : preset.longBreak);
  const progress = ((totalPomMinutes * 60 - pomSeconds) / (totalPomMinutes * 60)) * 100;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Clock className="h-8 w-8 text-primary" /> Countdown & Pomodoro
      </h1>

      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList className="mb-6">
          <TabsTrigger value="pomodoro"><Timer className="h-4 w-4 mr-1" /> Pomodoro</TabsTrigger>
          <TabsTrigger value="timebox"><Zap className="h-4 w-4 mr-1" /> Timebox</TabsTrigger>
          <TabsTrigger value="countdown">Compte à rebours</TabsTrigger>
          <TabsTrigger value="stopwatch">Chronomètre</TabsTrigger>
        </TabsList>

        <TabsContent value="pomodoro">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardContent className="pt-6 text-center space-y-6">
                {/* Phase indicator */}
                <div className="flex items-center justify-center gap-2">
                  {pomPhase === "work" ? <Zap className="h-5 w-5 text-primary" /> : <Coffee className="h-5 w-5 text-green-500" />}
                  <span className={`text-lg font-semibold ${phaseColor[pomPhase]}`}>{phaseLabel[pomPhase]}</span>
                  <Badge variant="secondary">Session {pomSession}/{preset.sessions}</Badge>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>

                {/* Timer */}
                <div className={`text-7xl font-bold font-mono ${phaseColor[pomPhase]}`}>
                  {formatTime(pomSeconds)}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-3">
                  <Button size="lg" onClick={() => setPomRunning(!pomRunning)}>
                    {pomRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button size="lg" variant="outline" onClick={skipPhase}>
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={resetPomodoro}>
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>

                {/* Session dots */}
                <div className="flex justify-center gap-2">
                  {Array.from({ length: preset.sessions }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < pomSession - (pomPhase === "work" ? 1 : 0) ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Presets</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      variant={preset.label === p.label ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => selectPreset(p)}
                    >
                      {p.label}
                      <span className="ml-auto text-xs opacity-70">{p.work}/{p.shortBreak}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Statistiques</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sessions terminées</span>
                    <span className="font-bold">{totalCompleted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Temps de travail</span>
                    <span className="font-bold">{totalCompleted * preset.work} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cycles complets</span>
                    <span className="font-bold">{Math.floor(totalCompleted / preset.sessions)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="countdown">
          <Card>
            <CardHeader><CardTitle>Date cible</CardTitle></CardHeader>
            <CardContent>
              <Input type="datetime-local" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="mb-6" />
              <div className="grid grid-cols-4 gap-4 text-center">
                {Object.entries(timeLeft).map(([key, val]) => (
                  <div key={key} className="bg-muted p-4 rounded-lg">
                    <div className="text-4xl font-bold font-mono">{String(val).padStart(2, "0")}</div>
                    <div className="text-sm text-muted-foreground capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stopwatch">
          <Card>
            <CardContent className="pt-6 text-center space-y-6">
              <div className="text-6xl font-bold font-mono">{formatStopwatch(stopwatch)}</div>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setIsRunning(!isRunning)}>
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" onClick={() => { if (isRunning) setLaps(l => [formatStopwatch(stopwatch), ...l]); }}>
                  Lap
                </Button>
                <Button variant="outline" onClick={() => { setStopwatch(0); setIsRunning(false); setLaps([]); }}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              {laps.length > 0 && (
                <div className="text-left max-w-xs mx-auto space-y-1">
                  {laps.map((lap, i) => (
                    <div key={i} className="flex justify-between text-sm font-mono bg-muted px-3 py-1 rounded">
                      <span className="text-muted-foreground">#{laps.length - i}</span>
                      <span>{lap}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timebox">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Planifier les tâches</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {timeboxTasks.map((task, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded ${i === timeboxIndex && timeboxRunning ? "bg-primary/10 border border-primary" : "bg-muted"}`}>
                    <Badge variant={i < timeboxIndex ? "default" : i === timeboxIndex ? "default" : "secondary"} className="shrink-0">
                      {i < timeboxIndex ? "✓" : i + 1}
                    </Badge>
                    <span className="flex-1 text-sm font-medium">{task.name}</span>
                    <span className="text-xs text-muted-foreground">{task.minutes}m</span>
                    {!timeboxRunning && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setTimeboxTasks(t => t.filter((_, j) => j !== i))}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {!timeboxRunning && (
                  <div className="flex gap-2 pt-2">
                    <Input placeholder="Nom" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} className="flex-1" />
                    <Input type="number" value={newTaskMinutes} onChange={e => setNewTaskMinutes(Number(e.target.value))} className="w-20" min={1} max={120} />
                    <Button size="sm" onClick={() => { if (newTaskName.trim()) { setTimeboxTasks(t => [...t, { name: newTaskName.trim(), minutes: newTaskMinutes }]); setNewTaskName(""); } }}>+</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center space-y-6">
                {timeboxTasks.length > 0 && timeboxIndex < timeboxTasks.length ? (
                  <>
                    <Badge variant="secondary" className="text-lg px-4 py-1">{timeboxTasks[timeboxIndex].name}</Badge>
                    <div className="text-6xl font-bold font-mono text-primary">
                      {formatTime(timeboxRunning ? timeboxSeconds : timeboxTasks[timeboxIndex].minutes * 60)}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${timeboxRunning ? ((timeboxTasks[timeboxIndex].minutes * 60 - timeboxSeconds) / (timeboxTasks[timeboxIndex].minutes * 60)) * 100 : 0}%` }} />
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button size="lg" onClick={() => { if (!timeboxRunning) { setTimeboxSeconds(timeboxTasks[timeboxIndex].minutes * 60); } setTimeboxRunning(!timeboxRunning); }}>
                        {timeboxRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => { setTimeboxRunning(false); setTimeboxIndex(0); setTimeboxSeconds(0); }}>
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tâche {timeboxIndex + 1}/{timeboxTasks.length} · Total : {timeboxTasks.reduce((a, t) => a + t.minutes, 0)} min
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground py-8">Ajoutez des tâches pour commencer</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
