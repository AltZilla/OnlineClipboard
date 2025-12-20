'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SendToUserForm from '@/components/SendToUserForm';

export default function SendPage() {
    const router = useRouter();

    return (
        <div className="max-w-xl mx-auto">
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
                        📤 Send Files
                    </h1>
                </div>
            </div>

            {/* Subtitle */}
            <p className="text-lg text-blue-800 text-center mb-8 handwriting">
                Send files or text to someone using their receive code
            </p>

            {/* Send Form */}
            <SendToUserForm />

            {/* How it works */}
            <div className="mt-8 paper-card p-6 animate-fadeIn">
                <h3 className="text-xl handwriting-bold text-blue-900 mb-4 flex items-center">
                    <span className="mr-2">💡</span>
                    How It Works
                </h3>
                <ol className="space-y-3 text-blue-800 handwriting">
                    <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">1</span>
                        <span>Ask the recipient for their receive code</span>
                    </li>
                    <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">2</span>
                        <span>Enter their code above and click Go</span>
                    </li>
                    <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">3</span>
                        <span>Upload files or type text on the next page</span>
                    </li>
                    <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">4</span>
                        <span>They&apos;ll receive a notification instantly!</span>
                    </li>
                </ol>
            </div>

            {/* Alternative */}
            <div className="mt-6 text-center">
                <p className="text-sm text-blue-600 handwriting">
                    Don&apos;t have their code? Ask them to share their link or QR code with you.
                </p>
            </div>
        </div>
    );
}
