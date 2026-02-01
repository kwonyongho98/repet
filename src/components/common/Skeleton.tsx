import React from 'react';

// ============================================
// Skeleton Loading Components
// ============================================

interface SkeletonProps {
  className?: string;
}

// Base Skeleton
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-slate-700 rounded ${className}`}
    />
  );
}

// Card Skeleton
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

// Photo Grid Skeleton
export function SkeletonPhotoGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton key={idx} className="aspect-square rounded-lg" />
      ))}
    </div>
  );
}

// List Skeleton
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

// Care Note Skeleton
export function SkeletonCareNote() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Profile Skeleton
export function SkeletonProfile() {
  return (
    <div className="flex flex-col items-center py-8">
      <Skeleton className="w-24 h-24 rounded-full mb-4" />
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

// Pet Card Skeleton
export function SkeletonPetCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Feed Item Skeleton
export function SkeletonFeedItem() {
  return (
    <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// Calendar Skeleton
export function SkeletonCalendar() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-24" />
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, idx) => (
          <Skeleton key={`header-${idx}`} className="h-8 rounded" />
        ))}
        {Array.from({ length: 35 }).map((_, idx) => (
          <Skeleton key={`day-${idx}`} className="h-10 rounded" />
        ))}
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function SkeletonStatsCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-8 w-24 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

// Full Page Loading Skeleton
export function SkeletonPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <SkeletonList count={4} />
    </div>
  );
}
