import { Schema, model, Types } from 'mongoose';

const AccessRecordSchema = new Schema({
    date: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    transaction: {
        type: Types.ObjectId,
        ref: 'Transaction',
        required: true,
    }
});

export { AccessRecordSchema };