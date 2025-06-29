import Lecturer from "../models/lecturer.js";
import express from 'express'

const router = express.Router();

// add a new lecturer
router.post('/', async (req, res) => {
    try {
        const { name, email, department, courses } = req.body;

        // Basic validation
        if (!name || !email || !department) {
            return res.status(400).json({ 
                message: 'Name, email, and department are required' 
            });
        }

        // Check if email already exists
        const existingLecturer = await Lecturer.findOne({ email });
        if (existingLecturer) {
            return res.status(409).json({ 
                message: 'Lecturer with this email already exists' 
            });
        }

        function capital(word){
            return word.charAt(0).toUpperCase()+word.slice(1).toLowerCase();
        }

        // Create new lecturer
        const newLecturer = await Lecturer.create({
            name,
            email,
            department: capital(department),
            courses
        });

        res.status(201).json({
            message: 'Lecturer created successfully',
            lecturer: newLecturer
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating lecturer',
            error: error.message 
        });
    }
});


// Get a lecturer
// GET /api/lecturers/email/:email
router.get('/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Basic email format validation
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ 
                message: 'Please provide a valid email address' 
            });
        }

        const lecturer = await Lecturer.findOne({ email }).populate({
            path: 'courses',
            select: 'code title -_id'
        });

        if (!lecturer) {
            return res.status(404).json({ 
                message: 'Lecturer not found with this email' 
            });
        }

        res.status(200).json({
            message: 'Lecturer retrieved successfully',
            lecturer
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error retrieving lecturer',
            error: error.message 
        });
    }
});


// update lecturer
// PATCH /api/lecturers/email/:email
router.patch('/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const updateData = req.body;

        // Remove email from update data to prevent changing it
        delete updateData.email;

        const updatedLecturer = await Lecturer.findOneAndUpdate(
            { email },
            { $set: updateData },
            { 
                new: true,
                runValidators: true 
            }
        ).populate({
            path: 'courses',
            select: 'code title -_id'
        });

        if (!updatedLecturer) {
            return res.status(404).json({ message: 'Lecturer not found with this email' });
        }

        res.status(200).json(updatedLecturer);

    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating lecturer',
            error: error.message 
        });
    }
});


// delete a lecturer
// DELETE /api/lecturers/email/:email
router.delete('/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Basic email format validation
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ 
                message: 'Please provide a valid email address' 
            });
        }

        const deletedLecturer = await Lecturer.findOneAndDelete({ email });

        if (!deletedLecturer) {
            return res.status(404).json({ 
                message: 'Lecturer not found with this email' 
            });
        }

        res.status(200).json({
            message: 'Lecturer deleted successfully',
            deletedLecturer: {
                name: deletedLecturer.name,
                email: deletedLecturer.email,
                department: deletedLecturer.department
            }
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting lecturer',
            error: error.message 
        });
    }
});


export default router;
