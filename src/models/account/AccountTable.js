import { Schema, model, Types } from 'mongoose';
import { AccountSchema } from '@models/account/Account';

const AccountTableSchema = new Schema({
    accounts: {
        type: [Types.ObjectId],
        required: true,
    },
});

const AccountTableModel = model('AccountTable', AccountTableSchema);

export { AccountTableModel, AccountTableSchema };