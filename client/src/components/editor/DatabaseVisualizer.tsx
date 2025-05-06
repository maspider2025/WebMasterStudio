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

export function DatabaseVisualizer({ projectId = '1' }: DatabaseVisualizerProps) {
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
      const response = await apiRequest('GET', `/api/database/tables`);
      // Futuramente poderemos filtrar por projeto, mas por enquanto listaremos todas as tabelas
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
      const response = await apiRequest('GET', `/api/database/tables/${tableName}/data`);
      const data = await response.json();
      
      if (response.ok) {
        setTableData(data);
      } else {
        toast({
          title: "Erro ao carregar dados",
          description: data.message || "Não foi possível carregar os dados da tabela.",
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
    </div>
  );
}
