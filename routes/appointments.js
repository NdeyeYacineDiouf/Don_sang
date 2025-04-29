const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const appointmentController = require('../controllers/appointmentController');

router.get('/', auth.authenticateUser, appointmentController.listUserAppointments);
router.get('/confirmation', auth.authenticateUser, appointmentController.showConfirmation);
router.get('/:id/cancel', auth.authenticateUser, appointmentController.showCancelForm);
router.post('/:id/cancel', auth.authenticateUser, appointmentController.cancelAppointment);

module.exports = router;