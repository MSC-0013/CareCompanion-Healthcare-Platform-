// routes/subscription.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Public route (no auth)
router.get('/plans', subscriptionController.getPlans);

// Private routes (require user authentication)
router.get('/current', protect, subscriptionController.getCurrentSubscription);
router.post('/subscribe', protect, subscriptionController.subscribeToPlan);
router.post('/cancel', protect, subscriptionController.cancelSubscription);

module.exports = router;
