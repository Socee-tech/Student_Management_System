import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true
        },
        title: {
            type: String,
            required: true
        },
        credits: Number
    },
    {
        timestamps: true
    }
)

const Course =  mongoose.model('Courses', courseSchema);
export default Course;