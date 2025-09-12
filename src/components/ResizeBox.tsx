import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface ResizeState {
  isResizing: boolean;
  direction: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

export interface UseResizeOptions {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  onResize?: (width: number, height: number) => void;
  onResizeEnd?: (width: number, height: number) => void;
}

export const useResize = (options: UseResizeOptions = {}) => {
  const {
    minWidth = 100,
    maxWidth = Infinity,
    minHeight = 100,
    maxHeight = Infinity,
    onResize,
    onResizeEnd
  } = options;

  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    direction: '',
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  const elementRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();

    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    
    setResizeState({
      isResizing: true,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
    });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeState.isResizing || !elementRef.current) return;

    const deltaX = e.clientX - resizeState.startX;
    const deltaY = e.clientY - resizeState.startY;

    let newWidth = resizeState.startWidth;
    let newHeight = resizeState.startHeight;

    // Calculate new dimensions based on resize direction
    switch (resizeState.direction) {
      case 'e':
        newWidth = Math.max(minWidth, Math.min(maxWidth, resizeState.startWidth + deltaX));
        break;
      case 'w':
        newWidth = Math.max(minWidth, Math.min(maxWidth, resizeState.startWidth - deltaX));
        break;
      case 's':
        newHeight = Math.max(minHeight, Math.min(maxHeight, resizeState.startHeight + deltaY));
        break;
      case 'n':
        newHeight = Math.max(minHeight, Math.min(maxHeight, resizeState.startHeight - deltaY));
        break;
      case 'se':
        newWidth = Math.max(minWidth, Math.min(maxWidth, resizeState.startWidth + deltaX));
        newHeight = Math.max(minHeight, Math.min(maxHeight, resizeState.startHeight + deltaY));
        break;
      case 'sw':
        newWidth = Math.max(minWidth, Math.min(maxWidth, resizeState.startWidth - deltaX));
        newHeight = Math.max(minHeight, Math.min(maxHeight, resizeState.startHeight + deltaY));
        break;
      case 'ne':
        newWidth = Math.max(minWidth, Math.min(maxWidth, resizeState.startWidth + deltaX));
        newHeight = Math.max(minHeight, Math.min(maxHeight, resizeState.startHeight - deltaY));
        break;
      case 'nw':
        newWidth = Math.max(minWidth, Math.min(maxWidth, resizeState.startWidth - deltaX));
        newHeight = Math.max(minHeight, Math.min(maxHeight, resizeState.startHeight - deltaY));
        break;
    }

    // Apply new dimensions
    elementRef.current.style.width = `${newWidth}px`;
    elementRef.current.style.height = `${newHeight}px`;

    onResize?.(newWidth, newHeight);
  }, [resizeState, minWidth, maxWidth, minHeight, maxHeight, onResize]);

  const handleMouseUp = useCallback(() => {
    if (!resizeState.isResizing || !elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    onResizeEnd?.(rect.width, rect.height);

    setResizeState(prev => ({ ...prev, isResizing: false }));
  }, [resizeState.isResizing, onResizeEnd]);

  useEffect(() => {
    if (resizeState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = `${resizeState.direction}-resize`;
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [resizeState.isResizing, handleMouseMove, handleMouseUp]);

  return {
    elementRef,
    handleResizeStart,
    isResizing: resizeState.isResizing,
  };
};

export interface ResizeHandleProps {
  direction: string;
  onMouseDown: (e: React.MouseEvent, direction: string) => void;
  className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ 
  direction, 
  onMouseDown, 
  className = '' 
}) => {
  const getCursor = () => {
    switch (direction) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
      default:
        return 'default';
    }
  };

  return (
    <div
      className={`resize-handle ${direction} ${className}`}
      onMouseDown={(e) => onMouseDown(e, direction)}
      style={{
        position: 'absolute',
        cursor: getCursor(),
        backgroundColor: 'rgba(0, 123, 255, 0.3)',
        border: '1px solid rgba(0, 123, 255, 0.6)',
        ...(direction === 'n' && { top: '-4px', left: '8px', right: '8px', height: '8px' }),
        ...(direction === 's' && { bottom: '-4px', left: '8px', right: '8px', height: '8px' }),
        ...(direction === 'e' && { right: '-4px', top: '8px', bottom: '8px', width: '8px' }),
        ...(direction === 'w' && { left: '-4px', top: '8px', bottom: '8px', width: '8px' }),
        ...(direction === 'ne' && { top: '-4px', right: '-4px', width: '8px', height: '8px' }),
        ...(direction === 'nw' && { top: '-4px', left: '-4px', width: '8px', height: '8px' }),
        ...(direction === 'se' && { bottom: '-4px', right: '-4px', width: '8px', height: '8px' }),
        ...(direction === 'sw' && { bottom: '-4px', left: '-4px', width: '8px', height: '8px' }),
      }}
    />
  );
};

export interface ResizeBoxProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  showHandles?: boolean;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  onResize?: (width: number, height: number) => void;
  onResizeEnd?: (width: number, height: number) => void;
}

export const ResizeBox: React.FC<ResizeBoxProps> = ({
  children,
  className = '',
  style = {},
  showHandles = true,
  minWidth = 100,
  maxWidth = Infinity,
  minHeight = 100,
  maxHeight = Infinity,
  onResize,
  onResizeEnd,
}) => {
  const { elementRef, handleResizeStart, isResizing } = useResize({
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    onResize,
    onResizeEnd,
  });

  const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  return (
    <div
      ref={elementRef}
      className={`resize-box ${className} ${isResizing ? 'resizing' : ''}`}
      style={{
        position: 'relative',
        minWidth,
        minHeight,
        ...style,
      }}
    >
      {children}
      {showHandles && handles.map((direction) => (
        <ResizeHandle
          key={direction}
          direction={direction}
          onMouseDown={handleResizeStart}
        />
      ))}
    </div>
  );
};