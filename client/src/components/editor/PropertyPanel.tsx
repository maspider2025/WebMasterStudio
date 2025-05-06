import { useState } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { ElementTypes } from "@/lib/element-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AIAssistant from "./AIAssistant";
import AdvancedCssEditor from "./AdvancedCssEditor";
import CssPresetLibrary from "./CssPresetLibrary";
import AnimationEditor from "./AnimationEditor";
import HtmlEditor from "./HtmlEditor";

const PropertyPanel = () => {
  const { 
    selectedElementId, 
    elements, 
    updateElementStyles, 
    updateElementContent,
    addAnimation,
    removeAnimation,
    updateAnimation 
  } = useEditorStore();
  
  const selectedElement = elements.find(el => el.id === selectedElementId);
  
  const [activeTab, setActiveTab] = useState<"properties" | "animations" | "data" | "code">("properties");
  const [assistantInput, setAssistantInput] = useState("");
  const [showAdvancedCssEditor, setShowAdvancedCssEditor] = useState(false);
  const [showCssLibrary, setShowCssLibrary] = useState(false);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);

  const updateStyle = (property: string, value: string) => {
    if (selectedElementId) {
      updateElementStyles(selectedElementId, { [property]: value });
    }
  };
  
  const applyMultipleStyles = (styles: Record<string, string>) => {
    if (selectedElementId) {
      updateElementStyles(selectedElementId, styles);
    }
  };
  
  const handleAddAnimation = (animation: any) => {
    if (selectedElementId) {
      addAnimation(selectedElementId, animation);
    }
  };
  
  const handleUpdateAnimation = (index: number, animation: any) => {
    if (selectedElementId) {
      updateAnimation(selectedElementId, index, animation);
    }
  };
  
  const handleRemoveAnimation = (index: number) => {
    if (selectedElementId) {
      removeAnimation(selectedElementId, index);
    }
  };
  
  const handleUpdateHtml = (html: string) => {
    if (selectedElementId) {
      updateElementContent(selectedElementId, { 
        content: html,
        customCode: {
          ...(selectedElement?.customCode || {}),
          html
        }
      });
    }
  };
  
  const handleUpdateCss = (css: string) => {
    if (selectedElementId) {
      updateElementContent(selectedElementId, { 
        customCode: {
          ...(selectedElement?.customCode || {}),
          css
        }
      });
    }
  };
  
  const handleUpdateJs = (js: string) => {
    if (selectedElementId) {
      updateElementContent(selectedElementId, { 
        customCode: {
          ...(selectedElement?.customCode || {}),
          js
        }
      });
    }
  };

  return (
    <aside className="w-80 border-l border-border flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full grid grid-cols-4 rounded-none">
          <TabsTrigger value="properties">Propriedades</TabsTrigger>
          <TabsTrigger value="animations">Animações</TabsTrigger>
          <TabsTrigger value="code">Código</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="flex-1 data-[state=inactive]:hidden p-4 overflow-y-auto">
          {selectedElement ? (
            <>
              {/* Element Information */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-medium text-foreground">Informações</h2>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowAdvancedCssEditor(true)}
                    >
                      Editor CSS
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 px-2 text-xs"
                      onClick={() => setShowCssLibrary(true)}
                    >
                      Biblioteca
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Nome do Elemento</Label>
                    <Input 
                      value={selectedElement.name || selectedElement.type}
                      onChange={(e) => updateElementContent(selectedElement.id, { name: e.target.value })}
                      className="mt-1.5 bg-muted border border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">ID</Label>
                    <Input 
                      value={selectedElement.id}
                      readOnly
                      className="mt-1.5 bg-muted border border-border"
                    />
                  </div>
                  {selectedElement.type === ElementTypes.text && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Conteúdo</Label>
                      <Input 
                        value={selectedElement.content || ''}
                        onChange={(e) => updateElementContent(selectedElement.id, { content: e.target.value })}
                        className="mt-1.5 bg-muted border border-border"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Layout Section */}
              <Accordion type="single" collapsible defaultValue="layout">
                <AccordionItem value="layout">
                  <AccordionTrigger className="text-sm font-medium py-2">Layout</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {/* Display */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Display</Label>
                        <div className="grid grid-cols-4 gap-1 mt-1.5">
                          <Button 
                            size="sm" 
                            variant={selectedElement.styles?.display === 'flex' ? 'default' : 'outline'}
                            className="py-1.5 text-xs"
                            onClick={() => updateStyle('display', 'flex')}
                          >
                            Flex
                          </Button>
                          <Button 
                            size="sm" 
                            variant={selectedElement.styles?.display === 'block' ? 'default' : 'outline'}
                            className="py-1.5 text-xs"
                            onClick={() => updateStyle('display', 'block')}
                          >
                            Block
                          </Button>
                          <Button 
                            size="sm" 
                            variant={selectedElement.styles?.display === 'grid' ? 'default' : 'outline'}
                            className="py-1.5 text-xs"
                            onClick={() => updateStyle('display', 'grid')}
                          >
                            Grid
                          </Button>
                          <Button 
                            size="sm" 
                            variant={selectedElement.styles?.display === 'inline' ? 'default' : 'outline'}
                            className="py-1.5 text-xs"
                            onClick={() => updateStyle('display', 'inline')}
                          >
                            Inline
                          </Button>
                        </div>
                      </div>
                      
                      {/* Only show these options if display is flex */}
                      {selectedElement.styles?.display === 'flex' && (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground">Justify Content</Label>
                            <div className="grid grid-cols-3 gap-1 mt-1.5">
                              <Button 
                                size="sm" 
                                variant={selectedElement.styles?.justifyContent === 'flex-start' ? 'default' : 'outline'}
                                className="py-1.5 text-xs"
                                onClick={() => updateStyle('justifyContent', 'flex-start')}
                              >
                                Start
                              </Button>
                              <Button 
                                size="sm" 
                                variant={selectedElement.styles?.justifyContent === 'center' ? 'default' : 'outline'}
                                className="py-1.5 text-xs"
                                onClick={() => updateStyle('justifyContent', 'center')}
                              >
                                Center
                              </Button>
                              <Button 
                                size="sm" 
                                variant={selectedElement.styles?.justifyContent === 'space-between' ? 'default' : 'outline'}
                                className="py-1.5 text-xs"
                                onClick={() => updateStyle('justifyContent', 'space-between')}
                              >
                                Between
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Align Items</Label>
                            <div className="grid grid-cols-3 gap-1 mt-1.5">
                              <Button 
                                size="sm" 
                                variant={selectedElement.styles?.alignItems === 'flex-start' ? 'default' : 'outline'}
                                className="py-1.5 text-xs"
                                onClick={() => updateStyle('alignItems', 'flex-start')}
                              >
                                Start
                              </Button>
                              <Button 
                                size="sm" 
                                variant={selectedElement.styles?.alignItems === 'center' ? 'default' : 'outline'}
                                className="py-1.5 text-xs"
                                onClick={() => updateStyle('alignItems', 'center')}
                              >
                                Center
                              </Button>
                              <Button 
                                size="sm" 
                                variant={selectedElement.styles?.alignItems === 'flex-end' ? 'default' : 'outline'}
                                className="py-1.5 text-xs"
                                onClick={() => updateStyle('alignItems', 'flex-end')}
                              >
                                End
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Padding */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Padding</Label>
                        <div className="grid grid-cols-4 gap-2 mt-1.5">
                          <div>
                            <span className="block text-xs text-center text-muted-foreground mb-1">Top</span>
                            <Input
                              value={selectedElement.styles?.paddingTop || '0px'}
                              onChange={(e) => updateStyle('paddingTop', e.target.value)}
                              className="w-full bg-muted border border-border px-2 py-1 text-xs text-center"
                            />
                          </div>
                          <div>
                            <span className="block text-xs text-center text-muted-foreground mb-1">Right</span>
                            <Input
                              value={selectedElement.styles?.paddingRight || '0px'}
                              onChange={(e) => updateStyle('paddingRight', e.target.value)}
                              className="w-full bg-muted border border-border px-2 py-1 text-xs text-center"
                            />
                          </div>
                          <div>
                            <span className="block text-xs text-center text-muted-foreground mb-1">Bottom</span>
                            <Input
                              value={selectedElement.styles?.paddingBottom || '0px'}
                              onChange={(e) => updateStyle('paddingBottom', e.target.value)}
                              className="w-full bg-muted border border-border px-2 py-1 text-xs text-center"
                            />
                          </div>
                          <div>
                            <span className="block text-xs text-center text-muted-foreground mb-1">Left</span>
                            <Input
                              value={selectedElement.styles?.paddingLeft || '0px'}
                              onChange={(e) => updateStyle('paddingLeft', e.target.value)}
                              className="w-full bg-muted border border-border px-2 py-1 text-xs text-center"
                            />
                          </div>
                        </div>
                        <div className="flex justify-center mt-2">
                          <Button size="icon" variant="outline" className="h-6 w-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* Style Section */}
              <Accordion type="single" collapsible className="mt-3">
                <AccordionItem value="style">
                  <AccordionTrigger className="text-sm font-medium py-2">Estilo</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {/* Background */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Fundo</Label>
                        <div className="flex mt-1.5">
                          <div 
                            className="w-10 h-10 rounded-l-md border border-border flex items-center justify-center"
                            style={{ backgroundColor: selectedElement.styles?.backgroundColor || 'transparent' }}
                          >
                            <div 
                              className="w-6 h-6 rounded border border-white"
                              style={{ backgroundColor: selectedElement.styles?.backgroundColor || 'transparent' }}
                            ></div>
                          </div>
                          <Input
                            value={selectedElement.styles?.backgroundColor || ''}
                            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                            className="flex-1 rounded-l-none border-l-0 bg-muted border border-border"
                          />
                        </div>
                      </div>
                      
                      {/* Border */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Borda</Label>
                        <div className="grid grid-cols-2 gap-2 mt-1.5">
                          <select 
                            className="appearance-none bg-muted border border-border rounded py-2 px-3 text-sm"
                            value={selectedElement.styles?.borderStyle || 'none'}
                            onChange={(e) => updateStyle('borderStyle', e.target.value)}
                          >
                            <option value="none">Nenhuma</option>
                            <option value="solid">Sólida</option>
                            <option value="dashed">Tracejada</option>
                            <option value="dotted">Pontilhada</option>
                          </select>
                          <Input
                            value={selectedElement.styles?.borderWidth || '0px'}
                            onChange={(e) => updateStyle('borderWidth', e.target.value)}
                            className="bg-muted border border-border"
                          />
                        </div>
                        <div className="flex items-center mt-2">
                          <div 
                            className="w-8 h-8 rounded-l-md bg-muted border border-border flex items-center justify-center"
                            style={{ backgroundColor: selectedElement.styles?.borderColor || 'transparent' }}
                          >
                            <div 
                              className="w-4 h-4 rounded border border-muted-foreground"
                              style={{ backgroundColor: selectedElement.styles?.borderColor || 'transparent' }}
                            ></div>
                          </div>
                          <Input
                            value={selectedElement.styles?.borderColor || ''}
                            onChange={(e) => updateStyle('borderColor', e.target.value)}
                            className="flex-1 rounded-l-none border-l-0 bg-muted border border-border"
                          />
                        </div>
                      </div>
                      
                      {/* Border radius */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Arredondamento</Label>
                        <div className="flex mt-1.5">
                          <Button size="icon" variant="outline" className="rounded-r-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                          </Button>
                          <Input
                            value={selectedElement.styles?.borderRadius || '0px'}
                            onChange={(e) => updateStyle('borderRadius', e.target.value)}
                            className="flex-1 rounded-none border-x-0 text-center bg-muted border border-border"
                          />
                          <Button size="icon" variant="outline" className="rounded-l-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* Advanced Section */}
              <Accordion type="single" collapsible className="mt-3">
                <AccordionItem value="advanced">
                  <AccordionTrigger className="text-sm font-medium py-2">Avançado</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="bg-muted p-3 rounded-lg border border-border">
                        <div className="flex items-center text-muted-foreground hover:text-foreground cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          <span className="text-sm">Efeitos e Animações</span>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-3 rounded-lg border border-border">
                        <div className="flex items-center text-muted-foreground hover:text-foreground cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-sm">Responsividade</span>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-3 rounded-lg border border-border">
                        <div className="flex items-center text-muted-foreground hover:text-foreground cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          <span className="text-sm">Código Personalizado</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-4">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-muted-foreground">Selecione um elemento no canvas para editar suas propriedades</p>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="animations" className="flex-1 data-[state=inactive]:hidden overflow-y-auto p-0">
          {selectedElement ? (
            <AnimationEditor
              animations={selectedElement.animations || []}
              onAddAnimation={handleAddAnimation}
              onUpdateAnimation={handleUpdateAnimation}
              onRemoveAnimation={handleRemoveAnimation}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-center p-4 text-muted-foreground">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium">Selecione um elemento</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Selecione um elemento para adicionar ou editar animações.
                </p>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="code" className="flex-1 data-[state=inactive]:hidden overflow-y-auto p-0">
          {selectedElement ? (
            <div className="p-4">
              <div className="space-y-4">
                <Button 
                  className="w-full"
                  onClick={() => setShowHtmlEditor(true)}
                >
                  Abrir Editor HTML/CSS/JavaScript
                </Button>
                
                <div>
                  <Label className="text-sm font-medium">Classes CSS</Label>
                  <Input
                    value={selectedElement.cssClasses?.join(' ') || ''}
                    onChange={(e) => {
                      const classes = e.target.value.split(' ').filter(Boolean);
                      updateElementContent(selectedElement.id, { cssClasses: classes });
                    }}
                    className="mt-1.5 bg-muted border border-border"
                    placeholder="Exemplo: btn btn-primary size-lg"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Atributos HTML</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <Input
                      placeholder="Nome do atributo"
                      className="bg-muted border border-border"
                    />
                    <Input
                      placeholder="Valor"
                      className="bg-muted border border-border"
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" variant="outline">
                      Adicionar Atributo
                    </Button>
                  </div>
                </div>
                
                {selectedElement.htmlAttributes && Object.keys(selectedElement.htmlAttributes).length > 0 && (
                  <div className="bg-muted/50 rounded-md p-3 border border-border mt-2">
                    <Label className="text-xs text-muted-foreground">Atributos atuais:</Label>
                    <div className="mt-1 space-y-1">
                      {Object.entries(selectedElement.htmlAttributes).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="font-mono">{key}</span>
                          <span className="font-mono text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-4 text-muted-foreground">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h3 className="mt-4 text-lg font-medium">Selecione um elemento</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Selecione um elemento para editar seu código e atributos.
                </p>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="data" className="flex-1 data-[state=inactive]:hidden p-4">
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <p className="text-muted-foreground mb-4">
                Conecte elementos a fontes de dados dinâmicas e APIs
              </p>
              <Button disabled>Configurar Dados</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* AI Assistant */}
      <div className="border-t border-border p-3">
        <div className="bg-muted p-3 rounded-lg flex items-start">
          <div className="flex-shrink-0 p-1.5 rounded-full bg-gradient-to-r from-secondary to-accent">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-muted-foreground">Assistente IA: Como posso ajudar com este elemento?</p>
            <div className="mt-2 relative">
              <Input
                type="text"
                placeholder="Pergunte algo..."
                className="w-full bg-secondary border border-border rounded-full pr-9"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 top-1 h-6 w-6 text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs para editores avançados */}
      <Dialog open={showAdvancedCssEditor} onOpenChange={setShowAdvancedCssEditor}>
        <DialogContent className="sm:max-w-[90%] h-[90vh] max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Editor CSS Avançado</DialogTitle>
            <DialogDescription>
              Configure opções avançadas de estilo para o elemento selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {selectedElement && (
              <AdvancedCssEditor 
                styles={selectedElement.styles || {}} 
                onStyleChange={updateStyle} 
                element={selectedElement}
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAdvancedCssEditor(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCssLibrary} onOpenChange={setShowCssLibrary}>
        <DialogContent className="sm:max-w-[90%] h-[90vh] max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Biblioteca de Estilos CSS</DialogTitle>
            <DialogDescription>
              Selecione estilos pré-definidos para aplicar ao elemento selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {selectedElement && (
              <CssPresetLibrary onApplyPreset={(styles) => {
                Object.entries(styles).forEach(([property, value]) => {
                  updateStyle(property, value);
                });
              }} />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCssLibrary(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showHtmlEditor} onOpenChange={setShowHtmlEditor}>
        <DialogContent className="sm:max-w-[90%] h-[90vh] max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Editor de Código</DialogTitle>
            <DialogDescription>
              Edite diretamente o HTML, CSS e JavaScript do elemento selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {selectedElement && (
              <HtmlEditor
                htmlContent={selectedElement.customCode?.html || selectedElement.content || ''}
                cssContent={selectedElement.customCode?.css || ''}
                jsContent={selectedElement.customCode?.js || ''}
                onHtmlChange={(html) => handleUpdateHtml(html)}
                onCssChange={(css) => handleUpdateCss(css)}
                onJsChange={(js) => handleUpdateJs(js)}
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHtmlEditor(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default PropertyPanel;
