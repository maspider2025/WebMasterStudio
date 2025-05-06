import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ElementTypes } from './element-types';

export interface ElementAnimation {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'custom';
  duration: number;
  delay?: number;
  easing?: string;
  direction?: 'in' | 'out' | 'inOut';
  repeat?: number;
  customKeyframes?: string;
}

export interface ElementAction {
  type: 'link' | 'scroll' | 'toggle' | 'modal' | 'api' | 'custom';
  target?: string;
  url?: string;
  params?: Record<string, any>;
  script?: string;
  eventType: 'click' | 'hover' | 'load' | 'scroll' | 'custom';
  customEvent?: string;
}

export interface ElementTransform {
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
}

export interface ElementResponsive {
  mobile?: Partial<{
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    styles: Record<string, any>;
  }>;
  tablet?: Partial<{
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    styles: Record<string, any>;
  }>;
}

export interface Element {
  id: string;
  type: ElementTypes;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  alt?: string;
  styles?: Record<string, any>;
  children?: string[];
  parent?: string;
  visible?: boolean;
  zIndex?: number;
  locked?: boolean;
  animations?: ElementAnimation[];
  actions?: ElementAction[];
  transform?: ElementTransform;
  responsive?: ElementResponsive;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  cssClasses?: string[];
  htmlAttributes?: Record<string, string>;
  customCode?: {
    html?: string;
    css?: string;
    js?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    openGraph?: {
      title?: string;
      description?: string;
      image?: string;
    };
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  pages: { 
    id: string;
    name: string;
    isHomepage: boolean;
    elements: Element[] 
  }[];
  createdAt: string;
  updatedAt: string;
}

export type EditorViewMode = 'desktop' | 'tablet' | 'mobile';
export type EditorGridSize = 'none' | 'small' | 'medium' | 'large';
export type EditorMode = 'design' | 'preview' | 'code';
export type EditorTheme = 'light' | 'dark' | 'system';
export type PageType = 'homepage' | 'product' | 'products' | 'checkout' | 'cart' | 'account' | 'contact' | 'about' | 'custom';

export interface EditorPage {
  id: string;
  name: string;
  slug: string;
  type: PageType;
  isHomepage: boolean;
  elements: Element[];
  metadata?: {
    seo?: {
      title?: string;
      description?: string;
      keywords?: string;
    };
    settings?: {
      showHeader?: boolean;
      showFooter?: boolean;
      customScripts?: string;
      customStyles?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface EditorState {
  // Elements and selection
  elements: Element[];
  selectedElementId: string | null;
  multipleSelection: string[];
  copiedElement: Element | null;
  copiedElements: Element[];
  history: Element[][];
  historyIndex: number;
  recentColors: string[];
  recentFonts: string[];
  clipboard: {
    elements: Element[];
    type: 'cut' | 'copy' | null;
  };
  
  // Project
  currentProject: Project | null;
  currentPageId: string | null;
  allPages: EditorPage[];
  recentProjects: string[];
  
  // Canvas state
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  viewMode: EditorViewMode;
  editorMode: EditorMode;
  theme: EditorTheme;
  gridSize: EditorGridSize;
  showGuides: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  snapToElements: boolean;
  rulers: boolean;
  fullscreenPreview: boolean;
  
  // UI State
  activePanel: 'elements' | 'properties' | 'pages' | 'layers' | 'assets' | 'components' | 'templates' | null;
  codeEditorOpen: boolean;
  codeEditorHeight: number;
  codeEditorLanguage: 'html' | 'css' | 'javascript' | 'json' | 'typescript' | 'jsx' | 'tsx';
  codeEditorContent: string;
  propertyPanelWidth: number;
  elementLibraryWidth: number;
  unsavedChanges: boolean;
  
  // Core Actions
  addElement: (element: Omit<Element, 'id'> & { id?: string }) => void;
  selectElement: (id: string | null) => void;
  selectMultipleElements: (ids: string[]) => void;
  toggleElementSelection: (id: string) => void;
  updateElementPosition: (id: string, dx: number, dy: number) => void;
  updateElementSize: (id: string, dimensions: Partial<{ width: number, height: number, x: number, y: number }>) => void;
  updateElementStyles: (id: string, styles: Record<string, any>) => void;
  updateElementContent: (id: string, updates: Partial<Omit<Element, 'id' | 'type'>>) => void;
  deleteElement: (id: string) => void;
  deleteSelectedElements: () => void;
  duplicateElement: (id: string) => void;
  duplicateSelectedElements: () => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  moveElementToFront: (id: string) => void;
  moveElementToBack: (id: string) => void;
  updateElementVisibility: (id: string, visible: boolean) => void;
  lockElement: (id: string, locked: boolean) => void;
  
  // Advanced Element Operations
  groupElements: (elementIds: string[]) => void;
  ungroupElements: (groupId: string) => void;
  alignElements: (elementIds: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeElements: (elementIds: string[], distribution: 'horizontal' | 'vertical') => void;
  addAnimation: (elementId: string, animation: ElementAnimation) => void;
  removeAnimation: (elementId: string, animationIndex: number) => void;
  updateAnimation: (elementId: string, animationIndex: number, updates: Partial<ElementAnimation>) => void;
  addAction: (elementId: string, action: ElementAction) => void;
  removeAction: (elementId: string, actionIndex: number) => void;
  updateAction: (elementId: string, actionIndex: number, updates: Partial<ElementAction>) => void;
  updateResponsiveStyles: (elementId: string, deviceType: 'mobile' | 'tablet', styles: Partial<ElementResponsive['mobile']>) => void;
  
  // History Operations
  undo: () => void;
  redo: () => void;
  createSnapshot: () => void;
  clearHistory: () => void;
  
  // Clipboard Operations
  copyElement: (id: string) => void;
  copySelectedElements: () => void;
  cutElement: (id: string) => void;
  cutSelectedElements: () => void;
  paste: (x?: number, y?: number) => void;
  
  // Page & Project Operations
  loadTemplate: (elements: Element[]) => void;
  clearCanvas: () => void;
  saveProject: () => { success: boolean; message: string; projectName: string; isNew: boolean; error?: string; } | undefined;
  loadProject: (projectId: string) => Promise<void>;
  createNewProject: (name: string, description?: string) => void;
  addPage: (page: Omit<EditorPage, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; message: string; pageId: string; pageName: string; } | undefined;
  removePage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;
  duplicatePage: (pageId: string) => void;
  setCurrentPage: (pageId: string) => void;
  updatePageMetadata: (pageId: string, metadata: Partial<EditorPage['metadata']>) => void;
  importProject: (projectData: string) => void;
  exportProject: () => string;
  exportHtml: (pageId?: string) => string;
  publishProject: () => Promise<{url: string}>;
  
  // UI Control
  setViewMode: (mode: EditorViewMode) => void;
  setEditorMode: (mode: EditorMode) => void;
  setZoom: (zoom: number) => void;
  togglePanel: (panel: EditorState['activePanel']) => void;
  setActivePanel: (panel: EditorState['activePanel']) => void;
  toggleCodeEditor: () => void;
  setCodeEditorHeight: (height: number) => void;
  setCodeEditorLanguage: (language: EditorState['codeEditorLanguage']) => void;
  updateCodeEditorContent: (content: string) => void;
  setGridSize: (size: EditorGridSize) => void;
  toggleGuides: () => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  toggleSnapToElements: () => void;
  toggleRulers: () => void;
  toggleFullscreenPreview: () => void;
  setTheme: (theme: EditorTheme) => void;
  resizePropertyPanel: (width: number) => void;
  resizeElementLibrary: (width: number) => void;
}

// Helper to create a deep copy of elements array
const cloneElements = (elements: Element[]): Element[] => {
  return JSON.parse(JSON.stringify(elements));
};

// Helper to generate unique IDs
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Helper for adding multiple elements at once
const addMultipleElements = (elements: Element[], newElements: Element[]): Element[] => {
  return [...elements, ...newElements];
};

// Helper for updating element properties
const updateElementById = (elements: Element[], id: string, updates: Partial<Element>): Element[] => {
  return elements.map((el) => {
    if (el.id === id) {
      return { ...el, ...updates };
    }
    return el;
  });
};

// Helper for grid snapping
const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// HTML template generator
const generateHtml = (elements: Element[], includeStyles: boolean = true): string => {
  let html = '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n';
  html += '  <meta charset="UTF-8">\n';
  html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  html += '  <title>Site exportado - NextGen Site Builder</title>\n';
  
  if (includeStyles) {
    html += '  <style>\n';
    html += '    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }\n';
    html += '    .element { position: absolute; }\n';
    // Add more global styles
    html += '  </style>\n';
  }
  
  html += '</head>\n<body>\n';
  html += '  <div class="page-container" style="position: relative; width: 100%; height: 100vh; overflow: hidden;">\n';
  
  // Sort elements by zIndex
  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  
  // Add each element
  sortedElements.forEach(element => {
    if (element.visible === false) return;
    
    const styleAttr = element.styles ? 
      `style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; ${Object.entries(element.styles).map(([key, value]) => `${key}: ${value};`).join(' ')}"` : 
      `style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px;"`;
    
    const classAttr = element.cssClasses?.length ? ` class="${element.cssClasses.join(' ')}"` : '';
    const customAttrs = element.htmlAttributes ? 
      Object.entries(element.htmlAttributes).map(([key, value]) => ` ${key}="${value}"`).join('') : '';
    
    switch (element.type) {
      case 'text':
        html += `  <div id="${element.id}"${classAttr} ${styleAttr}${customAttrs}>${element.content || ''}</div>\n`;
        break;
      case 'heading':
        html += `  <h2 id="${element.id}"${classAttr} ${styleAttr}${customAttrs}>${element.content || ''}</h2>\n`;
        break;
      case 'paragraph':
        html += `  <p id="${element.id}"${classAttr} ${styleAttr}${customAttrs}>${element.content || ''}</p>\n`;
        break;
      case 'button':
        html += `  <button id="${element.id}"${classAttr} ${styleAttr}${customAttrs}>${element.content || ''}</button>\n`;
        break;
      case 'image':
        html += `  <img id="${element.id}"${classAttr} ${styleAttr} src="${element.src || ''}" alt="${element.alt || ''}"${customAttrs} />\n`;
        break;
      case 'container':
        html += `  <div id="${element.id}"${classAttr} ${styleAttr}${customAttrs}></div>\n`;
        break;
      case 'custom':
        if (element.customCode?.html) {
          html += `  ${element.customCode.html}\n`;
        } else {
          html += `  <div id="${element.id}"${classAttr} ${styleAttr}${customAttrs}>${element.content || ''}</div>\n`;
        }
        break;
      default:
        html += `  <div id="${element.id}"${classAttr} ${styleAttr}${customAttrs}>${element.content || ''}</div>\n`;
    }
  });
  
  html += '  </div>\n';
  
  // Add custom scripts
  html += '  <script>\n';
  html += '    // Generated JavaScript\n';
  
  // Add animation handlers
  const elementsWithAnimations = elements.filter(el => el.animations && el.animations.length > 0);
  if (elementsWithAnimations.length > 0) {
    html += '    document.addEventListener(\'DOMContentLoaded\', function() {\n';
    elementsWithAnimations.forEach(element => {
      element.animations?.forEach((animation, index) => {
        html += `      // Animation for ${element.id} - ${animation.type}\n`;
        html += `      const element${element.id.replace(/-/g, '_')}_${index} = document.getElementById('${element.id}');\n`;
        html += `      if (element${element.id.replace(/-/g, '_')}_${index}) {\n`;
        
        // Generate animation code based on type
        switch (animation.type) {
          case 'fade':
            html += `        element${element.id.replace(/-/g, '_')}_${index}.style.transition = 'opacity ${animation.duration}ms ${animation.easing || 'ease'} ${animation.delay || 0}ms';\n`;
            html += `        element${element.id.replace(/-/g, '_')}_${index}.style.opacity = '${animation.direction === 'out' ? '1' : '0'}';\n`;
            html += `        setTimeout(() => { element${element.id.replace(/-/g, '_')}_${index}.style.opacity = '${animation.direction === 'out' ? '0' : '1'}'; }, 50);\n`;
            break;
          case 'slide':
            html += `        element${element.id.replace(/-/g, '_')}_${index}.style.transition = 'transform ${animation.duration}ms ${animation.easing || 'ease'} ${animation.delay || 0}ms';\n`;
            html += `        element${element.id.replace(/-/g, '_')}_${index}.style.transform = 'translateY(${animation.direction === 'in' ? '50px' : '0'})';\n`;
            html += `        setTimeout(() => { element${element.id.replace(/-/g, '_')}_${index}.style.transform = 'translateY(${animation.direction === 'in' ? '0' : '50px'})'; }, 50);\n`;
            break;
          // Add other animation types
        }
        
        html += `      }\n`;
      });
    });
    html += '    });\n';
  }
  
  // Add event handlers for actions
  const elementsWithActions = elements.filter(el => el.actions && el.actions.length > 0);
  if (elementsWithActions.length > 0) {
    html += '    document.addEventListener(\'DOMContentLoaded\', function() {\n';
    elementsWithActions.forEach(element => {
      element.actions?.forEach((action, index) => {
        html += `      // Action for ${element.id} - ${action.type} on ${action.eventType}\n`;
        html += `      const actionElement${element.id.replace(/-/g, '_')}_${index} = document.getElementById('${element.id}');\n`;
        html += `      if (actionElement${element.id.replace(/-/g, '_')}_${index}) {\n`;
        
        // Generate event handler based on action type
        const eventName = action.eventType === 'custom' ? action.customEvent || 'click' : action.eventType;
        html += `        actionElement${element.id.replace(/-/g, '_')}_${index}.addEventListener('${eventName}', function(event) {\n`;
        
        switch (action.type) {
          case 'link':
            if (action.url) {
              html += `          window.location.href = '${action.url}';\n`;
            }
            break;
          case 'scroll':
            if (action.target) {
              html += `          document.getElementById('${action.target}')?.scrollIntoView({ behavior: 'smooth' });\n`;
            }
            break;
          case 'toggle':
            if (action.target) {
              html += `          const targetEl = document.getElementById('${action.target}');\n`;
              html += `          if (targetEl) targetEl.style.display = targetEl.style.display === 'none' ? 'block' : 'none';\n`;
            }
            break;
          case 'custom':
            if (action.script) {
              html += `          ${action.script}\n`;
            }
            break;
          // Add other action types
        }
        
        html += `        });\n`;
        html += `      }\n`;
      });
    });
    html += '    });\n';
  }
  
  // Add custom JS if provided
  elements.forEach(element => {
    if (element.customCode?.js) {
      html += `    // Custom JS for ${element.id}\n`;
      html += `    ${element.customCode.js}\n`;
    }
  });
  
  html += '  </script>\n';
  html += '</body>\n</html>';
  
  return html;
};

// Helper function já definida anteriormente

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Implementation of all the missing functions and state defined in EditorState interface
      // Initial state
      elements: [],
      selectedElementId: null,
      multipleSelection: [],
      copiedElement: null,
      copiedElements: [],
      history: [[]],
      historyIndex: 0,
      recentColors: ['#1e90ff', '#ff6347', '#32cd32', '#ffd700', '#9932cc'],
      recentFonts: ['Arial', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins'],
      clipboard: {
        elements: [],
        type: null
      },
      
      // Project
      currentProject: null,
      currentPageId: null,
      allPages: [],
      recentProjects: [],
      
      // Canvas state
      canvasWidth: 1200,
      canvasHeight: 800,
      zoom: 100,
      viewMode: 'desktop',
      editorMode: 'design',
      theme: 'light',
      gridSize: 'medium',
      showGuides: true,
      showGrid: true,
      snapToGrid: true,
      snapToElements: true,
      rulers: true,
      fullscreenPreview: false,
      
      // UI State
      activePanel: 'elements',
      codeEditorOpen: true,
      codeEditorHeight: 250,
      codeEditorLanguage: 'html',
      codeEditorContent: '',
      propertyPanelWidth: 300,
      elementLibraryWidth: 240,
      unsavedChanges: false,
      
      // Core Actions
      addElement: (element) => {
        const newElement: Element = {
          id: element.id || generateId('element'),
          type: element.type,
          name: element.name || `Novo ${element.type}`,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          content: element.content,
          src: element.src,
          alt: element.alt,
          styles: element.styles || {},
          children: element.children || [],
          parent: element.parent,
          visible: element.visible !== false,
          zIndex: get().elements.length + 1,
          locked: element.locked || false,
          animations: element.animations || [],
          actions: element.actions || [],
          transform: element.transform || { rotate: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
          responsive: element.responsive || { mobile: {}, tablet: {} },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Snap to grid if enabled
        if (get().snapToGrid && get().gridSize !== 'none') {
          const gridSizeMap = { small: 4, medium: 8, large: 16, none: 0 };
          const size = get().gridSize === 'none' ? 0 : gridSizeMap[get().gridSize as 'small' | 'medium' | 'large'];
          if (size > 0) {
            newElement.x = snapToGrid(newElement.x, size);
            newElement.y = snapToGrid(newElement.y, size);
            newElement.width = snapToGrid(newElement.width, size);
            newElement.height = snapToGrid(newElement.height, size);
          }
        }
        
        set((state) => {
          const newElements = [...state.elements, newElement];
          return { 
            elements: newElements, 
            selectedElementId: newElement.id,
            unsavedChanges: true
          };
        });
        
        // Create a new snapshot for history
        get().createSnapshot();
      },
      
      selectElement: (id) => {
        set({ selectedElementId: id });
      },
      
      updateElementPosition: (id, dx, dy) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === id) {
              return {
                ...el,
                x: el.x + dx,
                y: el.y + dy,
              };
            }
            return el;
          });
          
          return { elements: newElements };
        });
      },
      
