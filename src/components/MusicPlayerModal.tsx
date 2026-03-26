import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMusicPlayer, BASE_URL, TRACKS } from "@/contexts/MusicPlayerContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Repeat, Repeat1, 
  Shuffle, Music 
} from "lucide-react";
import { cn } from "@/lib/utils";

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatTrackName = (filename: string) => {
  return filename
    .replace(".mp3", "")
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const MusicPlayerModal = () => {
  const {
    isPlaying, currentTrackIndex, currentTrack, progress, duration,
    volume, repeatMode, isShuffle, isModalOpen, setModalOpen,
    togglePlay, nextTrack, prevTrack, setVolume, seek, setRepeatMode,
    toggleShuffle, playTrack
  } = useMusicPlayer();

  const coverUrl = `${BASE_URL}${currentTrack.replace(".mp3", ".webp")}`;

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary animate-cyber-pulse" />
            Hylst Cyber Player
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-4">
          {/* Cover & Info */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-glow ring-2 ring-primary/30">
              <img 
                src={coverUrl} 
                alt="Track Cover" 
                className={cn("w-full h-full object-cover transition-transform duration-700", isPlaying ? "scale-105" : "scale-100")}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%231a1a2e" /><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="%23a855f7" dominant-baseline="middle" text-anchor="middle">No Cover</text></svg>';
                }}
              />
              {/* Overlay pulse */}
              <div className={cn("absolute inset-0 bg-primary/10 transition-opacity", isPlaying ? "opacity-100 animate-pulse" : "opacity-0")} />
            </div>
            
            <div className="text-center w-full px-4 overflow-hidden">
              <h3 className="font-bold text-lg truncate bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                {formatTrackName(currentTrack)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Hylst & AI Productions</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-2">
            <Slider 
              value={[progress]} 
              max={duration || 100} 
              step={1}
              onValueChange={(val) => seek(val[0])}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleShuffle}
                className={cn(isShuffle && "text-primary bg-primary/10")}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={prevTrack}>
                <SkipBack className="w-5 h-5 fill-current" />
              </Button>
              
              <Button 
                variant="default" 
                size="icon" 
                className="w-12 h-12 rounded-full shadow-glow" 
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </Button>
              
              <Button variant="ghost" size="icon" onClick={nextTrack}>
                <SkipForward className="w-5 h-5 fill-current" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setRepeatMode(repeatMode === "NONE" ? "ALL" : repeatMode === "ALL" ? "ONE" : "NONE")}
                className={cn(repeatMode !== "NONE" && "text-primary bg-primary/10")}
              >
                {repeatMode === "ONE" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </Button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 px-4">
              <Button variant="ghost" size="icon" className="w-6 h-6 shrink-0" onClick={() => setVolume(volume === 0 ? 0.5 : 0)}>
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider 
                value={[volume * 100]} 
                max={100} 
                step={1}
                onValueChange={(val) => setVolume(val[0] / 100)}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Playlist */}
          <div className="mt-2 text-sm border-t border-border/50 pt-4">
            <h4 className="font-semibold mb-2 text-xs text-muted-foreground uppercase tracking-widest px-2">Playlist ({TRACKS.length})</h4>
            <ScrollArea className="h-[120px] rounded-md border bg-muted/30">
              <div className="p-2 flex flex-col gap-1">
                {TRACKS.map((track, idx) => (
                  <button
                    key={track}
                    onClick={() => playTrack(idx)}
                    className={cn(
                      "flex items-center text-left px-2 py-1.5 rounded-sm text-xs hover:bg-primary/20 transition-colors",
                      currentTrackIndex === idx && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <span className="w-4 mr-2 opacity-50 text-[10px]">{idx + 1}.</span>
                    <span className="truncate">{formatTrackName(track)}</span>
                    {currentTrackIndex === idx && isPlaying && (
                      <Music className="w-3 h-3 ml-auto animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="text-[9px] text-center text-muted-foreground/50 leading-tight">
            Musiques d'ambiance créées par Hylst majoritairement avec assistance IA.<br />
            Pochettes illustrées Générées par IA.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
