import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Move, Hand } from 'lucide-react';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

interface GestureState {
  scale: number;
  rotation: number;
  translateX: number;
  translateY: number;
  isDragging: boolean;
  isPinching: boolean;
  isRotating: boolean;
}

interface TouchGesturesProps {
  children: React.ReactNode;
  onGestureChange?: (state: GestureState) => void;
  minScale?: number;
  maxScale?: number;
  enablePinch?: boolean;
  enableRotation?: boolean;
  enableDrag?: boolean;
  className?: string;
}

export default function TouchGestures({
  children,
  onGestureChange,
  minScale = 0.5,
  maxScale = 3.0,
  enablePinch = true,
  enableRotation = true,
  enableDrag = true,
  className = ''
}: TouchGesturesProps) {
  const [gestureState, setGestureState] = useState<GestureState>({
    scale: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0,
    isDragging: false,
    isPinching: false,
    isRotating: false
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const touchesRef = useRef<TouchPoint[]>([]);
  const lastDistanceRef = useRef<number>(0);
  const lastAngleRef = useRef<number>(0);
  const lastCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const calculateDistance = (touch1: TouchPoint, touch2: TouchPoint): number => {
    const dx = touch1.x - touch2.x;
    const dy = touch1.y - touch2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const calculateAngle = (touch1: TouchPoint, touch2: TouchPoint): number => {
    return Math.atan2(touch2.y - touch1.y, touch2.x - touch1.x) * (180 / Math.PI);
  };

  const calculateCenter = (touch1: TouchPoint, touch2: TouchPoint): { x: number; y: number } => {
    return {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2
    };
  };

  const getTouchPoints = (event: TouchEvent): TouchPoint[] => {
    return Array.from(event.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY
    }));
  };

  const updateGestureState = useCallback((updates: Partial<GestureState>) => {
    setGestureState(prev => {
      const newState = { ...prev, ...updates };
      onGestureChange?.(newState);
      return newState;
    });
  }, [onGestureChange]);

  const handleTouchStart = (event: React.TouchEvent) => {
    event.preventDefault();
    const touchPoints = getTouchPoints(event.nativeEvent);
    touchesRef.current = touchPoints;

    if (touchPoints.length === 1 && enableDrag) {
      // Single touch - start dragging
      updateGestureState({ isDragging: true });
      lastCenterRef.current = { x: touchPoints[0].x, y: touchPoints[0].y };
    } else if (touchPoints.length === 2) {
      // Two touches - start pinch/rotate
      const distance = calculateDistance(touchPoints[0], touchPoints[1]);
      const angle = calculateAngle(touchPoints[0], touchPoints[1]);
      const center = calculateCenter(touchPoints[0], touchPoints[1]);

      lastDistanceRef.current = distance;
      lastAngleRef.current = angle;
      lastCenterRef.current = center;

      if (enablePinch) {
        updateGestureState({ isPinching: true });
      }
      if (enableRotation) {
        updateGestureState({ isRotating: true });
      }
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault();
    const touchPoints = getTouchPoints(event.nativeEvent);

    if (touchPoints.length === 1 && gestureState.isDragging && enableDrag) {
      // Single touch drag
      const deltaX = touchPoints[0].x - lastCenterRef.current.x;
      const deltaY = touchPoints[0].y - lastCenterRef.current.y;

      updateGestureState({
        translateX: gestureState.translateX + deltaX,
        translateY: gestureState.translateY + deltaY
      });

      lastCenterRef.current = { x: touchPoints[0].x, y: touchPoints[0].y };
    } else if (touchPoints.length === 2) {
      // Two touch gestures
      const distance = calculateDistance(touchPoints[0], touchPoints[1]);
      const angle = calculateAngle(touchPoints[0], touchPoints[1]);
      const center = calculateCenter(touchPoints[0], touchPoints[1]);

      if (enablePinch && gestureState.isPinching) {
        // Pinch to zoom
        const scaleChange = distance / lastDistanceRef.current;
        const newScale = Math.max(minScale, Math.min(maxScale, gestureState.scale * scaleChange));
        
        updateGestureState({ scale: newScale });
        lastDistanceRef.current = distance;
      }

      if (enableRotation && gestureState.isRotating) {
        // Rotation
        const angleDelta = angle - lastAngleRef.current;
        let rotationDelta = angleDelta;

        // Handle angle wraparound
        if (angleDelta > 180) {
          rotationDelta = angleDelta - 360;
        } else if (angleDelta < -180) {
          rotationDelta = angleDelta + 360;
        }

        updateGestureState({
          rotation: gestureState.rotation + rotationDelta
        });

        lastAngleRef.current = angle;
      }

      // Update translation based on center movement
      if (enableDrag) {
        const deltaX = center.x - lastCenterRef.current.x;
        const deltaY = center.y - lastCenterRef.current.y;

        updateGestureState({
          translateX: gestureState.translateX + deltaX,
          translateY: gestureState.translateY + deltaY
        });

        lastCenterRef.current = center;
      }
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const remainingTouches = event.touches.length;

    if (remainingTouches === 0) {
      // All touches ended
      updateGestureState({
        isDragging: false,
        isPinching: false,
        isRotating: false
      });
    } else if (remainingTouches === 1) {
      // From two touches to one touch
      updateGestureState({
        isPinching: false,
        isRotating: false,
        isDragging: true
      });

      const touchPoints = getTouchPoints(event.nativeEvent);
      lastCenterRef.current = { x: touchPoints[0].x, y: touchPoints[0].y };
    }
  };

  const resetGestures = () => {
    setGestureState({
      scale: 1,
      rotation: 0,
      translateX: 0,
      translateY: 0,
      isDragging: false,
      isPinching: false,
      isRotating: false
    });
  };

  const zoomIn = () => {
    const newScale = Math.min(maxScale, gestureState.scale * 1.2);
    updateGestureState({ scale: newScale });
  };

  const zoomOut = () => {
    const newScale = Math.max(minScale, gestureState.scale / 1.2);
    updateGestureState({ scale: newScale });
  };

  const rotate90 = () => {
    updateGestureState({ rotation: gestureState.rotation + 90 });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Gesture Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-gray-600 dark:text-dark-400" />
        </button>
        
        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-gray-600 dark:text-dark-400" />
        </button>
        
        {enableRotation && (
          <button
            onClick={rotate90}
            className="w-10 h-10 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
            aria-label="Rotate 90 degrees"
          >
            <RotateCw className="w-5 h-5 text-gray-600 dark:text-dark-400" />
          </button>
        )}
        
        <button
          onClick={resetGestures}
          className="w-10 h-10 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          aria-label="Reset"
        >
          <Hand className="w-5 h-5 text-gray-600 dark:text-dark-400" />
        </button>
      </div>

      {/* Gesture Indicator */}
      {(gestureState.isDragging || gestureState.isPinching || gestureState.isRotating) && (
        <div className="absolute top-4 left-4 z-10 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg shadow-sm px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-400">
            {gestureState.isDragging && (
              <>
                <Move className="w-4 h-4" />
                <span>Arrastando</span>
              </>
            )}
            {gestureState.isPinching && (
              <>
                <ZoomIn className="w-4 h-4" />
                <span>Zoom: {gestureState.scale.toFixed(1)}x</span>
              </>
            )}
            {gestureState.isRotating && (
              <>
                <RotateCw className="w-4 h-4" />
                <span>Rotação: {Math.round(gestureState.rotation)}°</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content Container */}
      <div
        ref={containerRef}
        className="touch-none select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translate(${gestureState.translateX}px, ${gestureState.translateY}px) scale(${gestureState.scale}) rotate(${gestureState.rotation}deg)`,
          transformOrigin: 'center center',
          transition: gestureState.isDragging || gestureState.isPinching || gestureState.isRotating ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Example usage component
export function TouchGesturesExample() {
  const [gestureInfo, setGestureInfo] = useState<GestureState | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Touch Gestures Demo
        </h3>
        <p className="text-sm text-gray-600 dark:text-dark-400">
          Use touch gestures: pinch to zoom, rotate with two fingers, drag to move
        </p>
      </div>

      {gestureInfo && (
        <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500 dark:text-dark-400">Scale:</span> {gestureInfo.scale.toFixed(2)}x
            </div>
            <div>
              <span className="text-gray-500 dark:text-dark-400">Rotation:</span> {Math.round(gestureInfo.rotation)}°
            </div>
            <div>
              <span className="text-gray-500 dark:text-dark-400">X:</span> {Math.round(gestureInfo.translateX)}px
            </div>
            <div>
              <span className="text-gray-500 dark:text-dark-400">Y:</span> {Math.round(gestureInfo.translateY)}px
            </div>
          </div>
        </div>
      )}

      <TouchGestures
        onGestureChange={setGestureInfo}
        className="h-96 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg overflow-hidden"
      >
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hand className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-semibold mb-2">Touch Me!</h4>
            <p className="text-sm opacity-80">
              Pinch, rotate, and drag this element
            </p>
          </div>
        </div>
      </TouchGestures>
    </div>
  );
}