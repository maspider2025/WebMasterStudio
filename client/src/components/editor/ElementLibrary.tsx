import { useState } from "react";
import { useDrag } from "react-dnd";
import { elementTypes, ElementType, ElementTypes } from "@/lib/element-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import TemplateSelector from "./TemplateSelector";

type ElementCategory = 'basics' | 'layout' | 'forms' | 'ecommerce' | 'media';

const categoriesMap: Record<ElementCategory, { title: string, items: ElementType[] }> = {
  basics: {
    title: "Básicos",
    items: [
      elementTypes.container,
      elementTypes.text,
      elementTypes.heading,
      elementTypes.paragraph,
      elementTypes.button,
    ],
  },
  layout: {
    title: "Layout",
    items: [
      elementTypes.grid,
      elementTypes.flexbox,
      elementTypes.section,
      elementTypes.divider,
      elementTypes.footer,
    ],
  },
  forms: {
    title: "Formulários",
    items: [
      elementTypes.input,
      elementTypes.checkbox,
      elementTypes.select,
      elementTypes.form,
    ],
  },
  ecommerce: {
    title: "E-commerce",
    items: [
      elementTypes.productCard,
      elementTypes.productGallery,
      elementTypes.cart,
      elementTypes.checkout,
      elementTypes.carousel,
    ],
  },
  media: {
    title: "Mídia",
    items: [
      elementTypes.image,
      elementTypes.video,
      elementTypes.icon,
    ],
  },
};

const DraggableElement = ({ element }: { element: ElementType }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: element.type,
    item: { 
      type: element.type, 
      id: `new-${element.type}-${Date.now()}`,
      isNew: true,
      name: element.name,
      defaultWidth: element.defaultWidth,
      defaultHeight: element.defaultHeight,
      defaultContent: element.defaultContent,
      defaultStyles: element.defaultStyles
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [element]);

  return (
    <div 
      ref={drag} 
      className={`flex items-center px-4 py-2 cursor-grab hover:bg-muted/60 rounded transition-colors ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="w-5 h-5 mr-3 flex items-center justify-center">
        {element.icon}
      </div>
      <span>{element.name}</span>
    </div>
  );
};

const CategorySection = ({ category }: { category: ElementCategory }) => {
  const { title, items } = categoriesMap[category];
  
  return (
    <div>
      <div className="py-2 px-4 text-muted-foreground bg-secondary text-xs font-medium uppercase tracking-wider">
        {title}
      </div>
      <div className="py-1.5 text-sm">
        {items.map((element) => (
          <DraggableElement key={element.type} element={element} />
        ))}
      </div>
    </div>
  );
};

const ElementLibrary = () => {
  const [activeTab, setActiveTab] = useState<"components" | "pages">("components");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Filter elements based on search query
  const filteredElements = Object.keys(categoriesMap).reduce((acc, category) => {
    const categoryKey = category as ElementCategory;
    const filteredItems = categoriesMap[categoryKey].items.filter(
      item => item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filteredItems.length > 0) {
      acc[categoryKey] = {
        title: categoriesMap[categoryKey].title,
        items: filteredItems
      };
    }
    
    return acc;
  }, {} as Record<ElementCategory, { title: string, items: ElementType[] }>);

  return (
    <aside className="w-64 border-r border-border flex flex-col">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "components" | "pages")}>
        <TabsList className="w-full grid grid-cols-2 rounded-none">
          <TabsTrigger value="components">Componentes</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="components" className="flex flex-col flex-1 data-[state=inactive]:hidden">
          <div className="p-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar componentes..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {Object.keys(filteredElements).length > 0 ? (
              Object.keys(filteredElements).map((category) => (
                <CategorySection 
                  key={category} 
                  category={category as ElementCategory} 
                />
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Nenhum componente encontrado
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pages" className="flex-1 data-[state=inactive]:hidden">
          <div className="flex flex-col h-full items-center justify-center text-center p-4">
            <div className="text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mb-4">Gerencie suas páginas e navegação do site</p>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm">
                Nova Página
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Templates button at bottom */}
      <div className="border-t border-border p-3">
        <button 
          className="w-full bg-muted hover:bg-muted/80 text-foreground py-2 rounded text-sm flex items-center justify-center"
          onClick={() => setShowTemplates(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          Templates
        </button>
      </div>
      
      {showTemplates && <TemplateSelector onClose={() => setShowTemplates(false)} />}
    </aside>
  );
};

export default ElementLibrary;
