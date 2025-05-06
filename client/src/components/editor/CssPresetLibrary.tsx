import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface CssPresetLibraryProps {
  onApplyPreset: (styles: Record<string, string>) => void;
}

const CssPresetLibrary: React.FC<CssPresetLibraryProps> = ({ onApplyPreset }) => {
  const [activeTab, setActiveTab] = React.useState<string>('buttons');
  
  // Biblioteca de Estilos de Botões
  const buttonPresets = [
    {
      name: 'Botão Primário',
      styles: {
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: '#3B82F6',
        color: '#FFFFFF',
        fontWeight: 'bold',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.25)',
        textAlign: 'center',
      },
    },
    {
      name: 'Botão Secundário',
      styles: {
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: 'transparent',
        color: '#3B82F6',
        fontWeight: 'bold',
        borderRadius: '8px',
        border: '2px solid #3B82F6',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        textAlign: 'center',
      },
    },
    {
      name: 'Botão Arredondado',
      styles: {
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: '#10B981',
        color: '#FFFFFF',
        fontWeight: 'bold',
        borderRadius: '9999px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 4px 6px rgba(16, 185, 129, 0.25)',
        textAlign: 'center',
      },
    },
    {
      name: 'Botão Efeito 3D',
      styles: {
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: '#EF4444',
        color: '#FFFFFF',
        fontWeight: 'bold',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        top: '0',
        boxShadow: '0 6px 0 #B91C1C',
        transition: 'top 0.1s ease, box-shadow 0.1s ease',
        textAlign: 'center',
      },
    },
    {
      name: 'Botão Gradiente',
      styles: {
        display: 'inline-block',
        padding: '12px 24px',
        backgroundImage: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
        color: '#FFFFFF',
        fontWeight: 'bold',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(139, 92, 246, 0.25)',
        textAlign: 'center',
      },
    },
    {
      name: 'Botão Minimal',
      styles: {
        display: 'inline-block',
        padding: '10px 20px',
        backgroundColor: 'transparent',
        color: '#6B7280',
        fontWeight: 'medium',
        borderRadius: '4px',
        border: '1px solid #E5E7EB',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'center',
      },
    },
    {
      name: 'Botão com Ícone',
      styles: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        backgroundColor: '#4F46E5',
        color: '#FFFFFF',
        fontWeight: 'bold',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 6px rgba(79, 70, 229, 0.25)',
        textAlign: 'center',
      },
    },
    {
      name: 'Botão Grande',
      styles: {
        display: 'inline-block',
        padding: '16px 32px',
        backgroundColor: '#2563EB',
        color: '#FFFFFF',
        fontSize: '18px',
        fontWeight: 'bold',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(37, 99, 235, 0.25)',
        textAlign: 'center',
        letterSpacing: '0.025em',
      },
    },
    {
      name: 'Botão Fantasma',
      styles: {
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: 'transparent',
        color: '#6B7280',
        fontWeight: 'medium',
        borderRadius: '8px',
        border: '1px dashed #D1D5DB',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'center',
      },
    },
    {
      name: 'Botão com Destaque',
      styles: {
        display: 'inline-block',
        padding: '12px 24px',
        backgroundColor: '#FBBF24',
        color: '#ffffff',
        fontWeight: 'bold',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 0 0 3px rgba(251, 191, 36, 0.4)',
        textAlign: 'center',
      },
    },
  ];
  
  // Biblioteca de Estilos de Cards
  const cardPresets = [
    {
      name: 'Card Básico',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '350px',
        width: '100%',
      },
    },
    {
      name: 'Card com Borda',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        maxWidth: '350px',
        width: '100%',
      },
    },
    {
      name: 'Card Hover Efeito',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        maxWidth: '350px',
        width: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: 'translateY(0)',
      },
    },
    {
      name: 'Card Escuro',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        backgroundColor: '#1F2937',
        color: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        maxWidth: '350px',
        width: '100%',
      },
    },
    {
      name: 'Card Gradiente',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        backgroundImage: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
        color: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
        maxWidth: '350px',
        width: '100%',
      },
    },
    {
      name: 'Card Glassmorphism',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '350px',
        width: '100%',
      },
    },
    {
      name: 'Card com Destaque',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderLeft: '6px solid #3B82F6',
        maxWidth: '350px',
        width: '100%',
      },
    },
    {
      name: 'Card com Ícone',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '350px',
        width: '100%',
        position: 'relative',
        paddingTop: '60px',
      },
    },
    {
      name: 'Card Pricing',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '350px',
        width: '100%',
        textAlign: 'center',
      },
    },
    {
      name: 'Card de Produto',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '300px',
        width: '100%',
      },
    },
  ];
  
  // Biblioteca de Estilos de Texto
  const textPresets = [
    {
      name: 'Título Principal',
      styles: {
        fontSize: '36px',
        fontWeight: 'bold',
        lineHeight: '1.2',
        marginBottom: '16px',
        color: '#111827',
      },
    },
    {
      name: 'Subtítulo',
      styles: {
        fontSize: '24px',
        fontWeight: 'semibold',
        lineHeight: '1.4',
        marginBottom: '16px',
        color: '#374151',
      },
    },
    {
      name: 'Parágrafo Regular',
      styles: {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#4B5563',
        marginBottom: '16px',
      },
    },
    {
      name: 'Citação',
      styles: {
        fontSize: '18px',
        fontStyle: 'italic',
        lineHeight: '1.6',
        color: '#6B7280',
        borderLeft: '4px solid #9CA3AF',
        paddingLeft: '16px',
        marginLeft: '0',
        marginRight: '0',
        marginTop: '24px',
        marginBottom: '24px',
      },
    },
    {
      name: 'Destaque',
      styles: {
        fontSize: '16px',
        backgroundColor: '#FEFCE8',
        color: '#92400E',
        fontWeight: 'medium',
        padding: '2px 6px',
        borderRadius: '4px',
        display: 'inline-block',
      },
    },
    {
      name: 'Título com Gradiente',
      styles: {
        fontSize: '36px',
        fontWeight: 'bold',
        lineHeight: '1.2',
        marginBottom: '16px',
        backgroundImage: 'linear-gradient(45deg, #3B82F6, #8B5CF6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
      },
    },
    {
      name: 'Texto com Sombra',
      styles: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1F2937',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
      },
    },
    {
      name: 'Texto Caixa Alta',
      styles: {
        fontSize: '14px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#6B7280',
      },
    },
    {
      name: 'Texto de Notificação',
      styles: {
        fontSize: '14px',
        padding: '8px 12px',
        borderRadius: '4px',
        backgroundColor: '#EFF6FF',
        color: '#1E40AF',
        border: '1px solid #BFDBFE',
        display: 'inline-block',
      },
    },
    {
      name: 'Texto de Erro',
      styles: {
        fontSize: '14px',
        padding: '8px 12px',
        borderRadius: '4px',
        backgroundColor: '#FEF2F2',
        color: '#B91C1C',
        border: '1px solid #FEE2E2',
        display: 'inline-block',
      },
    },
  ];
  
  // Biblioteca de Estilos de Contêineres
  const containerPresets = [
    {
      name: 'Container Básico',
      styles: {
        maxWidth: '1200px',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    {
      name: 'Seção Completa',
      styles: {
        width: '100%',
        paddingTop: '80px',
        paddingBottom: '80px',
        backgroundColor: '#FFFFFF',
      },
    },
    {
      name: 'Seção Escura',
      styles: {
        width: '100%',
        paddingTop: '80px',
        paddingBottom: '80px',
        backgroundColor: '#1F2937',
        color: '#FFFFFF',
      },
    },
    {
      name: 'Seção de Destaque',
      styles: {
        width: '100%',
        paddingTop: '80px',
        paddingBottom: '80px',
        backgroundColor: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
        borderBottom: '1px solid #E5E7EB',
      },
    },
    {
      name: 'Hero Section',
      styles: {
        width: '100%',
        paddingTop: '120px',
        paddingBottom: '120px',
        backgroundColor: '#F3F4F6',
        backgroundImage: 'linear-gradient(120deg, #F3F4F6 0%, #E5E7EB 100%)',
        position: 'relative',
        overflow: 'hidden',
      },
    },
    {
      name: 'Grid Container 2 Cols',
      styles: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        width: '100%',
      },
    },
    {
      name: 'Grid Container 3 Cols',
      styles: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        width: '100%',
      },
    },
    {
      name: 'Flex Container Row',
      styles: {
        display: 'flex',
        flexDirection: 'row',
        gap: '24px',
        flexWrap: 'wrap',
        width: '100%',
      },
    },
    {
      name: 'Flex Container Col',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
      },
    },
    {
      name: 'Banner Container',
      styles: {
        width: '100%',
        padding: '32px',
        borderRadius: '12px',
        backgroundColor: '#818CF8',
        backgroundImage: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      },
    },
  ];
  
  // Biblioteca de Estilos Completos
  const fullComponentPresets = [
    {
      name: 'Cartão de Produto',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '300px',
        transition: 'transform 0.2s, box-shadow 0.2s',
      },
    },
    {
      name: 'Formulário de Contato',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '32px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%',
      },
    },
    {
      name: 'Notificação Toast',
      styles: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
        border: '1px solid #E5E7EB',
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: '1000',
      },
    },
    {
      name: 'Barra de Navegação',
      styles: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        width: '100%',
        position: 'sticky',
        top: '0',
        zIndex: '100',
      },
    },
    {
      name: 'Rodapé',
      styles: {
        backgroundColor: '#1F2937',
        color: '#FFFFFF',
        padding: '64px 24px 32px',
        width: '100%',
      },
    },
    {
      name: 'Testimunho',
      styles: {
        padding: '32px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        position: 'relative',
        paddingTop: '60px',
      },
    },
    {
      name: 'Alerta de Informação',
      styles: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        color: '#1E40AF',
        width: '100%',
      },
    },
    {
      name: 'Timeline Item',
      styles: {
        display: 'flex',
        gap: '16px',
        padding: '16px 0',
        position: 'relative',
        width: '100%',
      },
    },
    {
      name: 'Badge',
      styles: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 8px',
        fontSize: '12px',
        fontWeight: 'medium',
        borderRadius: '9999px',
        backgroundColor: '#3B82F6',
        color: '#FFFFFF',
      },
    },
    {
      name: 'Cartão de Preços',
      styles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '350px',
        width: '100%',
        textAlign: 'center',
        border: '1px solid #E5E7EB',
      },
    },
  ];
  
  const renderPresetButtons = (presets: any[]) => (
    <div className="grid grid-cols-2 gap-2 p-2">
      {presets.map((preset, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto py-3 text-xs flex flex-col items-center justify-center text-center"
          onClick={() => onApplyPreset(preset.styles)}
        >
          <div className="font-medium mb-1">{preset.name}</div>
        </Button>
      ))}
    </div>
  );
  
  return (
    <div className="h-full flex flex-col">
      <div className="text-base font-medium p-3 border-b border-border">
        Biblioteca de Estilos CSS
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start px-3 pt-3 pb-0 border-b border-border">
          <TabsTrigger 
            value="buttons" 
            className="text-xs rounded-t-md rounded-b-none border-b-0 data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border"
          >
            Botões
          </TabsTrigger>
          <TabsTrigger 
            value="cards" 
            className="text-xs rounded-t-md rounded-b-none border-b-0 data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border"
          >
            Cards
          </TabsTrigger>
          <TabsTrigger 
            value="text" 
            className="text-xs rounded-t-md rounded-b-none border-b-0 data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border"
          >
            Textos
          </TabsTrigger>
          <TabsTrigger 
            value="containers" 
            className="text-xs rounded-t-md rounded-b-none border-b-0 data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border"
          >
            Containers
          </TabsTrigger>
          <TabsTrigger 
            value="components" 
            className="text-xs rounded-t-md rounded-b-none border-b-0 data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:border-border"
          >
            Completos
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <TabsContent value="buttons" className="m-0 p-0 border-none focus:ring-0 focus:outline-none">
            {renderPresetButtons(buttonPresets)}
          </TabsContent>
          
          <TabsContent value="cards" className="m-0 p-0 border-none focus:ring-0 focus:outline-none">
            {renderPresetButtons(cardPresets)}
          </TabsContent>
          
          <TabsContent value="text" className="m-0 p-0 border-none focus:ring-0 focus:outline-none">
            {renderPresetButtons(textPresets)}
          </TabsContent>
          
          <TabsContent value="containers" className="m-0 p-0 border-none focus:ring-0 focus:outline-none">
            {renderPresetButtons(containerPresets)}
          </TabsContent>
          
          <TabsContent value="components" className="m-0 p-0 border-none focus:ring-0 focus:outline-none">
            {renderPresetButtons(fullComponentPresets)}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default CssPresetLibrary;
