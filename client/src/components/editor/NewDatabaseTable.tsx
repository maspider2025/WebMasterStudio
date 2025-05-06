import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Plus, Database, Trash2, ArrowDown, ArrowUp, Save } from 'lucide-react';
import { createDatabaseTable } from '@/lib/database-element-integration';

interface NewDatabaseTableProps {
  onTableCreated?: (tableName: string) => void;
}

interface ColumnConfig {
  name: string;
  type: string;
  notNull: boolean;
  primary: boolean;
  defaultValue?: string;
}

const COLUMN_TYPES = [
  { value: 'text', label: 'Texto (text)' },
  { value: 'varchar', label: 'Texto Curto (varchar)' },
  { value: 'integer', label: 'Número Inteiro (integer)' },
  { value: 'float', label: 'Número Decimal (float)' },
  { value: 'boolean', label: 'Booleano (boolean)' },
  { value: 'date', label: 'Data (date)' },
  { value: 'timestamp', label: 'Data e Hora (timestamp)' },
  { value: 'jsonb', label: 'JSON (jsonb)' },
];

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { name: 'id', type: 'integer', notNull: true, primary: true },
  { name: 'created_at', type: 'timestamp', notNull: true, primary: false, defaultValue: 'CURRENT_TIMESTAMP' },
  { name: 'updated_at', type: 'timestamp', notNull: true, primary: false, defaultValue: 'CURRENT_TIMESTAMP' },
];

