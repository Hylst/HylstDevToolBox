import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toolCategories } from "@/lib/tool-registry";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { Star } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { favorites, addRecent } = useFavoritesContext();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    addRecent(url);
    navigate(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher un outil…" />
      <CommandList>
        <CommandEmpty>Aucun outil trouvé.</CommandEmpty>
        {favorites.length > 0 && (
          <CommandGroup heading="⭐ Favoris">
            {toolCategories
              .flatMap(c => c.tools)
              .filter(t => favorites.includes(t.url))
              .map(tool => (
                <CommandItem
                  key={`fav-${tool.url}`}
                  value={`${tool.title} ${tool.category}`}
                  onSelect={() => handleSelect(tool.url)}
                  className="cursor-pointer"
                >
                  <Star className="mr-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>{tool.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{tool.category}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        )}
        {toolCategories.map(cat => (
          <CommandGroup key={cat.label} heading={cat.label}>
            {cat.tools.map(tool => (
              <CommandItem
                key={tool.url}
                value={`${tool.title} ${tool.description ?? ""} ${tool.category}`}
                onSelect={() => handleSelect(tool.url)}
                className="cursor-pointer"
              >
                <span>{tool.title}</span>
                {tool.description && (
                  <span className="ml-2 text-xs text-muted-foreground">{tool.description}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
