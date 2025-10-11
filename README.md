# Online Clipboard App

A modern online clipboard application that allows you to share text and files between devices using a unique ID. Built with Next.js 14, TypeScript, Tailwind CSS, and MongoDB.

## Features

- 📝 **Text Sharing**: Share any text content instantly
- 📁 **File Upload**: Upload files up to 50MB with drag-and-drop support
- 🔒 **Secure & Temporary**: Auto-expires after 24 hours for security
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- ⚡ **Fast**: Built with Next.js 14 and optimized for performance
- 🌐 **Cross-platform**: Works on any device with a web browser
- 💾 **MongoDB Storage**: Reliable database storage with automatic cleanup
- 📱 **File Upload on Main Page**: Upload files directly when creating clipboards

## How It Works

1. **Create a Clipboard**: Enter text and optionally upload files on the main page
2. **Share the ID**: Share the unique 8-character ID with others
3. **Access Anywhere**: Use the same ID to access your clipboard from any device
4. **Auto-Expiry**: Clipboards automatically expire after 24 hours

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **File Storage**: MongoDB GridFS (files stored as binary data)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB instance (local or MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd online-clipboard-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure MongoDB connection in `.env.local`:
```bash
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/online-clipboard

# For MongoDB Atlas (recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/online-clipboard
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env.local` file

### Option 2: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/online-clipboard` as your connection string

## API Endpoints

- `POST /api/clipboard` - Create new clipboard
- `GET /api/clipboard/[id]` - Retrieve clipboard data
- `PUT /api/clipboard/[id]` - Update clipboard content
- `DELETE /api/clipboard/[id]` - Delete clipboard
- `POST /api/clipboard/[id]/upload` - Upload file to clipboard
- `GET /api/clipboard/[id]/file/[filename]` - Download file

## Database Schema

### Clipboard Collection
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

## Deployment on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
4. Deploy automatically

**Important Notes:**
- API routes are configured to use Node.js runtime for MongoDB access
- Files are stored in MongoDB as binary data (GridFS-like)
- MongoDB TTL indexes automatically clean up expired documents
- No file system dependencies - fully serverless!

## File Structure

```
/app
  /page.tsx                    # Landing page with file upload
  /clipboard/[id]/page.tsx     # Clipboard view/edit page
  /api
    /clipboard
      /route.ts                # Create clipboard
      /[id]/route.ts           # Get/update/delete clipboard
      /[id]/upload/route.ts    # File upload
      /[id]/file/[filename]/route.ts  # File download
/lib
  /storage-mongodb.ts          # MongoDB storage utilities
  /mongodb.ts                  # MongoDB connection
/models
  /Clipboard.ts                # Mongoose model
/components
  /ClipboardForm.tsx           # Text input component
  /FileUpload.tsx              # File upload component
  /ClipboardViewer.tsx         # Display clipboard content
```

## Security Features

- Unique 8-character IDs prevent unauthorized access
- Automatic expiration after 24 hours using MongoDB TTL
- File size limits (50MB)
- Input validation and sanitization
- No persistent user data storage
- MongoDB connection string environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).