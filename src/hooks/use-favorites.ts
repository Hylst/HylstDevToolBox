import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "devtoolbox-favorites";
const RECENT_KEY = "devtoolbox-recent";
const MAX_RECENT = 5;

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  }, [recent]);

  const toggleFavorite = useCallback((url: string) => {
    setFavorites(prev =>
      prev.includes(url) ? prev.filter(f => f !== url) : [...prev, url]
    );
  }, []);

  const isFavorite = useCallback((url: string) => {
    return favorites.includes(url);
  }, [favorites]);

  const addRecent = useCallback((url: string) => {
    setRecent(prev => {
      const filtered = prev.filter(r => r !== url);
      return [url, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  return { favorites, recent, toggleFavorite, isFavorite, addRecent };
}
