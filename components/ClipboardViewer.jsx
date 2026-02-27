'use client';
import { useState, useEffect, useRef } from 'react';

export default function ClipboardViewer({ clipboard }) {
    const [translatedText, setTranslatedText] = useState(null);
    const [showTranslated, setShowTranslated] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [targetLang, setTargetLang] = useState('');
    const [targetLangName, setTargetLangName] = useState('');
    const [languages, setLanguages] = useState({});
    const [translationError, setTranslationError] = useState('');
    const [browserLangName, setBrowserLangName] = useState('');

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [speechSpeed, setSpeechSpeed] = useState(1);
    const utteranceRef = useRef(null);

    const indianCodes = ['ta', 'hi', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'ur', 'or', 'ne', 'si'];

    const langCodeMap = {
        ta: 'ta-IN', hi: 'hi-IN', te: 'te-IN', kn: 'kn-IN',
        ml: 'ml-IN', mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN',
        pa: 'pa-IN', ur: 'ur-PK', or: 'or-IN', ne: 'ne-NP',
        si: 'si-LK', en: 'en-US', fr: 'fr-FR', de: 'de-DE',
        es: 'es-ES', pt: 'pt-BR', it: 'it-IT', nl: 'nl-NL',
        ru: 'ru-RU', ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN',
        ar: 'ar-SA', th: 'th-TH', vi: 'vi-VN', tr: 'tr-TR',
        pl: 'pl-PL', sv: 'sv-SE',
    };

    useEffect(() => {
        fetch('/api/translate')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.languages) {
                    setLanguages(data.languages);
                    const browserLang = (navigator.language || '').split('-')[0];
                    if (browserLang && browserLang !== 'en' && data.languages[browserLang]) {
                        setBrowserLangName(data.languages[browserLang]);
                    }
                }
            })
            .catch(err => console.error('Failed to load languages:', err));

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const handleSpeak = () => {
        window.speechSynthesis.cancel();

        const textToSpeak = showTranslated && translatedText ? translatedText : clipboard.content;
        if (!textToSpeak) return;

        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        if (showTranslated && targetLang) {
            utterance.lang = langCodeMap[targetLang] || targetLang;
        } else {
            utterance.lang = 'en-US';
        }

        utterance.rate = speechSpeed;
        utterance.pitch = 1;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const handlePause = () => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const handleResume = () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    const handleTranslate = async () => {
        if (!targetLang || !clipboard.content) return;

        setTranslating(true);
        setTranslationError('');

        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: clipboard.content,
                    sourceLang: 'en',
                    targetLang: targetLang,
                }),
            });
            const data = await response.json();

            if (data.success) {
                setTranslatedText(data.translatedText);
                setTargetLangName(data.targetLangName || languages[targetLang] || targetLang);
                setShowTranslated(true);
                setTranslationError('');
            } else {
                setTranslationError(data.error || 'Translation failed');
            }
        } catch (error) {
            console.error('Translation error:', error);
            setTranslationError('Translation failed. Check your internet connection.');
        } finally {
            setTranslating(false);
        }
    };

    const handleDownloadFile = async (filename, originalName) => {
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
            const textToCopy = showTranslated && translatedText ? translatedText : clipboard.content;
            await navigator.clipboard.writeText(textToCopy);
            alert('Text copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy text:', error);
            alert('Failed to copy text');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    const displayText = showTranslated && translatedText ? translatedText : clipboard.content;

    const indianLanguages = Object.entries(languages).filter(([code]) => indianCodes.includes(code));
    const internationalLanguages = Object.entries(languages).filter(([code]) => !indianCodes.includes(code) && code !== 'en');

    return (
        <div className="space-y-8">
            { }
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
                            📋 {showTranslated ? 'Copy Translated' : 'Copy Text'}
                        </button>
                    )}
                </div>

                { }
                {clipboard.content && Object.keys(languages).length > 0 && (
                    <div className="translate-bar">
                        <div className="translate-controls">
                            <span className="translate-label">🌐 Translate to:</span>
                            <select
                                value={targetLang}
                                onChange={(e) => {
                                    setTargetLang(e.target.value);
                                    setTranslatedText(null);
                                    setShowTranslated(false);
                                    setTranslationError('');
                                    handleStop();
                                }}
                                className="translate-select"
                            >
                                <option value="">-- Select Language --</option>
                                {indianLanguages.length > 0 && (
                                    <optgroup label="Indian Languages">
                                        {indianLanguages.map(([code, name]) => (
                                            <option key={code} value={code}>{name}</option>
                                        ))}
                                    </optgroup>
                                )}
                                {internationalLanguages.length > 0 && (
                                    <optgroup label="International Languages">
                                        {internationalLanguages.map(([code, name]) => (
                                            <option key={code} value={code}>{name}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                            <button
                                onClick={handleTranslate}
                                disabled={!targetLang || translating}
                                className="btn-translate"
                            >
                                {translating ? (
                                    <span className="translate-loading">
                                        <span className="translate-spinner"></span>
                                        Translating...
                                    </span>
                                ) : (
                                    '🔄 Translate'
                                )}
                            </button>
                        </div>

                        {browserLangName && !translatedText && (
                            <p className="translate-hint">
                                💡 Your browser language is <strong>{browserLangName}</strong>. Select it above to translate!
                            </p>
                        )}

                        {translationError && (
                            <p className="translate-error">❌ {translationError}</p>
                        )}

                        { }
                        {translatedText && (
                            <div className="translate-toggle">
                                <button
                                    onClick={() => { setShowTranslated(false); handleStop(); }}
                                    className={`toggle-tab ${!showTranslated ? 'toggle-tab-active' : 'toggle-tab-inactive'}`}
                                >
                                    📄 Original (English)
                                </button>
                                <button
                                    onClick={() => { setShowTranslated(true); handleStop(); }}
                                    className={`toggle-tab ${showTranslated ? 'toggle-tab-active' : 'toggle-tab-inactive'}`}
                                >
                                    🌐 {targetLangName}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                { }
                {clipboard.content && (
                    <div className="speech-bar">
                        <div className="speech-controls">
                            <span className="speech-label">🔊 Listen:</span>
                            <div className="speech-buttons">
                                {!isSpeaking ? (
                                    <button onClick={handleSpeak} className="btn-speech btn-play">
                                        ▶ Play
                                    </button>
                                ) : isPaused ? (
                                    <button onClick={handleResume} className="btn-speech btn-play">
                                        ▶ Resume
                                    </button>
                                ) : (
                                    <button onClick={handlePause} className="btn-speech btn-pause">
                                        ⏸ Pause
                                    </button>
                                )}
                                {isSpeaking && (
                                    <button onClick={handleStop} className="btn-speech btn-stop">
                                        ⏹ Stop
                                    </button>
                                )}
                            </div>
                            <div className="speed-controls">
                                <span className="speed-label">Speed:</span>
                                {[
                                    { label: 'Slow', value: 0.6 },
                                    { label: 'Normal', value: 1 },
                                    { label: 'Fast', value: 1.5 },
                                ].map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => { setSpeechSpeed(s.value); if (isSpeaking) { handleStop(); } }}
                                        className={`btn-speed ${speechSpeed === s.value ? 'btn-speed-active' : 'btn-speed-inactive'}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {isSpeaking && !isPaused && (
                            <div className="speaking-indicator">
                                <span className="wave-dot"></span>
                                <span className="wave-dot"></span>
                                <span className="wave-dot"></span>
                                <span className="speaking-text">
                                    Speaking in {showTranslated && targetLangName ? targetLangName : 'English'}...
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {clipboard.content ? (
                    <div className="viewer-content-box">
                        <pre className="viewer-pre">
                            {displayText}
                        </pre>
                    </div>
                ) : (
                    <div className="viewer-empty">
                        <div className="empty-float-icon">📝</div>
                        <p className="text-blue-700 text-lg handwriting">No text content</p>
                    </div>
                )}
            </div>
            { }
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

function getFileIcon(filename) {
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
