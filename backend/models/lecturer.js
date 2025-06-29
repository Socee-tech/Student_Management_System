import mongoose from "mongoose";

const lecturerSchema = new mongoose.Schema(
    {
        name: String,
        email: {type: String, unique: true},
        department: {
            type: String,
            enum: ['Cs', 'Mathematics', 'Science', 'Humanities', 'Engineering'],
            required: true
        },
        courses: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Courses'            
        }]
    },
    {
        timestamps: true
    }
)

const Lecturer =  mongoose.model('Lecturers', lecturerSchema);
export default Lecturer;