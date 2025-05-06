import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import Header from "@/components/editor/Header";
import ElementLibrary from "@/components/editor/ElementLibrary";
import Canvas from "@/components/editor/Canvas";
import PropertyPanel from "@/components/editor/PropertyPanel";
import CodeEditor from "@/components/editor/CodeEditor";
import { DatabaseVisualizer } from "@/components/editor/DatabaseVisualizer";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useEditorStore } from "@/lib/editor-store";
import { useToast } from "@/hooks/use-toast";

export type ViewMode = "desktop" | "tablet" | "mobile";

export default function Editor() {
  const [showCodeEditor, setShowCodeEditor] = useState(true);
  const [codeEditorHeight, setCodeEditorHeight] = useState(250);
  const [codeEditorTab, setCodeEditorTab] = useState<"html" | "css" | "javascript" | "database" | "api">("html");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [zoom, setZoom] = useState(100);
  
  const { loadTemplate } = useEditorStore();
  const { toast } = useToast();
  const [location] = useLocation();

  // Load template from URL parameter if specified
  const loadTemplateFromUrl = useCallback(async () => {
    // Parse template parameter from URL
    const params = new URLSearchParams(window.location.search);
    const templateType = params.get('template');
    
    if (templateType === 'ecommerce') {
      // Import the template module and load the e-commerce template
      try {
        const { templates } = await import('@/lib/templates');
        const ecommerceTemplates = templates.ecommerce.items;
        
        if (ecommerceTemplates && ecommerceTemplates.length > 0) {
          // Load the first e-commerce template
          const template = ecommerceTemplates[0];
          loadTemplate(template.elements);
          
          toast({
            title: "Template carregado",
            description: `O template de e-commerce ${template.name} foi carregado com sucesso.`
          });
        }
      } catch (error) {
        console.error('Erro ao carregar template:', error);
        toast({
          title: "Erro ao carregar template",
          description: "Não foi possível carregar o template solicitado.",
          variant: "destructive"
        });
      }
    }
  }, [loadTemplate, toast]);

  // Run once when the component mounts
  useEffect(() => {
    loadTemplateFromUrl();
  }, [loadTemplateFromUrl]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle code editor with Alt+C
      if (e.altKey && e.key === "c") {
        setShowCodeEditor(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <Header 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <ElementLibrary />
          
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-2 border-b border-border bg-secondary">
              <div className="flex items-center space-x-2">
                <button className="p-1.5 rounded hover:bg-secondary/90 text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button className="p-1.5 rounded hover:bg-secondary/90 text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                <div className="relative w-24">
                  <select 
                    className="w-full appearance-none bg-muted border border-border rounded py-1 px-2 pr-7 text-sm"
                    value={zoom}
                    onChange={(e) => setZoom(parseInt(e.target.value))}
                  >
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                    <option value={125}>125%</option>
                    <option value={150}>150%</option>
                  </select>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-2 top-1.5 pointer-events-none text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-1.5 rounded hover:bg-secondary/90 text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <button className="p-1.5 rounded hover:bg-secondary/90 text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="h-5 border-l border-border"></div>
                <button className="p-1.5 rounded hover:bg-secondary/90 text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button className="p-1.5 rounded hover:bg-secondary/90 text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <Canvas viewMode={viewMode} zoom={zoom} />
            
            {showCodeEditor && (
              <div 
                className="border-t border-border bg-background" 
                style={{ height: codeEditorHeight + 'px' }}
              >
                <div className="flex items-center border-b border-border">
                  <button 
                    className={`py-2 px-4 text-sm font-medium ${codeEditorTab === 'html' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setCodeEditorTab('html')}
                  >
                    HTML
                  </button>
                  <button 
                    className={`py-2 px-4 text-sm ${codeEditorTab === 'css' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setCodeEditorTab('css')}
                  >
                    CSS
                  </button>
                  <button 
                    className={`py-2 px-4 text-sm ${codeEditorTab === 'javascript' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setCodeEditorTab('javascript')}
                  >
                    JavaScript
                  </button>
                  <button 
                    className={`py-2 px-4 text-sm ${codeEditorTab === 'database' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setCodeEditorTab('database')}
                  >
                    Banco de Dados
                  </button>
                  <button 
                    className={`py-2 px-4 text-sm ${codeEditorTab === 'api' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setCodeEditorTab('api')}
                  >
                    API
                  </button>
                  <div className="flex-1"></div>
                  <button 
                    className="p-1.5 hover:bg-secondary rounded"
                    onClick={() => setShowCodeEditor(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {codeEditorTab === 'database' ? (
                  <div className="h-full overflow-hidden">
                    <DatabaseVisualizer projectId="default" />
                  </div>
                ) : (
                  <CodeEditor 
                    language={codeEditorTab} 
                    onResize={(newHeight) => setCodeEditorHeight(newHeight)}
                  />
                )}
              </div>
            )}
          </main>
          
          <PropertyPanel />
        </div>
      </div>
    </DndProvider>
  );
}
