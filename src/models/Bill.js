import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  price: Number,
});

const billSchema = new mongoose.Schema({
  customerName: String,
  customerMobile: String,
  cashier: String, // ✅ Add this
  items: [Object],
  total: Number,
  createdAt: { type: Date, default: Date.now },
});


export default mongoose.models.Bill || mongoose.model('Bill', billSchema);
