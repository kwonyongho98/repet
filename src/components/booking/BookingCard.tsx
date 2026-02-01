import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  Star,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '../common';
import type { Booking } from '../../types/booking';
import { 
  BOOKING_STATUS_LABELS, 
  BOOKING_STATUS_COLORS,
  formatBookingDateRange,
  formatBookingTimeRange,
  canWriteReview,
} from '../../types/booking';
import { serviceTypeConfig } from '../../types/provider';

// ============================================
// BookingCard Component
// ============================================

interface BookingCardProps {
  booking: Booking;
  onClick?: () => void;
  showProvider?: boolean;  // 업체 정보 표시 (고객용)
  showPet?: boolean;       // 펫 정보 표시 (업체용)
  compact?: boolean;       // 간략 표시
}

export default function BookingCard({
  booking,
  onClick,
  showProvider = true,
  showPet = true,
  compact = false,
}: BookingCardProps) {
  const statusColors = BOOKING_STATUS_COLORS[booking.status];
  const statusLabel = BOOKING_STATUS_LABELS[booking.status];
  
  // 서비스 타입 아이콘 & 색상
  const serviceConfig = booking.provider?.type 
    ? serviceTypeConfig[booking.provider.type]
    : null;

  const ServiceIcon = serviceConfig?.icon;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700
        overflow-hidden transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-orange-200 dark:hover:border-orange-700' : ''}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-50 dark:border-slate-700">
        <div className="flex items-start justify-between gap-3">
          {/* Service Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icon */}
            {ServiceIcon && (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${serviceConfig?.color}20` }}
              >
                <ServiceIcon size={20} style={{ color: serviceConfig?.color }} />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {booking.serviceName}
              </h3>
              {showProvider && booking.provider && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {booking.provider.name}
                </p>
              )}
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`
            px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap
            ${statusColors.bg} ${statusColors.text}
          `}>
            {statusLabel}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-200">
            {formatBookingDateRange(booking)}
          </span>
          {booking.startTime && (
            <>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <Clock size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-200">
                {formatBookingTimeRange(booking)}
              </span>
            </>
          )}
        </div>
        
        {/* Pet Info */}
        {showPet && booking.pet && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">🐾</span>
            <span className="text-gray-700 dark:text-gray-200">
              {booking.pet.name}
            </span>
            <span className="text-gray-400 dark:text-gray-500">
              ({booking.pet.species} · {booking.pet.breed})
            </span>
          </div>
        )}
        
        {/* Location (Provider) */}
        {showProvider && booking.provider?.address && !compact && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-500 dark:text-gray-400 truncate">
              {booking.provider.address}
            </span>
          </div>
        )}
        
        {/* Special Requests */}
        {booking.specialRequests && !compact && (
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600 dark:text-gray-300 line-clamp-2">
              {booking.specialRequests}
            </span>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 flex items-center justify-between">
        {/* Price */}
        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">금액</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
            {booking.price.toLocaleString()}원
          </span>
        </div>
        
        {/* Review / Action Hint */}
        <div className="flex items-center gap-2">
          {booking.review && (
            <div className="flex items-center gap-1 text-sm text-yellow-500">
              <Star size={14} fill="currentColor" />
              <span>{booking.review.rating}</span>
            </div>
          )}
          {canWriteReview(booking) && (
            <span className="text-xs text-orange-500 font-medium">
              리뷰 작성하기
            </span>
          )}
          {onClick && (
            <ChevronRight size={18} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// BookingCardSkeleton
// ============================================

export function BookingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-50 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-600" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-200 dark:bg-slate-600 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-100 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-slate-600 rounded-full" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 w-48 bg-gray-100 dark:bg-slate-700 rounded" />
        <div className="h-4 w-36 bg-gray-100 dark:bg-slate-700 rounded" />
      </div>
      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 flex justify-between">
        <div className="h-4 w-20 bg-gray-200 dark:bg-slate-600 rounded" />
        <div className="h-4 w-16 bg-gray-200 dark:bg-slate-600 rounded" />
      </div>
    </div>
  );
}
