import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Upload, Download, Plus, Trash2, Edit, RefreshCw, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { CalendarEvent, generateICS, parseICS, downloadICS, generateRRule } from "@/lib/ics-utils";
import { countriesHolidays, getHolidaysForYear } from "@/lib/holidays";
import { toast } from "sonner";

export default function DateCalendars() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("FR");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    allDay: false,
    recurring: false,
    recurrenceFreq: "WEEKLY" as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
    recurrenceInterval: 1,
    recurrenceCount: 10,
    recurrenceByDay: [] as string[]
  });

  const holidays = getHolidaysForYear(selectedYear, selectedCountry);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedEvents = parseICS(content);
        setEvents(prev => [...prev, ...importedEvents]);
        toast.success(`${importedEvents.length} événement(s) importé(s)`);
      } catch (error) {
        toast.error("Erreur lors de l'import du fichier ICS");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExport = () => {
    if (events.length === 0) {
      toast.error("Aucun événement à exporter");
      return;
    }
    downloadICS(events, `calendar-${new Date().toISOString().split('T')[0]}.ics`);
    toast.success("Calendrier exporté avec succès");
  };

  const handleExportHolidays = () => {
    const holidayEvents: CalendarEvent[] = holidays.map(h => ({
      id: `holiday-${h.date.toISOString()}`,
      title: h.name,
      start: h.date,
      end: new Date(h.date.getTime() + 24 * 60 * 60 * 1000),
      allDay: true,
      description: `Jour férié - ${countriesHolidays.find(c => c.code === selectedCountry)?.name}`
    }));
    downloadICS(holidayEvents, `jours-feries-${selectedCountry}-${selectedYear}.ics`);
    toast.success("Jours fériés exportés");
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.startDate) {
      toast.error("Titre et date de début requis");
      return;
    }

    const start = new Date(`${newEvent.startDate}T${newEvent.allDay ? '00:00' : newEvent.startTime}`);
    const end = new Date(`${newEvent.endDate || newEvent.startDate}T${newEvent.allDay ? '23:59' : newEvent.endTime}`);

    let rrule: string | undefined;
    if (newEvent.recurring) {
      rrule = generateRRule({
        freq: newEvent.recurrenceFreq,
        interval: newEvent.recurrenceInterval,
        count: newEvent.recurrenceCount,
        byDay: newEvent.recurrenceByDay.length > 0 ? newEvent.recurrenceByDay : undefined
      });
    }

    const event: CalendarEvent = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description || undefined,
      location: newEvent.location || undefined,
      start,
      end,
      allDay: newEvent.allDay,
      rrule
    };

    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? event : e));
      toast.success("Événement modifié");
    } else {
      setEvents(prev => [...prev, event]);
      toast.success("Événement ajouté");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    toast.success("Événement supprimé");
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      startDate: event.start.toISOString().split('T')[0],
      startTime: event.start.toTimeString().slice(0, 5),
      endDate: event.end.toISOString().split('T')[0],
      endTime: event.end.toTimeString().slice(0, 5),
      allDay: event.allDay || false,
      recurring: !!event.rrule,
      recurrenceFreq: "WEEKLY",
      recurrenceInterval: 1,
      recurrenceCount: 10,
      recurrenceByDay: []
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setNewEvent({
      title: "",
      description: "",
      location: "",
      startDate: "",
      startTime: "09:00",
      endDate: "",
      endTime: "10:00",
      allDay: false,
      recurring: false,
      recurrenceFreq: "WEEKLY",
      recurrenceInterval: 1,
      recurrenceCount: 10,
      recurrenceByDay: []
    });
  };

  const copyGoogleCalendarUrl = () => {
    const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    if (events.length > 0) {
      const event = events[0];
      const url = `${baseUrl}&text=${encodeURIComponent(event.title)}&dates=${event.start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${event.end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
      navigator.clipboard.writeText(url);
      toast.success("URL Google Calendar copiée");
    }
  };

  const daysOfWeek = [
    { value: "MO", label: "Lun" },
    { value: "TU", label: "Mar" },
    { value: "WE", label: "Mer" },
    { value: "TH", label: "Jeu" },
    { value: "FR", label: "Ven" },
    { value: "SA", label: "Sam" },
    { value: "SU", label: "Dim" },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Gestionnaire de Calendriers & Jours Fériés
        </h1>
        <p className="text-muted-foreground">
          Import/Export ICS, événements récurrents et calendriers par pays
        </p>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Mes Événements</TabsTrigger>
          <TabsTrigger value="holidays">Jours Fériés</TabsTrigger>
          <TabsTrigger value="sync">Synchronisation</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestion des événements</CardTitle>
                    <CardDescription>Créez, importez et exportez vos événements</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept=".ics"
                      onChange={handleFileImport}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Importer ICS
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter ICS
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Nouvel événement
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>{editingEvent ? "Modifier" : "Créer"} un événement</DialogTitle>
                          <DialogDescription>
                            Remplissez les informations de l'événement
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="title">Titre *</Label>
                            <Input
                              id="title"
                              value={newEvent.title}
                              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                              placeholder="Réunion d'équipe"
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={newEvent.description}
                              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                              placeholder="Détails de l'événement..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Lieu</Label>
                            <Input
                              id="location"
                              value={newEvent.location}
                              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                              placeholder="Salle de réunion A"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="allDay"
                              checked={newEvent.allDay}
                              onCheckedChange={(checked) => setNewEvent({ ...newEvent, allDay: checked as boolean })}
                            />
                            <Label htmlFor="allDay">Journée entière</Label>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="startDate">Date de début *</Label>
                              <Input
                                id="startDate"
                                type="date"
                                value={newEvent.startDate}
                                onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value, endDate: newEvent.endDate || e.target.value })}
                              />
                            </div>
                            {!newEvent.allDay && (
                              <div>
                                <Label htmlFor="startTime">Heure de début</Label>
                                <Input
                                  id="startTime"
                                  type="time"
                                  value={newEvent.startTime}
                                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                />
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="endDate">Date de fin</Label>
                              <Input
                                id="endDate"
                                type="date"
                                value={newEvent.endDate}
                                onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                              />
                            </div>
                            {!newEvent.allDay && (
                              <div>
                                <Label htmlFor="endTime">Heure de fin</Label>
                                <Input
                                  id="endTime"
                                  type="time"
                                  value={newEvent.endTime}
                                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="border-t pt-4">
                            <div className="flex items-center space-x-2 mb-4">
                              <Checkbox
                                id="recurring"
                                checked={newEvent.recurring}
                                onCheckedChange={(checked) => setNewEvent({ ...newEvent, recurring: checked as boolean })}
                              />
                              <Label htmlFor="recurring">Événement récurrent</Label>
                            </div>
                            
                            {newEvent.recurring && (
                              <div className="space-y-4 pl-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Fréquence</Label>
                                    <Select
                                      value={newEvent.recurrenceFreq}
                                      onValueChange={(v: any) => setNewEvent({ ...newEvent, recurrenceFreq: v })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="DAILY">Quotidien</SelectItem>
                                        <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                                        <SelectItem value="MONTHLY">Mensuel</SelectItem>
                                        <SelectItem value="YEARLY">Annuel</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Intervalle</Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      value={newEvent.recurrenceInterval}
                                      onChange={(e) => setNewEvent({ ...newEvent, recurrenceInterval: parseInt(e.target.value) || 1 })}
                                    />
                                  </div>
                                </div>
                                
                                {newEvent.recurrenceFreq === "WEEKLY" && (
                                  <div>
                                    <Label>Jours de la semaine</Label>
                                    <div className="flex gap-2 mt-2">
                                      {daysOfWeek.map(day => (
                                        <Button
                                          key={day.value}
                                          variant={newEvent.recurrenceByDay.includes(day.value) ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => {
                                            const byDay = newEvent.recurrenceByDay.includes(day.value)
                                              ? newEvent.recurrenceByDay.filter(d => d !== day.value)
                                              : [...newEvent.recurrenceByDay, day.value];
                                            setNewEvent({ ...newEvent, recurrenceByDay: byDay });
                                          }}
                                        >
                                          {day.label}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <Label>Nombre de répétitions</Label>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={newEvent.recurrenceCount}
                                    onChange={(e) => setNewEvent({ ...newEvent, recurrenceCount: parseInt(e.target.value) || 10 })}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                            Annuler
                          </Button>
                          <Button onClick={handleAddEvent}>
                            {editingEvent ? "Modifier" : "Créer"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Aucun événement. Créez-en un ou importez un fichier ICS.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {events.map(event => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {event.title}
                            {event.rrule && <Badge variant="secondary">Récurrent</Badge>}
                            {event.allDay && <Badge variant="outline">Journée</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {event.start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            {!event.allDay && ` à ${event.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                          </div>
                          {event.location && (
                            <div className="text-sm text-muted-foreground">📍 {event.location}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditEvent(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="holidays">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Jours fériés par pays</CardTitle>
                  <CardDescription>Consultez et exportez les jours fériés officiels</CardDescription>
                </div>
                <Button variant="outline" onClick={handleExportHolidays}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter en ICS
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pays</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countriesHolidays.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Année</Label>
                  <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027, 2028].map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {holidays.map((holiday, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="font-medium">{holiday.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {holiday.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Synchronisation
              </CardTitle>
              <CardDescription>
                Intégrez vos calendriers avec d'autres services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Google Calendar</h3>
                <Alert>
                  <AlertDescription>
                    Pour synchroniser avec Google Calendar, vous pouvez :
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Exporter vos événements en ICS et les importer dans Google Calendar</li>
                      <li>Utiliser l'URL de création d'événement Google Calendar</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                {events.length > 0 && (
                  <Button variant="outline" onClick={copyGoogleCalendarUrl}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier l'URL Google Calendar (premier événement)
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir Google Calendar
                  </a>
                </Button>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold">Format RRULE (RFC 5545)</h3>
                <Alert>
                  <AlertDescription>
                    <p className="mb-2">Exemples de règles de récurrence :</p>
                    <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`FREQ=WEEKLY;BYDAY=MO,WE,FR  // Tous les lun, mer, ven
FREQ=MONTHLY;BYMONTHDAY=15  // Le 15 de chaque mois
FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1  // Chaque 1er janvier
FREQ=DAILY;INTERVAL=2;COUNT=10  // Tous les 2 jours, 10 fois`}
                    </pre>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
