import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Courses',
            required: true
        },
        grade: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
)
// prevent entry of the same student+course pair
gradeSchema.index({ student: 1, course: 1 }, { unique: true });


const grade =  mongoose.model('Grade', gradeSchema);
export default grade;