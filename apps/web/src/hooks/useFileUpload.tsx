import React, { useState, useRef, useCallback } from "react";
import type { Base64ContentBlock } from "@langchain/core/messages";
import { toast } from "sonner";

const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png", 
  "image/gif",
  "image/webp",
  "application/pdf"
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UseFileUploadReturn {
  contentBlocks: Base64ContentBlock[];
  setContentBlocks: (blocks: Base64ContentBlock[]) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dropRef: React.RefObject<HTMLDivElement | null>;
  removeBlock: (index: number) => void;
  resetBlocks: () => void;
  dragOver: boolean;
  handlePaste: (e: React.ClipboardEvent) => void;
}

function fileToContentBlock(file: File): Promise<Base64ContentBlock> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1]; // Remove data:mime/type;base64, prefix
      
      const block: Base64ContentBlock = {
        type: file.type.startsWith('image/') ? 'image' : 'file',
        source_type: 'base64',
        mime_type: file.type,
        data: base64Data,
        metadata: {
          name: file.name,
          size: file.size,
        }
      };
      resolve(block);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function validateFile(file: File, existingFiles: Base64ContentBlock[]): string | null {
  // Check file type
  if (!SUPPORTED_FILE_TYPES.includes(file.type as any)) {
    return `Unsupported file type: ${file.type}. Supported types: images (JPEG, PNG, GIF, WEBP) and PDFs.`;
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size: 10MB.`;
  }
  
  // Check for duplicates
  const isDuplicate = existingFiles.some(block => 
    block.metadata?.name === file.name && 
    block.metadata?.size === file.size
  );
  
  if (isDuplicate) {
    return `File "${file.name}" is already uploaded.`;
  }
  
  return null;
}

export function useFileUpload(): UseFileUploadReturn {
  const [contentBlocks, setContentBlocks] = useState<Base64ContentBlock[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    // Validate all files first
    for (const file of fileArray) {
      const error = validateFile(file, contentBlocks);
      if (error) {
        toast.error(error);
      } else {
        validFiles.push(file);
      }
    }
    
    if (validFiles.length === 0) return;
    
    try {
      const newBlocks = await Promise.all(
        validFiles.map(file => fileToContentBlock(file))
      );
      
      setContentBlocks(prev => [...prev, ...newBlocks]);
      toast.success(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Failed to process files');
    }
  }, [contentBlocks]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    processFiles(files);
    // Reset input value to allow same file upload
    e.target.value = '';
  }, [processFiles]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const files = items
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter(Boolean) as File[];
    
    if (files.length > 0) {
      e.preventDefault();
      processFiles(files);
    }
  }, [processFiles]);

  const removeBlock = useCallback((index: number) => {
    setContentBlocks(prev => prev.filter((_, i) => i !== index));
  }, []);

  const resetBlocks = useCallback(() => {
    setContentBlocks([]);
  }, []);

  // Set up drag and drop handlers
  React.useEffect(() => {
    const dropElement = dropRef.current;
    if (!dropElement) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only set dragOver to false if we're leaving the drop zone entirely
      if (!dropElement.contains(e.relatedTarget as Node)) {
        setDragOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      
      const files = e.dataTransfer?.files;
      if (files) {
        processFiles(files);
      }
    };

    dropElement.addEventListener('dragover', handleDragOver);
    dropElement.addEventListener('dragleave', handleDragLeave);
    dropElement.addEventListener('drop', handleDrop);

    return () => {
      dropElement.removeEventListener('dragover', handleDragOver);
      dropElement.removeEventListener('dragleave', handleDragLeave);
      dropElement.removeEventListener('drop', handleDrop);
    };
  }, [processFiles]);

  return {
    contentBlocks,
    setContentBlocks,
    handleFileUpload,
    dropRef,
    removeBlock,
    resetBlocks,
    dragOver,
    handlePaste,
  };
}