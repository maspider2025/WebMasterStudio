import { useState, useCallback, useEffect } from 'react';
import { useEditorStore, Element } from '@/lib/editor-store';

interface UseCanvasOperationsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const useCanvasOperations = ({ canvasRef }: UseCanvasOperationsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null>(null);
  
  const { 
    elements, 
    selectedElementId, 
    selectElement, 
    updateElementPosition,
    createSnapshot
  } = useEditorStore();
  
  // Handle multi-selection
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  
  // Pan the canvas
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
  // Zoom level for the canvas
  const [zoom, setZoom] = useState(100);
  
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Delete selected element(s)
    if (e.key === 'Delete' && selectedElementId) {
      // deleteElement(selectedElementId);
    }
    
    // Copy element - Ctrl+C
    if (e.key === 'c' && (e.ctrlKey || e.metaKey) && selectedElementId) {
      // copyElement(selectedElementId);
    }
    
    // Paste element - Ctrl+V
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      // pasteElement();
    }
    
    // Undo - Ctrl+Z
    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      // undo();
    }
    
    // Redo - Ctrl+Shift+Z or Ctrl+Y
    if ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) || 
        (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      // redo();
    }
    
    // Select all - Ctrl+A
    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      // selectAllElements();
    }
    
    // Group elements - Ctrl+G
    if (e.key === 'g' && (e.ctrlKey || e.metaKey) && selectedElements.length > 1) {
      e.preventDefault();
      // groupElements(selectedElements);
    }
    
    // Ungroup elements - Ctrl+Shift+G
    if (e.key === 'g' && (e.ctrlKey || e.metaKey) && e.shiftKey && selectedElementId) {
      e.preventDefault();
      // ungroupElement(selectedElementId);
    }
    
    // Arrow keys to move selected elements
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElementId) {
      e.preventDefault();
      
      const element = elements.find(el => el.id === selectedElementId);
      if (!element) return;
      
      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;
      
      switch (e.key) {
        case 'ArrowUp':
          dy = -step;
          break;
        case 'ArrowDown':
          dy = step;
          break;
        case 'ArrowLeft':
          dx = -step;
          break;
        case 'ArrowRight':
          dx = step;
          break;
      }
      
      updateElementPosition(selectedElementId, dx, dy);
    }
  }, [selectedElementId, elements, selectedElements, updateElementPosition]);
  
  // Start canvas drag selection
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      if (e.button === 0) { // Left click
        // Start drawing selection box
        setStartPos({
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        });
        setIsDragging(true);
        setSelectionBox({
          startX: e.nativeEvent.offsetX,
          startY: e.nativeEvent.offsetY,
          width: 0,
          height: 0,
        });
        
        // Clear selection if not holding shift
        if (!e.shiftKey) {
          selectElement(null);
          setSelectedElements([]);
        }
      } else if (e.button === 1 || e.button === 2) { // Middle or right click
        // Start panning
        setIsPanning(true);
        setStartPos({
          x: e.clientX,
          y: e.clientY,
        });
      }
    }
  }, [canvasRef, selectElement]);
  
  // Update selection box while dragging
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && selectionBox) {
      const currentX = e.nativeEvent.offsetX;
      const currentY = e.nativeEvent.offsetY;
      
      setSelectionBox({
        startX: selectionBox.startX,
        startY: selectionBox.startY,
        width: currentX - selectionBox.startX,
        height: currentY - selectionBox.startY,
      });
    } else if (isPanning) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      
      setPanOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      
      setStartPos({
        x: e.clientX,
        y: e.clientY,
      });
    }
  }, [isDragging, isPanning, selectionBox, startPos]);
  
  // End selection or panning
  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDragging && selectionBox) {
      // Normalize selection box coordinates (handle negative dimensions)
      const normalizedBox = {
        x: selectionBox.width >= 0 ? selectionBox.startX : selectionBox.startX + selectionBox.width,
        y: selectionBox.height >= 0 ? selectionBox.startY : selectionBox.startY + selectionBox.height,
        width: Math.abs(selectionBox.width),
        height: Math.abs(selectionBox.height),
      };
      
      // Find elements within selection box
      const selectedIds = elements.filter(element => {
        return (
          element.x < normalizedBox.x + normalizedBox.width &&
          element.x + element.width > normalizedBox.x &&
          element.y < normalizedBox.y + normalizedBox.height &&
          element.y + element.height > normalizedBox.y
        );
      }).map(el => el.id);
      
      if (selectedIds.length === 1) {
        selectElement(selectedIds[0]);
      } else if (selectedIds.length > 1) {
        setSelectedElements(selectedIds);
      }
      
      // Clear selection box
      setSelectionBox(null);
    }
    
    setIsDragging(false);
    setIsPanning(false);
    
    // Create a snapshot for history if elements have moved
    createSnapshot();
  }, [isDragging, isPanning, selectionBox, elements, selectElement, createSnapshot]);
  
  // Handle zooming with mouse wheel
  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? -5 : 5;
      const newZoom = Math.max(25, Math.min(200, zoom + delta));
      
      setZoom(newZoom);
    }
  }, [zoom]);
  
  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  return {
    isDragging,
    selectionBox,
    panOffset,
    zoom,
    selectedElements,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasWheel,
    setZoom,
  };
};
