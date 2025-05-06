import { useState, useEffect, useRef, useCallback } from "react";
import { useDrop } from "react-dnd";
import { useToast } from "@/hooks/use-toast";
import { useEditorStore } from "@/lib/editor-store";
import { ElementTypes } from "@/lib/element-types";
import { ViewMode } from "@/pages/editor";
import AIAssistant from "./AIAssistant";
import ResizableElement from "@/components/ui/resizable-element";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    updateElementPosition,
    clearCanvas,
    loadTemplate
  } = useEditorStore();
  
  const [showAITip, setShowAITip] = useState(false);
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');
  const [templateViewportMode, setTemplateViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const canvasRef = useRef<HTMLDivElement>(null);
  // Armazenamento alternativo para a referência do canvas
  const canvasRefValue = useRef<HTMLElement | null>(null);

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

  // Helper function to handle template loading
  const handleLoadEcommerceTemplate = useCallback(() => {
    // Import the e-commerce template module and load it
    import('@/lib/templates').then(({ templates }) => {
      const ecommerceTemplates = templates.ecommerce.items;
      if (ecommerceTemplates && ecommerceTemplates.length > 0) {
        const template = ecommerceTemplates[0]; // Load the first e-commerce template
        loadTemplate(template.elements);
        toast({
          title: "Template carregado",
          description: `O template de e-commerce ${template.name} foi carregado com sucesso.`
        });
      }
    });
  }, [loadTemplate, toast]);

  // Function to get viewport width based on current mode
  const getPreviewWidth = () => {
    switch(templateViewportMode) {
      case 'mobile': return { width: '375px', maxWidth: '100%' };
      case 'tablet': return { width: '768px', maxWidth: '100%' };
      case 'desktop':
      default: return { width: '100%', maxWidth: '1200px' };
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-secondary flex flex-col items-center justify-center p-4">
      {/* Tabs for switching between editor and preview */}
      <div className="w-full max-w-5xl mb-3 flex flex-col">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'editor' | 'preview')} className="w-full">
          <div className="flex items-center justify-between mb-2">
            <TabsList className="grid grid-cols-2 w-64">
              <TabsTrigger value="editor" className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H2a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4a2 2 0 114 0v1a1 1 0 001 1h1a2 2 0 100-4H7a1 1 0 00-1 1v1a1 1 0 01-1 1H2a1 1 0 00-1 1v3a1 1 0 001 1h1a2 2 0 110 4H2a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 011-1v-1a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 011-1h1a2 2 0 110-4h-1a1 1 0 01-1-1V7a1 1 0 00-1-1h-3a1 1 0 01-1-1V4z" />
                </svg>
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Visualizar
              </TabsTrigger>
            </TabsList>

            {activeView === 'preview' && (
              <div className="flex items-center space-x-2">
                <TabsList className="grid grid-cols-3 w-40">
                  <TabsTrigger value="desktop" onClick={() => setTemplateViewportMode('desktop')} 
                    className={`px-2 ${templateViewportMode === 'desktop' ? 'bg-primary text-primary-foreground' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </TabsTrigger>
                  <TabsTrigger value="tablet" onClick={() => setTemplateViewportMode('tablet')}
                    className={`px-2 ${templateViewportMode === 'tablet' ? 'bg-primary text-primary-foreground' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </TabsTrigger>
                  <TabsTrigger value="mobile" onClick={() => setTemplateViewportMode('mobile')}
                    className={`px-2 ${templateViewportMode === 'mobile' ? 'bg-primary text-primary-foreground' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </TabsTrigger>
                </TabsList>
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-background border border-border rounded-lg shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-xs font-medium text-muted-foreground bg-secondary rounded-md px-2 py-1">
                {activeView === 'editor' 
                  ? (viewMode === 'desktop' ? 'Editor Desktop' : viewMode === 'tablet' ? 'Editor Tablet' : 'Editor Mobile')
                  : (templateViewportMode === 'desktop' ? 'Visualização Desktop' : templateViewportMode === 'tablet' ? 'Visualização Tablet' : 'Visualização Mobile')  
                }
              </div>
            </div>
            <div className="text-xs text-muted-foreground">nextgen-sitebuilder.replit.app</div>
            <div className="text-xs font-medium text-muted-foreground bg-secondary rounded-md px-2 py-1">
              {activeView === 'editor' ? `Zoom: ${zoom}%` : 'Visualização de Template'}
            </div>
          </div>

          <TabsContent value="editor" className="mt-3">
            <div className="relative w-full bg-muted rounded-lg shadow-lg p-4 border border-border">
              {/* Canvas controls */}
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="sm" onClick={() => useEditorStore.getState().undo()} title="Desfazer (Ctrl+Z)">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => useEditorStore.getState().redo()} title="Refazer (Ctrl+Y)">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                    </svg>
                  </Button>
                </div>

                <div className="h-6 w-px bg-border mx-1"></div>

                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="sm" onClick={() => useEditorStore.getState().toggleGrid()} 
                    className={useEditorStore.getState().showGrid ? 'bg-primary/20' : ''} title="Mostrar/Esconder Grade">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => useEditorStore.getState().toggleSnapToGrid()} 
                    className={useEditorStore.getState().snapToGrid ? 'bg-primary/20' : ''} title="Ativar/Desativar Ajuste à Grade">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </Button>
                </div>

                <div className="h-6 w-px bg-border mx-1"></div>

                <div className="flex items-center space-x-1">
                  <Button variant="outline" size="sm" onClick={() => useEditorStore.getState().saveProject()} title="Salvar Projeto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => useEditorStore.getState().toggleFullscreenPreview()} 
                    title="Visualização em Tela Cheia">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  </Button>
                </div>

                <div className="h-6 w-px bg-border mx-1"></div>
                
                {/* Botões para remover elementos */}
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={selectedElementId ? 'bg-destructive/20 hover:bg-destructive/30' : 'opacity-50'}
                    onClick={() => selectedElementId && useEditorStore.getState().deleteElement(selectedElementId)} 
                    title="Remover Elemento Selecionado"
                    disabled={!selectedElementId}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-red-500/10 hover:bg-red-500/30"
                    onClick={() => useEditorStore.getState().clearCanvas()} 
                    title="Limpar Todos os Elementos"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-xs ml-1">Limpar Tudo</span>
                  </Button>
                </div>
                
                <div className="h-6 w-px bg-border mx-1"></div>

                <div className="flex items-center space-x-1">
                  <select
                    className="h-8 w-36 rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={useEditorStore.getState().currentPageId || ''}
                    onChange={(e) => useEditorStore.getState().setCurrentPage(e.target.value)}
                  >
                    {useEditorStore.getState().allPages.map(page => (
                      <option key={page.id} value={page.id}>{page.name}</option>
                    ))}
                    {useEditorStore.getState().allPages.length === 0 && (
                      <option value="">Página Principal</option>
                    )}
                  </select>
                  <Button variant="outline" size="sm" title="Adicionar Nova Página">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </Button>
                </div>
              </div>

              <div 
                id="editor-canvas"
                ref={drop}
                className={`w-full bg-white shadow-xl relative overflow-y-auto mx-auto rounded-md ${
                  useEditorStore.getState().showGrid ? 'canvas-grid' : ''
                } ${
                  useEditorStore.getState().gridSize === 'small' ? 'grid-small' : 
                  useEditorStore.getState().gridSize === 'medium' ? 'grid-medium' : 
                  useEditorStore.getState().gridSize === 'large' ? 'grid-large' : ''
                }`}
                style={{ 
                  width: getViewModeWidth(),
                  minHeight: 600,
                  maxHeight: 800,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center top',
                  backgroundSize: useEditorStore.getState().gridSize === 'small' ? '8px 8px' : 
                                  useEditorStore.getState().gridSize === 'medium' ? '16px 16px' : 
                                  useEditorStore.getState().gridSize === 'large' ? '32px 32px' : '16px 16px',
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

                {elements.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-muted/10">
                    <div className="mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="text-lg font-semibold mb-1">Comece a criar seu site</h3>
                      <p className="text-muted-foreground mb-4">Arraste elementos da biblioteca ou escolha um template</p>
                      
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={handleLoadEcommerceTemplate}
                          className="flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Carregar Template E-commerce
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-2 right-2 bg-background border border-border rounded-md px-3 py-1.5 shadow-sm text-xs font-medium text-muted-foreground">
                Editor NextGen Site Builder
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-3">
            <div className="relative w-full bg-background rounded-lg shadow-lg border border-border p-4 flex flex-col items-center">
              <div className="bg-[#f5f5f7] w-full overflow-hidden rounded-md border border-border" 
                style={{ maxHeight: '800px', overflowY: 'auto' }}>
                <div className="mx-auto" style={getPreviewWidth()}>
                  <div className="preview-container">
                    {elements.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[500px]">
                        <div className="text-center p-8">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <h3 className="text-lg font-semibold mb-2">Prévia não disponível</h3>
                          <p className="text-muted-foreground mb-4">Você ainda não adicionou elementos ao seu site.</p>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={handleLoadEcommerceTemplate}
                          >
                            Carregar Template E-commerce
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="template-preview">
                        {/* Render the elements in a non-editable mode */}
                        <div className="relative" style={{ minHeight: '500px' }}>
                          {elements.map((element) => (
                            <div
                              key={element.id}
                              className="absolute"
                              style={{
                                left: `${element.x}px`,
                                top: `${element.y}px`,
                                width: `${element.width}px`,
                                height: `${element.height}px`,
                                zIndex: element.zIndex || 1,
                                ...element.styles,
                              }}
                            >
                              {element.type === ElementTypes.text && element.content}
                              {element.type === ElementTypes.heading && (
                                <h2 style={element.styles}>{element.content}</h2>
                              )}
                              {element.type === ElementTypes.paragraph && (
                                <p style={element.styles}>{element.content}</p>
                              )}
                              {element.type === ElementTypes.button && (
                                <button style={element.styles}>{element.content}</button>
                              )}
                              {element.type === ElementTypes.image && (
                                <img src={element.src} alt={element.alt || ''} style={element.styles} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between w-full mt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setActiveView('editor')} className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                        </svg>
                        Voltar ao Editor
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Voltar para o editor para modificar seu site</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Exportar HTML
                  </Button>
                  <Button size="sm" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Publicar Site
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Canvas;
