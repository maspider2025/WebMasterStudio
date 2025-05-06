import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Database, Table, Search, Code, SquareCode, RefreshCw, FileCode, Eye } from 'lucide-react';
import { getDatabaseSchemaVisualData, generateERDiagram } from '@/lib/database-element-integration';
import NewDatabaseTable from './NewDatabaseTable';

interface DatabaseVisualizerProps {
  projectId?: string;
}

const DatabaseVisualizer: React.FC<DatabaseVisualizerProps> = ({ projectId = '1' }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tables');
  const [schemaData, setSchemaData] = useState<any>(null);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [erDiagram, setErDiagram] = useState<string>('');
  
  useEffect(() => {
    loadSchemaData();
  }, [projectId]);
  
  const loadSchemaData = async () => {
    setLoadingSchema(true);
    try {
      // Buscar dados do schema
      const data = getDatabaseSchemaVisualData(projectId);
      setSchemaData(data);
      
      // Gerar ER Diagram
      const diagram = generateERDiagram(projectId);
      setErDiagram(diagram);
    } catch (error) {
      console.error('Erro ao carregar dados do schema:', error);
      toast({
        title: "Erro ao carregar schema",
        description: "Não foi possível carregar os dados do banco de dados.",
        variant: "destructive"
      });
    } finally {
      setLoadingSchema(false);
    }
  };
  
  const handleTableCreated = (tableName: string) => {
    // Recarregar dados do schema após criação de tabela
    loadSchemaData();
    
    // Exibir mensagem de sucesso
    toast({
      title: "Tabela criada",
      description: `A tabela ${tableName} foi criada com sucesso.`,
      variant: "default"
    });
  };
  
  const renderTablesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tabelas do Banco de Dados</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={loadSchemaData}>
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar
          </Button>
          <NewDatabaseTable onTableCreated={handleTableCreated} />
        </div>
      </div>
      
      {loadingSchema ? (
        <div className="p-12 flex justify-center items-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        schemaData?.tables?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemaData.tables.map((table: any, index: number) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-1">
                        <Table className="h-4 w-4 text-primary" />
                        {table.name}
                      </CardTitle>
                      <CardDescription className="text-xs truncate">
                        {table.slug}
                      </CardDescription>
                    </div>
                    <Badge variant={table.hasAPI ? "default" : "outline"} className="text-xs">
                      {table.hasAPI ? "API" : "Apenas DB"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{table.fieldCount} {table.fieldCount === 1 ? 'campo' : 'campos'}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <FileCode className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma tabela encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Seu banco de dados não possui tabelas. Clique no botão abaixo para criar sua primeira tabela.
              </p>
              <NewDatabaseTable onTableCreated={handleTableCreated} />
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
  
  const renderERDiagramTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Diagrama ER</h3>
        <Button variant="outline" size="sm" className="h-8 gap-1" onClick={loadSchemaData}>
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </Button>
      </div>
      
      {loadingSchema ? (
        <div className="p-12 flex justify-center items-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : erDiagram ? (
        <Card>
          <CardContent className="p-4">
            <pre className="text-xs overflow-auto max-h-[500px] p-4 bg-muted rounded-md">
              {erDiagram}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <SquareCode className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum diagrama disponível</h3>
            <p className="text-sm text-muted-foreground">
              O diagrama ER será gerado automaticamente quando houver tabelas no banco de dados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">Visualizador de Banco de Dados</h2>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="tables" className="flex-1">
            <Table className="h-4 w-4 mr-2" />
            Tabelas
          </TabsTrigger>
          <TabsTrigger value="er-diagram" className="flex-1">
            <Code className="h-4 w-4 mr-2" />
            Diagrama ER
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tables" className="mt-4">
          {renderTablesTab()}
        </TabsContent>
        
        <TabsContent value="er-diagram" className="mt-4">
          {renderERDiagramTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseVisualizer;