import { getClipboard, deleteClipboard, getAllClipboardIds } from './storage';

export function cleanupExpiredClipboards(): number {
  const ids = getAllClipboardIds();
  let deletedCount = 0;
  
  for (const id of ids) {
    const clipboard = getClipboard(id);
    if (!clipboard) continue;
    
    const createdAt = new Date(clipboard.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    // Delete if older than 24 hours
    if (hoursDiff >= 24) {
      if (deleteClipboard(id)) {
        deletedCount++;
        console.log(`Deleted expired clipboard: ${id}`);
      }
    }
  }
  
  return deletedCount;
}

// Cleanup on startup (optional)
export function scheduleCleanup() {
  // Run cleanup immediately
  cleanupExpiredClipboards();
  
  // Schedule cleanup every hour
  setInterval(() => {
    const deletedCount = cleanupExpiredClipboards();
    if (deletedCount > 0) {
      console.log(`Cleanup completed: ${deletedCount} expired clipboards deleted`);
    }
  }, 60 * 60 * 1000); // 1 hour
}
