import React from 'react';
import { Skeleton } from './skeleton';
import { Card, CardContent, CardFooter, CardHeader } from './card';

interface SkeletonCardProps {
  headerHeight?: number;
  contentCount?: number;
  footerHeight?: number;
  className?: string;
}

export function SkeletonCard({
  headerHeight = 30,
  contentCount = 3,
  footerHeight = 40,
  className = '',
}: SkeletonCardProps) {
  return (
    <Card className={`w-full ${className}`}>
      {headerHeight > 0 && (
        <CardHeader className="pb-2">
          <Skeleton className={`h-${headerHeight} w-1/2`} />
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {Array(contentCount)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className={`h-4 w-${(i % 3 === 0) ? 'full' : (i % 2 === 0 ? '3/4' : '2/3')}`} />
          ))}
      </CardContent>
      {footerHeight > 0 && (
        <CardFooter>
          <Skeleton className={`h-${footerHeight} w-1/3`} />
        </CardFooter>
      )}
    </Card>
  );
}

interface SkeletonGridProps {
  count?: number;
  columns?: number;
  className?: string;
}

export function SkeletonGrid({
  count = 6,
  columns = 3,
  className = '',
}: SkeletonGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-4 ${className}`}>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <SkeletonCard key={i} />
        ))}
    </div>
  );
}
