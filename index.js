const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config();
const app = express();
const port = process.env.PORT;
// Add body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Connect to MongoDB Atlas
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define MongoDB schema and models for Mentor and Student
const mentorSchema = new mongoose.Schema({
    name: String,
    domain: String,
    email: String,
    location: String,
    experience: String,
}, { collection: "Mentor" }); // Specify the collection name

const studentSchema = new mongoose.Schema({
    name: String,
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
    primaryLanguage: String,
    email: String,
    location: String,
    feesPaid: Boolean,
}, { collection: "Student" }); // Specify the collection name

const Mentor = mongoose.model('Mentor', mentorSchema);
const Student = mongoose.model('Student', studentSchema);

// API endpoints




// Create Mentor
app.post('/mentors', async (req, res) => {
    try {

        const { name, domain, location, experience, email } = req.body;
        const mentor = await Mentor.create({ name, domain, location, experience, email });
        res.status(201).json(mentor);
        console.log(name, domain, location, experience)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create mentor' });
    }
});

// Create Student
app.post('/students', async (req, res) => {
    try {
        const { name, primaryLanguage, location, email, feesPaid } = req.body;
        const student = await Student.create({ name, primaryLanguage, location, email, feesPaid });
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create student' });
        console.log(error)
    }
});

// Assign a student to a mentor
app.put('/students/:studentId/mentor/:mentorId', async (req, res) => {
    try {
        const { studentId, mentorId } = req.params;
        const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign mentor to student' });
    }
});

// Add multiple students to a mentor
app.put('/mentors/:mentorId/add-students', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { studentIds } = req.body;
        const students = await Student.updateMany(
            { _id: { $in: studentIds }, mentor: { $exists: false } },
            { mentor: mentorId }
        );
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add students to mentor' });
    }
});

// Assign or change mentor for a student
app.put('/students/:studentId/mentor', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { mentorId } = req.body;
        const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign or change mentor for student' });
    }
});

// Get all students for a particular mentor
app.get('/mentors/:mentorId/students', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const students = await Student.find({ mentor: mentorId });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve students' });
    }
});

// Get previously assigned mentor for a particular student
app.get('/students/:studentId/mentor', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId).populate('mentor', 'name');
        const mentor = student.mentor ? student.mentor.name : 'No mentor assigned';
        res.status(200).json({ mentor });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve mentor' });
    }
});
// Get all students
app.get('/allstudents', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve students' });
    }
});

// Get all mentors
app.get('/allmentors', async (req, res) => {
    try {
        const mentors = await Mentor.find();
        res.status(200).json(mentors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve mentors' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});