/**
 * Utilitário auxiliar para obter o ID do projeto a partir de várias fontes na aplicação
 * Criado para resolver problemas de identificação do ID do projeto em diferentes formatos de URL
 */

import { apiRequest } from "@/lib/queryClient";

// Cache para armazenar os IDs de projeto por nome (para evitar requisições repetidas)
let projectNameToIdCache: Record<string, string> = {};

/**
 * Extrai o ID do projeto a partir da URL atual em vários formatos possíveis
 */
export async function getProjectIdFromUrl(): Promise<string | null> {
  try {
    // Primeiro tenta extrair da querystring ?id=X
    const urlParams = new URLSearchParams(window.location.search);
    let projectId = urlParams.get('id');
    
    if (projectId) return projectId;
    
    // Se não encontrou, tenta extrair da URL completa no formato /editor/new-true&name=NOME&id=X
    const pathMatch = window.location.pathname.match(/\/editor\/([^\/]+)/);
    if (pathMatch && pathMatch[1]) {
      // Extrair apenas o ID de dentro da string do path
      const idMatch = pathMatch[1].match(/id=(\d+)/);
      if (idMatch && idMatch[1]) {
        return idMatch[1];
      }
    }
    
    // Se ainda não encontrou, tenta extrair da URL completa no formato URL/editor?new=true&name=NOME&id=X
    const fullUrlMatch = window.location.href.match(/id=(\d+)/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }
    
    // Nova abordagem: se tem o parâmetro 'name' na URL (como no formato /editor?new=true&name=ulala)
    // Vamos buscar o projeto por nome na API
    const projectName = urlParams.get('name');
    if (projectName) {
      // Verificar primeiro no cache
      if (projectNameToIdCache[projectName]) {
        return projectNameToIdCache[projectName];
      }
      
      // Buscar projetos do usuário logado
      try {
        const response = await apiRequest('GET', '/api/projects');
        if (response.ok) {
          const projects = await response.json();
          // Procurar pelo projeto com o mesmo nome
          const project = projects.find((p: any) => p.name === projectName);
          if (project && project.id) {
            // Guardar no cache para futuras consultas
            projectNameToIdCache[projectName] = String(project.id);
            return String(project.id);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar projetos por nome:", error);
      }
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao extrair ID do projeto da URL:", error);
    return null;
  }
}

/**
 * Busca sincronizada do ID do projeto - versão síncrona que usa o cache
 * quando possível, para casos onde não é possível usar async/await
 */
export function getProjectIdFromUrlSync(): string | null {
  // Primeiro tenta extrair da querystring ?id=X
  const urlParams = new URLSearchParams(window.location.search);
  let projectId = urlParams.get('id');
  
  if (projectId) return projectId;
  
  // Tenta extrair do path
  const pathMatch = window.location.pathname.match(/\/editor\/([^\/]+)/);
  if (pathMatch && pathMatch[1]) {
    const idMatch = pathMatch[1].match(/id=(\d+)/);
    if (idMatch && idMatch[1]) {
      return idMatch[1];
    }
  }
  
  // Tenta extrair da URL completa
  const fullUrlMatch = window.location.href.match(/id=(\d+)/);
  if (fullUrlMatch && fullUrlMatch[1]) {
    return fullUrlMatch[1];
  }
  
  // Usar cache para projetos buscados por nome
  const projectName = urlParams.get('name');
  if (projectName && projectNameToIdCache[projectName]) {
    return projectNameToIdCache[projectName];
  }
  
  return null;
}

/**
 * Resolução robusta de projectId recebido como parâmetro
 * Se for 'default', tenta obter da URL
 */
export async function resolveProjectId(projectId: string): Promise<string | null> {
  if (projectId !== 'default') {
    return projectId;
  }
  
  // Primeira tentativa: busca síncrona (rápida, usando cache quando possível)
  const syncId = getProjectIdFromUrlSync();
  if (syncId) return syncId;
  
  // Se não encontrou, tenta a busca assíncrona (que pode consultar a API)
  return await getProjectIdFromUrl();
}

/**
 * Versão síncrona da resolução do ID - para casos onde não é possível usar async/await
 */
export function resolveProjectIdSync(projectId: string): string | null {
  if (projectId !== 'default') {
    return projectId;
  }
  
  return getProjectIdFromUrlSync();
}