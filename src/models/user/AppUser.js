import mongoose from 'mongoose';

const AppUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 6,
        maxlength: 50
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