import { GridFSBucket, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import connectDB from './mongodb';

// Get GridFS bucket instance
async function getGridFSBucket(): Promise<GridFSBucket> {
  // Ensure connection is established
  await connectDB();
  
  // Get database from mongoose connection
  const db = mongoose.connection.db;
  
  if (!db) {
    throw new Error('MongoDB connection not established');
  }
  
  return new GridFSBucket(db, { bucketName: 'files' });
}

/**
 * Upload a file to GridFS
 * @param buffer File buffer to upload
 * @param filename Filename in GridFS
 * @param metadata Additional metadata to store
 * @returns GridFS file ID
 */
export async function uploadFileToGridFS(
  buffer: Buffer,
  filename: string,
  metadata: {
    clipboardId: string;
    originalName: string;
    mimeType: string;
  }
): Promise<string> {
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

/**
 * Download a file from GridFS
 * @param gridfsId GridFS file ID
 * @returns File buffer and metadata
 */
export async function downloadFileFromGridFS(
  gridfsId: string
): Promise<{ buffer: Buffer; mimeType: string; originalName: string } | null> {
  try {
    const bucket = await getGridFSBucket();
    const fileId = new ObjectId(gridfsId);
    
    // Check if file exists
    const files = await bucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
      return null;
    }
    
    const fileInfo = files[0];
    const chunks: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
      const downloadStream = bucket.openDownloadStream(fileId);
      
      downloadStream.on('data', (chunk: Buffer) => {
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

/**
 * Delete a file from GridFS
 * @param gridfsId GridFS file ID
 */
export async function deleteFileFromGridFS(gridfsId: string): Promise<boolean> {
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

/**
 * Delete all files for a clipboard from GridFS
 * @param clipboardId Clipboard ID
 */
export async function deleteClipboardFilesFromGridFS(clipboardId: string): Promise<number> {
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

