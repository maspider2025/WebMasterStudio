import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface AdvancedCssEditorProps {
  styles: Record<string, any>;
  onStyleChange: (property: string, value: string) => void;
  element: any; // O elemento atual selecionado
}

const AdvancedCssEditor: React.FC<AdvancedCssEditorProps> = ({ styles, onStyleChange, element }) => {
  const [cssCode, setCssCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('visual');
  const [activeVisualTab, setActiveVisualTab] = useState<string>('typography');
  const [colorPickerProperty, setColorPickerProperty] = useState<string | null>(null);
  
  // Presets para propriedades comuns
  const fontFamilyPresets = [
    { label: 'Sans-serif', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
    { label: 'Monospace', value: '"Courier New", Courier, monospace' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Garamond', value: 'Garamond, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Courier New', value: '"Courier New", Courier, monospace' },
    { label: 'Brush Script MT', value: '"Brush Script MT", cursive' },
    { label: 'System UI', value: 'system-ui' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Open Sans', value: '"Open Sans", sans-serif' },
    { label: 'Lato', value: 'Lato, sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Playfair Display', value: '"Playfair Display", serif' },
  ];
  
  const fontWeightPresets = [
    { label: 'Normal', value: 'normal' },
    { label: 'Bold', value: 'bold' },
    { label: 'Thin (100)', value: '100' },
    { label: 'Extra Light (200)', value: '200' },
    { label: 'Light (300)', value: '300' },
    { label: 'Regular (400)', value: '400' },
    { label: 'Medium (500)', value: '500' },
    { label: 'Semi Bold (600)', value: '600' },
    { label: 'Bold (700)', value: '700' },
    { label: 'Extra Bold (800)', value: '800' },
    { label: 'Black (900)', value: '900' },
  ];
  
  const textAlignPresets = [
    { label: 'Esquerda', value: 'left' },
    { label: 'Centro', value: 'center' },
    { label: 'Direita', value: 'right' },
    { label: 'Justificado', value: 'justify' },
  ];
  
  const textTransformPresets = [
    { label: 'Normal', value: 'none' },
    { label: 'Maiúsculas', value: 'uppercase' },
    { label: 'Minúsculas', value: 'lowercase' },
    { label: 'Capitalizado', value: 'capitalize' },
  ];
  
  const lineHeightPresets = [
    { label: 'Normal', value: 'normal' },
    { label: 'Apertado', value: '1' },
    { label: 'Médio', value: '1.5' },
    { label: 'Espaçado', value: '2' },
  ];
  
  const letterSpacingPresets = [
    { label: 'Normal', value: 'normal' },
    { label: 'Apertado', value: '-0.05em' },
    { label: 'Médio', value: '0.05em' },
    { label: 'Espaçado', value: '0.1em' },
  ];
  
  const textDecorationPresets = [
    { label: 'Nenhum', value: 'none' },
    { label: 'Sublinhado', value: 'underline' },
    { label: 'Linha acima', value: 'overline' },
    { label: 'Riscado', value: 'line-through' },
  ];
  
  const fontStylePresets = [
    { label: 'Normal', value: 'normal' },
    { label: 'Itálico', value: 'italic' },
    { label: 'Oblíquo', value: 'oblique' },
  ];
  
  const positionPresets = [
    { label: 'Estático', value: 'static' },
    { label: 'Relativo', value: 'relative' },
    { label: 'Absoluto', value: 'absolute' },
    { label: 'Fixo', value: 'fixed' },
    { label: 'Grudado', value: 'sticky' },
  ];
  
  const displayPresets = [
    { label: 'Bloco', value: 'block' },
    { label: 'Em linha', value: 'inline' },
    { label: 'Flexível', value: 'flex' },
    { label: 'Grade', value: 'grid' },
    { label: 'Bloco em linha', value: 'inline-block' },
    { label: 'Flexível em linha', value: 'inline-flex' },
    { label: 'Grade em linha', value: 'inline-grid' },
    { label: 'Tabela', value: 'table' },
    { label: 'Escondido', value: 'none' },
  ];
  
  const floatPresets = [
    { label: 'Nenhum', value: 'none' },
    { label: 'Esquerda', value: 'left' },
    { label: 'Direita', value: 'right' },
  ];
  
  const visibilityPresets = [
    { label: 'Visível', value: 'visible' },
    { label: 'Escondido', value: 'hidden' },
    { label: 'Colapso', value: 'collapse' },
  ];
  
  const overflowPresets = [
    { label: 'Visível', value: 'visible' },
    { label: 'Escondido', value: 'hidden' },
    { label: 'Rolagem', value: 'scroll' },
    { label: 'Automático', value: 'auto' },
  ];
  
  const zIndexPresets = [
    { label: 'Automático', value: 'auto' },
    { label: '0', value: '0' },
    { label: '1', value: '1' },
    { label: '10', value: '10' },
    { label: '100', value: '100' },
    { label: '1000', value: '1000' },
    { label: '-1', value: '-1' },
  ];
  
  const flexDirectionPresets = [
    { label: 'Linha', value: 'row' },
    { label: 'Coluna', value: 'column' },
    { label: 'Linha reversa', value: 'row-reverse' },
    { label: 'Coluna reversa', value: 'column-reverse' },
  ];
  
  const flexWrapPresets = [
    { label: 'Não quebrar', value: 'nowrap' },
    { label: 'Quebrar', value: 'wrap' },
    { label: 'Quebrar reverso', value: 'wrap-reverse' },
  ];
  
  const justifyContentPresets = [
    { label: 'Início', value: 'flex-start' },
    { label: 'Fim', value: 'flex-end' },
    { label: 'Centro', value: 'center' },
    { label: 'Entre', value: 'space-between' },
    { label: 'Em volta', value: 'space-around' },
    { label: 'Igual', value: 'space-evenly' },
  ];
  
  const alignItemsPresets = [
    { label: 'Início', value: 'flex-start' },
    { label: 'Fim', value: 'flex-end' },
    { label: 'Centro', value: 'center' },
    { label: 'Esticado', value: 'stretch' },
    { label: 'Linha de base', value: 'baseline' },
  ];
  
  const alignContentPresets = [
    { label: 'Início', value: 'flex-start' },
    { label: 'Fim', value: 'flex-end' },
    { label: 'Centro', value: 'center' },
    { label: 'Entre', value: 'space-between' },
    { label: 'Em volta', value: 'space-around' },
    { label: 'Esticado', value: 'stretch' },
  ];
  
  const borderStylePresets = [
    { label: 'Nenhum', value: 'none' },
    { label: 'Sólido', value: 'solid' },
    { label: 'Tracejado', value: 'dashed' },
    { label: 'Pontilhado', value: 'dotted' },
    { label: 'Duplo', value: 'double' },
    { label: 'Entalhe', value: 'groove' },
    { label: 'Cume', value: 'ridge' },
    { label: 'Interno', value: 'inset' },
    { label: 'Externo', value: 'outset' },
  ];
  
  const boxShadowPresets = [
    { label: 'Nenhum', value: 'none' },
    { label: 'Pequena', value: '0 2px 4px rgba(0,0,0,0.1)' },
    { label: 'Média', value: '0 4px 8px rgba(0,0,0,0.12)' },
    { label: 'Grande', value: '0 8px 16px rgba(0,0,0,0.14)' },
    { label: 'Extra grande', value: '0 12px 24px rgba(0,0,0,0.2)' },
    { label: 'Interna', value: 'inset 0 2px 4px rgba(0,0,0,0.1)' },
  ];
  
  const textShadowPresets = [
    { label: 'Nenhum', value: 'none' },
    { label: 'Sutil', value: '1px 1px 2px rgba(0,0,0,0.1)' },
    { label: 'Média', value: '2px 2px 4px rgba(0,0,0,0.2)' },
    { label: 'Forte', value: '3px 3px 6px rgba(0,0,0,0.3)' },
    { label: 'Neon', value: '0 0 5px #fff, 0 0 10px #0ff' },
  ];
  
  const transformPresets = [
    { label: 'Nenhum', value: 'none' },
    { label: 'Rotação 45°', value: 'rotate(45deg)' },
    { label: 'Rotação 90°', value: 'rotate(90deg)' },
    { label: 'Escala 1.5x', value: 'scale(1.5)' },
    { label: 'Escala 0.8x', value: 'scale(0.8)' },
    { label: 'Horizontal espelhado', value: 'scaleX(-1)' },
    { label: 'Vertical espelhado', value: 'scaleY(-1)' },
    { label: 'Inclinado X', value: 'skewX(15deg)' },
    { label: 'Inclinado Y', value: 'skewY(15deg)' },
    { label: 'Translação (+20px)', value: 'translate(20px, 20px)' },
  ];
  
  const transitionPresets = [
    { label: 'Nenhuma', value: 'none' },
    { label: 'Suave', value: 'all 0.3s ease' },
    { label: 'Lenta', value: 'all 0.6s ease-in-out' },
    { label: 'Rápida', value: 'all 0.15s ease' },
    { label: 'Salto', value: 'all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)' },
    { label: 'Elástico', value: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  ];
  
  const cursorPresets = [
    { label: 'Auto', value: 'auto' },
    { label: 'Ponteiro', value: 'pointer' },
    { label: 'Texto', value: 'text' },
    { label: 'Aguardando', value: 'wait' },
    { label: 'Não permitido', value: 'not-allowed' },
    { label: 'Mover', value: 'move' },
    { label: 'Redimensionar', value: 'resize' },
    { label: 'Rolar', value: 'all-scroll' },
    { label: 'Pegar', value: 'grab' },
    { label: 'Pegando', value: 'grabbing' },
    { label: 'Zoom +', value: 'zoom-in' },
    { label: 'Zoom -', value: 'zoom-out' },
  ];
  
  const filterPresets = [
    { label: 'Nenhum', value: 'none' },
    { label: 'Desfoque', value: 'blur(4px)' },
    { label: 'Brilho 150%', value: 'brightness(1.5)' },
    { label: 'Brilho 75%', value: 'brightness(0.75)' },
    { label: 'Contraste 150%', value: 'contrast(1.5)' },
    { label: 'Contraste 75%', value: 'contrast(0.75)' },
    { label: 'Escala de cinza', value: 'grayscale(100%)' },
    { label: 'Sépia', value: 'sepia(100%)' },
    { label: 'Saturação 150%', value: 'saturate(1.5)' },
    { label: 'Saturação 50%', value: 'saturate(0.5)' },
    { label: 'Inverter cores', value: 'invert(100%)' },
    { label: 'Sombra drop', value: 'drop-shadow(4px 4px 4px rgba(0,0,0,0.5))' },
  ];

  // Paleta de cores expandida com mais opções e organizada por categorias
  const colorPalette = {
    basic: [
      { color: '#ffffff', name: 'Branco' },
      { color: '#000000', name: 'Preto' },
      { color: 'transparent', name: 'Transparente' },
    ],
    gray: [
      { color: '#f8f9fa', name: 'Cinza 50' },
      { color: '#e9ecef', name: 'Cinza 100' },
      { color: '#dee2e6', name: 'Cinza 200' },
      { color: '#ced4da', name: 'Cinza 300' },
      { color: '#adb5bd', name: 'Cinza 400' },
      { color: '#6c757d', name: 'Cinza 500' },
      { color: '#495057', name: 'Cinza 600' },
      { color: '#343a40', name: 'Cinza 700' },
      { color: '#212529', name: 'Cinza 800' },
      { color: '#111111', name: 'Cinza 900' },
    ],
    red: [
      { color: '#ffebee', name: 'Vermelho 50' },
      { color: '#ffcdd2', name: 'Vermelho 100' },
      { color: '#ef5350', name: 'Vermelho 400' },
      { color: '#f44336', name: 'Vermelho 500' },
      { color: '#e53935', name: 'Vermelho 600' },
      { color: '#d32f2f', name: 'Vermelho 700' },
      { color: '#c62828', name: 'Vermelho 800' },
      { color: '#b71c1c', name: 'Vermelho 900' },
    ],
    blue: [
      { color: '#e3f2fd', name: 'Azul 50' },
      { color: '#bbdefb', name: 'Azul 100' },
      { color: '#42a5f5', name: 'Azul 400' },
      { color: '#2196f3', name: 'Azul 500' },
      { color: '#1e88e5', name: 'Azul 600' },
      { color: '#1976d2', name: 'Azul 700' },
      { color: '#1565c0', name: 'Azul 800' },
      { color: '#0d47a1', name: 'Azul 900' },
    ],
    green: [
      { color: '#e8f5e9', name: 'Verde 50' },
      { color: '#c8e6c9', name: 'Verde 100' },
      { color: '#66bb6a', name: 'Verde 400' },
      { color: '#4caf50', name: 'Verde 500' },
      { color: '#43a047', name: 'Verde 600' },
      { color: '#388e3c', name: 'Verde 700' },
      { color: '#2e7d32', name: 'Verde 800' },
      { color: '#1b5e20', name: 'Verde 900' },
    ],
    amber: [
      { color: '#fff8e1', name: 'Âmbar 50' },
      { color: '#ffecb3', name: 'Âmbar 100' },
      { color: '#ffca28', name: 'Âmbar 400' },
      { color: '#ffc107', name: 'Âmbar 500' },
      { color: '#ffb300', name: 'Âmbar 600' },
      { color: '#ffa000', name: 'Âmbar 700' },
      { color: '#ff8f00', name: 'Âmbar 800' },
      { color: '#ff6f00', name: 'Âmbar 900' },
    ],
    orange: [
      { color: '#fff3e0', name: 'Laranja 50' },
      { color: '#ffe0b2', name: 'Laranja 100' },
      { color: '#ffa726', name: 'Laranja 400' },
      { color: '#ff9800', name: 'Laranja 500' },
      { color: '#fb8c00', name: 'Laranja 600' },
      { color: '#f57c00', name: 'Laranja 700' },
      { color: '#ef6c00', name: 'Laranja 800' },
      { color: '#e65100', name: 'Laranja 900' },
    ],
    purple: [
      { color: '#f3e5f5', name: 'Roxo 50' },
      { color: '#e1bee7', name: 'Roxo 100' },
      { color: '#ab47bc', name: 'Roxo 400' },
      { color: '#9c27b0', name: 'Roxo 500' },
      { color: '#8e24aa', name: 'Roxo 600' },
      { color: '#7b1fa2', name: 'Roxo 700' },
      { color: '#6a1b9a', name: 'Roxo 800' },
      { color: '#4a148c', name: 'Roxo 900' },
    ],
    pink: [
      { color: '#fce4ec', name: 'Rosa 50' },
      { color: '#f8bbd0', name: 'Rosa 100' },
      { color: '#ec407a', name: 'Rosa 400' },
      { color: '#e91e63', name: 'Rosa 500' },
      { color: '#d81b60', name: 'Rosa 600' },
      { color: '#c2185b', name: 'Rosa 700' },
      { color: '#ad1457', name: 'Rosa 800' },
      { color: '#880e4f', name: 'Rosa 900' },
    ],
  };

  // Funções para atualizar os estilos
  const updateFromPreset = (property: string, value: string) => {
    onStyleChange(property, value);
  };
  
  const updateUnitValue = (property: string, value: string, unit: string) => {
    if (!isNaN(parseFloat(value))) {
      onStyleChange(property, `${value}${unit}`);
    }
  };
  
  const updateColorValue = (property: string, value: string) => {
    onStyleChange(property, value);
  };
  
  // Geração do código CSS
  const generateCssCode = () => {
    let cssString = '';
    
    if (styles) {
      Object.entries(styles).forEach(([prop, value]) => {
        if (value) {
          // Converter camelCase para kebab-case (CSS padrão)
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          cssString += `${cssProp}: ${value};\n`;
        }
      });
    }
    
    return cssString;
  };
  
  const applyCssCode = () => {
    // Aqui processamos o código CSS digitado manualmente
    // Dividimos por linhas e então por propriedade/valor
    const lines = cssCode.split(';').filter(line => line.trim() !== '');
    
    lines.forEach(line => {
      const [prop, value] = line.split(':').map(part => part.trim());
      if (prop && value) {
        // Converter kebab-case para camelCase
        const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        onStyleChange(camelProp, value);
      }
    });
  };
  
  // Atualizar o código CSS quando os estilos mudarem
  React.useEffect(() => {
    setCssCode(generateCssCode());
  }, [styles]);

  // Renderização dos inputs de cor
  const renderColorInput = (label: string, property: string, value: string) => {
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <div className="flex items-center space-x-1">
            <div 
              className="w-6 h-6 rounded-md border border-border cursor-pointer"
              style={{ backgroundColor: value || 'transparent' }}
              onClick={() => setColorPickerProperty(property === colorPickerProperty ? null : property)}
            />
            <Input
              value={value || ''}
              onChange={(e) => updateColorValue(property, e.target.value)}
              className="w-24 h-8 bg-muted border border-border text-xs"
            />
          </div>
        </div>
        {colorPickerProperty === property && (
          <div className="mt-2 rounded-md border border-border p-2 bg-background shadow-md">
            <div className="space-y-2">
              {/* Cores básicas */}
              <div>
                <Label className="text-xs mb-1 block">Básicas</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {colorPalette.basic.map(({color, name}) => (
                    <div 
                      key={color}
                      className="w-6 h-6 rounded-md border border-border cursor-pointer relative group"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        updateColorValue(property, color);
                        setColorPickerProperty(null);
                      }}
                      title={name}
                    >
                      {color === 'transparent' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-px w-full bg-muted-foreground rotate-45" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Cinzas */}
              <div>
                <Label className="text-xs mb-1 block">Cinzas</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {colorPalette.gray.map(({color, name}) => (
                    <div 
                      key={color}
                      className="w-6 h-6 rounded-md border border-border cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        updateColorValue(property, color);
                        setColorPickerProperty(null);
                      }}
                      title={name}
                    />
                  ))}
                </div>
              </div>
              
              {/* Cores principais */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1 block">Vermelhos</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {colorPalette.red.map(({color, name}) => (
                      <div 
                        key={color}
                        className="w-6 h-6 rounded-md border border-border cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          updateColorValue(property, color);
                          setColorPickerProperty(null);
                        }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs mb-1 block">Azuis</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {colorPalette.blue.map(({color, name}) => (
                      <div 
                        key={color}
                        className="w-6 h-6 rounded-md border border-border cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          updateColorValue(property, color);
                          setColorPickerProperty(null);
                        }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs mb-1 block">Verdes</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {colorPalette.green.map(({color, name}) => (
                      <div 
                        key={color}
                        className="w-6 h-6 rounded-md border border-border cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          updateColorValue(property, color);
                          setColorPickerProperty(null);
                        }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs mb-1 block">Âmbar</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {colorPalette.amber.map(({color, name}) => (
                      <div 
                        key={color}
                        className="w-6 h-6 rounded-md border border-border cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          updateColorValue(property, color);
                          setColorPickerProperty(null);
                        }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs mb-1 block">Laranjas</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {colorPalette.orange.map(({color, name}) => (
                      <div 
                        key={color}
                        className="w-6 h-6 rounded-md border border-border cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          updateColorValue(property, color);
                          setColorPickerProperty(null);
                        }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs mb-1 block">Roxos</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {colorPalette.purple.map(({color, name}) => (
                      <div 
                        key={color}
                        className="w-6 h-6 rounded-md border border-border cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          updateColorValue(property, color);
                          setColorPickerProperty(null);
                        }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-1 mt-3 items-center">
                <Label className="text-xs">Personalizado:</Label>
                <Input
                  type="color"
                  value={value?.startsWith('#') ? value : '#000000'}
                  onChange={(e) => updateColorValue(property, e.target.value)}
                  className="w-8 h-8 p-0 border border-border"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 ml-auto"
                  onClick={() => setColorPickerProperty(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderização dos inputs de dimensão (top, right, bottom, left)
  const renderDimensionInputs = (label: string, properties: { top: string, right: string, bottom: string, left: string }) => {
    return (
      <div className="mb-4">
        <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
        <div className="grid grid-cols-4 gap-1">
          <div>
            <span className="block text-xs text-center text-muted-foreground mb-1">Cima</span>
            <Input
              value={styles[properties.top] || ''}
              onChange={(e) => onStyleChange(properties.top, e.target.value)}
              className="w-full h-8 bg-muted border border-border px-2 py-1 text-xs text-center"
            />
          </div>
          <div>
            <span className="block text-xs text-center text-muted-foreground mb-1">Direita</span>
            <Input
              value={styles[properties.right] || ''}
              onChange={(e) => onStyleChange(properties.right, e.target.value)}
              className="w-full h-8 bg-muted border border-border px-2 py-1 text-xs text-center"
            />
          </div>
          <div>
            <span className="block text-xs text-center text-muted-foreground mb-1">Baixo</span>
            <Input
              value={styles[properties.bottom] || ''}
              onChange={(e) => onStyleChange(properties.bottom, e.target.value)}
              className="w-full h-8 bg-muted border border-border px-2 py-1 text-xs text-center"
            />
          </div>
          <div>
            <span className="block text-xs text-center text-muted-foreground mb-1">Esquerda</span>
            <Input
              value={styles[properties.left] || ''}
              onChange={(e) => onStyleChange(properties.left, e.target.value)}
              className="w-full h-8 bg-muted border border-border px-2 py-1 text-xs text-center"
            />
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-6 w-6"
            onClick={() => {
              const value = window.prompt('Valor para todos os lados:', '');
              if (value !== null) {
                onStyleChange(properties.top, value);
                onStyleChange(properties.right, value);
                onStyleChange(properties.bottom, value);
                onStyleChange(properties.left, value);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Button>
        </div>
      </div>
    );
  };
  
  // Renderização de selects para presets
  const renderPresetSelect = (label: string, property: string, presets: Array<{ label: string, value: string }>, currentValue: string) => {
    // Garantir que sempre temos um valor válido, nunca uma string vazia
    const safeValue = currentValue || "none";
    
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Select
            value={safeValue}
            onValueChange={(value) => updateFromPreset(property, value)}
          >
            <SelectTrigger className="w-32 h-8 bg-muted border border-border text-xs">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-52">
                {presets.map(preset => (
                  <SelectItem key={preset.value} value={preset.value} className="text-xs">
                    {preset.label}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  // Renderização dos controles para as propriedades de tipografia
  const renderTypographyControls = () => {
    return (
      <div className="space-y-1 py-2">
        {renderPresetSelect('Família da fonte', 'fontFamily', fontFamilyPresets, styles.fontFamily)}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Tamanho da fonte</Label>
            <div className="flex items-center space-x-1">
              <Input
                value={styles.fontSize?.replace(/[^0-9.]/g, '') || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || !isNaN(parseFloat(value))) {
                    updateUnitValue('fontSize', value, 'px');
                  }
                }}
                className="w-16 h-8 bg-muted border border-border text-xs"
                placeholder="16"
              />
              <Select
                value={styles.fontSize?.replace(/[0-9.]/g, '') || 'px'}
                onValueChange={(unit) => {
                  const value = styles.fontSize?.replace(/[^0-9.]/g, '') || '';
                  if (value) {
                    updateUnitValue('fontSize', value, unit);
                  }
                }}
              >
                <SelectTrigger className="w-16 h-8 bg-muted border border-border text-xs">
                  <SelectValue placeholder="px" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="px" className="text-xs">px</SelectItem>
                  <SelectItem value="em" className="text-xs">em</SelectItem>
                  <SelectItem value="rem" className="text-xs">rem</SelectItem>
                  <SelectItem value="%" className="text-xs">%</SelectItem>
                  <SelectItem value="vw" className="text-xs">vw</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {renderPresetSelect('Peso da fonte', 'fontWeight', fontWeightPresets, styles.fontWeight)}
        {renderPresetSelect('Alinhamento', 'textAlign', textAlignPresets, styles.textAlign)}
        {renderPresetSelect('Transformação', 'textTransform', textTransformPresets, styles.textTransform)}
        {renderPresetSelect('Altura da linha', 'lineHeight', lineHeightPresets, styles.lineHeight)}
        {renderPresetSelect('Espaçamento', 'letterSpacing', letterSpacingPresets, styles.letterSpacing)}
        {renderPresetSelect('Decoração', 'textDecoration', textDecorationPresets, styles.textDecoration)}
        {renderPresetSelect('Estilo da fonte', 'fontStyle', fontStylePresets, styles.fontStyle)}
        {renderColorInput('Cor do texto', 'color', styles.color)}
        {renderPresetSelect('Sombra do texto', 'textShadow', textShadowPresets, styles.textShadow)}
      </div>
    );
  };
  
  // Renderização dos controles para as propriedades de fundo
  const renderBackgroundControls = () => {
    return (
      <div className="space-y-1 py-2">
        {renderColorInput('Cor de fundo', 'backgroundColor', styles.backgroundColor)}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Imagem de fundo</Label>
            <Input
              value={styles.backgroundImage?.replace(/url\(['"](.*)['"]\)/, '$1') || ''}
              onChange={(e) => onStyleChange('backgroundImage', e.target.value ? `url('${e.target.value}')` : '')}
              className="w-[208px] h-8 bg-muted border border-border text-xs"
              placeholder="URL da imagem"
            />
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Repetição</Label>
            <Select
              value={styles.backgroundRepeat || 'repeat'}
              onValueChange={(value) => onStyleChange('backgroundRepeat', value)}
            >
              <SelectTrigger className="w-32 h-8 bg-muted border border-border text-xs">
                <SelectValue placeholder="Repetição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repeat" className="text-xs">Repetir</SelectItem>
                <SelectItem value="repeat-x" className="text-xs">Repetir X</SelectItem>
                <SelectItem value="repeat-y" className="text-xs">Repetir Y</SelectItem>
                <SelectItem value="no-repeat" className="text-xs">Sem repetição</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Tamanho</Label>
            <Select
              value={styles.backgroundSize || 'auto'}
              onValueChange={(value) => onStyleChange('backgroundSize', value)}
            >
              <SelectTrigger className="w-32 h-8 bg-muted border border-border text-xs">
                <SelectValue placeholder="Tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto" className="text-xs">Auto</SelectItem>
                <SelectItem value="cover" className="text-xs">Cover</SelectItem>
                <SelectItem value="contain" className="text-xs">Contain</SelectItem>
                <SelectItem value="100%" className="text-xs">100%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Posição</Label>
            <Select
              value={styles.backgroundPosition || 'center'}
              onValueChange={(value) => onStyleChange('backgroundPosition', value)}
            >
              <SelectTrigger className="w-32 h-8 bg-muted border border-border text-xs">
                <SelectValue placeholder="Posição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center" className="text-xs">Centro</SelectItem>
                <SelectItem value="top" className="text-xs">Topo</SelectItem>
                <SelectItem value="bottom" className="text-xs">Base</SelectItem>
                <SelectItem value="left" className="text-xs">Esquerda</SelectItem>
                <SelectItem value="right" className="text-xs">Direita</SelectItem>
                <SelectItem value="top left" className="text-xs">Topo Esquerda</SelectItem>
                <SelectItem value="top right" className="text-xs">Topo Direita</SelectItem>
                <SelectItem value="bottom left" className="text-xs">Base Esquerda</SelectItem>
                <SelectItem value="bottom right" className="text-xs">Base Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Gradiente</Label>
            <Input
              value={styles.backgroundImage?.includes('linear-gradient') ? styles.backgroundImage : ''}
              onChange={(e) => onStyleChange('backgroundImage', e.target.value)}
              className="w-[208px] h-8 bg-muted border border-border text-xs"
              placeholder="linear-gradient(to right, #eee, #333)"
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Renderização dos controles para as propriedades de borda
  const renderBordersControls = () => {
    return (
      <div className="space-y-1 py-2">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Largura da borda</Label>
            <Input
              value={styles.borderWidth || ''}
              onChange={(e) => onStyleChange('borderWidth', e.target.value)}
              className="w-24 h-8 bg-muted border border-border text-xs"
              placeholder="1px"
            />
          </div>
        </div>
        
        {renderPresetSelect('Estilo da borda', 'borderStyle', borderStylePresets, styles.borderStyle)}
        {renderColorInput('Cor da borda', 'borderColor', styles.borderColor)}
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Raio da borda</Label>
            <div className="flex items-center space-x-1">
              <Input
                value={styles.borderRadius || ''}
                onChange={(e) => onStyleChange('borderRadius', e.target.value)}
                className="w-24 h-8 bg-muted border border-border text-xs"
                placeholder="4px"
              />
            </div>
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Bordas individuais</Label>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                const expanded = document.getElementById('individual-borders');
                if (expanded) {
                  expanded.style.display = expanded.style.display === 'none' ? 'block' : 'none';
                }
              }}
            >
              Expandir
            </Button>
          </div>
          
          <div id="individual-borders" className="mt-2" style={{ display: 'none' }}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Borda Superior</Label>
                <div className="flex space-x-1 mb-2">
                  <Input
                    value={styles.borderTopWidth || ''}
                    onChange={(e) => onStyleChange('borderTopWidth', e.target.value)}
                    className="w-full h-8 bg-muted border border-border text-xs"
                    placeholder="Largura"
                  />
                  <Select
                    value={styles.borderTopStyle || ''}
                    onValueChange={(value) => onStyleChange('borderTopStyle', value)}
                  >
                    <SelectTrigger className="w-24 h-8 bg-muted border border-border text-xs">
                      <SelectValue placeholder="Estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      {borderStylePresets.map(preset => (
                        <SelectItem key={preset.value} value={preset.value} className="text-xs">
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={styles.borderTopColor || ''}
                  onChange={(e) => onStyleChange('borderTopColor', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="Cor"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Borda Direita</Label>
                <div className="flex space-x-1 mb-2">
                  <Input
                    value={styles.borderRightWidth || ''}
                    onChange={(e) => onStyleChange('borderRightWidth', e.target.value)}
                    className="w-full h-8 bg-muted border border-border text-xs"
                    placeholder="Largura"
                  />
                  <Select
                    value={styles.borderRightStyle || ''}
                    onValueChange={(value) => onStyleChange('borderRightStyle', value)}
                  >
                    <SelectTrigger className="w-24 h-8 bg-muted border border-border text-xs">
                      <SelectValue placeholder="Estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      {borderStylePresets.map(preset => (
                        <SelectItem key={preset.value} value={preset.value} className="text-xs">
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={styles.borderRightColor || ''}
                  onChange={(e) => onStyleChange('borderRightColor', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="Cor"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Borda Inferior</Label>
                <div className="flex space-x-1 mb-2">
                  <Input
                    value={styles.borderBottomWidth || ''}
                    onChange={(e) => onStyleChange('borderBottomWidth', e.target.value)}
                    className="w-full h-8 bg-muted border border-border text-xs"
                    placeholder="Largura"
                  />
                  <Select
                    value={styles.borderBottomStyle || ''}
                    onValueChange={(value) => onStyleChange('borderBottomStyle', value)}
                  >
                    <SelectTrigger className="w-24 h-8 bg-muted border border-border text-xs">
                      <SelectValue placeholder="Estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      {borderStylePresets.map(preset => (
                        <SelectItem key={preset.value} value={preset.value} className="text-xs">
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={styles.borderBottomColor || ''}
                  onChange={(e) => onStyleChange('borderBottomColor', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="Cor"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Borda Esquerda</Label>
                <div className="flex space-x-1 mb-2">
                  <Input
                    value={styles.borderLeftWidth || ''}
                    onChange={(e) => onStyleChange('borderLeftWidth', e.target.value)}
                    className="w-full h-8 bg-muted border border-border text-xs"
                    placeholder="Largura"
                  />
                  <Select
                    value={styles.borderLeftStyle || ''}
                    onValueChange={(value) => onStyleChange('borderLeftStyle', value)}
                  >
                    <SelectTrigger className="w-24 h-8 bg-muted border border-border text-xs">
                      <SelectValue placeholder="Estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      {borderStylePresets.map(preset => (
                        <SelectItem key={preset.value} value={preset.value} className="text-xs">
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={styles.borderLeftColor || ''}
                  onChange={(e) => onStyleChange('borderLeftColor', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="Cor"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderização dos controles para as propriedades de efeitos
  const renderEffectsControls = () => {
    return (
      <div className="space-y-1 py-2">
        {renderPresetSelect('Sombra', 'boxShadow', boxShadowPresets, styles.boxShadow)}
        {renderPresetSelect('Opacidade', 'opacity', [
          { label: '0% (Invisível)', value: '0' },
          { label: '25%', value: '0.25' },
          { label: '50%', value: '0.5' },
          { label: '75%', value: '0.75' },
          { label: '100% (Normal)', value: '1' },
        ], styles.opacity)}
        {renderPresetSelect('Transformação', 'transform', transformPresets, styles.transform)}
        {renderPresetSelect('Transição', 'transition', transitionPresets, styles.transition)}
        {renderPresetSelect('Filtro', 'filter', filterPresets, styles.filter)}
        {renderPresetSelect('Backdrop Filter', 'backdropFilter', [
          { label: 'Nenhum', value: 'none' },
          { label: 'Desfoque 5px', value: 'blur(5px)' },
          { label: 'Contraste 80%', value: 'contrast(0.8)' },
          { label: 'Brilho 80%', value: 'brightness(0.8)' },
          { label: 'Saturação 150%', value: 'saturate(1.5)' },
          { label: 'Escala de cinza 50%', value: 'grayscale(0.5)' },
        ], styles.backdropFilter)}
        {renderPresetSelect('Mistura de cores', 'mixBlendMode', [
          { label: 'Normal', value: 'normal' },
          { label: 'Multiplicar', value: 'multiply' },
          { label: 'Tela', value: 'screen' },
          { label: 'Sobrepor', value: 'overlay' },
          { label: 'Escurecer', value: 'darken' },
          { label: 'Clarear', value: 'lighten' },
          { label: 'Diferença', value: 'difference' },
        ], styles.mixBlendMode)}
      </div>
    );
  };
  
  // Renderização dos controles para as propriedades de layout
  const renderLayoutControls = () => {
    return (
      <div className="space-y-1 py-2">
        {renderPresetSelect('Display', 'display', displayPresets, styles.display)}
        {renderPresetSelect('Posição', 'position', positionPresets, styles.position)}
        
        {styles.position !== 'static' && (
          <>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Top</Label>
                <Input
                  value={styles.top || ''}
                  onChange={(e) => onStyleChange('top', e.target.value)}
                  className="w-32 h-8 bg-muted border border-border text-xs"
                  placeholder="auto"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Right</Label>
                <Input
                  value={styles.right || ''}
                  onChange={(e) => onStyleChange('right', e.target.value)}
                  className="w-32 h-8 bg-muted border border-border text-xs"
                  placeholder="auto"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Bottom</Label>
                <Input
                  value={styles.bottom || ''}
                  onChange={(e) => onStyleChange('bottom', e.target.value)}
                  className="w-32 h-8 bg-muted border border-border text-xs"
                  placeholder="auto"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Left</Label>
                <Input
                  value={styles.left || ''}
                  onChange={(e) => onStyleChange('left', e.target.value)}
                  className="w-32 h-8 bg-muted border border-border text-xs"
                  placeholder="auto"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">z-index</Label>
                <Input
                  value={styles.zIndex || ''}
                  onChange={(e) => onStyleChange('zIndex', e.target.value)}
                  className="w-32 h-8 bg-muted border border-border text-xs"
                  placeholder="auto"
                />
              </div>
            </div>
          </>
        )}
        
        {styles.display === 'flex' && (
          <>
            <Separator className="my-2" />
            <h3 className="text-sm font-medium mb-2">Flexbox</h3>
            
            {renderPresetSelect('Flex Direction', 'flexDirection', flexDirectionPresets, styles.flexDirection)}
            {renderPresetSelect('Flex Wrap', 'flexWrap', flexWrapPresets, styles.flexWrap)}
            {renderPresetSelect('Justify Content', 'justifyContent', justifyContentPresets, styles.justifyContent)}
            {renderPresetSelect('Align Items', 'alignItems', alignItemsPresets, styles.alignItems)}
            {renderPresetSelect('Align Content', 'alignContent', alignContentPresets, styles.alignContent)}
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Gap</Label>
                <Input
                  value={styles.gap || ''}
                  onChange={(e) => onStyleChange('gap', e.target.value)}
                  className="w-32 h-8 bg-muted border border-border text-xs"
                  placeholder="0px"
                />
              </div>
            </div>
          </>
        )}
        
        {styles.display === 'grid' && (
          <>
            <Separator className="my-2" />
            <h3 className="text-sm font-medium mb-2">Grid</h3>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Colunas da grade</Label>
                <Input
                  value={styles.gridTemplateColumns || ''}
                  onChange={(e) => onStyleChange('gridTemplateColumns', e.target.value)}
                  className="w-32 h-8 bg-muted border border-border text-xs"
                  placeholder="1fr 1fr"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Linhas da grade</Label>
                <Input
                  value={styles.gridTemplateRows || ''}
                  onChange={(e) => onStyleChange('gridTemplateRows', e.target.value)}
                  className="w-32 h-8 bg-muted border border-border text-xs"
                  placeholder="auto auto"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Espaçamento da grade</Label>
                <Input
                  value={styles.gap || ''}
                  onChange={(e) => onStyleChange('gap', e.target.value)}
                  className="w-32 h-8 bg-muted border border-border text-xs"
                  placeholder="0px"
                />
              </div>
            </div>
          </>
        )}
        
        <Separator className="my-2" />
        
        {renderDimensionInputs('Margem', {
          top: 'marginTop',
          right: 'marginRight',
          bottom: 'marginBottom',
          left: 'marginLeft'
        })}
        
        {renderDimensionInputs('Preenchimento', {
          top: 'paddingTop',
          right: 'paddingRight',
          bottom: 'paddingBottom',
          left: 'paddingLeft'
        })}
        
        <div className="grid grid-cols-2 gap-3">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs text-muted-foreground">Largura</Label>
              <Input
                value={styles.width || ''}
                onChange={(e) => onStyleChange('width', e.target.value)}
                className="w-24 h-8 bg-muted border border-border text-xs"
                placeholder="auto"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs text-muted-foreground">Altura</Label>
              <Input
                value={styles.height || ''}
                onChange={(e) => onStyleChange('height', e.target.value)}
                className="w-24 h-8 bg-muted border border-border text-xs"
                placeholder="auto"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs text-muted-foreground">Min-Largura</Label>
              <Input
                value={styles.minWidth || ''}
                onChange={(e) => onStyleChange('minWidth', e.target.value)}
                className="w-24 h-8 bg-muted border border-border text-xs"
                placeholder="auto"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs text-muted-foreground">Min-Altura</Label>
              <Input
                value={styles.minHeight || ''}
                onChange={(e) => onStyleChange('minHeight', e.target.value)}
                className="w-24 h-8 bg-muted border border-border text-xs"
                placeholder="auto"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs text-muted-foreground">Max-Largura</Label>
              <Input
                value={styles.maxWidth || ''}
                onChange={(e) => onStyleChange('maxWidth', e.target.value)}
                className="w-24 h-8 bg-muted border border-border text-xs"
                placeholder="none"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs text-muted-foreground">Max-Altura</Label>
              <Input
                value={styles.maxHeight || ''}
                onChange={(e) => onStyleChange('maxHeight', e.target.value)}
                className="w-24 h-8 bg-muted border border-border text-xs"
                placeholder="none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderização dos controles para as propriedades de visibilidade
  const renderVisibilityControls = () => {
    return (
      <div className="space-y-1 py-2">
        {renderPresetSelect('Visibilidade', 'visibility', visibilityPresets, styles.visibility)}
        {renderPresetSelect('Overflow', 'overflow', overflowPresets, styles.overflow)}
        {renderPresetSelect('Overflow X', 'overflowX', overflowPresets, styles.overflowX)}
        {renderPresetSelect('Overflow Y', 'overflowY', overflowPresets, styles.overflowY)}
        {renderPresetSelect('Cursor', 'cursor', cursorPresets, styles.cursor)}
        {renderPresetSelect('Ponteiro-eventos', 'pointerEvents', [
          { label: 'Auto', value: 'auto' },
          { label: 'Nenhum', value: 'none' },
        ], styles.pointerEvents)}
        {renderPresetSelect('Seleção de usuário', 'userSelect', [
          { label: 'Auto', value: 'auto' },
          { label: 'Nenhum', value: 'none' },
          { label: 'Texto', value: 'text' },
          { label: 'Tudo', value: 'all' },
        ], styles.userSelect)}
        
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">Ordem</Label>
          <Input
            type="number"
            value={styles.order || ''}
            onChange={(e) => onStyleChange('order', e.target.value)}
            className="w-20 h-8 bg-muted border border-border text-xs"
            placeholder="0"
            min="-99"
            max="99"
          />
        </div>
      </div>
    );
  };
  
  // Renderização dos controles para CSS bruto
  const renderRawCssControls = () => {
    return (
      <div>
        <div className="mb-3">
          <Label className="text-xs mb-1 block">CSS Bruto</Label>
          <Textarea
            value={cssCode}
            onChange={(e) => setCssCode(e.target.value)}
            rows={15}
            className="w-full p-3 text-xs font-mono bg-muted border border-border resize-y"
            placeholder="Digite seu CSS personalizado aqui..."
          />
        </div>
        <Button 
          onClick={applyCssCode} 
          size="sm" 
          className="w-full"
        >
          Aplicar CSS
        </Button>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'visual' | 'code')}>
        <TabsList className="w-full grid grid-cols-2 rounded-none">
          <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
          <TabsTrigger value="code" className="text-xs">Código</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual" className="flex-1 data-[state=inactive]:hidden p-0 overflow-y-auto">
          <Tabs value={activeVisualTab} onValueChange={(value) => setActiveVisualTab(value)}>
            <TabsList className="w-full grid grid-cols-6 rounded-none">
              <TabsTrigger value="typography" className="text-xs">Texto</TabsTrigger>
              <TabsTrigger value="background" className="text-xs">Fundo</TabsTrigger>
              <TabsTrigger value="borders" className="text-xs">Bordas</TabsTrigger>
              <TabsTrigger value="effects" className="text-xs">Efeitos</TabsTrigger>
              <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
              <TabsTrigger value="visibility" className="text-xs">Visual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="typography" className="flex-1 data-[state=inactive]:hidden p-3 overflow-y-auto">
              {renderTypographyControls()}
            </TabsContent>
            
            <TabsContent value="background" className="flex-1 data-[state=inactive]:hidden p-3 overflow-y-auto">
              {renderBackgroundControls()}
            </TabsContent>
            
            <TabsContent value="borders" className="flex-1 data-[state=inactive]:hidden p-3 overflow-y-auto">
              {renderBordersControls()}
            </TabsContent>
            
            <TabsContent value="effects" className="flex-1 data-[state=inactive]:hidden p-3 overflow-y-auto">
              {renderEffectsControls()}
            </TabsContent>
            
            <TabsContent value="layout" className="flex-1 data-[state=inactive]:hidden p-3 overflow-y-auto">
              {renderLayoutControls()}
            </TabsContent>
            
            <TabsContent value="visibility" className="flex-1 data-[state=inactive]:hidden p-3 overflow-y-auto">
              {renderVisibilityControls()}
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="code" className="flex-1 data-[state=inactive]:hidden p-3 overflow-y-auto">
          {renderRawCssControls()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedCssEditor;