import type { ReactNode } from "react";

const renderSkeletons = (remaining: number): ReactNode => {
  if (remaining <= 0) return null;
  return (
    <>
      <span aria-hidden="true" className="block h-64 animate-pulse rounded-2xl bg-slate-800/60" />
      {renderSkeletons(remaining - 1)}
    </>
  );
};

export default function LoadingSkeleton({ count = 3 }: Readonly<{ count?: number }>) {
  const skeletonCount = Math.max(0, Math.floor(count));

  return (
    <output aria-live="polite" className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only absolute">Memuat konten...</span>
      {renderSkeletons(skeletonCount)}
    </output>
  );
}
