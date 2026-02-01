import { useState } from 'react';
import { Check, Clock, Users } from 'lucide-react';
import type { ProviderService } from '../../types/booking';

// ============================================
// ServiceSelector Component
// ============================================

interface ServiceSelectorProps {
  services: ProviderService[];
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
  petSize?: string;
  petSpecies?: string;
}

export default function ServiceSelector({
  services,
  selectedServiceId,
  onSelect,
  petSize,
  petSpecies,
}: ServiceSelectorProps) {
  // 펫에 맞는 서비스만 필터링
  const availableServices = services.filter((service) => {
    if (petSize && !service.petSizeAllowed.includes(petSize as any)) {
      return false;
    }
    if (petSpecies && !service.petSpeciesAllowed.includes(petSpecies as any)) {
      return false;
    }
    return true;
  });

  if (availableServices.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
        <p className="text-gray-500 dark:text-gray-400">
          선택한 반려동물에 맞는 서비스가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {availableServices.map((service) => {
        const isSelected = selectedServiceId === service.id;
        
        return (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={`
              w-full p-4 rounded-xl border-2 text-left transition-all duration-200
              ${isSelected 
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-200 dark:hover:border-slate-600'
              }
            `}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Service Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-semibold ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                    {service.name}
                  </h4>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                
                {service.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {service.description}
                  </p>
                )}
                
                {/* Meta Info */}
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                  {service.durationMinutes && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{service.durationMinutes}분</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>하루 {service.maxDailyBookings}팀</span>
                  </div>
                </div>
              </div>
              
              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-lg ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                  {service.basePrice.toLocaleString()}
                  <span className="text-sm font-normal text-gray-400">원</span>
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
