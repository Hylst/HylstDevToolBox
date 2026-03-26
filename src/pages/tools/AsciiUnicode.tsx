import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Binary, Search, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CharItem {
  char: string;
  decimal: number;
  hex: string;
  name: string;
  category?: string;
}

const generateAsciiTable = (): CharItem[] => {
  const controlNames: Record<number, string> = {
    0: "NUL (Null)", 1: "SOH (Start of Heading)", 2: "STX (Start of Text)", 3: "ETX (End of Text)",
    4: "EOT (End of Transmission)", 5: "ENQ (Enquiry)", 6: "ACK (Acknowledge)", 7: "BEL (Bell)",
    8: "BS (Backspace)", 9: "HT (Horizontal Tab)", 10: "LF (Line Feed)", 11: "VT (Vertical Tab)",
    12: "FF (Form Feed)", 13: "CR (Carriage Return)", 14: "SO (Shift Out)", 15: "SI (Shift In)",
    16: "DLE (Data Link Escape)", 17: "DC1", 18: "DC2", 19: "DC3", 20: "DC4",
    21: "NAK (Negative Acknowledge)", 22: "SYN (Synchronous Idle)", 23: "ETB (End of Block)",
    24: "CAN (Cancel)", 25: "EM (End of Medium)", 26: "SUB (Substitute)", 27: "ESC (Escape)",
    28: "FS (File Separator)", 29: "GS (Group Separator)", 30: "RS (Record Separator)", 31: "US (Unit Separator)",
    32: "Space", 127: "DEL (Delete)"
  };

  return Array.from({ length: 128 }, (_, i) => {
    let char = "";
    let category = "Control";
    
    if (i >= 33 && i <= 47) { char = String.fromCharCode(i); category = "Punctuation"; }
    else if (i >= 48 && i <= 57) { char = String.fromCharCode(i); category = "Digits"; }
    else if (i >= 58 && i <= 64) { char = String.fromCharCode(i); category = "Punctuation"; }
    else if (i >= 65 && i <= 90) { char = String.fromCharCode(i); category = "Uppercase"; }
    else if (i >= 91 && i <= 96) { char = String.fromCharCode(i); category = "Punctuation"; }
    else if (i >= 97 && i <= 122) { char = String.fromCharCode(i); category = "Lowercase"; }
    else if (i >= 123 && i <= 126) { char = String.fromCharCode(i); category = "Punctuation"; }
    else { char = ""; }

    return {
      char,
      decimal: i,
      hex: i.toString(16).toUpperCase().padStart(2, "0"),
      name: controlNames[i] || char,
      category
    };
  });
};

const htmlEntities: CharItem[] = [
  { char: "&", decimal: 38, hex: "26", name: "&amp;", category: "Basic" },
  { char: "<", decimal: 60, hex: "3C", name: "&lt;", category: "Basic" },
  { char: ">", decimal: 62, hex: "3E", name: "&gt;", category: "Basic" },
  { char: '"', decimal: 34, hex: "22", name: "&quot;", category: "Basic" },
  { char: "'", decimal: 39, hex: "27", name: "&apos;", category: "Basic" },
  { char: " ", decimal: 160, hex: "A0", name: "&nbsp;", category: "Space" },
  { char: "–", decimal: 8211, hex: "2013", name: "&ndash;", category: "Punctuation" },
  { char: "—", decimal: 8212, hex: "2014", name: "&mdash;", category: "Punctuation" },
  { char: "'", decimal: 8216, hex: "2018", name: "&lsquo;", category: "Quotes" },
  { char: "'", decimal: 8217, hex: "2019", name: "&rsquo;", category: "Quotes" },
  { char: "\u201C", decimal: 8220, hex: "201C", name: "&ldquo;", category: "Quotes" },
  { char: "\u201D", decimal: 8221, hex: "201D", name: "&rdquo;", category: "Quotes" },
  { char: "•", decimal: 8226, hex: "2022", name: "&bull;", category: "Punctuation" },
  { char: "…", decimal: 8230, hex: "2026", name: "&hellip;", category: "Punctuation" },
  { char: "€", decimal: 8364, hex: "20AC", name: "&euro;", category: "Currency" },
  { char: "£", decimal: 163, hex: "A3", name: "&pound;", category: "Currency" },
  { char: "¥", decimal: 165, hex: "A5", name: "&yen;", category: "Currency" },
  { char: "©", decimal: 169, hex: "A9", name: "&copy;", category: "Symbols" },
  { char: "®", decimal: 174, hex: "AE", name: "&reg;", category: "Symbols" },
  { char: "™", decimal: 8482, hex: "2122", name: "&trade;", category: "Symbols" },
  { char: "°", decimal: 176, hex: "B0", name: "&deg;", category: "Math" },
  { char: "±", decimal: 177, hex: "B1", name: "&plusmn;", category: "Math" },
  { char: "×", decimal: 215, hex: "D7", name: "&times;", category: "Math" },
  { char: "÷", decimal: 247, hex: "F7", name: "&divide;", category: "Math" },
  { char: "≠", decimal: 8800, hex: "2260", name: "&ne;", category: "Math" },
  { char: "≤", decimal: 8804, hex: "2264", name: "&le;", category: "Math" },
  { char: "≥", decimal: 8805, hex: "2265", name: "&ge;", category: "Math" },
  { char: "∞", decimal: 8734, hex: "221E", name: "&infin;", category: "Math" },
  { char: "→", decimal: 8594, hex: "2192", name: "&rarr;", category: "Arrows" },
  { char: "←", decimal: 8592, hex: "2190", name: "&larr;", category: "Arrows" },
  { char: "↑", decimal: 8593, hex: "2191", name: "&uarr;", category: "Arrows" },
  { char: "↓", decimal: 8595, hex: "2193", name: "&darr;", category: "Arrows" },
  { char: "↔", decimal: 8596, hex: "2194", name: "&harr;", category: "Arrows" },
];

