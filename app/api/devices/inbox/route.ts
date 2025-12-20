import { NextRequest, NextResponse } from 'next/server';
import { getInboxClipboards } from '@/lib/storage-mongodb';

export const runtime = 'nodejs';

// GET - Get all clipboards sent to a specific receive code
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const receiveCode = searchParams.get('receiveCode');

        if (!receiveCode) {
            return NextResponse.json(
                { success: false, error: 'Receive code is required' },
                { status: 400 }
            );
        }

        const clipboards = await getInboxClipboards(receiveCode);

        return NextResponse.json({
            success: true,
            clipboards,
            count: clipboards.length
        });
    } catch (error) {
        console.error('Error getting inbox clipboards:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get inbox' },
            { status: 500 }
        );
    }
}
