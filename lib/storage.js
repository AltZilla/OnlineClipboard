import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';
const isVercel = process.env.VERCEL === '1';
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const CLIPBOARDS_DIR = path.join(DATA_DIR, 'clipboards');
const FILES_DIR = path.join(DATA_DIR, 'files');
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
    }
}
export function generateId() {
    return nanoid(8);
}
export function getClipboard(id) {
    try {
        ensureDirectories();
        const filePath = path.join(CLIPBOARDS_DIR, `${id}.json`);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const data = fs.readFileSync(filePath, 'utf-8');
        const clipboard = JSON.parse(data);
        clipboard.lastAccessed = new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(clipboard, null, 2));
        return clipboard;
    } catch (error) {
        console.error('Error reading clipboard:', error);
        return null;
    }
}
export function createClipboard(content = '') {
    const id = generateId();
    const now = new Date().toISOString();
    const clipboard = {
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
export function updateClipboard(id, content) {
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
export function addFileToClipboard(id, file) {
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
export function getFilePath(id, filename) {
    return path.join(FILES_DIR, id, filename);
}
export function saveFile(id, filename, buffer) {
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
export function deleteClipboard(id) {
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
export function getAllClipboardIds() {
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
