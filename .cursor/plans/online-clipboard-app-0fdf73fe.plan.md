<!-- 0fdf73fe-2265-40ab-b5b6-9ca90ae67c29 cb61b9f4-5ff4-4125-bf99-b4bb7685e944 -->
# Online Clipboard Application

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Storage**: File-based (JSON for metadata, filesystem for files)
- **Deployment**: Vercel-ready configuration

## Architecture

### API Routes (Next.js API)

- `POST /api/clipboard` - Create new clipboard with unique ID
- `GET /api/clipboard/[id]` - Retrieve clipboard data
- `POST /api/clipboard/[id]/upload` - Upload files to clipboard
- `GET /api/clipboard/[id]/file/[filename]` - Download file
- `DELETE /api/clipboard/[id]` - Manual cleanup (optional)

### Frontend Pages

- **Home Page** (`/`) - Create new clipboard or access existing one
- **Clipboard Page** (`/clipboard/[id]`) - View/edit clipboard content, upload/download files

## Key Features

1. Generate unique 8-character IDs for each clipboard
2. Store text content and file metadata in JSON files
3. Store uploaded files in organized directory structure
4. Display clipboard content with copy-to-clipboard functionality
5. File upload with drag-and-drop support (max 50MB)
6. Auto-cleanup of clipboards older than 24 hours
7. Responsive UI with Tailwind CSS

## File Structure

```
/app
  /page.tsx                    # Landing page
  /clipboard/[id]/page.tsx     # Clipboard view/edit page
  /api
    /clipboard
      /route.ts                # Create clipboard
      /[id]/route.ts           # Get/delete clipboard
      /[id]/upload/route.ts    # File upload
      /[id]/file/[filename]/route.ts  # File download
/lib
  /storage.ts                  # File-based storage utilities
  /cleanup.ts                  # Cleanup expired clipboards
/data
  /clipboards                  # JSON metadata files
  /files                       # Uploaded files organized by ID
/components
  /ClipboardForm.tsx           # Text input component
  /FileUpload.tsx              # File upload component
  /ClipboardViewer.tsx         # Display clipboard content
```

## Implementation Notes

- Use `nanoid` for generating unique IDs
- Implement middleware for automatic cleanup on each request
- Use `formidable` or Next.js native file handling for uploads
- Add proper error handling and validation
- Use Vercel's serverless functions (API routes work seamlessly)
- Configure `vercel.json` for proper file upload limits

## Vercel Considerations

- Serverless functions have 50MB body size limit (matches requirement)
- Use `/tmp` directory for temporary file storage on Vercel
- Consider Vercel Blob Storage for production (optional upgrade path)
- Set appropriate environment variables for storage paths

### To-dos

- [ ] Initialize Next.js project with TypeScript and Tailwind CSS, install dependencies
- [ ] Create file-based storage utilities for managing clipboard data and files
- [ ] Implement API routes for creating, retrieving, uploading, and downloading clipboard data
- [ ] Build landing page and clipboard view/edit page with Tailwind styling
- [ ] Create reusable components for clipboard form, file upload, and content viewer
- [ ] Implement automatic cleanup of expired clipboards (24-hour expiration)
- [ ] Configure Vercel deployment settings and test deployment readiness