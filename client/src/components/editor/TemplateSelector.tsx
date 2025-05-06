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
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("landing");
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
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecione um Template</DialogTitle>
          <DialogDescription>
            Escolha um modelo de página para começar seu projeto rapidamente.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          defaultValue="landing" 
          value={activeCategory}
          onValueChange={(value) => setActiveCategory(value as TemplateCategory)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="landing">Landing Pages</TabsTrigger>
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <TabsContent value={activeCategory} className="mt-0 h-full">
              <div className="grid grid-cols-2 gap-4">
                {templates[activeCategory].items.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer overflow-hidden ${selectedTemplate === template.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="relative h-48 bg-secondary overflow-hidden">
                      <img 
                        src={template.thumbnail} 
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-muted-foreground text-sm">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleApplyTemplate}
            disabled={!selectedTemplate}
          >
            Aplicar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelector;
