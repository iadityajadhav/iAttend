const express = require('express');
const router = express.Router();
const { registerTeacher, getAvailableClasses, addClassToProfile, removeClassFromProfile, getMyClasses } = require('../controllers/teacherController');
const validateRegistration = require('../middlewares/validateRegistration');
const { loginUser } = require('../controllers/loginController');
const validateLogin = require('../middlewares/validateLogin');
const { requestAccountDeletion, logoutUser, updateProfile, getProfile, updatePassword } = require('../controllers/accountController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', validateRegistration('teacher'), registerTeacher);

router.post('/login', validateLogin, loginUser('teacher'));

router.get('/get-profile', authMiddleware, getProfile);

router.put('/update-profile', authMiddleware, validateRegistration('teacher'), updateProfile);

router.put('/update-password', authMiddleware, updatePassword('teacher'));

// Get classes for dropdown
router.get('/available-classes', authMiddleware, getAvailableClasses);

// Add selected class to teacher profile
router.post('/add-class', authMiddleware, addClassToProfile);

//To see added classes
router.get('/my-classes', authMiddleware, getMyClasses);

// Remove class from teacher profile
router.delete('/remove-class', authMiddleware, removeClassFromProfile);

router.post('/logout', authMiddleware, logoutUser);

router.post('/delete-account', requestAccountDeletion('teacher'));

module.exports = router;
