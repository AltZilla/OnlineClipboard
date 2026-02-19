'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles: File[] = [];
    const oversizedFiles: string[] = [];

    // Validate all files
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    }

    // Alert about oversized files
    if (oversizedFiles.length > 0) {
      alert(`The following files exceed the 50MB limit and were skipped:\n${oversizedFiles.join('\n')}`);
    }

    if (validFiles.length === 0) {
      return;
    }

    setUploading(true);
    try {
      onFileUpload(validFiles);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files');
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
    <div className="file-upload-container">
      <div
        className={`upload-zone ${dragActive ? 'drag-over' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="upload-icon">📁</div>
          <p className="upload-text">
            Drag and drop files here, or click to select
          </p>
          <p className="upload-subtext">
            Maximum file size: 50MB
          </p>
          <button
            type="button"
            onClick={onButtonClick}
            disabled={uploading}
            className="btn-secondary"
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleChange}
        className="hidden-input"
        accept="*/*"
        multiple
      />

      <div className="upload-guidelines">
        <h4 className="guidelines-title">Upload Guidelines:</h4>
        <ul className="guidelines-list">
          <li>• Maximum file size: 50MB</li>
          <li>• Supported formats: All file types</li>
          <li>• Files are stored securely and expire after 24 hours</li>
          <li>• Use descriptive filenames for easier identification</li>
        </ul>
      </div>
    </div>
  );
}
