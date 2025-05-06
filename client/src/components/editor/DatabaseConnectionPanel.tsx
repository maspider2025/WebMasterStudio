import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Element } from '@/lib/element-types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DatabaseConnectionPanelProps {
  element: Element;
  onUpdateDatabaseConnection: (connection: any) => void;
}

const DatabaseConnectionPanel: React.FC<DatabaseConnectionPanelProps> = ({
  element,
  onUpdateDatabaseConnection
}) => {
  const [activeTab, setActiveTab] = useState<string>('api');
  const [selectedDataSource, setSelectedDataSource] = useState<string>('products');
  const [selectedOperation, setSelectedOperation] = useState<string>('get');
  const [isConfigured, setIsConfigured] = useState<boolean>(element.dataConnection?.configured || false);
  
  // Sample data source schemas
  const dataSources = [
    { id: 'products', name: 'Produtos', fields: ['id', 'name', 'description', 'price', 'salePrice', 'sku', 'status', 'inventory', 'images'] },
    { id: 'categories', name: 'Categorias', fields: ['id', 'name', 'slug', 'description'] },
    { id: 'orders', name: 'Pedidos', fields: ['id', 'customerId', 'status', 'orderDate', 'orderTotal', 'paymentStatus', 'shippingStatus'] },
    { id: 'customers', name: 'Clientes', fields: ['id', 'name', 'email', 'createdAt'] },
    { id: 'pages', name: 'Páginas', fields: ['id', 'title', 'slug', 'content', 'status'] },
  ];
  
  // Available operations for data sources
  const operations = [
    { id: 'get', name: 'Buscar dados', description: 'Obtém dados da base de dados para exibir no elemento.' },
    { id: 'create', name: 'Criar registro', description: 'Permite que o elemento crie novos registros no banco de dados.' },
    { id: 'update', name: 'Atualizar registro', description: 'Permite que o elemento atualize registros existentes.' },
    { id: 'delete', name: 'Excluir registro', description: 'Permite que o elemento exclua registros.' },
    { id: 'search', name: 'Pesquisar dados', description: 'Busca registros com base em critérios definidos.' },
  ];
  
  // Function to handle saving the configuration
  const handleSaveConfiguration = () => {
    const connection = {
      configured: true,
      dataSource: selectedDataSource,
      operation: selectedOperation,
      fields: dataSources.find(ds => ds.id === selectedDataSource)?.fields || [],
      filters: [],
      customQuery: '',
    };
    
    onUpdateDatabaseConnection(connection);
    setIsConfigured(true);
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
            {dataSources.map(source => (
              <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
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
          {dataSources.find(ds => ds.id === selectedDataSource)?.fields.map(field => (
            <div key={field} className="flex items-center space-x-2 py-1">
              <Checkbox id={`field-${field}`} defaultChecked />
              <Label htmlFor={`field-${field}`} className="text-sm font-normal">{field}</Label>
            </div>
          ))}
        </ScrollArea>
      </div>
      
      {selectedOperation === 'get' && (
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Filtros</Label>
          <div className="grid grid-cols-3 gap-2">
            <Select defaultValue="equals">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">É igual a</SelectItem>
                <SelectItem value="notEquals">Não é igual a</SelectItem>
                <SelectItem value="contains">Contém</SelectItem>
                <SelectItem value="greaterThan">Maior que</SelectItem>
                <SelectItem value="lessThan">Menor que</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Campo" className="w-full" />
            <Input placeholder="Valor" className="w-full" />
          </div>
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="outline">
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
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="use-template" />
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
  
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Configuração de Dados</CardTitle>
          <CardDescription className="text-xs">
            Este elemento está conectado a <span className="font-medium">{dataSources.find(ds => ds.id === element.dataConnection?.dataSource)?.name || 'dados'}</span> e 
            usa a operação <span className="font-medium">{operations.find(op => op.id === element.dataConnection?.operation)?.name || 'busca'}</span>.
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2">
          <Button variant="outline" size="sm"
            onClick={() => setIsConfigured(false)}
          >
            Editar Configuração
          </Button>
        </CardFooter>
      </Card>
      
      <div className="border rounded-md p-3">
        <div className="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-muted-foreground">Teste de conexão com os dados</p>
        </div>
        <Button className="w-full" size="sm">
          Executar Consulta de Teste
        </Button>
      </div>
    </div>
  );
};

export default DatabaseConnectionPanel;