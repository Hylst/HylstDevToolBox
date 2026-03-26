import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { ToolEntry } from "@/lib/tool-registry";
import { Sparkles, ListChecks } from "lucide-react";

interface ToolInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: ToolEntry;
}

export const ToolInfoModal = ({ open, onOpenChange, tool }: ToolInfoModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            {tool.title}
            <Badge variant="secondary" className="text-xs font-normal">{tool.category}</Badge>
          </DialogTitle>
          {tool.shortDesc && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">{tool.shortDesc}</p>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] px-6 pb-6">
          {tool.features && tool.features.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Fonctionnalités
              </h4>
              <ul className="space-y-1.5">
                {tool.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tool.guide && tool.guide.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" /> Mode d'emploi
              </h4>
              <ol className="space-y-2">
                {tool.guide.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
