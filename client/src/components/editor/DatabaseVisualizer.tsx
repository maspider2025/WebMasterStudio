import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, RefreshCw, Eye, Code, Table2, Server } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";
import { resolveProjectId } from "@/lib/project-id-helper";
import NewDatabaseTable from './NewDatabaseTable';

interface DatabaseVisualizerProps {
  projectId?: string;
}

interface DatabaseTable {
  name: string;
  rowCount: number;
  description?: string;
  hasApi?: boolean;
  createdAt?: string;
  columns?: DatabaseColumn[];
}

interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary?: boolean;
  isForeign?: boolean;
  description?: string;
}

interface TableData {
  columns: string[];
  rows: Record<string, any>[];
  totalCount: number;
}

export function DatabaseVisualizer({ projectId = 'default' }: DatabaseVisualizerProps) {
  const { toast } = useToast();
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableDataLoading, setIsTableDataLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"data" | "schema" | "api">("data");
  
  // Função chamada quando uma nova tabela for criada
  const handleTableCreated = (tableName: string) => {
    loadTables();
    toast({
      title: "Tabela criada",
      description: `A tabela ${tableName} foi criada com sucesso e está disponível para uso.`,
      variant: "default"
    });
  };
  
  // Carregar tabelas do banco de dados
  const loadTables = async () => {
    setIsLoading(true);
    try {
      // Usa o helper resolveProjectId para obter o ID do projeto de forma mais robusta
      const currentProjectId = resolveProjectId(projectId);
      
      if (!currentProjectId) {
        toast({
          title: "Projeto não identificado",
          description: "Não foi possível identificar o ID do projeto atual. Tente salvar o projeto primeiro.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const response = await apiRequest('GET', `/api/database/tables?projectId=${currentProjectId}`);
      const data = await response.json();
      
      if (response.ok) {
        setTables(data.tables || []);
      } else {
        toast({
          title: "Erro ao carregar tabelas",
          description: data.message || "Não foi possível carregar as tabelas do banco de dados.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar tabelas:", error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar tabelas ao montar o componente
  useEffect(() => {
    loadTables();
  }, [projectId]);
  
  // Função para carregar dados de uma tabela específica
  const loadTableData = async (tableName: string) => {
    setIsTableDataLoading(true);
    setSelectedTable(tableName);
    setTableData(null);
    
    try {
      // Usa o helper resolveProjectId para obter o ID do projeto de forma mais robusta
      const currentProjectId = resolveProjectId(projectId);
      
      if (!currentProjectId) {
        toast({
          title: "Projeto não identificado",
          description: "Não foi possível identificar o ID do projeto atual. Tente salvar o projeto primeiro.",
          variant: "destructive"
        });
        setIsTableDataLoading(false);
        return;
      }
      
      // Buscar schema da tabela para as informações estruturais
      const schemaResponse = await apiRequest('GET', `/api/database/tables/${tableName}/schema?projectId=${currentProjectId}`);
      const schemaData = await schemaResponse.json();
      
      // Buscar os dados da tabela
      const dataResponse = await apiRequest('GET', `/api/database/tables/${tableName}/data?projectId=${currentProjectId}`);
      const dataResult = await dataResponse.json();
      
      if (schemaResponse.ok && dataResponse.ok) {
        // Formatar os dados para o componente
        const columns = schemaData.columns.map((col: any) => col.column_name);
        
        setTableData({
          columns,
          rows: dataResult.data || [],
          totalCount: dataResult.meta?.pagination?.total || 0
        });
        
        // Atualizar o objeto selectedTableData com informações da tabela
        const tableInfo = tables.find(t => t.name === tableName);
        if (tableInfo) {
          // Se não tiver as informações de colunas do backend, criar do schema
          if (!tableInfo.columns || tableInfo.columns.length === 0) {
            tableInfo.columns = schemaData.columns.map((col: any) => ({
              name: col.column_name,
              type: col.data_type,
              nullable: col.is_nullable === 'YES',
              isPrimary: schemaData.primaryKeys?.includes(col.column_name) || false,
              description: ''
            }));
          }
        }
      } else {
        toast({
          title: "Erro ao carregar dados",
          description: dataResult.message || "Não foi possível carregar os dados da tabela.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados da tabela:", error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsTableDataLoading(false);
    }
  };
  
  // Função para abrir o modal e visualizar dados da tabela
  const handleViewTable = (tableName: string) => {
    loadTableData(tableName);
    setIsViewDialogOpen(true);
  };
  
  // Encontrar a tabela selecionada nos dados carregados
  const selectedTableData = selectedTable ? tables.find(t => t.name === selectedTable) : null;
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Visualizador de Banco de Dados</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={loadTables}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <NewDatabaseTable onTableCreated={handleTableCreated} />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tabelas do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <RefreshCw className="h-8 w-8 animate-spin mb-2" />
              <p>Carregando tabelas...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-10">
              <p className="mb-2">Nenhuma tabela disponível</p>
              <NewDatabaseTable onTableCreated={handleTableCreated} />
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {tables.map(table => (
                <Card key={table.name} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">{table.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {table.description || "Sem descrição"}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span>{table.rowCount} registros</span>
                      <span className="text-xs text-muted-foreground">
                        {table.createdAt ? new Date(table.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewTable(table.name)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      Visualizar dados
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Diálogo para visualizar dados da tabela */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedTable && (
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  <span>Tabela: {selectedTable}</span>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTableData?.description || "Visualize os dados e a estrutura da tabela."}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="data" value={activeTab} onValueChange={(value) => setActiveTab(value as "data" | "schema" | "api")}>
            <TabsList className="mb-4">
              <TabsTrigger value="data" className="flex items-center gap-1">
                <Table2 className="h-4 w-4" />
                Dados
              </TabsTrigger>
              <TabsTrigger value="schema" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                Estrutura
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-1">
                <Server className="h-4 w-4" />
                API
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-auto">
              <TabsContent value="data" className="h-full">
                {isTableDataLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin mb-4" />
                    <p>Carregando dados da tabela...</p>
                  </div>
                ) : !tableData || !tableData.columns || tableData.columns.length === 0 ? (
                  <div className="text-center py-12">
                    <p>Sem dados disponíveis ou tabela vazia.</p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {tableData.columns.map((column, index) => (
                            <TableHead key={index} className="whitespace-nowrap">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.rows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={tableData.columns.length} className="text-center h-32">
                              Nenhum registro encontrado
                            </TableCell>
                          </TableRow>
                        ) : (
                          tableData.rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {tableData.columns.map((column, colIndex) => {
                                const value = row[column];
                                let displayValue: React.ReactNode = "—";
                                
                                if (value !== null && value !== undefined) {
                                  if (typeof value === 'object') {
                                    displayValue = <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
                                  } else if (typeof value === 'boolean') {
                                    displayValue = value ? "Sim" : "Não";
                                  } else {
                                    displayValue = String(value);
                                  }
                                }
                                
                                return (
                                  <TableCell key={colIndex} className="max-w-[300px] truncate">
                                    {displayValue}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {tableData ? `${tableData.rows.length} de ${tableData.totalCount} registros` : "Sem dados"}
                </p>
              </TabsContent>
              
              <TabsContent value="schema" className="h-full">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome da coluna</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Nulo</TableHead>
                        <TableHead>Chave</TableHead>
                        <TableHead>Descrição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTableData?.columns && selectedTableData.columns.length > 0 ? (
                        selectedTableData.columns.map((column, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{column.name}</TableCell>
                            <TableCell>{column.type}</TableCell>
                            <TableCell>{column.nullable ? "Sim" : "Não"}</TableCell>
                            <TableCell>
                              {column.isPrimary ? "Primária" : (column.isForeign ? "Estrangeira" : "")}
                            </TableCell>
                            <TableCell>{column.description || "—"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-32">
                            Informações não disponíveis
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="api" className="h-full">
                {selectedTableData?.hasApi ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Endpoints disponíveis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium">GET - Obter todos</Label>
                          <div className="bg-muted p-2 rounded-md mt-1 text-sm font-mono">
                            /api/{selectedTable}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium">GET - Obter por ID</Label>
                          <div className="bg-muted p-2 rounded-md mt-1 text-sm font-mono">
                            /api/{selectedTable}/:id
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium">POST - Criar novo</Label>
                          <div className="bg-muted p-2 rounded-md mt-1 text-sm font-mono">
                            /api/{selectedTable}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium">PUT - Atualizar</Label>
                          <div className="bg-muted p-2 rounded-md mt-1 text-sm font-mono">
                            /api/{selectedTable}/:id
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium">DELETE - Remover</Label>
                          <div className="bg-muted p-2 rounded-md mt-1 text-sm font-mono">
                            /api/{selectedTable}/:id
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Server className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="mb-2">Essa tabela não possui API gerada.</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Para ter endpoints de API automaticamente gerados, crie a tabela através do assistente
                      ou adicione manualmente as rotas no servidor.
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
