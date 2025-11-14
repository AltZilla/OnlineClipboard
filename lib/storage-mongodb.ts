import connectDB from './mongodb';
import Clipboard, { IClipboard, IClipboardFile } from '@/models/Clipboard';

export interface ClipboardData {
  id: string;
  content: string;
  files: Array<{
    filename: string;
    originalName: string;
    size: number;
    uploadTime: string;
    mimeType: string;
  }>;
  createdAt: string;
  lastAccessed: string;
  expiresAt: string;
}

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  uploadTime: string;
  mimeType: string;
}

// Generate unique 4-digit numeric ID
export async function generateId(): Promise<string> {
  await connectDB();
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loop
  
  while (attempts < maxAttempts) {
    // Generate a random 4-digit number (0000-9999)
    const id = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Check if ID already exists
    const existing = await Clipboard.findOne({ id });
    if (!existing) {
      return id;
    }
    
    attempts++;
  }
  
  // Fallback: if we can't find a unique ID after max attempts, throw error
  throw new Error('Unable to generate unique clipboard ID');
}

// Get clipboard data
export async function getClipboard(id: string): Promise<ClipboardData | null> {
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
      files: clipboard.files.map((file: IClipboardFile) => ({
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        uploadTime: file.uploadTime.toISOString(),
        mimeType: file.mimeType
      })),
      createdAt: clipboard.createdAt.toISOString(),
      lastAccessed: clipboard.lastAccessed.toISOString(),
      expiresAt: clipboard.expiresAt.toISOString()
    };
  } catch (error) {
    console.error('Error reading clipboard:', error);
    return null;
  }
}

// Create new clipboard
export async function createClipboard(content: string = ''): Promise<ClipboardData> {
  const id = await generateId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  await connectDB();
  
  const clipboard = new Clipboard({
    id,
    content,
    files: [],
    createdAt: now,
    lastAccessed: now,
    expiresAt
  });
  
  await clipboard.save();
  
  return {
    id: clipboard.id,
    content: clipboard.content,
    files: [],
    createdAt: clipboard.createdAt.toISOString(),
    lastAccessed: clipboard.lastAccessed.toISOString(),
    expiresAt: clipboard.expiresAt.toISOString()
  };
}

// Update clipboard content
export async function updateClipboard(id: string, content: string): Promise<boolean> {
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

// Add file to clipboard
export async function addFileToClipboard(id: string, file: UploadedFile, buffer: Buffer): Promise<boolean> {
  try {
    await connectDB();
    
    const fileData: IClipboardFile = {
      filename: file.filename,
      originalName: file.originalName,
      size: file.size,
      uploadTime: new Date(file.uploadTime),
      mimeType: file.mimeType,
      buffer: buffer
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

// Get file buffer from clipboard
export async function getFileBuffer(id: string, filename: string): Promise<{ buffer: Buffer; mimeType: string; originalName: string } | null> {
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
    return {
      buffer: file.buffer,
      mimeType: file.mimeType,
      originalName: file.originalName
    };
  } catch (error) {
    console.error('Error getting file buffer:', error);
    return null;
  }
}

// Delete clipboard
export async function deleteClipboard(id: string): Promise<boolean> {
  try {
    await connectDB();
    
    const result = await Clipboard.findOneAndDelete({ id });
    return !!result;
  } catch (error) {
    console.error('Error deleting clipboard:', error);
    return false;
  }
}

// Get all clipboard IDs (for cleanup)
export async function getAllClipboardIds(): Promise<string[]> {
  try {
    await connectDB();
    
    const clipboards = await Clipboard.find({}, { id: 1 });
    return clipboards.map(c => c.id);
  } catch (error) {
    console.error('Error getting clipboard IDs:', error);
    return [];
  }
}

// Get all clipboards (sorted by most recent)
export async function getAllClipboards(limit: number = 50): Promise<ClipboardData[]> {
  try {
    await connectDB();
    
    const clipboards = await Clipboard.find({})
      .sort({ createdAt: -1 }) // Most recent first
      .limit(limit)
      .select('id content files createdAt lastAccessed expiresAt');
    
    return clipboards.map(clipboard => ({
      id: clipboard.id,
      content: clipboard.content,
      files: clipboard.files.map((file: IClipboardFile) => ({
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        uploadTime: file.uploadTime.toISOString(),
        mimeType: file.mimeType
      })),
      createdAt: clipboard.createdAt.toISOString(),
      lastAccessed: clipboard.lastAccessed.toISOString(),
      expiresAt: clipboard.expiresAt.toISOString()
    }));
  } catch (error) {
    console.error('Error getting all clipboards:', error);
    return [];
  }
}

// Cleanup expired clipboards (MongoDB TTL handles this automatically, but we can also do manual cleanup)
export async function cleanupExpiredClipboards(): Promise<number> {
  try {
    await connectDB();
    
    const result = await Clipboard.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    return result.deletedCount || 0;
  } catch (error) {
    console.error('Error cleaning up expired clipboards:', error);
    return 0;
  }
}
