import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

export function ClipboardProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ClipboardItem[]>(() => {
    try {
      const saved = localStorage.getItem("hylst-clipboard-history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("hylst-clipboard-history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    // 1️⃣ Interception de navigator.clipboard.writeText (pour les boutons "Copier" de l'app)
    const originalWriteText = navigator.clipboard.writeText;
    
    // On doit lier la fonction originale à l'objet clipboard pour éviter les erreurs de contexte (Illegal invocation)
    const boundWriteText = originalWriteText.bind(navigator.clipboard);

    navigator.clipboard.writeText = async function (text: string) {
      setHistory((prev) => {
        if (prev.length > 0 && prev[0].text === text) return prev;
        const newItem = { id: crypto.randomUUID(), text, timestamp: Date.now() };
        return [newItem, ...prev].slice(0, 50);
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
          return [newItem, ...prev].slice(0, 50);
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
