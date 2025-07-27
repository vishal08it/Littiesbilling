import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'cashier' },
  status: { type: String, enum: ['yes', 'no'], default: 'yes' }, // ✅ Added
}, { collection: 'users', timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);

