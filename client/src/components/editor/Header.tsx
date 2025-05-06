import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewMode } from "@/pages/editor";

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const Header = ({ viewMode, onViewModeChange }: HeaderProps) => {
  return (
    <header className="bg-secondary border-b border-border py-2 px-4 flex items-center justify-between">
      {/* Logo and Project Name */}
      <div className="flex items-center">
        <div className="flex items-center">
          <svg 
            className="w-8 h-8 text-primary" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 2L2 7L12 12L22 7L12 2Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path 
              d="M2 17L12 22L22 17" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path 
              d="M2 12L12 17L22 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <Link href="/">
            <span className="ml-2 text-lg font-semibold text-foreground cursor-pointer">NextGen Site Builder</span>
          </Link>
        </div>
        <div className="ml-8 flex gap-3">
          <button className="px-3 py-1 text-sm rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground">Arquivo</button>
          <button className="px-3 py-1 text-sm rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground">Editar</button>
          <button className="px-3 py-1 text-sm rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground">Visualizar</button>
          <button className="px-3 py-1 text-sm rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground">Publicar</button>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center border rounded-md border-border overflow-hidden">
          <button className="p-1.5 hover:bg-muted/80 border-r border-border">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-muted/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center">
          <button className="text-muted-foreground hover:text-foreground mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <div className="relative">
            <Select 
              defaultValue={viewMode} 
              onValueChange={(value) => onViewModeChange(value as ViewMode)}
            >
              <SelectTrigger className="w-[120px] bg-muted text-muted-foreground border-border">
                <SelectValue placeholder="Selecione o dispositivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button size="sm" className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Salvar
        </Button>
        
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-sm font-medium">
          US
        </div>
      </div>
    </header>
  );
};

export default Header;
