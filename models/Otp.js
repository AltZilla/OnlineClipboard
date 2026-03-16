import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

if (mongoose.models.Otp) {
    delete mongoose.models.Otp;
}

export default mongoose.model('Otp', OtpSchema);
