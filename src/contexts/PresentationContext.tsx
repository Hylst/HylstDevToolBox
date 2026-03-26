import { createContext, useContext, useState, ReactNode } from "react";

interface PresentationContextProps {
  isPresenting: boolean;
  setIsPresenting: (val: boolean) => void;
  togglePresentation: () => void;
}

const PresentationContext = createContext<PresentationContextProps | undefined>(undefined);

export const PresentationProvider = ({ children }: { children: ReactNode }) => {
  const [isPresenting, setIsPresenting] = useState(false);

  return (
    <PresentationContext.Provider value={{
      isPresenting,
      setIsPresenting,
      togglePresentation: () => setIsPresenting(p => !p)
    }}>
      {children}
    </PresentationContext.Provider>
  );
};

export const usePresentation = () => {
  const context = useContext(PresentationContext);
  if (!context) throw new Error("usePresentation must be used within PresentationProvider");
  return context;
};
