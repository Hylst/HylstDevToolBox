import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/Tooltip";
import { Calculator, Ruler, Thermometer, Clock, Binary, HardDrive, Gauge, Wind } from "lucide-react";

export default function Converters() {
  const [lengthValue, setLengthValue] = useState("1");
  const [lengthFrom, setLengthFrom] = useState("m");
  const [lengthTo, setLengthTo] = useState("ft");
  const [tempValue, setTempValue] = useState("0");
  const [tempFrom, setTempFrom] = useState("c");
  const [tempTo, setTempTo] = useState("f");
  const [timeValue, setTimeValue] = useState("1");
  const [timeFrom, setTimeFrom] = useState("h");
  const [timeTo, setTimeTo] = useState("min");
  const [numberValue, setNumberValue] = useState("10");
  const [numberFrom, setNumberFrom] = useState("10");
  const [numberTo, setNumberTo] = useState("2");
  const [dataValue, setDataValue] = useState("1");
  const [dataFrom, setDataFrom] = useState("GB");
  const [dataTo, setDataTo] = useState("MB");
  const [speedValue, setSpeedValue] = useState("100");
  const [speedFrom, setSpeedFrom] = useState("km/h");
  const [speedTo, setSpeedTo] = useState("mph");
  const [pressureValue, setPressureValue] = useState("1");
  const [pressureFrom, setPressureFrom] = useState("atm");
  const [pressureTo, setPressureTo] = useState("bar");

  const lengthUnits: Record<string, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34 };
  const timeUnits: Record<string, number> = { ms: 0.001, s: 1, min: 60, h: 3600, d: 86400, w: 604800 };
  const dataUnits: Record<string, number> = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4, PB: 1024 ** 5, bit: 0.125, Kbit: 128, Mbit: 131072 };
  const speedUnits: Record<string, number> = { "m/s": 1, "km/h": 1 / 3.6, "mph": 0.44704, "kn": 0.514444, "ft/s": 0.3048 };
  const pressureUnits: Record<string, number> = { Pa: 1, hPa: 100, kPa: 1000, bar: 100000, atm: 101325, psi: 6894.757, mmHg: 133.322, Torr: 133.322 };

  const convert = (val: string, from: Record<string, number>, fromKey: string, toKey: string) => {
    const base = parseFloat(val) * from[fromKey];
    return (base / from[toKey]).toFixed(6);
  };

  const convertTemperature = () => {
    const v = parseFloat(tempValue);
    let c: number;
    if (tempFrom === "c") c = v; else if (tempFrom === "f") c = (v - 32) * 5 / 9; else c = v - 273.15;
    if (tempTo === "c") return c.toFixed(2); if (tempTo === "f") return (c * 9 / 5 + 32).toFixed(2); return (c + 273.15).toFixed(2);
  };

  const convertNumberBase = () => { try { return parseInt(numberValue, parseInt(numberFrom)).toString(parseInt(numberTo)).toUpperCase(); } catch { return "Erreur"; } };

  const renderConverterCard = (
    title: string, description: string, icon: React.ReactNode,
    value: string, setValue: (v: string) => void,
    from: string, setFrom: (v: string) => void,
    to: string, setTo: (v: string) => void,
    units: { value: string; label: string }[],
    result: string,
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{icon}{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div><Label>Valeur</Label><Input type="number" value={value} onChange={(e) => setValue(e.target.value)} /></div>
          <div><Label>De</Label>
            <Select value={from} onValueChange={setFrom}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{units.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Vers</Label>
            <Select value={to} onValueChange={setTo}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{units.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Résultat</p>
          <p className="text-2xl font-bold text-primary">{result}</p>
        </div>
      </CardContent>
    </Card>
  );

  const lengthUnitsList = [
    { value: "mm", label: "Millimètre (mm)" }, { value: "cm", label: "Centimètre (cm)" },
    { value: "m", label: "Mètre (m)" }, { value: "km", label: "Kilomètre (km)" },
    { value: "in", label: "Pouce (in)" }, { value: "ft", label: "Pied (ft)" },
    { value: "yd", label: "Yard (yd)" }, { value: "mi", label: "Mile (mi)" },
  ];
  const tempUnitsList = [{ value: "c", label: "Celsius (°C)" }, { value: "f", label: "Fahrenheit (°F)" }, { value: "k", label: "Kelvin (K)" }];
  const timeUnitsList = [
    { value: "ms", label: "Milliseconde" }, { value: "s", label: "Seconde" },
    { value: "min", label: "Minute" }, { value: "h", label: "Heure" },
    { value: "d", label: "Jour" }, { value: "w", label: "Semaine" },
  ];
  const numberUnitsList = [
    { value: "2", label: "Binaire (2)" }, { value: "8", label: "Octal (8)" },
    { value: "10", label: "Décimal (10)" }, { value: "16", label: "Hex (16)" },
  ];
  const dataUnitsList = [
    { value: "bit", label: "Bit" }, { value: "B", label: "Octet (B)" },
    { value: "KB", label: "Ko (KB)" }, { value: "MB", label: "Mo (MB)" },
    { value: "GB", label: "Go (GB)" }, { value: "TB", label: "To (TB)" },
    { value: "PB", label: "Po (PB)" }, { value: "Kbit", label: "Kbit" }, { value: "Mbit", label: "Mbit" },
  ];
  const speedUnitsList = [
    { value: "m/s", label: "m/s" }, { value: "km/h", label: "km/h" },
    { value: "mph", label: "mph" }, { value: "kn", label: "Nœuds (kn)" }, { value: "ft/s", label: "ft/s" },
  ];
  const pressureUnitsList = [
    { value: "Pa", label: "Pascal (Pa)" }, { value: "hPa", label: "Hectopascal" },
    { value: "kPa", label: "Kilopascal" }, { value: "bar", label: "Bar" },
    { value: "atm", label: "Atmosphère" }, { value: "psi", label: "PSI" },
    { value: "mmHg", label: "mmHg" }, { value: "Torr", label: "Torr" },
  ];

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Calculator className="h-8 w-8 text-primary" /> Convertisseurs
        </h1>
        <p className="text-muted-foreground">Convertissez entre différentes unités : longueur, température, temps, données, vitesse, pression</p>
      </div>

      <Tabs defaultValue="length" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="length"><Ruler className="h-4 w-4 mr-1 hidden sm:inline" />Long.</TabsTrigger>
          <TabsTrigger value="temperature"><Thermometer className="h-4 w-4 mr-1 hidden sm:inline" />Temp.</TabsTrigger>
          <TabsTrigger value="time"><Clock className="h-4 w-4 mr-1 hidden sm:inline" />Temps</TabsTrigger>
          <TabsTrigger value="number"><Binary className="h-4 w-4 mr-1 hidden sm:inline" />Bases</TabsTrigger>
          <TabsTrigger value="data"><HardDrive className="h-4 w-4 mr-1 hidden sm:inline" />Data</TabsTrigger>
          <TabsTrigger value="speed"><Gauge className="h-4 w-4 mr-1 hidden sm:inline" />Vitesse</TabsTrigger>
          <TabsTrigger value="pressure"><Wind className="h-4 w-4 mr-1 hidden sm:inline" />Pression</TabsTrigger>
        </TabsList>

        <TabsContent value="length">
          {renderConverterCard("Longueur", "Mètres, pieds, miles...", <Ruler className="h-5 w-5" />, lengthValue, setLengthValue, lengthFrom, setLengthFrom, lengthTo, setLengthTo, lengthUnitsList, convert(lengthValue, lengthUnits, lengthFrom, lengthTo))}
        </TabsContent>
        <TabsContent value="temperature">
          {renderConverterCard("Température", "Celsius, Fahrenheit, Kelvin", <Thermometer className="h-5 w-5" />, tempValue, setTempValue, tempFrom, setTempFrom, tempTo, setTempTo, tempUnitsList, convertTemperature())}
        </TabsContent>
        <TabsContent value="time">
          {renderConverterCard("Temps", "Secondes, minutes, heures...", <Clock className="h-5 w-5" />, timeValue, setTimeValue, timeFrom, setTimeFrom, timeTo, setTimeTo, timeUnitsList, convert(timeValue, timeUnits, timeFrom, timeTo))}
        </TabsContent>
        <TabsContent value="number">
          {renderConverterCard("Bases numériques", "Binaire, décimal, hexadécimal", <Binary className="h-5 w-5" />, numberValue, setNumberValue, numberFrom, setNumberFrom, numberTo, setNumberTo, numberUnitsList, convertNumberBase())}
        </TabsContent>
        <TabsContent value="data">
          {renderConverterCard("Données", "Octets, Ko, Mo, Go, To...", <HardDrive className="h-5 w-5" />, dataValue, setDataValue, dataFrom, setDataFrom, dataTo, setDataTo, dataUnitsList, convert(dataValue, dataUnits, dataFrom, dataTo))}
        </TabsContent>
        <TabsContent value="speed">
          {renderConverterCard("Vitesse", "km/h, mph, m/s, nœuds...", <Gauge className="h-5 w-5" />, speedValue, setSpeedValue, speedFrom, setSpeedFrom, speedTo, setSpeedTo, speedUnitsList, convert(speedValue, speedUnits, speedFrom, speedTo))}
        </TabsContent>
        <TabsContent value="pressure">
          {renderConverterCard("Pression", "Pascal, bar, atm, psi...", <Wind className="h-5 w-5" />, pressureValue, setPressureValue, pressureFrom, setPressureFrom, pressureTo, setPressureTo, pressureUnitsList, convert(pressureValue, pressureUnits, pressureFrom, pressureTo))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
