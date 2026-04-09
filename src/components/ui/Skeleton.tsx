import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx("skeleton rounded-lg", className)}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-kanban-card border border-kanban-border rounded-xl p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 mt-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function ColumnSkeleton() {
  return (
    <div className="flex-shrink-0 w-72 space-y-3">
      <Skeleton className="h-8 w-40" />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function BoardCardSkeleton() {
  return (
    <div className="bg-kanban-card border border-kanban-border rounded-2xl p-6 space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-56" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
