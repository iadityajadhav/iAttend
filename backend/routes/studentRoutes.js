const express = require('express');
const router = express.Router();
const { registerStudent, getStudentSubjectAttendance, studentViewAttendance } = require('../controllers/studentController');
const validateRegistration = require('../middlewares/validateRegistration');
const { loginUser } = require('../controllers/loginController');
const validateLogin = require('../middlewares/validateLogin');
const { requestAccountDeletion, logoutUser, getProfile, updateProfile, updatePassword } = require('../controllers/accountController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', validateRegistration('student'), registerStudent);

router.post('/login', validateLogin, loginUser('student'));

router.get('/get-profile', authMiddleware, getProfile);

router.put('/update-profile', authMiddleware, validateRegistration('student'), updateProfile);

router.put('/update-password', authMiddleware, updatePassword('student'));

//http://localhost:5000/api/student/get-attendance?subject=ML&branch=Computer Engineering&year=FE&sem=1
router.get('/get-attendance', authMiddleware, getStudentSubjectAttendance);

router.post('/logout', authMiddleware, logoutUser);

router.post('/delete-account', requestAccountDeletion('student'));

router.get('/view-attendance', authMiddleware, studentViewAttendance);

module.exports = router;
