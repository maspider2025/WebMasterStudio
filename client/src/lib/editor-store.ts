import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ElementTypes } from './element-types';

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

interface EditorState {
  // Elements and selection
  elements: Element[];
  selectedElementId: string | null;
  copiedElement: Element | null;
  history: Element[][];
  historyIndex: number;
  
  // Project
  currentProject: Project | null;
  currentPageId: string | null;
  
  // Canvas state
  canvasWidth: number;
  canvasHeight: number;
  
  // Actions
  addElement: (element: Omit<Element, 'id'> & { id?: string }) => void;
  selectElement: (id: string | null) => void;
  updateElementPosition: (id: string, dx: number, dy: number) => void;
  updateElementSize: (id: string, dimensions: Partial<{ width: number, height: number, x: number, y: number }>) => void;
  updateElementStyles: (id: string, styles: Record<string, any>) => void;
  updateElementContent: (id: string, updates: Partial<Omit<Element, 'id' | 'type'>>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  updateElementVisibility: (id: string, visible: boolean) => void;
  undo: () => void;
  redo: () => void;
  createSnapshot: () => void;
  loadTemplate: (elements: Element[]) => void;
  clearCanvas: () => void;
  saveProject: () => void;
  loadProject: (projectId: string) => Promise<void>;
  createNewProject: (name: string, description?: string) => void;
}

// Helper to create a deep copy of elements array
const cloneElements = (elements: Element[]): Element[] => {
  return JSON.parse(JSON.stringify(elements));
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      elements: [],
      selectedElementId: null,
      copiedElement: null,
      history: [[]],
      historyIndex: 0,
      currentProject: null,
      currentPageId: null,
      canvasWidth: 1200,
      canvasHeight: 800,
      
      // Actions
      addElement: (element) => {
        const newElement: Element = {
          id: element.id || `element-${Date.now()}`,
          type: element.type,
          name: element.name,
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
        };
        
        set((state) => {
          const newElements = [...state.elements, newElement];
          return { elements: newElements, selectedElementId: newElement.id };
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
          return;
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
        
        // We would typically save to API here
        // For now, just update local state
        set({ currentProject: updatedProject });
        
        // In a real application, we would persist to backend
        // Example:
        // apiRequest('PUT', `/api/projects/${currentProject.id}`, updatedProject);
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
