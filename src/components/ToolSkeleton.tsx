import { Skeleton } from "@/components/ui/skeleton";

export function ToolSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      {/* Title */}
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-96" />
      {/* Content blocks */}
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
