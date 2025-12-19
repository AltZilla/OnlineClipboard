'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClipboardForm from '@/components/ClipboardForm';
import FileUpload from '@/components/FileUpload';

interface ClipboardListItem {
  id: string;
  content: string;
  files: Array<{
    filename: string;
    originalName: string;
    size: number;
    uploadTime: string;
    mimeType: string;
  }>;
  isPublic?: boolean;
  createdAt: string;
  lastAccessed: string;
  expiresAt: string;
}

export default function Home() {
  const [clipboardId, setClipboardId] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [clipboards, setClipboards] = useState<ClipboardListItem[]>([]);
  const [loadingClipboards, setLoadingClipboards] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const router = useRouter();

  const handleCreateClipboard = async (content: string) => {
    // Validation: must have either text or files
    if (!content.trim() && files.length === 0) {
      alert('Please add text content or upload at least one file to create a clipboard.');
      return;
    }

    console.log('Creating clipboard with isPublic:', isPublic);
    setLoading(true);
    try {
      // Create clipboard with content and public setting
      const response = await fetch('/api/clipboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, isPublic }),
      });

      const data = await response.json();

      if (data.success) {
        const clipboardId = data.clipboard.id;

        // Upload files if any
        if (files.length > 0) {
          const failedUploads: { name: string; error: string }[] = [];

          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
              const uploadResponse = await fetch(`/api/clipboard/${clipboardId}/upload`, {
                method: 'POST',
                body: formData,
              });

              if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({}));
                const errorMessage = errorData.error || `HTTP ${uploadResponse.status}`;
                failedUploads.push({ name: file.name, error: errorMessage });
                console.warn(`Failed to upload file: ${file.name} - ${errorMessage}`);
              }
            } catch (uploadError) {
              const errorMessage = uploadError instanceof Error ? uploadError.message : 'Network error';
              failedUploads.push({ name: file.name, error: errorMessage });
              console.error(`Error uploading file ${file.name}:`, uploadError);
            }
          }

          // Notify user of any failed uploads with error details
          if (failedUploads.length > 0) {
            const failedList = failedUploads.map(f => `• ${f.name}: ${f.error}`).join('\n');
            alert(`The following files could not be uploaded:\n\n${failedList}\n\nThe clipboard was created but these files are missing.`);
          }
        }

        // Reset form
        setFiles([]);
        setIsPublic(false);

        // Wait a bit for the database to be updated, then refresh
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchClipboards();

        // Small delay to ensure state updates
        setTimeout(() => {
          router.push(`/clipboard/${clipboardId}`);
        }, 100);
      } else {
        alert('Failed to create clipboard: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating clipboard:', error);
      alert('Failed to create clipboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAccessClipboard = () => {
    if (clipboardId.trim()) {
      router.push(`/clipboard/${clipboardId.trim()}`);
    }
  };

  const fetchClipboards = async () => {
    try {
      setLoadingClipboards(true);
      // Only fetch public clipboards for the "Recent Clipboards" section
      const response = await fetch('/api/clipboard?all=true&public=true');
      const data = await response.json();

      console.log('Fetched clipboards:', data.clipboards?.length || 0, 'clipboards');
      if (data.success && data.clipboards) {
        console.log('Setting clipboards:', data.clipboards.map((c: ClipboardListItem) => ({ id: c.id, isPublic: (c as any).isPublic })));
        setClipboards(data.clipboards);
      }
    } catch (error) {
      console.error('Error fetching clipboards:', error);
    } finally {
      setLoadingClipboards(false);
    }
  };

  useEffect(() => {
    fetchClipboards();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getPreviewText = (content: string, maxLength: number = 50) => {
    if (!content) return 'No content';
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;
  };

  return (

    <div className="w-full">

      {/* Title */}

      <div className="text-center mb-12 animate-fadeIn py-4">

        <div className="inline-block paper-card px-8 py-4">

          <h1 className="text-5xl handwriting-bold text-blue-900">

            📓 Online Clipboard

          </h1>

        </div>

      </div>



      {/* Subtitle */}

      <p className="text-2xl text-blue-800 max-w-3xl mx-auto leading-relaxed text-center -mt-12 mb-12 handwriting">

        Share text and files between devices with a unique ID

      </p>



      <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">

        {/* Create New Clipboard */}

        <div className="paper-card p-8 animate-slideIn">

          <div className="flex items-center mb-6">

            <div className="w-12 h-12 bg-yellow-100 border-2 border-yellow-300 rounded-lg flex items-center justify-center mr-4 shadow-md">

              <span className="text-2xl">✨</span>

            </div>

            <h2 className="text-3xl handwriting-bold text-blue-900">

              Create New Clipboard

            </h2>

          </div>

          <ClipboardForm

            onSubmit={handleCreateClipboard}

            loading={loading}

            placeholder="Enter text to share..."

            buttonText="Create Clipboard"

          />

          {/* Public Toggle */}
          <div className="mt-6 flex items-center justify-between bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌐</span>
              <div>
                <label htmlFor="publicToggle" className="text-lg handwriting-bold text-blue-900 cursor-pointer">
                  Make Public (Show in Recent Clipboards)
                </label>
                <p className="text-sm text-blue-700 handwriting">
                  Allow this clipboard to appear in the Recent Clipboards list
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${isPublic ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              role="switch"
              aria-checked={isPublic}
              aria-label="Toggle public visibility"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-7' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {/* File Upload Section */}

          <div className="mt-8">

            <h3 className="text-xl handwriting-bold text-blue-900 mb-4 flex items-center">

              <span className="w-8 h-8 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center mr-3 shadow-sm">

                📁

              </span>

              Upload Files (Optional)

            </h3>

            <FileUpload onFileUpload={handleFileUpload} />



            {/* Selected Files */}

            {files.length > 0 && (

              <div className="mt-6 animate-fadeIn">

                <h4 className="text-lg handwriting-bold text-blue-900 mb-4">

                  Selected Files ({files.length}):

                </h4>

                <div className="space-y-3">

                  {files.map((file, index) => (

                    <div key={index} className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 p-3 rounded-lg hover:bg-blue-100 transition-all duration-200 shadow-sm">

                      <div className="flex items-center space-x-3 truncate">

                        <span className="text-lg">📄</span>

                        <div className="truncate">

                          <span className="text-sm handwriting-bold text-blue-900 truncate">{file.name}</span>

                          <span className="text-xs text-blue-700 block">

                            {(file.size / 1024 / 1024).toFixed(2)} MB

                          </span>

                        </div>

                      </div>

                      <button

                        onClick={() => removeFile(index)}

                        className="text-red-600 hover:text-red-700 text-lg hover:scale-110 transition-transform duration-200 handwriting-bold"

                      >

                        ✕

                      </button>

                    </div>

                  ))}

                </div>

              </div>

            )}

          </div>

        </div>



        {/* Access Existing Clipboard */}

        <div className="paper-card p-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>

          <div className="flex items-center mb-6">

            <div className="w-12 h-12 bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center mr-4 shadow-md">

              <span className="text-2xl">🔍</span>

            </div>

            <h2 className="text-3xl handwriting-bold text-blue-900">

              Access Existing Clipboard

            </h2>

          </div>

          <div className="space-y-6">

            <div>

              <label htmlFor="clipboardId" className="block text-lg handwriting-bold text-blue-900 mb-3">

                Clipboard ID

              </label>

              <input

                type="text"

                id="clipboardId"

                value={clipboardId}

                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                  setClipboardId(value);
                }}

                placeholder="Enter 4-digit ID"

                className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-lg transition-all duration-200 handwriting shadow-sm"

                maxLength={4}
                pattern="[0-9]{4}"
                inputMode="numeric"

              />

            </div>

            <button

              onClick={handleAccessClipboard}

              disabled={!clipboardId.trim()}

              className="w-full notebook-button text-blue-900 py-4 px-6 disabled:opacity-50 disabled:cursor-not-allowed text-lg handwriting-bold disabled:hover:transform-none"

            >

              Access Clipboard

            </button>

            {/* Recent Clipboards List */}
            <div className="mt-8">
              <h3 className="text-xl handwriting-bold text-blue-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                  📋
                </span>
                Recent Clipboards
              </h3>

              {loadingClipboards ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-blue-700 handwriting text-sm">Loading...</p>
                </div>
              ) : clipboards.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {clipboards.map((clipboard) => (
                    <div
                      key={clipboard.id}
                      onClick={() => router.push(`/clipboard/${clipboard.id}`)}
                      className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-all duration-200 shadow-sm cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <code className="font-mono bg-blue-100 text-blue-900 px-2 py-1 rounded border border-blue-300 text-sm handwriting-bold">
                              {clipboard.id}
                            </code>
                            {clipboard.files && clipboard.files.length > 0 && (
                              <span className="text-blue-700 text-sm handwriting">
                                📁 {clipboard.files.length} file{clipboard.files.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-blue-800 handwriting mb-2 line-clamp-2">
                            {getPreviewText(clipboard.content)}
                          </p>
                          <p className="text-xs text-blue-600 handwriting">
                            Created: {formatDate(clipboard.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/clipboard/${clipboard.id}`);
                          }}
                          className="ml-3 notebook-button text-blue-900 py-2 px-4 text-sm handwriting-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Open →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                  <div className="text-blue-400 text-3xl mb-3">📋</div>
                  <p className="text-blue-700 handwriting">No clipboards yet. Create one to get started!</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
