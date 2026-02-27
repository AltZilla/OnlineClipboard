import { GridFSBucket, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import connectDB from './mongodb';
async function getGridFSBucket() {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('MongoDB connection not established');
    }
    return new GridFSBucket(db, { bucketName: 'files' });
}
export async function uploadFileToGridFS(buffer, filename, metadata) {
    try {
        const bucket = await getGridFSBucket();
        return new Promise((resolve, reject) => {
            const uploadStream = bucket.openUploadStream(filename, {
                metadata: {
                    clipboardId: metadata.clipboardId,
                    originalName: metadata.originalName,
                    mimeType: metadata.mimeType,
                    uploadTime: new Date().toISOString()
                }
            });
            uploadStream.on('finish', () => {
                resolve(uploadStream.id.toString());
            });
            uploadStream.on('error', (error) => {
                reject(error);
            });
            uploadStream.end(buffer);
        });
    } catch (error) {
        console.error('Error uploading file to GridFS:', error);
        throw error;
    }
}
export async function downloadFileFromGridFS(gridfsId) {
    try {
        const bucket = await getGridFSBucket();
        const fileId = new ObjectId(gridfsId);
        const files = await bucket.find({ _id: fileId }).toArray();
        if (files.length === 0) {
            return null;
        }
        const fileInfo = files[0];
        const chunks = [];
        return new Promise((resolve, reject) => {
            const downloadStream = bucket.openDownloadStream(fileId);
            downloadStream.on('data', (chunk) => {
                chunks.push(chunk);
            });
            downloadStream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve({
                    buffer,
                    mimeType: fileInfo.metadata?.mimeType || 'application/octet-stream',
                    originalName: fileInfo.metadata?.originalName || fileInfo.filename
                });
            });
            downloadStream.on('error', (error) => {
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error downloading file from GridFS:', error);
        return null;
    }
}
export async function deleteFileFromGridFS(gridfsId) {
    try {
        const bucket = await getGridFSBucket();
        const fileId = new ObjectId(gridfsId);
        await bucket.delete(fileId);
        return true;
    } catch (error) {
        console.error('Error deleting file from GridFS:', error);
        return false;
    }
}
export async function deleteClipboardFilesFromGridFS(clipboardId) {
    try {
        const bucket = await getGridFSBucket();
        const files = await bucket.find({ 'metadata.clipboardId': clipboardId }).toArray();
        let deletedCount = 0;
        for (const file of files) {
            try {
                await bucket.delete(file._id);
                deletedCount++;
            } catch (error) {
                console.error(`Error deleting file ${file._id}:`, error);
            }
        }
        return deletedCount;
    } catch (error) {
        console.error('Error deleting clipboard files from GridFS:', error);
        return 0;
    }
}
