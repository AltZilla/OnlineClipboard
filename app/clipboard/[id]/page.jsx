'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QrCodeCard from '@/components/QrCodeCard';
import ClipboardViewer from '@/components/ClipboardViewer';
export default function ClipboardPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [clipboard, setClipboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shareUrl, setShareUrl] = useState('');
    useEffect(() => {
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
    const formatDate = (dateString) => {
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
        <div className="clipboard-page-container">
            { }
            <div className="hero-section">
                <div className="hero-card">
                    <h1 className="hero-title">
                        📓 Clipboard
                    </h1>
                </div>
            </div>
            { }
            <p className="clipboard-page-subtitle">
                Viewing clipboard with ID: <code className="clipboard-id-badge">{id}</code>
            </p>
            <div className="clipboard-layout">
                { }
                <div className="main-content-col">
                    {clipboard && <ClipboardViewer clipboard={clipboard} />}
                </div>
                { }
                <div className="sidebar-col">
                    { }
                    <div className="details-card">
                        <h3 className="details-title">
                            <span className="viewer-icon">
                                <span className="text-blue-900 text-sm">ℹ️</span>
                            </span>
                            Details
                        </h3>
                        { }
                        <div className="details-grid">
                            <div className="detail-item">
                                <span className="status-dot dot-green"></span>
                                <div className="detail-text"><span className="handwriting-bold">Created:</span> {formatDate(clipboard.createdAt)}</div>
                            </div>
                            <div className="detail-item">
                                <span className="status-dot dot-yellow"></span>
                                <div className="detail-text"><span className="handwriting-bold">Last accessed:</span> {formatDate(clipboard.lastAccessed)}</div>
                            </div>
                            <div className="detail-item">
                                <span className="status-dot dot-red"></span>
                                <div className="detail-text"><span className="handwriting-bold">Expires:</span> {clipboard.expiresAt ? formatDate(clipboard.expiresAt) : 'Unknown'}</div>
                            </div>
                        </div>
                        { }
                        <div className="sidebar-actions">
                            <button
                                onClick={handleCopyId}
                                className="btn-sidebar"
                            >
                                📋 Copy ID
                            </button>
                            <button
                                onClick={handleShareUrl}
                                className="btn-sidebar"
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
