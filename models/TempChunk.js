import mongoose from 'mongoose';

const TempChunkSchema = new mongoose.Schema({
    uploadId: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    data: { type: Buffer, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // auto-delete after 1 hour
});

// Compound index for efficient lookups
TempChunkSchema.index({ uploadId: 1, chunkIndex: 1 }, { unique: true });

export default mongoose.models.TempChunk || mongoose.model('TempChunk', TempChunkSchema);
