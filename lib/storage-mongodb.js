import connectDB from './mongodb';
import Clipboard from '@/models/Clipboard';
import { uploadFileToGridFS, downloadFileFromGridFS, deleteClipboardFilesFromGridFS } from './gridfs';
export async function generateId() {
    await connectDB();
    let attempts = 0;
    const maxAttempts = 100;
    while (attempts < maxAttempts) {
        const id = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const existing = await Clipboard.findOne({ id });
        if (!existing) {
            return id;
        }
        attempts++;
    }
    throw new Error('Unable to generate unique clipboard ID');
}
export async function getClipboard(id) {
    try {
        await connectDB();
        const clipboard = await Clipboard.findOneAndUpdate(
            { id },
            { lastAccessed: new Date() },
            { new: true }
        );
        if (!clipboard) {
            return null;
        }
        return {
            id: clipboard.id,
            content: clipboard.content,
            files: clipboard.files.map((file) => ({
                filename: file.filename,
                originalName: file.originalName,
                size: file.size,
                uploadTime: file.uploadTime.toISOString(),
                mimeType: file.mimeType
            })),
            isPublic: clipboard.isPublic,
            createdAt: clipboard.createdAt.toISOString(),
            lastAccessed: clipboard.lastAccessed.toISOString(),
            expiresAt: clipboard.expiresAt.toISOString()
        };
    } catch (error) {
        console.error('Error reading clipboard:', error);
        return null;
    }
}
export async function createClipboard(content = '', isPublic = false) {
    const id = await generateId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await connectDB();
    console.log(`Creating clipboard with isPublic: ${isPublic}, type: ${typeof isPublic}`);
    const clipboard = new Clipboard({
        id,
        content,
        files: [],
        isPublic: Boolean(isPublic),
        createdAt: now,
        lastAccessed: now,
        expiresAt
    });
    console.log(`Clipboard object before save - isPublic: ${clipboard.isPublic}, type: ${typeof clipboard.isPublic}`);
    clipboard.markModified('isPublic');
    await clipboard.save({ validateBeforeSave: true });
    const saved = await Clipboard.findOne({ id }).lean();
    console.log(`Created clipboard ${id} - before save: ${clipboard.isPublic}, after save (from object): ${clipboard.isPublic}, from DB query: ${saved?.isPublic}, type: ${typeof saved?.isPublic}`);
    console.log(`Full saved document:`, JSON.stringify(saved, null, 2));
    return {
        id: clipboard.id,
        content: clipboard.content,
        files: [],
        isPublic: clipboard.isPublic,
        createdAt: clipboard.createdAt.toISOString(),
        lastAccessed: clipboard.lastAccessed.toISOString(),
        expiresAt: clipboard.expiresAt.toISOString()
    };
}
export async function updateClipboard(id, content) {
    try {
        await connectDB();
        const result = await Clipboard.findOneAndUpdate(
            { id },
            {
                content,
                lastAccessed: new Date()
            }
        );
        return !!result;
    } catch (error) {
        console.error('Error updating clipboard:', error);
        return false;
    }
}
export async function addFileToClipboard(id, file, buffer) {
    try {
        await connectDB();
        const gridfsId = await uploadFileToGridFS(buffer, file.filename, {
            clipboardId: id,
            originalName: file.originalName,
            mimeType: file.mimeType
        });
        const fileData = {
            filename: file.filename,
            originalName: file.originalName,
            size: file.size,
            uploadTime: new Date(file.uploadTime),
            mimeType: file.mimeType,
            gridfsId: gridfsId
        };
        const result = await Clipboard.findOneAndUpdate(
            { id },
            {
                $push: { files: fileData },
                lastAccessed: new Date()
            }
        );
        return !!result;
    } catch (error) {
        console.error('Error adding file to clipboard:', error);
        return false;
    }
}
export async function getFileBuffer(id, filename) {
    try {
        await connectDB();
        const clipboard = await Clipboard.findOne(
            { id, 'files.filename': filename },
            { 'files.$': 1 }
        );
        if (!clipboard || !clipboard.files.length) {
            return null;
        }
        const file = clipboard.files[0];
        const fileData = await downloadFileFromGridFS(file.gridfsId);
        if (!fileData) {
            return null;
        }
        return {
            buffer: fileData.buffer,
            mimeType: file.mimeType || fileData.mimeType,
            originalName: file.originalName || fileData.originalName
        };
    } catch (error) {
        console.error('Error getting file buffer:', error);
        return null;
    }
}
export async function deleteClipboard(id) {
    try {
        await connectDB();
        await deleteClipboardFilesFromGridFS(id);
        const result = await Clipboard.findOneAndDelete({ id });
        return !!result;
    } catch (error) {
        console.error('Error deleting clipboard:', error);
        return false;
    }
}
export async function getAllClipboardIds() {
    try {
        await connectDB();
        const clipboards = await Clipboard.find({}, { id: 1 });
        return clipboards.map(c => c.id);
    } catch (error) {
        console.error('Error getting clipboard IDs:', error);
        return [];
    }
}
export async function getAllClipboards(limit = 50, publicOnly = false) {
    try {
        await connectDB();
        const query = publicOnly ? { isPublic: true } : {};
        console.log('Query for clipboards:', JSON.stringify(query), 'publicOnly:', publicOnly);
        const allClipboards = await Clipboard.find({}).select('id isPublic createdAt').limit(10).sort({ createdAt: -1 });
        console.log('Sample of all clipboards in DB (most recent 10):', allClipboards.map(c => ({
            id: c.id,
            isPublic: c.isPublic,
            isPublicType: typeof c.isPublic,
            createdAt: c.createdAt
        })));
        const clipboards = await Clipboard.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('id content files isPublic createdAt lastAccessed expiresAt');
        console.log(`Found ${clipboards.length} clipboards with query { isPublic: true }. Sample:`, clipboards.slice(0, 3).map(c => ({ id: c.id, isPublic: c.isPublic, isPublicType: typeof c.isPublic })));
        return clipboards.map(clipboard => ({
            id: clipboard.id,
            content: clipboard.content,
            files: clipboard.files.map((file) => ({
                filename: file.filename,
                originalName: file.originalName,
                size: file.size,
                uploadTime: file.uploadTime.toISOString(),
                mimeType: file.mimeType
            })),
            isPublic: clipboard.isPublic,
            createdAt: clipboard.createdAt.toISOString(),
            lastAccessed: clipboard.lastAccessed.toISOString(),
            expiresAt: clipboard.expiresAt.toISOString()
        }));
    } catch (error) {
        console.error('Error getting all clipboards:', error);
        return [];
    }
}
export async function cleanupExpiredClipboards() {
    try {
        await connectDB();
        const expiredClipboards = await Clipboard.find({
            expiresAt: { $lt: new Date() }
        });
        for (const clipboard of expiredClipboards) {
            await deleteClipboardFilesFromGridFS(clipboard.id);
        }
        const result = await Clipboard.deleteMany({
            expiresAt: { $lt: new Date() }
        });
        return result.deletedCount || 0;
    } catch (error) {
        console.error('Error cleaning up expired clipboards:', error);
        return 0;
    }
}
