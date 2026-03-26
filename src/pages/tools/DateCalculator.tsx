import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { differenceInYears, differenceInMonths, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, add, sub, formatDistanceToNow, formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Plus, Minus, Globe, Briefcase, Clock, CalendarDays, AlertTriangle, CheckCircle } from "lucide-react";
import { countriesHolidays, getHolidaysForYear, countBusinessDays, addBusinessDays, isHoliday, isWeekend } from "@/lib/holidays";

export default function DateCalculator() {
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [baseDate, setBaseDate] = useState("");
  const [addValue, setAddValue] = useState("1");
  const [addUnit, setAddUnit] = useState<"days" | "weeks" | "months" | "years">("days");
  const [timezone1, setTimezone1] = useState("Europe/Paris");
  const [timezone2, setTimezone2] = useState("America/New_York");
  
  // Business days state
  const [businessDate1, setBusinessDate1] = useState("");
  const [businessDate2, setBusinessDate2] = useState("");
  const [businessCountry, setBusinessCountry] = useState("FR");
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [excludeHolidays, setExcludeHolidays] = useState(true);
  const [businessAddDays, setBusinessAddDays] = useState("10");
  const [businessBaseDate, setBusinessBaseDate] = useState("");
  
  // Countdown state
  const [countdownTarget, setCountdownTarget] = useState("");
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  // Update countdown every second
  useEffect(() => {
    if (!countdownTarget) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const target = new Date(countdownTarget);
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [countdownTarget]);

  const calculateDifference = () => {
    if (!date1 || !date2) return null;
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return {
      years: differenceInYears(d2, d1),
      months: differenceInMonths(d2, d1),
      days: differenceInDays(d2, d1),
      hours: differenceInHours(d2, d1),
      minutes: differenceInMinutes(d2, d1),
      seconds: differenceInSeconds(d2, d1),
      humanReadable: formatDistance(d1, d2, { locale: fr }),
      fromNow: formatDistanceToNow(d1, { locale: fr, addSuffix: true })
    };
  };

  const calculateAddition = () => {
    if (!baseDate || !addValue) return null;
    const base = new Date(baseDate);
    const value = parseInt(addValue);
    const result = add(base, { [addUnit]: value });
    return result.toISOString();
  };

  const calculateSubtraction = () => {
    if (!baseDate || !addValue) return null;
    const base = new Date(baseDate);
    const value = parseInt(addValue);
    const result = sub(base, { [addUnit]: value });
    return result.toISOString();
  };

  const getTimezoneTime = (tz: string) => {
    return new Date().toLocaleString('fr-FR', { timeZone: tz, dateStyle: 'full', timeStyle: 'long' });
  };

  const calculateBusinessDays = () => {
    if (!businessDate1 || !businessDate2) return null;
    const d1 = new Date(businessDate1);
    const d2 = new Date(businessDate2);
    
    const totalDays = differenceInDays(d2, d1);
    const businessDays = countBusinessDays(d1, d2, businessCountry, excludeWeekends, excludeHolidays);
    const holidays = getHolidaysForYear(d1.getFullYear(), businessCountry)
      .filter(h => h.date >= d1 && h.date <= d2);
    
    return { totalDays, businessDays, holidays };
  };

  const calculateBusinessDateAddition = () => {
    if (!businessBaseDate || !businessAddDays) return null;
    const base = new Date(businessBaseDate);
    const days = parseInt(businessAddDays);
    return addBusinessDays(base, days, businessCountry);
  };

  const diff = calculateDifference();
  const addition = calculateAddition();
  const subtraction = calculateSubtraction();
  const businessResult = calculateBusinessDays();
  const businessAddResult = calculateBusinessDateAddition();

  const currentYearHolidays = getHolidaysForYear(new Date().getFullYear(), businessCountry);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Calculateur Universel de Dates
        </h1>
        <p className="text-muted-foreground">
          Calculs de différences, additions, fuseaux horaires et jours ouvrés
        </p>
      </div>

      <Tabs defaultValue="difference" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="difference">Différences</TabsTrigger>
          <TabsTrigger value="arithmetic">Addition/Soustraction</TabsTrigger>
          <TabsTrigger value="timezones">Fuseaux Horaires</TabsTrigger>
          <TabsTrigger value="business">Jours Ouvrés</TabsTrigger>
          <TabsTrigger value="countdown">Compte à Rebours</TabsTrigger>
        </TabsList>

        <TabsContent value="difference">
          <Card>
            <CardHeader>
              <CardTitle>Calculer la différence entre deux dates</CardTitle>
              <CardDescription>
                Obtenez la durée précise et une version "humaine" de la différence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date1">Date de début</Label>
                  <Input
                    id="date1"
                    type="datetime-local"
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="date2">Date de fin</Label>
                  <Input
                    id="date2"
                    type="datetime-local"
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                  />
                </div>
              </div>

              {diff && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold text-lg">{diff.humanReadable}</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div><strong>Années:</strong> {diff.years}</div>
                        <div><strong>Mois:</strong> {diff.months}</div>
                        <div><strong>Jours:</strong> {diff.days}</div>
                        <div><strong>Heures:</strong> {diff.hours}</div>
                        <div><strong>Minutes:</strong> {diff.minutes}</div>
                        <div><strong>Secondes:</strong> {diff.seconds}</div>
                      </div>
                      <p className="text-muted-foreground italic">{diff.fromNow}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arithmetic">
          <Card>
            <CardHeader>
              <CardTitle>Addition et Soustraction de dates</CardTitle>
              <CardDescription>
                Ajoutez ou soustrayez des jours, semaines, mois ou années
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="baseDate">Date de base</Label>
                <Input
                  id="baseDate"
                  type="datetime-local"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addValue">Valeur</Label>
                  <Input
                    id="addValue"
                    type="number"
                    value={addValue}
                    onChange={(e) => setAddValue(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="addUnit">Unité</Label>
                  <Select value={addUnit} onValueChange={(v: any) => setAddUnit(v)}>
                    <SelectTrigger id="addUnit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Jours</SelectItem>
                      <SelectItem value="weeks">Semaines</SelectItem>
                      <SelectItem value="months">Mois</SelectItem>
                      <SelectItem value="years">Années</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Alert>
                  <Plus className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Addition:</strong><br />
                    {addition ? new Date(addition).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }) : '-'}
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Minus className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Soustraction:</strong><br />
                    {subtraction ? new Date(subtraction).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }) : '-'}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timezones">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Conversion de fuseaux horaires
              </CardTitle>
              <CardDescription>
                Comparez les heures entre différents pays et gérez le DST
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tz1">Fuseau 1</Label>
                  <Select value={timezone1} onValueChange={setTimezone1}>
                    <SelectTrigger id="tz1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris (CET/CEST)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST/EDT)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                      <SelectItem value="Asia/Shanghai">Asia/Shanghai (CST)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                      <SelectItem value="America/Sao_Paulo">America/Sao_Paulo (BRT)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Alert className="mt-2">
                    <AlertDescription className="text-sm">
                      {getTimezoneTime(timezone1)}
                    </AlertDescription>
                  </Alert>
                </div>
                <div>
                  <Label htmlFor="tz2">Fuseau 2</Label>
                  <Select value={timezone2} onValueChange={setTimezone2}>
                    <SelectTrigger id="tz2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris (CET/CEST)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST/EDT)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                      <SelectItem value="Asia/Shanghai">Asia/Shanghai (CST)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                      <SelectItem value="America/Sao_Paulo">America/Sao_Paulo (BRT)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Alert className="mt-2">
                    <AlertDescription className="text-sm">
                      {getTimezoneTime(timezone2)}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Calcul des jours ouvrés
                </CardTitle>
                <CardDescription>
                  Calculez la durée en jours ouvrés avec gestion des weekends et jours fériés
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="businessCountry">Pays (jours fériés)</Label>
                    <Select value={businessCountry} onValueChange={setBusinessCountry}>
                      <SelectTrigger id="businessCountry">
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
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id="excludeWeekends" 
                      checked={excludeWeekends}
                      onCheckedChange={(checked) => setExcludeWeekends(checked as boolean)}
                    />
                    <Label htmlFor="excludeWeekends">Exclure weekends</Label>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id="excludeHolidays" 
                      checked={excludeHolidays}
                      onCheckedChange={(checked) => setExcludeHolidays(checked as boolean)}
                    />
                    <Label htmlFor="excludeHolidays">Exclure jours fériés</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessDate1">Date de début</Label>
                    <Input
                      id="businessDate1"
                      type="date"
                      value={businessDate1}
                      onChange={(e) => setBusinessDate1(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessDate2">Date de fin</Label>
                    <Input
                      id="businessDate2"
                      type="date"
                      value={businessDate2}
                      onChange={(e) => setBusinessDate2(e.target.value)}
                    />
                  </div>
                </div>

                {businessResult && (
                  <Alert>
                    <CalendarDays className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <strong>Jours calendaires:</strong> {businessResult.totalDays}
                          </div>
                          <div>
                            <strong>Jours ouvrés:</strong> <span className="text-primary font-bold">{businessResult.businessDays}</span>
                          </div>
                        </div>
                        {businessResult.holidays.length > 0 && (
                          <div>
                            <strong>Jours fériés dans la période:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {businessResult.holidays.map((h, i) => (
                                <Badge key={i} variant="secondary">
                                  {h.date.toLocaleDateString('fr-FR')} - {h.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Ajouter des jours ouvrés</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessBaseDate">Date de départ</Label>
                      <Input
                        id="businessBaseDate"
                        type="date"
                        value={businessBaseDate}
                        onChange={(e) => setBusinessBaseDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessAddDays">Jours ouvrés à ajouter</Label>
                      <Input
                        id="businessAddDays"
                        type="number"
                        value={businessAddDays}
                        onChange={(e) => setBusinessAddDays(e.target.value)}
                      />
                    </div>
                  </div>
                  {businessAddResult && (
                    <Alert className="mt-3">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Date résultante:</strong>{" "}
                        {businessAddResult.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jours fériés {new Date().getFullYear()} - {countriesHolidays.find(c => c.code === businessCountry)?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {currentYearHolidays.map((holiday, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div className="font-medium">{holiday.name}</div>
                        <div className="text-muted-foreground">
                          {holiday.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="countdown">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Compte à rebours dynamique
              </CardTitle>
              <CardDescription>
                Créez un countdown temps réel vers une date cible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="countdownTarget">Date cible</Label>
                <Input
                  id="countdownTarget"
                  type="datetime-local"
                  value={countdownTarget}
                  onChange={(e) => setCountdownTarget(e.target.value)}
                />
              </div>

              {countdown && (
                <div className="grid grid-cols-4 gap-4">
                  <Card className="text-center p-4">
                    <div className="text-4xl font-bold text-primary">{countdown.days}</div>
                    <div className="text-sm text-muted-foreground">Jours</div>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="text-4xl font-bold text-primary">{countdown.hours}</div>
                    <div className="text-sm text-muted-foreground">Heures</div>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="text-4xl font-bold text-primary">{countdown.minutes}</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="text-4xl font-bold text-primary">{countdown.seconds}</div>
                    <div className="text-sm text-muted-foreground">Secondes</div>
                  </Card>
                </div>
              )}

              {countdownTarget && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Code pour intégration web</h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Compte à rebours vers ${countdownTarget}
const targetDate = new Date("${countdownTarget}");
const countdown = setInterval(() => {
  const now = new Date();
  const diff = targetDate - now;
  
  if (diff <= 0) {
    clearInterval(countdown);
    return;
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  console.log(\`\${days}j \${hours}h \${minutes}m \${seconds}s\`);
}, 1000);`}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
