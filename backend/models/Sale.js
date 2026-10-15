import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    qty: Number,
    cost: Number
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, required: true, unique: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD hh:mm AM'
    customerName: { type: String, default: 'Walk-in Customer' },
    items: [saleItemSchema],
    subtotal: Number,
    discount: Number,
    total: Number,
    profit: Number,
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Easypaisa', 'JazzCash', 'Bank Transfer'],
      default: 'Cash'
    }
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      // The React UI shows `sale.id` as the invoice number and reads
      // `item.id` for each line, so shape the JSON accordingly.
      transform(doc, ret) {
        ret.id = ret.invoiceId;
        ret.items = (ret.items || []).map((i) => ({
          id: i.productId ? String(i.productId) : undefined,
          productId: i.productId ? String(i.productId) : undefined,
          name: i.name,
          price: i.price,
          qty: i.qty,
          cost: i.cost
        }));
        return ret;
      }
    }
  }
);

export default mongoose.model('Sale', saleSchema);
