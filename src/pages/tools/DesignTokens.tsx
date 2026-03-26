import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Palette, Search, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ColorToken {
  name: string;
  class: string;
  value: string;
  textClass?: string;
}

interface SpacingToken {
  name: string;
  class: string;
  value: string;
  px: string;
}

const tailwindColors: ColorToken[] = [
  // Slate
  { name: "slate-50", class: "bg-slate-50", value: "#f8fafc" },
  { name: "slate-100", class: "bg-slate-100", value: "#f1f5f9" },
  { name: "slate-200", class: "bg-slate-200", value: "#e2e8f0" },
  { name: "slate-300", class: "bg-slate-300", value: "#cbd5e1" },
  { name: "slate-400", class: "bg-slate-400", value: "#94a3b8" },
  { name: "slate-500", class: "bg-slate-500", value: "#64748b" },
  { name: "slate-600", class: "bg-slate-600", value: "#475569", textClass: "text-white" },
  { name: "slate-700", class: "bg-slate-700", value: "#334155", textClass: "text-white" },
  { name: "slate-800", class: "bg-slate-800", value: "#1e293b", textClass: "text-white" },
  { name: "slate-900", class: "bg-slate-900", value: "#0f172a", textClass: "text-white" },
  // Blue
  { name: "blue-50", class: "bg-blue-50", value: "#eff6ff" },
  { name: "blue-100", class: "bg-blue-100", value: "#dbeafe" },
  { name: "blue-200", class: "bg-blue-200", value: "#bfdbfe" },
  { name: "blue-300", class: "bg-blue-300", value: "#93c5fd" },
  { name: "blue-400", class: "bg-blue-400", value: "#60a5fa" },
  { name: "blue-500", class: "bg-blue-500", value: "#3b82f6", textClass: "text-white" },
  { name: "blue-600", class: "bg-blue-600", value: "#2563eb", textClass: "text-white" },
  { name: "blue-700", class: "bg-blue-700", value: "#1d4ed8", textClass: "text-white" },
  { name: "blue-800", class: "bg-blue-800", value: "#1e40af", textClass: "text-white" },
  { name: "blue-900", class: "bg-blue-900", value: "#1e3a8a", textClass: "text-white" },
  // Green
  { name: "green-50", class: "bg-green-50", value: "#f0fdf4" },
  { name: "green-100", class: "bg-green-100", value: "#dcfce7" },
  { name: "green-200", class: "bg-green-200", value: "#bbf7d0" },
  { name: "green-300", class: "bg-green-300", value: "#86efac" },
  { name: "green-400", class: "bg-green-400", value: "#4ade80" },
  { name: "green-500", class: "bg-green-500", value: "#22c55e", textClass: "text-white" },
  { name: "green-600", class: "bg-green-600", value: "#16a34a", textClass: "text-white" },
  { name: "green-700", class: "bg-green-700", value: "#15803d", textClass: "text-white" },
  { name: "green-800", class: "bg-green-800", value: "#166534", textClass: "text-white" },
  { name: "green-900", class: "bg-green-900", value: "#14532d", textClass: "text-white" },
  // Red
  { name: "red-50", class: "bg-red-50", value: "#fef2f2" },
  { name: "red-100", class: "bg-red-100", value: "#fee2e2" },
  { name: "red-200", class: "bg-red-200", value: "#fecaca" },
  { name: "red-300", class: "bg-red-300", value: "#fca5a5" },
  { name: "red-400", class: "bg-red-400", value: "#f87171" },
  { name: "red-500", class: "bg-red-500", value: "#ef4444", textClass: "text-white" },
  { name: "red-600", class: "bg-red-600", value: "#dc2626", textClass: "text-white" },
  { name: "red-700", class: "bg-red-700", value: "#b91c1c", textClass: "text-white" },
  { name: "red-800", class: "bg-red-800", value: "#991b1b", textClass: "text-white" },
  { name: "red-900", class: "bg-red-900", value: "#7f1d1d", textClass: "text-white" },
  // Yellow
  { name: "yellow-50", class: "bg-yellow-50", value: "#fefce8" },
  { name: "yellow-400", class: "bg-yellow-400", value: "#facc15" },
  { name: "yellow-500", class: "bg-yellow-500", value: "#eab308" },
  { name: "yellow-600", class: "bg-yellow-600", value: "#ca8a04" },
  // Purple
  { name: "purple-50", class: "bg-purple-50", value: "#faf5ff" },
  { name: "purple-400", class: "bg-purple-400", value: "#c084fc" },
  { name: "purple-500", class: "bg-purple-500", value: "#a855f7", textClass: "text-white" },
  { name: "purple-600", class: "bg-purple-600", value: "#9333ea", textClass: "text-white" },
  { name: "purple-700", class: "bg-purple-700", value: "#7e22ce", textClass: "text-white" },
];

