'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDevice } from '@/lib/DeviceContext';

interface InboxClipboard {
    id: string;
    content: string;
    files: Array<{
        filename: string;
        originalName: string;
        size: number;
    }>;
    createdAt: string;
    expiresAt: string;
}

export default function InboxPage() {
    const router = useRouter();
    const { isSetup, receiveCode, deviceName, loading: deviceLoading } = useDevice();
    const [clipboards, setClipboards] = useState<InboxClipboard[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInbox = useCallback(async () => {
        if (!receiveCode) return;

        try {
            const response = await fetch(`/api/devices/inbox?receiveCode=${encodeURIComponent(receiveCode)}`);
            const data = await response.json();

            if (data.success) {
                setClipboards(data.clipboards);
            }
        } catch (error) {
            console.error('Error fetching inbox:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [receiveCode]);

    useEffect(() => {
        if (isSetup && receiveCode) {
            fetchInbox();
        } else if (!deviceLoading && !isSetup) {
            setLoading(false);
        }
    }, [isSetup, receiveCode, deviceLoading, fetchInbox]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!isSetup || !receiveCode) return;

        const interval = setInterval(fetchInbox, 30000);
        return () => clearInterval(interval);
    }, [isSetup, receiveCode, fetchInbox]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchInbox();
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now.getTime() - date.getTime();

            // Less than 1 minute
            if (diff < 60000) {
                return 'Just now';
            }
            // Less than 1 hour
            if (diff < 3600000) {
                const minutes = Math.floor(diff / 60000);
                return `${minutes} min ago`;
            }
            // Less than 24 hours
            if (diff < 86400000) {
                const hours = Math.floor(diff / 3600000);
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            }
            // Otherwise show date
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Unknown';
        }
    };

    const getPreviewText = (content: string, maxLength: number = 100) => {
        if (!content) return '';
        return content.length > maxLength
            ? content.substring(0, maxLength) + '...'
            : content;
    };

    if (deviceLoading || loading) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="paper-card p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-900 handwriting">Loading inbox...</p>
                </div>
            </div>
        );
    }

    if (!isSetup) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="paper-card p-8 text-center">
                    <div className="text-5xl mb-4">📬</div>
                    <h2 className="text-2xl handwriting-bold text-blue-900 mb-4">Set Up Your Inbox</h2>
                    <p className="text-blue-800 mb-6 handwriting">
                        You need to set up a receive code first to have an inbox.
                    </p>
                    <button
                        onClick={() => router.push('/devices')}
                        className="notebook-button text-blue-900 py-3 px-6 handwriting-bold"
                    >
                        Set Up Receive Code →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => router.push('/')}
                className="mb-6 flex items-center space-x-2 text-blue-700 hover:text-blue-900 handwriting transition-colors"
            >
                <span>←</span>
                <span>Back to Home</span>
            </button>

            {/* Title */}
            <div className="text-center mb-8 animate-fadeIn">
                <div className="inline-block paper-card px-8 py-4">
                    <h1 className="text-4xl handwriting-bold text-blue-900">
                        📬 My Inbox
                    </h1>
                </div>
            </div>

            {/* Subtitle */}
            <p className="text-lg text-blue-800 text-center mb-4 handwriting">
                Files and text sent to <strong>{deviceName}</strong>
            </p>

            {/* Refresh Button */}
            <div className="flex justify-center mb-6">
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg handwriting transition-colors disabled:opacity-50"
                >
                    <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
                    <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
            </div>

            {/* Inbox List */}
            {clipboards.length === 0 ? (
                <div className="paper-card p-8 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-xl handwriting-bold text-blue-900 mb-2">No Messages Yet</h3>
                    <p className="text-blue-700 handwriting mb-4">
                        When someone sends files to your receive code, they'll appear here.
                    </p>
                    <p className="text-sm text-blue-600 handwriting">
                        Share your link: <code className="bg-blue-100 px-2 py-1 rounded font-mono">/send/{receiveCode}</code>
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-blue-600 handwriting text-center mb-4">
                        {clipboards.length} clipboard{clipboards.length !== 1 ? 's' : ''} received
                    </p>

                    {clipboards.map((clipboard) => (
                        <div
                            key={clipboard.id}
                            onClick={() => router.push(`/clipboard/${clipboard.id}`)}
                            className="paper-card p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    {/* Time stamp */}
                                    <p className="text-xs text-blue-500 handwriting mb-2">
                                        {formatDate(clipboard.createdAt)}
                                    </p>

                                    {/* Content preview */}
                                    {clipboard.content && (
                                        <p className="text-blue-900 handwriting mb-2 line-clamp-2">
                                            {getPreviewText(clipboard.content)}
                                        </p>
                                    )}

                                    {/* Files */}
                                    {clipboard.files.length > 0 && (
                                        <div className="flex items-center space-x-2 text-sm text-blue-700 handwriting">
                                            <span>📁</span>
                                            <span>
                                                {clipboard.files.length} file{clipboard.files.length > 1 ? 's' : ''}
                                                {clipboard.files.length === 1 && (
                                                    <span className="text-blue-500"> — {clipboard.files[0].originalName}</span>
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {/* Empty clipboard */}
                                    {!clipboard.content && clipboard.files.length === 0 && (
                                        <p className="text-blue-400 handwriting italic">Empty clipboard</p>
                                    )}
                                </div>

                                {/* ID badge */}
                                <div className="ml-4 flex-shrink-0">
                                    <code className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-sm font-mono border border-blue-200">
                                        #{clipboard.id}
                                    </code>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
