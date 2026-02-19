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
        <label htmlFor="content" className="block text-lg handwriting-bold text-blue-900 mb-4">
          Text Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={8}
          className="w-full mb-4"
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 notebook-button text-blue-900 py-4 px-6 text-lg handwriting-bold"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900 mr-2"></div>
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
            className="notebook-button text-blue-900 py-4 px-6 text-lg handwriting-bold"
          >
            📋 Copy
          </button>
        )}
      </div>
    </form>
  );
}
