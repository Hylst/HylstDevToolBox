import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Download, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useClipboardHistory } from "@/contexts/ClipboardContext";

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
        favorites: localStorage.getItem("hylst-favorites"),
        clipboard: localStorage.getItem("hylst-clipboard-history"),
        // Export additional state if needed
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
        
        if (data.favorites) {
          localStorage.setItem("hylst-favorites", data.favorites);
          imported = true;
        }
        
        if (data.clipboard) {
          localStorage.setItem("hylst-clipboard-history", data.clipboard);
          imported = true;
        }

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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes vos données et préférences locales ? Cette action est irréversible.")) {
      clearHistory();
      localStorage.clear();
      toast.success("Toutes les données ont été effacées. Actualisation...");
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
            Gérez vos données locales, exportez ou importez vos favoris et votre historique.
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
              L'export contient votre thème, vos favoris et l'historique de votre presse-papier.
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
              Ceci effacera toutes les données stockées dans votre navigateur (historique, favoris, réglages d'outils).
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
