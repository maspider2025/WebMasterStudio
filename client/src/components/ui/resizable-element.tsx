import { useDrag } from "react-dnd";
import { ElementTypes } from "@/lib/element-types";
import { useEditorStore } from "@/lib/editor-store";
import { Element } from "@/lib/editor-store";
import { useRef, useEffect } from "react";

interface ResizableElementProps {
  element: Element;
  isSelected: boolean;
  onClick: () => void;
}

const ResizableElement = ({ element, isSelected, onClick }: ResizableElementProps) => {
  const { updateElementSize } = useEditorStore();
  const elementRef = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: element.type,
    item: { 
      type: element.type, 
      id: element.id,
      isNew: false 
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [element]);
  
  // Apply element styles from the store
  const getElementStyles = () => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      opacity: isDragging ? 0.5 : 1,
    };
    
    // Apply custom styles from element
    if (element.styles) {
      Object.entries(element.styles).forEach(([key, value]) => {
        (baseStyles as any)[key] = value;
      });
    }
    
    return baseStyles;
  };
  
  // Render content based on element type
  const renderContent = () => {
    // Se o elemento tem HTML, CSS ou JS personalizado, aplicamos através de um iframe
    if (element.htmlContent || element.cssContent || element.jsContent) {
      const combinedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Estilos base */
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.5;
              color: #333;
            }
            /* Estilos personalizados do elemento */
            ${element.cssContent || ''}
          </style>
        </head>
        <body>
          ${element.htmlContent || element.content || '<div>Container</div>'}
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              try {
                ${element.jsContent || ''}
              } catch (e) {
                console.error('Script error:', e);
              }
            });
          </script>
        </body>
        </html>
      `;
      
      return (
        <iframe 
          srcDoc={combinedHtml}
          title="Element Content"
          className="w-full h-full border-none"
          sandbox="allow-scripts"
          onLoad={(e) => {
            const iframe = e.target as HTMLIFrameElement;
            if (iframe.contentWindow) {
              // Opcionalmente, podemos injetar variáveis globais no iframe
              // iframe.contentWindow.componentData = { element: element };
            }
          }}
        />
      );
    }
    
    // Caso contrário, utilizamos a renderização padrão
    switch (element.type) {
      case ElementTypes.text:
        return element.content || 'Text content';
      case ElementTypes.heading:
        return <h1>{element.content || 'Heading'}</h1>;
      case ElementTypes.button:
        return <button className="px-4 py-2 bg-primary text-primary-foreground rounded">{element.content || 'Button'}</button>;
      case ElementTypes.image:
        return <img src={element.src || 'https://via.placeholder.com/150'} alt={element.alt || 'Image'} className="w-full h-full object-cover" />;
      case ElementTypes.form:
        return (
          <div className="w-full h-full flex flex-col gap-3 p-4 overflow-auto">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nome</label>
              <input type="text" className="border rounded p-2" placeholder="Seu nome" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Email</label>
              <input type="email" className="border rounded p-2" placeholder="seu@email.com" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Mensagem</label>
              <textarea className="border rounded p-2 min-h-[80px]" placeholder="Digite sua mensagem..."></textarea>
            </div>
            <button className="mt-2 bg-primary text-primary-foreground py-2 px-4 rounded">Enviar</button>
          </div>
        );
      case ElementTypes.productCard:
        return (
          <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="h-1/2 bg-gray-200 relative">
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1">20% OFF</div>
              <img src="https://via.placeholder.com/300x150" alt="Product" className="w-full h-full object-cover" />
            </div>
            <div className="p-3 flex flex-col flex-1">
              <h3 className="font-medium text-sm">Produto Exemplo</h3>
              <div className="text-xs text-gray-600 mb-1">Categoria</div>
              <div className="flex items-center gap-2 mt-auto">
                <span className="font-bold">R$ 59,90</span>
                <span className="text-xs line-through text-gray-400">R$ 79,90</span>
              </div>
              <button className="mt-2 w-full bg-primary text-primary-foreground py-1 text-sm rounded">Adicionar ao Carrinho</button>
            </div>
          </div>
        );
      default:
        return element.content || <div className="w-full h-full flex items-center justify-center text-muted-foreground">Container</div>;
    }
  };
  
  // Handle resize
  const handleResize = (direction: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;
    const startLeft = element.x;
    const startTop = element.y;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (direction.includes('e')) {
        const width = startWidth + (moveEvent.clientX - startX);
        updateElementSize(element.id, { width: Math.max(10, width) });
      }
      if (direction.includes('w')) {
        const width = startWidth - (moveEvent.clientX - startX);
        const x = startLeft + (moveEvent.clientX - startX);
        if (width > 10) {
          updateElementSize(element.id, { width, x });
        }
      }
      if (direction.includes('s')) {
        const height = startHeight + (moveEvent.clientY - startY);
        updateElementSize(element.id, { height: Math.max(10, height) });
      }
      if (direction.includes('n')) {
        const height = startHeight - (moveEvent.clientY - startY);
        const y = startTop + (moveEvent.clientY - startY);
        if (height > 10) {
          updateElementSize(element.id, { height, y });
        }
      }
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSelected) return;
      
      let deltaX = 0;
      let deltaY = 0;
      
      switch (e.key) {
        case 'ArrowLeft':
          deltaX = -1;
          break;
        case 'ArrowRight':
          deltaX = 1;
          break;
        case 'ArrowUp':
          deltaY = -1;
          break;
        case 'ArrowDown':
          deltaY = 1;
          break;
        default:
          return;
      }
      
      // If shift is pressed, move by 10px instead of 1px
      if (e.shiftKey) {
        deltaX *= 10;
        deltaY *= 10;
      }
      
      if (deltaX !== 0 || deltaY !== 0) {
        e.preventDefault();
        updateElementSize(element.id, { x: element.x + deltaX, y: element.y + deltaY });
      }
    };
    
    if (isSelected) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelected, element.id, element.x, element.y, updateElementSize]);
  
  return (
    <div
      ref={(node) => {
        drag(node);
        elementRef.current = node;
      }}
      className={`${isSelected ? 'element-highlight' : ''}`}
      style={getElementStyles()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {renderContent()}
      
      {isSelected && (
        <>
          {/* Resize handles */}
          <div 
            className="resizable-handle top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize" 
            onMouseDown={(e) => handleResize('nw', e)}
          />
          <div 
            className="resizable-handle top-0 right-0 transform translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"
            onMouseDown={(e) => handleResize('ne', e)} 
          />
          <div 
            className="resizable-handle bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"
            onMouseDown={(e) => handleResize('sw', e)} 
          />
          <div 
            className="resizable-handle bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
            onMouseDown={(e) => handleResize('se', e)} 
          />
          <div 
            className="resizable-handle top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-ns-resize"
            onMouseDown={(e) => handleResize('n', e)} 
          />
          <div 
            className="resizable-handle right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 cursor-ew-resize"
            onMouseDown={(e) => handleResize('e', e)} 
          />
          <div 
            className="resizable-handle bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 cursor-ns-resize"
            onMouseDown={(e) => handleResize('s', e)} 
          />
          <div 
            className="resizable-handle left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-ew-resize"
            onMouseDown={(e) => handleResize('w', e)} 
          />
        </>
      )}
    </div>
  );
};

export default ResizableElement;
