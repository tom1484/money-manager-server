import mongoose from 'mongoose';

const AppUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    transactionTable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransactionTable',
        required: true,
    },
    accountTable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountTable',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const AppUserModel = mongoose.model('AppUser', AppUserSchema);

export { AppUserModel as default, AppUserSchema };
