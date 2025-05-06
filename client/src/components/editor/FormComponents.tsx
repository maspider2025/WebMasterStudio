import React from 'react';
import { ElementTypes } from '@/lib/element-types';
import { useEditorStore } from '@/lib/editor-store';
import { Element } from '@/lib/element-types';

/**
 * FormComponents.tsx
 * 
 * Este arquivo contém os componentes específicos de formulário para o editor visual.
 * Cada componente de formulário (input, checkbox, select, etc.) é 100% editável
 * e integrado automaticamente com o banco de dados.
 * 
 * Características principais:
 * - Geração automática de IDs baseados no nome do campo
 * - Integração inteligente com banco de dados (tipo de dados inferido)
 * - Preview funcional no editor
 * - Suporte para validação e estilos personalizados
 */

interface FormFieldProps {
  element: Element;
  isEditMode: boolean;
  onChange?: (changes: Partial<Element>) => void;
}

// ----------------------------------------------------------------------
// Componentes de Campo de Formulário Individuais
// ----------------------------------------------------------------------

/**
 * Campo de texto com detecção inteligente de tipo
 */
export const FormTextField = ({ element, isEditMode, onChange }: FormFieldProps) => {
  // Obter atributos atuais do elemento ou definir padrões
  const fieldType = element.htmlAttributes?.type || 'text';
  const fieldName = element.htmlAttributes?.name || '';
  const fieldLabel = element.htmlAttributes?.label || element.name || 'Campo de texto';
  const fieldPlaceholder = element.htmlAttributes?.placeholder || '';
  const fieldRequired = element.htmlAttributes?.required === 'true';
  const fieldHelperText = element.htmlAttributes?.helperText || '';
  
  // Determinar o tipo de dados para o banco baseado no nome e tipo do campo
  const inferDatabaseType = () => {
    const nameLC = fieldName.toLowerCase();
    
    // Verificação baseada no tipo de input HTML
    if (['number', 'range'].includes(fieldType)) return 'number';
    if (['date', 'datetime-local', 'month', 'time', 'week'].includes(fieldType)) return 'date';
    if (['email'].includes(fieldType)) return 'string';
    if (['tel'].includes(fieldType)) return 'string';
    if (['url'].includes(fieldType)) return 'string';
    if (['color'].includes(fieldType)) return 'string';
    
    // Verificação baseada no nome do campo
    if (['id', 'codigo', 'code'].some(prefix => nameLC === prefix || nameLC.startsWith(prefix + '_'))) return 'integer';
    if (['idade', 'age', 'quantidade', 'quantity', 'qtd', 'valor', 'preco', 'price'].some(term => nameLC.includes(term))) return 'number';
    if (['data', 'date', 'dt', 'nascimento', 'birth'].some(term => nameLC.includes(term))) return 'date';
    if (['email', 'e-mail', 'mail'].some(term => nameLC.includes(term))) return 'string';
    if (['telefone', 'fone', 'phone', 'celular', 'mobile'].some(term => nameLC.includes(term))) return 'string';
    if (['cpf', 'cnpj', 'rg', 'documento', 'document'].some(term => nameLC.includes(term))) return 'string';
    if (['endereco', 'address', 'logradouro', 'street'].some(term => nameLC.includes(term))) return 'string';
    if (['cep', 'postal', 'zip'].some(term => nameLC.includes(term))) return 'string';
    
    // Padrão para tipos não identificados
    return 'string';
  };
  
  // Atualizar o atributo 'data-db-type' para integração com banco de dados
  React.useEffect(() => {
    if (isEditMode && onChange && (!element.htmlAttributes?.['data-db-type'])) {
      onChange({
        htmlAttributes: {
          ...element.htmlAttributes,
          'data-db-type': inferDatabaseType()
        }
      });
    }
  }, [element.htmlAttributes, isEditMode, onChange]);
  
  // No modo de edição, mostramos o componente com elementos de edição inline
  if (isEditMode) {
    return (
      <div className="form-field-editor">
        <div className="field-header">
          <div className="field-label-editor">
            <span>{fieldLabel}</span>
            {fieldRequired && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className="field-type-badge" title={`Tipo de Dados: ${element.htmlAttributes?.['data-db-type'] || inferDatabaseType()}`}>
            {element.htmlAttributes?.['data-db-type'] || inferDatabaseType()}
          </div>
        </div>
        <input
          type={fieldType}
          name={fieldName}
          placeholder={fieldPlaceholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled
        />
        {fieldHelperText && <p className="text-sm text-gray-500 mt-1">{fieldHelperText}</p>}
      </div>
    );
  }
  
  // No modo visualização/preview, mostramos o campo real funcionando
  return (
    <div className="form-field">
      <label className="block text-sm font-medium mb-1">
        {fieldLabel}
        {fieldRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={fieldType}
        name={fieldName}
        placeholder={fieldPlaceholder}
        required={fieldRequired}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {fieldHelperText && <p className="text-sm text-gray-500 mt-1">{fieldHelperText}</p>}
    </div>
  );
};

/**
 * Campo de seleção (dropdown) com opções editáveis
 */
export const FormSelectField = ({ element, isEditMode, onChange }: FormFieldProps) => {
  const fieldName = element.htmlAttributes?.name || '';
  const fieldLabel = element.htmlAttributes?.label || element.name || 'Seleção';
  const fieldRequired = element.htmlAttributes?.required === 'true';
  const fieldHelperText = element.htmlAttributes?.helperText || '';
  
  // Obter opções do elemento
  const getOptions = () => {
    try {
      if (element.htmlAttributes?.options) {
        return JSON.parse(element.htmlAttributes.options);
      }
    } catch (e) {}
    
    // Opções padrão
    return [
      { value: '', label: 'Selecione uma opção' },
      { value: 'opcao1', label: 'Opção 1' },
      { value: 'opcao2', label: 'Opção 2' },
      { value: 'opcao3', label: 'Opção 3' },
    ];
  };
  
  const options = getOptions();
  
  // Atualizar o atributo 'data-db-type' para integração com banco de dados
  React.useEffect(() => {
    if (isEditMode && onChange && (!element.htmlAttributes?.['data-db-type'])) {
      onChange({
        htmlAttributes: {
          ...element.htmlAttributes,
          'data-db-type': 'string' // Selects são normalmente strings no DB
        }
      });
    }
  }, [element.htmlAttributes, isEditMode, onChange]);
  
  if (isEditMode) {
    return (
      <div className="form-field-editor">
        <div className="field-header">
          <div className="field-label-editor">
            <span>{fieldLabel}</span>
            {fieldRequired && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className="field-type-badge" title="Tipo de Dados: string">
            string
          </div>
        </div>
        <select
          name={fieldName}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>{option.label}</option>
          ))}
        </select>
        {fieldHelperText && <p className="text-sm text-gray-500 mt-1">{fieldHelperText}</p>}
      </div>
    );
  }
  
  return (
    <div className="form-field">
      <label className="block text-sm font-medium mb-1">
        {fieldLabel}
        {fieldRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        name={fieldName}
        required={fieldRequired}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>{option.label}</option>
        ))}
      </select>
      {fieldHelperText && <p className="text-sm text-gray-500 mt-1">{fieldHelperText}</p>}
    </div>
  );
};

