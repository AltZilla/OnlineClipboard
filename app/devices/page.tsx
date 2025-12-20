'use client';

import { useRouter } from 'next/navigation';
import DeviceSetup from '@/components/DeviceSetup';
import { useDevice } from '@/lib/DeviceContext';

export default function DevicesPage() {
    const router = useRouter();
    const { isSetup, loading } = useDevice();

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => router.push('/')}
                className="mb-6 flex items-center space-x-2 text-blue-700 hover:text-blue-900 handwriting transition-colors"
            >
                <span>←</span>
                <span>Back to Clipboards</span>
            </button>

            {/* Title */}
            <div className="text-center mb-8 animate-fadeIn">
                <div className="inline-block paper-card px-8 py-4">
                    <h1 className="text-4xl handwriting-bold text-blue-900">
                        📲 Receive Files
                    </h1>
                </div>
            </div>

            {/* Subtitle */}
            <p className="text-xl text-blue-800 max-w-2xl mx-auto leading-relaxed text-center mb-8 handwriting">
                {isSetup
                    ? 'Share your link to receive files from any device'
                    : 'Set up your personal receive link'
                }
            </p>

            {/* Device Setup Component */}
            <DeviceSetup />

            {/* View Inbox button - only show if setup */}
            {!loading && isSetup && (
                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/inbox')}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg handwriting-bold transition-colors shadow-md"
                    >
                        <span>📬</span>
                        <span>View My Inbox</span>
                    </button>
                </div>
            )}

            {/* How it works section - only show if not setup */}
            {!loading && !isSetup && (
                <div className="mt-8 paper-card p-6 animate-fadeIn">
                    <h3 className="text-xl handwriting-bold text-blue-900 mb-4 flex items-center">
                        <span className="mr-2">💡</span>
                        How It Works
                    </h3>
                    <ol className="space-y-3 text-blue-800 handwriting">
                        <li className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">1</span>
                            <span>Choose a unique receive code (like your name)</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">2</span>
                            <span>You&apos;ll get a personal link and QR code</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">3</span>
                            <span>Anyone can send files to you using that link — from any device!</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">4</span>
                            <span>Check your inbox to see received files</span>
                        </li>
                    </ol>
                </div>
            )}

            {/* Install PWA section */}
            <div className="mt-8 paper-card p-6 animate-fadeIn bg-gradient-to-r from-green-50 to-blue-50">
                <h3 className="text-xl handwriting-bold text-green-900 mb-4 flex items-center">
                    <span className="mr-2">📲</span>
                    Install as App
                </h3>
                <p className="text-green-800 handwriting mb-4">
                    Install Online Clipboard for the best experience:
                </p>
                <ul className="space-y-2 text-green-700 handwriting text-sm">
                    <li><strong>Chrome (Android/Desktop):</strong> Menu → Install App</li>
                    <li><strong>Safari (iOS):</strong> Share → Add to Home Screen</li>
                    <li><strong>Edge:</strong> Menu → Apps → Install</li>
                </ul>
            </div>
        </div>
    );
}