const tailwindSpacing: SpacingToken[] = [
  { name: "0", class: "p-0", value: "0", px: "0px" },
  { name: "0.5", class: "p-0.5", value: "0.125rem", px: "2px" },
  { name: "1", class: "p-1", value: "0.25rem", px: "4px" },
  { name: "1.5", class: "p-1.5", value: "0.375rem", px: "6px" },
  { name: "2", class: "p-2", value: "0.5rem", px: "8px" },
  { name: "2.5", class: "p-2.5", value: "0.625rem", px: "10px" },
  { name: "3", class: "p-3", value: "0.75rem", px: "12px" },
  { name: "3.5", class: "p-3.5", value: "0.875rem", px: "14px" },
  { name: "4", class: "p-4", value: "1rem", px: "16px" },
  { name: "5", class: "p-5", value: "1.25rem", px: "20px" },
  { name: "6", class: "p-6", value: "1.5rem", px: "24px" },
  { name: "7", class: "p-7", value: "1.75rem", px: "28px" },
  { name: "8", class: "p-8", value: "2rem", px: "32px" },
  { name: "9", class: "p-9", value: "2.25rem", px: "36px" },
  { name: "10", class: "p-10", value: "2.5rem", px: "40px" },
  { name: "11", class: "p-11", value: "2.75rem", px: "44px" },
  { name: "12", class: "p-12", value: "3rem", px: "48px" },
  { name: "14", class: "p-14", value: "3.5rem", px: "56px" },
  { name: "16", class: "p-16", value: "4rem", px: "64px" },
  { name: "20", class: "p-20", value: "5rem", px: "80px" },
  { name: "24", class: "p-24", value: "6rem", px: "96px" },
  { name: "28", class: "p-28", value: "7rem", px: "112px" },
  { name: "32", class: "p-32", value: "8rem", px: "128px" },
  { name: "36", class: "p-36", value: "9rem", px: "144px" },
  { name: "40", class: "p-40", value: "10rem", px: "160px" },
  { name: "44", class: "p-44", value: "11rem", px: "176px" },
  { name: "48", class: "p-48", value: "12rem", px: "192px" },
  { name: "52", class: "p-52", value: "13rem", px: "208px" },
  { name: "56", class: "p-56", value: "14rem", px: "224px" },
  { name: "60", class: "p-60", value: "15rem", px: "240px" },
  { name: "64", class: "p-64", value: "16rem", px: "256px" },
  { name: "72", class: "p-72", value: "18rem", px: "288px" },
  { name: "80", class: "p-80", value: "20rem", px: "320px" },
  { name: "96", class: "p-96", value: "24rem", px: "384px" },
];

