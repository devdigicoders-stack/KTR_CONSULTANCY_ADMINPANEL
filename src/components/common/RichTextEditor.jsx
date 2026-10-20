import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, Heading2, Heading3, 
  Highlighter, Eraser, Type
} from 'lucide-react';

/**
 * RichTextEditor - A lightweight, robust rich-text WYSIWYG editor tailored for
 * staff case notes, remarks, observations, and pendency details.
 * 
 * Supports:
 * - Bold, Italic, Underline
 * - Bullet lists & Numbered lists
 * - Headings (Normal, H2, H3)
 * - Text alignment (Left, Center, Right)
 * - Yellow highlight for key points & technical notes
 * - Clear formatting
 */
const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Type case notes, observations, technical issues or key points...',
  minHeight = '120px',
  className = '',
  id
}) => {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    list: false,
    listOrdered: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    heading: 'p'
  });
  const [isEmpty, setIsEmpty] = useState(true);

  // Helper to convert plain text newlines to clean HTML paragraphs
  const formatInitialValue = (val) => {
    if (!val) return '';
    // If it already looks like HTML (has tags), return as is
    if (/<[a-z][\s\S]*>/i.test(val)) return val;
    // Otherwise convert plain text lines
    return val
      .split('\n')
      .map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>')
      .join('');
  };

  // Sync incoming value to contentEditable when not focused
  useEffect(() => {
    if (!editorRef.current) return;
    const currentHTML = editorRef.current.innerHTML;
    const formatted = formatInitialValue(value);

    if (currentHTML !== formatted && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = formatted;
      const text = editorRef.current.innerText || '';
      setIsEmpty(!text.trim() && !editorRef.current.querySelector('img, table, hr'));
    }
  }, [value]);

  // Update active formatting states based on cursor selection
  const updateActiveStates = useCallback(() => {
    if (!document.queryCommandState) return;
    try {
      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      const list = document.queryCommandState('insertUnorderedList');
      const listOrdered = document.queryCommandState('insertOrderedList');
      const alignLeft = document.queryCommandState('justifyLeft');
      const alignCenter = document.queryCommandState('justifyCenter');
      const alignRight = document.queryCommandState('justifyRight');

      let heading = 'p';
      const blockValue = (document.queryCommandValue('formatBlock') || '').toLowerCase();
      if (blockValue.includes('h2')) heading = 'h2';
      else if (blockValue.includes('h3')) heading = 'h3';

      setActiveFormats({
        bold,
        italic,
        underline,
        list,
        listOrdered,
        alignLeft,
        alignCenter,
        alignRight,
        heading
      });

      if (editorRef.current) {
        const text = editorRef.current.innerText || '';
        setIsEmpty(!text.trim() && !editorRef.current.querySelector('img, table, hr'));
      }
    } catch (e) {
      // Ignore queryCommand errors if element not focused
    }
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorRef.current && editorRef.current.contains(document.getSelection()?.anchorNode)) {
        updateActiveStates();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateActiveStates]);

  // Execute rich-text commands safely while preserving selection focus
  const executeCommand = (command, val = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === 'formatBlock') {
      document.execCommand('formatBlock', false, val);
    } else if (command === 'highlight') {
      // Toggle highlight color
      const currentBg = document.queryCommandValue('hiliteColor') || document.queryCommandValue('backColor');
      if (currentBg === 'rgb(254, 240, 138)' || currentBg === '#fef08a') {
        document.execCommand('hiliteColor', false, 'transparent');
      } else {
        document.execCommand('hiliteColor', false, '#fef08a');
      }
    } else {
      document.execCommand(command, false, val);
    }

    handleInput();
    updateActiveStates();
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const hasMedia = editorRef.current.querySelector('img, table, hr');
    const empty = !text.trim() && !hasMedia;
    setIsEmpty(empty);

    if (empty) {
      onChange && onChange('');
    } else {
      onChange && onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={`flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all ${className}`}>
      
      {/* 1. Rich Text Formatting Toolbar */}
      <div 
        className="flex flex-wrap items-center gap-0.5 p-1.5 bg-gray-50/90 border-b border-gray-200 select-none"
        onMouseDown={(e) => e.preventDefault()} // Prevent focus loss on toolbar clicks
      >
        {/* Heading / Style Selector */}
        <div className="flex items-center bg-white rounded-lg border border-gray-200 p-0.5 mr-1 shadow-2xs">
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', activeFormats.heading === 'h2' ? '<p>' : '<h2>')}
            className={`px-2 py-1 rounded text-[11px] font-black transition-all flex items-center gap-1 ${
              activeFormats.heading === 'h2' 
                ? 'bg-amber-500 text-white shadow-2xs' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Heading 2 (Large Header)"
          >
            <Heading2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">H2</span>
          </button>

          <button
            type="button"
            onClick={() => executeCommand('formatBlock', activeFormats.heading === 'h3' ? '<p>' : '<h3>')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
              activeFormats.heading === 'h3' 
                ? 'bg-amber-500 text-white shadow-2xs' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Heading 3 (Section Title)"
          >
            <Heading3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">H3</span>
          </button>

          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<p>')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
              activeFormats.heading === 'p' && !activeFormats.bold && !activeFormats.italic
                ? 'bg-gray-200 text-[#081326]' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Normal Paragraph Text"
          >
            <Type className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-gray-200 mx-0.5" />

        {/* Bold, Italic, Underline */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFormats.bold 
              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFormats.italic 
              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFormats.underline 
              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        {/* Highlighter for Key Points */}
        <button
          type="button"
          onClick={() => executeCommand('highlight')}
          className="p-1.5 rounded-lg text-xs font-bold transition-all text-amber-700 hover:bg-amber-100 hover:text-amber-900"
          title="Highlight Key Point / Observation (Amber)"
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-0.5" />

        {/* Bullet and Numbered Lists */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFormats.list 
              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
          title="Bullet Points"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFormats.listOrdered 
              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-0.5" />

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFormats.alignLeft 
              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFormats.alignCenter 
              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
            activeFormats.alignRight 
              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-0.5" />

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          className="p-1.5 rounded-lg text-xs font-bold transition-all text-gray-400 hover:text-red-600 hover:bg-red-50 ml-auto"
          title="Clear Formatting"
        >
          <Eraser className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Editable Content Area with Dynamic Placeholder */}
      <div className="relative flex-1">
        {isEmpty && (
          <div 
            onClick={() => editorRef.current?.focus()}
            className="absolute top-2.5 left-3 text-xs text-gray-400 pointer-events-none select-none font-normal"
          >
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          id={id}
          contentEditable
          onInput={handleInput}
          onKeyUp={updateActiveStates}
          onMouseUp={updateActiveStates}
          style={{ minHeight }}
          className="p-3 text-xs text-gray-800 outline-none leading-relaxed overflow-y-auto [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_h2]:text-sm [&_h2]:font-black [&_h2]:text-[#081326] [&_h2]:my-1.5 [&_h3]:text-xs [&_h3]:font-black [&_h3]:text-[#081326] [&_h3]:my-1 [&_p]:my-1 [&_mark]:bg-amber-200 [&_mark]:px-1 [&_mark]:rounded"
        />
      </div>

    </div>
  );
};

/**
 * FormattedNotes - Displays rich-text notes or plain-text notes cleanly,
 * preserving HTML formatting (bold, italic, bullet points, numbers, headings, etc.)
 * while safely rendering legacy unformatted strings.
 */
export const FormattedNotes = ({ content, className = '', emptyText = 'No case notes logged.' }) => {
  const textContent = typeof content === 'string' ? content : (content ? String(content) : '');
  if (!textContent.trim()) {
    return <p className="text-[11px] text-gray-400 italic py-1">{emptyText}</p>;
  }

  const hasHtml = /<[a-z][\s\S]*>/i.test(textContent);

  if (!hasHtml) {
    return (
      <div className={`text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-medium ${className}`}>
        {textContent}
      </div>
    );
  }

  return (
    <div 
      className={`text-xs text-gray-700 leading-relaxed font-medium space-y-1 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_h2]:text-sm [&_h2]:font-black [&_h2]:text-[#081326] [&_h2]:my-1.5 [&_h3]:text-xs [&_h3]:font-black [&_h3]:text-[#081326] [&_h3]:my-1 [&_p]:my-0.5 [&_mark]:bg-amber-200 [&_mark]:px-1 [&_mark]:rounded ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextEditor;
