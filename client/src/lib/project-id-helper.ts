/**
 * Utilitário auxiliar para obter o ID do projeto a partir de várias fontes na aplicação
 */

/**
 * Extrai o ID do projeto a partir da URL atual em vários formatos possíveis
 */
export function getProjectIdFromUrl(): string | null {
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
  
  return null;
}

/**
 * Resolução robusta de projectId recebido como parâmetro
 * Se for 'default', tenta obter da URL
 */
export function resolveProjectId(projectId: string): string | null {
  if (projectId !== 'default') {
    return projectId;
  }
  
  return getProjectIdFromUrl();
}