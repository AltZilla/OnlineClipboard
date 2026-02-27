import mongoose from 'mongoose';

const ClipboardFileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    uploadTime: { type: Date, default: Date.now },
    mimeType: { type: String, required: true },
    gridfsId: { type: String, required: true }
}, { _id: false });

const ClipboardSchema = new mongoose.Schema({
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
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
}, {
    timestamps: false
});

ClipboardSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

ClipboardSchema.pre('findOneAndUpdate', function () {
    this.set({ lastAccessed: new Date() });
});

if (mongoose.models.Clipboard) {
    delete mongoose.models.Clipboard;
}

export default mongoose.model('Clipboard', ClipboardSchema);
