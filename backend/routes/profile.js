// routes/profile.js

const express = require('express');
const {
  getProfile,
  updateProfile,
  updatePersonalInfo,
  updateHealthInfo,
  updateLifestyle,
  addMedication,
  updateMedication,
  deleteMedication,
  getProfileCompletion,
} = require('../controllers/profileController');

const { protect } = require('../middleware/auth');
const {
  personalInfoValidation,
  healthInfoValidation,
  lifestyleValidation,
  medicationValidation,
  medicationIdValidation,
} = require('../middleware/validation');

const router = express.Router();

/**
 * ✅ Protect all routes below
 * Ensure JWT token is verified before accessing any profile routes
 */
router.use(protect);

/**
 * ✅ Add explicit `/me` route before `/`
 * This fixes 404 errors from frontend API calls to `/api/profile/me`
 */
router.get('/me', getProfile);

/**
 * 🧩 Main profile routes
 */
router.get('/', getProfile);
router.put('/', updateProfile);
router.get('/completion', getProfileCompletion);

/**
 * 🧠 Section-specific updates
 */
router.put('/personal', personalInfoValidation, updatePersonalInfo);
router.put('/health', healthInfoValidation, updateHealthInfo);
router.put('/lifestyle', lifestyleValidation, updateLifestyle);

/**
 * 💊 Medication management routes
 */
router.post('/medications', medicationValidation, addMedication);
router.put('/medications/:medicationId', medicationIdValidation, updateMedication);
router.delete('/medications/:medicationId', medicationIdValidation, deleteMedication);

/**
 * ⚠️ Catch-all for undefined subroutes (helps debugging on Render)
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Profile route not found: ${req.originalUrl}`,
  });
});

module.exports = router;
