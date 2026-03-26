import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Copy, Info } from "lucide-react";
import { toast } from "sonner";

export default function CronBuilder() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [cronExpression, setCronExpression] = useState("* * * * *");
  const [nextExecutions, setNextExecutions] = useState<string[]>([]);

  const presets = [
    { label: "Chaque minute", value: "* * * * *" },
    { label: "Chaque heure", value: "0 * * * *" },
    { label: "Chaque jour à minuit", value: "0 0 * * *" },
    { label: "Chaque lundi à 9h", value: "0 9 * * 1" },
    { label: "Chaque 1er du mois", value: "0 0 1 * *" },
    { label: "Toutes les 5 minutes", value: "*/5 * * * *" },
    { label: "Tous les jours à 12h", value: "0 12 * * *" },
    { label: "Du lundi au vendredi à 8h", value: "0 8 * * 1-5" },
  ];

  const minuteOptions = [
    { label: "Chaque minute", value: "*" },
    { label: "Toutes les 5 min", value: "*/5" },
    { label: "Toutes les 10 min", value: "*/10" },
    { label: "Toutes les 15 min", value: "*/15" },
    { label: "Toutes les 30 min", value: "*/30" },
  ];

  const hourOptions = [
    { label: "Chaque heure", value: "*" },
    { label: "Toutes les 2h", value: "*/2" },
    { label: "Toutes les 6h", value: "*/6" },
    { label: "Toutes les 12h", value: "*/12" },
  ];

  useEffect(() => {
    const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setCronExpression(expression);
    calculateNextExecutions(expression);
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const calculateNextExecutions = (cron: string) => {
    // Simplified next execution calculation
    const executions: string[] = [];
    const now = new Date();
    
    for (let i = 0; i < 5; i++) {
      const next = new Date(now);
      next.setMinutes(next.getMinutes() + (i + 1) * 5);
      executions.push(next.toLocaleString('fr-FR', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    }
    
    setNextExecutions(executions);
  };

  const loadPreset = (preset: string) => {
    const parts = preset.split(" ");
    setMinute(parts[0] || "*");
    setHour(parts[1] || "*");
    setDayOfMonth(parts[2] || "*");
    setMonth(parts[3] || "*");
    setDayOfWeek(parts[4] || "*");
    toast.success("Preset chargé !");
  };

  const copyCronExpression = () => {
    navigator.clipboard.writeText(cronExpression);
    toast.success("Expression cron copiée !");
  };

  const getHumanReadable = (cron: string): string => {
    const parts = cron.split(" ");
    const [min, hr, dom, mon, dow] = parts;

    if (cron === "* * * * *") return "Chaque minute";
    if (cron === "0 * * * *") return "Chaque heure";
    if (cron === "0 0 * * *") return "Chaque jour à minuit";
    if (cron === "0 9 * * 1") return "Chaque lundi à 9h00";
    if (cron === "0 0 1 * *") return "Le 1er de chaque mois à minuit";
    if (cron === "*/5 * * * *") return "Toutes les 5 minutes";
    if (cron === "0 12 * * *") return "Chaque jour à 12h00";
    if (cron === "0 8 * * 1-5") return "Du lundi au vendredi à 8h00";

    return "Expression cron personnalisée";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Clock className="h-8 w-8 text-primary" />
          Cron Expression Builder
        </h1>
        <p className="text-muted-foreground">
          Créez facilement des expressions cron pour planifier vos tâches
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Presets rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    className="justify-start text-left"
                    onClick={() => loadPreset(preset.value)}
                  >
                    <div className="text-xs">
                      <div className="font-semibold">{preset.label}</div>
                      <div className="text-muted-foreground font-mono">{preset.value}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration personnalisée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="minute">Minute (0-59)</Label>
                <div className="flex gap-2">
                  <Select value={minute} onValueChange={setMinute}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minuteOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="minute"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    placeholder="*"
                    className="w-20 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hour">Heure (0-23)</Label>
                <div className="flex gap-2">
                  <Select value={hour} onValueChange={setHour}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hourOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="hour"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    placeholder="*"
                    className="w-20 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dom">Jour du mois (1-31)</Label>
                <Input
                  id="dom"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  placeholder="*"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="month">Mois (1-12)</Label>
                <Input
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="*"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="dow">Jour de la semaine (0-6, 0=Dimanche)</Label>
                <Input
                  id="dow"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  placeholder="*"
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Expression Cron générée
                <Button size="sm" variant="outline" onClick={copyCronExpression}>
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <code className="text-2xl font-bold font-mono break-all">
                  {cronExpression}
                </code>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium">
                  {getHumanReadable(cronExpression)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">min</Badge>
                  <Badge variant="outline">heure</Badge>
                  <Badge variant="outline">jour</Badge>
                  <Badge variant="outline">mois</Badge>
                  <Badge variant="outline">jour sem.</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm font-mono">
                  <span className="w-16 text-center">{minute}</span>
                  <span className="w-16 text-center">{hour}</span>
                  <span className="w-16 text-center">{dayOfMonth}</span>
                  <span className="w-16 text-center">{month}</span>
                  <span className="w-16 text-center">{dayOfWeek}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prochaines exécutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {nextExecutions.map((exec, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{exec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Syntaxe Cron
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-mono">*</span>
                  <span className="text-muted-foreground">Toutes les valeurs</span>
                  
                  <span className="font-mono">5</span>
                  <span className="text-muted-foreground">Valeur spécifique</span>
                  
                  <span className="font-mono">1-5</span>
                  <span className="text-muted-foreground">Plage de valeurs</span>
                  
                  <span className="font-mono">*/5</span>
                  <span className="text-muted-foreground">Tous les 5</span>
                  
                  <span className="font-mono">1,3,5</span>
                  <span className="text-muted-foreground">Liste de valeurs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
