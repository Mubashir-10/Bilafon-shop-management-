import mongoose from 'mongoose';
import { baseJSON } from './_transform.js';

// One row per (product, day, rate, supplier). Adding stock for the same
// product at the same rate on the same day just increases the quantity,
// so "+1, +1, +1" clicks don't flood the ledger.
const stockPurchaseSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    sku: String,
    supplier: { type: String, default: '' },
    purchasePrice: { type: Number, required: true, min: 0 }, // Khareed rate per piece
    quantity: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    date: { type: String, required: true } // 'YYYY-MM-DD'
  },
  { timestamps: true, toJSON: baseJSON }
);

stockPurchaseSchema.index({ productId: 1, date: 1, purchasePrice: 1, supplier: 1 }, { unique: true });
stockPurchaseSchema.index({ date: 1 });

export default mongoose.model('StockPurchase', stockPurchaseSchema);
