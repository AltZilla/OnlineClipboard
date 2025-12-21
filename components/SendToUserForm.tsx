'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SendToUserForm() {
    const router = useRouter();
    const [receiveCode, setReceiveCode] = useState('');
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const code = receiveCode.toLowerCase().trim();

        if (!code) {
            setError('Please enter a receive code');
            return;
        }

        setChecking(true);
        setError('');

        try {
            // Check if the device exists
            const response = await fetch(`/api/devices?receiveCode=${encodeURIComponent(code)}`);
            const data = await response.json();

            if (data.success) {
                // Device found, navigate to send page
                router.push(`/send/${code}`);
            } else {
                setError('No device found with this code. Check the spelling and try again.');
            }
        } catch (err) {
            setError('Failed to check code. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="paper-card p-6 animate-fadeIn">
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-100 border-2 border-orange-300 rounded-lg flex items-center justify-center mr-3 shadow-md">
                    <span className="text-xl">📤</span>
                </div>
                <div>
                    <h3 className="text-xl handwriting-bold text-blue-900">Send to Someone</h3>
                    <p className="text-xs text-blue-600 handwriting">Enter their receive code</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={receiveCode}
                        onChange={(e) => {
                            setReceiveCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''));
                            setError('');
                        }}
                        placeholder="e.g., lakshman"
                        className="flex-1 px-4 py-3 bg-white border-2 border-blue-300 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 handwriting font-mono shadow-sm"
                        disabled={checking}
                    />
                    <button
                        type="submit"
                        disabled={checking || !receiveCode.trim()}
                        className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg handwriting-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {checking ? '...' : 'Go →'}
                    </button>
                </div>

                {error && (
                    <p className="mt-2 text-sm text-red-600 handwriting">
                        ⚠️ {error}
                    </p>
                )}

                <p className="mt-3 text-xs text-blue-500 handwriting">
                    💡 Ask the recipient for their receive code, then enter it here to send them files
                </p>
            </form>
        </div>
    );
}
