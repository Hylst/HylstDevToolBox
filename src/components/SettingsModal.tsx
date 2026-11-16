import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Download, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useClipboardHistory } from "@/contexts/ClipboardContext";
import { clearDevToolboxData } from "@/lib/devtoolbox-storage";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clearHistory } = useClipboardHistory();

  const handleExport = () => {
    try {
      const data = {
        theme: localStorage.getItem("theme"),
        favorites: localStorage.getItem("devtoolbox-favorites"),
        // L'historique du presse-papiers n'est jamais exporte : il peut contenir des secrets.
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hylst-devtools-prefs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Préférences exportées avec succès.");
    } catch (err) {
      toast.error("Erreur lors de l'exportation des préférences.");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        let imported = false;

        if (data.theme) {
          localStorage.setItem("theme", data.theme);
          document.documentElement.classList.toggle("dark", data.theme === "dark");
          imported = true;
        }
        
        if (typeof data.favorites === "string") {
          localStorage.setItem("devtoolbox-favorites", data.favorites);
          imported = true;
        }
        // Un ancien export peut contenir l'historique du presse-papiers : il est ignore.

        if (imported) {
          toast.success("Préférences importées. La page va se rafraîchir.");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          toast.error("Fichier de préférences invalide.");
        }
      } catch (err) {
        toast.error("Erreur lors de la lecture du fichier.");
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Supprimer toutes les données de la boîte à outils dans ce navigateur (notes, favoris, collections, réglages d'outils) ? Cette action est irréversible.")) {
      clearHistory();
      // Seules les cles de la boite a outils : l'origine hylst.fr est partagee avec les autres apps.
      clearDevToolboxData(localStorage, sessionStorage);
      toast.success("Données de la boîte à outils effacées. Actualisation...");
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Paramètres et Préférences
          </DialogTitle>
          <DialogDescription>
            Gérez vos données locales, exportez ou importez votre thème et vos favoris.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Export / Import</h4>
            <div className="flex gap-3">
              <Button onClick={handleExport} className="flex-1" variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} className="flex-1" variant="secondary">
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              L'export contient votre thème et vos favoris. L'historique du presse-papiers n'est jamais exporté.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> 
              Zone de danger
            </h4>
            <Button onClick={handleClearAll} variant="destructive" className="w-full">
              Réinitialiser l'application
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Ceci efface les données de la boîte à outils dans ce navigateur (notes, favoris, historiques, réglages d'outils). Le thème et les autres applications de hylst.fr ne sont pas touchés.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
