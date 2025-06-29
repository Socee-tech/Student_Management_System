import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentController from './controllers/studentController.js';
import gradeController from './controllers/gradeController.js';
import lecturers from './controllers/lecturerController.js';
import course from './controllers/courseController.js';


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentController);
app.use('/api/grades', gradeController);
app.use('/api/lecturers', lecturers);
app.use('/api/course', course)

app.get('/', (req, res)=>{
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