// Bootstrap tokens
const bootstrapColors: ColorToken[] = [
  // Primary colors
  { name: "primary", class: "bg-[#0d6efd]", value: "#0d6efd", textClass: "text-white" },
  { name: "secondary", class: "bg-[#6c757d]", value: "#6c757d", textClass: "text-white" },
  { name: "success", class: "bg-[#198754]", value: "#198754", textClass: "text-white" },
  { name: "danger", class: "bg-[#dc3545]", value: "#dc3545", textClass: "text-white" },
  { name: "warning", class: "bg-[#ffc107]", value: "#ffc107" },
  { name: "info", class: "bg-[#0dcaf0]", value: "#0dcaf0" },
  { name: "light", class: "bg-[#f8f9fa]", value: "#f8f9fa" },
  { name: "dark", class: "bg-[#212529]", value: "#212529", textClass: "text-white" },
  // Blue
  { name: "blue-100", class: "bg-[#cfe2ff]", value: "#cfe2ff" },
  { name: "blue-200", class: "bg-[#9ec5fe]", value: "#9ec5fe" },
  { name: "blue-300", class: "bg-[#6ea8fe]", value: "#6ea8fe" },
  { name: "blue-400", class: "bg-[#3d8bfd]", value: "#3d8bfd", textClass: "text-white" },
  { name: "blue-500", class: "bg-[#0d6efd]", value: "#0d6efd", textClass: "text-white" },
  { name: "blue-600", class: "bg-[#0a58ca]", value: "#0a58ca", textClass: "text-white" },
  { name: "blue-700", class: "bg-[#084298]", value: "#084298", textClass: "text-white" },
  { name: "blue-800", class: "bg-[#052c65]", value: "#052c65", textClass: "text-white" },
  { name: "blue-900", class: "bg-[#031633]", value: "#031633", textClass: "text-white" },
  // Green
  { name: "green-100", class: "bg-[#d1e7dd]", value: "#d1e7dd" },
  { name: "green-200", class: "bg-[#a3cfbb]", value: "#a3cfbb" },
  { name: "green-300", class: "bg-[#75b798]", value: "#75b798" },
  { name: "green-400", class: "bg-[#479f76]", value: "#479f76", textClass: "text-white" },
  { name: "green-500", class: "bg-[#198754]", value: "#198754", textClass: "text-white" },
  { name: "green-600", class: "bg-[#146c43]", value: "#146c43", textClass: "text-white" },
  { name: "green-700", class: "bg-[#0f5132]", value: "#0f5132", textClass: "text-white" },
  { name: "green-800", class: "bg-[#0a3622]", value: "#0a3622", textClass: "text-white" },
  { name: "green-900", class: "bg-[#051b11]", value: "#051b11", textClass: "text-white" },
  // Red
  { name: "red-100", class: "bg-[#f8d7da]", value: "#f8d7da" },
  { name: "red-200", class: "bg-[#f1aeb5]", value: "#f1aeb5" },
  { name: "red-300", class: "bg-[#ea868f]", value: "#ea868f" },
  { name: "red-400", class: "bg-[#e35d6a]", value: "#e35d6a", textClass: "text-white" },
  { name: "red-500", class: "bg-[#dc3545]", value: "#dc3545", textClass: "text-white" },
  { name: "red-600", class: "bg-[#b02a37]", value: "#b02a37", textClass: "text-white" },
  { name: "red-700", class: "bg-[#842029]", value: "#842029", textClass: "text-white" },
  { name: "red-800", class: "bg-[#58151c]", value: "#58151c", textClass: "text-white" },
  { name: "red-900", class: "bg-[#2c0b0e]", value: "#2c0b0e", textClass: "text-white" },
  // Yellow/Orange
  { name: "yellow-100", class: "bg-[#fff3cd]", value: "#fff3cd" },
  { name: "yellow-200", class: "bg-[#ffe69c]", value: "#ffe69c" },
  { name: "yellow-300", class: "bg-[#ffda6a]", value: "#ffda6a" },
  { name: "yellow-400", class: "bg-[#ffcd39]", value: "#ffcd39" },
  { name: "yellow-500", class: "bg-[#ffc107]", value: "#ffc107" },
  { name: "orange-500", class: "bg-[#fd7e14]", value: "#fd7e14", textClass: "text-white" },
  // Gray
  { name: "gray-100", class: "bg-[#f8f9fa]", value: "#f8f9fa" },
  { name: "gray-200", class: "bg-[#e9ecef]", value: "#e9ecef" },
  { name: "gray-300", class: "bg-[#dee2e6]", value: "#dee2e6" },
  { name: "gray-400", class: "bg-[#ced4da]", value: "#ced4da" },
  { name: "gray-500", class: "bg-[#adb5bd]", value: "#adb5bd" },
  { name: "gray-600", class: "bg-[#6c757d]", value: "#6c757d", textClass: "text-white" },
  { name: "gray-700", class: "bg-[#495057]", value: "#495057", textClass: "text-white" },
  { name: "gray-800", class: "bg-[#343a40]", value: "#343a40", textClass: "text-white" },
  { name: "gray-900", class: "bg-[#212529]", value: "#212529", textClass: "text-white" },
];

const bootstrapSpacing: SpacingToken[] = [
  { name: "0", class: "p-0", value: "0", px: "0px" },
  { name: "1", class: "p-1", value: "0.25rem", px: "4px" },
  { name: "2", class: "p-2", value: "0.5rem", px: "8px" },
  { name: "3", class: "p-3", value: "1rem", px: "16px" },
  { name: "4", class: "p-4", value: "1.5rem", px: "24px" },
  { name: "5", class: "p-5", value: "3rem", px: "48px" },
];

