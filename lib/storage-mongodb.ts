import connectDB from './mongodb';
import Clipboard, { IClipboard, IClipboardFile } from '@/models/Clipboard';
import { uploadFileToGridFS, downloadFileFromGridFS, deleteClipboardFilesFromGridFS } from './gridfs';

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
  isPublic: boolean;
  sentToReceiveCode?: string;
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

// Create new clipboard
export async function createClipboard(content: string = '', isPublic: boolean = false, sentToReceiveCode?: string): Promise<ClipboardData> {
  const id = await generateId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  await connectDB();

  console.log(`Creating clipboard with isPublic: ${isPublic}, type: ${typeof isPublic}`);

  const clipboardData: any = {
    id,
    content,
    files: [],
    isPublic: Boolean(isPublic),
    createdAt: now,
    lastAccessed: now,
    expiresAt
  };

  // Add sentToReceiveCode if provided
  if (sentToReceiveCode) {
    clipboardData.sentToReceiveCode = sentToReceiveCode.toLowerCase().trim();
  }

  const clipboard = new Clipboard(clipboardData);

  console.log(`Clipboard object before save - isPublic: ${clipboard.isPublic}, type: ${typeof clipboard.isPublic}`);

  // Explicitly mark the field as modified to ensure it's saved
  clipboard.markModified('isPublic');
  await clipboard.save({ validateBeforeSave: true });

  // Verify it was saved correctly by fetching it back
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

    // Upload file to GridFS
    const gridfsId = await uploadFileToGridFS(buffer, file.filename, {
      clipboardId: id,
      originalName: file.originalName,
      mimeType: file.mimeType
    });

    // Store file metadata in clipboard document
    const fileData: IClipboardFile = {
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

// Get file buffer from clipboard
export async function getFileBuffer(id: string, filename: string): Promise<{ buffer: Buffer; mimeType: string; originalName: string } | null> {
  try {
    await connectDB();

    // Get file metadata from clipboard document
    const clipboard = await Clipboard.findOne(
      { id, 'files.filename': filename },
      { 'files.$': 1 }
    );

    if (!clipboard || !clipboard.files.length) {
      return null;
    }

    const file = clipboard.files[0];

    // Download file from GridFS using the stored GridFS ID
    const fileData = await downloadFileFromGridFS(file.gridfsId);

    if (!fileData) {
      return null;
    }

    // Return file data with metadata from clipboard (in case GridFS metadata is missing)
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

// Delete clipboard
export async function deleteClipboard(id: string): Promise<boolean> {
  try {
    await connectDB();

    // Delete all GridFS files associated with this clipboard
    await deleteClipboardFilesFromGridFS(id);

    // Delete the clipboard document
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
export async function getAllClipboards(limit: number = 50, publicOnly: boolean = false): Promise<ClipboardData[]> {
  try {
    await connectDB();

    // Use simpler query - MongoDB handles boolean true directly
    const query = publicOnly ? { isPublic: true } : {};
    console.log('Query for clipboards:', JSON.stringify(query), 'publicOnly:', publicOnly);

    // Also check all clipboards to see what's in the database
    const allClipboards = await Clipboard.find({}).select('id isPublic createdAt').limit(10).sort({ createdAt: -1 });
    console.log('Sample of all clipboards in DB (most recent 10):', allClipboards.map(c => ({
      id: c.id,
      isPublic: c.isPublic,
      isPublicType: typeof c.isPublic,
      createdAt: c.createdAt
    })));

    const clipboards = await Clipboard.find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .limit(limit)
      .select('id content files isPublic createdAt lastAccessed expiresAt');

    console.log(`Found ${clipboards.length} clipboards with query { isPublic: true }. Sample:`, clipboards.slice(0, 3).map(c => ({ id: c.id, isPublic: c.isPublic, isPublicType: typeof c.isPublic })));

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

// Cleanup expired clipboards (MongoDB TTL handles this automatically, but we can also do manual cleanup)
export async function cleanupExpiredClipboards(): Promise<number> {
  try {
    await connectDB();

    // Find expired clipboards
    const expiredClipboards = await Clipboard.find({
      expiresAt: { $lt: new Date() }
    });

    // Delete GridFS files for each expired clipboard
    for (const clipboard of expiredClipboards) {
      await deleteClipboardFilesFromGridFS(clipboard.id);
    }

    // Delete the clipboard documents
    const result = await Clipboard.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    return result.deletedCount || 0;
  } catch (error) {
    console.error('Error cleaning up expired clipboards:', error);
    return 0;
  }
}

// Get clipboards sent to a specific receive code (inbox)
export async function getInboxClipboards(receiveCode: string, limit: number = 50): Promise<ClipboardData[]> {
  try {
    await connectDB();

    const clipboards = await Clipboard.find({
      sentToReceiveCode: receiveCode.toLowerCase().trim()
    })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(limit)
      .select('id content files isPublic sentToReceiveCode createdAt lastAccessed expiresAt');

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
      isPublic: clipboard.isPublic,
      sentToReceiveCode: clipboard.sentToReceiveCode,
      createdAt: clipboard.createdAt.toISOString(),
      lastAccessed: clipboard.lastAccessed.toISOString(),
      expiresAt: clipboard.expiresAt.toISOString()
    }));
  } catch (error) {
    console.error('Error getting inbox clipboards:', error);
    return [];
  }
}
