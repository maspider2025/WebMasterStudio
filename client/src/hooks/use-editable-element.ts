import { useRef, useState, useEffect, useCallback } from 'react';
import { useEditorStore, Element } from '@/lib/editor-store';

interface UseEditableElementProps {
  element: Element;
  isSelected: boolean;
}

export const useEditableElement = ({ element, isSelected }: UseEditableElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { updateElementContent, updateElementStyles } = useEditorStore();
  
  // For direct text editing
  const [editableContent, setEditableContent] = useState(element.content || '');
  
  // Enable contentEditable on double click for text elements
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Only enable editing for text-based elements
    if (['text', 'heading', 'paragraph', 'button'].includes(element.type)) {
      setIsEditing(true);
    }
  }, [element.type]);
  
  // Apply updates when editing is finished
  const handleBlur = useCallback(() => {
    if (isEditing) {
      updateElementContent(element.id, { content: editableContent });
      setIsEditing(false);
    }
  }, [isEditing, editableContent, element.id, updateElementContent]);
  
  // Update local state when content changes
  const handleContentChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    setEditableContent(e.currentTarget.textContent || '');
  }, []);
  
  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isEditing) {
      // Save on Enter (but not with Shift for new line)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        elementRef.current?.blur();
      }
      
      // Cancel on Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        setEditableContent(element.content || '');
        setIsEditing(false);
      }
    }
  }, [isEditing, element.content]);
  
  // CSS inline styles
  const getStyles = useCallback(() => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      zIndex: element.zIndex,
      visibility: element.visible === false ? 'hidden' : 'visible',
    };
    
    // Merge with custom styles from element
    if (element.styles) {
      Object.entries(element.styles).forEach(([key, value]) => {
        if (key !== 'undefined') {
          (baseStyles as any)[key] = value;
        }
      });
    }
    
    return baseStyles;
  }, [element]);
  
  // Sync content from element when it changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditableContent(element.content || '');
    }
  }, [element.content, isEditing]);
  
  // Focus and select all text when entering edit mode
  useEffect(() => {
    if (isEditing && elementRef.current) {
      elementRef.current.focus();
      
      // Select all text for easy replacement
      const selection = window.getSelection();
      const range = document.createRange();
      
      range.selectNodeContents(elementRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);
  
  return {
    elementRef,
    isEditing,
    editableContent,
    styles: getStyles(),
    handleDoubleClick,
    handleBlur,
    handleContentChange,
    handleKeyDown
  };
};
