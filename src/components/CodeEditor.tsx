import { Editor, OnMount } from '@monaco-editor/react'
import { useEffect, useRef, useState } from 'react'
import { LANGUAGES, STORAGE_KEYS } from '../lib/constants'
import type { Language } from '../lib/types'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: Language
  onLanguageChange: (language: Language) => void
  disabled?: boolean
}

export function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  disabled,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Define premium medieval gothic dark theme
    monaco.editor.defineTheme('gothic-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Comments - Gray italic
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'comment.line', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'comment.block', foreground: '6b7280', fontStyle: 'italic' },
        
        // Keywords - Muted gold
        { token: 'keyword', foreground: 'c9a05f', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'c9a05f', fontStyle: 'bold' },
        
        // Strings - Soft green
        { token: 'string', foreground: '86b987' },
        { token: 'string.quoted', foreground: '86b987' },
        
        // Numbers - Gold soft
        { token: 'number', foreground: 'f5d27a' },
        { token: 'constant.numeric', foreground: 'f5d27a' },
        
        // Functions - Light blue
        { token: 'entity.name.function', foreground: '7dd3fc' },
        { token: 'support.function', foreground: '7dd3fc' },
        
        // Variables - Primary text
        { token: 'variable', foreground: 'f3f4f6' },
        { token: 'variable.parameter', foreground: 'e5e7eb' },
        
        // Types - Cyan
        { token: 'entity.name.type', foreground: '5eead4' },
        { token: 'support.type', foreground: '5eead4' },
        
        // Operators - Soft gold
        { token: 'keyword.operator', foreground: 'd4af37' },
        
        // Punctuation
        { token: 'punctuation', foreground: '9ca3af' },
      ],
      colors: {
        'editor.background': '#0b0f14',
        'editor.foreground': '#f3f4f6',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#d4af37',
        'editor.lineHighlightBackground': '#111827',
        'editor.lineHighlightBorder': '#1a202c',
        'editor.selectionBackground': '#1e293b',
        'editor.inactiveSelectionBackground': '#1a202c',
        'editor.selectionHighlightBackground': '#172033',
        'editorCursor.foreground': '#d4af37',
        'editor.findMatchBackground': '#374151',
        'editor.findMatchHighlightBackground': '#1f2937',
        'editorWidget.background': '#111827',
        'editorWidget.border': '#374151',
        'editorSuggestWidget.background': '#111827',
        'editorSuggestWidget.border': '#374151',
        'editorSuggestWidget.selectedBackground': '#1e293b',
        'editorHoverWidget.background': '#111827',
        'editorHoverWidget.border': '#374151',
        'editorIndentGuide.background': '#1f2937',
        'editorIndentGuide.activeBackground': '#374151',
        'editorBracketMatch.background': '#1e293b',
        'editorBracketMatch.border': '#d4af37',
        'scrollbarSlider.background': '#1a202c',
        'scrollbarSlider.hoverBackground': '#2d3748',
        'scrollbarSlider.activeBackground': '#374151',
      },
    })

    monaco.editor.setTheme('gothic-dark')
    setMounted(true)
  }

  useEffect(() => {
    // Save selected language to localStorage
    localStorage.setItem(STORAGE_KEYS.SELECTED_LANGUAGE, language.name)
  }, [language])

  return (
    <div 
      className="flex flex-col h-full rounded-lg overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #0b0f14 100%)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        boxShadow: 'inset 0 1px 0 rgba(212, 175, 55, 0.1), 0 8px 32px rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* Language Selector */}
      <div 
        className="flex items-center justify-between px-5 py-3.5"
        style={{
          background: 'linear-gradient(135deg, #1a202c 0%, #111827 100%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <div className="flex items-center space-x-4">
          <label 
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ 
              color: '#f5d27a',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.1em'
            }}
          >
            Language:
          </label>
          <select
            value={language.name}
            onChange={(e) => {
              const selected = LANGUAGES.find((l) => l.name === e.target.value)
              if (selected) onLanguageChange(selected)
            }}
            disabled={disabled}
            className="px-3 py-1.5 rounded text-sm font-medium transition-all duration-300"
            style={{
              background: '#0b0f14',
              color: '#f3f4f6',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              fontFamily: "'Inter', sans-serif",
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#d4af37'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)'
              e.currentTarget.style.outline = 'none'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div 
          className="text-xs hidden sm:inline"
          style={{ color: 'rgba(243, 244, 246, 0.4)' }}
        >
          Ctrl+Space for autocomplete
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language.monacoLanguage}
          value={value}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          theme="gothic-dark"
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            readOnly: disabled,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            padding: { top: 20, bottom: 20 },
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            renderLineHighlight: 'all',
            occurrencesHighlight: 'off',
          }}
        />
      </div>
    </div>
  )
}
