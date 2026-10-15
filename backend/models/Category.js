import mongoose from 'mongoose';
import { baseJSON } from './_transform.js';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    status: { type: String, default: 'Active' }
  },
  { toJSON: baseJSON }
);

export default mongoose.model('Category', categorySchema);
