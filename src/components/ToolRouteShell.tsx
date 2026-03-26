import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight, Home, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getToolContext } from "@/lib/tool-registry";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { ToolInfoModal } from "@/components/ToolInfoModal";
import { usePresentation } from "@/contexts/PresentationContext";
import { Expand, Shrink } from "lucide-react";

export function ToolRouteShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const { isPresenting, togglePresentation } = usePresentation();
  const ctx = getToolContext(location.pathname);
  const fav = isFavorite(location.pathname);
  const [infoOpen, setInfoOpen] = useState(false);

  // Global shortcuts for prev/next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "ArrowLeft" && ctx?.prev) {
        e.preventDefault();
        navigate(ctx.prev.url);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "ArrowRight" && ctx?.next) {
        e.preventDefault();
        navigate(ctx.next.url);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ctx, navigate]);

  if (!ctx) return <Outlet />;

  return (
    <div className="container mx-auto px-4 pt-4 max-w-7xl">
      {/* Breadcrumb + Info + Favorite */}
      <div className="flex items-center justify-between mb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={() => navigate("/")}>
                <Home className="h-3.5 w-3.5" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer text-muted-foreground">
                {ctx.category}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{ctx.tool.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={togglePresentation}
            title={isPresenting ? "Quitter le plein écran" : "Mode présentation"}
          >
            {isPresenting ? (
              <Shrink className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Expand className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setInfoOpen(true)}
            title="Infos sur cet outil"
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toggleFavorite(location.pathname)}
          >
            <Star
              className={`h-4 w-4 ${fav ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
            />
          </Button>
        </div>
      </div>

      {/* Tool info modal */}
      <ToolInfoModal open={infoOpen} onOpenChange={setInfoOpen} tool={ctx.tool} />

      {/* Page content */}
      <Outlet />

      {/* Prev / Next navigation */}
      {(ctx.prev || ctx.next) && (
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between pt-8 border-t border-border mt-8 pb-8">
            {ctx.prev ? (
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => navigate(ctx.prev!.url)}
              >
                <ChevronLeft className="h-4 w-4" />
                {ctx.prev.title}
              </Button>
            ) : (
              <div />
            )}
            {ctx.next ? (
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => navigate(ctx.next!.url)}
              >
                {ctx.next.title}
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
