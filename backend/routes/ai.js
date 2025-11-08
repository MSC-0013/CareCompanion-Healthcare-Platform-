const express = require('express');
const { getAIResponse } = require('../aiHandler');
const { validationResult } = require('express-validator');

const router = express.Router();

// @desc    Chat with the AI model
// @route   POST /api/ai/chat
// @access  Public (or Private, if you add authentication middleware)
router.post('/chat', [
  // Optional: Add validation for the message body
  // body('message').notEmpty().withMessage('Message cannot be empty.'),
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required.',
    });
  }

  try {
    const reply = await getAIResponse(message);
    res.status(200).json({
      success: true,
      reply: reply,
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get response from AI model.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error',
    });
  }
});

module.exports = router;