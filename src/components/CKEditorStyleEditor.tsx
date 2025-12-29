'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List,
  ListOrdered, 
  Link, 
  Unlink,
  Image,
  Table,
  Quote,
  Minus,
  Indent,
  Outdent,
  Maximize2,
  Code,
  Plus,
  HelpCircle,
  Sparkles,
  Copy,
  Scissors,
  Clipboard,
  Undo,
  Redo,
  MoreHorizontal,
  Anchor,
  X
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface EditorSection {
  id: string;
  title: string;
  placeholder: string;
  content: string;
  htmlContent: string;
  characterCount: number;
  maxLength?: number;
  isSourceMode?: boolean;
}

interface CKEditorStyleEditorProps {
  onChange?: (sections: EditorSection[]) => void;
}

export default function CKEditorStyleEditor({ 
  onChange = () => {} 
}: CKEditorStyleEditorProps) {
  const [sections, setSections] = useState<EditorSection[]>([
    {
      id: 'specifications',
      title: 'SPECIFICATIONS',
      placeholder: 'Enter product specifications...',
      content: 'Sample product specifications',
      htmlContent: '<p>Sample product specifications with detailed <strong>technical</strong> information.</p>',
      characterCount: 947,
      maxLength: 10000,
      isSourceMode: false
    },
    {
      id: 'overview',
      title: 'OVERVIEW',
      placeholder: 'Enter comprehensive product overview...',
      content: 'Sample comprehensive product overview',
      htmlContent: '<p>Sample comprehensive product overview from supplier API with <em>detailed</em> information.</p>',
      characterCount: 950,
      maxLength: 10000,
      isSourceMode: false
    }
  ]);

  const [bulletPoints, setBulletPoints] = useState<string[]>(['']);
  const [updateTimeouts, setUpdateTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  // Initialize editors with existing content when component mounts
  useEffect(() => {
    sections.forEach(section => {
      const editorRef = document.getElementById(`editor-${section.id}`);
      if (editorRef && section.htmlContent && !section.isSourceMode) {
        editorRef.innerHTML = section.htmlContent;
      }
    });
  }, []); // Only run once on mount

  const updateSection = (sectionId: string, content: string, isHtml = false) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        let htmlContent = section.htmlContent;
        let textContent = content;
        
        if (isHtml) {
          htmlContent = content;
          // Convert HTML to text for character count
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content;
          textContent = tempDiv.textContent || tempDiv.innerText || '';
        } else {
          // If it's regular content, update both
          const editorRef = document.getElementById(`editor-${sectionId}`);
          if (editorRef && !section.isSourceMode) {
            htmlContent = editorRef.innerHTML;
          }
        }
        
        return {
          ...section,
          content: textContent,
          htmlContent,
          characterCount: textContent.length
        };
      }
      return section;
    });
    setSections(updatedSections);
    onChange(updatedSections);
  };

  const toggleSourceMode = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const editorRef = document.getElementById(`editor-${sectionId}`);
    const textareaRef = document.querySelector(`textarea[data-section="${sectionId}"]`) as HTMLTextAreaElement;
    
    if (!section.isSourceMode) {
      // Switching TO source mode - capture current HTML from the editor
      const htmlContent = editorRef ? editorRef.innerHTML : section.htmlContent;
      
      const updatedSections = sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            htmlContent,
            isSourceMode: true
          };
        }
        return s;
      });
      
      setSections(updatedSections);
      onChange(updatedSections);
    } else {
      // Switching FROM source mode - capture current textarea content
      const htmlContent = textareaRef ? textareaRef.value : section.htmlContent;
      
      const updatedSections = sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            htmlContent,
            isSourceMode: false
          };
        }
        return s;
      });
      
      setSections(updatedSections);
      onChange(updatedSections);
      
      // Set the HTML content back to the editor after React updates
      setTimeout(() => {
        const currentSection = updatedSections.find(s => s.id === sectionId);
        const currentEditorRef = document.getElementById(`editor-${sectionId}`);
        if (currentEditorRef && currentSection?.htmlContent) {
          currentEditorRef.innerHTML = currentSection.htmlContent;
        }
      }, 10);
    }
  };

  const execCommand = (command: string, value?: string, sectionId?: string) => {
    if (sectionId) {
      const section = sections.find(s => s.id === sectionId);
      if (section?.isSourceMode) return; // Don't execute commands in source mode
    }
    
    document.execCommand(command, false, value);
    if (sectionId) {
      setTimeout(() => {
        const editorRef = document.getElementById(`editor-${sectionId}`);
        if (editorRef) {
          const content = editorRef.innerHTML;
          updateSection(sectionId, content, true);
        }
      }, 10);
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    title, 
    icon: Icon, 
    disabled = false,
    isActive = false
  }: {
    onClick: () => void;
    title: string;
    icon: React.ElementType;
    disabled?: boolean;
    isActive?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        inline-flex items-center justify-center w-7 h-7 text-gray-700 
        hover:bg-gray-100 transition-colors duration-150 text-xs
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${isActive ? 'bg-blue-100 text-blue-700' : ''}
      `}
    >
      <Icon size={14} />
    </button>
  );

  const ToolbarSeparator = () => (
    <div className="w-px h-5 bg-gray-300 mx-1"></div>
  );

  const EditorToolbar = ({ sectionId }: { sectionId: string }) => {
    const section = sections.find(s => s.id === sectionId);
    const isSourceMode = section?.isSourceMode || false;
    
    return (
      <div className="border-b border-gray-300 bg-gray-100 px-2 py-1">
        <div className="flex flex-wrap items-center gap-1">
          {/* Document Group */}
          <ToolbarButton
            onClick={() => toggleSourceMode(sectionId)}
            title="Source"
            icon={Code}
            isActive={isSourceMode}
          />
          
          <ToolbarSeparator />
          
          {/* Clipboard Group */}
          <ToolbarButton
            onClick={() => execCommand('cut', undefined, sectionId)}
            title="Cut (Ctrl+X)"
            icon={Scissors}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => execCommand('copy', undefined, sectionId)}
            title="Copy (Ctrl+C)"
            icon={Copy}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => execCommand('paste', undefined, sectionId)}
            title="Paste (Ctrl+V)"
            icon={Clipboard}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => execCommand('insertText', '', sectionId)}
            title="Paste as plain text"
            icon={Clipboard}
            disabled={isSourceMode}
          />
          
          <ToolbarSeparator />
          
          <ToolbarButton
            onClick={() => execCommand('undo', undefined, sectionId)}
            title="Undo (Ctrl+Z)"
            icon={Undo}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => execCommand('redo', undefined, sectionId)}
            title="Redo (Ctrl+Y)"
            icon={Redo}
            disabled={isSourceMode}
          />
          
          <ToolbarSeparator />
          
          {/* Spell Check */}
          <ToolbarButton
            onClick={() => {}}
            title="Spell Check As You Type"
            icon={MoreHorizontal}
            disabled={isSourceMode}
          />
          
          <ToolbarSeparator />
          
          {/* Basic Styles */}
          <ToolbarButton
            onClick={() => execCommand('bold', undefined, sectionId)}
            title="Bold (Ctrl+B)"
            icon={Bold}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => execCommand('italic', undefined, sectionId)}
            title="Italic (Ctrl+I)"
            icon={Italic}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => execCommand('strikeThrough', undefined, sectionId)}
            title="Strikethrough"
            icon={Strikethrough}
            disabled={isSourceMode}
          />
          
          <ToolbarSeparator />
          
          <ToolbarButton
            onClick={() => execCommand('removeFormat', undefined, sectionId)}
            title="Remove Format"
            icon={Code}
            disabled={isSourceMode}
          />
          
          <ToolbarSeparator />
          
          {/* Lists */}
          <ToolbarButton
            onClick={() => execCommand('insertOrderedList', undefined, sectionId)}
            title="Numbered List"
            icon={ListOrdered}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => execCommand('insertUnorderedList', undefined, sectionId)}
            title="Bulleted List"
            icon={List}
            disabled={isSourceMode}
          />
          
          <ToolbarSeparator />
          
          <ToolbarButton
            onClick={() => execCommand('outdent', undefined, sectionId)}
            title="Decrease Indent"
            icon={Outdent}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => execCommand('indent', undefined, sectionId)}
            title="Increase Indent"
            icon={Indent}
            disabled={isSourceMode}
          />
          
          <ToolbarSeparator />
          
          <ToolbarButton
            onClick={() => execCommand('formatBlock', 'blockquote', sectionId)}
            title="Block Quote"
            icon={Quote}
            disabled={isSourceMode}
          />
          
          <ToolbarSeparator />
          
          {/* Links */}
          <ToolbarButton
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) execCommand('createLink', url, sectionId);
            }}
            title="Link (Ctrl+K)"
            icon={Link}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => execCommand('unlink', undefined, sectionId)}
            title="Unlink"
            icon={Unlink}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => {}}
            title="Anchor"
            icon={Anchor}
            disabled={isSourceMode}
          />
          
          <ToolbarSeparator />
          
          {/* Insert */}
          <ToolbarButton
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url) execCommand('insertImage', url, sectionId);
            }}
            title="Image"
            icon={Image}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => execCommand('insertHTML', '<table><tr><td>Cell</td></tr></table>', sectionId)}
            title="Table"
            icon={Table}
            disabled={isSourceMode}
          />
          <ToolbarButton
            onClick={() => execCommand('insertHorizontalRule', undefined, sectionId)}
            title="Horizontal Line"
            icon={Minus}
            disabled={isSourceMode}
          />
          
          <ToolbarSeparator />
          
          {/* Styles */}
          <select 
            onChange={(e) => execCommand('formatBlock', e.target.value, sectionId)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-sm h-7"
            defaultValue="div"
            disabled={isSourceMode}
          >
            <option value="div">Styles</option>
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
          
          <select 
            onChange={(e) => execCommand('formatBlock', e.target.value, sectionId)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-sm h-7 ml-1"
            defaultValue="p"
            disabled={isSourceMode}
          >
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>
          
          <ToolbarSeparator />
          
          {/* Tools */}
          <ToolbarButton
            onClick={() => {
              const editor = document.getElementById(`editor-${sectionId}`);
              if (editor) {
                editor.requestFullscreen?.();
              }
            }}
            title="Maximize"
            icon={Maximize2}
            disabled={isSourceMode}
          />
        </div>
      </div>
    );
  };

  const addBulletPoint = () => {
    setBulletPoints([...bulletPoints, '']);
  };

  const updateBulletPoint = (index: number, value: string) => {
    const updated = [...bulletPoints];
    updated[index] = value;
    setBulletPoints(updated);
  };

  const deleteBulletPoint = (index: number) => {
    if (bulletPoints.length > 1) { // Keep at least one bullet point
      const updated = bulletPoints.filter((_, i) => i !== index);
      setBulletPoints(updated);
    }
  };

  const handleEditorInput = (e: React.FormEvent, sectionId: string) => {
    const content = (e.target as HTMLDivElement).innerHTML;
    
    // Clear existing timeout for this section
    if (updateTimeouts[sectionId]) {
      clearTimeout(updateTimeouts[sectionId]);
    }
    
    // Set new debounced update
    const newTimeout = setTimeout(() => {
      updateSection(sectionId, content, true);
      setUpdateTimeouts(prev => {
        const { [sectionId]: removed, ...rest } = prev;
        return rest;
      });
    }, 1000);
    
    setUpdateTimeouts(prev => ({
      ...prev,
      [sectionId]: newTimeout
    }));
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Info */}
      <div className="text-base text-gray-600">
        Click{' '}
        <a 
          href="/application/settings?type=Product_setting" 
          className="text-blue-600 hover:text-blue-800 underline"
          target="_blank"
        >
          here
        </a>{' '}
        to pre-set the content to be included when pushing products to stores.
      </div>

      {/* Editor Sections */}
      {sections.map((section, index) => (
        <div key={section.id} className="space-y-4 mb-8">
          {/* Detached Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <p className="font-semibold text-gray-800 text-lg uppercase tracking-wide">
                {section.title}
                <span className="text-base text-gray-500 ml-3 normal-case">
                  Characters: {section.characterCount}
                </span>
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <HelpCircle size={18} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="max-w-xs">
                    <p className="text-sm">The total word count includes text, image links, source code, and other content.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* AI Button */}
            <div className="flex items-center">
              <div className="mr-3">
                <img src="/aigif3.gif" alt="" className="h-12 w-auto" />
              </div>
            </div>
          </div>

          {/* Editor Container */}
          <div className="border border-gray-300 rounded overflow-hidden bg-white shadow-sm">
            {/* Toolbar */}
            <EditorToolbar sectionId={section.id} />

            {/* Editor Area */}
            <div className="relative bg-white">
              {section.isSourceMode ? (
                /* Source Code View */
                <textarea
                  data-section={section.id}
                  className="w-full min-h-[400px] p-4 font-mono text-base border-none outline-none resize-none bg-white text-gray-800"
                  value={section.htmlContent}
                  onChange={(e) => updateSection(section.id, e.target.value, true)}
                  placeholder="<p>Enter HTML source code here...</p>"
                  style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
                />
              ) : (
                /* WYSIWYG View */
                <div
                  id={`editor-${section.id}`}
                  contentEditable
                  className="min-h-[400px] p-4 outline-none text-base leading-relaxed editor-content bg-white"
                  style={{ minHeight: '400px' }}
                  onInput={(e) => handleEditorInput(e, section.id)}
                  onBlur={(e) => {
                    // Save immediately on blur
                    const content = (e.target as HTMLDivElement).innerHTML;
                    updateSection(section.id, content, true);
                  }}
                  suppressContentEditableWarning={true}
                  data-placeholder={section.placeholder}
                />
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-gray-100 border-t border-gray-300 h-7 flex items-center justify-between px-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Elements path</span>
                <button className="hover:bg-gray-200 px-1 rounded">body</button>
                <button className="hover:bg-gray-200 px-1 rounded">p</button>
              </div>
              <div className="cursor-se-resize text-gray-400">◢</div>
            </div>
          </div>
        </div>
      ))}

      {/* Bullet Points Section */}
      <div className="border border-gray-200 rounded overflow-hidden bg-white">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 text-lg uppercase tracking-wide">
            BULLET POINT
          </h3>
        </div>
        
        <div className="p-4 space-y-3">
          {bulletPoints.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="text"
                value={point}
                onChange={(e) => updateBulletPoint(index, e.target.value)}
                className="flex-1 text-base"
                placeholder="Enter bullet point..."
              />
              
              {/* Delete Button - only show if more than one bullet point */}
              {bulletPoints.length > 1 && (
                <button
                  onClick={() => deleteBulletPoint(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors border border-red-200"
                  title="Delete bullet point"
                >
                  <X size={14} />
                </button>
              )}
              
              {/* Add Button - only show on last item */}
              {index === bulletPoints.length - 1 && (
                <button
                  onClick={addBulletPoint}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors border border-gray-300"
                  title="Add bullet point"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}