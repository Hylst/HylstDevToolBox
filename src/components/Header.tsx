import { Moon, Sun, Command, Clock, Star, Search, Info, ClipboardList, Settings, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { useClipboardHistory } from "@/contexts/ClipboardContext";
import { totalToolCount, getToolName } from "@/lib/tool-registry";
import { useSidebar } from "@/components/ui/sidebar";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { InfoModal } from "@/components/InfoModal";
import { SettingsModal } from "@/components/SettingsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [infoOpen, setInfoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { recent } = useFavoritesContext();
  const { toggleSidebar } = useSidebar();
  const { setIsOpen: setClipboardOpen } = useClipboardHistory();
  const { 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    prevTrack, 
    repeatMode, 
    setRepeatMode, 
    isShuffle, 
    toggleShuffle,
    setModalOpen 
  } = useMusicPlayer();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      return newTheme;
    });
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "d") { e.preventDefault(); toggleTheme(); }
        if (e.key === "b") { e.preventDefault(); toggleSidebar(); }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggleTheme, toggleSidebar]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow group-hover:animate-cyber-pulse transition-all">
                <Command className="h-5 w-5 text-white" />
              </div>
              <div className="hidden md:block text-left relative">
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent group-hover:animate-cyber-pulse">
                  HylstDevToolBox
                </h1>
                <p className="text-[10px] text-muted-foreground leading-none">{totalToolCount} outils pour développeurs</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* 
              Boutons compacts du lecteur audio. 
              Placés ici pour ne pas avoir à ouvrir le modal complet à chaque fois.
              Visible uniquement sur grand écran (lg:flex), avec une petite touche "glassmorphism" très subtile.
            */}
            <div className="hidden lg:flex items-center gap-1 border border-border rounded-md px-1 py-0.5 bg-muted/20">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleShuffle} title="Aléatoire">
                <Shuffle className={`h-3 w-3 ${isShuffle ? 'text-primary' : 'text-muted-foreground'}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevTrack} title="Précédent">
                <SkipBack className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={togglePlay} title={isPlaying ? "Pause" : "Lecture"}>
                {isPlaying ? <Pause className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextTrack} title="Suivant">
                <SkipForward className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 relative" onClick={() => setRepeatMode(repeatMode === "NONE" ? "ALL" : repeatMode === "ALL" ? "ONE" : "NONE")} title="Répéter">
                <Repeat className={`h-3 w-3 ${repeatMode !== "NONE" ? 'text-primary' : 'text-muted-foreground'}`} />
                {repeatMode === "ONE" && <span className="absolute text-[8px] font-bold mt-2 ml-3 text-primary">1</span>}
              </Button>
              <div className="w-[1px] h-4 bg-border mx-1" />
              <Button variant="ghost" size="icon" className="h-7 w-7 group" onClick={() => setModalOpen(true)} title="Ouvrir le lecteur">
                <Headphones className={`h-4 w-4 ${isPlaying ? 'text-primary animate-pulse' : 'text-muted-foreground group-hover:text-primary'}`} />
              </Button>
            </div>
            
            {/* 
              Bouton Casque pour les mobiles (lg:hidden) 
              Permet d'ouvrir la popup complète du lecteur, car on manque de place pour tous les boutons !
            */}
            <Button variant="ghost" size="icon" className="flex lg:hidden h-8 w-8 group" onClick={() => setModalOpen(true)}>
              <Headphones className={`h-4 w-4 ${isPlaying ? 'text-primary animate-pulse' : 'text-muted-foreground group-hover:text-primary'}`} />
            </Button>

            {/* Cmd+K search trigger */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-muted-foreground"
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Rechercher…</span>
              <kbd className="pointer-events-none ml-1 inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </Button>

            {/* Recent tools */}
            {recent.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span className="hidden md:inline">Récents</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Outils récents</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {recent.map(url => (
                    <DropdownMenuItem key={url} onClick={() => navigate(url)} className="cursor-pointer">
                      {getToolName(url)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Clipboard History button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClipboardOpen(true)}
              className="hidden sm:flex items-center gap-1.5 border-primary/30 hover:border-primary hover:bg-primary/10"
              title="Historique du Presse-papier (Ctrl+Shift+V)"
            >
              <ClipboardList className="h-4 w-4 text-primary" />
              <span className="hidden md:inline text-xs font-medium">Presse-papier</span>
            </Button>

            {/* Info button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInfoOpen(true)}
              className="flex items-center gap-1.5 border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <Info className="h-4 w-4 text-primary" />
              <span className="hidden md:inline text-xs font-medium">Infos</span>
            </Button>

            {/* Settings button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1.5 border-primary/30 hover:border-primary hover:bg-primary/10"
              title="Paramètres"
            >
              <Settings className="h-4 w-4 text-primary" />
              <span className="hidden md:inline text-xs font-medium">Réglages</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="transition-smooth flex items-center gap-2 px-3 border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              {theme === "light" ? (
                <>
                  <Moon className="h-4 w-4 text-primary" />
                  <span className="hidden md:inline text-xs font-medium">Sombre</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-yellow-400" />
                  <span className="hidden md:inline text-xs font-medium">Clair</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      <InfoModal open={infoOpen} onOpenChange={setInfoOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};
