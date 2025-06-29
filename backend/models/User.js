import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: String,
        email: { type: String, required: true, unique: true},
        password: {type: String, required: true},
        role: { type: String, enum: ['admin', 'student'], default: 'student'},
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);
export default User;