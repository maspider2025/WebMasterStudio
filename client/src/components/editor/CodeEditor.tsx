import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/editor-store";

interface CodeEditorProps {
  language: string;
  onResize: (height: number) => void;
}

// Simplified mock code editor for demo
const CodeEditor = ({ language, onResize }: CodeEditorProps) => {
  const { selectedElementId, elements } = useEditorStore();
  const selectedElement = elements.find(el => el.id === selectedElementId);
  const editorRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState<string>("");
  
  useEffect(() => {
    // Generate code based on the selected element
    if (selectedElement) {
      switch (language) {
        case 'html':
          setCode(generateHtmlForElement(selectedElement));
          break;
        case 'css':
          setCode(generateCssForElement(selectedElement));
          break;
        case 'javascript':
          setCode("// JavaScript code for the selected element\n// Add your code here");
          break;
        case 'database':
          setCode("// Database schema and queries\n// This is where you would define your data models");
          break;
        case 'api':
          setCode("// API endpoints\n// Define your API routes here");
          break;
        default:
          setCode("");
      }
    } else {
      // No element selected, show general code
      switch (language) {
        case 'html':
          setCode(generateHtmlForPage(elements));
          break;
        case 'css':
          setCode("/* CSS styles for the page */\n\n/* Add your global styles here */");
          break;
        case 'javascript':
          setCode("// JavaScript for the page\n// Add your code here");
          break;
        case 'database':
          setCode("// Database schema and queries\n// This is where you would define your data models");
          break;
        case 'api':
          setCode("// API endpoints\n// Define your API routes here");
          break;
        default:
          setCode("");
      }
    }
  }, [language, selectedElement, elements]);

  // Implement resizing
  const startResizeRef = useRef<{ y: number; height: number } | null>(null);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editorRef.current) {
      startResizeRef.current = {
        y: e.clientY,
        height: editorRef.current.offsetHeight
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (startResizeRef.current) {
      const dy = e.clientY - startResizeRef.current.y;
      const newHeight = Math.max(100, startResizeRef.current.height - dy);
      onResize(newHeight);
    }
  };
  
  const handleMouseUp = () => {
    startResizeRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      <div 
        className="h-2 cursor-row-resize bg-muted/50 hover:bg-muted"
        onMouseDown={handleMouseDown}
      />
      <div ref={editorRef} className="flex-1 overflow-auto p-3 font-mono text-sm bg-background text-muted-foreground">
        <pre>{code}</pre>
      </div>
    </>
  );
};

// Helper functions to generate code
function generateHtmlForElement(element: any): string {
  const styleAttr = element.styles 
    ? ` style="${Object.entries(element.styles).map(([k, v]) => `${k}: ${v}`).join('; ')}"`
    : '';
  const classAttr = ' class="element-highlight"';
  
  switch (element.type) {
    case 'container':
      return `<div${classAttr}${styleAttr}>\n  <!-- Container content -->\n</div>`;
    case 'text':
      return `<p${classAttr}${styleAttr}>${element.content || 'Text content'}</p>`;
    case 'heading':
      return `<h1${classAttr}${styleAttr}>${element.content || 'Heading'}</h1>`;
    case 'button':
      return `<button${classAttr}${styleAttr}>${element.content || 'Button'}</button>`;
    case 'image':
      return `<img${classAttr}${styleAttr} src="${element.src || 'image.jpg'}" alt="${element.alt || 'Image'}" />`;
    default:
      return `<div${classAttr}${styleAttr}>${element.content || ''}</div>`;
  }
}

function generateCssForElement(element: any): string {
  if (!element.styles || Object.keys(element.styles).length === 0) {
    return `/* Styles for element ${element.id} */\n\n/* Add your CSS here */`;
  }
  
  const cssRules = Object.entries(element.styles).map(([property, value]) => {
    // Convert camelCase to kebab-case
    const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `  ${cssProperty}: ${value};`;
  }).join('\n');
  
  return `/* Styles for element ${element.id} */\n\n.${element.type} {\n${cssRules}\n}`;
}

function generateHtmlForPage(elements: any[]): string {
  if (elements.length === 0) {
    return `<!-- No elements added to the page yet -->\n<!-- Drag and drop elements from the left sidebar -->`;
  }
  
  const elementsHtml = elements.map(el => {
    const indent = '  ';
    const styleAttr = el.styles 
      ? ` style="${Object.entries(el.styles).map(([k, v]) => `${k}: ${v}`).join('; ')}"`
      : '';
      
    switch (el.type) {
      case 'container':
        return `${indent}<div class="element" id="${el.id}"${styleAttr}>\n${indent}  <!-- Container content -->\n${indent}</div>`;
      case 'text':
        return `${indent}<p class="element" id="${el.id}"${styleAttr}>${el.content || 'Text content'}</p>`;
      case 'heading':
        return `${indent}<h1 class="element" id="${el.id}"${styleAttr}>${el.content || 'Heading'}</h1>`;
      case 'button':
        return `${indent}<button class="element" id="${el.id}"${styleAttr}>${el.content || 'Button'}</button>`;
      case 'image':
        return `${indent}<img class="element" id="${el.id}"${styleAttr} src="${el.src || 'image.jpg'}" alt="${el.alt || 'Image'}" />`;
      default:
        return `${indent}<div class="element" id="${el.id}"${styleAttr}>${el.content || ''}</div>`;
    }
  }).join('\n');
  
  return `<!-- Page HTML structure -->\n<div class="page-container">\n${elementsHtml}\n</div>`;
}

export default CodeEditor;
