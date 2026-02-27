'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClipboardForm from '@/components/ClipboardForm';
import FileUpload from '@/components/FileUpload';
export default function Home() {
    const [clipboardId, setClipboardId] = useState('');
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [clipboards, setClipboards] = useState([]);
    const [loadingClipboards, setLoadingClipboards] = useState(true);
    const [isPublic, setIsPublic] = useState(false);
    const router = useRouter();
    const handleCreateClipboard = async (content) => {
        if (!content.trim() && files.length === 0) {
            alert('Please add text content or upload at least one file to create a clipboard.');
            return;
        }
        console.log('Creating clipboard with isPublic:', isPublic);
        setLoading(true);
        try {
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
                if (files.length > 0) {
                    const failedUploads = [];
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
                    if (failedUploads.length > 0) {
                        const failedList = failedUploads.map(f => `• ${f.name}: ${f.error}`).join('\n');
                        alert(`The following files could not be uploaded:\n\n${failedList}\n\nThe clipboard was created but these files are missing.`);
                    }
                }
                setFiles([]);
                setIsPublic(false);
                await new Promise(resolve => setTimeout(resolve, 500));
                await fetchClipboards();
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
    const handleFileUpload = (newFiles) => {
        setFiles(prev => [...prev, ...newFiles]);
    };
    const removeFile = (index) => {
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
            const response = await fetch('/api/clipboard?all=true&public=true');
            const data = await response.json();
            console.log('Fetched clipboards:', data.clipboards?.length || 0, 'clipboards');
            if (data.success && data.clipboards) {
                console.log('Setting clipboards:', data.clipboards.map((c) => ({ id: c.id, isPublic: c.isPublic })));
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
    const formatDate = (dateString) => {
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
    const getPreviewText = (content, maxLength = 50) => {
        if (!content) return 'No content';
        return content.length > maxLength
            ? content.substring(0, maxLength) + '...'
            : content;
    };
    return (
        <div className="home-container">
            { }
            <div className="hero-section">
                <div className="hero-card">
                    <h1 className="hero-title">
                        📓 Online Clipboard
                    </h1>
                </div>
            </div>
            { }
            <p className="hero-subtitle">
                Share text and files between devices with a unique ID
            </p>
            <div className="dashboard-grid">
                { }
                <div className="clipboard-card create-card">
                    <div className="card-header">
                        <div className="card-icon icon-create">
                            <span className="text-2xl">✨</span>
                        </div>
                        <h2 className="card-title">
                            Create New Clipboard
                        </h2>
                    </div>
                    <ClipboardForm
                        onSubmit={handleCreateClipboard}
                        loading={loading}
                        placeholder="Enter text to share..."
                        buttonText="Create Clipboard"
                    />
                    { }
                    <div className="public-toggle-container">
                        <div className="toggle-info">
                            <span>🌐</span>
                            <div>
                                <label htmlFor="publicToggle" className="toggle-label">
                                    Make Public (Show in Recent Clipboards)
                                </label>
                                <p className="toggle-description">
                                    Allow this clipboard to appear in the Recent Clipboards list
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            className={`toggle-switch-btn ${isPublic ? 'toggle-bg-on' : 'toggle-bg-off'
                                }`}
                            role="switch"
                            aria-checked={isPublic}
                            aria-label="Toggle public visibility"
                        >
                            <span
                                className={`toggle-dot ${isPublic ? 'toggle-dot-on' : 'toggle-dot-off'
                                    }`}
                            />
                        </button>
                    </div>
                    { }
                    <div className="file-section">
                        <h3 className="section-title">
                            <span className="section-icon icon-files">
                                <span className="text-sm">📁</span>
                            </span>
                            Upload Files (Optional)
                        </h3>
                        <FileUpload onFileUpload={handleFileUpload} />
                        { }
                        {files.length > 0 && (
                            <div className="selected-files-container">
                                <h4 className="selected-files-title">
                                    Selected Files ({files.length}):
                                </h4>
                                <div className="files-list">
                                    {files.map((file, index) => (
                                        <div key={index} className="file-item">
                                            <div className="file-info">
                                                <span>📄</span>
                                                <div className="file-details">
                                                    <span className="file-name">{file.name}</span>
                                                    <span className="file-size">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="close-button handwriting-bold"
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
                { }
                <div className="clipboard-card access-card">
                    <div className="card-header">
                        <div className="card-icon icon-access">
                            <span className="text-2xl">🔍</span>
                        </div>
                        <h2 className="card-title">
                            Access Existing Clipboard
                        </h2>
                    </div>
                    <div className="clipboard-form-group">
                        <div>
                            <label htmlFor="clipboardId" className="clipboard-label">
                                Clipboard ID
                            </label>
                            <input
                                type="text"
                                id="clipboardId"
                                value={clipboardId}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setClipboardId(value);
                                }}
                                placeholder="Enter 4-digit ID"
                                className="clipboard-input"
                                maxLength={4}
                                pattern="[0-9]{4}"
                                inputMode="numeric"
                            />
                        </div>
                        <button
                            onClick={handleAccessClipboard}
                            disabled={!clipboardId.trim()}
                            className="btn-access"
                        >
                            Access Clipboard
                        </button>
                        <div className="file-section">
                            <h3 className="section-title">
                                <span className="section-icon icon-recent">
                                    <span className="text-sm">📋</span>
                                </span>
                                Recent Clipboards
                            </h3>
                            {loadingClipboards ? (
                                <div className="loading-container">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <p className="text-blue-700 handwriting text-sm">Loading...</p>
                                </div>
                            ) : clipboards.length > 0 ? (
                                <div className="recent-clipboards-list">
                                    {clipboards.map((clipboard) => (
                                        <div
                                            key={clipboard.id}
                                            onClick={() => router.push(`/clipboard/${clipboard.id}`)}
                                            className="recent-item"
                                        >
                                            <div className="recent-item-content">
                                                <div className="recent-item-info">
                                                    <div className="recent-header">
                                                        <code className="clipboard-badge">
                                                            {clipboard.id}
                                                        </code>
                                                        {clipboard.files && clipboard.files.length > 0 && (
                                                            <span className="file-count">
                                                                📁 {clipboard.files.length} file{clipboard.files.length > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="recent-preview">
                                                        {getPreviewText(clipboard.content)}
                                                    </p>
                                                    <p className="recent-date">
                                                        Created: {formatDate(clipboard.createdAt)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/clipboard/${clipboard.id}`);
                                                    }}
                                                    className="btn-open"
                                                >
                                                    Open →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
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
