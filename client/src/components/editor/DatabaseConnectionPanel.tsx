import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Database, Save, Plus, Trash2, Filter, ArrowDown, ArrowRight, Zap, RotateCw, ArrowUpDown } from 'lucide-react';
import { getAvailableTables, getTableFields } from '@/lib/database-element-integration';
import type { Element, DatabaseConnection } from '@/lib/element-types';

interface DatabaseConnectionPanelProps {
  element: Element;
  onUpdateDatabaseConnection: (connection: any) => void;
  projectId?: string; // Opcional, apenas para buscar fontes de dados existentes
}

function getOperatorLabel(operator: string): string {
  switch (operator) {
    case 'equals': return 'Igual a';
    case 'notEquals': return 'Diferente de';
    case 'contains': return 'Contém';
    case 'startsWith': return 'Começa com';
    case 'endsWith': return 'Termina com';
    case 'greaterThan': return 'Maior que';
    case 'lessThan': return 'Menor que';
    case 'in': return 'Em (lista)';
    case 'notIn': return 'Não em (lista)';
    case 'isNull': return 'É nulo';
    case 'isNotNull': return 'Não é nulo';
    default: return operator;
  }
}

function getOperatorOptions(fieldType: string): {value: string, label: string}[] {
  const operators = [
    { value: 'equals', label: 'Igual a' },
    { value: 'notEquals', label: 'Diferente de' },
  ];
  
  if (fieldType === 'string' || fieldType === 'text') {
    operators.push(
      { value: 'contains', label: 'Contém' },
      { value: 'startsWith', label: 'Começa com' },
      { value: 'endsWith', label: 'Termina com' },
    );
  }
  
  if (fieldType === 'number' || fieldType === 'integer' || fieldType === 'float' || fieldType === 'date' || fieldType === 'datetime') {
    operators.push(
      { value: 'greaterThan', label: 'Maior que' },
      { value: 'lessThan', label: 'Menor que' },
    );
  }
  
  operators.push(
    { value: 'isNull', label: 'É nulo' },
    { value: 'isNotNull', label: 'Não é nulo' },
  );
  
  return operators;
}

