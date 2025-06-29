import express from 'express';
import Student from '../models/Student.js'; // Import your Student model
import Course from '../models/courses.js';

const router = express.Router();

// Route to create a new student
router.post('/', async (req, res) => {
    try {
        const { name, studentId, email, courses, year } = req.body;

        // Validate required fields
        if (!name || !studentId || !email || !year) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create new student
        const newStudent = new Student({
            name,
            studentId,
            email,
            courses: courses || [], // Default to empty array if not provided
            year
        });

        // Save to database
        const savedStudent = await newStudent.save();

        res.status(201).json(savedStudent);
    } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                error: `${field} already exists`,
                field
            });
        }

        // Handle other errors
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Route to get all students
router.get('/', async (req, res) => {
    try {
        // Find all students and optionally populate the courses if needed
        const students = await Student.find({}).populate({
            path: 'courses',
            select: 'code title -_id'
        });

        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
});

// Route to get a single student by studentId
router.get('/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find student by studentId and populate courses if needed
        const student = await Student.findOne({ studentId }).populate({
            path: 'courses',
            select: 'code title -_id'
        });

        if (!student) {
            return res.status(404).json({
                error: 'Student not found',
                message: `No student found with studentId: ${studentId}`
            });
        }

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
});

// Route to update a student by studentId
router.put('/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const updateData = req.body;

        // Validate that we're not trying to update studentId (if you want to prevent this)
        if (updateData.studentId) {
            return res.status(400).json({
                error: 'Cannot update studentId field'
            });
        }

        // Find and update the student
        const updatedStudent = await Student.findOneAndUpdate(
            { studentId }, // Find by studentId
            updateData,    // Update with request body
            {
                new: true,         // Return the updated document
                runValidators: true // Run schema validators on update
            }
        ).populate({
            path: 'courses',
            select: 'code title -_id'
        });

        if (!updatedStudent) {
            return res.status(404).json({
                error: 'Student not found',
                message: `No student found with studentId: ${studentId}`
            });
        }

        res.status(200).json(updatedStudent);
    } catch (error) {
        // Handle duplicate key errors (for unique fields like email)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                error: `${field} already exists`,
                field
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                details: error.message
            });
        }

        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
});

// Route to delete a student by studentId
router.delete('/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find and delete the student
        const deletedStudent = await Student.findOneAndDelete({ studentId });

        if (!deletedStudent) {
            return res.status(404).json({
                error: 'Student not found',
                message: `No student found with studentId: ${studentId}`
            });
        }

        res.status(200).json({
            message: 'Student deleted successfully',
            deletedStudent
        });
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
});

export default router;