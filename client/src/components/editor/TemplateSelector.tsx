import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { templates, TemplateCategory } from "@/lib/templates";
import { useToast } from "@/hooks/use-toast";
import { useEditorStore } from "@/lib/editor-store";

interface TemplateSelectorProps {
  onClose: () => void;
}

const TemplateSelector = ({ onClose }: TemplateSelectorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("ecommerce");
  const { toast } = useToast();
  const { loadTemplate } = useEditorStore();
  
  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      const template = templates[activeCategory].items.find(t => t.id === selectedTemplate);
      if (template) {
        loadTemplate(template.elements);
        toast({
          title: "Template aplicado",
          description: `O template ${template.name} foi aplicado com sucesso.`
        });
        onClose();
      }
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecione um Template</DialogTitle>
          <DialogDescription>
            Escolha um modelo de página para começar seu projeto rapidamente.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          defaultValue="ecommerce" 
          value={activeCategory}
          onValueChange={(value) => setActiveCategory(value as TemplateCategory)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="ecommerce" className="text-primary-foreground bg-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              E-commerce
            </TabsTrigger>
            <TabsTrigger value="landing">Landing Pages</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto mt-6 pr-2">
            <TabsContent value={activeCategory} className="mt-0 h-full">
              {activeCategory === "ecommerce" && (
                <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-2">Templates de E-commerce avançados</h3>
                  <p className="text-muted-foreground mb-3">
                    Nossa coleção de templates de e-commerce foi desenvolvida para oferecer uma solução completa e profissional, 
                    com seções totalmente editáveis para banners, galerias de produtos, destaques, categorias e rodapé.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-background border border-border text-xs rounded-full">Banners promocionais</span>
                    <span className="px-2 py-1 bg-background border border-border text-xs rounded-full">Galerias de produtos</span>
                    <span className="px-2 py-1 bg-background border border-border text-xs rounded-full">Seções de categorias</span>
                    <span className="px-2 py-1 bg-background border border-border text-xs rounded-full">Depoimentos</span>
                    <span className="px-2 py-1 bg-background border border-border text-xs rounded-full">SEO otimizado</span>
                  </div>
                </div>
              )}
              
              <div className={`grid ${activeCategory === "ecommerce" ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'} gap-5`}>
                {templates[activeCategory].items.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-md ${selectedTemplate === template.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="relative h-48 bg-secondary overflow-hidden">
                      <img 
                        src={template.thumbnail} 
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      {activeCategory === "ecommerce" && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                          {template.id === "ecommerce-1" ? "Recomendado" : 
                          template.id === "ecommerce-2" ? "Multivendor" : 
                          template.id === "ecommerce-3" ? "Moda" : "Premium"}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-1">{template.name}</h3>
                      <p className="text-muted-foreground text-sm">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="mt-4 pt-4 border-t border-border">
          <div className="mr-auto text-sm text-muted-foreground">
            {selectedTemplate && templates[activeCategory].items.find(t => t.id === selectedTemplate)?.name}
          </div>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleApplyTemplate}
            disabled={!selectedTemplate}
            className="gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Aplicar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelector;
