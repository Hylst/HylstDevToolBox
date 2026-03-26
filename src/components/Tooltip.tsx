import { Info } from "lucide-react";
import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipProps {
  term?: string;
  children: React.ReactNode;
  content?: string;
  learnMoreUrl?: string;
}

export const Tooltip = ({ term, children, content, learnMoreUrl }: TooltipProps) => {
  const tooltipContent = content || children;
  
  return (
    <TooltipProvider>
      <TooltipPrimitive>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help border-b border-dotted border-muted-foreground/50">
            {term || children}
            <Info className="h-3 w-3 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{tooltipContent}</p>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              En savoir plus →
            </a>
          )}
        </TooltipContent>
      </TooltipPrimitive>
    </TooltipProvider>
  );
};
