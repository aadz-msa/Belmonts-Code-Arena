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

    // Define custom medieval dark theme
    monaco.editor.defineTheme('medieval-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: 'D4A017', fontStyle: 'bold' },
        { token: 'string', foreground: 'D4C5A9' },
        { token: 'number', foreground: 'F0C040' },
      ],
      colors: {
        'editor.background': '#1a1a2e',
        'editor.foreground': '#d4c5a9',
        'editor.lineHighlightBackground': '#16213e',
        'editorLineNumber.foreground': '#6e6e6e',
        'editor.selectionBackground': '#3a3a4a',
        'editor.inactiveSelectionBackground': '#2a2a3a',
      },
    })

    monaco.editor.setTheme('medieval-dark')
    setMounted(true)
  }

  useEffect(() => {
    // Save selected language to localStorage
    localStorage.setItem(STORAGE_KEYS.SELECTED_LANGUAGE, language.name)
  }, [language])

  return (
    <div className="flex flex-col h-full bg-dark-surface rounded-lg border border-stone overflow-hidden">
      {/* Language Selector */}
      <div className="flex items-center justify-between px-4 py-3 bg-shadow border-b border-stone">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-parchment">
            Language:
          </label>
          <select
            value={language.name}
            onChange={(e) => {
              const selected = LANGUAGES.find((l) => l.name === e.target.value)
              if (selected) onLanguageChange(selected)
            }}
            disabled={disabled}
            className="bg-dark-bg text-parchment px-3 py-1 rounded border border-stone focus:outline-none focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-gray-400">
          <span className="hidden sm:inline">
            Use Ctrl+Space for autocomplete
          </span>
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
          theme="medieval-dark"
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
            minimap: { enabled: false },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            readOnly: disabled,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  )
}
