import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { CLIPBOARD_HISTORY_KEY } from "@/lib/devtoolbox-storage";

export interface ClipboardItem {
  id: string;
  text: string;
  timestamp: number;
}

interface ClipboardContextType {
  history: ClipboardItem[];
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

const MAX_ITEMS = 50;

function readItems(storage: Storage): ClipboardItem[] {
  try {
    const saved = JSON.parse(storage.getItem(CLIPBOARD_HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((i) => i && typeof i.text === "string") : [];
  } catch {
    return [];
  }
}

// L'historique ne dure que le temps de l'onglet (sessionStorage) : les copies contiennent
// souvent des mots de passe, jetons ou cles, et l'origine hylst.fr est partagee par toutes
// les apps de la plateforme. Jusqu'a la 3.0.5, il etait garde dans localStorage.
function initialHistory() {
  let session: ClipboardItem[] = [];
  let legacy: ClipboardItem[] = [];
  try {
    session = readItems(sessionStorage);
  } catch {
    session = [];
  }
  try {
    legacy = readItems(localStorage);
  } catch {
    legacy = [];
  }
  const ids = new Set(session.map((i) => i.id));
  const items = [...session, ...legacy.filter((i) => !ids.has(i.id))].slice(0, MAX_ITEMS);
  return { items, legacyCount: legacy.length };
}

export function ClipboardProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(initialHistory);
  const [history, setHistory] = useState<ClipboardItem[]>(initial.items);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      if (history.length > 0) sessionStorage.setItem(CLIPBOARD_HISTORY_KEY, JSON.stringify(history));
      else sessionStorage.removeItem(CLIPBOARD_HISTORY_KEY);
    } catch {
      /* stockage de session indisponible : l'historique reste en memoire */
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.removeItem(CLIPBOARD_HISTORY_KEY);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  // Message differe de 400 ms : la page s'affiche avant la notification.
  useEffect(() => {
    if (initial.legacyCount === 0) return;
    const timer = window.setTimeout(() => {
      toast.info("Historique du presse-papiers", {
        description:
          `Il n'est plus gardé d'une visite à l'autre : ${initial.legacyCount} copie(s) enregistrée(s) ` +
          "ont été retirées du stockage du navigateur. Elles restent visibles jusqu'à la fermeture de " +
          "cet onglet (Ctrl+Maj+V).",
        duration: 12000,
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [initial]);

  useEffect(() => {
    // 1️⃣ Interception de navigator.clipboard.writeText (pour les boutons "Copier" de l'app)
    const originalWriteText = navigator.clipboard.writeText;
    
    // On doit lier la fonction originale à l'objet clipboard pour éviter les erreurs de contexte (Illegal invocation)
    const boundWriteText = originalWriteText.bind(navigator.clipboard);

    navigator.clipboard.writeText = async function (text: string) {
      setHistory((prev) => {
        if (prev.length > 0 && prev[0].text === text) return prev;
        const newItem = { id: crypto.randomUUID(), text, timestamp: Date.now() };
        return [newItem, ...prev].slice(0, MAX_ITEMS);
      });
      return boundWriteText(text);
    };

    // 2️⃣ Interception des Ctrl+C natifs du navigateur
    const handleNativeCopy = () => {
      const selectedText = window.getSelection()?.toString();
      if (selectedText && selectedText.trim().length > 0) {
        setHistory((prev) => {
          if (prev.length > 0 && prev[0].text === selectedText) return prev;
          const newItem = { id: crypto.randomUUID(), text: selectedText, timestamp: Date.now() };
          return [newItem, ...prev].slice(0, MAX_ITEMS);
        });
      }
    };
    document.addEventListener("copy", handleNativeCopy);

    return () => {
      navigator.clipboard.writeText = originalWriteText;
      document.removeEventListener("copy", handleNativeCopy);
    };
  }, []);

  // Keyboard shortcut to open history
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const clearHistory = () => setHistory([]);
  const removeHistoryItem = (id: string) =>
    setHistory((prev) => prev.filter((item) => item.id !== id));

  return (
    <ClipboardContext.Provider
      value={{ history, clearHistory, removeHistoryItem, isOpen, setIsOpen }}
    >
      {children}
    </ClipboardContext.Provider>
  );
}

export function useClipboardHistory() {
  const context = useContext(ClipboardContext);
  if (context === undefined) {
    throw new Error("useClipboardHistory must be used within a ClipboardProvider");
  }
  return context;
}
