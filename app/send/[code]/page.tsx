'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import ClipboardForm from '@/components/ClipboardForm';

interface DeviceInfo {
    deviceName: string;
    receiveCode: string;
    hasPush: boolean;
}

export default function SendToDevicePage() {
    const params = useParams();
    const router = useRouter();
    const code = (params.code as string)?.toLowerCase().trim();

    const [device, setDevice] = useState<DeviceInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [sentClipboardId, setSentClipboardId] = useState<string | null>(null);

    useEffect(() => {
        if (code) {
            checkDevice();
        }
    }, [code]);

    const checkDevice = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/devices?receiveCode=${encodeURIComponent(code)}`);
            const data = await response.json();

            if (data.success) {
                setDevice(data.device);
                setError(null);
            } else {
                setError('No device found with this receive code');
            }
        } catch (err) {
            setError('Failed to check device');
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

    const handleSend = async (content: string) => {
        if (!content.trim() && files.length === 0) {
            alert('Please add text content or upload at least one file.');
            return;
        }

        setSending(true);

        try {
            // 1. Create the clipboard with the receive code
            const response = await fetch('/api/clipboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, isPublic: false, sentToReceiveCode: code })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to create clipboard');
            }

            const clipboardId = data.clipboard.id;

            // 2. Upload files if any
            if (files.length > 0) {
                for (const file of files) {
                    const formData = new FormData();
                    formData.append('file', file);

                    await fetch(`/api/clipboard/${clipboardId}/upload`, {
                        method: 'POST',
                        body: formData
                    });
                }
            }

            // 3. Send notification to the device
            await fetch('/api/devices/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clipboardId, receiveCode: code })
            });

            setSent(true);
            setSentClipboardId(clipboardId);
            setFiles([]);

        } catch (err: any) {
            alert(err.message || 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="paper-card p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-900 handwriting">Checking device...</p>
                </div>
            </div>
        );
    }

    if (error || !device) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="paper-card p-8 text-center">
                    <div className="text-red-500 text-5xl mb-4">❌</div>
                    <h2 className="text-2xl handwriting-bold text-blue-900 mb-4">Device Not Found</h2>
                    <p className="text-blue-800 mb-6 handwriting">
                        No device is registered with the code "<code className="font-mono bg-blue-100 px-2 py-1 rounded">{code}</code>"
                    </p>
                    <p className="text-blue-700 text-sm handwriting mb-6">
                        Make sure the device owner has set up their receive code correctly.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="notebook-button text-blue-900 py-2 px-6 handwriting-bold"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (sent) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="paper-card p-8 text-center">
                    <div className="text-green-500 text-5xl mb-4">✅</div>
                    <h2 className="text-2xl handwriting-bold text-blue-900 mb-4">Sent Successfully!</h2>
                    <p className="text-blue-800 mb-2 handwriting">
                        Your clipboard has been sent to <strong>{device.deviceName}</strong>
                    </p>
                    {device.hasPush && (
                        <p className="text-green-600 text-sm handwriting mb-4">
                            🔔 They'll receive a notification!
                        </p>
                    )}

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-700 handwriting mb-2">Clipboard ID:</p>
                        <code className="font-mono text-lg bg-blue-100 text-blue-900 px-3 py-1 rounded border border-blue-300">
                            {sentClipboardId}
                        </code>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => {
                                setSent(false);
                                setSentClipboardId(null);
                            }}
                            className="notebook-button text-blue-900 py-2 px-6 handwriting-bold"
                        >
                            Send Another
                        </button>
                        <button
                            onClick={() => router.push(`/clipboard/${sentClipboardId}`)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg handwriting-bold transition-colors"
                        >
                            View Clipboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Title */}
            <div className="text-center mb-8 animate-fadeIn">
                <div className="inline-block paper-card px-8 py-4">
                    <h1 className="text-3xl sm:text-4xl handwriting-bold text-blue-900">
                        📤 Send to {device.deviceName}
                    </h1>
                </div>
            </div>

            {/* Subtitle */}
            <p className="text-lg text-blue-800 text-center mb-8 handwriting">
                Upload files or text to send directly to this device
            </p>

            {/* Send Form */}
            <div className="paper-card p-6 animate-slideIn">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center mr-4 shadow-md">
                        <span className="text-2xl">📱</span>
                    </div>
                    <div>
                        <h2 className="text-xl handwriting-bold text-blue-900">{device.deviceName}</h2>
                        <p className="text-sm text-blue-600 handwriting">
                            {device.hasPush ? '🔔 Will receive notification' : '📋 Will see in app'}
                        </p>
                    </div>
                </div>

                {/* Text Content */}
                <ClipboardForm
                    onSubmit={handleSend}
                    loading={sending}
                    placeholder="Enter text to send..."
                    buttonText={sending ? 'Sending...' : `Send to ${device.deviceName}`}
                />

                {/* File Upload */}
                <div className="mt-6">
                    <h3 className="text-lg handwriting-bold text-blue-900 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                            📁
                        </span>
                        Upload Files (Optional)
                    </h3>
                    <FileUpload onFileUpload={handleFileUpload} />

                    {/* Selected Files */}
                    {files.length > 0 && (
                        <div className="mt-4 animate-fadeIn">
                            <h4 className="text-md handwriting-bold text-blue-900 mb-3">
                                Files to send ({files.length}):
                            </h4>
                            <div className="space-y-2">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 p-3 rounded-lg">
                                        <div className="flex items-center space-x-3 truncate">
                                            <span className="text-lg">📄</span>
                                            <div className="truncate">
                                                <span className="text-sm handwriting-bold text-blue-900">{file.name}</span>
                                                <span className="text-xs text-blue-700 block">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-red-600 hover:text-red-700 text-lg handwriting-bold"
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

            {/* Back Link */}
            <div className="text-center mt-6">
                <button
                    onClick={() => router.push('/')}
                    className="text-blue-700 hover:text-blue-900 handwriting underline"
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
}
