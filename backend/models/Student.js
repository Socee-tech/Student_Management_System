import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        studentId: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        courses:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Courses"
        }],
        year: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Student', studentSchema);