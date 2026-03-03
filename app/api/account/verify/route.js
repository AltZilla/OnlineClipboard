import { NextResponse } from 'next/server';
import { generateOtp, storeOtp, sendOtpEmail } from '@/lib/email';

export const runtime = 'nodejs';

/**
 * POST — Send an OTP to the given email for verification
 * Body: { email: string }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || !email.trim()) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const otp = generateOtp();
        storeOtp(normalizedEmail, otp);

        await sendOtpEmail(normalizedEmail, otp);

        return NextResponse.json({
            success: true,
            message: 'Verification code sent to your email!'
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send verification code. Please try again.' },
            { status: 500 }
        );
    }
}
