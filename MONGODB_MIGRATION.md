# MongoDB Migration Guide

## Overview
The Online Clipboard App has been enhanced with MongoDB integration and file upload capability on the main page.

## New Features Added

### 1. File Upload on Main Page
- ✅ Added file upload component to the main page
- ✅ Users can now upload files when creating a clipboard
- ✅ Multiple file selection and preview
- ✅ File removal capability before creation

### 2. MongoDB Integration
- ✅ Replaced file system storage with MongoDB
- ✅ Files stored as binary data in MongoDB documents
- ✅ Automatic TTL (Time To Live) for 24-hour expiration
- ✅ Better scalability and reliability

## Technical Changes

### New Dependencies
```json
{
  "mongodb": "^6.3.0",
  "mongoose": "^8.0.3"
}
```

### New Files Created
- `lib/mongodb.ts` - MongoDB connection utility
- `lib/storage-mongodb.ts` - MongoDB-based storage functions
- `models/Clipboard.ts` - Mongoose schema and model
- `.env.local.example` - Environment configuration template

### Updated Files
- `app/page.tsx` - Added file upload functionality
- `app/api/clipboard/route.ts` - Updated to use MongoDB
- `app/api/clipboard/[id]/route.ts` - Updated to use MongoDB
- `app/api/clipboard/[id]/upload/route.ts` - Updated to use MongoDB
- `app/api/clipboard/[id]/file/[filename]/route.ts` - Updated to use MongoDB
- `components/ClipboardViewer.tsx` - Updated imports
- `app/clipboard/[id]/page.tsx` - Updated imports

## Database Schema

### Clipboard Document
```typescript
{
  id: string;           // Unique 8-character ID
  content: string;      // Text content
  files: Array<{        // Array of uploaded files
    filename: string;   // Generated unique filename
    originalName: string; // Original filename
    size: number;       // File size in bytes
    uploadTime: Date;   // Upload timestamp
    mimeType: string;   // MIME type
    buffer: Buffer;     // File binary data
  }>;
  createdAt: Date;      // Creation timestamp
  lastAccessed: Date;   // Last access timestamp
  expiresAt: Date;      // Expiration timestamp (24 hours)
}
```

## Setup Instructions

### 1. Environment Configuration
Create `.env.local` file:
```bash
MONGODB_URI=mongodb://localhost:27017/online-clipboard
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/online-clipboard
```

### 2. MongoDB Setup Options

#### Option A: MongoDB Atlas (Recommended)
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Get connection string
4. Add to `.env.local`

#### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use local connection string

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

## Migration Benefits

### Performance
- ✅ Faster file operations (no file system I/O)
- ✅ Better concurrent access handling
- ✅ Reduced server load

### Scalability
- ✅ Horizontal scaling support
- ✅ Cloud-native architecture
- ✅ No file system limitations

### Reliability
- ✅ ACID transactions
- ✅ Automatic backup and replication
- ✅ Better error handling

### Deployment
- ✅ Fully serverless (no file system dependencies)
- ✅ Perfect for Vercel deployment
- ✅ Automatic cleanup via MongoDB TTL

## Testing

### Local Testing
1. Set up MongoDB connection
2. Run `npm run dev`
3. Test file upload on main page
4. Test clipboard creation and access
5. Verify file downloads work

### Production Deployment
1. Set up MongoDB Atlas cluster
2. Configure environment variables in Vercel
3. Deploy to Vercel
4. Test all functionality

## Rollback Plan
If needed, the app can be rolled back to file system storage by:
1. Reverting API routes to use `lib/storage.ts`
2. Removing MongoDB dependencies
3. Restoring file system cleanup logic

## Support
- MongoDB Atlas provides free tier (512MB storage)
- Local MongoDB is free for development
- All features remain the same from user perspective
- Better performance and reliability
