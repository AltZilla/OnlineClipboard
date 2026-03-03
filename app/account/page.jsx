'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
    const router = useRouter();

    // Create account state
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP
    const [sendingOtp, setSendingOtp] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createResult, setCreateResult] = useState(null);
    const [createError, setCreateError] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(120);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Lookup state
    const [lookupId, setLookupId] = useState('');
    const [lookingUp, setLookingUp] = useState(false);
    const [lookupResult, setLookupResult] = useState(null);
    const [lookupError, setLookupError] = useState('');

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setSendingOtp(true);
        setCreateError('');

        try {
            const res = await fetch('/api/account/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            });
            const data = await res.json();

            if (data.success) {
                setStep(2);
                setOtpSent(true);
                setCreateError('');
                startTimer();
            } else {
                setCreateError(data.error || 'Failed to send verification code');
            }
        } catch (err) {
            setCreateError('Something went wrong. Please try again.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setCreating(true);
        setCreateError('');
        setCreateResult(null);

        try {
            const res = await fetch('/api/account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
            });
            const data = await res.json();

            if (data.success) {
                setCreateResult(data);
                setEmail('');
                setOtp('');
                setStep(1);
                setOtpSent(false);
                if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
                setTimeLeft(0);
            } else {
                setCreateError(data.error || 'Failed to create account');
            }
        } catch (err) {
            setCreateError('Something went wrong. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleResendOtp = async () => {
        setSendingOtp(true);
        setCreateError('');
        try {
            const res = await fetch('/api/account/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setCreateError('');
                setOtp('');
                startTimer();
            } else {
                setCreateError(data.error || 'Failed to resend code');
            }
        } catch (err) {
            setCreateError('Something went wrong.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleBackToEmail = () => {
        setStep(1);
        setOtp('');
        setCreateError('');
        setOtpSent(false);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setTimeLeft(0);
    };

    const handleLookup = async (e) => {
        e.preventDefault();
        setLookingUp(true);
        setLookupError('');
        setLookupResult(null);

        try {
            const res = await fetch(`/api/account?id=${lookupId.trim()}`);
            const data = await res.json();

            if (data.success) {
                setLookupResult(data);
            } else {
                setLookupError(data.error || 'Failed to look up account');
            }
        } catch (err) {
            setLookupError('Something went wrong. Please try again.');
        } finally {
            setLookingUp(false);
        }
    };

    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
    };

    return (
        <div className="clipboard-page-container">
            {/* Hero */}
            <div className="hero-section">
                <div className="hero-card">
                    <h1 className="hero-title">📧 Email Account</h1>
                </div>
            </div>

            <p className="hero-subtitle">
                Create an account to receive clipboard content directly in your inbox
            </p>

            <div className="dashboard-grid">
                {/* Create Account Card */}
                <div className="clipboard-card create-card">
                    <div className="card-header">
                        <div className="card-icon icon-create">
                            <span>✉️</span>
                        </div>
                        <h2 className="card-title">Create Account</h2>
                    </div>

                    <p className="account-description">
                        Register your email to get a unique 6-digit Account ID. We&apos;ll verify
                        your email with a one-time code first.
                    </p>

                    {/* Step 1: Enter Email */}
                    {step === 1 && !createResult && (
                        <form onSubmit={handleSendOtp} className="account-form">
                            <div className="input-group">
                                <label htmlFor="email-input" className="input-label">
                                    📮 Your Email Address
                                </label>
                                <input
                                    id="email-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="account-input"
                                    required
                                    disabled={sendingOtp}
                                />
                            </div>

                            <button
                                type="submit"
                                className="account-submit-btn"
                                disabled={sendingOtp || !email.trim()}
                            >
                                {sendingOtp ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Sending Code...
                                    </>
                                ) : (
                                    '📩 Send Verification Code'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Enter OTP */}
                    {step === 2 && !createResult && (
                        <div className="otp-step">
                            <div className="otp-sent-badge">
                                ✅ Code sent to <strong>{email}</strong>
                            </div>

                            {/* Countdown Timer */}
                            <div className={`otp-timer ${timeLeft === 0 ? 'otp-timer-expired' : ''}`}>
                                {timeLeft > 0 ? (
                                    <>
                                        <span className="timer-icon">⏱️</span>
                                        <span className="timer-text">Code expires in </span>
                                        <span className="timer-value">{formatTime(timeLeft)}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="timer-icon">⏰</span>
                                        <span className="timer-text-expired">Code expired — click Resend Code below</span>
                                    </>
                                )}
                            </div>

                            <form onSubmit={handleCreateAccount} className="account-form">
                                <div className="input-group">
                                    <label htmlFor="otp-input" className="input-label">
                                        🔐 Enter Verification Code
                                    </label>
                                    <input
                                        id="otp-input"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setOtp(val);
                                        }}
                                        placeholder="Enter 6-digit code"
                                        className="account-input account-input-id"
                                        maxLength={6}
                                        required
                                        disabled={creating}
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="account-submit-btn"
                                    disabled={creating || otp.length !== 6}
                                >
                                    {creating ? (
                                        <>
                                            <span className="btn-spinner"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        '🚀 Verify & Create Account'
                                    )}
                                </button>
                            </form>

                            <div className="otp-actions">
                                <button
                                    onClick={handleResendOtp}
                                    className="otp-action-btn"
                                    disabled={sendingOtp || timeLeft > 0}
                                >
                                    {sendingOtp ? 'Sending...' : '🔄 Resend Code'}
                                </button>
                                <button
                                    onClick={handleBackToEmail}
                                    className="otp-action-btn"
                                >
                                    ← Change Email
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Create Result */}
                    {createResult && (
                        <div className="account-result account-result-success">
                            <div className="result-icon">🎉</div>
                            <p className="result-message">{createResult.message}</p>
                            <div className="account-id-display">
                                <span className="account-id-label">Your Account ID</span>
                                <div className="account-id-value-row">
                                    <span className="account-id-value">{createResult.accountId}</span>
                                    <button
                                        onClick={() => handleCopyId(createResult.accountId)}
                                        className="copy-id-btn"
                                        title="Copy ID"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                            <p className="result-email">Linked to: <strong>{createResult.email}</strong></p>
                            {createResult.existing && (
                                <p className="result-note">
                                    ℹ️ This email was already registered. Use the ID above.
                                </p>
                            )}
                            <button
                                onClick={() => { setCreateResult(null); setStep(1); }}
                                className="otp-action-btn"
                                style={{ marginTop: '1rem' }}
                            >
                                Create Another Account
                            </button>
                        </div>
                    )}

                    {/* Create Error */}
                    {createError && (
                        <div className="account-result account-result-error">
                            <span className="result-icon">❌</span>
                            <p className="result-message">{createError}</p>
                        </div>
                    )}
                </div>

                {/* Lookup Account Card */}
                <div className="clipboard-card access-card">
                    <div className="card-header">
                        <div className="card-icon icon-access">
                            <span>🔍</span>
                        </div>
                        <h2 className="card-title">Lookup Account</h2>
                    </div>

                    <p className="account-description">
                        Enter a 6-digit Account ID to check if it exists and see the linked email.
                    </p>

                    <form onSubmit={handleLookup} className="account-form">
                        <div className="input-group">
                            <label htmlFor="lookup-input" className="input-label">
                                🔢 Account ID
                            </label>
                            <input
                                id="lookup-input"
                                type="text"
                                value={lookupId}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setLookupId(val);
                                }}
                                placeholder="Enter 6-digit ID"
                                className="account-input account-input-id"
                                maxLength={6}
                                required
                                disabled={lookingUp}
                            />
                        </div>

                        <button
                            type="submit"
                            className="account-submit-btn account-lookup-btn"
                            disabled={lookingUp || lookupId.length !== 6}
                        >
                            {lookingUp ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Looking up...
                                </>
                            ) : (
                                '🔎 Look Up'
                            )}
                        </button>
                    </form>

                    {/* Lookup Result */}
                    {lookupResult && (
                        <div className={`account-result ${lookupResult.exists ? 'account-result-success' : 'account-result-warning'}`}>
                            {lookupResult.exists ? (
                                <>
                                    <div className="result-icon">✅</div>
                                    <p className="result-message">Account found!</p>
                                    <p className="result-email">Email: <strong>{lookupResult.maskedEmail}</strong></p>
                                </>
                            ) : (
                                <>
                                    <div className="result-icon">⚠️</div>
                                    <p className="result-message">No account found with ID: <strong>{lookupId}</strong></p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Lookup Error */}
                    {lookupError && (
                        <div className="account-result account-result-error">
                            <span className="result-icon">❌</span>
                            <p className="result-message">{lookupError}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* How it works section */}
            <div className="how-it-works-section">
                <div className="clipboard-card">
                    <h2 className="card-title" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        📖 How It Works
                    </h2>
                    <div className="steps-grid">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h3 className="step-title">Verify Email</h3>
                            <p className="step-desc">Enter your email and verify with a one-time code</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h3 className="step-title">Get Your ID</h3>
                            <p className="step-desc">Receive a unique 6-digit Account ID after verification</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h3 className="step-title">Receive by Email</h3>
                            <p className="step-desc">Clipboard content + files are delivered directly to your inbox</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back button */}
            <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                <button onClick={() => router.push('/')} className="account-submit-btn" style={{ maxWidth: '200px' }}>
                    ← Back to Home
                </button>
            </div>
        </div>
    );
}
