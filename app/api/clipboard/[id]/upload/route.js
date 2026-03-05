import { NextResponse } from 'next/server';
import { addFileToClipboard, getClipboard, cleanupExpiredClipboards } from '@/lib/storage-mongodb';
import { nanoid } from 'nanoid';
import connectDB from '@/lib/mongodb';
import TempChunk from '@/models/TempChunk';

export const runtime = 'nodejs';
export const maxDuration = 60;

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
        const chunkIndex = parseInt(formData.get('chunkIndex') || '0', 10);
        const totalChunks = parseInt(formData.get('totalChunks') || '1', 10);
        const fileName = formData.get('fileName') || file?.name || 'unknown';
        const fileSize = parseInt(formData.get('fileSize') || '0', 10);
        const mimeType = formData.get('mimeType') || file?.type || 'application/octet-stream';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file/chunk provided' },
                { status: 400 }
            );
        }

        // Total file size check (50MB limit)
        if (fileSize > 50 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File size exceeds 50MB limit' },
                { status: 400 }
            );
        }

        const chunkBuffer = Buffer.from(await file.arrayBuffer());

        // --- Single-chunk upload (small files) ---
        if (totalChunks === 1) {
            const fileExtension = fileName.split('.').pop();
            const uniqueFilename = `${nanoid()}.${fileExtension}`;

            const fileInfo = {
                filename: uniqueFilename,
                originalName: fileName,
                size: chunkBuffer.length,
                uploadTime: new Date().toISOString(),
                mimeType: mimeType
            };

            const added = await addFileToClipboard(id, fileInfo, chunkBuffer);
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
        }

        // --- Multi-chunk upload ---
        const uploadId = `${id}_${fileName}_${fileSize}`;

        await connectDB();

        // Store this chunk
        await TempChunk.findOneAndUpdate(
            { uploadId, chunkIndex },
            { uploadId, chunkIndex, data: chunkBuffer },
            { upsert: true }
        );

        // Check if all chunks have arrived
        const storedCount = await TempChunk.countDocuments({ uploadId });

        if (storedCount < totalChunks) {
            // Not all chunks yet — acknowledge this chunk
            return NextResponse.json({
                success: true,
                chunksReceived: storedCount,
                totalChunks,
                message: `Chunk ${chunkIndex + 1}/${totalChunks} received`,
            });
        }

        // All chunks received — reassemble the file
        const chunks = await TempChunk.find({ uploadId }).sort({ chunkIndex: 1 });
        const fullBuffer = Buffer.concat(chunks.map(c => c.data));

        // Clean up temp chunks
        await TempChunk.deleteMany({ uploadId });

        const fileExtension = fileName.split('.').pop();
        const uniqueFilename = `${nanoid()}.${fileExtension}`;

        const fileInfo = {
            filename: uniqueFilename,
            originalName: fileName,
            size: fullBuffer.length,
            uploadTime: new Date().toISOString(),
            mimeType: mimeType
        };

        const added = await addFileToClipboard(id, fileInfo, fullBuffer);
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
            message: 'File uploaded successfully (reassembled from chunks)',
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
