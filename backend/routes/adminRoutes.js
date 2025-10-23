const express = require('express');
const router = express.Router();
const { registerAdmin, addClass, updateClass, deleteClass } = require('../controllers/adminController');
const validateRegistration = require('../middlewares/validateRegistration');
const { loginUser } = require('../controllers/loginController');
const validateLogin = require('../middlewares/validateLogin');
const { requestAccountDeletion, logoutUser, getProfile, updateProfile, updatePassword } = require('../controllers/accountController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', validateRegistration('admin'), registerAdmin);

router.post('/login', validateLogin, loginUser('admin'));

router.get('/get-profile', authMiddleware, getProfile);

router.put('/update-profile', authMiddleware, validateRegistration('admin'), updateProfile);

router.put('/update-password', authMiddleware, updatePassword('admin'));

router.post('/add-class', authMiddleware, addClass);

router.put('/update-class', authMiddleware, updateClass);

router.delete('/delete-class', authMiddleware, deleteClass)

router.post('/logout', authMiddleware, logoutUser);

router.post('/delete-account', authMiddleware, requestAccountDeletion('admin'));

module.exports = router;
