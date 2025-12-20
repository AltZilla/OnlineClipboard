import mongoose, { Document, Schema } from 'mongoose';

export interface IClipboardFile {
  filename: string;
  originalName: string;
  size: number;
  uploadTime: Date;
  mimeType: string;
  gridfsId: string; // GridFS file ID instead of buffer
}

export interface IClipboard extends Document {
  id: string;
  content: string;
  files: IClipboardFile[];
  isPublic: boolean;
  sentToReceiveCode?: string; // If sent to a specific receive code
  createdAt: Date;
  lastAccessed: Date;
  expiresAt: Date;
}

const ClipboardFileSchema = new Schema<IClipboardFile>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  uploadTime: { type: Date, default: Date.now },
  mimeType: { type: String, required: true },
  gridfsId: { type: String, required: true } // GridFS file ID
}, { _id: false });

const ClipboardSchema = new Schema<IClipboard>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  content: {
    type: String,
    default: ''
  },
  files: [ClipboardFileSchema],
  isPublic: {
    type: Boolean,
    default: false
  },
  sentToReceiveCode: {
    type: String,
    index: true,
    sparse: true // Only index documents that have this field
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
}, {
  timestamps: false // We're managing timestamps manually
});

// Index for automatic cleanup
ClipboardSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for inbox queries
ClipboardSchema.index({ sentToReceiveCode: 1, createdAt: -1 });

// Update lastAccessed on find operations
ClipboardSchema.pre('findOneAndUpdate', function () {
  this.set({ lastAccessed: new Date() });
});

// Clear the model cache to ensure schema updates are applied
if (mongoose.models.Clipboard) {
  delete mongoose.models.Clipboard;
}

export default mongoose.model<IClipboard>('Clipboard', ClipboardSchema);

