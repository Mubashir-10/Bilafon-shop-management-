import mongoose from 'mongoose';
import { baseJSON } from './_transform.js';

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    description: String
  },
  { timestamps: true, toJSON: baseJSON }
);

export default mongoose.model('Expense', expenseSchema);
