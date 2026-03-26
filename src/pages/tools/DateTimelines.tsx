import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download } from "lucide-react";
import { addDays, addHours, addMinutes, eachDayOfInterval, format } from "date-fns";
import { toast } from "sonner";

export default function DateTimelines() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interval, setInterval] = useState<"daily" | "hourly" | "5min">("daily");
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "sql">("json");

  const generateTimeline = () => {
    if (!startDate || !endDate) {
      toast.error("Veuillez sélectionner une date de début et de fin");
      return [];
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeline: Date[] = [];

    if (interval === "daily") {
      const days = eachDayOfInterval({ start, end });
      return days;
    } else if (interval === "hourly") {
      let current = start;
      while (current <= end) {
        timeline.push(new Date(current));
        current = addHours(current, 1);
      }
    } else if (interval === "5min") {
      let current = start;
      while (current <= end) {
        timeline.push(new Date(current));
        current = addMinutes(current, 5);
      }
    }

    return timeline;
  };

  const timeline = generateTimeline();

  const exportTimeline = () => {
    const data = timeline.map(date => ({
      timestamp: date.getTime(),
      iso: date.toISOString(),
      formatted: format(date, "yyyy-MM-dd HH:mm:ss")
    }));

    let output = "";

    if (exportFormat === "json") {
      output = JSON.stringify(data, null, 2);
    } else if (exportFormat === "csv") {
      output = "timestamp,iso,formatted\n" + 
        data.map(d => `${d.timestamp},${d.iso},${d.formatted}`).join("\n");
    } else if (exportFormat === "sql") {
      output = data.map(d => 
        `INSERT INTO events (timestamp, created_at) VALUES (${d.timestamp}, '${d.formatted}');`
      ).join("\n");
    }

    navigator.clipboard.writeText(output);
    toast.success("Timeline exportée dans le presse-papier");
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Générateur de Flux Temporels
        </h1>
        <p className="text-muted-foreground">
          Générez des séquences de dates pour vos tests et time-series
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuration de la timeline</CardTitle>
          <CardDescription>
            Définissez la période et l'intervalle de génération
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Date de début</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Date de fin</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="interval">Intervalle</Label>
            <Select value={interval} onValueChange={(v: any) => setInterval(v)}>
              <SelectTrigger id="interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5min">Toutes les 5 minutes</SelectItem>
                <SelectItem value="hourly">Toutes les heures</SelectItem>
                <SelectItem value="daily">Chaque jour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="exportFormat">Format d'export</Label>
            <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
              <SelectTrigger id="exportFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Timeline générée ({timeline.length} entrées)</span>
            <Button onClick={exportTimeline} disabled={timeline.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-1">
            {timeline.slice(0, 100).map((date, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm font-mono bg-muted p-2 rounded">
                <Badge variant="outline">{idx + 1}</Badge>
                <span>{format(date, "yyyy-MM-dd HH:mm:ss")}</span>
                <span className="text-muted-foreground">({date.getTime()})</span>
              </div>
            ))}
            {timeline.length > 100 && (
              <div className="text-center text-muted-foreground text-sm p-2">
                ... et {timeline.length - 100} autres entrées
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
