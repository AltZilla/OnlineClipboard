import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
    accountId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

if (mongoose.models.Account) {
    delete mongoose.models.Account;
}

export default mongoose.model('Account', AccountSchema);
