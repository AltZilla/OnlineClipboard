'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDevice } from '@/lib/DeviceContext';
import { QRCodeSVG } from 'qrcode.react';

export default function DeviceModal() {
    const router = useRouter();
    const {
        receiveCode,
        deviceName,
        isSetup,
        setupDevice,
        pushSupported,
        pushEnabled,
        requestPushPermission,
        loading,
        getReceiveUrl
    } = useDevice();

    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'view' | 'setup'>('view');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isSetup) {
            setMode('view');
            setName(deviceName);
            setCode(receiveCode || '');
        } else {
            setMode('setup');
        }
    }, [isSetup, deviceName, receiveCode]);

    const handleSetup = async () => {
        if (!name.trim()) {
            setError('Please enter a device name');
            return;
        }
        if (code.length < 3) {
            setError('Receive code must be at least 3 characters');
            return;
        }

        setSaving(true);
        setError('');

        const result = await setupDevice(code.trim(), name.trim());

        if (result.success) {
            setMode('view');
        } else {
            setError(result.error || 'Failed to set up device');
        }

        setSaving(false);
    };

    const handleCopyLink = () => {
        const url = getReceiveUrl();
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEnablePush = async () => {
        setSaving(true);
        await requestPushPermission();
        setSaving(false);
    };

    if (loading) {
        return (
            <button
                style={{ position: 'fixed', top: '1rem', right: '1rem' }}
                className="z-50 w-12 h-12 notebook-button rounded-full flex items-center justify-center shadow-lg animate-pulse"
            >
                <span className="text-xl">📲</span>
            </button>
        );
    }

    return (
        <>
            {/* Floating Button - Notebook style */}
            <button
                onClick={() => setIsOpen(true)}
                style={{ position: 'fixed', top: '1rem', right: '1rem' }}
                className={`z-50 px-4 py-2 notebook-button rounded-full flex items-center space-x-2 shadow-lg transition-all duration-200 hover:scale-105 ${isSetup ? 'border-green-500' : 'border-purple-500'}`}
            >
                <span className="text-lg">{isSetup ? '📲' : '🔗'}</span>
                <span className="handwriting-bold text-sm hidden sm:inline text-blue-900">
                    {isSetup ? deviceName : 'Set Up'}
                </span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content - Paper Card Style */}
                    <div className="relative w-full max-w-md paper-card rounded-lg overflow-hidden animate-fadeIn">
                        {/* Header - Colored tape/strip */}
                        <div className={`p-4 ${isSetup ? 'bg-green-100 border-b-2 border-green-300' : 'bg-purple-100 border-b-2 border-purple-300'}`}>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl handwriting-bold text-blue-900 flex items-center space-x-2">
                                    <span>{isSetup ? '📲' : '🔗'}</span>
                                    <span>{isSetup ? 'My Device' : 'Set Up Device'}</span>
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors text-gray-600 hover:text-gray-800 handwriting-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto bg-[#fffef7]">
                            {mode === 'view' && isSetup ? (
                                <>
                                    {/* Device Info */}
                                    <div className="text-center mb-6">
                                        <p className="text-2xl handwriting-bold text-blue-900">{deviceName}</p>
                                        <p className="text-sm text-green-600 handwriting">✓ Ready to receive files</p>
                                    </div>

                                    {/* Receive Link */}
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                                        <p className="text-xs text-blue-700 handwriting mb-2">📎 Your receive link:</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-xs font-mono bg-white px-2 py-1 rounded border border-blue-300 text-blue-900 truncate">
                                                {getReceiveUrl()}
                                            </code>
                                            <button
                                                onClick={handleCopyLink}
                                                className={`px-3 py-1 rounded-lg handwriting-bold text-sm transition-all notebook-button ${copied ? 'bg-green-100 border-green-400' : ''}`}
                                            >
                                                {copied ? '✓ Copied!' : '📋 Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* QR Code */}
                                    <div className="bg-white border-2 border-blue-200 rounded-lg p-4 mb-4 text-center">
                                        <p className="text-xs text-blue-700 handwriting mb-3">📷 Scan to send files here:</p>
                                        <div className="inline-block p-3 bg-white rounded-lg border-2 border-dashed border-blue-300">
                                            <QRCodeSVG value={getReceiveUrl()} size={120} level="M" />
                                        </div>
                                    </div>

                                    {/* Push Notifications */}
                                    {pushSupported && (
                                        <div className="flex items-center justify-between bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 mb-4">
                                            <div className="flex items-center space-x-2">
                                                <span>🔔</span>
                                                <span className="text-sm handwriting text-blue-900">Push Notifications</span>
                                            </div>
                                            {pushEnabled ? (
                                                <span className="text-xs text-green-600 handwriting-bold bg-green-100 px-2 py-1 rounded border border-green-300">✓ Enabled</span>
                                            ) : (
                                                <button
                                                    onClick={handleEnablePush}
                                                    disabled={saving}
                                                    className="px-3 py-1 notebook-button text-xs handwriting-bold text-blue-900 transition-colors disabled:opacity-50"
                                                >
                                                    Enable
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                router.push('/inbox');
                                            }}
                                            className="flex-1 py-2 notebook-button text-blue-900 rounded-lg handwriting-bold text-sm"
                                        >
                                            📬 View Inbox
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                router.push('/send');
                                            }}
                                            className="flex-1 py-2 notebook-button text-blue-900 rounded-lg handwriting-bold text-sm bg-orange-50 border-orange-300"
                                        >
                                            📤 Send Files
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Setup Form */}
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm handwriting">
                                            ⚠️ {error}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm handwriting-bold text-blue-900 mb-1">
                                                📝 Device Name
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g., My Phone"
                                                className="w-full px-3 py-2 bg-white border-2 border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 handwriting"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm handwriting-bold text-blue-900 mb-1">
                                                🏷️ Receive Code
                                            </label>
                                            <input
                                                type="text"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                                                placeholder="e.g., lakshman"
                                                className="w-full px-3 py-2 bg-white border-2 border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 handwriting font-mono"
                                                maxLength={30}
                                            />
                                            <p className="text-xs text-blue-600 mt-1 handwriting">
                                                💡 Your link: <code className="bg-blue-100 px-1 rounded">/send/{code || 'your-code'}</code>
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleSetup}
                                            disabled={saving || !name.trim() || code.length < 3}
                                            className="w-full py-3 notebook-button text-blue-900 rounded-lg handwriting-bold transition-colors disabled:opacity-50 bg-green-50 border-green-400"
                                        >
                                            {saving ? '⏳ Setting up...' : '🚀 Create Receive Link'}
                                        </button>
                                    </div>

                                    <div className="mt-4 pt-4 border-t-2 border-dashed border-blue-200">
                                        <p className="text-xs text-blue-600 handwriting text-center mb-3">
                                            💡 Anyone with your link can send you files from any device
                                        </p>

                                        {/* Send Files button - works without setup */}
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                router.push('/send');
                                            }}
                                            className="w-full py-2 notebook-button text-blue-900 rounded-lg handwriting-bold text-sm bg-orange-50 border-orange-300"
                                        >
                                            📤 Send Files to Someone
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