const emojiCategories = [
  { category: "Smileys", items: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😎", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "🥱", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲"] },
  { category: "Gestures", items: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤝", "🙏", "✍️", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🧠", "🫀", "🫁", "👀", "👁️", "👅", "👄"] },
  { category: "Objects", items: ["💻", "🖥️", "🖨️", "⌨️", "🖱️", "💾", "💿", "📀", "📱", "📲", "☎️", "📞", "📟", "📠", "🔋", "🔌", "💡", "🔦", "🕯️", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "💰", "💳", "💎", "⚖️", "🧰", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🔩", "⚙️", "🧲", "🔫", "💣", "🧨", "🔪", "🗡️", "⚔️", "🛡️", "🚬"] },
  { category: "Symbols", items: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "✅", "❌", "❓", "❗", "⭐", "🌟", "💫", "✨", "⚡", "🔥", "💥", "❄️", "🌈", "☀️", "🌙", "⭕", "❎", "➕", "➖", "➗", "✖️", "♻️", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪"] },
  { category: "Tech", items: ["⚛️", "🔗", "🧬", "🔬", "🔭", "📡", "💉", "🩸", "💊", "🩹", "🩺", "🔐", "🔒", "🔓", "🔑", "🗝️", "🔨", "🪓", "⛏️", "⚒️", "🛠️", "🗡️", "⚔️", "🔧", "🔩", "⚙️", "🗜️", "⚖️", "🦯", "🔗", "⛓️", "🪝", "🧰", "🧲", "🪜"] },
];

export default function AsciiUnicode() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const asciiTable = useMemo(() => generateAsciiTable(), []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !", description: `${label} copié dans le presse-papier` });
  };

  const filteredAscii = useMemo(() => {
    if (!search) return asciiTable;
    return asciiTable.filter(
      (item) =>
        item.char.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.decimal.toString().includes(search) ||
        item.hex.toLowerCase().includes(search.toLowerCase())
    );
  }, [asciiTable, search]);

  const filteredEntities = useMemo(() => {
    if (!search) return htmlEntities;
    return htmlEntities.filter(
      (item) =>
        item.char.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const CharTable = ({ items, showBinary = false }: { items: CharItem[]; showBinary?: boolean }) => {
    const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];
    
    return (
      <ScrollArea className="h-[calc(100vh-350px)]">
        {categories.map((category) => (
          <div key={category} className="mb-6">
            <h3 className="font-semibold mb-2 text-muted-foreground">{category}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Char</TableHead>
                  <TableHead className="w-20">Décimal</TableHead>
                  <TableHead className="w-20">Hex</TableHead>
                  {showBinary && <TableHead className="w-24">Binaire</TableHead>}
                  <TableHead>Nom / Entité</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.filter((i) => i.category === category).map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <span className="text-2xl font-mono">{item.char || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{item.decimal}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">0x{item.hex}</Badge>
                    </TableCell>
                    {showBinary && (
                      <TableCell>
                        <code className="text-xs">{item.decimal.toString(2).padStart(8, "0")}</code>
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.char && (
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(item.char, "Caractère")}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(item.name, "Entité")}>
                          HTML
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`U+${item.hex}`, "Unicode")}>
                          U+
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </ScrollArea>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Binary className="h-8 w-8 text-primary" />
          ASCII & Unicode
        </h1>
        <p className="text-muted-foreground">
          Tables de caractères, entités HTML et émojis
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un caractère..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="ascii" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ascii">ASCII (0-127)</TabsTrigger>
          <TabsTrigger value="entities">HTML Entities</TabsTrigger>
          <TabsTrigger value="emoji">Émojis</TabsTrigger>
        </TabsList>

        <TabsContent value="ascii">
          <Card>
            <CardHeader>
              <CardTitle>Table ASCII</CardTitle>
              <CardDescription>Les 128 caractères ASCII standard</CardDescription>
            </CardHeader>
            <CardContent>
              <CharTable items={filteredAscii} showBinary />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entities">
          <Card>
            <CardHeader>
              <CardTitle>Entités HTML</CardTitle>
              <CardDescription>Caractères spéciaux et leurs entités HTML</CardDescription>
            </CardHeader>
            <CardContent>
              <CharTable items={filteredEntities} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emoji">
          <Card>
            <CardHeader>
              <CardTitle>Émojis</CardTitle>
              <CardDescription>Cliquez pour copier</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-400px)]">
                {emojiCategories.map((cat) => (
                  <div key={cat.category} className="mb-6">
                    <h3 className="font-semibold mb-3 text-muted-foreground">{cat.category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {cat.items
                        .filter((emoji) => !search || emoji.includes(search))
                        .map((emoji, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            className="w-12 h-12 text-2xl p-0 hover:scale-110 transition-transform"
                            onClick={() => copyToClipboard(emoji, "Émoji")}
                          >
                            {emoji}
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