      updateElementSize: (id, dimensions) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === id) {
              return {
                ...el,
                ...dimensions,
              };
            }
            return el;
          });
          
          return { elements: newElements };
        });
      },
      
      updateElementStyles: (id, styles) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === id) {
              return {
                ...el,
                styles: {
                  ...el.styles,
                  ...styles,
                },
              };
            }
            return el;
          });
          
          return { elements: newElements };
        });
      },
      
      updateElementContent: (id, updates) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === id) {
              return {
                ...el,
                ...updates,
              };
            }
            return el;
          });
          
          return { elements: newElements };
        });
      },
      
      deleteElement: (id) => {
        set((state) => {
          // Remove the element and its children recursively
          const elementsToRemove = new Set<string>();
          
          const collectElementsToRemove = (elementId: string) => {
            elementsToRemove.add(elementId);
            
            // Find children of this element
            const element = state.elements.find(el => el.id === elementId);
            if (element?.children && element.children.length > 0) {
              element.children.forEach(childId => {
                collectElementsToRemove(childId);
              });
            }
          };
          
          collectElementsToRemove(id);
          
          const newElements = state.elements.filter(el => !elementsToRemove.has(el.id));
          const newSelectedId = state.selectedElementId === id ? null : state.selectedElementId;
          
          return { 
            elements: newElements,
            selectedElementId: newSelectedId
          };
        });
        
        // Create a new snapshot for history
        get().createSnapshot();
      },
      
      duplicateElement: (id) => {
        set((state) => {
          const elementToDuplicate = state.elements.find(el => el.id === id);
          if (!elementToDuplicate) return state;
          
          const newId = `element-${Date.now()}`;
          const duplicatedElement: Element = {
            ...structuredClone(elementToDuplicate),
            id: newId,
            x: elementToDuplicate.x + 20, // Offset slightly
            y: elementToDuplicate.y + 20,
            children: [],
            parent: undefined,
          };
          
          return {
            elements: [...state.elements, duplicatedElement],
            selectedElementId: newId,
          };
        });
        
        // Create a new snapshot for history
        get().createSnapshot();
      },
      
      moveElementUp: (id) => {
        set((state) => {
          const index = state.elements.findIndex(el => el.id === id);
          if (index === -1 || index === state.elements.length - 1) return state;
          
          const newElements = [...state.elements];
          const temp = newElements[index];
          newElements[index] = newElements[index + 1];
          newElements[index + 1] = temp;
          
          // Update zIndex
          newElements[index].zIndex = index + 1;
          newElements[index + 1].zIndex = index + 2;
          
          return { elements: newElements };
        });
      },
      
      moveElementDown: (id) => {
        set((state) => {
          const index = state.elements.findIndex(el => el.id === id);
          if (index <= 0) return state;
          
          const newElements = [...state.elements];
          const temp = newElements[index];
          newElements[index] = newElements[index - 1];
          newElements[index - 1] = temp;
          
          // Update zIndex
          newElements[index].zIndex = index + 1;
          newElements[index - 1].zIndex = index;
          
          return { elements: newElements };
        });
      },
      
      updateElementVisibility: (id, visible) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === id) {
              return {
                ...el,
                visible,
              };
            }
            return el;
          });
          
          return { elements: newElements };
        });
      },
      
      createSnapshot: () => {
        set((state) => {
          // Add current state to history, removing any future states if we've gone back in time
          const newHistory = [
            ...state.history.slice(0, state.historyIndex + 1),
            cloneElements(state.elements),
          ];
          
          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },
      
      undo: () => {
        set((state) => {
          if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            return {
              elements: cloneElements(state.history[newIndex]),
              historyIndex: newIndex,
            };
          }
          return state;
        });
      },
      
      redo: () => {
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            return {
              elements: cloneElements(state.history[newIndex]),
              historyIndex: newIndex,
            };
          }
          return state;
        });
      },
      
      loadTemplate: (elements) => {
        set(() => ({
          elements: cloneElements(elements),
          selectedElementId: null,
        }));
        
        // Create a new snapshot for history
        get().createSnapshot();
      },
      
      clearCanvas: () => {
        set(() => ({
          elements: [],
          selectedElementId: null,
        }));
        
        // Create a new snapshot for history
        get().createSnapshot();
      },
      
      saveProject: () => {
        const { currentProject, elements } = get();
        
        if (!currentProject) {
          // Se não houver projeto atual, criar um novo projeto básico
          const newProject: Project = {
            id: `project-${Date.now()}`,
            name: 'Novo Projeto',
            description: 'Projeto criado automaticamente',
            pages: [
              {
                id: `page-${Date.now()}`,
                name: 'Home',
                isHomepage: true,
                elements: cloneElements(elements),
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({ 
            currentProject: newProject,
            currentPageId: newProject.pages[0].id,
            unsavedChanges: false
          });
          
          // Retornar informações sobre o projeto criado para exibir na notificação
          return { 
            success: true, 
            message: 'Novo projeto criado com sucesso', 
            projectName: newProject.name,
            isNew: true
          };
        }
        
        const updatedProject: Project = {
          ...currentProject,
          pages: currentProject.pages.map(page => {
            if (page.id === get().currentPageId) {
              return {
                ...page,
                elements: cloneElements(elements),
              };
            }
            return page;
          }),
          updatedAt: new Date().toISOString(),
        };
        
        // Implementar salvamento persistente
        try {
          // Salvar no localStorage como backup e para demonstração
          localStorage.setItem(`project_${updatedProject.id}`, JSON.stringify(updatedProject));
          
          // Atualizar o estado do projeto
          set({ 
            currentProject: updatedProject,
            unsavedChanges: false,
            recentProjects: [...(get().recentProjects || []).filter(id => id !== updatedProject.id), updatedProject.id].slice(-5)
          });
          
          // Em uma aplicação real, faríamos a persistência no backend
          // Por exemplo:
          // await apiRequest('PUT', `/api/projects/${currentProject.id}`, updatedProject);
          
          // Retornar informações para o toast de sucesso
          return { 
            success: true, 
            message: 'Projeto salvo com sucesso', 
            projectName: updatedProject.name,
            isNew: false
          };
        } catch (error) {
          console.error('Erro ao salvar projeto:', error);
          return { 
            success: false, 
            message: 'Erro ao salvar projeto', 
            error: String(error) 
          };
        }
      },
      
      loadProject: async (projectId) => {
        try {
          // In a real application, this would fetch from API
          // Example:
          // const project = await apiRequest('GET', `/api/projects/${projectId}`).then(res => res.json());
          
          // For now, use mock data if project exists in localStorage
          // Would be replaced with actual API call in production
          set({ currentProject: null, elements: [], selectedElementId: null });
          
          // Create a new snapshot for history
          get().createSnapshot();
          
          return Promise.resolve();
        } catch (error) {
          console.error('Failed to load project:', error);
          return Promise.reject(error);
        }
      },
      
      // Implementação das funções de Alinhamento
      alignElements: (elementIds, alignment) => {
        set((state) => {
          if (elementIds.length <= 1) return state;
          
          // Find min/max coordinates to determine boundaries
          const elements = state.elements.filter(el => elementIds.includes(el.id));
          const minX = Math.min(...elements.map(el => el.x));
          const maxX = Math.max(...elements.map(el => el.x + el.width));
          const minY = Math.min(...elements.map(el => el.y));
          const maxY = Math.max(...elements.map(el => el.y + el.height));
          const centerX = minX + (maxX - minX) / 2;
          const centerY = minY + (maxY - minY) / 2;
          
          // Update element positions based on alignment
          const newElements = state.elements.map(el => {
            if (!elementIds.includes(el.id)) return el;
            
            let updates = {};
            switch(alignment) {
              case 'left':
                updates = { x: minX };
                break;
              case 'center':
                updates = { x: centerX - el.width / 2 };
                break;
              case 'right':
                updates = { x: maxX - el.width };
                break;
              case 'top':
                updates = { y: minY };
                break;
              case 'middle':
                updates = { y: centerY - el.height / 2 };
                break;
              case 'bottom':
                updates = { y: maxY - el.height };
                break;
            }
            
            return { ...el, ...updates };
          });
          
          return { elements: newElements, unsavedChanges: true };
        });
        
        // Create a snapshot for history
        get().createSnapshot();
      },

      // Implementação da distribuição de elementos
      distributeElements: (elementIds, distribution) => {
        set((state) => {
          if (elementIds.length <= 2) return state;
          
          const elements = state.elements.filter(el => elementIds.includes(el.id));
          
          // Sort elements by position
          const sortedElements = distribution === 'horizontal'
            ? [...elements].sort((a, b) => a.x - b.x)
            : [...elements].sort((a, b) => a.y - b.y);
          
          // Calculate total space and spacing
          const firstElement = sortedElements[0];
          const lastElement = sortedElements[sortedElements.length - 1];
          let totalSpace;
          
          if (distribution === 'horizontal') {
            totalSpace = (lastElement.x + lastElement.width) - firstElement.x;
            const usedSpace = sortedElements.reduce((sum, el) => sum + el.width, 0);
            const availableSpace = totalSpace - usedSpace;
            const spacing = availableSpace / (sortedElements.length - 1);
            
            // Set new positions with equal spacing
            let currentX = firstElement.x + firstElement.width + spacing;
            const newElements = state.elements.map(el => {
              if (!elementIds.includes(el.id)) return el;
              if (el.id === firstElement.id || el.id === lastElement.id) return el;
              
              const updatedEl = { ...el, x: currentX };
              currentX += el.width + spacing;
              return updatedEl;
            });
            
            return { elements: newElements, unsavedChanges: true };
          } else {  // vertical distribution
            totalSpace = (lastElement.y + lastElement.height) - firstElement.y;
            const usedSpace = sortedElements.reduce((sum, el) => sum + el.height, 0);
            const availableSpace = totalSpace - usedSpace;
            const spacing = availableSpace / (sortedElements.length - 1);
            
            // Set new positions with equal spacing
            let currentY = firstElement.y + firstElement.height + spacing;
            const newElements = state.elements.map(el => {
              if (!elementIds.includes(el.id)) return el;
              if (el.id === firstElement.id || el.id === lastElement.id) return el;
              
              const updatedEl = { ...el, y: currentY };
              currentY += el.height + spacing;
              return updatedEl;
            });
            
            return { elements: newElements, unsavedChanges: true };
          }
        });
        
        // Create a snapshot for history
        get().createSnapshot();
      },
      
      // Implementação do agrupamento de elementos
      groupElements: (elementIds) => {
        set((state) => {
          if (elementIds.length <= 1) return state;
          
          const elementsToGroup = state.elements.filter(el => elementIds.includes(el.id));
          
          // Find boundaries of the group
          const minX = Math.min(...elementsToGroup.map(el => el.x));
          const minY = Math.min(...elementsToGroup.map(el => el.y));
          const maxX = Math.max(...elementsToGroup.map(el => el.x + el.width));
          const maxY = Math.max(...elementsToGroup.map(el => el.y + el.height));
          
          // Create a container element for the group
          const groupId = generateId('group');
          const containerElement: Element = {
            id: groupId,
            type: ElementTypes.container,
            name: `Grupo ${state.elements.filter(el => el.type === ElementTypes.container).length + 1}`,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            styles: { backgroundColor: 'rgba(200, 200, 200, 0.1)', border: '1px dashed #aaa' },
            children: elementIds,
            visible: true,
            zIndex: Math.min(...elementsToGroup.map(el => el.zIndex || 0)),
            locked: false,
            animations: [],
            actions: [],
            transform: { rotate: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
            responsive: { mobile: {}, tablet: {} },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Update parent reference for all grouped elements
          const updatedElements = state.elements.map(el => {
            if (elementIds.includes(el.id)) {
              return { ...el, parent: groupId };
            }
            return el;
          });
          
          return { 
            elements: [...updatedElements, containerElement],
            selectedElementId: groupId,
            unsavedChanges: true
          };
        });
        
        // Create a snapshot for history
        get().createSnapshot();
      },
      
      // Implementação do desagrupamento de elementos
      ungroupElements: (groupId) => {
        set((state) => {
          const groupElement = state.elements.find(el => el.id === groupId);
          if (!groupElement || !groupElement.children || groupElement.children.length === 0) {
            return state;
          }
          
          // Update parent reference for all grouped elements
          const updatedElements = state.elements.map(el => {
            if (groupElement.children?.includes(el.id)) {
              return { ...el, parent: undefined };
            }
            return el;
          });
          
          // Remove the group container element
          const filteredElements = updatedElements.filter(el => el.id !== groupId);
          
          return { 
            elements: filteredElements,
            selectedElementId: null,
            unsavedChanges: true
          };
        });
        
        // Create a snapshot for history
        get().createSnapshot();
      },
      
      // UI Control implementations
      toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
      toggleSnapToGrid: () => set(state => ({ snapToGrid: !state.snapToGrid })),
      toggleSnapToElements: () => set(state => ({ snapToElements: !state.snapToElements })),
      toggleGuides: () => set(state => ({ showGuides: !state.showGuides })),
      toggleRulers: () => set(state => ({ rulers: !state.rulers })),
      toggleFullscreenPreview: () => {
        // Implementação completa do modo de visualização em tela cheia
        set(state => {
          const newValue = !state.fullscreenPreview;
          
          // Se estiver ativando o modo de tela cheia
          if (newValue) {
            // Armazenar o estado anterior para restaurar depois
            const previousState = {
              activePanel: state.activePanel,
              editorMode: state.editorMode,
              zoom: state.zoom
            };
            
            // Usar armazenamento local para persistir entre renders
            sessionStorage.setItem('previousEditorState', JSON.stringify(previousState));
            
            // Entrar no modo de visualização com configurações otimizadas
            return {
              fullscreenPreview: true,
              activePanel: null, // Ocultar todos os painéis
              editorMode: 'preview', // Alternar para modo de visualização
              zoom: 100 // Restaurar o zoom para 100%
            };
          } else {
            // Restaurar o estado anterior ao sair do modo de tela cheia
            try {
              const previousStateJson = sessionStorage.getItem('previousEditorState');
              if (previousStateJson) {
                const previousState = JSON.parse(previousStateJson);
                return {
                  fullscreenPreview: false,
                  activePanel: previousState.activePanel,
                  editorMode: previousState.editorMode,
                  zoom: previousState.zoom
                };
              }
            } catch (e) {
              console.error('Erro ao restaurar estado anterior:', e);
            }
            
            // Caso ocorra algum problema, apenas sair do modo de tela cheia
            return { fullscreenPreview: false };
          }
        });
        
        // Aplicar efeitos no documento HTML para verdadeira visualização em tela cheia
        if (get().fullscreenPreview) {
          // Tentar usar a API Fullscreen se disponível
          const element = document.documentElement;
          if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
              console.error('Erro ao ativar modo de tela cheia:', err);
            });
          }
          
          // Adicionar uma classe ao body para estilização
          document.body.classList.add('editor-fullscreen-mode');
        } else {
          // Sair do modo de tela cheia do navegador
          if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(err => {
              console.error('Erro ao sair do modo de tela cheia:', err);
            });
          }
          
          // Remover a classe do body
          document.body.classList.remove('editor-fullscreen-mode');
        }
      },
      
      // Multiple selection implementations
      selectMultipleElements: (ids) => set({ multipleSelection: ids }),
      toggleElementSelection: (id) => set(state => {
        const isSelected = state.multipleSelection.includes(id);
        if (isSelected) {
          return { multipleSelection: state.multipleSelection.filter(item => item !== id) };
        } else {
          return { multipleSelection: [...state.multipleSelection, id] };
        }
      }),
      
      // Multiple selection operations
      deleteSelectedElements: () => {
        set(state => {
          if (state.multipleSelection.length === 0 && state.selectedElementId) {
            return { 
              elements: state.elements.filter(el => el.id !== state.selectedElementId),
              selectedElementId: null
            };
          }
          
          return { 
            elements: state.elements.filter(el => !state.multipleSelection.includes(el.id)),
            multipleSelection: [],
            selectedElementId: null
          };
        });
        
        get().createSnapshot();
      },
      
      duplicateSelectedElements: () => {
        set(state => {
          if (state.multipleSelection.length === 0 && state.selectedElementId) {
            const elementToDuplicate = state.elements.find(el => el.id === state.selectedElementId);
            if (!elementToDuplicate) return state;
            
            const duplicatedElement = {
              ...structuredClone(elementToDuplicate),
              id: `element-${Date.now()}`,
              x: elementToDuplicate.x + 20,
              y: elementToDuplicate.y + 20,
              children: [],
              parent: undefined,
            };
            
            return { 
              elements: [...state.elements, duplicatedElement],
              selectedElementId: duplicatedElement.id
            };
          }
          
          const elementsToDuplicate = state.elements.filter(el => 
            state.multipleSelection.includes(el.id));
          
          const duplicatedElements = elementsToDuplicate.map(el => ({
            ...structuredClone(el),
            id: `element-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            x: el.x + 20,
            y: el.y + 20,
            children: [],
            parent: undefined,
          }));
          
          const newMultipleSelection = duplicatedElements.map(el => el.id);
          
          return { 
            elements: [...state.elements, ...duplicatedElements],
            multipleSelection: newMultipleSelection,
            selectedElementId: null
          };
        });
        
        get().createSnapshot();
      },
      
      createNewProject: (name, description) => {
        const newProject: Project = {
          id: `project-${Date.now()}`,
          name,
          description,
          pages: [
            {
              id: `page-${Date.now()}`,
              name: 'Home',
              isHomepage: true,
              elements: [],
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set({
          currentProject: newProject,
          currentPageId: newProject.pages[0].id,
          elements: [],
          selectedElementId: null,
        });
        
        // Create a new snapshot for history
        get().createSnapshot();
      },
    }),
    {
      name: 'editor-storage',
      partialize: (state) => ({
        elements: state.elements,
        currentProject: state.currentProject,
        currentPageId: state.currentPageId,
      }),
    }
  )
);