const DatabaseConnectionPanel: React.FC<DatabaseConnectionPanelProps> = ({ element, onUpdateDatabaseConnection, projectId = '1' }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('source');
  
  // Estado para o source (conexão com banco de dados)
  const [tableName, setTableName] = useState(element.dataConnection?.tableName || '');
  const [displayField, setDisplayField] = useState(element.dataConnection?.displayField || '');
  const [valueField, setValueField] = useState(element.dataConnection?.valueField || 'id');
  const [filterType, setFilterType] = useState(element.dataConnection?.filterType || 'and');
  const [filters, setFilters] = useState(element.dataConnection?.filters || []);
  const [limit, setLimit] = useState(element.dataConnection?.limit || 25);
  const [orderBy, setOrderBy] = useState(element.dataConnection?.orderBy || '');
  const [orderDirection, setOrderDirection] = useState(element.dataConnection?.orderDirection || 'desc');
  
  // Estado do formulário
  const [formMode, setFormMode] = useState(element.dataConnection?.formMode || 'create');
  const [formTable, setFormTable] = useState(element.dataConnection?.formTable || '');
  const [formFields, setFormFields] = useState(element.dataConnection?.formFields || []);
  const [submitRedirect, setSubmitRedirect] = useState(element.dataConnection?.submitRedirect || '');
  const [saveButtonText, setSaveButtonText] = useState(element.dataConnection?.saveButtonText || 'Salvar');
  
  // Estados para dados de tabelas
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [tableFields, setTableFields] = useState<any[]>([]);
  
  useEffect(() => {
    // Carregar tabelas disponíveis no projeto
    try {
      const tables = getAvailableTables(projectId);
      setAvailableTables(tables || []);
    } catch (error) {
      console.error('Erro ao carregar tabelas disponíveis:', error);
    }
  }, [projectId]);
  
  useEffect(() => {
    // Quando a tabela muda, carregar campos disponíveis
    if (tableName) {
      try {
        const fields = getTableFields(projectId, tableName);
        setTableFields(fields || []);
      } catch (error) {
        console.error(`Erro ao carregar campos da tabela ${tableName}:`, error);
      }
    } else {
      setTableFields([]);
    }
  }, [projectId, tableName]);
  
  useEffect(() => {
    // Quando a tabela do formulário muda, carregar campos disponíveis
    if (formTable) {
      try {
        const fields = getTableFields(projectId, formTable);
        setTableFields(fields || []);
      } catch (error) {
        console.error(`Erro ao carregar campos da tabela ${formTable}:`, error);
      }
    }
  }, [projectId, formTable]);
  
  const handleAddFilter = () => {
    setFilters([
      ...filters,
      {
        field: tableFields.length > 0 ? tableFields[0].name : '',
        operator: 'equals',
        value: ''
      }
    ]);
  };
  
  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };
  
  const handleFilterChange = (index: number, field: string, value: any) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setFilters(updatedFilters);
  };
  
  const handleSaveConnection = () => {
    // Montando o objeto de conexão de acordo com o tipo de elemento
    let connection: any = {};
    
    if (element.type === 'form') {
      connection = {
        formMode,
        formTable,
        formFields,
        submitRedirect,
        saveButtonText
      };
    } else {
      connection = {
        tableName,
        displayField,
        valueField,
        filterType,
        filters,
        limit,
        orderBy,
        orderDirection
      };
    }
    
    // Adicionar informações comuns
    connection.enabled = true;
    connection.elementId = element.id;
    
    onUpdateDatabaseConnection(connection);
    
    toast({
      title: "Conexão atualizada",
      description: "Configurações de banco de dados atualizadas com sucesso.",
      variant: "success"
    });
  };
  
  const renderFormConfiguration = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="form-mode">Modo do Formulário</Label>
        <Select
          value={formMode}
          onValueChange={setFormMode}
        >
          <SelectTrigger id="form-mode">
            <SelectValue placeholder="Selecione o modo do formulário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="create">Criar (INSERT)</SelectItem>
            <SelectItem value="edit">Editar (UPDATE)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Modo criar adiciona um novo registro, editar atualiza um registro existente.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="form-table">Tabela</Label>
        <Select
          value={formTable}
          onValueChange={setFormTable}
        >
          <SelectTrigger id="form-table">
            <SelectValue placeholder="Selecione a tabela" />
          </SelectTrigger>
          <SelectContent>
            {availableTables.map(table => (
              <SelectItem key={table.slug} value={table.slug}>{table.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {formTable && (
        <div className="space-y-2">
          <Label>Mapeamento de Campos</Label>
          <Card>
            <CardContent className="pt-6 pb-4">
              <p className="text-sm text-muted-foreground mb-2">Mapeie os campos do formulário com as colunas da tabela.</p>
              
              {element.children?.length ? (
                <div className="space-y-3">
                  {element.children.map((child: any, index: number) => {
                    // Filtrar apenas elementos de input dentro do form
                    if (!['input', 'textarea', 'select', 'checkbox', 'radio', 'switch'].includes(child.type)) {
                      return null;
                    }
                    
                    const inputName = child.props?.name || child.props?.id || `field_${index}`;
                    
                    return (
                      <div key={child.id || index} className="flex items-center space-x-2">
                        <div className="w-1/2">
                          <Badge variant="outline" className="text-xs">{inputName}</Badge>
                          <span className="text-xs text-muted-foreground ml-2">
                            {child.type === 'input' ? `(${child.props?.type || 'text'})` : `(${child.type})`}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="w-1/2">
                          <Select
                            value={formFields.find(f => f.input === inputName)?.field || ''}
                            onValueChange={(value) => {
                              const updatedFields = [...formFields];
                              const existingIndex = updatedFields.findIndex(f => f.input === inputName);
                              
                              if (existingIndex >= 0) {
                                updatedFields[existingIndex].field = value;
                              } else {
                                updatedFields.push({ input: inputName, field: value });
                              }
                              
                              setFormFields(updatedFields);
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Selecione o campo" />
                            </SelectTrigger>
                            <SelectContent>
                              {tableFields.map(field => (
                                <SelectItem key={field.name} value={field.name}>{field.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground italic">
                  Adicione elementos de formulário (input, select, etc.) ao seu formulário para configurar mapeamentos.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="submit-redirect">Redirecionamento após envio</Label>
        <Input
          id="submit-redirect"
          placeholder="/sucesso ou deixe em branco para não redirecionar"
          value={submitRedirect}
          onChange={(e) => setSubmitRedirect(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          URL para redirecionamento após envio do formulário. Deixe em branco para permanecer na mesma página.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="save-button-text">Texto do Botão</Label>
        <Input
          id="save-button-text"
          placeholder="Salvar"
          value={saveButtonText}
          onChange={(e) => setSaveButtonText(e.target.value)}
        />
      </div>
    </div>
  );
  
  const renderDataSourceConfiguration = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="data-table">Tabela de Dados</Label>
        <Select
          value={tableName}
          onValueChange={setTableName}
        >
          <SelectTrigger id="data-table">
            <SelectValue placeholder="Selecione a tabela" />
          </SelectTrigger>
          <SelectContent>
            {availableTables.map(table => (
              <SelectItem key={table.slug} value={table.slug}>{table.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {tableName && (
        <>
          <div className="space-y-2">
            <Label htmlFor="display-field">Campo de Exibição</Label>
            <Select
              value={displayField}
              onValueChange={setDisplayField}
            >
              <SelectTrigger id="display-field">
                <SelectValue placeholder="Selecione o campo de exibição" />
              </SelectTrigger>
              <SelectContent>
                {tableFields.map(field => (
                  <SelectItem key={field.name} value={field.name}>{field.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Campo que será exibido (para listas, selects, etc.).
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value-field">Campo de Valor</Label>
            <Select
              value={valueField}
              onValueChange={setValueField}
            >
              <SelectTrigger id="value-field">
                <SelectValue placeholder="Selecione o campo de valor" />
              </SelectTrigger>
              <SelectContent>
                {tableFields.map(field => (
                  <SelectItem key={field.name} value={field.name}>{field.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Campo usado como valor/id (geralmente "id").
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Filtros</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 gap-1"
                onClick={handleAddFilter}
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Filtro
              </Button>
            </div>
            
            <div className="space-y-3">
              {filters.length > 0 && (
                <div className="flex items-center space-x-3 mb-1">
                  <Label className="text-xs">Tipo de Filtro:</Label>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={filterType === 'and' ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs px-2 py-0"
                      onClick={() => setFilterType('and')}
                    >
                      E (AND)
                    </Button>
                    <Button
                      variant={filterType === 'or' ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs px-2 py-0"
                      onClick={() => setFilterType('or')}
                    >
                      OU (OR)
                    </Button>
                  </div>
                </div>
              )}
              
              {filters.length === 0 ? (
                <div className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  <Filter className="h-8 w-8 mx-auto mb-2 text-muted-foreground/80" />
                  <p className="mb-1">Sem filtros configurados</p>
                  <p>Clique em "Adicionar Filtro" para começar a filtrar os dados.</p>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-3 space-y-3">
                    <ScrollArea className="max-h-[300px]">
                      <div className="space-y-3 pr-3">
                        {filters.map((filter, index) => {
                          const selectedField = tableFields.find(f => f.name === filter.field);
                          const fieldType = selectedField?.type || 'string';
                          
                          return (
                            <div key={index} className="flex items-start gap-2 pb-3 border-b last:border-b-0 last:pb-0">
                              <div className="w-1/3">
                                <Select
                                  value={filter.field}
                                  onValueChange={(value) => handleFilterChange(index, 'field', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Campo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tableFields.map(field => (
                                      <SelectItem key={field.name} value={field.name}>{field.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="w-1/3">
                                <Select
                                  value={filter.operator}
                                  onValueChange={(value) => handleFilterChange(index, 'operator', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Operador" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getOperatorOptions(fieldType).map(op => (
                                      <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="w-1/4">
                                {!['isNull', 'isNotNull'].includes(filter.operator) && (
                                  <Input
                                    className="h-8"
                                    placeholder="Valor"
                                    value={filter.value}
                                    onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                                  />
                                )}
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveFilter(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label htmlFor="order-by">Ordenação</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={orderBy}
                  onValueChange={setOrderBy}
                >
                  <SelectTrigger id="order-by">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Padrão (id)</SelectItem>
                    {tableFields.map(field => (
                      <SelectItem key={field.name} value={field.name}>{field.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-initial">
                <Select
                  value={orderDirection}
                  onValueChange={setOrderDirection}
                >
                  <SelectTrigger id="order-direction" className="w-[120px]">
                    <SelectValue placeholder="Direção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">
                      <div className="flex items-center gap-1">
                        <ArrowUpDown className="h-3.5 w-3.5 rotate-180" />
                        Crescente
                      </div>
                    </SelectItem>
                    <SelectItem value="desc">
                      <div className="flex items-center gap-1">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        Decrescente
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="result-limit">Limite de Resultados: {limit}</Label>
            </div>
            <Slider
              id="result-limit"
              value={[limit]}
              onValueChange={(values) => setLimit(values[0])}
              min={1}
              max={100}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Quantidade máxima de resultados retornados. (1-100)
            </p>
          </div>
        </>
      )}
    </div>
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">Conexão com Banco de Dados</h2>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          {element.type === 'form' ? (
            <TabsTrigger className="flex-1" value="form">
              <RotateCw className="h-4 w-4 mr-2" />
              Configuração do Formulário
            </TabsTrigger>
          ) : (
            <TabsTrigger className="flex-1" value="source">
              <Database className="h-4 w-4 mr-2" />
              Fonte de Dados
            </TabsTrigger>
          )}
        </TabsList>
        
        {element.type === 'form' ? (
          <TabsContent value="form" className="space-y-4 py-4">
            {renderFormConfiguration()}
          </TabsContent>
        ) : (
          <TabsContent value="source" className="space-y-4 py-4">
            {renderDataSourceConfiguration()}
          </TabsContent>
        )}
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveConnection} className="gap-1">
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default DatabaseConnectionPanel;
