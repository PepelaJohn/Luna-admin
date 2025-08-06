// components/RichTextEditor.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image,
  Link,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  X,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Enter description...",
  className = "",
  error 
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  // ImgBB API configuration (free service)
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || 'your-imgbb-api-key';
  const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const insertHTML = useCallback((html: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const element = document.createElement('div');
      element.innerHTML = html;
      const fragment = document.createDocumentFragment();
      while (element.firstChild) {
        fragment.appendChild(element.firstChild);
      }
      range.insertNode(fragment);
      selection.collapseToEnd();
    }
    handleInput();
  }, [handleInput]);

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  };

  const handleImageUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 32 * 1024 * 1024 // 32MB limit
    );

    if (validFiles.length === 0) {
      alert('Please select valid image files (max 32MB each)');
      return;
    }

    for (const file of validFiles) {
      const uploadId = Date.now() + Math.random();
      const uploadProgress: UploadProgress = {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      };

      setUploads(prev => [...prev, uploadProgress]);

      try {
        const imageUrl = await uploadImageToImgBB(file);
        
        // Update upload status
        setUploads(prev => prev.map(upload => 
          upload.fileName === file.name 
            ? { ...upload, status: 'success', url: imageUrl, progress: 100 }
            : upload
        ));

        // Insert image into editor
        const imageHtml = `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`;
        insertHTML(imageHtml);

        // Remove upload progress after 2 seconds
        setTimeout(() => {
          setUploads(prev => prev.filter(upload => upload.fileName !== file.name));
        }, 2000);

      } catch (error) {
        console.error('Image upload failed:', error);
        setUploads(prev => prev.map(upload => 
          upload.fileName === file.name 
            ? { ...upload, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : upload
        ));
      }
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      e.preventDefault();
      const files = imageItems.map(item => item.getAsFile()).filter(Boolean) as File[];
      if (files.length > 0) {
        const fileList = new DataTransfer();
        files.forEach(file => fileList.items.add(file));
        handleImageUpload(fileList.files);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      const text = window.getSelection()?.toString() || url;
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      insertHTML(linkHtml);
    }
  }, [insertHTML]);

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { icon: Strikethrough, command: 'strikethrough', title: 'Strikethrough' },
    { type: 'separator' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { type: 'separator' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
    { type: 'separator' },
    { icon: Link, action: insertLink, title: 'Insert Link' },
    { icon: Image, action: () => fileInputRef.current?.click(), title: 'Insert Image' },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar */}
      <div className="border border-gray-300 border-b-0 rounded-t-lg bg-gray-50 p-2 flex flex-wrap items-center gap-1">
        {toolbarButtons.map((button, index) => (
          button.type === 'separator' ? (
            <div key={index} className="w-px h-6 bg-gray-300 mx-1" />
          ) : (
            <button
              key={index}
              type="button"
              onClick={() => button.command ? executeCommand(button.command) : button.action?.()}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title={button.title}
            >
              {button.icon && <button.icon className="w-4 h-4" />}
            </button>
          )
        ))}
        
        {/* Format Dropdown */}
        <select
          onChange={(e) => executeCommand('formatBlock', e.target.value)}
          className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded"
          defaultValue=""
        >
          <option value="">Format</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`w-full min-h-[200px] p-4 border-l border-r border-b border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none overflow-y-auto ${
            error ? 'border-red-300 bg-red-50' : ''
          } ${
            isActive ? 'ring-2 ring-orange-500 border-transparent' : ''
          }`}
          style={{
            maxHeight: '400px',
            lineHeight: '1.6',
          }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        />

        {/* Placeholder */}
        {!value && !isActive && (
          <div className="absolute top-4 left-4 text-gray-500 pointer-events-none select-none">
            {placeholder}
          </div>
        )}

        {/* Upload indicator overlay */}
        {uploads.some(u => u.status === 'uploading') && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-b-lg">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Uploading images...</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2"
          >
            {uploads.map((upload, index) => (
              <motion.div
                key={upload.fileName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center gap-3 p-2 rounded-lg border ${
                  upload.status === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : upload.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{upload.fileName}</p>
                  {upload.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-orange-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                  {upload.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                  )}
                  {upload.status === 'success' && (
                    <p className="text-xs text-green-600 mt-1">Uploaded successfully!</p>
                  )}
                </div>
                
                {upload.status === 'success' && (
                  <div className="text-green-600">
                    <Upload className="w-4 h-4" />
                  </div>
                )}
                {upload.status === 'error' && (
                  <button
                    onClick={() => setUploads(prev => prev.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
        className="hidden"
      />

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-500 space-y-1">
        <p>• Use the toolbar buttons or keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic, etc.)</p>
        <p>• Drag & drop images directly into the editor or paste from clipboard</p>
        <p>• Images are automatically uploaded and hosted securely</p>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-sm mt-2 flex items-center"
        >
          <X className="w-4 h-4 mr-1" />
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default RichTextEditor;