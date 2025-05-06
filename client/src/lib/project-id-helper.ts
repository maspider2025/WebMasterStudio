/**
 * Project ID Helper
 * 
 * Este módulo fornece utilitários para resolver IDs de projetos de forma consistente.
 * Resolver um ID de projeto pode ser mais complexo do que parece, pois o ID pode vir de várias fontes:
 * - Parâmetros de URL
 * - Estado global
 * - LocalStorage
 * - Router
 * 
 * Este módulo centraliza a lógica para evitar duplicação de código e inconsistências.
 */

import { apiRequest } from "./queryClient";

// Cache de nomes de projeto para IDs de projeto
const projectNameCache = new Map<string, string>();

/**
 * Resolve um ID de projeto a partir de várias fontes possíveis.
 * Está função busca o ID nos seguintes locais, em ordem:
 * 1. O próprio valor, se for um ID válido
 * 2. Cache local, se for um nome de projeto conhecido
 * 3. API, se for um nome de projeto não cacheado
 * 4. LocalStorage, para o projeto atual
 * 5. Estado global do editor, se disponível
 * 
 * @param projectIdOrName Um possível ID de projeto ou nome de projeto
 * @returns O ID do projeto resolvido, ou null se não for possível resolver
 */
export async function resolveProjectId(projectIdOrName: string | number | null | undefined): Promise<string | null> {
  if (!projectIdOrName) {
    // Tenta buscar do localStorage
    const currentProjectId = localStorage.getItem('currentProjectId');
    return currentProjectId;
  }
  
  // Se for um número ou uma string que parece um número, assume que é um ID
  if (typeof projectIdOrName === 'number' || !isNaN(Number(projectIdOrName))) {
    return String(projectIdOrName);
  }
  
  // Se for uma string, pode ser um nome de projeto
  if (typeof projectIdOrName === 'string') {
    // Verifica no cache primeiro
    if (projectNameCache.has(projectIdOrName)) {
      return projectNameCache.get(projectIdOrName) || null;
    }
    
    // Se não estiver no cache, tenta buscar da API
    try {
      const response = await apiRequest('GET', `/api/projects/by-name/${encodeURIComponent(projectIdOrName)}`);
      
      if (response.ok) {
        const data = await response.json();
        const id = String(data.id);
        
        // Adiciona ao cache
        projectNameCache.set(projectIdOrName, id);
        
        return id;
      }
    } catch (error) {
      console.error('Erro ao resolver ID do projeto por nome:', error);
    }
  }
  
  // Se chegou até aqui, não foi possível resolver o ID
  return null;
}

/**
 * Limpa o cache de nomes de projeto para IDs de projeto.
 * Útil após renomear um projeto, por exemplo.
 */
export function clearProjectIdCache(): void {
  projectNameCache.clear();
}

/**
 * Invalida um item específico do cache.
 * Útil quando um projeto é renomeado ou excluído.
 */
export function invalidateProjectIdCache(projectName: string): void {
  projectNameCache.delete(projectName);
}

/**
 * Adiciona ou atualiza um item no cache.
 * Útil quando um projeto é criado ou renomeado.
 */
export function updateProjectIdCache(projectName: string, projectId: string): void {
  projectNameCache.set(projectName, projectId);
}

/**
 * Resolve um ID de projeto usando a URL atual.
 * Útil em componentes que precisam do ID do projeto, mas não o recebem como prop.
 */
export function resolveProjectIdFromUrl(): string | null {
  // Verifica se estamos em uma página de projeto (URL contendo /projects/:id)
  const projectRegex = /\/projects\/(\d+)/;
  const match = window.location.pathname.match(projectRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // Verifica se estamos em uma página de editor (URL contendo /editor/:projectId)
  const editorRegex = /\/editor\/(\d+)/;
  const editorMatch = window.location.pathname.match(editorRegex);
  
  if (editorMatch && editorMatch[1]) {
    return editorMatch[1];
  }
  
  return null;
}

/**
 * Tenta obter o ID do projeto atual a partir de várias fontes.
 * Esta é uma função sinônima que tenta obter o ID do projeto atual
 * a partir da URL, localStorage, ou outro lugar. Diferente da função
 * principal, esta não consulta a API e é síncrona.
 */
export function getCurrentProjectId(): string | null {
  // Primeiro tenta da URL
  const urlProjectId = resolveProjectIdFromUrl();
  if (urlProjectId) {
    return urlProjectId;
  }
  
  // Depois tenta do localStorage
  const storedProjectId = localStorage.getItem('currentProjectId');
  if (storedProjectId) {
    return storedProjectId;
  }
  
  // Por último, pode tentar outras fontes se necessário...
  
  return null;
}

/**
 * Define o projeto atual no localStorage.
 * Útil quando o usuário seleciona um projeto para trabalhar.
 */
export function setCurrentProjectId(projectId: string | number): void {
  localStorage.setItem('currentProjectId', String(projectId));
}
