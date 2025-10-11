'use client';

import { useState } from 'react';

interface ClipboardFormProps {
  onSubmit: (content: string) => void;
  loading?: boolean;
  placeholder?: string;
  buttonText?: string;
  initialValue?: string;
}

export default function ClipboardForm({
  onSubmit,
  loading = false,
  placeholder = 'Enter text...',
  buttonText = 'Submit',
  initialValue = '',
}: ClipboardFormProps) {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(content);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      alert('Content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="content" className="block text-lg font-semibold text-gray-700 mb-4">
          Text Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={8}
          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg transition-all duration-200 hover:border-gray-400"
        />
      </div>
      
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            buttonText
          )}
        </button>
        
        {content && (
          <button
            type="button"
            onClick={handleCopyToClipboard}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            📋 Copy
          </button>
        )}
      </div>
    </form>
  );
}
