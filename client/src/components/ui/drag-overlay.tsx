import { useState, useEffect } from "react";
import { useDragLayer } from "react-dnd";

interface DragLayerProps {
  children?: React.ReactNode;
}

const DragOverlay: React.FC<DragLayerProps> = ({ children }) => {
  const { isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  const [showOverlay, setShowOverlay] = useState(false);
  
  useEffect(() => {
    if (isDragging) {
      setShowOverlay(true);
    } else {
      // Small delay to allow for animations to complete
      const timer = setTimeout(() => {
        setShowOverlay(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  if (!isDragging || !showOverlay) {
    return null;
  }

  const transform = calculateTransform(initialOffset, currentOffset);

  return (
    <div
      className="fixed pointer-events-none z-50 top-0 left-0 w-full h-full"
      style={{ zIndex: 1000 }}
    >
      <div
        className="absolute opacity-90 shadow-md transition-transform"
        style={{
          transform,
          WebkitTransform: transform,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Helper functions
function calculateTransform(
  initialOffset: { x: number; y: number } | null,
  currentOffset: { x: number; y: number } | null
) {
  if (!initialOffset || !currentOffset) {
    return 'translate(0px, 0px)';
  }

  const { x, y } = currentOffset;
  return `translate(${x}px, ${y}px)`;
}

export default DragOverlay;
