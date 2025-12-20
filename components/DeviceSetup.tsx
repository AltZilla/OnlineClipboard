'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDevice } from '@/lib/DeviceContext';

interface DeviceSetupProps {
    onComplete?: () => void;
}

export default function DeviceSetup({ onComplete }: DeviceSetupProps) {
    const {
        receiveCode,
        deviceName,
        isSetup,
        setupDevice,
        updateDeviceName,
        pushSupported,
        pushEnabled,
        requestPushPermission,
        loading,
        getReceiveUrl
    } = useDevice();

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [mode, setMode] = useState<'setup' | 'view' | 'edit'>('setup');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isSetup && receiveCode) {
            setMode('view');
            setName(deviceName);
            setCode(receiveCode);
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
            onComplete?.();
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
            <div className="paper-card p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-blue-700 handwriting">Loading...</p>
            </div>
        );
    }

    // View mode - show receive link and QR code
    if (mode === 'view' && receiveCode) {
        const receiveUrl = getReceiveUrl();

        return (
            <div className="paper-card p-6 animate-fadeIn">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center mr-4 shadow-md">
                        <span className="text-2xl">✅</span>
                    </div>
                    <div>
                        <h2 className="text-2xl handwriting-bold text-blue-900">{deviceName}</h2>
                        <p className="text-sm text-green-600 handwriting">Ready to receive</p>
                    </div>
                </div>

                {/* Receive Link */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-purple-700 handwriting mb-2">Your receive link:</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border border-purple-300 text-purple-900 truncate">
                            {receiveUrl}
                        </code>
                        <button
                            onClick={handleCopyLink}
                            className={`px-4 py-2 rounded-lg handwriting-bold transition-all ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                        >
                            {copied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                    </div>
                </div>

                {/* QR Code */}
                <div className="bg-white border-2 border-blue-200 rounded-lg p-6 mb-6 text-center">
                    <p className="text-sm text-blue-700 handwriting mb-4">
                        Or scan this QR code from any device:
                    </p>
                    <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                        <QRCodeSVG
                            value={receiveUrl}
                            size={180}
                            level="M"
                            includeMargin={true}
                        />
                    </div>
                </div>

                {/* Push Notifications */}
                {pushSupported && (
                    <div className="border-t-2 border-dashed border-blue-200 pt-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg handwriting-bold text-blue-900 flex items-center">
                                    <span className="mr-2">🔔</span>
                                    Push Notifications
                                </h3>
                                <p className="text-xs text-blue-600 handwriting mt-1">
                                    Get notified when files are sent to you
                                </p>
                            </div>
                            {pushEnabled ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm handwriting border border-green-300">
                                    ✓ Enabled
                                </span>
                            ) : (
                                <button
                                    onClick={handleEnablePush}
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm handwriting transition-colors disabled:opacity-50"
                                >
                                    Enable
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <h4 className="handwriting-bold text-yellow-800 mb-2">📱 How it works:</h4>
                    <ol className="text-sm text-yellow-700 handwriting space-y-1">
                        <li>1. Share your link or QR code</li>
                        <li>2. Anyone can send files to you from any device</li>
                        <li>3. You'll get a notification when files arrive</li>
                    </ol>
                </div>
            </div>
        );
    }

    // Setup mode
    return (
        <div className="paper-card p-6 animate-fadeIn">
            <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 border-2 border-purple-300 rounded-lg flex items-center justify-center mr-4 shadow-md">
                    <span className="text-2xl">📲</span>
                </div>
                <div>
                    <h2 className="text-2xl handwriting-bold text-blue-900">Set Up Receive Code</h2>
                    <p className="text-sm text-blue-700 handwriting">
                        Choose a unique code to receive files from any device
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm handwriting">
                    ⚠️ {error}
                </div>
            )}

            <div className="space-y-5">
                {/* Device Name */}
                <div>
                    <label className="block text-lg handwriting-bold text-blue-900 mb-2">
                        Device Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., My Phone, Work Laptop"
                        className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 handwriting shadow-sm"
                    />
                </div>

                {/* Receive Code */}
                <div>
                    <label className="block text-lg handwriting-bold text-blue-900 mb-2">
                        Your Receive Code
                    </label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                        placeholder="e.g., lakshman, myphone, work-files"
                        className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 handwriting shadow-sm font-mono"
                        maxLength={30}
                    />
                    <p className="text-xs text-blue-600 mt-2 handwriting">
                        💡 This will be your personal link: <code className="bg-blue-100 px-1 rounded">/send/{code || 'your-code'}</code>
                    </p>
                </div>

                {/* Setup Button */}
                <button
                    onClick={handleSetup}
                    disabled={saving || !name.trim() || code.length < 3}
                    className="w-full notebook-button text-blue-900 py-4 text-lg handwriting-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? '⏳ Setting up...' : '🚀 Create My Receive Link'}
                </button>
            </div>
        </div>
    );
}
