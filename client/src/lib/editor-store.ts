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

// Função auxiliar para gerar IDs únicos
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Função auxiliar para clonar elementos profundamente
function cloneElements(elements: Element[]): Element[] {
  return JSON.parse(JSON.stringify(elements));
}

// Função auxiliar para snapToGrid
function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Estado inicial
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
      codeEditorOpen: false,
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
      
      // Funções para manipulação de seleção
      selectElement: (id) => {
        set({ selectedElementId: id, multipleSelection: id ? [id] : [] });
      },
      
      selectMultipleElements: (ids) => {
        set({ multipleSelection: ids, selectedElementId: ids.length > 0 ? ids[0] : null });
      },
      
      toggleElementSelection: (id) => {
        set((state) => {
          // Se o elemento já está na seleção múltipla, remova-o
          if (state.multipleSelection.includes(id)) {
            const newSelection = state.multipleSelection.filter(elementId => elementId !== id);
            return { 
              multipleSelection: newSelection,
              selectedElementId: newSelection.length > 0 ? newSelection[0] : null
            };
          } 
          // Caso contrário, adicione-o à seleção
          else {
            const newSelection = [...state.multipleSelection, id];
            return { 
              multipleSelection: newSelection,
              selectedElementId: newSelection.length > 0 ? newSelection[0] : null
            };
          }
        });
      },
      
      // Funções básicas de manipulação de elementos
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
          
          return { elements: newElements, unsavedChanges: true };
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
          
          return { elements: newElements, unsavedChanges: true };
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
          
          return { elements: newElements, unsavedChanges: true };
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
          
          return { elements: newElements, unsavedChanges: true };
        });
      },
      
      // Funções para eliminar/duplicar elementos
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
            selectedElementId: newSelectedId,
            unsavedChanges: true
          };
        });
        
        // Create a new snapshot for history
        get().createSnapshot();
      },
      
      deleteSelectedElements: () => {
        const { multipleSelection } = get();
        
        if (multipleSelection.length === 0) return;
        
        set((state) => {
          // Use um Set para eficiência na verificação
          const idsToRemove = new Set(multipleSelection);
          
          // Filtrar os elementos, removendo todos os selecionados
          const newElements = state.elements.filter(el => !idsToRemove.has(el.id));
          
          return {
            elements: newElements,
            selectedElementId: null,
            multipleSelection: [],
            unsavedChanges: true
          };
        });
        
        // Criar um novo snapshot para histórico
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
            unsavedChanges: true
          };
        });
        
        // Create a new snapshot for history
        get().createSnapshot();
      },
      
      // Duplicar todos os elementos selecionados de uma vez
      duplicateSelectedElements: () => {
        const { multipleSelection } = get();
        
        if (multipleSelection.length === 0) return;
        
        set((state) => {
          const elementsToDuplicate = state.elements.filter(el => multipleSelection.includes(el.id));
          const newElements = [...state.elements];
          const newIds: string[] = [];
          
          // Criar cópias de todos os elementos selecionados
          elementsToDuplicate.forEach(element => {
            const newId = `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            newIds.push(newId);
            
            const duplicatedElement: Element = {
              ...structuredClone(element),
              id: newId,
              x: element.x + 20, // Deslocar um pouco para facilitar a identificação visual
              y: element.y + 20,
              children: [],
              parent: undefined,
            };
            
            newElements.push(duplicatedElement);
          });
          
          return {
            elements: newElements,
            selectedElementId: newIds[0] || null,
            multipleSelection: newIds,
            unsavedChanges: true
          };
        });
        
        // Criar um novo snapshot para histórico
        get().createSnapshot();
      },
      
      // Funções para mudança de ordem dos elementos
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
          
          return { elements: newElements, unsavedChanges: true };
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
          
          return { elements: newElements, unsavedChanges: true };
        });
      },
      
      moveElementToFront: (id) => {
        set((state) => {
          const index = state.elements.findIndex(el => el.id === id);
          if (index === -1 || index === state.elements.length - 1) return state;
          
          const elementToMove = state.elements[index];
          const newElements = [
            ...state.elements.slice(0, index),
            ...state.elements.slice(index + 1),
            elementToMove
          ];
          
          // Update zIndexes
          return { 
            elements: newElements.map((el, i) => ({ ...el, zIndex: i + 1 })),
            unsavedChanges: true
          };
        });
      },
      
      moveElementToBack: (id) => {
        set((state) => {
          const index = state.elements.findIndex(el => el.id === id);
          if (index <= 0) return state;
          
          const elementToMove = state.elements[index];
          const newElements = [
            elementToMove,
            ...state.elements.slice(0, index),
            ...state.elements.slice(index + 1)
          ];
          
          // Update zIndexes
          return { 
            elements: newElements.map((el, i) => ({ ...el, zIndex: i + 1 })),
            unsavedChanges: true
          };
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
          
          return { elements: newElements, unsavedChanges: true };
        });
      },
      
      lockElement: (id, locked) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === id) {
              return {
                ...el,
                locked,
              };
            }
            return el;
          });
          
          return { elements: newElements, unsavedChanges: true };
        });
      },
      
      // Funções avançadas de manipulação de elementos
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
          
          // Create a container element
          const containerId = generateId('group');
          const containerElement: Element = {
            id: containerId,
            type: 'group',
            name: 'Grupo',
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            children: elementIds,
            visible: true,
            zIndex: Math.max(...elementsToGroup.map(el => el.zIndex || 0)) + 1,
            styles: {
              backgroundColor: 'transparent',
              border: '1px dashed #888',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Update child elements to reference the container
          const updatedElements = state.elements.map(el => {
            if (elementIds.includes(el.id)) {
              return {
                ...el,
                parent: containerId,
                // Adjust coordinates relative to container
                x: el.x - minX,
                y: el.y - minY,
              };
            }
            return el;
          });
          
          return {
            elements: [...updatedElements, containerElement],
            selectedElementId: containerId,
            multipleSelection: [containerId],
            unsavedChanges: true
          };
        });
        
        // Create a snapshot for history
        get().createSnapshot();
      },
      
      ungroupElements: (groupId) => {
        set((state) => {
          const groupElement = state.elements.find(el => el.id === groupId && el.type === 'group');
          if (!groupElement || !groupElement.children) return state;
          
          // Get the absolute position of the group
          const groupX = groupElement.x;
          const groupY = groupElement.y;
          
          // Update child elements to remove parent reference and adjust coordinates
          const updatedElements = state.elements.map(el => {
            if (el.parent === groupId) {
              return {
                ...el,
                parent: undefined,
                // Adjust coordinates to be absolute again
                x: el.x + groupX,
                y: el.y + groupY,
              };
            }
            return el;
          });
          
          // Remove the group element
          const filteredElements = updatedElements.filter(el => el.id !== groupId);
          
          return {
            elements: filteredElements,
            selectedElementId: null,
            multipleSelection: groupElement.children || [],
            unsavedChanges: true
          };
        });
        
        // Create a snapshot for history
        get().createSnapshot();
      },
      
      // Funções para manipulação de animações
      addAnimation: (elementId, animation) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === elementId) {
              return {
                ...el,
                animations: [...(el.animations || []), animation],
              };
            }
            return el;
          });
          
          return { elements: newElements, unsavedChanges: true };
        });
      },
      
      removeAnimation: (elementId, animationIndex) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === elementId && el.animations) {
              return {
                ...el,
                animations: el.animations.filter((_, index) => index !== animationIndex),
              };
            }
            return el;
          });
          
          return { elements: newElements, unsavedChanges: true };
        });
      },
      
      updateAnimation: (elementId, animationIndex, updates) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === elementId && el.animations && el.animations[animationIndex]) {
              const newAnimations = [...el.animations];
              newAnimations[animationIndex] = {
                ...newAnimations[animationIndex],
                ...updates,
              };
              return {
                ...el,
                animations: newAnimations,
              };
            }
            return el;
          });
          
          return { elements: newElements, unsavedChanges: true };
        });
      },
      
      // Funções para manipulação de ações
      addAction: (elementId, action) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === elementId) {
              return {
                ...el,
                actions: [...(el.actions || []), action],
              };
            }
            return el;
          });
          
          return { elements: newElements, unsavedChanges: true };
        });
      },
      
      removeAction: (elementId, actionIndex) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === elementId && el.actions) {
              return {
                ...el,
                actions: el.actions.filter((_, index) => index !== actionIndex),
              };
            }
            return el;
          });
          
          return { elements: newElements, unsavedChanges: true };
        });
      },
      
      updateAction: (elementId, actionIndex, updates) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === elementId && el.actions && el.actions[actionIndex]) {
              const newActions = [...el.actions];
              newActions[actionIndex] = {
                ...newActions[actionIndex],
                ...updates,
              };
              return {
                ...el,
                actions: newActions,
              };
            }
            return el;
          });
          
          return { elements: newElements, unsavedChanges: true };
        });
      },
      
      // Funções para responsividade
      updateResponsiveStyles: (elementId, deviceType, styles) => {
        set((state) => {
          const newElements = state.elements.map((el) => {
            if (el.id === elementId) {
              return {
                ...el,
                responsive: {
                  ...el.responsive,
                  [deviceType]: {
                    ...el.responsive?.[deviceType],
                    ...styles,
                  },
                },
              };
            }
            return el;
          });
          
          return { elements: newElements, unsavedChanges: true };
        });
      },
      
      // Funções para histórico
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
              unsavedChanges: true
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
              unsavedChanges: true
            };
          }
          return state;
        });
      },
      
      clearHistory: () => {
        set((state) => ({
          history: [cloneElements(state.elements)],
          historyIndex: 0,
        }));
      },
      
      // Funções para a área de transferência
      copyElement: (id) => {
        set((state) => {
          const elementToCopy = state.elements.find(el => el.id === id);
          if (!elementToCopy) return state;
          
          return {
            copiedElement: structuredClone(elementToCopy),
            clipboard: {
              elements: [structuredClone(elementToCopy)],
              type: 'copy'
            }
          };
        });
      },
      
      copySelectedElements: () => {
        set((state) => {
          const elementsToCopy = state.elements.filter(el => 
            state.multipleSelection.includes(el.id));
          
          if (elementsToCopy.length === 0) return state;
          
          return {
            copiedElements: structuredClone(elementsToCopy),
            clipboard: {
              elements: structuredClone(elementsToCopy),
              type: 'copy'
            }
          };
        });
      },
      
      cutElement: (id) => {
        const { elements } = get();
        const elementToCut = elements.find(el => el.id === id);
        if (!elementToCut) return;
        
        // First copy the element
        set({
          copiedElement: structuredClone(elementToCut),
          clipboard: {
            elements: [structuredClone(elementToCut)],
            type: 'cut'
          }
        });
        
        // Then remove it
        get().deleteElement(id);
      },
      
      cutSelectedElements: () => {
        const { elements, multipleSelection } = get();
        const elementsToCut = elements.filter(el => multipleSelection.includes(el.id));
        
        if (elementsToCut.length === 0) return;
        
        // First copy the elements
        set({
          copiedElements: structuredClone(elementsToCut),
          clipboard: {
            elements: structuredClone(elementsToCut),
            type: 'cut'
          }
        });
        
        // Then remove them
        get().deleteSelectedElements();
      },
      
      paste: (x, y) => {
        const { clipboard } = get();
        if (!clipboard.elements || clipboard.elements.length === 0) return;
        
        set((state) => {
          // Get current cursor position if not provided
          const targetX = x !== undefined ? x : state.canvasWidth / 2;
          const targetY = y !== undefined ? y : state.canvasHeight / 2;
          
          // If multiple elements are being pasted, we need to find their relative positions
          let offsetX = 0;
          let offsetY = 0;
          
          if (clipboard.elements.length > 1) {
            // Find the bounding box of the copied elements
            const minX = Math.min(...clipboard.elements.map(el => el.x));
            const minY = Math.min(...clipboard.elements.map(el => el.y));
            offsetX = targetX - minX;
            offsetY = targetY - minY;
          } else if (clipboard.elements.length === 1) {
            offsetX = targetX - clipboard.elements[0].x;
            offsetY = targetY - clipboard.elements[0].y;
          }
          
          // Create new elements with new IDs
          const newPastedElements = clipboard.elements.map(el => ({
            ...structuredClone(el),
            id: generateId(el.type),
            x: el.x + offsetX,
            y: el.y + offsetY,
            parent: undefined, // Clear parent reference
            children: [], // Clear children references
          }));
          
          // Select the newly pasted elements
          const newIds = newPastedElements.map(el => el.id);
          
          return {
            elements: [...state.elements, ...newPastedElements],
            selectedElementId: newIds[0],
            multipleSelection: newIds,
            unsavedChanges: true
          };
        });
        
        // Create a snapshot for history
        get().createSnapshot();
        
        // Clear the clipboard if it was a cut operation
        if (get().clipboard.type === 'cut') {
          set({ clipboard: { elements: [], type: null } });
        }
      },
      
      // Funções para templates, projetos e páginas
      loadTemplate: (elements) => {
        set(() => ({
          elements: cloneElements(elements),
          selectedElementId: null,
          unsavedChanges: true
        }));
        
        // Create a new snapshot for history
        get().createSnapshot();
      },
      
      clearCanvas: () => {
        set(() => ({
          elements: [],
          selectedElementId: null,
          unsavedChanges: true
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
            error: String(error),
            projectName: updatedProject.name,
            isNew: false
          };
        }
      },
      
      // Funções para controle da interface
      setViewMode: (mode) => {
        set({ viewMode: mode });
      },
      
      setEditorMode: (mode) => {
        set({ editorMode: mode });
      },
      
      setZoom: (zoom) => {
        set({ zoom });
      },
      
      togglePanel: (panel) => {
        set((state) => ({
          activePanel: state.activePanel === panel ? null : panel,
        }));
      },
      
      setActivePanel: (panel) => {
        set({ activePanel: panel });
      },
      
      toggleCodeEditor: () => {
        set((state) => ({
          codeEditorOpen: !state.codeEditorOpen,
        }));
      },
      
      setCodeEditorHeight: (height) => {
        set({ codeEditorHeight: height });
      },
      
      setCodeEditorLanguage: (language) => {
        set({ codeEditorLanguage: language });
      },
      
      updateCodeEditorContent: (content) => {
        set({ codeEditorContent: content });
      },
      
      setGridSize: (size) => {
        set({ gridSize: size });
      },
      
      toggleGuides: () => {
        set((state) => ({
          showGuides: !state.showGuides,
        }));
      },
      
      toggleGrid: () => {
        set((state) => ({
          showGrid: !state.showGrid,
        }));
      },
      
      toggleSnapToGrid: () => {
        set((state) => ({
          snapToGrid: !state.snapToGrid,
        }));
      },
      
      toggleSnapToElements: () => {
        set((state) => ({
          snapToElements: !state.snapToElements,
        }));
      },
      
      toggleRulers: () => {
        set((state) => ({
          rulers: !state.rulers,
        }));
      },
      
      toggleFullscreenPreview: () => {
        set((state) => {
          const newValue = !state.fullscreenPreview;
          
          // Adicionar/remover classe no body para estilização completa
          if (newValue) {
            document.body.classList.add('editor-fullscreen-mode');
          } else {
            document.body.classList.remove('editor-fullscreen-mode');
          }
          
          return { fullscreenPreview: newValue };
        });
      },
      
      setTheme: (theme) => {
        set({ theme });
      },
      
      resizePropertyPanel: (width) => {
        set({ propertyPanelWidth: width });
      },
      
      resizeElementLibrary: (width) => {
        set({ elementLibraryWidth: width });
      },

      // Funções ainda não implementadas completamente
      loadProject: async () => Promise.resolve(),
      createNewProject: () => {},
      addPage: () => undefined,
      removePage: () => {},
      renamePage: () => {},
      duplicatePage: () => {},
      setCurrentPage: () => {},
      updatePageMetadata: () => {},
      importProject: () => {},
      exportProject: () => '',
      exportHtml: () => '',
      publishProject: async () => ({ url: '' }),
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
