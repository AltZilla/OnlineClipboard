# Online Clipboard App - Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MongoDB:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your MongoDB connection string
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
OnlineClipboard/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── clipboard/[id]/    # Dynamic clipboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ClipboardForm.tsx  # Text input form
│   ├── FileUpload.tsx     # File upload with drag & drop
│   └── ClipboardViewer.tsx # Content display
├── lib/                   # Utility functions
│   ├── storage.ts         # File-based storage
│   └── cleanup.ts         # Auto-cleanup logic
├── data/                  # Storage directories
│   ├── clipboards/        # JSON metadata files
│   └── files/             # Uploaded files
└── middleware.ts          # Auto-cleanup middleware
```

## Features Implemented

✅ **Text Sharing**: Create and share text content with unique IDs
✅ **File Upload**: Drag & drop file upload (up to 50MB) on both main page and clipboard page
✅ **MongoDB Storage**: Reliable database storage with automatic cleanup
✅ **Auto-Expiry**: Clipboards expire after 24 hours using MongoDB TTL
✅ **Responsive UI**: Modern design with Tailwind CSS
✅ **File Download**: Download uploaded files with original names and MIME types
✅ **Copy to Clipboard**: One-click text copying
✅ **Vercel Ready**: Configured for seamless deployment with MongoDB

## API Endpoints

- `POST /api/clipboard` - Create new clipboard
- `GET /api/clipboard/[id]` - Get clipboard data
- `PUT /api/clipboard/[id]` - Update clipboard content
- `DELETE /api/clipboard/[id]` - Delete clipboard
- `POST /api/clipboard/[id]/upload` - Upload file
- `GET /api/clipboard/[id]/file/[filename]` - Download file

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

## Deployment

The app is ready for Vercel deployment:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
4. Deploy automatically

**Important Notes:**
- API routes are configured to use Node.js runtime for MongoDB access
- Files are stored in MongoDB as binary data (fully serverless!)
- MongoDB TTL indexes automatically clean up expired documents
- No file system dependencies - works perfectly on Vercel!

## Usage

1. **Create Clipboard**: Enter text and click "Create Clipboard"
2. **Share ID**: Copy the 8-character ID and share it
3. **Upload Files**: Drag & drop files or click to upload
4. **Access Anywhere**: Use the ID on any device to access content
5. **Auto-Cleanup**: Content expires after 24 hours

## Security

- Unique IDs prevent unauthorized access
- Automatic expiration after 24 hours
- File size limits (50MB)
- Input validation and sanitization
- No persistent user data

Your online clipboard app is now ready to use! 🎉
