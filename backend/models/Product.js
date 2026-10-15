import mongoose from 'mongoose';
import { baseJSON } from './_transform.js';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true },
    brand: String,
    model: String,
    purchasePrice: { type: Number, required: true, default: 0, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, default: 0, min: 0 },
    minStockLevel: { type: Number, default: 3, min: 0 },
    supplier: String
  },
  { timestamps: true, toJSON: baseJSON }
);

export default mongoose.model('Product', productSchema);
