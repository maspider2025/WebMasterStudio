import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, PlusCircle, Code, Database, Copy, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ApiViewerProps {
  projectId: number;
}

interface ProjectApi {
  id: number;
  projectId: number;
  path: string;
  method: string;
  description: string;
  tableName?: string;
  displayName?: string;
  isActive: boolean;
  isCustom: boolean;
  createdAt: string;
}

const methodColors = {
  GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PATCH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function ApiViewer({ projectId }: ApiViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('todos');

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/project-apis?projectId=${projectId}`],
    enabled: !!projectId,
  });

  const apis: ProjectApi[] = data?.apis || [];

  const copyToClipboard = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const filteredApis = apis.filter(api => {
    if (searchTerm === '') return true;
    return (
      api.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (api.tableName && api.tableName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  const filteredByTab = filteredApis.filter(api => {
    if (activeTab === 'todos') return true;
    if (activeTab === 'custom') return api.isCustom;
    if (activeTab === 'tabelas') return !api.isCustom;
    return true;
  });

  // Agrupar APIs por tabela para melhor visualização
  const apisByTable: Record<string, ProjectApi[]> = {};
  filteredByTab.forEach(api => {
    const table = api.tableName || 'Sem tabela';
    if (!apisByTable[table]) {
      apisByTable[table] = [];
    }
    apisByTable[table].push(api);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Carregando APIs do projeto...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-100">
        <p>Erro ao carregar APIs do projeto.</p>
        <p className="text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Code className="w-5 h-5" />
          APIs Disponíveis
        </CardTitle>
        <CardDescription>
          Lista de endpoints de API disponíveis para este projeto. 
          As APIs são geradas automaticamente para tabelas no banco de dados.
        </CardDescription>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar APIs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs 
            defaultValue="todos" 
            className="w-full sm:w-auto"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="tabelas">Tabelas</TabsTrigger>
              <TabsTrigger value="custom">Personalizados</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredByTab.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma API encontrada{searchTerm ? ` para "${searchTerm}"` : ''}.</p>
            <p className="text-sm mt-2">Crie algum elemento de formulário ou tabela para gerar APIs automaticamente.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(apisByTable).map(tableName => {
              const tableApis = apisByTable[tableName];
              const displayName = tableApis[0]?.displayName || tableName;
              return (
                <div key={tableName} className="border rounded-md overflow-hidden">
                  <div className="bg-muted p-2 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <h3 className="font-medium">{displayName}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {tableApis.length} endpoint{tableApis.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">Método</TableHead>
                          <TableHead className="min-w-[200px]">Caminho</TableHead>
                          <TableHead className="hidden md:table-cell">Descrição</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableApis.map(api => (
                          <TableRow key={api.id}>
                            <TableCell>
                              <Badge className={methodColors[api.method as keyof typeof methodColors] || 'bg-gray-100'}>
                                {api.method}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {api.path}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {api.description}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(api.path)}
                                className="flex items-center gap-1"
                              >
                                {copiedPath === api.path ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="sr-only">Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4" />
                                    <span className="sr-only">Copiar</span>
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          {filteredByTab.length} endpoint{filteredByTab.length !== 1 ? 's' : ''} disponíve{filteredByTab.length !== 1 ? 'is' : 'l'}
        </div>
        <Button className="gap-1" variant="outline" disabled>
          <PlusCircle className="h-4 w-4" />
          Adicionar API personalizada
        </Button>
      </CardFooter>
    </Card>
  );
}
