import { Schema, model, Types } from 'mongoose';

const TransactionSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  accountSource: {
    type: String,
  },
  accountDestination: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  }
});

const TransactionModel = model('Transaction', TransactionSchema);

export { TransactionSchema, TransactionModel };