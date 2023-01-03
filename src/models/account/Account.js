import { Schema, model, Types } from 'mongoose';
import { BalanceSchema } from './Balance';
import { AccessRecordSchema } from './AccessRecord';

const AccountSchema = new Schema({
    group: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    balances: {
        type: [BalanceSchema],
        required: true,
    },
    accessRecords: {
        type: [AccessRecordSchema],
        required: true,
    },
});

const AccountModel = model('Account', AccountSchema);

export { AccountSchema, AccountModel };