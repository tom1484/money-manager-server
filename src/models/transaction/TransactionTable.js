import { Schema, model, Types } from 'mongoose';

import { TransactionSchema } from '@models/transaction/Transaction';

const TransactionTableSchema = new Schema({
    // appUserID: {
    //     type: [Schema.Types.ObjectId],
    //     required: true,
    // },
    transactions: {
        type: [Types.ObjectId],
        required: true,
    },
});

const TransactionTableModel = model('TransactionTable', TransactionTableSchema);

export { TransactionTableModel, TransactionTableSchema };