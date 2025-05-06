import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { getDatabaseSchemaVisualData, getTableDetails, generateERDiagram } from '@/lib/database-element-integration';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Database, Search, ArrowRight, ChevronDown, Table as TableIcon, List, Archive, BookOpen, Code, Edit, Eye, Trash, ExternalLink, ChevronRight, Code2, Layers, Filter, RefreshCw, FileText, DownloadCloud, PlusCircle, Play } from 'lucide-react';
import NewDatabaseTable from './NewDatabaseTable';

interface DatabaseVisualizerProps {
  projectId: string;
}

const DatabaseVisualizer: React.FC<DatabaseVisualizerProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState('tables');
  const [schemaData, setSchemaData] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableDetails, setTableDetails] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErDiagram, setShowErDiagram] = useState(false);
  const [erDiagram, setErDiagram] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Carregar dados do esquema
  useEffect(() => {
    try {
      const data = getDatabaseSchemaVisualData(projectId);
      setSchemaData(data);
      
      const diagram = generateERDiagram(projectId);
      setErDiagram(diagram);
      
      // Se já havia uma tabela selecionada, recarregar seus detalhes
      if (selectedTable) {
        const details = getTableDetails(projectId, selectedTable);
        setTableDetails(details);
      }
    } catch (error) {
      console.error('Erro ao carregar esquema do banco de dados:', error);
    }
  }, [projectId, refreshTrigger, selectedTable]);
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handleTableSelect = (tableSlug: string) => {
    setSelectedTable(tableSlug);
    try {
      const details = getTableDetails(projectId, tableSlug);
      setTableDetails(details);
    } catch (error) {
      console.error('Erro ao carregar detalhes da tabela:', error);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filtrar tabelas com base na busca
  const filteredTables = schemaData?.tables.filter((table: any) => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  const handleTableCreated = (tableName: string) => {
    handleRefresh();
    setSelectedTable(tableName);
  };

  const renderTablesList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar tabelas..."
            className="h-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="ml-2">
          <NewDatabaseTable onTableCreated={handleTableCreated} />
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-250px)] pr-4">
        {filteredTables.length === 0 ? (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
              <Database className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhuma tabela encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              {searchQuery 
                ? 'Tente modificar sua busca ou crie uma nova tabela.' 
                : 'Crie sua primeira tabela para começar a gerenciar seus dados.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTables.map((table: any) => (
              <Card 
                key={table.slug}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedTable === table.slug ? 'border-primary bg-muted/25' : 'border-border'}`}
                onClick={() => handleTableSelect(table.slug)}
              >
                <CardHeader className="p-3 pb-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <TableIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      {table.name}
                    </CardTitle>
                    {table.hasAPI && (
                      <Badge variant="outline" className="text-xs px-1 h-5">
                        API
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <CardDescription className="text-xs flex justify-between">
                    <span>{table.fieldCount} campos</span>
                    <span className="text-muted-foreground">{table.slug}</span>
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
  
  const renderNoTableSelected = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <Database className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Visualizador de Banco de Dados</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Selecione uma tabela à esquerda para visualizar seus detalhes ou crie um novo
        formulário no editor para gerar estruturas de banco de dados automaticamente.
      </p>
      <Button
        variant="outline"
        onClick={() => setShowErDiagram(true)}
        className="gap-2"
      >
        <Layers className="h-4 w-4" />
        Visualizar Diagrama ER
      </Button>
    </div>
  );
  
  const renderTableDetails = () => {
    if (!tableDetails) return renderNoTableSelected();
    
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-medium">{tableDetails.name}</h2>
            <p className="text-sm text-muted-foreground">{tableDetails.description || `Tabela ${tableDetails.slug}`}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowErDiagram(true)}>
              <Layers className="h-3.5 w-3.5" />
              Diagrama
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={handleRefresh}>
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizar
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="fields" className="flex-1 flex flex-col">
          <div className="border-b px-3">
            <TabsList className="h-9">
              <TabsTrigger value="fields" className="text-xs px-3">
                <List className="h-3.5 w-3.5 mr-1" />
                Campos
              </TabsTrigger>
              <TabsTrigger value="api" className="text-xs px-3">
                <Code2 className="h-3.5 w-3.5 mr-1" />
                API
              </TabsTrigger>
              <TabsTrigger value="relations" className="text-xs px-3">
                <ArrowRight className="h-3.5 w-3.5 mr-1" />
                Relações
              </TabsTrigger>
              <TabsTrigger value="indexes" className="text-xs px-3">
                <Filter className="h-3.5 w-3.5 mr-1" />
                Índices
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="fields" className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Obrigatório</TableHead>
                    <TableHead className="w-[200px]">Descrição</TableHead>
                    <TableHead>Padrão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableDetails.fields.map((field: any) => (
                    <TableRow key={field.name}>
                      <TableCell className="font-medium">{field.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {field.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {field.required ? (
                          <Badge className="bg-blue-500 hover:bg-blue-500/90 text-xs">Sim</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">Não</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{field.label || '-'}</TableCell>
                      <TableCell>
                        {field.defaultValue !== undefined ? (
                          <span className="font-mono text-xs">{JSON.stringify(field.defaultValue)}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="api" className="flex-1 p-4">
            {tableDetails.api?.enabled ? (
              <div className="space-y-4">
                <div className="bg-muted rounded-md p-3">
                  <h3 className="text-sm font-medium mb-2">Endpoints da API</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600 hover:bg-green-600/90 w-14 justify-center">GET</Badge>
                      <code className="text-sm">{tableDetails.api.basePath || `/${tableDetails.slug}`}</code>
                      <span className="text-xs text-muted-foreground">Listar todos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600 hover:bg-green-600/90 w-14 justify-center">GET</Badge>
                      <code className="text-sm">{tableDetails.api.basePath || `/${tableDetails.slug}`}/:id</code>
                      <span className="text-xs text-muted-foreground">Obter por ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 hover:bg-blue-600/90 w-14 justify-center">POST</Badge>
                      <code className="text-sm">{tableDetails.api.basePath || `/${tableDetails.slug}`}</code>
                      <span className="text-xs text-muted-foreground">Criar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-600 hover:bg-amber-600/90 w-14 justify-center">PUT</Badge>
                      <code className="text-sm">{tableDetails.api.basePath || `/${tableDetails.slug}`}/:id</code>
                      <span className="text-xs text-muted-foreground">Atualizar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-600 hover:bg-red-600/90 w-14 justify-center">DELETE</Badge>
                      <code className="text-sm">{tableDetails.api.basePath || `/${tableDetails.slug}`}/:id</code>
                      <span className="text-xs text-muted-foreground">Excluir</span>
                    </div>
                  </div>
                </div>
                
                <Collapsible className="border rounded-md">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3">
                    <div className="flex items-center">
                      <Code className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Exemplo de uso</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-t px-3 py-3">
                    <pre className="text-xs overflow-auto bg-muted p-3 rounded-md">
                      {`// Exemplo de busca de dados
const fetchData = async () => {
  const response = await fetch('/api${tableDetails.api.basePath || `/${tableDetails.slug}`}');
  const data = await response.json();
  console.log(data);
};

// Exemplo de criação
const createData = async () => {
  const response = await fetch('/api${tableDetails.api.basePath || `/${tableDetails.slug}`}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
${tableDetails.fields.map((f: any) => `      ${f.name}: ${JSON.stringify(f.defaultValue || (f.type === 'string' ? '' : f.type === 'number' ? 0 : f.type === 'boolean' ? false : null))}`).join(',\n')}
    })
  });
  const result = await response.json();
  console.log(result);
};`}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                  <Code className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">API não habilitada</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Esta tabela não possui endpoints de API configurados.
                </p>
                <Button variant="secondary">
                  Habilitar API
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="relations" className="flex-1 p-4">
            {tableDetails.relationships && tableDetails.relationships.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tabela relacionada</TableHead>
                    <TableHead>Campo local</TableHead>
                    <TableHead>Campo externo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableDetails.relationships.map((rel: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">{rel.type}</Badge>
                      </TableCell>
                      <TableCell>{rel.table}</TableCell>
                      <TableCell>{rel.localField}</TableCell>
                      <TableCell>{rel.foreignField}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Sem relacionamentos</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Esta tabela não possui relacionamentos definidos com outras tabelas.
                </p>
                <Button variant="secondary">
                  Adicionar relacionamento
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="indexes" className="flex-1 p-4">
            {tableDetails.indexes && tableDetails.indexes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Campos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableDetails.indexes.map((idx: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{idx.name || `-`}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{idx.type || 'index'}</Badge>
                      </TableCell>
                      <TableCell>{idx.fields.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                  <Filter className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Sem índices</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Esta tabela não possui índices definidos para melhorar a performance.
                </p>
                <Button variant="secondary">
                  Adicionar índice
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  const renderOverview = () => {
    if (!schemaData) return null;
    
    return (
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Banco de Dados</h2>
            <p className="text-muted-foreground text-sm max-w-md">
              Visualização completa da estrutura do banco de dados gerada a partir
              dos elementos do seu projeto.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowErDiagram(true)} className="gap-2">
              <Layers className="h-4 w-4" />
              Diagrama ER
            </Button>
            <Button variant="outline" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <TableIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                Tabelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{schemaData.tableCount}</div>
              <p className="text-xs text-muted-foreground">Estruturas de dados definidas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Code2 className="h-4 w-4 mr-2 text-muted-foreground" />
                APIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {schemaData.tables.filter((t: any) => t.hasAPI).length}
              </div>
              <p className="text-xs text-muted-foreground">Endpoints REST ativos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                Versão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{schemaData.schemaVersion}</div>
              <p className="text-xs text-muted-foreground">Versão atual do esquema</p>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Tabelas recentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemaData.tables.slice(0, 6).map((table: any) => (
              <Card 
                key={table.slug}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleTableSelect(table.slug)}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex justify-between items-center">
                    <span className="flex items-center">
                      <TableIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      {table.name}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-xs font-medium">Campos</span>
                      <div>{table.fieldCount}</div>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium">API</span>
                      <div className="text-center">
                        {table.hasAPI ? (
                          <Badge className="bg-green-600 hover:bg-green-600/90 text-white h-5 px-1.5">Ativa</Badge>
                        ) : (
                          <Badge variant="outline" className="h-5 px-1.5">Inativa</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium">Campos principais</span>
                      <div className="text-xs text-muted-foreground">
                        {table.primaryFields.join(', ') || '-'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {schemaData.tables.length > 6 && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" className="gap-2" onClick={() => setActiveTab('tables')}>
                <TableIcon className="h-4 w-4" />
                Ver todas as tabelas
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          <h2 className="font-medium">Banco de Dados</h2>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant={activeTab === 'overview' ? 'secondary' : 'ghost'} 
            size="sm"
            className="h-8"
            onClick={() => setActiveTab('overview')}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button 
            variant={activeTab === 'tables' ? 'secondary' : 'ghost'} 
            size="sm"
            className="h-8"
            onClick={() => setActiveTab('tables')}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant={activeTab === 'apis' ? 'secondary' : 'ghost'} 
            size="sm"
            className="h-8"
            onClick={() => setActiveTab('apis')}
          >
            <Code2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {activeTab === 'overview' ? (
        renderOverview()
      ) : activeTab === 'tables' ? (
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-[300px_1fr] divide-x">
          <div className="p-4 overflow-auto">
            {renderTablesList()}
          </div>
          <div className="flex-1 overflow-auto">
            {renderTableDetails()}
          </div>
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-auto">
          <h2 className="text-lg font-medium mb-4">APIs geradas</h2>
          <div className="space-y-4">
            {schemaData?.tables.filter((t: any) => t.hasAPI).map((table: any) => (
              <Card key={table.slug}>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Code2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    API para {table.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Endpoint base: <code>/api/{table.slug}</code>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="text-xs text-muted-foreground grid grid-cols-5 gap-2 mb-2">
                    <div><Badge className="bg-green-600 hover:bg-green-600/90 w-14 justify-center">GET</Badge> Lista</div>
                    <div><Badge className="bg-green-600 hover:bg-green-600/90 w-14 justify-center">GET</Badge> Detalhe</div>
                    <div><Badge className="bg-blue-600 hover:bg-blue-600/90 w-14 justify-center">POST</Badge> Criar</div>
                    <div><Badge className="bg-amber-600 hover:bg-amber-600/90 w-14 justify-center">PUT</Badge> Atualizar</div>
                    <div><Badge className="bg-red-600 hover:bg-red-600/90 w-14 justify-center">DELETE</Badge> Excluir</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Campos disponíveis: {table.primaryFields.join(', ')}{table.fieldCount > 3 ? ` e mais ${table.fieldCount - 3} campos` : ''}
                  </div>
                </CardContent>
                <CardFooter className="px-4 py-2 flex justify-end gap-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 gap-1 text-xs"
                    onClick={() => handleTableSelect(table.slug)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Detalhes
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                    <Play className="h-3.5 w-3.5" />
                    Testar
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {(!schemaData?.tables.some((t: any) => t.hasAPI)) && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center p-6 bg-muted rounded-full mb-4">
                  <Code2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhuma API encontrada</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Crie formulários ou adicione elementos com conexões de dados para
                  gerar automaticamente APIs REST para o seu projeto.
                </p>
                <Button variant="secondary" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Criar API manualmente
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Dialog open={showErDiagram} onOpenChange={setShowErDiagram}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Diagrama ER</DialogTitle>
            <DialogDescription>
              Representação visual dos relacionamentos entre as tabelas do banco de dados.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto mt-4">
            <pre className="text-xs p-4 bg-muted rounded-md overflow-auto">{erDiagram}</pre>
          </div>
          <DialogFooter className="gap-2 flex-row-reverse mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                // Criar blob e fazer download
                const blob = new Blob([erDiagram], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'database_diagram.mmd';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="gap-2"
            >
              <DownloadCloud className="h-4 w-4" />
              Baixar diagrama
            </Button>
            <Button variant="outline" onClick={() => setShowErDiagram(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabaseVisualizer;
