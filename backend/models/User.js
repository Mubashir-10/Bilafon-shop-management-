import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }
});

// Never leak the password hash in API responses.
userSchema.set('toJSON', {
  versionKey: false,
  transform(doc, ret) {
    ret.id = String(ret._id);
    delete ret.password;
    return ret;
  }
});

export default mongoose.model('User', userSchema);
