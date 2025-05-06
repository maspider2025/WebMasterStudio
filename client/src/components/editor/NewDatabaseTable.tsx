import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Database, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Column {
  name: string;
  type: string;
  primary?: boolean;
  notNull?: boolean;
  defaultValue?: string;
}

interface NewDatabaseTableProps {
  onTableCreated?: (tableName: string) => void;
}

const COLUMN_TYPES = [
  { value: 'string', label: 'Texto (String)' },
  { value: 'text', label: 'Texto Longo (Text)' },
  { value: 'integer', label: 'Número Inteiro (Integer)' },
  { value: 'decimal', label: 'Decimal (Numeric)' },
  { value: 'boolean', label: 'Booleano (Boolean)' },
  { value: 'date', label: 'Data (Date)' },
  { value: 'datetime', label: 'Data e Hora (Timestamp)' },
  { value: 'json', label: 'JSON' }
];

export default function NewDatabaseTable({ onTableCreated }: NewDatabaseTableProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tableName, setTableName] = useState('');
  const [tableDescription, setTableDescription] = useState('');
  const [columns, setColumns] = useState<Column[]>([
    { name: 'id', type: 'integer', primary: true, notNull: true }
  ]);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeSoftDelete, setIncludeSoftDelete] = useState(false);
  
  const resetForm = () => {
    setTableName('');
    setTableDescription('');
    setColumns([{ name: 'id', type: 'integer', primary: true, notNull: true }]);
    setIncludeTimestamps(true);
    setIncludeSoftDelete(false);
  };
  
  const addNewColumn = () => {
    setColumns([...columns, { name: '', type: 'string' }]);
  };
  
  const removeColumn = (index: number) => {
    // Não permite remover a coluna ID
    if (index === 0 && columns[0].name === 'id') {
      toast({
        title: "Operação não permitida",
        description: "A coluna ID é necessária e não pode ser removida.",
        variant: "destructive"
      });
      return;
    }
    
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
  };
  
  const updateColumn = (index: number, field: keyof Column, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
    
    // Se a coluna for marcada como chave primária, automaticamente marca como não nula
    if (field === 'primary' && value === true) {
      newColumns[index].notNull = true;
    }
  };
  
  const validateForm = () => {
    // Verificar nome da tabela
    if (!tableName.trim()) {
      toast({
        title: "Nome da tabela obrigatório",
        description: "Forneça um nome para a tabela.",
        variant: "destructive"
      });
      return false;
    }
    
    // Verificar formato do nome da tabela (apenas letras, números e underscores)
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tableName)) {
      toast({
        title: "Nome de tabela inválido",
        description: "O nome da tabela deve começar com uma letra e conter apenas letras, números e underscores.",
        variant: "destructive"
      });
      return false;
    }
    
    // Verificar colunas
    let hasPrimaryKey = false;
    
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      
      // Verificar se o nome da coluna está preenchido
      if (!column.name.trim()) {
        toast({
          title: "Nome de coluna obrigatório",
          description: `A coluna ${i + 1} precisa de um nome.`,
          variant: "destructive"
        });
        return false;
      }
      
      // Verificar formato do nome da coluna (apenas letras, números e underscores)
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(column.name)) {
        toast({
          title: "Nome de coluna inválido",
          description: `O nome da coluna "${column.name}" deve começar com uma letra e conter apenas letras, números e underscores.`,
          variant: "destructive"
        });
        return false;
      }
      
      // Verificar duplicação de nomes de colunas
      for (let j = 0; j < i; j++) {
        if (column.name.toLowerCase() === columns[j].name.toLowerCase()) {
          toast({
            title: "Duplicação de nome de coluna",
            description: `O nome da coluna "${column.name}" está duplicado.`,
            variant: "destructive"
          });
          return false;
        }
      }
      
      // Verificar se há pelo menos uma chave primária
      if (column.primary) {
        hasPrimaryKey = true;
      }
    }
    
    if (!hasPrimaryKey) {
      toast({
        title: "Chave primária ausente",
        description: "A tabela precisa ter pelo menos uma coluna como chave primária.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/database/tables', {
        name: tableName,
        description: tableDescription,
        columns,
        timestamps: includeTimestamps,
        softDelete: includeSoftDelete,
        generateApi: true // Habilitar geração automática de API
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Tabela criada",
          description: `A tabela ${tableName} foi criada com sucesso.`,
          variant: "default"
        });
        
        resetForm();
        setOpen(false);
        
        // Notificar o componente pai sobre a criação da tabela
        if (onTableCreated) {
          onTableCreated(tableName);
        }
      } else {
        toast({
          title: "Erro ao criar tabela",
          description: data.message || "Ocorreu um erro ao criar a tabela no banco de dados.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao criar tabela:", error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <Plus className="h-4 w-4" />
          Nova Tabela
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Criar Nova Tabela
          </DialogTitle>
          <DialogDescription>
            Defina o esquema da tabela. Colunas, tipos e relações serão criados automaticamente no banco de dados.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tableName">Nome da Tabela</Label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="ex: produtos"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use nomes no plural, apenas letras, números e underscores.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tableDescription">Descrição (Opcional)</Label>
              <Textarea
                id="tableDescription"
                value={tableDescription}
                onChange={(e) => setTableDescription(e.target.value)}
                placeholder="Descreva o propósito desta tabela"
                className="h-[70px]"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Colunas</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewColumn}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Coluna
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted py-2 px-4 text-sm font-medium grid grid-cols-[1fr_1fr_100px_100px_40px] gap-2">
                <div>Nome</div>
                <div>Tipo</div>
                <div className="text-center">Não Nulo</div>
                <div className="text-center">Chave Primária</div>
                <div></div>
              </div>
              
              <div className="divide-y">
                {columns.map((column, index) => (
                  <div key={index} className="py-2 px-4 grid grid-cols-[1fr_1fr_100px_100px_40px] gap-2 items-center">
                    <Input
                      value={column.name}
                      onChange={(e) => updateColumn(index, 'name', e.target.value)}
                      placeholder="Nome da coluna"
                      disabled={index === 0 && column.name === 'id'}
                    />
                    
                    <Select
                      value={column.type}
                      onValueChange={(value) => updateColumn(index, 'type', value)}
                      disabled={index === 0 && column.name === 'id'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLUMN_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex justify-center">
                      <Checkbox
                        checked={column.notNull}
                        onCheckedChange={(checked) => updateColumn(index, 'notNull', checked)}
                        disabled={column.primary || (index === 0 && column.name === 'id')}
                      />
                    </div>
                    
                    <div className="flex justify-center">
                      <Checkbox
                        checked={column.primary}
                        onCheckedChange={(checked) => updateColumn(index, 'primary', checked)}
                        disabled={index === 0 && column.name === 'id'}
                      />
                    </div>
                    
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeColumn(index)}
                        disabled={index === 0 && column.name === 'id'}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label className="text-base">Opções Adicionais</Label>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="timestamps"
                  checked={includeTimestamps}
                  onCheckedChange={setIncludeTimestamps}
                />
                <Label htmlFor="timestamps" className="font-normal cursor-pointer">
                  Incluir timestamps (created_at, updated_at)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="softDelete"
                  checked={includeSoftDelete}
                  onCheckedChange={setIncludeSoftDelete}
                />
                <Label htmlFor="softDelete" className="font-normal cursor-pointer">
                  Habilitar soft delete (deleted_at)
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            
            <Button type="submit" disabled={submitting} className="gap-1">
              {submitting ? (
                <>
                  <span className="animate-spin">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Criar Tabela
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}