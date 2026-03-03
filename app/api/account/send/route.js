import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import { getClipboard } from '@/lib/storage-mongodb';
import { downloadFileFromGridFS } from '@/lib/gridfs';
import { sendClipboardEmail } from '@/lib/email';

export const runtime = 'nodejs';

const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024; // 20MB total

/**
 * POST — Send clipboard content + files to an account's email
 * Body: { accountId: string, clipboardId: string }
 */
export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { accountId, clipboardId } = body;

        if (!accountId || !clipboardId) {
            return NextResponse.json(
                { success: false, error: 'Account ID and Clipboard ID are required' },
                { status: 400 }
            );
        }

        // Look up account
        const account = await Account.findOne({ accountId });
        if (!account) {
            return NextResponse.json(
                { success: false, error: 'Account not found. Please check the Account ID.' },
                { status: 404 }
            );
        }

        // Fetch clipboard
        const clipboard = await getClipboard(clipboardId);
        if (!clipboard) {
            return NextResponse.json(
                { success: false, error: 'Clipboard not found or has expired.' },
                { status: 404 }
            );
        }

        // Download file attachments from GridFS
        const attachments = [];
        let totalSize = 0;

        if (clipboard.files && clipboard.files.length > 0) {
            for (const file of clipboard.files) {
                try {
                    const fileData = await downloadFileFromGridFS(file.gridfsId);
                    if (fileData) {
                        totalSize += fileData.buffer.length;
                        if (totalSize > MAX_ATTACHMENT_SIZE) {
                            return NextResponse.json(
                                { success: false, error: 'Total file size exceeds 20MB limit for email delivery.' },
                                { status: 413 }
                            );
                        }
                        attachments.push({
                            filename: file.originalName || file.filename,
                            content: fileData.buffer,
                            contentType: file.mimeType || fileData.mimeType
                        });
                    }
                } catch (fileErr) {
                    console.error(`Error downloading file ${file.filename}:`, fileErr);
                    // Continue with other files
                }
            }
        }

        // Send email
        await sendClipboardEmail(
            account.email,
            clipboardId,
            clipboard.content,
            attachments
        );

        return NextResponse.json({
            success: true,
            message: `Clipboard content sent to ${account.email.split('@')[0].slice(0, 2)}***@${account.email.split('@')[1]}`
        });
    } catch (error) {
        console.error('Error sending clipboard email:', error);

        let errorMessage = 'Failed to send email. Please try again.';
        if (error.message && error.message.includes('SMTP')) {
            errorMessage = 'Email service is not configured. Please contact the admin.';
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
