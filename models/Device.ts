import mongoose, { Document, Schema } from 'mongoose';

// Simplified device model - just a receive code linked to push subscription
export interface IDevice extends Document {
    receiveCode: string; // User's personal receive code (e.g., "lakshman123")
    deviceName: string; // User-friendly name like "My Phone"
    pushSubscription?: {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    };
    lastSeen: Date;
    createdAt: Date;
}

const DeviceSchema = new Schema<IDevice>({
    receiveCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true
    },
    deviceName: {
        type: String,
        required: true,
        default: 'My Device'
    },
    pushSubscription: {
        endpoint: String,
        keys: {
            p256dh: String,
            auth: String
        }
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

// Clear model cache to ensure schema updates are applied
if (mongoose.models.Device) {
    delete mongoose.models.Device;
}

export default mongoose.model<IDevice>('Device', DeviceSchema);
