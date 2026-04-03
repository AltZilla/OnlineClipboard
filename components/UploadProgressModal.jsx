'use client';
import { useState } from 'react';

export default function UploadProgressModal({ session, onClose, onRetry, onContinue }) {
    const [showCompleted, setShowCompleted] = useState(false);

    if (!session || !session.isOpen) return null;

    const { files } = session;

    const completedFiles = files.filter(f => f.status === 'done');
    const failedFiles = files.filter(f => f.status === 'error');
    const activeFiles = files.filter(f => f.status === 'uploading');
    const pendingFiles = files.filter(f => f.status === 'pending');
    const allDone = files.every(f => f.status === 'done' || f.status === 'error');
    const hasErrors = failedFiles.length > 0;

    const totalChunksAll = files.reduce((sum, f) => sum + (f.totalChunks || 0), 0);
    const uploadedChunksAll = files.reduce((sum, f) => sum + (f.chunksUploaded || 0), 0);
    const overallPercent = totalChunksAll > 0 ? Math.min(100, Math.round((uploadedChunksAll / totalChunksAll) * 100)) : 0;

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFilePercent = (file) => {
        if (file.status === 'done') return 100;
        if (file.totalChunks === 0) return 0;
        return Math.min(100, Math.round((file.chunksUploaded / file.totalChunks) * 100));
    };

    return (
        <div className="upm-overlay" onClick={allDone && !hasErrors ? onClose : undefined}>
            <div className="upm-modal" onClick={(e) => e.stopPropagation()}>

                {/* ─── Header ─── */}
                <div className="upm-header">
                    <div className="upm-header-left">
                        <div className={`upm-header-icon ${allDone ? (hasErrors ? 'icon-warn' : 'icon-done') : 'icon-active'}`}>
                            {allDone ? (hasErrors ? '⚠️' : '✅') : '📤'}
                        </div>
                        <div>
                            <h3 className="upm-title">
                                {allDone
                                    ? (hasErrors ? 'Upload incomplete' : 'All done!')
                                    : 'Uploading...'}
                            </h3>
                            <p className="upm-subtitle">
                                {allDone
                                    ? (hasErrors
                                        ? `${completedFiles.length} succeeded, ${failedFiles.length} failed`
                                        : `${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`)
                                    : `${completedFiles.length} of ${files.length} files complete`}
                            </p>
                        </div>
                    </div>
                    {allDone && !hasErrors && (
                        <button className="upm-close" onClick={onClose} aria-label="Close">✕</button>
                    )}
                </div>

                {/* ─── Big progress bar ─── */}
                <div className="upm-progress-section">
                    <div className="upm-big-bar-track">
                        <div
                            className={`upm-big-bar-fill ${allDone ? (hasErrors ? 'fill-warn' : 'fill-done') : ''}`}
                            style={{ width: `${overallPercent}%` }}
                        />
                    </div>
                    <div className="upm-progress-label">
                        <span>{overallPercent}%</span>
                        {!allDone && activeFiles.length > 0 && (
                            <span className="upm-parallel-badge">
                                {activeFiles.length} file{activeFiles.length > 1 ? 's' : ''} in parallel
                            </span>
                        )}
                    </div>
                </div>

                {/* ─── Scrollable body ─── */}
                <div className="upm-body">
                    {/* ─── Active uploads ─── */}
                    {activeFiles.length > 0 && (
                    <div className="upm-section">
                        <div className="upm-section-label">Uploading now</div>
                        <div className="upm-file-list">
                            {activeFiles.map((file, i) => (
                                <div key={`active-${i}`} className="upm-file upm-file-active">
                                    <div className="upm-file-row">
                                        <span className="upm-file-icon">📤</span>
                                        <div className="upm-file-meta">
                                            <span className="upm-file-name">{file.name}</span>
                                            <span className="upm-file-detail">{formatFileSize(file.size)} · {getFilePercent(file)}%</span>
                                        </div>
                                    </div>
                                    <div className="upm-mini-bar-track">
                                        <div className="upm-mini-bar-fill" style={{ width: `${getFilePercent(file)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── Pending (waiting) ─── */}
                {pendingFiles.length > 0 && (
                    <div className="upm-section">
                        <div className="upm-section-label">
                            Waiting ({pendingFiles.length})
                        </div>
                        <div className="upm-pending-list">
                            {pendingFiles.slice(0, 3).map((file, i) => (
                                <div key={`pending-${i}`} className="upm-pending-item">
                                    <span className="upm-pending-icon">⏳</span>
                                    <span className="upm-pending-name">{file.name}</span>
                                    <span className="upm-pending-size">{formatFileSize(file.size)}</span>
                                </div>
                            ))}
                            {pendingFiles.length > 3 && (
                                <div className="upm-pending-more">
                                    + {pendingFiles.length - 3} more file{pendingFiles.length - 3 > 1 ? 's' : ''} waiting
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── Errors ─── */}
                {failedFiles.length > 0 && (
                    <div className="upm-section">
                        <div className="upm-section-label upm-label-error">
                            Failed ({failedFiles.length})
                        </div>
                        <div className="upm-file-list">
                            {failedFiles.map((file, i) => (
                                <div key={`error-${i}`} className="upm-file upm-file-error">
                                    <div className="upm-file-row">
                                        <span className="upm-file-icon">❌</span>
                                        <div className="upm-file-meta">
                                            <span className="upm-file-name">{file.name}</span>
                                            <span className="upm-file-detail upm-error-msg">{file.errorMessage || 'Upload failed'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── Completed (collapsible) ─── */}
                {completedFiles.length > 0 && (
                    <div className="upm-section">
                        <button
                            className="upm-section-toggle"
                            onClick={() => setShowCompleted(!showCompleted)}
                        >
                            <span className="upm-section-label upm-label-done">
                                ✅ Completed ({completedFiles.length})
                            </span>
                            <span className={`upm-toggle-arrow ${showCompleted ? 'arrow-open' : ''}`}>▾</span>
                        </button>
                        {showCompleted && (
                            <div className="upm-completed-list">
                                {completedFiles.map((file, i) => (
                                    <div key={`done-${i}`} className="upm-completed-item">
                                        <span className="upm-completed-name">{file.name}</span>
                                        <span className="upm-completed-size">{formatFileSize(file.size)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                </div>

                {/* ─── Footer ─── */}
                {allDone && hasErrors && (
                    <div className="upm-footer upm-footer-error">
                        <p className="upm-footer-msg">
                            {failedFiles.length} file{failedFiles.length > 1 ? 's' : ''} couldn&apos;t be uploaded after automatic retries.
                        </p>
                        <div className="upm-footer-actions">
                            <button className="upm-btn upm-btn-primary" onClick={onRetry}>
                                🔄 Retry failed
                            </button>
                            <button className="upm-btn upm-btn-ghost" onClick={onContinue}>
                                Skip &amp; continue →
                            </button>
                        </div>
                    </div>
                )}
                {allDone && !hasErrors && (
                    <div className="upm-footer upm-footer-done">
                        <div className="upm-footer-done-row">
                            <span className="upm-footer-check">✓</span>
                            <span className="upm-footer-msg">Redirecting to your clipboard...</span>
                        </div>
                    </div>
                )}
                {!allDone && (
                    <div className="upm-footer">
                        <div className="upm-footer-active-row">
                            <span className="upm-spinner" />
                            <span className="upm-footer-msg">Don&apos;t close this tab</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
