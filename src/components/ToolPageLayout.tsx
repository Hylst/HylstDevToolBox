import { ReactNode } from "react";

interface ToolPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Simple title+description wrapper for tool pages.
 * Breadcrumbs, favorites, and prev/next nav are handled by ToolRouteShell at the route level.
 */
export function ToolPageLayout({ title, description, children }: ToolPageLayoutProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
