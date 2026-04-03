import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  count: { type: Number, default: 0 },
  googleId: { type: String, unique: true }
}, { timestamps: true });

const UserModel = mongoose.model("User", userSchema);

export default UserModel;