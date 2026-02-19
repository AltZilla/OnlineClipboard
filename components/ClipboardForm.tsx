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
    <form onSubmit={handleSubmit} className="clipboard-form">
      <div>
        <label htmlFor="content" className="form-label">
          Text Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={8}
          className="form-textarea"
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <div className="loading-wrapper">
              <div className="loading-spinner"></div>
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
            className="btn-secondary"
          >
            📋 Copy
          </button>
        )}
      </div>
    </form>
  );
}
