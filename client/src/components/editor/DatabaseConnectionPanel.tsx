import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Element } from '@/lib/editor-store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  getAvailableDataSources, 
  getAvailableDatabaseOperations, 
  configureElementDatabaseConnection,
  fetchDataForElement,
  getElementDatabaseStatus
} from '@/lib/database-element-integration';
import { useToast } from '@/hooks/use-toast';
import { Database, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface DatabaseConnectionPanelProps {
  element: Element;
  onUpdateDatabaseConnection: (connection: any) => void;
  projectId?: string; // Opcional, apenas para buscar fontes de dados existentes
}

const DatabaseConnectionPanel: React.FC<DatabaseConnectionPanelProps> = ({
  element,
  onUpdateDatabaseConnection,
  projectId = 'default' // Valor padrão
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('api');
  const [selectedDataSource, setSelectedDataSource] = useState<string>(element.dataConnection?.dataSource || 'products');
  const [selectedOperation, setSelectedOperation] = useState<string>(element.dataConnection?.operation || 'get');
  const [isConfigured, setIsConfigured] = useState<boolean>(element.dataConnection?.configured || false);
  const [selectedFields, setSelectedFields] = useState<string[]>(element.dataConnection?.fields || []);
  const [filters, setFilters] = useState<any[]>(element.dataConnection?.filters || []);
  const [customQuery, setCustomQuery] = useState<string>(element.dataConnection?.customQuery || '');
  const [useCustomTemplate, setUseCustomTemplate] = useState<boolean>(false);
  const [customTemplate, setCustomTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{success?: boolean; message?: string; data?: any} | null>(null);
  
  // Obter fontes de dados disponíveis
  const dataSources = getAvailableDataSources(projectId);
  
  // Se não houver fontes de dados cadastradas, usar dados de exemplo
  const defaultDataSources = [
    { name: 'Produtos', fields: ['id', 'name', 'description', 'price', 'salePrice', 'sku', 'status', 'inventory', 'images'] },
    { name: 'Categorias', fields: ['id', 'name', 'slug', 'description'] },
    { name: 'Pedidos', fields: ['id', 'customerId', 'status', 'orderDate', 'orderTotal', 'paymentStatus', 'shippingStatus'] },
    { name: 'Clientes', fields: ['id', 'name', 'email', 'createdAt'] },
    { name: 'Páginas', fields: ['id', 'title', 'slug', 'content', 'status'] },
  ];
  
  const availableDataSources = dataSources.length > 0 ? dataSources : defaultDataSources;
  
  // Operações disponíveis para o tipo de elemento
  const operations = getAvailableDatabaseOperations(element.type);
  
  // Atualizar campos selecionados quando mudar a fonte de dados
  useEffect(() => {
    const dataSource = availableDataSources.find(ds => ds.name.toLowerCase() === selectedDataSource) || 
                      availableDataSources[0];
    
    if (dataSource) {
      // Se não houver campos selecionados ou se mudou a fonte de dados, selecionar todos
      if (selectedFields.length === 0 || 
          !element.dataConnection?.dataSource || 
          element.dataConnection.dataSource !== selectedDataSource) {
        setSelectedFields(dataSource.fields);
      }
    }
  }, [selectedDataSource, availableDataSources, element.dataConnection?.dataSource]);
  
  // Novo filtro temporário
  const [newFilter, setNewFilter] = useState({
    field: '',
    operator: 'equals',
    value: ''
  });
  
  // Function to handle saving the configuration
  const handleSaveConfiguration = () => {
    const dataSource = availableDataSources.find(ds => 
      ds.name.toLowerCase() === selectedDataSource.toLowerCase());
    
    if (!dataSource) {
      toast({
        title: "Erro",
        description: "Fonte de dados não encontrada",
        variant: "destructive"
      });
      return;
    }
    
    // Configuração para a conexão com o banco de dados
    const connection = {
      configured: true,
      dataSource: selectedDataSource.toLowerCase(),
      operation: selectedOperation,
      fields: selectedFields,
      filters: filters,
      customQuery: activeTab === 'sql' ? customQuery : '',
      template: useCustomTemplate ? customTemplate : ''
    };
    
    // Atualizar o elemento
    onUpdateDatabaseConnection(connection);
    setIsConfigured(true);
    
    toast({
      title: "Configuração salva",
      description: "Conexão com dados configurada com sucesso",
      variant: "success"
    });
  };
  
  // Adicionar um novo filtro
  const handleAddFilter = () => {
    if (!newFilter.field || !newFilter.value) {
      toast({
        title: "Campos incompletos",
        description: "Preencha o campo e o valor para adicionar o filtro",
        variant: "destructive"
      });
      return;
    }
    
    setFilters([...filters, { ...newFilter }]);
    setNewFilter({ field: '', operator: 'equals', value: '' });
  };
  
  // Remover um filtro existente
  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };
  
  // Testar a conexão com os dados
  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Criar uma cópia do elemento com a configuração atual
      const testElement = configureElementDatabaseConnection(
        { ...element },
        {
          dataSource: selectedDataSource.toLowerCase(),
          operation: selectedOperation,
          fields: selectedFields,
          filters: filters,
          customQuery: activeTab === 'sql' ? customQuery : ''
        }
      );
      
      // Tentar buscar dados
      const data = await fetchDataForElement(testElement);
      
      setTestResult({
        success: true,
        message: "Conexão realizada com sucesso",
        data: data
      });
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Erro ao conectar com os dados"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderApiTab = () => (
    <div className="space-y-4 p-3">
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Fonte de Dados</Label>
        <Select 
          value={selectedDataSource}
          onValueChange={setSelectedDataSource}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma fonte de dados" />
          </SelectTrigger>
          <SelectContent>
            {availableDataSources.map(source => (
              <SelectItem key={source.name} value={source.name.toLowerCase()}>{source.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Operação</Label>
        <div className="grid grid-cols-1 gap-2">
          {operations.map(op => (
            <Card key={op.id} className={`cursor-pointer border ${selectedOperation === op.id ? 'border-primary bg-muted/30' : 'border-border bg-background'}`}
              onClick={() => setSelectedOperation(op.id)}
            >
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm">{op.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <CardDescription className="text-xs">{op.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Campos a serem exibidos</Label>
        <ScrollArea className="h-[150px] border rounded-md p-2">
          {availableDataSources.find(ds => ds.name.toLowerCase() === selectedDataSource)?.fields.map(field => (
            <div key={field} className="flex items-center space-x-2 py-1">
              <Checkbox 
                id={`field-${field}`} 
                checked={selectedFields.includes(field)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedFields([...selectedFields, field]);
                  } else {
                    setSelectedFields(selectedFields.filter(f => f !== field));
                  }
                }}
              />
              <Label htmlFor={`field-${field}`} className="text-sm font-normal">{field}</Label>
            </div>
          ))}
        </ScrollArea>
      </div>
      
      {selectedOperation === 'get' && (
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium mb-1.5 block">Filtros</Label>
            {filters.length > 0 && (
              <Badge variant="outline" className="mb-1.5">{filters.length} filtro(s)</Badge>
            )}
          </div>
          
          {filters.length > 0 && (
            <div className="mb-3 border rounded-md p-2">
              <ScrollArea className="h-[100px]">
                {filters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-2 py-1">
                    <div className="flex-1 flex items-center gap-1 text-xs">
                      <Badge variant="outline" className="font-mono">{filter.field}</Badge>
                      <span>{getOperatorLabel(filter.operator)}</span>
                      <Badge variant="secondary" className="font-mono">{filter.value}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRemoveFilter(index)}>
                      <span className="sr-only">Remover</span>
                      <span aria-hidden="true">×</span>
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2">
            <Select 
              value={newFilter.operator}
              onValueChange={(value) => setNewFilter({...newFilter, operator: value})}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Operador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">É igual a</SelectItem>
                <SelectItem value="notEquals">Não é igual a</SelectItem>
                <SelectItem value="contains">Contém</SelectItem>
                <SelectItem value="greaterThan">Maior que</SelectItem>
                <SelectItem value="lessThan">Menor que</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={newFilter.field}
              onValueChange={(value) => setNewFilter({...newFilter, field: value})}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Campo" />
              </SelectTrigger>
              <SelectContent>
                {availableDataSources.find(ds => ds.name.toLowerCase() === selectedDataSource)?.fields.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              placeholder="Valor" 
              className="w-full" 
              value={newFilter.value}
              onChange={(e) => setNewFilter({...newFilter, value: e.target.value})}
            />
          </div>
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="outline" onClick={handleAddFilter}>
              Adicionar Filtro
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderSqlTab = () => (
    <div className="space-y-4 p-3">
      <Label className="text-sm font-medium mb-1.5 block">Consulta SQL personalizada</Label>
      <Textarea 
        className="min-h-[200px] font-mono text-sm"
        placeholder="SELECT * FROM produtos WHERE status = 'published'"
        value={customQuery}
        onChange={(e) => setCustomQuery(e.target.value)}
      />
      <div className="flex items-center space-x-2">
        <Switch id="auto-execute" />
        <Label htmlFor="auto-execute">Executar automaticamente ao carregar</Label>
      </div>
    </div>
  );
  
  const renderTemplatingTab = () => (
    <div className="space-y-4 p-3">
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Template HTML para exibição de dados</Label>
        <Textarea 
          className="min-h-[200px] font-mono text-sm"
          placeholder={`<div class="product-list">
  {{#each data}}
    <div class="product-item">
      <h3>{{name}}</h3>
      <p>{{description}}</p>
      <span class="price">R$ {{price}}</span>
    </div>
  {{/each}}
</div>`}
          value={customTemplate}
          onChange={(e) => setCustomTemplate(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="use-template" 
          checked={useCustomTemplate}
          onCheckedChange={setUseCustomTemplate}
        />
        <Label htmlFor="use-template">Usar template personalizado</Label>
      </div>
    </div>
  );
  
  if (!isConfigured) {
    return (
      <div className="p-4 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="sql">SQL</TabsTrigger>
            <TabsTrigger value="templating">Template</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api" className="mt-4">
            {renderApiTab()}
          </TabsContent>
          
          <TabsContent value="sql" className="mt-4">
            {renderSqlTab()}
          </TabsContent>
          
          <TabsContent value="templating" className="mt-4">
            {renderTemplatingTab()}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button onClick={handleSaveConfiguration}>Salvar Configuração</Button>
        </div>
      </div>
    );
  }
  
  // Buscar status atual de operações do elemento
  const operationStatus = element.id ? getElementDatabaseStatus(element.id) : null;
  
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Database className="h-4 w-4 mr-2 text-muted-foreground" />
            Configuração de Dados
          </CardTitle>
          <CardDescription className="text-xs">
            Este elemento está conectado a <span className="font-medium">
              {availableDataSources.find(ds => ds.name.toLowerCase() === element.dataConnection?.dataSource)?.name || element.dataConnection?.dataSource || 'dados'}
            </span> e 
            usa a operação <span className="font-medium">
              {operations.find(op => op.id === element.dataConnection?.operation)?.name || element.dataConnection?.operation || 'busca'}
            </span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-0">
          {element.dataConnection?.fields && element.dataConnection.fields.length > 0 && (
            <div className="text-xs text-muted-foreground mb-2">
              <strong>Campos:</strong> {element.dataConnection.fields.join(', ')}
            </div>
          )}
          {element.dataConnection?.filters && element.dataConnection.filters.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <strong>Filtros:</strong> {element.dataConnection.filters.length} filtro(s) aplicado(s)
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2">
          <Button variant="outline" size="sm"
            onClick={() => setIsConfigured(false)}
          >
            Editar Configuração
          </Button>
        </CardFooter>
      </Card>
      
      <div className="border rounded-md">
        <div className="p-3 border-b">
          <h3 className="text-sm font-medium flex items-center">
            <Database className="h-4 w-4 mr-2 text-muted-foreground" />
            Teste de conexão
          </h3>
        </div>
        
        <div className="p-3">
          {testResult && (
            <div className={`mb-3 p-2 rounded-md ${testResult.success ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'} text-sm`}>
              <div className="flex items-center">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                )}
                {testResult.message}
              </div>
            </div>
          )}
          
          {operationStatus?.error && !testResult && (
            <div className="mb-3 p-2 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {operationStatus.error}
              </div>
            </div>
          )}
          
          <Button 
            className="w-full" 
            size="sm"
            onClick={handleTestConnection}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : 'Executar Consulta de Teste'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Função auxiliar para obter label do operador
function getOperatorLabel(operator: string): string {
  const operators: Record<string, string> = {
    'equals': 'é igual a',
    'notEquals': 'não é igual a',
    'contains': 'contém',
    'greaterThan': 'maior que',
    'lessThan': 'menor que'
  };
  
  return operators[operator] || operator;
}

export default DatabaseConnectionPanel;