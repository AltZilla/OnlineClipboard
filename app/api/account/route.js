import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import { verifyOtp } from '@/lib/email';

export const runtime = 'nodejs';

/**
 * Generate a unique 6-digit account ID
 */
async function generateAccountId() {
    let id;
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 20) {
        id = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = await Account.findOne({ accountId: id });
        exists = !!existing;
        attempts++;
    }
    if (exists) {
        throw new Error('Failed to generate unique account ID');
    }
    return id;
}

/**
 * POST — Create a new account (requires OTP verification)
 * Body: { email: string, otp: string }
 * Returns: { success, accountId, email }
 */
export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { email, otp } = body;

        if (!email || !email.trim()) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        if (!otp || !otp.trim()) {
            return NextResponse.json(
                { success: false, error: 'Verification code is required' },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Verify OTP
        const isValid = verifyOtp(normalizedEmail, otp.trim());
        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired verification code. Please request a new one.' },
                { status: 400 }
            );
        }

        // Check if email already has an account
        const existingAccount = await Account.findOne({ email: normalizedEmail });
        if (existingAccount) {
            return NextResponse.json({
                success: true,
                accountId: existingAccount.accountId,
                email: existingAccount.email,
                existing: true,
                message: 'An account with this email already exists. Here is your Account ID.'
            });
        }

        const accountId = await generateAccountId();
        const account = new Account({
            accountId,
            email: normalizedEmail
        });
        await account.save();

        return NextResponse.json({
            success: true,
            accountId: account.accountId,
            email: account.email,
            existing: false,
            message: 'Account created successfully!'
        });
    } catch (error) {
        console.error('Error creating account:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create account. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * GET — Look up an account by ID
 * Query: ?id=123456
 * Returns: { success, exists, maskedEmail }
 */
export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Account ID is required' },
                { status: 400 }
            );
        }

        const account = await Account.findOne({ accountId: id });
        if (!account) {
            return NextResponse.json({
                success: true,
                exists: false
            });
        }

        // Mask email for privacy: show first 2 chars + domain
        const [localPart, domain] = account.email.split('@');
        const maskedLocal = localPart.slice(0, 2) + '***';
        const maskedEmail = `${maskedLocal}@${domain}`;

        return NextResponse.json({
            success: true,
            exists: true,
            maskedEmail
        });
    } catch (error) {
        console.error('Error looking up account:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to look up account' },
            { status: 500 }
        );
    }
}
