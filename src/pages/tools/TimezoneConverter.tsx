import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Globe, Plus, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const timezones = [
  { id: "UTC", label: "UTC", offset: 0, city: "Coordinated Universal Time" },
  { id: "Europe/Paris", label: "CET/CEST", offset: 1, city: "Paris, Berlin, Rome" },
  { id: "Europe/London", label: "GMT/BST", offset: 0, city: "London, Dublin, Lisbon" },
  { id: "America/New_York", label: "EST/EDT", offset: -5, city: "New York, Toronto" },
  { id: "America/Los_Angeles", label: "PST/PDT", offset: -8, city: "Los Angeles, Vancouver" },
  { id: "America/Chicago", label: "CST/CDT", offset: -6, city: "Chicago, Mexico City" },
  { id: "America/Denver", label: "MST/MDT", offset: -7, city: "Denver, Phoenix" },
  { id: "America/Sao_Paulo", label: "BRT", offset: -3, city: "São Paulo, Buenos Aires" },
  { id: "Asia/Tokyo", label: "JST", offset: 9, city: "Tokyo, Seoul" },
  { id: "Asia/Shanghai", label: "CST", offset: 8, city: "Beijing, Shanghai, Hong Kong" },
  { id: "Asia/Singapore", label: "SGT", offset: 8, city: "Singapore, Kuala Lumpur" },
  { id: "Asia/Dubai", label: "GST", offset: 4, city: "Dubai, Abu Dhabi" },
  { id: "Asia/Kolkata", label: "IST", offset: 5.5, city: "Mumbai, New Delhi" },
  { id: "Australia/Sydney", label: "AEST/AEDT", offset: 10, city: "Sydney, Melbourne" },
  { id: "Pacific/Auckland", label: "NZST/NZDT", offset: 12, city: "Auckland, Wellington" },
  { id: "Africa/Cairo", label: "EET", offset: 2, city: "Cairo, Johannesburg" },
];

function getTimeInTimezone(date: Date, timezoneId: string): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const tz = timezones.find((t) => t.id === timezoneId);
  if (!tz) return date;
  return new Date(utc + tz.offset * 3600000);
}

export default function TimezoneConverter() {
  const [sourceDate, setSourceDate] = useState(() => {
    const now = new Date();
    return format(now, "yyyy-MM-dd");
  });
  const [sourceTime, setSourceTime] = useState(() => {
    const now = new Date();
    return format(now, "HH:mm");
  });
  const [sourceTimezone, setSourceTimezone] = useState("Europe/Paris");
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>([
    "America/New_York",
    "America/Los_Angeles",
    "Asia/Tokyo",
    "Australia/Sydney",
  ]);

  const sourceDateTime = useMemo(() => {
    const [year, month, day] = sourceDate.split("-").map(Number);
    const [hours, minutes] = sourceTime.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }, [sourceDate, sourceTime]);

  const convertedTimes = useMemo(() => {
    const sourceTz = timezones.find((t) => t.id === sourceTimezone);
    if (!sourceTz) return [];

    return selectedTimezones.map((tzId) => {
      const targetTz = timezones.find((t) => t.id === tzId);
      if (!targetTz) return null;

      const offsetDiff = targetTz.offset - sourceTz.offset;
      const convertedDate = new Date(sourceDateTime.getTime() + offsetDiff * 3600000);

      return {
        timezone: targetTz,
        date: convertedDate,
        offsetDiff,
      };
    }).filter(Boolean);
  }, [sourceDateTime, sourceTimezone, selectedTimezones]);

  const addTimezone = (tzId: string) => {
    if (!selectedTimezones.includes(tzId)) {
      setSelectedTimezones([...selectedTimezones, tzId]);
    }
  };

  const removeTimezone = (tzId: string) => {
    setSelectedTimezones(selectedTimezones.filter((t) => t !== tzId));
  };

  const setToNow = () => {
    const now = new Date();
    setSourceDate(format(now, "yyyy-MM-dd"));
    setSourceTime(format(now, "HH:mm"));
    toast.success("Heure actuelle définie");
  };

  const availableTimezones = timezones.filter(
    (tz) => !selectedTimezones.includes(tz.id) && tz.id !== sourceTimezone
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Timezone Converter</h1>
          <p className="text-muted-foreground">Convertissez les heures entre fuseaux horaires</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Heure source
              <Button variant="outline" size="sm" onClick={setToNow}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Maintenant
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={sourceDate}
                  onChange={(e) => setSourceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Heure</Label>
                <Input
                  type="time"
                  value={sourceTime}
                  onChange={(e) => setSourceTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fuseau horaire</Label>
              <Select value={sourceTimezone} onValueChange={setSourceTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.id} value={tz.id}>
                      {tz.label} - {tz.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-4xl font-bold">
                {format(sourceDateTime, "HH:mm")}
              </p>
              <p className="text-muted-foreground">
                {format(sourceDateTime, "EEEE d MMMM yyyy")}
              </p>
              <Badge variant="secondary" className="mt-2">
                {timezones.find((t) => t.id === sourceTimezone)?.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Add timezone */}
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un fuseau</CardTitle>
          </CardHeader>
          <CardContent>
            {availableTimezones.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableTimezones.map((tz) => (
                  <Button
                    key={tz.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addTimezone(tz.id)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {tz.label}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Tous les fuseaux ont été ajoutés
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Converted times */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {convertedTimes.map((item) => {
          if (!item) return null;
          const { timezone, date, offsetDiff } = item;

          // Check if it's a different day
          const isDifferentDay = date.getDate() !== sourceDateTime.getDate();
          const dayDiff = Math.round((date.getTime() - sourceDateTime.getTime()) / (24 * 3600000));

          return (
            <Card key={timezone.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeTimezone(timezone.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {timezone.label}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{timezone.city}</p>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{format(date, "HH:mm")}</p>
                <p className="text-sm text-muted-foreground">
                  {format(date, "d MMM yyyy")}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={offsetDiff >= 0 ? "default" : "secondary"}>
                    {offsetDiff >= 0 ? "+" : ""}{offsetDiff}h
                  </Badge>
                  {isDifferentDay && (
                    <Badge variant="outline">
                      {dayDiff > 0 ? `+${dayDiff}j` : `${dayDiff}j`}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTimezones.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Ajoutez des fuseaux horaires pour voir les conversions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
