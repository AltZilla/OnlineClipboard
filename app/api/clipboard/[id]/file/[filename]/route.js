import { NextResponse } from 'next/server';
import { getFileBuffer } from '@/lib/storage-mongodb';
export const runtime = 'nodejs';
export async function GET(request, { params }) {
    try {
        const { id, filename } = params;
        if (!id || !filename) {
            return NextResponse.json(
                { success: false, error: 'Clipboard ID and filename are required' },
                { status: 400 }
            );
        }
        const fileData = await getFileBuffer(id, filename);
        if (!fileData) {
            return NextResponse.json(
                { success: false, error: 'File not found' },
                { status: 404 }
            );
        }
        const { buffer, mimeType, originalName } = fileData;
        const blob = new Blob([Uint8Array.from(buffer)], { type: mimeType });
        const headers = new Headers();
        headers.set('Content-Type', mimeType);
        headers.set('Content-Disposition', `attachment; filename="${originalName}"`);
        return new NextResponse(blob, { status: 200, headers });
    } catch (error) {
        console.error('Error getting file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get file' },
            { status: 500 }
        );
    }
}
