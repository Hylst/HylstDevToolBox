import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

export const TRACKS = [
  "contagion_cadence.mp3",
  "coup_cadence.mp3",
  "directive_protocol.mp3",
  "disease_rhythm.mp3",
  "veil_of_intrigue.mp3",
  "dystopia_groove.mp3",
  "echoes_of_tomorrow.mp3",
  "electronic_invention_anthem.mp3",
  "galaxy_gambit.mp3",
  "games_glitches_psycho.mp3",
  "ignite_the_chaos.mp3",
  "infinite_roads.mp3",
  "cruising_beats.mp3",
  "industrial_electric_release.mp3",
  "outbreak_anthem.mp3",
  "power_play.mp3",
  "protocole_d_eveil_active.mp3",
  "space_retro_cowboy.mp3",
  "spatial_grand_hotel.mp3",
  "synthetic_waves_flow.mp3",
  "trancy_trip.mp3",
  "treacherous_echoes.mp3",
  "urban_drive.mp3",
  "veil_of_peril.mp3",
  "whispers_of_betrayal.mp3",
  "y_a_du_sang_sur_mon_holster.mp3"
];

export const BASE_URL = "https://hylst.fr/hml/";

export type RepeatMode = "NONE" | "ONE" | "ALL";

interface MusicPlayerContextType {
  isPlaying: boolean;
  currentTrackIndex: number;
  currentTrack: string;
  progress: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  playTrack: (index: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("ALL");
  const [isShuffle, setIsShuffle] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialisation de l'objet Audio
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initialisé une seule fois

  // Changement de piste logic
  const loadTrack = useCallback((index: number, shouldPlay: boolean) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    
    const trackUrl = `${BASE_URL}${TRACKS[index]}`;
    if (audio.src !== trackUrl) {
      audio.src = trackUrl;
      audio.load();
    }
    
    if (shouldPlay) {
      audio.play().catch(e => console.error("Error playing audio:", e));
      setIsPlaying(true);
    }
  }, []);

  // Update effect when currentTrackIndex changes
  useEffect(() => {
    if (audioRef.current && audioRef.current.src) {
      loadTrack(currentTrackIndex, isPlaying);
    } else {
      // First load (don't play if it wasn't requested)
      loadTrack(currentTrackIndex, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === "ONE") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      nextTrackAction();
    }
  }, [repeatMode]);

  const nextTrackAction = React.useCallback(() => {
    setCurrentTrackIndex((prev) => {
      if (isShuffle) {
        return Math.floor(Math.random() * TRACKS.length);
      }
      if (prev >= TRACKS.length - 1) {
        return repeatMode === "ALL" ? 0 : prev;
      }
      return prev + 1;
    });
  }, [isShuffle, repeatMode]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const nextTrack = useCallback(() => {
    nextTrackAction();
    setIsPlaying(true);
  }, [nextTrackAction]);

  const prevTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => {
      if (isShuffle) {
        return Math.floor(Math.random() * TRACKS.length);
      }
      return prev === 0 ? (repeatMode === "ALL" ? TRACKS.length - 1 : 0) : prev - 1;
    });
    setIsPlaying(true);
  }, [isShuffle, repeatMode]);

  const setVolume = useCallback((newVolume: number) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const toggleShuffle = useCallback(() => setIsShuffle(!isShuffle), [isShuffle]);

  const playTrack = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    if (audioRef.current) {
      // Allow next tick to change the track before playing
      setTimeout(() => play(), 50);
    }
  }, [play]);

  return (
    <MusicPlayerContext.Provider
      value={{
        isPlaying,
        currentTrackIndex,
        currentTrack: TRACKS[currentTrackIndex],
        progress,
        duration,
        volume,
        repeatMode,
        isShuffle,
        isModalOpen,
        setModalOpen,
        play,
        pause,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        seek,
        setRepeatMode,
        toggleShuffle,
        playTrack
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};
