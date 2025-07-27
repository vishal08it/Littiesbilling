import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  description: String,
}, {
  timestamps: true,
});

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);
