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
        <div className="paper-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-900 handwriting">Loading clipboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="paper-card p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-2xl handwriting-bold text-blue-900 mb-4">Error</h2>
          <p className="text-blue-800 mb-6 handwriting">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="notebook-button text-blue-900 py-2 px-4 handwriting-bold"
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
        <div className="paper-card p-8 text-center">
          <div className="text-blue-400 text-4xl mb-4">📋</div>
          <h2 className="text-2xl handwriting-bold text-blue-900 mb-4">Clipboard Not Found</h2>
          <p className="text-blue-800 mb-6 handwriting">The clipboard you&apos;re looking for doesn&apos;t exist or has expired.</p>
          <button
            onClick={() => router.push('/')}
            className="notebook-button text-blue-900 py-2 px-4 handwriting-bold"
          >
            Create New Clipboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Title */}
      <div className="text-center mb-12 animate-fadeIn py-4">
        <div className="inline-block paper-card title-padding">
          <h1 className="text-5xl handwriting-bold text-blue-900">
            📓 Clipboard
          </h1>
        </div>
      </div>

      {/* Subtitle */}
      <p className="subtitle handwriting">
        Viewing clipboard with ID: <code className="font-mono bg-blue-100 text-blue-900 p-1 rounded-md border border-blue-300">{id}</code>
      </p>

      <div className="lg-grid-cols-3">
        {/* Main Content */}
        <div className="lg-col-span-2">
          {clipboard && <ClipboardViewer clipboard={clipboard} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-8 mt-8 lg-mt-0">
          {/* Details Card */}
          <div className="paper-card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h3 className="handwriting-bold text-blue-900 mb-6 text-2xl flex items-center">
              <span className="icon-container-sm icon-blue mr-3">
                <span className="text-blue-900 text-sm">ℹ️</span>
              </span>
              Details
            </h3>

            {/* Info Grid */}
            <div className="grid-cols-1 gap-4 text-blue-900 mb-8 space-y-3">
              <div className="list-item-container" style={{ justifyContent: 'flex-start' }}>
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></span>
                <div className="handwriting break-all"><span className="handwriting-bold">Created:</span> {formatDate(clipboard.createdAt)}</div>
              </div>
              <div className="list-item-container" style={{ justifyContent: 'flex-start' }}>
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 flex-shrink-0"></span>
                <div className="handwriting break-all"><span className="handwriting-bold">Last accessed:</span> {formatDate(clipboard.lastAccessed)}</div>
              </div>
              <div className="list-item-container" style={{ justifyContent: 'flex-start' }}>
                <span className="w-2 h-2 bg-red-400 rounded-full mr-3 flex-shrink-0"></span>
                <div className="handwriting break-all"><span className="handwriting-bold">Expires:</span> {clipboard.expiresAt ? formatDate(clipboard.expiresAt) : 'Unknown'}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCopyId}
                className="w-full text-center notebook-button text-blue-900 py-3 px-6 handwriting-bold"
              >
                📋 Copy ID
              </button>
              <button
                onClick={handleShareUrl}
                className="w-full text-center notebook-button text-blue-900 py-3 px-6 handwriting-bold"
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
