import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';

// Use /tmp directory on Vercel, or local data directory for development
const isVercel = process.env.VERCEL === '1';
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const CLIPBOARDS_DIR = path.join(DATA_DIR, 'clipboards');
const FILES_DIR = path.join(DATA_DIR, 'files');

export interface ClipboardData {
  id: string;
  content: string;
  files: Array<{
    filename: string;
    originalName: string;
    size: number;
    uploadTime: string;
  }>;
  createdAt: string;
  lastAccessed: string;
}

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  uploadTime: string;
}

// Ensure directories exist
export function ensureDirectories() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CLIPBOARDS_DIR)) {
      fs.mkdirSync(CLIPBOARDS_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILES_DIR)) {
      fs.mkdirSync(FILES_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating directories:', error);
    // On Vercel, directories might already exist or be created automatically
  }
}

// Generate unique ID
export function generateId(): string {
  return nanoid(8);
}

// Get clipboard data
export function getClipboard(id: string): ClipboardData | null {
  try {
    ensureDirectories();
    const filePath = path.join(CLIPBOARDS_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    const clipboard: ClipboardData = JSON.parse(data);
    
    // Update last accessed time
    clipboard.lastAccessed = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(clipboard, null, 2));
    
    return clipboard;
  } catch (error) {
    console.error('Error reading clipboard:', error);
    return null;
  }
}

// Create new clipboard
export function createClipboard(content: string = ''): ClipboardData {
  const id = generateId();
  const now = new Date().toISOString();
  
  const clipboard: ClipboardData = {
    id,
    content,
    files: [],
    createdAt: now,
    lastAccessed: now,
  };
  
  ensureDirectories();
  const filePath = path.join(CLIPBOARDS_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(clipboard, null, 2));
  
  return clipboard;
}

// Update clipboard content
export function updateClipboard(id: string, content: string): boolean {
  try {
    const clipboard = getClipboard(id);
    if (!clipboard) {
      return false;
    }
    
    clipboard.content = content;
    clipboard.lastAccessed = new Date().toISOString();
    
    const filePath = path.join(CLIPBOARDS_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(clipboard, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error updating clipboard:', error);
    return false;
  }
}

// Add file to clipboard
export function addFileToClipboard(id: string, file: UploadedFile): boolean {
  try {
    const clipboard = getClipboard(id);
    if (!clipboard) {
      return false;
    }
    
    clipboard.files.push(file);
    clipboard.lastAccessed = new Date().toISOString();
    
    const filePath = path.join(CLIPBOARDS_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(clipboard, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error adding file to clipboard:', error);
    return false;
  }
}

// Get file path
export function getFilePath(id: string, filename: string): string {
  return path.join(FILES_DIR, id, filename);
}

// Save uploaded file
export function saveFile(id: string, filename: string, buffer: Buffer): boolean {
  try {
    ensureDirectories();
    const fileDir = path.join(FILES_DIR, id);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    
    const filePath = path.join(fileDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    return true;
  } catch (error) {
    console.error('Error saving file:', error);
    return false;
  }
}

// Delete clipboard and its files
export function deleteClipboard(id: string): boolean {
  try {
    const filePath = path.join(CLIPBOARDS_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    const fileDir = path.join(FILES_DIR, id);
    if (fs.existsSync(fileDir)) {
      fs.rmSync(fileDir, { recursive: true, force: true });
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting clipboard:', error);
    return false;
  }
}

// Get all clipboard IDs (for cleanup)
export function getAllClipboardIds(): string[] {
  try {
    ensureDirectories();
    if (!fs.existsSync(CLIPBOARDS_DIR)) {
      return [];
    }
    
    const files = fs.readdirSync(CLIPBOARDS_DIR);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('Error getting clipboard IDs:', error);
    return [];
  }
}
