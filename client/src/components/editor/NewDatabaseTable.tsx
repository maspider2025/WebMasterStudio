import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Database, Save, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";

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
  { value: 'text', label: 'Texto' },
  { value: 'integer', label: 'Número Inteiro' },
  { value: 'decimal', label: 'Número Decimal' },
  { value: 'boolean', label: 'Booleano' },
  { value: 'date', label: 'Data' },
  { value: 'timestamp', label: 'Data e Hora' },
  { value: 'json', label: 'JSON' },
  { value: 'reference', label: 'Referência (Chave Estrangeira)' },
];

const NewDatabaseTable: React.FC<NewDatabaseTableProps> = ({ onTableCreated }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [tableName, setTableName] = useState('');
  const [tableDescription, setTableDescription] = useState('');
  const [generateApi, setGenerateApi] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { name: 'id', type: 'integer', notNull: true, primary: true, defaultValue: '' },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const resetForm = () => {
    setTableName('');
    setTableDescription('');
    setGenerateApi(true);
    setColumns([
      { name: 'id', type: 'integer', notNull: true, primary: true, defaultValue: '' },
    ]);
    setActiveTab('basic');
    setError(null);
  };
  
  const handleAddColumn = () => {
    setColumns([
      ...columns,
      { name: '', type: 'text', notNull: false, primary: false }
    ]);
  };
  
  const handleRemoveColumn = (index: number) => {
    // Não permitir remover a coluna ID primária
    if (index === 0 && columns[0].primary) {
      toast({
        title: "Não é possível remover",
        description: "A coluna ID primária não pode ser removida.",
        variant: "destructive"
      });
      return;
    }
    
    setColumns(columns.filter((_, i) => i !== index));
  };
  
  const handleColumnChange = (index: number, field: keyof ColumnConfig, value: any) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = { ...updatedColumns[index], [field]: value };
    setColumns(updatedColumns);
  };
  
  const validateForm = (): boolean => {
    // Verificar se o nome da tabela está vazio
    if (!tableName.trim()) {
      setError("O nome da tabela é obrigatório");
      setActiveTab('basic');
      return false;
    }
    
    // Verificar se o nome da tabela contém apenas caracteres válidos
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tableName)) {
      setError("O nome da tabela deve começar com uma letra e conter apenas letras, números e underscores");
      setActiveTab('basic');
      return false;
    }
    
    // Verificar todas as colunas
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      
      // Verificar se o nome da coluna está vazio
      if (!column.name.trim()) {
        setError(`O nome da coluna #${i + 1} é obrigatório`);
        setActiveTab('columns');
        return false;
      }
      
      // Verificar se o nome da coluna contém apenas caracteres válidos
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(column.name)) {
        setError(`O nome da coluna #${i + 1} deve começar com uma letra e conter apenas letras, números e underscores`);
        setActiveTab('columns');
        return false;
      }
    }
    
    // Verificar nomes duplicados de colunas
    const columnNames = columns.map(col => col.name.toLowerCase());
    const duplicates = columnNames.filter((name, index) => columnNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      setError(`Existem nomes de colunas duplicados: ${duplicates.join(', ')}`);
      setActiveTab('columns');
      return false;
    }
    
    return true;
  };
  
  const handleCreateTable = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      // Formatar os dados para envio
      const tableData = {
        name: tableName,
        description: tableDescription,
        generateApi,
        columns: columns.map(col => ({
          name: col.name,
          type: col.type,
          notNull: col.notNull,
          primary: col.primary,
          defaultValue: col.defaultValue || undefined
        }))
      };
      
      // Enviar para a API
      const response = await apiRequest(
        'POST',
        '/api/database/tables',
        tableData
      );
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Tabela criada com sucesso",
          description: `A tabela ${tableName} foi criada com sucesso no banco de dados.`,
          variant: "default"
        });
        
        // Callback para notificar o componente pai
        if (onTableCreated) {
          onTableCreated(tableName);
        }
        
        // Fechar o diálogo e resetar o formulário
        setOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erro ao criar tabela");
      }
    } catch (error) {
      console.error("Erro ao criar tabela:", error);
      setError("Ocorreu um erro ao criar a tabela. Verifique o console para mais detalhes.");
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Nova Tabela
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Criar Nova Tabela
          </DialogTitle>
          <DialogDescription>
            Configure os detalhes da nova tabela e suas colunas. Uma vez criada, a tabela estará disponível para uso em componentes.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">Informações Básicas</TabsTrigger>
            <TabsTrigger value="columns" className="flex-1">Colunas</TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">Visualização</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 mt-4">
            <div className="p-1">
              <TabsContent value="basic" className="mt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="table-name">Nome da Tabela <span className="text-destructive">*</span></Label>
                    <Input
                      id="table-name"
                      placeholder="produtos, usuarios, pedidos, etc."
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use nomes no plural e sem acentos. Exemplos: produtos, usuarios, pedidos.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="table-description">Descrição</Label>
                    <Input
                      id="table-description"
                      placeholder="Uma breve descrição da tabela e seu propósito"
                      value={tableDescription}
                      onChange={(e) => setTableDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="api-generation"
                      checked={generateApi}
                      onCheckedChange={setGenerateApi}
                    />
                    <Label htmlFor="api-generation" className="cursor-pointer">Gerar API automaticamente</Label>
                  </div>
                  
                  {generateApi && (
                    <Card>
                      <CardContent className="p-4 text-sm">
                        <div className="space-y-2">
                          <p className="font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Endpoints que serão gerados:
                          </p>
                          <ul className="space-y-1 text-muted-foreground">
                            <li className="flex"><Badge variant="outline" className="mr-2 w-14 flex justify-center">GET</Badge> <span>/api/{tableName}</span></li>
                            <li className="flex"><Badge variant="outline" className="mr-2 w-14 flex justify-center">GET</Badge> <span>/api/{tableName}/:id</span></li>
                            <li className="flex"><Badge variant="outline" className="mr-2 w-14 flex justify-center">POST</Badge> <span>/api/{tableName}</span></li>
                            <li className="flex"><Badge variant="outline" className="mr-2 w-14 flex justify-center">PATCH</Badge> <span>/api/{tableName}/:id</span></li>
                            <li className="flex"><Badge variant="outline" className="mr-2 w-14 flex justify-center">DELETE</Badge> <span>/api/{tableName}/:id</span></li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="columns" className="mt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium">Colunas da Tabela</h3>
                    <Button variant="outline" size="sm" onClick={handleAddColumn} className="gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar Coluna
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {columns.map((column, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-sm flex items-center gap-2">
                                {column.primary && (
                                  <Badge variant="default" className="px-1 text-xs">PRIMÁRIA</Badge>
                                )}
                                {column.name || `Coluna #${index + 1}`}
                              </h4>
                              
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveColumn(index)}
                                disabled={index === 0 && column.primary}
                                className="h-6 w-6"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor={`column-name-${index}`} className="text-xs">Nome</Label>
                                <Input
                                  id={`column-name-${index}`}
                                  className="h-8"
                                  value={column.name}
                                  onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                                  disabled={index === 0 && column.primary}
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor={`column-type-${index}`} className="text-xs">Tipo</Label>
                                <Select
                                  value={column.type}
                                  onValueChange={(value) => handleColumnChange(index, 'type', value)}
                                  disabled={index === 0 && column.primary}
                                >
                                  <SelectTrigger id={`column-type-${index}`} className="h-8">
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {COLUMN_TYPES.map(type => (
                                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`column-not-null-${index}`}
                                  checked={column.notNull}
                                  onCheckedChange={(value) => handleColumnChange(index, 'notNull', value)}
                                  disabled={index === 0 && column.primary}
                                />
                                <Label htmlFor={`column-not-null-${index}`} className="text-xs cursor-pointer">
                                  Obrigatório (NOT NULL)
                                </Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`column-primary-${index}`}
                                  checked={column.primary}
                                  onCheckedChange={(value) => {
                                    // Se estiver marcando como primária, desmarcar todas as outras
                                    if (value) {
                                      const updated = columns.map((col, i) => {
                                        if (i === index) return { ...col, primary: true, notNull: true };
                                        return { ...col, primary: false };
                                      });
                                      setColumns(updated);
                                    } else {
                                      handleColumnChange(index, 'primary', false);
                                    }
                                  }}
                                  disabled={index === 0 && column.primary}
                                />
                                <Label htmlFor={`column-primary-${index}`} className="text-xs cursor-pointer">
                                  Chave Primária
                                </Label>
                              </div>
                            </div>
                            
                            {!column.primary && (
                              <div className="space-y-1">
                                <Label htmlFor={`column-default-${index}`} className="text-xs">Valor Padrão</Label>
                                <Input
                                  id={`column-default-${index}`}
                                  className="h-8"
                                  placeholder="Deixe em branco para NULL"
                                  value={column.defaultValue || ''}
                                  onChange={(e) => handleColumnChange(index, 'defaultValue', e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-md font-medium mb-2">Prévia da Tabela</h3>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{tableName || "<Nome da Tabela>"}</h4>
                            <p className="text-sm text-muted-foreground">{tableDescription || "<Sem descrição>"}</p>
                          </div>
                          {generateApi && <Badge>API Habilitada</Badge>}
                        </div>
                        
                        <div className="mt-4">
                          <div className="border rounded-md">
                            <div className="grid grid-cols-4 gap-2 p-2 bg-muted text-xs font-medium">
                              <div>Nome</div>
                              <div>Tipo</div>
                              <div>Restrições</div>
                              <div>Padrão</div>
                            </div>
                            
                            <div className="divide-y">
                              {columns.map((column, index) => (
                                <div key={index} className="grid grid-cols-4 gap-2 p-2 text-xs">
                                  <div className="font-medium flex items-center gap-1">
                                    {column.name || `<Coluna ${index + 1}>`}
                                    {column.primary && <Badge variant="default" className="py-0 px-1 text-[10px]">PK</Badge>}
                                  </div>
                                  <div>{COLUMN_TYPES.find(t => t.value === column.type)?.label || column.type}</div>
                                  <div>
                                    {column.notNull ? "NOT NULL" : "NULL"}
                                  </div>
                                  <div>{column.defaultValue || "NULL"}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
        
        {error && (
          <div className="mt-4 text-sm p-3 border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>Cancelar</Button>
          <Button
            variant="default"
            onClick={handleCreateTable}
            disabled={isCreating}
            className="gap-1"
          >
            {isCreating ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
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