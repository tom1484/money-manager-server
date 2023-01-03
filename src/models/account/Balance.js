import { Schema } from 'mongoose';

const BalanceSchema = new Schema({
    year: {
        type: Number,
        required: true,
    },
    month: {
        type: Number,
        required: true,
    },
    day: {
        type: Number,
        required: true,
    },
    deposit: {
        type: Number,
        required: true,
    },
    withdrawal: {
        type: Number,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
});

export { BalanceSchema };