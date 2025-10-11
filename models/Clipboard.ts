import mongoose, { Document, Schema } from 'mongoose';

export interface IClipboardFile {
  filename: string;
  originalName: string;
  size: number;
  uploadTime: Date;
  mimeType: string;
  buffer: Buffer;
}

export interface IClipboard extends Document {
  id: string;
  content: string;
  files: IClipboardFile[];
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
  buffer: { type: Buffer, required: true }
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

// Update lastAccessed on find operations
ClipboardSchema.pre('findOneAndUpdate', function() {
  this.set({ lastAccessed: new Date() });
});

export default mongoose.models.Clipboard || mongoose.model<IClipboard>('Clipboard', ClipboardSchema);
