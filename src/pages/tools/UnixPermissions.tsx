import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Copy, Shield, FileText, Folder, Lock } from "lucide-react";
import { toast } from "sonner";
import { Tooltip } from "@/components/Tooltip";

interface PermissionSet {
  read: boolean;
  write: boolean;
  execute: boolean;
}

interface Permissions {
  owner: PermissionSet;
  group: PermissionSet;
  others: PermissionSet;
  special: {
    setuid: boolean;
    setgid: boolean;
    sticky: boolean;
  };
}

const UnixPermissions = () => {
  const [permissions, setPermissions] = useState<Permissions>({
    owner: { read: true, write: true, execute: false },
    group: { read: true, write: false, execute: false },
    others: { read: true, write: false, execute: false },
    special: { setuid: false, setgid: false, sticky: false }
  });

  const [octalInput, setOctalInput] = useState("644");
  const [symbolicInput, setSymbolicInput] = useState("rw-r--r--");

  const calculateOctal = (perms: Permissions): string => {
    const calcValue = (p: PermissionSet): number => {
      return (p.read ? 4 : 0) + (p.write ? 2 : 0) + (p.execute ? 1 : 0);
    };
    
    const special = (perms.special.setuid ? 4 : 0) + 
                   (perms.special.setgid ? 2 : 0) + 
                   (perms.special.sticky ? 1 : 0);
    
    const owner = calcValue(perms.owner);
    const group = calcValue(perms.group);
    const others = calcValue(perms.others);
    
    return special > 0 ? `${special}${owner}${group}${others}` : `${owner}${group}${others}`;
  };

  const calculateSymbolic = (perms: Permissions): string => {
    const toSymbol = (p: PermissionSet, specialBit: boolean, specialChar: string): string => {
      const r = p.read ? 'r' : '-';
      const w = p.write ? 'w' : '-';
      let x = p.execute ? 'x' : '-';
      
      if (specialBit) {
        x = p.execute ? specialChar.toLowerCase() : specialChar.toUpperCase();
      }
      
      return r + w + x;
    };
    
    return toSymbol(perms.owner, perms.special.setuid, 's') +
           toSymbol(perms.group, perms.special.setgid, 's') +
           toSymbol(perms.others, perms.special.sticky, 't');
  };

  const parseOctal = (octal: string) => {
    let value = octal.replace(/[^0-7]/g, '');
    if (value.length < 3 || value.length > 4) return;
    
    const hasSpecial = value.length === 4;
    const special = hasSpecial ? parseInt(value[0]) : 0;
    const owner = parseInt(value[hasSpecial ? 1 : 0]);
    const group = parseInt(value[hasSpecial ? 2 : 1]);
    const others = parseInt(value[hasSpecial ? 3 : 2]);
    
    const toPermSet = (val: number): PermissionSet => ({
      read: (val & 4) !== 0,
      write: (val & 2) !== 0,
      execute: (val & 1) !== 0
    });
    
    setPermissions({
      owner: toPermSet(owner),
      group: toPermSet(group),
      others: toPermSet(others),
      special: {
        setuid: (special & 4) !== 0,
        setgid: (special & 2) !== 0,
        sticky: (special & 1) !== 0
      }
    });
  };

  const parseSymbolic = (symbolic: string) => {
    if (symbolic.length !== 9) return;
    
    const parseSet = (s: string, index: number): { perm: PermissionSet; special: boolean } => {
      const chars = s.slice(index * 3, index * 3 + 3);
      const specialChars = index === 0 ? ['s', 'S'] : index === 1 ? ['s', 'S'] : ['t', 'T'];
      
      return {
        perm: {
          read: chars[0] === 'r',
          write: chars[1] === 'w',
          execute: chars[2] === 'x' || specialChars.includes(chars[2])
        },
        special: specialChars.map(c => c.toLowerCase()).includes(chars[2].toLowerCase())
      };
    };
    
    const owner = parseSet(symbolic, 0);
    const group = parseSet(symbolic, 1);
    const others = parseSet(symbolic, 2);
    
    setPermissions({
      owner: owner.perm,
      group: group.perm,
      others: others.perm,
      special: {
        setuid: owner.special,
        setgid: group.special,
        sticky: others.special
      }
    });
  };

  useEffect(() => {
    setOctalInput(calculateOctal(permissions));
    setSymbolicInput(calculateSymbolic(permissions));
  }, [permissions]);

  const updatePermission = (
    category: 'owner' | 'group' | 'others',
    type: 'read' | 'write' | 'execute',
    value: boolean
  ) => {
    setPermissions(prev => ({
      ...prev,
      [category]: { ...prev[category], [type]: value }
    }));
  };

  const updateSpecial = (type: 'setuid' | 'setgid' | 'sticky', value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      special: { ...prev.special, [type]: value }
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié`);
  };

  const presets = [
    { label: "Fichier privé", octal: "600", desc: "Lecture/écriture propriétaire uniquement" },
    { label: "Fichier standard", octal: "644", desc: "rw-r--r--" },
    { label: "Script exécutable", octal: "755", desc: "rwxr-xr-x" },
    { label: "Dossier partagé", octal: "775", desc: "rwxrwxr-x" },
    { label: "Dossier public", octal: "777", desc: "rwxrwxrwx" },
    { label: "Sticky bit", octal: "1777", desc: "/tmp style" },
    { label: "SetUID", octal: "4755", desc: "sudo style" },
    { label: "Lecture seule", octal: "444", desc: "r--r--r--" },
  ];

  const PermissionCheckbox = ({ 
    category, 
    type, 
    checked, 
    label 
  }: { 
    category: 'owner' | 'group' | 'others'; 
    type: 'read' | 'write' | 'execute'; 
    checked: boolean; 
    label: string;
  }) => (
    <div className="flex items-center gap-2">
      <Checkbox
        id={`${category}-${type}`}
        checked={checked}
        onCheckedChange={(v) => updatePermission(category, type, v as boolean)}
      />
      <Label htmlFor={`${category}-${type}`} className="text-sm cursor-pointer">
        {label}
      </Label>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Calculateur de Permissions <Tooltip term="Unix">Unix</Tooltip>
        </h1>
        <p className="text-muted-foreground">
          Convertissez et calculez les permissions de fichiers Unix (chmod)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {(['owner', 'group', 'others'] as const).map((category) => (
                  <div key={category} className="space-y-3">
                    <h3 className="font-semibold capitalize text-center">
                      {category === 'owner' ? 'Propriétaire' : category === 'group' ? 'Groupe' : 'Autres'}
                    </h3>
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <PermissionCheckbox
                        category={category}
                        type="read"
                        checked={permissions[category].read}
                        label="Lecture (r)"
                      />
                      <PermissionCheckbox
                        category={category}
                        type="write"
                        checked={permissions[category].write}
                        label="Écriture (w)"
                      />
                      <PermissionCheckbox
                        category={category}
                        type="execute"
                        checked={permissions[category].execute}
                        label="Exécution (x)"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Bits spéciaux
                </h3>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="setuid"
                      checked={permissions.special.setuid}
                      onCheckedChange={(v) => updateSpecial('setuid', v as boolean)}
                    />
                    <Label htmlFor="setuid" className="cursor-pointer">
                      <Tooltip term="SetUID">SetUID</Tooltip>
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="setgid"
                      checked={permissions.special.setgid}
                      onCheckedChange={(v) => updateSpecial('setgid', v as boolean)}
                    />
                    <Label htmlFor="setgid" className="cursor-pointer">
                      <Tooltip term="SetGID">SetGID</Tooltip>
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sticky"
                      checked={permissions.special.sticky}
                      onCheckedChange={(v) => updateSpecial('sticky', v as boolean)}
                    />
                    <Label htmlFor="sticky" className="cursor-pointer">
                      <Tooltip term="Sticky Bit">Sticky</Tooltip>
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Presets courants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.octal}
                    variant="outline"
                    className="h-auto py-2 px-3 justify-start"
                    onClick={() => parseOctal(preset.octal)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{preset.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {preset.octal} - {preset.desc}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résultat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Notation octale</Label>
                <div className="flex gap-2">
                  <Input
                    value={octalInput}
                    onChange={(e) => {
                      setOctalInput(e.target.value);
                      parseOctal(e.target.value);
                    }}
                    className="font-mono text-2xl text-center"
                    maxLength={4}
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(octalInput, "Octal")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Notation symbolique</Label>
                <div className="flex gap-2">
                  <Input
                    value={symbolicInput}
                    onChange={(e) => {
                      setSymbolicInput(e.target.value);
                      parseSymbolic(e.target.value);
                    }}
                    className="font-mono text-xl text-center"
                    maxLength={9}
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(symbolicInput, "Symbolique")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="font-mono text-lg text-center">
                  -{symbolicInput}
                </div>
                <div className="flex justify-center gap-1 text-xs text-muted-foreground">
                  <span className="w-3">d</span>
                  <span className="w-9 text-center border-b">owner</span>
                  <span className="w-9 text-center border-b">group</span>
                  <span className="w-9 text-center border-b">others</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commandes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">chmod numérique</Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-muted rounded font-mono text-sm">
                    chmod {octalInput} fichier
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`chmod ${octalInput} fichier`, "Commande")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">chmod symbolique</Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-muted rounded font-mono text-sm">
                    chmod u={permissions.owner.read ? 'r' : ''}{permissions.owner.write ? 'w' : ''}{permissions.owner.execute ? 'x' : ''},g={permissions.group.read ? 'r' : ''}{permissions.group.write ? 'w' : ''}{permissions.group.execute ? 'x' : ''},o={permissions.others.read ? 'r' : ''}{permissions.others.write ? 'w' : ''}{permissions.others.execute ? 'x' : ''} fichier
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`chmod u=${permissions.owner.read ? 'r' : ''}${permissions.owner.write ? 'w' : ''}${permissions.owner.execute ? 'x' : ''},g=${permissions.group.read ? 'r' : ''}${permissions.group.write ? 'w' : ''}${permissions.group.execute ? 'x' : ''},o=${permissions.others.read ? 'r' : ''}${permissions.others.write ? 'w' : ''}${permissions.others.execute ? 'x' : ''} fichier`, "Commande")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Récursif (dossier)</Label>
                <div className="flex gap-2">
                  <code className="flex-1 p-2 bg-muted rounded font-mono text-sm">
                    chmod -R {octalInput} dossier/
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`chmod -R ${octalInput} dossier/`, "Commande")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Légende</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">r</Badge>
                  <span>Read (4)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">w</Badge>
                  <span>Write (2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">x</Badge>
                  <span>Execute (1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">-</Badge>
                  <span>No permission (0)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UnixPermissions;