/**
 * Campo de checkbox com suporte para múltiplas opções
 */
export const FormCheckboxField = ({ element, isEditMode, onChange }: FormFieldProps) => {
  const fieldName = element.htmlAttributes?.name || '';
  const fieldLabel = element.htmlAttributes?.label || element.name || 'Opção';
  const fieldRequired = element.htmlAttributes?.required === 'true';
  const fieldHelperText = element.htmlAttributes?.helperText || '';
  
  // Atualizar o atributo 'data-db-type' para integração com banco de dados
  React.useEffect(() => {
    if (isEditMode && onChange && (!element.htmlAttributes?.['data-db-type'])) {
      onChange({
        htmlAttributes: {
          ...element.htmlAttributes,
          'data-db-type': 'boolean' // Checkboxes são normalmente booleans no DB
        }
      });
    }
  }, [element.htmlAttributes, isEditMode, onChange]);
  
  if (isEditMode) {
    return (
      <div className="form-field-editor">
        <div className="flex items-center">
          <input
            type="checkbox"
            disabled
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <div className="ml-2 flex items-center">
            <span className="text-sm font-medium">{fieldLabel}</span>
            {fieldRequired && <span className="text-red-500 ml-1">*</span>}
            <div className="field-type-badge ml-2" title="Tipo de Dados: boolean">
              boolean
            </div>
          </div>
        </div>
        {fieldHelperText && <p className="text-sm text-gray-500 mt-1 ml-6">{fieldHelperText}</p>}
      </div>
    );
  }
  
  return (
    <div className="form-field">
      <div className="flex items-center">
        <input
          type="checkbox"
          name={fieldName}
          required={fieldRequired}
          id={`checkbox-${element.id}`}
          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor={`checkbox-${element.id}`} className="ml-2 block text-sm">
          {fieldLabel}
          {fieldRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {fieldHelperText && <p className="text-sm text-gray-500 mt-1 ml-6">{fieldHelperText}</p>}
    </div>
  );
};

/**
 * Campo de área de texto para entradas mais longas
 */
export const FormTextareaField = ({ element, isEditMode, onChange }: FormFieldProps) => {
  const fieldName = element.htmlAttributes?.name || '';
  const fieldLabel = element.htmlAttributes?.label || element.name || 'Área de texto';
  const fieldPlaceholder = element.htmlAttributes?.placeholder || '';
  const fieldRequired = element.htmlAttributes?.required === 'true';
  const fieldHelperText = element.htmlAttributes?.helperText || '';
  const fieldRows = element.htmlAttributes?.rows || '4';
  
  // Atualizar o atributo 'data-db-type' para integração com banco de dados
  React.useEffect(() => {
    if (isEditMode && onChange && (!element.htmlAttributes?.['data-db-type'])) {
      onChange({
        htmlAttributes: {
          ...element.htmlAttributes,
          'data-db-type': 'text' // Textareas são normalmente campos de texto no DB
        }
      });
    }
  }, [element.htmlAttributes, isEditMode, onChange]);
  
  if (isEditMode) {
    return (
      <div className="form-field-editor">
        <div className="field-header">
          <div className="field-label-editor">
            <span>{fieldLabel}</span>
            {fieldRequired && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className="field-type-badge" title="Tipo de Dados: text">
            text
          </div>
        </div>
        <textarea
          name={fieldName}
          placeholder={fieldPlaceholder}
          rows={Number(fieldRows)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled
        />
        {fieldHelperText && <p className="text-sm text-gray-500 mt-1">{fieldHelperText}</p>}
      </div>
    );
  }
  
  return (
    <div className="form-field">
      <label className="block text-sm font-medium mb-1">
        {fieldLabel}
        {fieldRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        name={fieldName}
        placeholder={fieldPlaceholder}
        required={fieldRequired}
        rows={Number(fieldRows)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {fieldHelperText && <p className="text-sm text-gray-500 mt-1">{fieldHelperText}</p>}
    </div>
  );
};

/**
 * Botão de envio de formulário
 */
export const FormSubmitButton = ({ element, isEditMode }: FormFieldProps) => {
  const buttonText = element.content || element.htmlAttributes?.label || 'Enviar';
  const buttonType = element.htmlAttributes?.type || 'submit';
  
  const buttonStyle = {
    backgroundColor: element.styles?.backgroundColor || '#3b82f6',
    color: element.styles?.color || 'white',
    borderRadius: element.styles?.borderRadius || '0.375rem',
    padding: element.styles?.padding || '0.5rem 1rem',
    fontSize: element.styles?.fontSize || '0.875rem',
    fontWeight: element.styles?.fontWeight || '500',
    border: element.styles?.border || 'none',
    cursor: isEditMode ? 'default' : 'pointer',
  };
  
  return (
    <button
      type={buttonType as 'submit' | 'button' | 'reset'}
      style={buttonStyle}
      disabled={isEditMode}
      className="transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {buttonText}
    </button>
  );
};

/**
 * Componente de formulário completo que contém campos e gerencia submissão
 * Este componente serve como um container para os campos de formulário,
 * permitindo total customização de cada elemento interno.
 */
export const FormComponent = ({ element, isEditMode, onChange }: FormFieldProps) => {
  const { elements, addElement, updateElement } = useEditorStore();
  
  // Encontra todos os elementos filhos do formulário
  const getChildElements = () => {
    if (!element.children) return [];
    return element.children
      .map(childId => elements.find(el => el.id === childId))
      .filter(Boolean) as Element[];
  };
  
  const childElements = getChildElements();
  
  // Processa o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    if (isEditMode) {
      e.preventDefault();
      return;
    }
    
    // Obtém todos os dados do formulário para envio
    const formData = new FormData(e.target as HTMLFormElement);
    const formValues: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      formValues[key] = value.toString();
    });
    
    console.log('Dados do formulário a serem enviados:', formValues);
    
    // TODO: Implementar integração com o banco de dados
    // Usaremos a tabela com o mesmo nome do formulário (ou slug do mesmo)
    const formName = element.name || 'formulario';
    const tableName = generateFieldId(formName);
    
    // Aqui faríamos o envio dos dados para a API
    /*
    fetch(`/api/${tableName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Sucesso:', data);
      // Exibir mensagem de sucesso ou redirecionar
    })
    .catch(error => {
      console.error('Erro:', error);
      // Exibir mensagem de erro
    });
    */
  };
  
  // Função para adicionar um novo campo ao formulário (usado no modo de edição)
  const addFieldToForm = (fieldType: ElementTypes) => {
    if (!isEditMode) return;
    
    // Determinar o tipo de campo a ser adicionado
    let newField: Partial<Element> = {
      type: fieldType,
      parent: element.id, // Conecta o novo campo ao formulário pai
      x: 0, // Posições relativas dentro do formulário
      y: 0,
      width: 300,
      height: 40,
    };
    
    // Configurações específicas para cada tipo de campo
    switch(fieldType) {
      case ElementTypes.input:
        newField = {
          ...newField,
          name: 'Campo de Texto',
          htmlAttributes: {
            name: `campo_${Date.now()}`, // ID único baseado no timestamp
            label: 'Novo Campo',
            placeholder: 'Digite aqui...',
            'data-db-type': 'string'
          }
        };
        break;
      case ElementTypes.textarea:
        newField = {
          ...newField,
          name: 'Área de Texto',
          htmlAttributes: {
            name: `area_${Date.now()}`,
            label: 'Nova Área de Texto',
            placeholder: 'Digite um texto mais longo aqui...',
            rows: '4',
            'data-db-type': 'text'
          },
          height: 120
        };
        break;
      case ElementTypes.select:
        newField = {
          ...newField,
          name: 'Campo de Seleção',
          htmlAttributes: {
            name: `selecao_${Date.now()}`,
            label: 'Nova Seleção',
            options: JSON.stringify([
              { value: '', label: 'Selecione uma opção' },
              { value: 'opcao1', label: 'Opção 1' },
              { value: 'opcao2', label: 'Opção 2' }
            ]),
            'data-db-type': 'string'
          }
        };
        break;
      case ElementTypes.checkbox:
        newField = {
          ...newField,
          name: 'Campo de Checkbox',
          htmlAttributes: {
            name: `checkbox_${Date.now()}`,
            label: 'Novo Checkbox',
            'data-db-type': 'boolean'
          },
          height: 24,
          width: 24
        };
        break;
      case ElementTypes.button:
        newField = {
          ...newField,
          name: 'Botão de Envio',
          content: 'Enviar',
          htmlAttributes: {
            type: 'submit'
          },
          width: 120,
          height: 40,
          styles: {
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: '500',
            cursor: 'pointer'
          }
        };
        break;
    }
    
    // Adiciona o campo ao editor
    const newFieldId = addElement(newField as Element);
    
    // Adiciona o campo como filho do formulário
    if (element.children) {
      updateElement(element.id, {
        children: [...element.children, newFieldId]
      });
    } else {
      updateElement(element.id, {
        children: [newFieldId]
      });
    }
  };
  
  const formStyle = isEditMode ? {
    border: '1px dashed #3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    minHeight: '200px'
  } : {};
  
  return (
    <div className="w-full h-full overflow-auto">
      {isEditMode && (
        <div className="bg-background border border-border rounded-t-md p-2 mb-2">
          <div className="text-sm font-medium mb-2">Formulário: {element.name || 'Sem Nome'}</div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => addFieldToForm(ElementTypes.input)}
              className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
            >
              + Campo de Texto
            </button>
            <button 
              onClick={() => addFieldToForm(ElementTypes.textarea)}
              className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
            >
              + Área de Texto
            </button>
            <button 
              onClick={() => addFieldToForm(ElementTypes.select)}
              className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
            >
              + Campo de Seleção
            </button>
            <button 
              onClick={() => addFieldToForm(ElementTypes.checkbox)}
              className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
            >
              + Checkbox
            </button>
            <button 
              onClick={() => addFieldToForm(ElementTypes.button)}
              className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
            >
              + Botão
            </button>
          </div>
        </div>
      )}
      
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4 w-full p-4"
        style={formStyle}
      >
        {childElements.length > 0 ? (
          <>
            {childElements.map((childElement) => renderFormElement(childElement, isEditMode))}
            
            {isEditMode && childElements.length > 0 && !childElements.some(el => el.type === ElementTypes.button) && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => addFieldToForm(ElementTypes.button)}
                  className="px-2 py-1 border border-primary text-primary text-xs rounded hover:bg-primary/10"
                  type="button"
                >
                  + Adicionar Botão de Envio
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {isEditMode ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p className="mb-4">Clique nos botões acima para adicionar campos ao formulário</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      // Adiciona campos básicos de exemplo
                      addFieldToForm(ElementTypes.input);
                      setTimeout(() => addFieldToForm(ElementTypes.input), 100);
                      setTimeout(() => addFieldToForm(ElementTypes.select), 200);
                      setTimeout(() => addFieldToForm(ElementTypes.button), 300);
                    }}
                    className="px-3 py-2 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90"
                    type="button"
                  >
                    Adicionar Campos de Exemplo
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Formulário exemplo para quando não há campos configurados e não está em modo de edição */}
                <FormTextField
                  element={{
                    ...element,
                    id: `${element.id}_nome`,
                    htmlAttributes: {
                      name: 'nome',
                      label: 'Nome',
                      placeholder: 'Seu nome',
                      required: 'true',
                      'data-db-type': 'string'
                    }
                  }}
                  isEditMode={false}
                />
                <FormTextField
                  element={{
                    ...element,
                    id: `${element.id}_email`,
                    htmlAttributes: {
                      name: 'email',
                      type: 'email',
                      label: 'Email',
                      placeholder: 'seu@email.com',
                      required: 'true',
                      'data-db-type': 'string'
                    }
                  }}
                  isEditMode={false}
                />
                <FormTextareaField
                  element={{
                    ...element,
                    id: `${element.id}_mensagem`,
                    htmlAttributes: {
                      name: 'mensagem',
                      label: 'Mensagem',
                      placeholder: 'Digite sua mensagem...',
                      required: 'true',
                      'data-db-type': 'text'
                    }
                  }}
                  isEditMode={false}
                />
                <div className="flex justify-center">
                  <FormSubmitButton
                    element={{
                      ...element,
                      id: `${element.id}_submit`,
                      content: 'Enviar'
                    }}
                    isEditMode={false}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

/**
 * Função auxiliar para renderizar o componente de formulário apropriado
 */
export const renderFormElement = (element: Element, isEditMode: boolean) => {
  switch (element.type) {
    case ElementTypes.input:
      return <FormTextField key={element.id} element={element} isEditMode={isEditMode} />;
    case ElementTypes.select:
      return <FormSelectField key={element.id} element={element} isEditMode={isEditMode} />;
    case ElementTypes.checkbox:
      return <FormCheckboxField key={element.id} element={element} isEditMode={isEditMode} />;
    case ElementTypes.textarea:
      return <FormTextareaField key={element.id} element={element} isEditMode={isEditMode} />;
    case ElementTypes.form:
      return <FormComponent key={element.id} element={element} isEditMode={isEditMode} />;
    case ElementTypes.button:
      return <FormSubmitButton key={element.id} element={element} isEditMode={isEditMode} />;
    default:
      return null;
  }
};

/**
 * Funções de utilidade para geração de IDs e integração com banco de dados
 */

// Gera um ID baseado no nome do campo
export const generateFieldId = (name: string): string => {
  if (!name) return '';
  
  // Remover acentos e caracteres especiais
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Converter para minúsculas e substituir espaços por underscores
  return normalized.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

// Infere o tipo de dados baseado no nome e tipo do campo
export const inferFieldDataType = (name: string, htmlType?: string): string => {
  const nameLC = name.toLowerCase();
  
  // Verificação baseada no tipo de input HTML
  if (htmlType) {
    if (['number', 'range'].includes(htmlType)) return 'number';
    if (['date', 'datetime-local', 'month', 'time', 'week'].includes(htmlType)) return 'date';
    if (['checkbox', 'radio'].includes(htmlType)) return 'boolean';
    if (['email', 'tel', 'url', 'color', 'text', 'password'].includes(htmlType)) return 'string';
  }
  
  // Verificação baseada no nome do campo
  if (['id', 'codigo', 'code'].some(prefix => nameLC === prefix || nameLC.startsWith(prefix + '_'))) return 'integer';
  if (['idade', 'age', 'quantidade', 'quantity', 'qtd', 'valor', 'preco', 'price'].some(term => nameLC.includes(term))) return 'number';
  if (['data', 'date', 'dt', 'nascimento', 'birth'].some(term => nameLC.includes(term))) return 'date';
  if (['ativo', 'active', 'status', 'concluido', 'completed', 'finalizado'].some(term => nameLC.includes(term))) return 'boolean';
  
  // Padrão para tipos não identificados
  return 'string';
};

// Gera SQL para criação de tabela a partir dos campos do formulário
export const generateTableSql = (formName: string, fields: Array<{name: string, type: string, required: boolean}>): string => {
  const tableName = formName.toLowerCase().replace(/\s+/g, '_');
  
  const fieldDefinitions = fields.map(field => {
    const sqlType = mapToSqlType(field.type);
    const nullability = field.required ? 'NOT NULL' : 'NULL';
    return `    ${field.name} ${sqlType} ${nullability}`;
  }).join(',\n');
  
  return `CREATE TABLE ${tableName} (\n    id SERIAL PRIMARY KEY,\n${fieldDefinitions},\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);`;
};

// Mapeia tipos de dados do nosso sistema para tipos SQL do PostgreSQL
const mapToSqlType = (type: string): string => {
  switch (type) {
    case 'integer':
      return 'INTEGER';
    case 'number':
      return 'NUMERIC';
    case 'boolean':
      return 'BOOLEAN';
    case 'date':
      return 'TIMESTAMP';
    case 'text':
      return 'TEXT';
    default:
      return 'VARCHAR(255)';
  }
};
