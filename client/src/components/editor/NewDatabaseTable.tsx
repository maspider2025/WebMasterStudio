import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, Database, Save } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface NewDatabaseTableProps {
  onTableCreated?: (tableName: string) => void;
}

export const NewDatabaseTable: React.FC<NewDatabaseTableProps> = ({ onTableCreated }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tableName, setTableName] = useState('');
  const [tableDescription, setTableDescription] = useState('');
  const [columns, setColumns] = useState<{name: string; type: string; notNull: boolean; primary: boolean; defaultValue?: string}[]>([
    { name: 'id', type: 'integer', notNull: true, primary: true },
    { name: 'name', type: 'string', notNull: true, primary: false },
  ]);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeSoftDelete, setIncludeSoftDelete] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const availableTypes = [
    { id: 'string', name: 'Texto curto (string)' },
    { id: 'text', name: 'Texto longo (text)' },
    { id: 'integer', name: 'Número inteiro (integer)' },
    { id: 'number', name: 'Número decimal (number)' },
    { id: 'boolean', name: 'Booleano (boolean)' },
    { id: 'date', name: 'Data (date)' },
    { id: 'datetime', name: 'Data e hora (datetime)' },
    { id: 'json', name: 'JSON (json)' },
  ];
  
  const handleAddColumn = () => {
    setColumns([
      ...columns,
      { name: '', type: 'string', notNull: false, primary: false }
    ]);
  };
  
  const handleRemoveColumn = (index: number) => {
    // Não permitir remover a coluna ID
    if (index === 0 && columns[0].name === 'id') {
      toast({
        title: "Coluna ID não pode ser removida",
        description: "A coluna ID é obrigatória para todas as tabelas.",
        variant: "destructive"
      });
      return;
    }
    
    setColumns(columns.filter((_, i) => i !== index));
  };
  
  const handleColumnChange = (index: number, field: string, value: any) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = { ...updatedColumns[index], [field]: value };
    
    // Se mudar coluna para primary key, desativar primary key em outras colunas
    if (field === 'primary' && value === true) {
      updatedColumns.forEach((col, i) => {
        if (i !== index) {
          col.primary = false;
        }
      });
    }
    
    setColumns(updatedColumns);
  };
  
  const createTable = async () => {
    // Validar formulário
    if (!tableName) {
      toast({
        title: "Nome da tabela obrigatório",
        description: "Por favor, informe um nome para a tabela.",
        variant: "destructive"
      });
      return;
    }
    
    // Validar nomes de colunas
    const invalidColumns = columns.filter(col => !col.name);
    if (invalidColumns.length > 0) {
      toast({
        title: "Nome das colunas obrigatório",
        description: "Todas as colunas devem ter um nome definido.",
        variant: "destructive"
      });
      return;
    }
    
    // Validar duplicação de nomes de coluna
    const uniqueColumnNames = new Set(columns.map(col => col.name));
    if (uniqueColumnNames.size !== columns.length) {
      toast({
        title: "Nomes de coluna duplicados",
        description: "Os nomes das colunas devem ser únicos.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tableData = {
        tableName: tableName.toLowerCase().replace(/\s+/g, '_'),
        columns,
        timestamps: includeTimestamps,
        softDelete: includeSoftDelete,
        description: tableDescription
      };
      
      const response = await apiRequest('POST', '/api/database/tables', tableData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar tabela');
      }
      
      const result = await response.json();
      
      toast({
        title: "Tabela criada com sucesso",
        description: `A tabela ${result.tableName} foi criada com ${result.columns.length} colunas.`,
      });
      
      // Resetar formulário
      setTableName('');
      setTableDescription('');
      setColumns([
        { name: 'id', type: 'integer', notNull: true, primary: true },
        { name: 'name', type: 'string', notNull: true, primary: false },
      ]);
      
      // Fechar diálogo
      setOpen(false);
      
      // Callback
      if (onTableCreated) {
        onTableCreated(result.tableName);
      }
    } catch (error) {
      console.error('Erro ao criar tabela:', error);
      
      toast({
        title: "Erro ao criar tabela",
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao criar a tabela.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Nova Tabela
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Criar Nova Tabela
          </DialogTitle>
          <DialogDescription>
            Defina a estrutura da tabela para armazenar seus dados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="table-name">Nome da Tabela</Label>
            <Input 
              id="table-name" 
              placeholder="Ex: produtos, clientes, pedidos" 
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              O nome da tabela será convertido para minúsculas e espaços serão substituídos por underscores (_).
            </p>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="table-description">Descrição (opcional)</Label>
            <Input 
              id="table-description" 
              placeholder="Descreva o propósito desta tabela" 
              value={tableDescription}
              onChange={(e) => setTableDescription(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Colunas</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={handleAddColumn}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Adicionar Coluna
              </Button>
            </div>
            
            <Card>
              <ScrollArea className="max-h-[250px]">
                <div className="p-3 space-y-3">
                  {columns.map((column, index) => (
                    <div key={index} className="flex flex-wrap gap-2 items-start pb-3 border-b last:border-b-0">
                      <div className="w-[200px]">
                        <Label htmlFor={`col-name-${index}`} className="text-xs mb-1 block">Nome da Coluna</Label>
                        <Input 
                          id={`col-name-${index}`}
                          placeholder="nome_da_coluna"
                          value={column.name}
                          onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                          className="h-8"
                          disabled={index === 0 && column.name === 'id'} // Não permitir alterar nome da coluna ID
                        />
                      </div>
                      
                      <div className="w-[200px]">
                        <Label htmlFor={`col-type-${index}`} className="text-xs mb-1 block">Tipo</Label>
                        <Select 
                          value={column.type}
                          onValueChange={(value) => handleColumnChange(index, 'type', value)}
                          disabled={index === 0 && column.name === 'id'} // Não permitir alterar tipo da coluna ID
                        >
                          <SelectTrigger id={`col-type-${index}`} className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex flex-col justify-end space-y-1 pt-[22px] ml-2">
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center space-x-1.5">
                            <Switch 
                              id={`col-required-${index}`}
                              checked={column.notNull}
                              onCheckedChange={(checked) => handleColumnChange(index, 'notNull', checked)}
                              disabled={index === 0 && column.name === 'id'} // Não permitir alterar requerido da coluna ID
                            />
                            <Label htmlFor={`col-required-${index}`} className="text-xs">Obrigatório</Label>
                          </div>
                          
                          <div className="flex items-center space-x-1.5 ml-2">
                            <Switch 
                              id={`col-primary-${index}`}
                              checked={column.primary}
                              onCheckedChange={(checked) => handleColumnChange(index, 'primary', checked)}
                              disabled={index === 0 && column.name === 'id'} // Não permitir alterar primary da coluna ID
                            />
                            <Label htmlFor={`col-primary-${index}`} className="text-xs">Chave Primária</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveColumn(index)}
                          disabled={index === 0 && column.name === 'id'} // Não permitir remover coluna ID
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="timestamps" 
                checked={includeTimestamps}
                onCheckedChange={setIncludeTimestamps}
              />
              <Label htmlFor="timestamps">Incluir timestamps (created_at, updated_at)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="soft-delete" 
                checked={includeSoftDelete}
                onCheckedChange={setIncludeSoftDelete}
              />
              <Label htmlFor="soft-delete">Habilitar exclusão lógica (soft delete)</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button 
            onClick={createTable} 
            disabled={isSubmitting}
            className="gap-1"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⟳</span>
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
      </DialogContent>
    </Dialog>
  );
};

export default NewDatabaseTable;
