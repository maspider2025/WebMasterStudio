import React, { useState } from 'react';
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
import { useState } from 'react';

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
    { label: '-10', value: '-10' },
  ];
  
  const opacityPresets = [
    { label: 'Transparente', value: '0' },
    { label: '25%', value: '0.25' },
    { label: '50%', value: '0.5' },
    { label: '75%', value: '0.75' },
    { label: '90%', value: '0.9' },
    { label: 'Sólido', value: '1' },
  ];
  
  const borderStylePresets = [
    { label: 'Nenhuma', value: 'none' },
    { label: 'Sólida', value: 'solid' },
    { label: 'Tracejada', value: 'dashed' },
    { label: 'Pontilhada', value: 'dotted' },
    { label: 'Dupla', value: 'double' },
    { label: 'Sulcada', value: 'groove' },
    { label: 'Cume', value: 'ridge' },
    { label: 'Inserida', value: 'inset' },
    { label: 'Embutida', value: 'outset' },
  ];
  
  const boxShadowPresets = [
    { label: 'Nenhuma', value: 'none' },
    { label: 'Suave', value: '0 2px 4px rgba(0,0,0,0.1)' },
    { label: 'Média', value: '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)' },
    { label: 'Forte', value: '0 15px 30px 0 rgba(0,0,0,0.11), 0 5px 15px 0 rgba(0,0,0,0.08)' },
    { label: 'Elevada', value: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' },
    { label: 'Interna', value: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)' },
  ];
  
  const textShadowPresets = [
    { label: 'Nenhuma', value: 'none' },
    { label: 'Suave', value: '1px 1px 2px rgba(0,0,0,0.1)' },
    { label: 'Média', value: '2px 2px 4px rgba(0,0,0,0.2)' },
    { label: 'Forte', value: '3px 3px 6px rgba(0,0,0,0.3)' },
    { label: 'Neon', value: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6' },
    { label: 'Relevo', value: '2px 2px 0px #ffffff, -2px -2px 0px #cccccc' },
  ];
  
  const transformPresets = [
    { label: 'Nenhuma', value: 'none' },
    { label: 'Rotação 45°', value: 'rotate(45deg)' },
    { label: 'Rotação -45°', value: 'rotate(-45deg)' },
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
  
  const renderColorInput = (label: string, property: string, value: string) => {
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <div className="flex items-center space-x-1">
            <div 
              className="w-6 h-6 rounded-md border border-border cursor-pointer"
              style={{ backgroundColor: value || 'transparent' }}
              onClick={() => setColorPickerProperty(property)}
            />
            <Input
              value={value || ''}
              onChange={(e) => updateColorValue(property, e.target.value)}
              className="w-24 h-8 bg-muted border border-border text-xs"
            />
          </div>
        </div>
        {colorPickerProperty === property && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1 mb-2">
              {['#1a1a1a', '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
                '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', 
                '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', 
                '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b', 
                '#ffffff', 'transparent'].map(color => (
                <div 
                  key={color}
                  className="w-6 h-6 rounded-md border border-border cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    updateColorValue(property, color);
                    setColorPickerProperty(null);
                  }}
                />
              ))}
            </div>
            <div className="flex space-x-1">
              <Input
                type="color"
                value={value?.startsWith('#') ? value : '#000000'}
                onChange={(e) => updateColorValue(property, e.target.value)}
                className="w-8 h-8 p-0 border border-border"
              />
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-8"
                onClick={() => setColorPickerProperty(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
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
  
  const renderPresetSelect = (label: string, property: string, presets: Array<{ label: string, value: string }>, currentValue: string) => {
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Select
            value={currentValue || ''}
            onValueChange={(value) => updateFromPreset(property, value)}
          >
            <SelectTrigger className="w-32 h-8 bg-muted border border-border text-xs">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-40">
                {presets.map((preset) => (
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
  
  const renderNumberWithUnitInput = (label: string, property: string, value: string, defaultUnit: string = 'px') => {
    const parseValueAndUnit = (val: string) => {
      if (!val) return { value: '', unit: defaultUnit };
      
      const numericMatch = val.match(/^(\d*\.?\d*)(.*)$/);
      if (numericMatch) {
        return {
          value: numericMatch[1],
          unit: numericMatch[2] || defaultUnit
        };
      }
      
      return { value: '', unit: defaultUnit };
    };
    
    const { value: numericValue, unit } = parseValueAndUnit(value);
    
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <div className="flex items-center">
            <Input
              type="number"
              value={numericValue}
              onChange={(e) => updateUnitValue(property, e.target.value, unit)}
              className="w-20 h-8 bg-muted border border-border text-xs mr-1"
            />
            <Select
              value={unit}
              onValueChange={(newUnit) => updateUnitValue(property, numericValue || '0', newUnit)}
            >
              <SelectTrigger className="w-16 h-8 bg-muted border border-border text-xs">
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="px" className="text-xs">px</SelectItem>
                <SelectItem value="em" className="text-xs">em</SelectItem>
                <SelectItem value="rem" className="text-xs">rem</SelectItem>
                <SelectItem value="%" className="text-xs">%</SelectItem>
                <SelectItem value="vh" className="text-xs">vh</SelectItem>
                <SelectItem value="vw" className="text-xs">vw</SelectItem>
                <SelectItem value="pt" className="text-xs">pt</SelectItem>
                <SelectItem value="" className="text-xs">-</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };
  
  const renderTypographyControls = () => {
    return (
      <div className="space-y-1 py-2">
        {renderPresetSelect('Família da fonte', 'fontFamily', fontFamilyPresets, styles.fontFamily)}
        {renderNumberWithUnitInput('Tamanho da fonte', 'fontSize', styles.fontSize)}
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
                <SelectItem value="cover" className="text-xs">Cobrir</SelectItem>
                <SelectItem value="contain" className="text-xs">Conter</SelectItem>
                <SelectItem value="100% 100%" className="text-xs">Estender</SelectItem>
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
                <SelectItem value="top left" className="text-xs">Topo Esquerdo</SelectItem>
                <SelectItem value="top right" className="text-xs">Topo Direito</SelectItem>
                <SelectItem value="bottom left" className="text-xs">Base Esquerda</SelectItem>
                <SelectItem value="bottom right" className="text-xs">Base Direita</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Gradiente</Label>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                const gradientValue = window.prompt(
                  'Insira o valor do gradiente CSS:',
                  styles.backgroundImage && styles.backgroundImage.includes('gradient') ? 
                    styles.backgroundImage : 
                    'linear-gradient(to bottom, #e66465, #9198e5)'
                );
                if (gradientValue) {
                  onStyleChange('backgroundImage', gradientValue);
                }
              }}
            >
              Editar Gradiente
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderBordersControls = () => {
    return (
      <div className="space-y-1 py-2">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Espessura da borda</Label>
            <div className="flex items-center space-x-1">
              <Input
                value={styles.borderWidth || ''}
                onChange={(e) => onStyleChange('borderWidth', e.target.value)}
                className="w-24 h-8 bg-muted border border-border text-xs"
                placeholder="1px"
              />
            </div>
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
        
        <Separator className="my-2" />
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Raios da borda individuais</Label>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                const expanded = document.getElementById('individual-border-radius');
                if (expanded) {
                  expanded.style.display = expanded.style.display === 'none' ? 'block' : 'none';
                }
              }}
            >
              Expandir
            </Button>
          </div>
          
          <div id="individual-border-radius" className="mt-2" style={{ display: 'none' }}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Superior Esquerdo</Label>
                <Input
                  value={styles.borderTopLeftRadius || ''}
                  onChange={(e) => onStyleChange('borderTopLeftRadius', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="0px"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Superior Direito</Label>
                <Input
                  value={styles.borderTopRightRadius || ''}
                  onChange={(e) => onStyleChange('borderTopRightRadius', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="0px"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Inferior Esquerdo</Label>
                <Input
                  value={styles.borderBottomLeftRadius || ''}
                  onChange={(e) => onStyleChange('borderBottomLeftRadius', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="0px"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Inferior Direito</Label>
                <Input
                  value={styles.borderBottomRightRadius || ''}
                  onChange={(e) => onStyleChange('borderBottomRightRadius', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="0px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderEffectsControls = () => {
    return (
      <div className="space-y-1 py-2">
        {renderPresetSelect('Sombra da caixa', 'boxShadow', boxShadowPresets, styles.boxShadow)}
        {renderPresetSelect('Sombra do texto', 'textShadow', textShadowPresets, styles.textShadow)}
        {renderPresetSelect('Opacidade', 'opacity', opacityPresets, styles.opacity)}
        {renderPresetSelect('Filtro', 'filter', filterPresets, styles.filter)}
        {renderPresetSelect('Backdrop filtro', 'backdropFilter', filterPresets, styles.backdropFilter)}
        <Separator className="my-2" />
        
        {renderPresetSelect('Transformação', 'transform', transformPresets, styles.transform)}
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Transformação 3D</Label>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                const expanded = document.getElementById('transform-3d');
                if (expanded) {
                  expanded.style.display = expanded.style.display === 'none' ? 'block' : 'none';
                }
              }}
            >
              Expandir
            </Button>
          </div>
          
          <div id="transform-3d" className="mt-2" style={{ display: 'none' }}>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Origem da transformação</Label>
                <Input
                  value={styles.transformOrigin || ''}
                  onChange={(e) => onStyleChange('transformOrigin', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="center center"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Translação 3D</Label>
                <Input
                  value={styles.translate3d || ''}
                  onChange={(e) => onStyleChange('translate3d', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="0, 0, 0"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Rotação 3D</Label>
                <Input
                  value={styles.rotate3d || ''}
                  onChange={(e) => onStyleChange('rotate3d', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="0, 0, 0, 0deg"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Perspectiva</Label>
                <Input
                  value={styles.perspective || ''}
                  onChange={(e) => onStyleChange('perspective', e.target.value)}
                  className="w-full h-8 bg-muted border border-border text-xs"
                  placeholder="1000px"
                />
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-2" />
        
        {renderPresetSelect('Transição', 'transition', transitionPresets, styles.transition)}
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Animação</Label>
            <div className="flex items-center space-x-1">
              <Input
                value={styles.animation || ''}
                onChange={(e) => onStyleChange('animation', e.target.value)}
                className="w-[208px] h-8 bg-muted border border-border text-xs"
                placeholder="nome duração easing delay repetições"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderLayoutControls = () => {
    return (
      <div className="space-y-1 py-2">
        {renderPresetSelect('Display', 'display', displayPresets, styles.display)}
        
        {styles.display === 'flex' && (
          <>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Direção</Label>
                <Select
                  value={styles.flexDirection || 'row'}
                  onValueChange={(value) => onStyleChange('flexDirection', value)}
                >
                  <SelectTrigger className="w-32 h-8 bg-muted border border-border text-xs">
                    <SelectValue placeholder="Direção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="row" className="text-xs">Linha</SelectItem>
                    <SelectItem value="column" className="text-xs">Coluna</SelectItem>
                    <SelectItem value="row-reverse" className="text-xs">Linha reversa</SelectItem>
                    <SelectItem value="column-reverse" className="text-xs">Coluna reversa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Justificação</Label>
                <Select
                  value={styles.justifyContent || 'flex-start'}
                  onValueChange={(value) => onStyleChange('justifyContent', value)}
                >
                  <SelectTrigger className="w-32 h-8 bg-muted border border-border text-xs">
                    <SelectValue placeholder="Justificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex-start" className="text-xs">Início</SelectItem>
                    <SelectItem value="center" className="text-xs">Centro</SelectItem>
                    <SelectItem value="flex-end" className="text-xs">Fim</SelectItem>
                    <SelectItem value="space-between" className="text-xs">Entre</SelectItem>
                    <SelectItem value="space-around" className="text-xs">Ao redor</SelectItem>
                    <SelectItem value="space-evenly" className="text-xs">Igualmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Alinhamento</Label>
                <Select
                  value={styles.alignItems || 'stretch'}
                  onValueChange={(value) => onStyleChange('alignItems', value)}
                >
                  <SelectTrigger className="w-32 h-8 bg-muted border border-border text-xs">
                    <SelectValue placeholder="Alinhamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex-start" className="text-xs">Início</SelectItem>
                    <SelectItem value="center" className="text-xs">Centro</SelectItem>
                    <SelectItem value="flex-end" className="text-xs">Fim</SelectItem>
                    <SelectItem value="stretch" className="text-xs">Esticar</SelectItem>
                    <SelectItem value="baseline" className="text-xs">Linha base</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Espaçamento</Label>
                <Input
                  value={styles.gap || ''}
                  onChange={(e) => onStyleChange('gap', e.target.value)}
                  className="w-32 h-8 bg-muted border border-border text-xs"
                  placeholder="0px"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Envolvimento</Label>
                <Select
                  value={styles.flexWrap || 'nowrap'}
                  onValueChange={(value) => onStyleChange('flexWrap', value)}
                >
                  <SelectTrigger className="w-32 h-8 bg-muted border border-border text-xs">
                    <SelectValue placeholder="Envolvimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nowrap" className="text-xs">Sem quebra</SelectItem>
                    <SelectItem value="wrap" className="text-xs">Quebrar</SelectItem>
                    <SelectItem value="wrap-reverse" className="text-xs">Quebrar reverso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
        
        {styles.display === 'grid' && (
          <>
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
              <Label className="text-xs text-muted-foreground">Min Largura</Label>
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
              <Label className="text-xs text-muted-foreground">Min Altura</Label>
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
              <Label className="text-xs text-muted-foreground">Max Largura</Label>
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
              <Label className="text-xs text-muted-foreground">Max Altura</Label>
              <Input
                value={styles.maxHeight || ''}
                onChange={(e) => onStyleChange('maxHeight', e.target.value)}
                className="w-24 h-8 bg-muted border border-border text-xs"
                placeholder="none"
              />
            </div>
          </div>
        </div>
        
        <Separator className="my-2" />
        
        {renderPresetSelect('Posição', 'position', positionPresets, styles.position)}
        
        {styles.position && styles.position !== 'static' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Topo</Label>
                <Input
                  value={styles.top || ''}
                  onChange={(e) => onStyleChange('top', e.target.value)}
                  className="w-24 h-8 bg-muted border border-border text-xs"
                  placeholder="auto"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Direita</Label>
                <Input
                  value={styles.right || ''}
                  onChange={(e) => onStyleChange('right', e.target.value)}
                  className="w-24 h-8 bg-muted border border-border text-xs"
                  placeholder="auto"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Base</Label>
                <Input
                  value={styles.bottom || ''}
                  onChange={(e) => onStyleChange('bottom', e.target.value)}
                  className="w-24 h-8 bg-muted border border-border text-xs"
                  placeholder="auto"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Esquerda</Label>
                <Input
                  value={styles.left || ''}
                  onChange={(e) => onStyleChange('left', e.target.value)}
                  className="w-24 h-8 bg-muted border border-border text-xs"
                  placeholder="auto"
                />
              </div>
            </div>
            
            {renderNumberWithUnitInput('Z-index', 'zIndex', styles.zIndex)}
          </div>
        )}
        
        {styles.position !== 'absolute' && styles.position !== 'fixed' && (
          <>
            {renderPresetSelect('Float', 'float', floatPresets, styles.float)}
            {renderPresetSelect('Clear', 'clear', floatPresets, styles.clear)}
          </>
        )}
      </div>
    );
  };
  
  const renderVisibilityControls = () => {
    return (
      <div className="space-y-1 py-2">
        {renderPresetSelect('Visibilidade', 'visibility', visibilityPresets, styles.visibility)}
        {renderPresetSelect('Overflow X', 'overflowX', overflowPresets, styles.overflowX)}
        {renderPresetSelect('Overflow Y', 'overflowY', overflowPresets, styles.overflowY)}
        {renderPresetSelect('Display', 'display', displayPresets, styles.display)}
        {renderPresetSelect('Cursor', 'cursor', cursorPresets, styles.cursor)}
        {renderPresetSelect('Opacidade', 'opacity', opacityPresets, styles.opacity)}
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Pointer Events</Label>
            <Select
              value={styles.pointerEvents || 'auto'}
              onValueChange={(value) => onStyleChange('pointerEvents', value)}
            >
              <SelectTrigger className="w-32 h-8 bg-muted border border-border text-xs">
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto" className="text-xs">Auto</SelectItem>
                <SelectItem value="none" className="text-xs">Nenhum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">User Select</Label>
            <Select
              value={styles.userSelect || 'auto'}
              onValueChange={(value) => onStyleChange('userSelect', value)}
            >
              <SelectTrigger className="w-32 h-8 bg-muted border border-border text-xs">
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto" className="text-xs">Auto</SelectItem>
                <SelectItem value="none" className="text-xs">Nenhum</SelectItem>
                <SelectItem value="text" className="text-xs">Texto</SelectItem>
                <SelectItem value="all" className="text-xs">Tudo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };
  
  const renderRawCssControls = () => {
    return (
      <div className="space-y-4 py-2">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">CSS Personalizado</Label>
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-xs"
              onClick={applyCssCode}
            >
              Aplicar
            </Button>
          </div>
          
          <Textarea
            value={cssCode}
            onChange={(e) => setCssCode(e.target.value)}
            className="font-mono text-xs bg-muted border border-border h-[300px]"
            placeholder="Digite seu CSS personalizado aqui..."
          />
        </div>
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