const bootstrapBreakpoints = [
  { name: "xs", value: "<576px", description: "Extra small devices (phones)" },
  { name: "sm", value: "≥576px", description: "Small devices (landscape phones)" },
  { name: "md", value: "≥768px", description: "Medium devices (tablets)" },
  { name: "lg", value: "≥992px", description: "Large devices (desktops)" },
  { name: "xl", value: "≥1200px", description: "Extra large devices (large desktops)" },
  { name: "xxl", value: "≥1400px", description: "Extra extra large devices" },
];

// CSS Custom Properties
interface CSSVariable {
  name: string;
  value: string;
  description: string;
  category: string;
}

const cssCustomProperties: CSSVariable[] = [
  // Colors
  { name: "--color-primary", value: "#3b82f6", description: "Couleur principale de l'interface", category: "Couleurs" },
  { name: "--color-secondary", value: "#64748b", description: "Couleur secondaire", category: "Couleurs" },
  { name: "--color-accent", value: "#f59e0b", description: "Couleur d'accentuation", category: "Couleurs" },
  { name: "--color-success", value: "#22c55e", description: "Couleur de succès/validation", category: "Couleurs" },
  { name: "--color-warning", value: "#eab308", description: "Couleur d'avertissement", category: "Couleurs" },
  { name: "--color-error", value: "#ef4444", description: "Couleur d'erreur", category: "Couleurs" },
  { name: "--color-info", value: "#06b6d4", description: "Couleur d'information", category: "Couleurs" },
  { name: "--bg-primary", value: "#ffffff", description: "Arrière-plan principal", category: "Couleurs" },
  { name: "--bg-secondary", value: "#f8fafc", description: "Arrière-plan secondaire", category: "Couleurs" },
  { name: "--bg-tertiary", value: "#f1f5f9", description: "Arrière-plan tertiaire", category: "Couleurs" },
  { name: "--text-primary", value: "#0f172a", description: "Texte principal", category: "Couleurs" },
  { name: "--text-secondary", value: "#475569", description: "Texte secondaire", category: "Couleurs" },
  { name: "--text-muted", value: "#94a3b8", description: "Texte atténué", category: "Couleurs" },
  { name: "--border-color", value: "#e2e8f0", description: "Couleur des bordures", category: "Couleurs" },
  // Spacing
  { name: "--space-xs", value: "0.25rem", description: "Espacement extra small (4px)", category: "Espacements" },
  { name: "--space-sm", value: "0.5rem", description: "Espacement small (8px)", category: "Espacements" },
  { name: "--space-md", value: "1rem", description: "Espacement medium (16px)", category: "Espacements" },
  { name: "--space-lg", value: "1.5rem", description: "Espacement large (24px)", category: "Espacements" },
  { name: "--space-xl", value: "2rem", description: "Espacement extra large (32px)", category: "Espacements" },
  { name: "--space-2xl", value: "3rem", description: "Espacement 2x large (48px)", category: "Espacements" },
  { name: "--space-3xl", value: "4rem", description: "Espacement 3x large (64px)", category: "Espacements" },
  // Typography
  { name: "--font-sans", value: "Inter, system-ui, sans-serif", description: "Police sans-serif principale", category: "Typographie" },
  { name: "--font-mono", value: "JetBrains Mono, monospace", description: "Police monospace pour le code", category: "Typographie" },
  { name: "--font-size-xs", value: "0.75rem", description: "Taille de police extra small (12px)", category: "Typographie" },
  { name: "--font-size-sm", value: "0.875rem", description: "Taille de police small (14px)", category: "Typographie" },
  { name: "--font-size-base", value: "1rem", description: "Taille de police base (16px)", category: "Typographie" },
  { name: "--font-size-lg", value: "1.125rem", description: "Taille de police large (18px)", category: "Typographie" },
  { name: "--font-size-xl", value: "1.25rem", description: "Taille de police extra large (20px)", category: "Typographie" },
  { name: "--font-size-2xl", value: "1.5rem", description: "Taille de police 2x large (24px)", category: "Typographie" },
  { name: "--font-size-3xl", value: "1.875rem", description: "Taille de police 3x large (30px)", category: "Typographie" },
  { name: "--line-height-tight", value: "1.25", description: "Hauteur de ligne serrée", category: "Typographie" },
  { name: "--line-height-normal", value: "1.5", description: "Hauteur de ligne normale", category: "Typographie" },
  { name: "--line-height-relaxed", value: "1.75", description: "Hauteur de ligne relâchée", category: "Typographie" },
  // Borders & Radius
  { name: "--radius-sm", value: "0.25rem", description: "Arrondi small (4px)", category: "Bordures" },
  { name: "--radius-md", value: "0.375rem", description: "Arrondi medium (6px)", category: "Bordures" },
  { name: "--radius-lg", value: "0.5rem", description: "Arrondi large (8px)", category: "Bordures" },
  { name: "--radius-xl", value: "0.75rem", description: "Arrondi extra large (12px)", category: "Bordures" },
  { name: "--radius-full", value: "9999px", description: "Arrondi complet (cercle)", category: "Bordures" },
  { name: "--border-width", value: "1px", description: "Épaisseur de bordure par défaut", category: "Bordures" },
  // Shadows
  { name: "--shadow-sm", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)", description: "Ombre légère", category: "Ombres" },
  { name: "--shadow-md", value: "0 4px 6px -1px rgb(0 0 0 / 0.1)", description: "Ombre moyenne", category: "Ombres" },
  { name: "--shadow-lg", value: "0 10px 15px -3px rgb(0 0 0 / 0.1)", description: "Ombre large", category: "Ombres" },
  { name: "--shadow-xl", value: "0 20px 25px -5px rgb(0 0 0 / 0.1)", description: "Ombre extra large", category: "Ombres" },
  // Transitions
  { name: "--transition-fast", value: "150ms", description: "Transition rapide", category: "Animations" },
  { name: "--transition-normal", value: "300ms", description: "Transition normale", category: "Animations" },
  { name: "--transition-slow", value: "500ms", description: "Transition lente", category: "Animations" },
  { name: "--ease-in-out", value: "cubic-bezier(0.4, 0, 0.2, 1)", description: "Courbe d'accélération standard", category: "Animations" },
  { name: "--ease-out", value: "cubic-bezier(0, 0, 0.2, 1)", description: "Courbe de décélération", category: "Animations" },
  // Z-index
  { name: "--z-dropdown", value: "1000", description: "Z-index pour les dropdowns", category: "Z-Index" },
  { name: "--z-modal", value: "1050", description: "Z-index pour les modales", category: "Z-Index" },
  { name: "--z-tooltip", value: "1070", description: "Z-index pour les tooltips", category: "Z-Index" },
  { name: "--z-toast", value: "1090", description: "Z-index pour les toasts", category: "Z-Index" },
];

