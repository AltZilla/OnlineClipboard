import { NextResponse } from 'next/server';
import { addFileToClipboard, getClipboard, cleanupExpiredClipboards } from '@/lib/storage-mongodb';
import { nanoid } from 'nanoid';
export const runtime = 'nodejs';
export async function POST(request, { params }) {
    try {
        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Clipboard ID is required' },
                { status: 400 }
            );
        }
        await cleanupExpiredClipboards();
        const clipboard = await getClipboard(id);
        if (!clipboard) {
            return NextResponse.json(
                { success: false, error: 'Clipboard not found' },
                { status: 404 }
            );
        }
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File size exceeds 50MB limit' },
                { status: 400 }
            );
        }
        const fileExtension = file.name.split('.').pop();
        const uniqueFilename = `${nanoid()}.${fileExtension}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || 'application/octet-stream';
        const fileInfo = {
            filename: uniqueFilename,
            originalName: file.name,
            size: file.size,
            uploadTime: new Date().toISOString(),
            mimeType: mimeType
        };
        const added = await addFileToClipboard(id, fileInfo, buffer);
        if (!added) {
            return NextResponse.json(
                { success: false, error: 'Failed to add file to clipboard' },
                { status: 500 }
            );
        }
        return NextResponse.json({
            success: true,
            file: {
                filename: fileInfo.filename,
                originalName: fileInfo.originalName,
                size: fileInfo.size,
                uploadTime: fileInfo.uploadTime
            },
            message: 'File uploaded successfully',
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
