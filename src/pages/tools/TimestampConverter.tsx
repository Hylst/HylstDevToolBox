import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function TimestampConverter() {
  const [input, setInput] = useState(Date.now().toString());
  
  const parsed = useMemo(() => {
    const num = parseInt(input);
    if (isNaN(num)) return null;
    const date = num < 10000000000 ? new Date(num * 1000) : new Date(num);
    if (isNaN(date.getTime())) return null;
    return date;
  }, [input]);

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copié !"); };
  const setNow = () => setInput(Date.now().toString());

  const formats = parsed ? [
    { label: "Unix (s)", value: Math.floor(parsed.getTime() / 1000).toString() },
    { label: "Unix (ms)", value: parsed.getTime().toString() },
    { label: "ISO 8601", value: parsed.toISOString() },
    { label: "RFC 2822", value: parsed.toUTCString() },
    { label: "Locale FR", value: format(parsed, "dd MMMM yyyy 'à' HH:mm:ss", { locale: fr }) },
    { label: "Relatif", value: formatDistanceToNow(parsed, { addSuffix: true, locale: fr }) },
  ] : [];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2"><Clock className="h-8 w-8 text-primary" />Timestamp Converter</h1>
      <Card className="mb-6"><CardContent className="pt-6">
        <div className="flex gap-4">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Timestamp Unix ou ISO..." className="font-mono flex-1" />
          <Button onClick={setNow}><RefreshCw className="h-4 w-4 mr-2" />Maintenant</Button>
        </div>
      </CardContent></Card>
      {parsed ? (
        <div className="grid md:grid-cols-2 gap-4">
          {formats.map(f => (
            <Card key={f.label}><CardContent className="pt-4 flex justify-between items-center">
              <div><span className="text-muted-foreground text-sm">{f.label}</span><p className="font-mono">{f.value}</p></div>
              <Button size="sm" variant="ghost" onClick={() => copy(f.value)}><Copy className="h-4 w-4" /></Button>
            </CardContent></Card>
          ))}
        </div>
      ) : <Card><CardContent className="py-8 text-center text-muted-foreground">Entrez un timestamp valide</CardContent></Card>}
    </div>
  );
}