const breakpoints = [
  { name: "sm", value: "640px", description: "Small devices (phones)" },
  { name: "md", value: "768px", description: "Medium devices (tablets)" },
  { name: "lg", value: "1024px", description: "Large devices (laptops)" },
  { name: "xl", value: "1280px", description: "Extra large devices (desktops)" },
  { name: "2xl", value: "1536px", description: "2X Extra large devices (large desktops)" },
];

const typography = [
  { name: "text-xs", size: "0.75rem", lineHeight: "1rem", px: "12px" },
  { name: "text-sm", size: "0.875rem", lineHeight: "1.25rem", px: "14px" },
  { name: "text-base", size: "1rem", lineHeight: "1.5rem", px: "16px" },
  { name: "text-lg", size: "1.125rem", lineHeight: "1.75rem", px: "18px" },
  { name: "text-xl", size: "1.25rem", lineHeight: "1.75rem", px: "20px" },
  { name: "text-2xl", size: "1.5rem", lineHeight: "2rem", px: "24px" },
  { name: "text-3xl", size: "1.875rem", lineHeight: "2.25rem", px: "30px" },
  { name: "text-4xl", size: "2.25rem", lineHeight: "2.5rem", px: "36px" },
  { name: "text-5xl", size: "3rem", lineHeight: "1", px: "48px" },
  { name: "text-6xl", size: "3.75rem", lineHeight: "1", px: "60px" },
  { name: "text-7xl", size: "4.5rem", lineHeight: "1", px: "72px" },
  { name: "text-8xl", size: "6rem", lineHeight: "1", px: "96px" },
  { name: "text-9xl", size: "8rem", lineHeight: "1", px: "128px" },
];

const fontWeights = [
  { name: "font-thin", value: "100" },
  { name: "font-extralight", value: "200" },
  { name: "font-light", value: "300" },
  { name: "font-normal", value: "400" },
  { name: "font-medium", value: "500" },
  { name: "font-semibold", value: "600" },
  { name: "font-bold", value: "700" },
  { name: "font-extrabold", value: "800" },
  { name: "font-black", value: "900" },
];

