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
 */
export const FormComponent = ({ element, isEditMode }: FormFieldProps) => {
  const { elements } = useEditorStore();
  
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
    
    // Aqui implementar integração com o banco de dados se não estiver em modo de edição
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full h-full overflow-auto p-4">
      {childElements.length > 0 ? (
        childElements.map((childElement) => renderFormElement(childElement, isEditMode))
      ) : (
        <div className="flex flex-col gap-4">
          <FormTextField
            element={{
              ...element,
              htmlAttributes: {
                name: 'nome',
                label: 'Nome',
                placeholder: 'Seu nome',
                required: 'true'
              }
            }}
            isEditMode={isEditMode}
          />
          <FormTextField
            element={{
              ...element,
              htmlAttributes: {
                name: 'email',
                type: 'email',
                label: 'Email',
                placeholder: 'seu@email.com',
                required: 'true'
              }
            }}
            isEditMode={isEditMode}
          />
          <FormTextareaField
            element={{
              ...element,
              htmlAttributes: {
                name: 'mensagem',
                label: 'Mensagem',
                placeholder: 'Digite sua mensagem...',
                required: 'true'
              }
            }}
            isEditMode={isEditMode}
          />
          <div className="flex justify-center">
            <FormSubmitButton
              element={{
                ...element,
                content: 'Enviar'
              }}
              isEditMode={isEditMode}
            />
          </div>
        </div>
      )}
    </form>
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
