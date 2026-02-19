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
      <div className="viewer-section">
        <div className="viewer-header">
          <h3 className="viewer-title">
            <span className="viewer-icon">
              <span className="text-blue-900 text-sm">📝</span>
            </span>
            Text Content
          </h3>
          {clipboard.content && (
            <button
              onClick={handleCopyText}
              className="btn-copy-text"
            >
              📋 Copy Text
            </button>
          )}
        </div>

        {clipboard.content ? (
          <div className="viewer-content-box">
            <pre className="viewer-pre">
              {clipboard.content}
            </pre>
          </div>
        ) : (
          <div className="viewer-empty">
            <div className="empty-float-icon">📝</div>
            <p className="text-blue-700 text-lg handwriting">No text content</p>
          </div>
        )}
      </div>

      {/* Files */}
      <div className="viewer-section" style={{ animationDelay: '0.2s' }}>
        <h3 className="viewer-title mb-6">
          <span className="viewer-icon">
            <span className="text-blue-900 text-sm">📁</span>
          </span>
          Files ({clipboard.files?.length || 0})
        </h3>

        {clipboard.files && clipboard.files.length > 0 ? (
          <div className="viewer-files-list">
            {clipboard.files.map((file, index) => (
              <div
                key={index}
                className="viewer-file-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="viewer-file-info">
                  <div className="file-icon-large" style={{ animationDelay: `${index * 0.2}s` }}>
                    {getFileIcon(file.originalName)}
                  </div>
                  <div className="viewer-file-details">
                    <p className="viewer-filename">{file.originalName}</p>
                    <p className="viewer-file-meta">
                      {formatFileSize(file.size)} • Uploaded {formatDate(file.uploadTime)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadFile(file.filename, file.originalName)}
                  className="btn-download"
                >
                  📥
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="viewer-empty">
            <div className="empty-float-icon">📁</div>
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