const borderRadius = [
  { name: "rounded-none", value: "0px" },
  { name: "rounded-sm", value: "0.125rem (2px)" },
  { name: "rounded", value: "0.25rem (4px)" },
  { name: "rounded-md", value: "0.375rem (6px)" },
  { name: "rounded-lg", value: "0.5rem (8px)" },
  { name: "rounded-xl", value: "0.75rem (12px)" },
  { name: "rounded-2xl", value: "1rem (16px)" },
  { name: "rounded-3xl", value: "1.5rem (24px)" },
  { name: "rounded-full", value: "9999px" },
];

export default function DesignTokens() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const copyClass = (className: string) => {
    navigator.clipboard.writeText(className);
    toast({ title: "Copié !", description: `"${className}" copié` });
  };

  const filteredColors = tailwindColors.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Palette className="h-8 w-8 text-primary" />
          Design Tokens
        </h1>
        <p className="text-muted-foreground">
          Référence rapide Tailwind CSS : couleurs, espacements, typographie
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="colors">Tailwind Couleurs</TabsTrigger>
          <TabsTrigger value="bootstrap">Bootstrap</TabsTrigger>
          <TabsTrigger value="css-vars">CSS Variables</TabsTrigger>
          <TabsTrigger value="spacing">Espacements</TabsTrigger>
          <TabsTrigger value="typography">Typographie</TabsTrigger>
          <TabsTrigger value="breakpoints">Breakpoints</TabsTrigger>
          <TabsTrigger value="radius">Border Radius</TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Palette de couleurs Tailwind</CardTitle>
              <CardDescription>Cliquez pour copier la classe</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                  {filteredColors.map((color) => (
                    <div
                      key={color.name}
                      className="cursor-pointer group"
                      onClick={() => copyClass(color.class)}
                    >
                      <div
                        className={`h-16 rounded-lg ${color.class} ${color.textClass || ""} flex items-end p-2 border group-hover:ring-2 ring-primary transition-all`}
                      >
                        <span className="text-xs font-mono opacity-80">{color.name}</span>
                      </div>
                      <div className="text-xs text-center mt-1 text-muted-foreground font-mono">
                        {color.value}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bootstrap">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Palette de couleurs Bootstrap 5</CardTitle>
                <CardDescription>Couleurs sémantiques et palette complète</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                    {bootstrapColors.map((color) => (
                      <div
                        key={color.name}
                        className="cursor-pointer group"
                        onClick={() => copyClass(color.value)}
                      >
                        <div
                          className={`h-16 rounded-lg ${color.class} ${color.textClass || ""} flex items-end p-2 border group-hover:ring-2 ring-primary transition-all`}
                        >
                          <span className="text-xs font-mono opacity-80">{color.name}</span>
                        </div>
                        <div className="text-xs text-center mt-1 text-muted-foreground font-mono">
                          {color.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Espacements Bootstrap</CardTitle>
                  <CardDescription>Échelle de 0 à 5</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bootstrapSpacing.map((space) => (
                      <div
                        key={space.name}
                        className="flex items-center gap-4 p-2 rounded hover:bg-muted cursor-pointer"
                        onClick={() => copyClass(`p-${space.name}`)}
                      >
                        <Badge variant="outline" className="w-12 justify-center font-mono">{space.name}</Badge>
                        <div className="w-20 h-4 bg-[#0d6efd] rounded" style={{ width: Math.min(parseInt(space.px), 100) }} />
                        <span className="text-sm font-mono text-muted-foreground">{space.value}</span>
                        <span className="text-sm text-muted-foreground">({space.px})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Breakpoints Bootstrap</CardTitle>
                  <CardDescription>Points de rupture responsive</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bootstrapBreakpoints.map((bp) => (
                      <div
                        key={bp.name}
                        className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted"
                        onClick={() => copyClass(bp.name)}
                      >
                        <Badge className="font-mono bg-[#0d6efd]">{bp.name}</Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{bp.description}</p>
                          <p className="text-xs text-muted-foreground">{bp.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="css-vars">
          <Card>
            <CardHeader>
              <CardTitle>CSS Custom Properties</CardTitle>
              <CardDescription>Variables CSS natives pour un theming flexible</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-400px)]">
                {["Couleurs", "Espacements", "Typographie", "Bordures", "Ombres", "Animations", "Z-Index"].map((category) => {
                  const categoryVars = cssCustomProperties.filter((v) => v.category === category);
                  if (categoryVars.length === 0) return null;
                  return (
                    <div key={category} className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Badge variant="outline">{category}</Badge>
                      </h3>
                      <div className="space-y-2">
                        {categoryVars.map((cssVar) => (
                          <div
                            key={cssVar.name}
                            className="flex items-center gap-4 p-3 rounded-lg border cursor-pointer hover:bg-muted group"
                            onClick={() => copyClass(`var(${cssVar.name})`)}
                          >
                            <code className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                              {cssVar.name}
                            </code>
                            {category === "Couleurs" && cssVar.value.startsWith("#") && (
                              <div 
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: cssVar.value }}
                              />
                            )}
                            <span className="text-sm font-mono text-muted-foreground">{cssVar.value}</span>
                            <span className="text-sm text-muted-foreground flex-1">{cssVar.description}</span>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                <Card className="mt-6 bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Exemple d'utilisation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="p-4 bg-[#0d1117] text-white rounded-lg overflow-x-auto text-sm">
                      <code>{`:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --space-md: 1rem;
  --radius-lg: 0.5rem;
}

.button {
  background-color: var(--color-primary);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
}

/* Dark mode override */
[data-theme="dark"] {
  --color-primary: #60a5fa;
  --bg-primary: #0f172a;
}`}</code>
                    </pre>
                  </CardContent>
                </Card>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spacing">
          <Card>
            <CardHeader>
              <CardTitle>Échelle d'espacements</CardTitle>
              <CardDescription>Padding, margin, gap, width, height</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-2">
                  {tailwindSpacing.map((space) => (
                    <div
                      key={space.name}
                      className="flex items-center gap-4 p-2 rounded hover:bg-muted cursor-pointer"
                      onClick={() => copyClass(`p-${space.name}`)}
                    >
                      <Badge variant="outline" className="w-16 justify-center font-mono">{space.name}</Badge>
                      <div className="w-20 h-4 bg-primary rounded" style={{ width: Math.min(parseInt(space.px), 200) }} />
                      <span className="text-sm font-mono text-muted-foreground">{space.value}</span>
                      <span className="text-sm text-muted-foreground">({space.px})</span>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tailles de texte</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {typography.map((typo) => (
                      <div
                        key={typo.name}
                        className="flex items-baseline gap-4 cursor-pointer hover:bg-muted p-2 rounded"
                        onClick={() => copyClass(typo.name)}
                      >
                        <Badge variant="outline" className="font-mono shrink-0">{typo.name}</Badge>
                        <span className={typo.name}>Aa Bb Cc</span>
                        <span className="text-xs text-muted-foreground ml-auto">{typo.px}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Font Weights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fontWeights.map((fw) => (
                    <div
                      key={fw.name}
                      className="flex items-center gap-4 cursor-pointer hover:bg-muted p-2 rounded"
                      onClick={() => copyClass(fw.name)}
                    >
                      <Badge variant="outline" className="font-mono">{fw.name}</Badge>
                      <span className={fw.name}>The quick brown fox</span>
                      <span className="text-xs text-muted-foreground ml-auto">{fw.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakpoints">
          <Card>
            <CardHeader>
              <CardTitle>Breakpoints Responsive</CardTitle>
              <CardDescription>Points de rupture pour le design responsive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {breakpoints.map((bp) => (
                  <div
                    key={bp.name}
                    className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted"
                    onClick={() => copyClass(`${bp.name}:`)}
                  >
                    <Badge className="text-lg font-mono">{bp.name}:</Badge>
                    <div className="flex-1">
                      <p className="font-medium">{bp.description}</p>
                      <p className="text-sm text-muted-foreground">min-width: {bp.value}</p>
                    </div>
                    <div className="h-4 bg-primary/20 rounded" style={{ width: `${parseInt(bp.value) / 10}px` }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radius">
          <Card>
            <CardHeader>
              <CardTitle>Border Radius</CardTitle>
              <CardDescription>Classes d'arrondi des coins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {borderRadius.map((br) => (
                  <div
                    key={br.name}
                    className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted"
                    onClick={() => copyClass(br.name)}
                  >
                    <div className={`w-16 h-16 bg-primary ${br.name}`} />
                    <div>
                      <Badge variant="outline" className="font-mono">{br.name}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">{br.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
