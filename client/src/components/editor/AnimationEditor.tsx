import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface AnimationEditorProps {
  animations: { 
    type: string; 
    duration: number; 
    delay?: number; 
    easing?: string; 
    direction?: string; 
    repeat?: number; 
    customKeyframes?: string;
  }[];
  onAddAnimation: (animation: any) => void;
  onUpdateAnimation: (index: number, animation: any) => void;
  onRemoveAnimation: (index: number) => void;
}

const AnimationEditor: React.FC<AnimationEditorProps> = ({ 
  animations = [], 
  onAddAnimation, 
  onUpdateAnimation, 
  onRemoveAnimation 
}) => {
  const [activeTab, setActiveTab] = useState<string>('library');
  const [newAnimation, setNewAnimation] = useState({
    type: 'fade',
    duration: 0.5,
    delay: 0,
    easing: 'ease',
    direction: 'in',
    repeat: 1,
    customKeyframes: ''
  });
  
  const animationTypes = [
    { label: 'Fade', value: 'fade' },
    { label: 'Slide', value: 'slide' },
    { label: 'Scale', value: 'scale' },
    { label: 'Rotate', value: 'rotate' },
    { label: 'Custom', value: 'custom' },
  ];
  
  const easingTypes = [
    { label: 'Ease', value: 'ease' },
    { label: 'Linear', value: 'linear' },
    { label: 'Ease In', value: 'ease-in' },
    { label: 'Ease Out', value: 'ease-out' },
    { label: 'Ease In Out', value: 'ease-in-out' },
    { label: 'Spring', value: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' },
    { label: 'Bounce', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  ];
  
  const directionTypes = [
    { label: 'In', value: 'in' },
    { label: 'Out', value: 'out' },
    { label: 'In Out', value: 'inOut' },
  ];
  
  const presetAnimations = [
    {
      name: 'Fade In',
      animation: {
        type: 'fade',
        duration: 0.5,
        delay: 0,
        easing: 'ease',
        direction: 'in',
        repeat: 1
      }
    },
    {
      name: 'Fade Out',
      animation: {
        type: 'fade',
        duration: 0.5,
        delay: 0,
        easing: 'ease',
        direction: 'out',
        repeat: 1
      }
    },
    {
      name: 'Slide In From Left',
      animation: {
        type: 'slide',
        duration: 0.5,
        delay: 0,
        easing: 'ease-out',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes slideInFromLeft { 0% { transform: translateX(-100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }'
      }
    },
    {
      name: 'Slide In From Right',
      animation: {
        type: 'slide',
        duration: 0.5,
        delay: 0,
        easing: 'ease-out',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes slideInFromRight { 0% { transform: translateX(100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }'
      }
    },
    {
      name: 'Slide In From Top',
      animation: {
        type: 'slide',
        duration: 0.5,
        delay: 0,
        easing: 'ease-out',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes slideInFromTop { 0% { transform: translateY(-100%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }'
      }
    },
    {
      name: 'Slide In From Bottom',
      animation: {
        type: 'slide',
        duration: 0.5,
        delay: 0,
        easing: 'ease-out',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes slideInFromBottom { 0% { transform: translateY(100%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }'
      }
    },
    {
      name: 'Zoom In',
      animation: {
        type: 'scale',
        duration: 0.5,
        delay: 0,
        easing: 'ease-out',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes zoomIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }'
      }
    },
    {
      name: 'Zoom Out',
      animation: {
        type: 'scale',
        duration: 0.5,
        delay: 0,
        easing: 'ease-in',
        direction: 'out',
        repeat: 1,
        customKeyframes: '@keyframes zoomOut { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.5); opacity: 0; } }'
      }
    },
    {
      name: 'Rotate In',
      animation: {
        type: 'rotate',
        duration: 0.5,
        delay: 0,
        easing: 'ease-out',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes rotateIn { 0% { transform: rotate(-90deg); opacity: 0; } 100% { transform: rotate(0); opacity: 1; } }'
      }
    },
    {
      name: 'Rotate Out',
      animation: {
        type: 'rotate',
        duration: 0.5,
        delay: 0,
        easing: 'ease-in',
        direction: 'out',
        repeat: 1,
        customKeyframes: '@keyframes rotateOut { 0% { transform: rotate(0); opacity: 1; } 100% { transform: rotate(90deg); opacity: 0; } }'
      }
    },
    {
      name: 'Bounce',
      animation: {
        type: 'custom',
        duration: 0.8,
        delay: 0,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-30px); } 60% { transform: translateY(-15px); } }'
      }
    },
    {
      name: 'Pulse',
      animation: {
        type: 'custom',
        duration: 1.5,
        delay: 0,
        easing: 'ease-in-out',
        direction: 'in',
        repeat: 'Infinity',
        customKeyframes: '@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }'
      }
    },
    {
      name: 'Shake',
      animation: {
        type: 'custom',
        duration: 0.5,
        delay: 0,
        easing: 'ease-in-out',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); } 20%, 40%, 60%, 80% { transform: translateX(10px); } }'
      }
    },
    {
      name: 'Flash',
      animation: {
        type: 'custom',
        duration: 0.8,
        delay: 0,
        easing: 'ease-in-out',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes flash { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0; } }'
      }
    },
    {
      name: 'Tada',
      animation: {
        type: 'custom',
        duration: 0.8,
        delay: 0,
        easing: 'ease-in-out',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes tada { 0% { transform: scale(1); } 10%, 20% { transform: scale(0.9) rotate(-3deg); } 30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); } 40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); } 100% { transform: scale(1) rotate(0); } }'
      }
    },
    {
      name: 'Jello',
      animation: {
        type: 'custom',
        duration: 1,
        delay: 0,
        easing: 'ease-in-out',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes jello { 0%, 11.1%, 100% { transform: none; } 22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); } 33.3% { transform: skewX(6.25deg) skewY(6.25deg); } 44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); } 55.5% { transform: skewX(1.5625deg) skewY(1.5625deg); } 66.6% { transform: skewX(-0.78125deg) skewY(-0.78125deg); } 77.7% { transform: skewX(0.390625deg) skewY(0.390625deg); } 88.8% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); } }'
      }
    },
    {
      name: 'Swing',
      animation: {
        type: 'custom',
        duration: 1,
        delay: 0,
        easing: 'ease-in-out',
        direction: 'in',
        repeat: 1,
        customKeyframes: '@keyframes swing { 20% { transform: rotate3d(0, 0, 1, 15deg); } 40% { transform: rotate3d(0, 0, 1, -10deg); } 60% { transform: rotate3d(0, 0, 1, 5deg); } 80% { transform: rotate3d(0, 0, 1, -5deg); } 100% { transform: rotate3d(0, 0, 1, 0deg); } }'
      }
    },
  ];
  
  const handleAddNewAnimation = () => {
    onAddAnimation(newAnimation);
    // Reset form
    setNewAnimation({
      type: 'fade',
      duration: 0.5,
      delay: 0,
      easing: 'ease',
      direction: 'in',
      repeat: 1,
      customKeyframes: ''
    });
  };
  
  const handleAddPresetAnimation = (preset: any) => {
    onAddAnimation(preset.animation);
  };
  
  const renderAnimationsList = () => (
    <div className="space-y-4 p-2">
      {animations.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground p-4">
          Nenhuma animação adicionada.
        </div>
      ) : (
        animations.map((animation, index) => (
          <div key={index} className="bg-muted/50 rounded-md p-3 border border-border">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-sm">{animation.type.charAt(0).toUpperCase() + animation.type.slice(1)}</div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-muted-foreground"
                onClick={() => onRemoveAnimation(index)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={animation.duration}
                      onChange={(e) => onUpdateAnimation(index, { ...animation, duration: parseFloat(e.target.value) })}
                      className="w-full h-7 text-xs bg-background"
                    />
                    <span className="ml-1 text-xs">s</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Delay</Label>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={animation.delay}
                      onChange={(e) => onUpdateAnimation(index, { ...animation, delay: parseFloat(e.target.value) })}
                      className="w-full h-7 text-xs bg-background"
                    />
                    <span className="ml-1 text-xs">s</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Easing</Label>
                <Select
                  value={animation.easing}
                  onValueChange={(value) => onUpdateAnimation(index, { ...animation, easing: value })}
                >
                  <SelectTrigger className="h-7 text-xs bg-background">
                    <SelectValue placeholder="Select easing" />
                  </SelectTrigger>
                  <SelectContent>
                    {easingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-xs">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Direction</Label>
                  <Select
                    value={animation.direction}
                    onValueChange={(value) => onUpdateAnimation(index, { ...animation, direction: value })}
                  >
                    <SelectTrigger className="h-7 text-xs bg-background">
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      {directionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-xs">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Repeat</Label>
                  <div className="flex items-center">
                    <Input
                      value={animation.repeat}
                      onChange={(e) => {
                        const value = e.target.value === 'Infinity' ? e.target.value : parseFloat(e.target.value);
                        onUpdateAnimation(index, { ...animation, repeat: value });
                      }}
                      className="w-full h-7 text-xs bg-background"
                    />
                  </div>
                </div>
              </div>
              
              {animation.type === 'custom' && (
                <div>
                  <Label className="text-xs text-muted-foreground">Custom Keyframes</Label>
                  <Textarea
                    value={animation.customKeyframes}
                    onChange={(e) => onUpdateAnimation(index, { ...animation, customKeyframes: e.target.value })}
                    className="h-20 text-xs bg-background"
                  />
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
  
  const renderCreateAnimation = () => (
    <div className="space-y-4 p-2">
      <div>
        <Label className="text-xs text-muted-foreground">Animation Type</Label>
        <Select
          value={newAnimation.type}
          onValueChange={(value) => setNewAnimation({ ...newAnimation, type: value })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {animationTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Duration (seconds)</Label>
          <div className="flex items-center">
            <Input
              type="number"
              min="0"
              step="0.1"
              value={newAnimation.duration}
              onChange={(e) => setNewAnimation({ ...newAnimation, duration: parseFloat(e.target.value) })}
              className="w-full bg-background"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground">Delay (seconds)</Label>
          <div className="flex items-center">
            <Input
              type="number"
              min="0"
              step="0.1"
              value={newAnimation.delay}
              onChange={(e) => setNewAnimation({ ...newAnimation, delay: parseFloat(e.target.value) })}
              className="w-full bg-background"
            />
          </div>
        </div>
      </div>
      
      <div>
        <Label className="text-xs text-muted-foreground">Easing</Label>
        <Select
          value={newAnimation.easing}
          onValueChange={(value) => setNewAnimation({ ...newAnimation, easing: value })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select easing" />
          </SelectTrigger>
          <SelectContent>
            {easingTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Direction</Label>
          <Select
            value={newAnimation.direction}
            onValueChange={(value) => setNewAnimation({ ...newAnimation, direction: value })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent>
              {directionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground">Repeat</Label>
          <Input
            value={newAnimation.repeat}
            onChange={(e) => {
              const value = e.target.value === 'Infinity' ? e.target.value : parseInt(e.target.value);
              setNewAnimation({ ...newAnimation, repeat: value });
            }}
            className="bg-background"
            placeholder="1 or 'Infinity'"
          />
        </div>
      </div>
      
      {newAnimation.type === 'custom' && (
        <div>
          <Label className="text-xs text-muted-foreground">Custom Keyframes</Label>
          <Textarea
            value={newAnimation.customKeyframes}
            onChange={(e) => setNewAnimation({ ...newAnimation, customKeyframes: e.target.value })}
            className="h-20 bg-background"
            placeholder="@keyframes animationName { 0% { ... } 100% { ... } }"
          />
        </div>
      )}
      
      <Button className="w-full" onClick={handleAddNewAnimation}>
        Adicionar Animação
      </Button>
    </div>
  );
  
  const renderAnimationLibrary = () => (
    <div className="grid grid-cols-2 gap-2 p-2">
      {presetAnimations.map((preset, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto py-3 text-xs flex flex-col items-start justify-start text-left"
          onClick={() => handleAddPresetAnimation(preset)}
        >
          <div className="font-medium mb-1">{preset.name}</div>
          <div className="text-muted-foreground text-[10px]">
            {preset.animation.duration}s {preset.animation.type} {preset.animation.direction}
          </div>
        </Button>
      ))}
    </div>
  );
  
  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 rounded-none">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="current" className="m-0 p-0 h-full">
            {renderAnimationsList()}
          </TabsContent>
          
          <TabsContent value="create" className="m-0 p-0 h-full">
            {renderCreateAnimation()}
          </TabsContent>
          
          <TabsContent value="library" className="m-0 p-0 h-full">
            {renderAnimationLibrary()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AnimationEditor;