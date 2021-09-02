const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/auth.js');

router.post('/', registrationController.adminLogin);
router.get('/dashboard', registrationController.dashboard);

router.get('/register', registrationController.register);
router.post('/registerStudent', registrationController.registerStudent);
router.get('/update/:email', registrationController.update);
router.post('/updateUser', registrationController.updateUser);
router.get('/delete/:email', registrationController.delete);
router.post('/deleteUser', registrationController.deleteUser);

module.exports = router;