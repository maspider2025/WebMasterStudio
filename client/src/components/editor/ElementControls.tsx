import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/editor-store";
import { ElementTypes } from "@/lib/element-types";
import { Clipboard, Copy, Trash2, MoveUp, MoveDown, EyeOff } from "lucide-react";

interface ElementControlsProps {
  elementId: string;
}

const ElementControls = ({ elementId }: ElementControlsProps) => {
  const { 
    deleteElement, 
    duplicateElement,
    moveElementUp,
    moveElementDown,
    updateElementVisibility
  } = useEditorStore();
  
  return (
    <div className="absolute right-0 top-0 transform translate-x-full bg-background border border-border rounded-md shadow-md flex flex-col p-1 -mr-2 mt-2">
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8"
        title="Copiar"
        onClick={() => duplicateElement(elementId)}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8"
        title="Mover para cima"
        onClick={() => moveElementUp(elementId)}
      >
        <MoveUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8"
        title="Mover para baixo"
        onClick={() => moveElementDown(elementId)}
      >
        <MoveDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8"
        title="Esconder"
        onClick={() => updateElementVisibility(elementId, false)}
      >
        <EyeOff className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 text-destructive hover:text-destructive hover:bg-background/90"
        title="Excluir"
        onClick={() => deleteElement(elementId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ElementControls;
