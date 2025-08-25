import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
  className?: string;
  showTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  format?: string;
  locale?: string;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  disabled = false,
  error,
  size = 'md',
  variant = 'default',
  className,
  showTime = false,
  minDate,
  maxDate,
  disabledDates = [],
  format = showTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [selectedTime, setSelectedTime] = useState({
    hours: value?.getHours() || 0,
    minutes: value?.getMinutes() || 0,
  });
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    if (showTime) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    return `${day}/${month}/${year}`;
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    return disabledDates.some(disabledDate => 
      date.toDateString() === disabledDate.toDateString()
    );
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    const newDate = new Date(date);
    if (showTime) {
      newDate.setHours(selectedTime.hours, selectedTime.minutes);
    }
    
    onChange?.(newDate);
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const handleTimeChange = (type: 'hours' | 'minutes', value: number) => {
    const newTime = { ...selectedTime, [type]: value };
    setSelectedTime(newTime);
    
    if (value) {
      const newDate = new Date(value);
      newDate.setHours(newTime.hours, newTime.minutes);
      onChange?.(newDate);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setFullYear(newMonth.getFullYear() - 1);
    } else {
      newMonth.setFullYear(newMonth.getFullYear() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getDaysInMonth = (): (Date | null)[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: (Date | null)[] = [];
    
    // Add days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    if (!value) return false;
    return date.toDateString() === value.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const variantClasses = {
    default: 'bg-white border-gray-300',
    filled: 'bg-gray-50 border-gray-200',
  };

  const inputClasses = cn(
    'relative w-full border rounded-md shadow-sm cursor-pointer transition-colors',
    'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
    sizeClasses[size],
    variantClasses[variant],
    disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
    error && 'border-red-300 focus-within:ring-red-500 focus-within:border-red-500',
    className
  );

  return (
    <div ref={datePickerRef} className="relative">
      <div
        className={inputClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className={cn(
            value ? 'text-gray-900' : 'text-gray-500'
          )}>
            {value ? formatDate(value) : placeholder}
          </span>
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 min-w-[280px]">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateYear('prev')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
            </div>
            
            <div className="text-sm font-medium">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
              <button
                onClick={() => navigateYear('next')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500 text-center p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              if (!date) return <div key={index} />;
              
              const disabled = isDateDisabled(date);
              const selected = isSelected(date);
              const today = isToday(date);
              const currentMonthDay = isCurrentMonth(date);
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={disabled}
                  className={cn(
                    'p-2 text-sm rounded hover:bg-gray-100 transition-colors',
                    !currentMonthDay && 'text-gray-400',
                    today && 'bg-blue-100 text-blue-900',
                    selected && 'bg-blue-600 text-white hover:bg-blue-700',
                    disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Time Picker */}
          {showTime && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Horário</span>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={selectedTime.hours}
                  onChange={(e) => handleTimeChange('hours', Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                
                <span className="text-gray-500">:</span>
                
                <select
                  value={selectedTime.minutes}
                  onChange={(e) => handleTimeChange('minutes', Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                onChange?.(null);
                setIsOpen(false);
              }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Limpar
            </button>
            
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;