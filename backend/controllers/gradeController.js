import express from 'express';
import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import Course from '../models/courses.js';

const router = express.Router();

// Route to create a new grade with student reference validation
router.post('/', async (req, res) => {
  try {
    const { student, course, grade } = req.body;

    // Validate required fields
    if (!student || !grade) {
      return res.status(400).json({
        error: 'Student ID and grade are required fields'
      });
    }

    // Check if referenced student exists
    const existingStudent = await Student.findById(student);
    if (!existingStudent) {
      return res.status(404).json({
        error: 'Referenced student not found'
      });
    }

    // Optional: Validate course exists if provided
    if (course) {
      const existingCourse = await Course.exists({ _id: course });
      if (!existingCourse) {
        return res.status(404).json({
          error: 'Referenced course not found'
        });
      }
    }


    // Create new grade document
    const newGrade = new Grade({
      student,
      course, // optional
      grade
    });

    // Save to database
    const savedGrade = await newGrade.save();

    res.status(201).json(savedGrade);
  } catch (error) {
    console.error('Error creating grade:', error);

    // Handle specific Mongoose errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID format for student or course'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: "Grade for this student and course already exists" });
    }

    res.status(500).json({
      error: 'An error occurred while creating the grade'
    });
  }
});

// Get all grades
router.get('/', async (req, res) => {
  try {
    // Optional query parameters for filtering
    const { student, course } = req.query;

    const filter = {};
    if (student) filter.student = student;
    if (course) filter.course = course;

    const grades = await Grade.find(filter)
      .populate({
        path: 'student',
        select: 'name email -_id'
      }) // populate student details (adjust fields as needed)
      .populate({
        path: 'course',
        select: 'title code -_id'
      }); // populate course details (adjust fields as needed)

    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Server error while fetching grades' });
  }
});

// Get grade by ID
router.get('/:id', async (req, res) => {
  try {
    const grade = await Grade.find({ student: req.params.id })
      .populate({
        path: 'student',
        select: 'name email -_id'
      }) // populate student details (adjust fields as needed)
      .populate({
        path: 'course',
        select: 'title code -_id'
      }); // populate course details (adjust fields as needed)

    if (!grade) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json(grade);
  } catch (error) {
    console.error('Error fetching grade:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid grade ID format' });
    }

    res.status(500).json({ error: 'Server error while fetching grade' });
  }
});

// Grade for specific course
router.get('/courses/:courseId', async (req, res) => {
  try {
    // Verify course exists first
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const grades = await Grade.find({ course: req.params.courseId })
      .populate({
        path: 'student',
        select: 'name email'
      })
      .populate({
        path: 'course',
        select: 'title code'
      });

    res.json({
      course: course.title,
      grades
    });
  } catch (error) {
    console.error('Error fetching course grades:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid course ID format' });
    }

    res.status(500).json({ error: 'Server error while fetching course grades' });
  }
});

// update grade by studentid
router.put('/student/:studentId/course/:code', async (req, res) => {
  try {
    const { studentId, code } = req.params;
    const { grade } = req.body;

    // Validate required fields
    if (!grade) {
      return res.status(400).json({ error: 'Grade is required' });
    }

    // Verify student exists
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update the specific grade
    const updatedGrade = await Grade.findOneAndUpdate(
      { student: studentId, course: code }, // Ensure the grade belongs to this student
      { grade },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'student',
        select: 'name email -_id'
      }) // populate student details (adjust fields as needed)
      .populate({
        path: 'course',
        select: 'title code -_id'
      }); // populate course details (adjust fields as needed)

    if (!updatedGrade) {
      return res.status(404).json({
        error: 'Grade not found or does not belong to this student'
      });
    }

    res.json(updatedGrade);
  } catch (error) {
    console.error('Error updating grade:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    res.status(500).json({ error: 'Server error while updating grade' });
  }
});


// delete grade
router.delete('/student/:studentId/course/:code', async (req, res) => {
  try {
    const { studentId, code } = req.params;
    const { grade } = req.body;

    // Validate required fields
    if (!grade) {
      return res.status(400).json({ error: 'Grade is required' });
    }

    // Verify student exists
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // delete the specific grade
    const deleteGrade = await Grade.findOneAndDelete(
      { student: studentId, course: code } // Ensure the grade belongs to this student
    ).populate({
        path: 'student',
        select: 'name email -_id'
      }) // populate student details (adjust fields as needed)
      .populate({
        path: 'course',
        select: 'title code -_id'
      }); // populate course details (adjust fields as needed);

    if (!deleteGrade) {
      return res.status(404).json({
        error: 'Grade not found or does not belong to this student'
      });
    }

    res.json({message: "Grade was deleted Successfully",deleteGrade});
  } catch (error) {
    console.error('Error deleting grade:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    res.status(500).json({ error: 'Server error while updating grade' });
  }
});



export default router;