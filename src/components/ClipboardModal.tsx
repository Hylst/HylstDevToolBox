import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ClipboardList, Copy, Trash2, X } from "lucide-react";
import { useClipboardHistory, ClipboardItem } from "@/contexts/ClipboardContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function ClipboardModal() {
  const { history, isOpen, setIsOpen, clearHistory, removeHistoryItem } = useClipboardHistory();

  const handleCopy = (item: ClipboardItem) => {
    // Avoid re-triggering our own history logic indefinitely by temporarily circumventing it,
    // actually our history context checks if `prev[0].text === text` and skips, but let's just trigger it.
    // It will move the pasted item to the top of the history.
    navigator.clipboard.writeText(item.text);
    toast.success("Copié depuis l'historique !");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Historique du presse-papier
          </DialogTitle>
          <DialogDescription>
            Gardez une trace de ce que vous avez copié récemment (Ctrl+Shift+V)
          </DialogDescription>
        </DialogHeader>

        {history.length > 0 ? (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 overflow-y-auto">
              <div className="space-y-3 py-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true, locale: fr })}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(item)}
                          title="Copier"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                          onClick={() => removeHistoryItem(item.id)}
                          title="Supprimer"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <code className="text-sm whitespace-pre-wrap break-all max-h-32 overflow-hidden text-ellipsis line-clamp-4 bg-muted/30 p-2 rounded">
                      {item.text}
                    </code>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="pt-4 mt-2 border-t border-border flex justify-end">
              <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={clearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Vider l'historique
              </Button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
            <ClipboardList className="h-12 w-12 mb-4 opacity-20" />
            <p>Historique vide.</p>
            <p className="text-xs mt-1">Copiez des éléments dans les outils pour les retrouver ici.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
