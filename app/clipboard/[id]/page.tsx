'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QrCodeCard from '@/components/QrCodeCard';

import ClipboardViewer from '@/components/ClipboardViewer';
import { ClipboardData } from '@/lib/storage-mongodb';

export default function ClipboardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // Ensure window is defined (runs only on client-side)
    setShareUrl(window.location.href);
  }, []);

  const fetchClipboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clipboard/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setClipboard(data.clipboard);
        setError(null);
      } else {
        setError(data.error || 'Clipboard not found');
      }
    } catch (error) {
      console.error('Error fetching clipboard:', error);
      setError('Failed to load clipboard');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchClipboard();
    }
  }, [id, fetchClipboard]);



  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    alert('Clipboard ID copied to clipboard!');
  };

  const handleShareUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Share URL copied to clipboard!');
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clipboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!clipboard) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-gray-500 text-4xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Clipboard Not Found</h2>
          <p className="text-gray-600 mb-6">The clipboard you&apos;re looking for doesn&apos;t exist or has expired.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create New Clipboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Sticky Title */}
      <div className="text-center mb-12 animate-fadeIn sticky top-3 z-10 py-4">
        <div className="inline-block bg-white/10 backdrop-blur-lg rounded-full shadow-lg border border-white/20 px-8 py-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              Clipboard
            </h1>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-lg text-white/80 max-w-2xl mx-auto text-center -mt-12 mb-12">
        Viewing clipboard with ID: <code className="font-mono bg-black/20 text-white/90 p-1 rounded-md">{id}</code>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {clipboard && <ClipboardViewer clipboard={clipboard} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-8 mt-8 lg:mt-0">
          {/* Details Card */}
                              <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
                                <h3 className="font-bold text-white mb-6 text-2xl flex items-center">
                                  <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">ℹ️</span>
                                  </span>
                                  Details
                                </h3>
                                
                                {/* Info Grid */}
                                <div className="grid grid-cols-1 gap-4 text-white/90 mb-8">
                                  <div className="flex items-center p-3 bg-black/10 rounded-xl">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                                    <div><span className="font-semibold">Created:</span> {formatDate(clipboard.createdAt)}</div>
                                  </div>
                                  <div className="flex items-center p-3 bg-black/10 rounded-xl">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                                    <div><span className="font-semibold">Last accessed:</span> {formatDate(clipboard.lastAccessed)}</div>
                                  </div>
                                  <div className="flex items-center p-3 bg-black/10 rounded-xl">
                                    <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                                    <div><span className="font-semibold">Expires:</span> {clipboard.expiresAt ? formatDate(clipboard.expiresAt) : 'Unknown'}</div>
                                  </div>
                                </div>
                    
                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3">
                                  <button
                                    onClick={handleCopyId}
                                    className="w-full text-center bg-white/20 backdrop-blur-lg border border-white/30 text-white py-3 px-6 rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 transform hover:scale-105 font-semibold"
                                  >
                                    📋 Copy ID
                                  </button>
                                  <button
                                    onClick={handleShareUrl}
                                    className="w-full text-center bg-white/20 backdrop-blur-lg border border-white/30 text-white py-3 px-6 rounded-xl hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 transform hover:scale-105 font-semibold"
                                  >
                                    🔗 Share URL
                                  </button>
                                </div>
                              </div>
                              <QrCodeCard url={shareUrl} />
                            </div>
                          </div>
    </div>
  );
}
