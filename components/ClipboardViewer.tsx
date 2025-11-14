'use client';

import { ClipboardData } from '@/lib/storage-mongodb';

interface ClipboardViewerProps {
  clipboard: ClipboardData;
}

export default function ClipboardViewer({ clipboard }: ClipboardViewerProps) {
  const handleDownloadFile = async (filename: string, originalName: string) => {
    try {
      const response = await fetch(`/api/clipboard/${clipboard.id}/file/${filename}`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(clipboard.content);
      alert('Text copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy text:', error);
      alert('Failed to copy text');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-8">
      {/* Text Content */}
      <div className="paper-card p-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl handwriting-bold text-blue-900 flex items-center">
            <span className="w-8 h-8 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <span className="text-blue-900 text-sm">📝</span>
            </span>
            Text Content
          </h3>
          {clipboard.content && (
            <button
              onClick={handleCopyText}
              className="notebook-button text-blue-900 py-2 px-4 text-sm handwriting-bold"
            >
              📋 Copy Text
            </button>
          )}
        </div>
        
        {clipboard.content ? (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 shadow-inner">
            <pre className="whitespace-pre-wrap text-blue-900 handwriting text-base leading-relaxed">
              {clipboard.content}
            </pre>
          </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-12 text-center">
            <div className="text-blue-400 text-4xl mb-4 floating">📝</div>
            <p className="text-blue-700 text-lg handwriting">No text content</p>
          </div>
        )}
      </div>

      {/* Files */}
      <div className="paper-card p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <h3 className="text-2xl handwriting-bold text-blue-900 mb-6 flex items-center">
          <span className="w-8 h-8 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <span className="text-blue-900 text-sm">📁</span>
          </span>
          Files ({clipboard.files?.length || 0})
        </h3>
        
        {clipboard.files && clipboard.files.length > 0 ? (
          <div className="space-y-4">
            {clipboard.files.map((file, index) => (
              <div
                key={index}
                className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-center justify-between shadow-sm hover:bg-blue-100 transition-all duration-300 transform hover:-translate-y-1 animate-slideIn"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center space-x-4 truncate">
                  <div className="text-3xl floating" style={{animationDelay: `${index * 0.2}s`}}>
                    {getFileIcon(file.originalName)}
                  </div>
                  <div className="truncate">
                    <p className="handwriting-bold text-blue-900 text-lg truncate">{file.originalName}</p>
                    <p className="text-sm text-blue-700 handwriting">
                      {formatFileSize(file.size)} • Uploaded {formatDate(file.uploadTime)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDownloadFile(file.filename, file.originalName)}
                  className="notebook-button text-blue-900 py-2 px-5 text-lg handwriting-bold ml-4"
                >
                  📥
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-12 text-center">
            <div className="text-blue-400 text-4xl mb-4 floating">📁</div>
            <p className="text-blue-700 text-lg handwriting">No files uploaded</p>
          </div>
        )}
      </div>


    </div>
  );
}

function getFileIcon(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📈';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
      return '🖼️';
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return '🎥';
    case 'mp3':
    case 'wav':
    case 'flac':
      return '🎵';
    case 'zip':
    case 'rar':
    case '7z':
      return '📦';
    case 'txt':
    case 'md':
      return '📄';
    case 'js':
    case 'ts':
    case 'html':
    case 'css':
    case 'json':
      return '💻';
    default:
      return '📁';
  }
}
