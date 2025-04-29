const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middlewares/auth');
const appointmentController = require('../../controllers/appointmentController');

router.get('/', authenticateUser, appointmentController.listUserAppointments);
router.post('/', authenticateUser, appointmentController.bookAppointment);
router.delete('/:id', authenticateUser, appointmentController.cancelAppointment);

module.exports = router;