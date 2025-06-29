import express from 'express';
import Course from '../models/courses.js'; // Adjust the import path as needed

const router = express.Router();

// Create a new course
router.post('/', async (req, res) => {
    try {
        const { code, title, credits } = req.body;

        // Validate required fields
        if (!code || !title) {
            return res.status(400).json({ 
                message: 'Course code and title are required' 
            });
        }

        const coder = code.toUpperCase();

        // Check if course already exists (since 'code' is unique)
        const existingCourse = await Course.findOne({ coder });
        if (existingCourse) {
            return res.status(409).json({ 
                message: 'A course with this code already exists' 
            });
        }

        // Create and save the new course
        const newCourse = new Course({
            code: code.toUpperCase(), // Ensure uppercase as per schema
            title,
            credits: credits || undefined // Optional field
        });

        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a course by code
router.get('/:code', async (req, res) => {
    try {
        const course = await Course.findOne({ 
            code: req.params.code.toUpperCase() // Ensure uppercase match
        });

        if (!course) {
            return res.status(404).json({ 
                message: 'Course not found' 
            });
        }

        res.json(course); // Return the course (200 OK by default)

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all courses query params
router.get('/', async (req, res) => {
    try {
        // 1. Filtering (e.g., /courses?credits=3)
        const filter = {};
        if (req.query.credits) {
            filter.credits = req.query.credits;
        }
        if (req.query.title) {
            filter.title = { $regex: req.query.title, $options: 'i' }; // Case-insensitive search
        }

        // 2. Sorting (e.g., /courses?sortBy=code:asc)
        const sort = {};
        if (req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            sort.code = 1; // Default: sort by code (ascending)
        }

        // 3. Pagination (e.g., /courses?page=1&limit=10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Query the database
        const courses = await Course.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Count total documents (for pagination metadata)
        const total = await Course.countDocuments(filter);

        res.json({
            success: true,
            data: courses,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
});

// Full update (PUT)
router.put('/:code', async (req, res) => {
    try {
        const { title, credits } = req.body;
        const courseCode = req.params.code.toUpperCase();

        // Validate required fields (code is immutable)
        if (!title) {
            return res.status(400).json({ 
                message: 'Title is required for a full update' 
            });
        }

        const updatedCourse = await Course.findOneAndUpdate(
            { code: courseCode }, // Find by code
            { 
                title, 
                credits: credits || undefined, // Handle optional field
                updatedAt: new Date() // Force timestamp update
            },
            { new: true, runValidators: true } // Return updated doc + validate
        );

        if (!updatedCourse) {
            return res.status(404).json({ 
                message: 'Course not found' 
            });
        }

        res.json(updatedCourse);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Partial update (PATCH)
router.patch('/:code', async (req, res) => {
    try {
        const courseCode = req.params.code.toUpperCase();
        const updates = req.body;

        // Prevent code modification (immutable)
        if (updates.code) {
            return res.status(400).json({ 
                message: 'Course code cannot be modified' 
            });
        }

        // Convert code to uppercase if title is provided
        if (updates.title) {
            updates.title = updates.title.trim();
        }

        const updatedCourse = await Course.findOneAndUpdate(
            { code: courseCode },
            { $set: updates, updatedAt: new Date() }, // Only update provided fields
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ 
                message: 'Course not found' 
            });
        }

        res.json(updatedCourse);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a course by code
router.delete('/:code', async (req, res) => {
    try {
        const courseCode = req.params.code.toUpperCase(); // Ensure uppercase match

        const deletedCourse = await Course.findOneAndDelete({ 
            code: courseCode 
        });

        if (!deletedCourse) {
            return res.status(404).json({ 
                success: false,
                message: 'Course not found' 
            });
        }

        res.json({
            success: true,
            message: 'Course deleted successfully',
            deletedCourse // Optional: Return the deleted document
        });

    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
});

export default router;