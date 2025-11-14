'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit');
      return;
    }

    setUploading(true);
    try {
      onFileUpload(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        className={`file-drop-zone ${dragActive ? 'drag-over' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-lg text-blue-900 mb-2 handwriting">
            Drag and drop files here, or click to select
          </p>
          <p className="text-sm text-blue-700 mb-4 handwriting">
            Maximum file size: 50MB
          </p>
          <button
            type="button"
            onClick={onButtonClick}
            disabled={uploading}
            className="notebook-button text-blue-900 py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed handwriting-bold"
          >
            {uploading ? 'Uploading...' : 'Choose File'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
        accept="*/*"
      />

      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 shadow-sm">
        <h4 className="handwriting-bold text-blue-900 mb-2">Upload Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1 handwriting">
          <li>• Maximum file size: 50MB</li>
          <li>• Supported formats: All file types</li>
          <li>• Files are stored securely and expire after 24 hours</li>
          <li>• Use descriptive filenames for easier identification</li>
        </ul>
      </div>
    </div>
  );
}
