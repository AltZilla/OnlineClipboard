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
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-sm">📝</span>
            </span>
            Text Content
          </h3>
          {clipboard.content && (
            <button
              onClick={handleCopyText}
              className="bg-white/20 backdrop-blur-lg border border-white/30 text-white py-2 px-4 rounded-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-semibold transition-all duration-200 transform hover:scale-105"
            >
              📋 Copy Text
            </button>
          )}
        </div>
        
        {clipboard.content ? (
          <div className="bg-black/10 rounded-xl p-6 shadow-inner">
            <pre className="whitespace-pre-wrap text-white font-mono text-base leading-relaxed">
              {clipboard.content}
            </pre>
          </div>
        ) : (
          <div className="bg-black/10 rounded-xl p-12 text-center">
            <div className="text-white/50 text-4xl mb-4 floating">📝</div>
            <p className="text-white/70 text-lg">No text content</p>
          </div>
        )}
      </div>

      {/* Files */}
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-sm">📁</span>
          </span>
          Files ({clipboard.files?.length || 0})
        </h3>
        
        {clipboard.files && clipboard.files.length > 0 ? (
          <div className="space-y-4">
            {clipboard.files.map((file, index) => (
              <div
                key={index}
                className="bg-black/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 flex items-center justify-between shadow-lg hover:bg-black/20 transition-all duration-300 transform hover:-translate-y-1 animate-slideIn"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center space-x-4 truncate">
                  <div className="text-3xl floating" style={{animationDelay: `${index * 0.2}s`}}>
                    {getFileIcon(file.originalName)}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-white text-lg truncate">{file.originalName}</p>
                    <p className="text-sm text-white/70">
                      {formatFileSize(file.size)} • Uploaded {formatDate(file.uploadTime)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDownloadFile(file.filename, file.originalName)}
                  className="bg-white/20 backdrop-blur-lg border border-white/30 text-white py-2 px-5 rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 transform hover:scale-105 font-semibold ml-4"
                >
                  📥
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-black/10 rounded-xl p-12 text-center">
            <div className="text-white/50 text-4xl mb-4 floating">📁</div>
            <p className="text-white/70 text-lg">No files uploaded</p>
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
