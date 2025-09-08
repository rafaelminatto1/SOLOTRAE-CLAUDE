import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Archive, Star, Edit, MoreHorizontal } from 'lucide-react';

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  action: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipe?: (direction: 'left' | 'right', actionId?: string) => void;
  className?: string;
  disabled?: boolean;
}

const colorClasses = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  yellow: 'bg-yellow-500 text-white',
  red: 'bg-red-500 text-white',
  gray: 'bg-gray-500 text-white'
};

export default function SwipeableCard({ 
  children, 
  leftActions = [], 
  rightActions = [], 
  onSwipe,
  className = '',
  disabled = false 
}: SwipeableCardProps) {
  const [isSweping, setIsSweping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const SWIPE_THRESHOLD = 80;
  const MAX_SWIPE = 200;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    setIsSweping(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;

    const touch = e.touches[0];
    setCurrentX(touch.clientX);
    
    const distance = touch.clientX - startX;
    const clampedDistance = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, distance));
    setSwipeDistance(clampedDistance);
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;

    setIsDragging(false);
    const distance = currentX - startX;
    
    // Check if swipe threshold is met
    if (Math.abs(distance) > SWIPE_THRESHOLD) {
      const direction = distance > 0 ? 'right' : 'left';
      const actions = direction === 'left' ? leftActions : rightActions;
      
      if (actions.length > 0) {
        // If there's only one action, execute it
        if (actions.length === 1) {
          actions[0].action();
          onSwipe?.(direction, actions[0].id);
        } else {
          // Multiple actions - show action menu or execute first one
          actions[0].action();
          onSwipe?.(direction, actions[0].id);
        }
      }
    }
    
    // Reset position
    setTimeout(() => {
      setSwipeDistance(0);
      setIsSweping(false);
    }, 200);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    setIsSweping(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return;

    setCurrentX(e.clientX);
    
    const distance = e.clientX - startX;
    const clampedDistance = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, distance));
    setSwipeDistance(clampedDistance);
  };

  const handleMouseUp = () => {
    if (!isDragging || disabled) return;

    setIsDragging(false);
    const distance = currentX - startX;
    
    if (Math.abs(distance) > SWIPE_THRESHOLD) {
      const direction = distance > 0 ? 'right' : 'left';
      const actions = direction === 'left' ? leftActions : rightActions;
      
      if (actions.length > 0) {
        if (actions.length === 1) {
          actions[0].action();
          onSwipe?.(direction, actions[0].id);
        } else {
          actions[0].action();
          onSwipe?.(direction, actions[0].id);
        }
      }
    }
    
    setTimeout(() => {
      setSwipeDistance(0);
      setIsSweping(false);
    }, 200);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX, currentX]);

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    const isVisible = side === 'left' ? swipeDistance < -SWIPE_THRESHOLD : swipeDistance > SWIPE_THRESHOLD;
    const actionWidth = MAX_SWIPE / actions.length;
    
    return actions.map((action, index) => {
      const Icon = action.icon;
      const position = side === 'left' 
        ? { right: `${actionWidth * (actions.length - index)}px` }
        : { left: `${actionWidth * (actions.length - index)}px` };
      
      return (
        <div
          key={action.id}
          className={`absolute top-0 h-full flex items-center justify-center transition-all duration-200 ${
            colorClasses[action.color]
          }`}
          style={{
            width: `${actionWidth}px`,
            ...position,
            opacity: isVisible ? 1 : 0,
            transform: `scale(${isVisible ? 1 : 0.8})`
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{action.label}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Actions */}
      <div className="absolute inset-0">
        {leftActions.length > 0 && renderActions(leftActions, 'left')}
        {rightActions.length > 0 && renderActions(rightActions, 'right')}
      </div>
      
      {/* Card Content */}
      <div
        ref={cardRef}
        className={`relative bg-white dark:bg-dark-800 transition-transform duration-200 ${
          isDragging ? '' : 'ease-out'
        } ${disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        style={{
          transform: `translateX(${swipeDistance}px)`,
          zIndex: 1
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  );
}

// Preset action configurations
export const SwipeActions = {
  delete: (onDelete: () => void): SwipeAction => ({
    id: 'delete',
    label: 'Excluir',
    icon: Trash2,
    color: 'red',
    action: onDelete
  }),
  
  archive: (onArchive: () => void): SwipeAction => ({
    id: 'archive',
    label: 'Arquivar',
    icon: Archive,
    color: 'gray',
    action: onArchive
  }),
  
  star: (onStar: () => void): SwipeAction => ({
    id: 'star',
    label: 'Favorito',
    icon: Star,
    color: 'yellow',
    action: onStar
  }),
  
  edit: (onEdit: () => void): SwipeAction => ({
    id: 'edit',
    label: 'Editar',
    icon: Edit,
    color: 'blue',
    action: onEdit
  }),
  
  more: (onMore: () => void): SwipeAction => ({
    id: 'more',
    label: 'Mais',
    icon: MoreHorizontal,
    color: 'gray',
    action: onMore
  })
};

// Example usage component
export function SwipeableCardExample() {
  const [items, setItems] = useState([
    { id: 1, title: 'Item 1', starred: false },
    { id: 2, title: 'Item 2', starred: true },
    { id: 3, title: 'Item 3', starred: false }
  ]);

  const handleDelete = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleStar = (id: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, starred: !item.starred } : item
    ));
  };

  return (
    <div className="space-y-2">
      {items.map(item => (
        <SwipeableCard
          key={item.id}
          leftActions={[SwipeActions.delete(() => handleDelete(item.id))]}
          rightActions={[SwipeActions.star(() => handleStar(item.id))]}
          className="border border-gray-200 dark:border-dark-600 rounded-lg"
        >
          <div className="p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
              {item.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
            </div>
            <p className="text-sm text-gray-600 dark:text-dark-400 mt-1">
              Deslize para a esquerda para excluir ou para a direita para favoritar
            </p>
          </div>
        </SwipeableCard>
      ))}
    </div>
  );
}