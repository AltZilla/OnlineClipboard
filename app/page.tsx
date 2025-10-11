'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClipboardForm from '@/components/ClipboardForm';
import FileUpload from '@/components/FileUpload';

export default function Home() {
  const [clipboardId, setClipboardId] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleCreateClipboard = async (content: string) => {
    setLoading(true);
    try {
      // Create clipboard with content
      const response = await fetch('/api/clipboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      
      if (data.success) {
        const clipboardId = data.clipboard.id;
        
        // Upload files if any
        if (files.length > 0) {
          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadResponse = await fetch(`/api/clipboard/${clipboardId}/upload`, {
              method: 'POST',
              body: formData,
            });
            
            if (!uploadResponse.ok) {
              console.warn(`Failed to upload file: ${file.name}`);
            }
          }
        }
        
        router.push(`/clipboard/${clipboardId}`);
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

  const handleFileUpload = (file: File) => {
    setFiles(prev => [...prev, file]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAccessClipboard = () => {
    if (clipboardId.trim()) {
      router.push(`/clipboard/${clipboardId.trim()}`);
    }
  };

    return (

      <div className="w-full">

                    {/* Sticky Title */}

                    <div className="text-center mb-12 animate-fadeIn sticky top-3 z-10 py-4">

                      <div className="inline-block bg-white/10 backdrop-blur-lg rounded-full shadow-lg border border-white/20 px-8 py-4">

                          <h1 className="text-5xl font-bold text-white">

                            Online Clipboard

                          </h1>

                      </div>

                    </div>

              

                    {/* Subtitle */}

                    <p className="text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed text-center -mt-12 mb-12">

                      Share text and files between devices with a unique ID

                    </p>

  

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">

          {/* Create New Clipboard */}

          <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 animate-slideIn">

            <div className="flex items-center mb-6">

              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">

                <span className="text-2xl">✨</span>

              </div>

              <h2 className="text-3xl font-bold text-white">

                Create New Clipboard

              </h2>

            </div>

            <ClipboardForm 

              onSubmit={handleCreateClipboard}

              loading={loading}

              placeholder="Enter text to share..."

              buttonText="Create Clipboard"

            />

            

            {/* File Upload Section */}

            <div className="mt-8">

              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">

                <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">

                  📁

                </span>

                Upload Files (Optional)

              </h3>

              <FileUpload onFileUpload={handleFileUpload} />

              

              {/* Selected Files */}

              {files.length > 0 && (

                <div className="mt-6 animate-fadeIn">

                  <h4 className="text-lg font-medium text-white/90 mb-4">

                    Selected Files ({files.length}):

                  </h4>

                  <div className="space-y-3">

                    {files.map((file, index) => (

                      <div key={index} className="flex items-center justify-between bg-black/10 backdrop-blur-lg border border-white/20 p-3 rounded-xl hover:bg-black/20 transition-all duration-200">

                        <div className="flex items-center space-x-3 truncate">

                          <span className="text-lg">📄</span>

                          <div className="truncate">

                            <span className="text-sm font-medium text-white truncate">{file.name}</span>

                            <span className="text-xs text-white/70 block">

                              {(file.size / 1024 / 1024).toFixed(2)} MB

                            </span>

                          </div>

                        </div>

                        <button

                          onClick={() => removeFile(index)}

                          className="text-red-400 hover:text-red-500 text-lg hover:scale-110 transition-transform duration-200"

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

          <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>

            <div className="flex items-center mb-6">

              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">

                <span className="text-2xl">🔍</span>

              </div>

              <h2 className="text-3xl font-bold text-white">

                Access Existing Clipboard

              </h2>

            </div>

            <div className="space-y-6">

              <div>

                <label htmlFor="clipboardId" className="block text-lg font-semibold text-white mb-3">

                  Clipboard ID

                </label>

                <input

                  type="text"

                  id="clipboardId"

                  value={clipboardId}

                  onChange={(e) => setClipboardId(e.target.value)}

                  placeholder="Enter 8-character ID"

                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-lg transition-all duration-200"

                  maxLength={8}

                />

              </div>

              <button

                onClick={handleAccessClipboard}

                disabled={!clipboardId.trim()}

                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"

              >

                Access Clipboard

              </button>

            </div>

          </div>

        </div>

      </div>
  );
}
