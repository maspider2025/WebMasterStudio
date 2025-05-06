import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AIAssistantProps {
  message: string;
  onDismiss: () => void;
}

const AIAssistant = ({ message, onDismiss }: AIAssistantProps) => {
  const { toast } = useToast();
  
  const handleAddSuggestion = () => {
    toast({
      title: "Sugestão aplicada",
      description: "Uma seção de galeria foi adicionada ao seu design.",
    });
    onDismiss();
  };
  
  return (
    <div className="absolute bottom-4 right-4 bg-background p-3 rounded-lg shadow-lg border border-border w-64 animate-in slide-in-from-bottom-5">
      <div className="flex items-start">
        <div className="flex-shrink-0 p-1 bg-accent/20 text-accent rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="ml-3">
          <h4 className="text-foreground text-sm font-medium">Sugestão de IA</h4>
          <p className="text-muted-foreground text-xs mt-1">{message}</p>
          <div className="mt-2 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-accent/20 text-accent border-accent/20 hover:bg-accent/30 hover:text-accent h-7 text-xs"
              onClick={handleAddSuggestion}
            >
              Adicionar
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground h-7 text-xs"
              onClick={onDismiss}
            >
              Ignorar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