const NewDatabaseTable: React.FC<NewDatabaseTableProps> = ({ onTableCreated }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Estado básico
  const [tableName, setTableName] = useState('');
  const [tableDescription, setTableDescription] = useState('');
  const [columns, setColumns] = useState<ColumnConfig[]>([...DEFAULT_COLUMNS]);
  
  // Configurações adicionais
  const [withTimestamps, setWithTimestamps] = useState(true);
  const [withSoftDelete, setWithSoftDelete] = useState(false);
  
  const handleAddColumn = () => {
    setColumns([
      ...columns,
      { name: '', type: 'text', notNull: false, primary: false }
    ]);
  };
  
  const handleRemoveColumn = (index: number) => {
    // Não permitir remover colunas padrão (id, created_at, updated_at) se timestamps estiver ativado
    if (index < 3 && withTimestamps) {
      toast({
        title: "Coluna padrão",
        description: "Não é possível remover colunas padrão quando timestamps está ativado.",
        variant: "destructive"
      });
      return;
    }
    
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
  };
  
  const handleColumnChange = (index: number, field: keyof ColumnConfig, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };
  
  const moveColumn = (index: number, direction: 'up' | 'down') => {
    // Não permitir mover colunas padrão (id, created_at, updated_at) se timestamps estiver ativado
    if (index < 3 && withTimestamps) {
      toast({
        title: "Coluna padrão",
        description: "Não é possível reordenar colunas padrão quando timestamps está ativado.",
        variant: "destructive"
      });
      return;
    }
    
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === columns.length - 1)) {
      return;
    }
    
    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Trocar as colunas de posição
    [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
    
    setColumns(newColumns);
  };
  
  const handleToggleTimestamps = (enabled: boolean) => {
    setWithTimestamps(enabled);
    
    if (enabled) {
      // Adicionar colunas created_at e updated_at se não existirem
      const hasCreatedAt = columns.some(col => col.name === 'created_at');
      const hasUpdatedAt = columns.some(col => col.name === 'updated_at');
      
      const newColumns = [...columns];
      
      if (!hasCreatedAt) {
        newColumns.push({ 
          name: 'created_at', 
          type: 'timestamp', 
          notNull: true, 
          primary: false,
          defaultValue: 'CURRENT_TIMESTAMP'
        });
      }
      
      if (!hasUpdatedAt) {
        newColumns.push({ 
          name: 'updated_at', 
          type: 'timestamp', 
          notNull: true, 
          primary: false,
          defaultValue: 'CURRENT_TIMESTAMP'
        });
      }
      
      setColumns(newColumns);
    } else {
      // Remover colunas de timestamp automaticamente adicionadas
      const newColumns = columns.filter(col => 
        col.name !== 'created_at' && col.name !== 'updated_at'
      );
      setColumns(newColumns);
    }
  };
  
  const handleToggleSoftDelete = (enabled: boolean) => {
    setWithSoftDelete(enabled);
    
    if (enabled) {
      // Adicionar coluna deleted_at se não existir
      const hasDeletedAt = columns.some(col => col.name === 'deleted_at');
      
      if (!hasDeletedAt) {
        setColumns([
          ...columns,
          { name: 'deleted_at', type: 'timestamp', notNull: false, primary: false }
        ]);
      }
    } else {
      // Remover coluna deleted_at se existir
      const newColumns = columns.filter(col => col.name !== 'deleted_at');
      setColumns(newColumns);
    }
  };
  
  const resetForm = () => {
    setTableName('');
    setTableDescription('');
    setColumns([...DEFAULT_COLUMNS]);
    setWithTimestamps(true);
    setWithSoftDelete(false);
    setActiveTab('basic');
  };
  
  const validateForm = (): boolean => {
    // Validar nome da tabela
    if (!tableName.trim()) {
      toast({
        title: "Nome da tabela obrigatório",
        description: "Por favor, insira um nome para a tabela.",
        variant: "destructive"
      });
      return false;
    }
    
    // Validar formato do nome (apenas letras, números e underscores)
    if (!/^[a-z][a-z0-9_]*$/.test(tableName)) {
      toast({
        title: "Nome da tabela inválido",
        description: "O nome da tabela deve começar com uma letra minúscula e conter apenas letras minúsculas, números e underscores.",
        variant: "destructive"
      });
      return false;
    }
    
    // Validar colunas
    for (const column of columns) {
      if (!column.name.trim()) {
        toast({
          title: "Nome de coluna obrigatório",
          description: "Todas as colunas devem ter um nome.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!/^[a-z][a-z0-9_]*$/.test(column.name)) {
        toast({
          title: "Nome de coluna inválido",
          description: `O nome da coluna "${column.name}" deve começar com uma letra minúscula e conter apenas letras minúsculas, números e underscores.`,
          variant: "destructive"
        });
        return false;
      }
    }
    
    // Verificar duplicação de nomes de colunas
    const columnNames = columns.map(col => col.name);
    const uniqueNames = new Set(columnNames);
    
    if (uniqueNames.size !== columnNames.length) {
      toast({
        title: "Nomes de colunas duplicados",
        description: "Cada coluna deve ter um nome único.",
        variant: "destructive"
      });
      return false;
    }
    
    // Verificar se existe pelo menos uma coluna primária
    const hasPrimaryKey = columns.some(col => col.primary);
    
    if (!hasPrimaryKey) {
      toast({
        title: "Chave primária obrigatória",
        description: "A tabela deve ter pelo menos uma coluna definida como chave primária.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const handleCreateTable = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Formatar colunas para a API
      const formattedColumns = columns.map(col => ({
        name: col.name,
        type: col.type,
        notNull: col.notNull,
        primary: col.primary,
        defaultValue: col.defaultValue
      }));
      
      // Chamar API para criar tabela
      const result = await createDatabaseTable(
        tableName,
        formattedColumns,
        {
          timestamps: withTimestamps,
          softDelete: withSoftDelete,
          description: tableDescription
        }
      );
      
      // Exibir mensagem de sucesso
      toast({
        title: "Tabela criada com sucesso",
        description: `A tabela ${tableName} foi criada com sucesso.`,
        variant: "default"
      });
      
      // Executar callback se fornecido
      if (onTableCreated) {
        onTableCreated(tableName);
      }
      
      // Fechar modal e resetar formulário
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar tabela:', error);
      
      // Exibir mensagem de erro
      toast({
        title: "Erro ao criar tabela",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar a tabela. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const renderBasicTab = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="table-name">Nome da Tabela <span className="text-destructive">*</span></Label>
        <Input
          id="table-name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="nome_da_tabela"
        />
        <p className="text-xs text-muted-foreground">
          Use letras minúsculas, números e underscores. Ex: produtos, categorias_produtos
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="table-description">Descrição</Label>
        <Input
          id="table-description"
          value={tableDescription}
          onChange={(e) => setTableDescription(e.target.value)}
          placeholder="Descreva o propósito desta tabela"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="with-timestamps"
          checked={withTimestamps}
          onCheckedChange={handleToggleTimestamps}
        />
        <Label htmlFor="with-timestamps">Incluir Timestamps (created_at, updated_at)</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="with-soft-delete"
          checked={withSoftDelete}
          onCheckedChange={handleToggleSoftDelete}
        />
        <Label htmlFor="with-soft-delete">Incluir Soft Delete (deleted_at)</Label>
      </div>
    </div>
  );
  
  const renderColumnsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Colunas da Tabela</Label>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={handleAddColumn}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar Coluna
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="max-h-96">
            <div className="p-3 space-y-4">
              {columns.map((column, index) => (
                <div key={index} className="flex gap-2 items-start group pb-4 pt-2 border-b last:border-0 last:pb-2">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`column-name-${index}`} className="text-xs">Nome <span className="text-destructive">*</span></Label>
                        <Input
                          id={`column-name-${index}`}
                          value={column.name}
                          onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                          placeholder="nome_da_coluna"
                          className="h-8"
                          disabled={index < 3 && withTimestamps}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`column-type-${index}`} className="text-xs">Tipo <span className="text-destructive">*</span></Label>
                        <Select
                          value={column.type}
                          onValueChange={(value) => handleColumnChange(index, 'type', value)}
                          disabled={index < 3 && withTimestamps}
                        >
                          <SelectTrigger id={`column-type-${index}`} className="h-8">
                            <SelectValue placeholder="Selecione um tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {COLUMN_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-1">
                        <Switch
                          id={`column-not-null-${index}`}
                          checked={column.notNull}
                          onCheckedChange={(checked) => handleColumnChange(index, 'notNull', checked)}
                          disabled={index < 3 && withTimestamps}
                        />
                        <Label htmlFor={`column-not-null-${index}`} className="text-xs">Not Null</Label>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Switch
                          id={`column-primary-${index}`}
                          checked={column.primary}
                          onCheckedChange={(checked) => handleColumnChange(index, 'primary', checked)}
                          disabled={index < 3 && withTimestamps && index > 0}
                        />
                        <Label htmlFor={`column-primary-${index}`} className="text-xs">Chave Primária</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor={`column-default-${index}`} className="text-xs">Valor Padrão</Label>
                      <Input
                        id={`column-default-${index}`}
                        value={column.defaultValue || ''}
                        onChange={(e) => handleColumnChange(index, 'defaultValue', e.target.value)}
                        placeholder="Valor padrão"
                        className="h-8"
                        disabled={index < 3 && withTimestamps}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground" 
                      onClick={() => moveColumn(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground" 
                      onClick={() => moveColumn(index, 'down')}
                      disabled={index === columns.length - 1}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 hover:text-destructive text-muted-foreground" 
                      onClick={() => handleRemoveColumn(index)}
                      disabled={index === 0 && withTimestamps} // Não permitir remover a coluna ID
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 gap-1">
          <Plus className="h-3.5 w-3.5" />
          Nova Tabela
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> 
            Criar Nova Tabela
          </DialogTitle>
          <DialogDescription>
            Defina a estrutura da sua tabela. Os campos marcados com <span className="text-destructive">*</span> são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">Informações Básicas</TabsTrigger>
            <TabsTrigger value="columns" className="flex-1">Colunas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-4">
            {renderBasicTab()}
          </TabsContent>
          
          <TabsContent value="columns" className="mt-4">
            {renderColumnsTab()}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button className="gap-1" onClick={handleCreateTable}>
            <Save className="h-4 w-4" />
            Criar Tabela
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewDatabaseTable;