import { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import { useToast } from "@/hooks/use-toast";
import { useEditorStore } from "@/lib/editor-store";
import { ElementTypes } from "@/lib/element-types";
import { ViewMode } from "@/pages/editor";
import AIAssistant from "./AIAssistant";
import ResizableElement from "@/components/ui/resizable-element";

interface CanvasProps {
  viewMode: ViewMode;
  zoom: number;
}

const Canvas = ({ viewMode, zoom }: CanvasProps) => {
  const { toast } = useToast();
  const { 
    elements, 
    addElement, 
    selectedElementId, 
    selectElement, 
    updateElementPosition
  } = useEditorStore();
  
  const [showAITip, setShowAITip] = useState(false);

  useEffect(() => {
    // Show AI tip after a delay
    const timer = setTimeout(() => {
      setShowAITip(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: Object.values(ElementTypes),
    drop: (item: any, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      
      if (delta && item.type) {
        // If it's a new element being added from the sidebar
        if (item.isNew) {
          const offset = monitor.getClientOffset();
          if (offset) {
            const canvasRect = document.getElementById('editor-canvas')?.getBoundingClientRect();
            if (canvasRect) {
              const x = offset.x - canvasRect.left;
              const y = offset.y - canvasRect.top;
              
              addElement({
                id: Date.now().toString(),
                type: item.type,
                x,
                y,
                width: item.defaultWidth || 200,
                height: item.defaultHeight || 50,
                content: item.defaultContent || '',
                styles: item.defaultStyles || {},
              });
              
              toast({
                title: "Elemento adicionado",
                description: `${item.name} foi adicionado com sucesso!`,
              });
            }
          }
        } else {
          // If it's an existing element being moved
          updateElementPosition(item.id, delta.x, delta.y);
        }
      }
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [addElement, updateElementPosition]);

  const getViewModeWidth = () => {
    switch(viewMode) {
      case 'mobile': return 375;
      case 'tablet': return 768;
      case 'desktop': 
      default: return '100%';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-secondary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl mb-3 px-4 py-2 bg-background border border-border rounded-lg shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs font-medium text-muted-foreground bg-secondary rounded-md px-2 py-1">
            {viewMode === 'desktop' ? 'Visualização Desktop' : viewMode === 'tablet' ? 'Visualização Tablet' : 'Visualização Mobile'}  
          </div>
        </div>
        <div className="text-xs text-muted-foreground">nextgen-sitebuilder.replit.app</div>
        <div className="text-xs font-medium text-muted-foreground bg-secondary rounded-md px-2 py-1">
          Zoom: {zoom}%
        </div>
      </div>

      <div className="relative w-full max-w-5xl bg-muted rounded-lg shadow-lg p-4 border border-border">
        <div 
          id="editor-canvas"
          ref={drop}
          className="canvas-grid w-full bg-white shadow-xl relative overflow-y-auto mx-auto rounded-md"
          style={{ 
            width: getViewModeWidth(),
            minHeight: 600,
            maxHeight: 800,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center top'
          }}
        >
          {/* Render the elements */}
          {elements.map((element) => (
            <ResizableElement
              key={element.id}
              element={element}
              isSelected={element.id === selectedElementId}
              onClick={() => selectElement(element.id)}
            />
          ))}
          
          {showAITip && elements.length > 0 && (
            <AIAssistant 
              message="Adicione uma seção de galeria para mostrar seus produtos em destaque."
              onDismiss={() => setShowAITip(false)}
            />
          )}
        </div>
        
        <div className="absolute bottom-2 right-2 bg-background border border-border rounded-md px-3 py-1.5 shadow-sm text-xs font-medium text-muted-foreground">
          Editor NextGen Site Builder
        </div>
      </div>
    </div>
  );
};

export default Canvas;
