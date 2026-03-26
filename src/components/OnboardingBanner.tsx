import { useState, useEffect } from "react";
import { X, Search, Star, Moon, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "devtoolbox-onboarding-seen";

export function OnboardingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  if (!visible) return null;

  const tips = [
    { icon: Search, text: "Cmd+K pour rechercher un outil" },
    { icon: Star, text: "Cliquez ★ pour ajouter aux favoris" },
    { icon: Moon, text: "Cmd+D pour changer de thème" },
    { icon: Keyboard, text: "Cmd+B pour toggle la sidebar" },
  ];

  return (
    <div className="relative mx-4 mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6"
        onClick={dismiss}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
      <p className="text-sm font-semibold mb-3">👋 Bienvenue sur HylstDevToolBox !</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
            <tip.icon className="h-4 w-4 text-primary shrink-0" />
            <span>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
