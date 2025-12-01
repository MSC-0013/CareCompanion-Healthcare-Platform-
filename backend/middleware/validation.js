const { body, param, query, validationResult } = require('express-validator');

// Auth validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Profile validation rules
const personalInfoValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 30 }),

  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 30 }),

  body('dateOfBirth')
    .optional()
    .isISO8601(),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say']),

  // ⭐ FIXED PHONE VALIDATION
  body('phone')
    .optional()
    .matches(/^[+]?[0-9]{7,15}$/)
    .withMessage("Invalid phone format"),
];

const healthInfoValidation = [
  body('healthInfo.bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'])
    .withMessage('Invalid blood type'),
  
  body('healthInfo.height.value')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Height must be between 30 and 300 cm'),
  
  body('healthInfo.weight.value')
    .optional()
    .isFloat({ min: 10, max: 500 })
    .withMessage('Weight must be between 10 and 500 kg')
];

const lifestyleValidation = [
  body('lifestyle.activityLevel')
    .optional()
    .isIn(['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'])
    .withMessage('Invalid activity level'),
  
  body('lifestyle.diet')
    .optional()
    .isIn(['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'other'])
    .withMessage('Invalid diet type'),
  
  body('lifestyle.smoking.status')
    .optional()
    .isIn(['never', 'former', 'current'])
    .withMessage('Invalid smoking status'),
  
  body('lifestyle.alcohol.status')
    .optional()
    .isIn(['never', 'occasional', 'regular'])
    .withMessage('Invalid alcohol status')
];

// --- CORRECTED SECTION ---
const medicationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  
  body('dosage')
    .optional()
    .trim()
    .isString()
    .withMessage('Dosage must be a string'),
  
  body('frequency')
    .optional()
    .trim()
    .isString()
    .withMessage('Frequency must be a string'),
  
  // Remove date validation since frontend does NOT use dates
  body('startDate').optional(),
  body('endDate').optional()

];
// --- END OF CORRECTED SECTION ---

// Parameter validation
const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

const medicationIdValidation = [
  param('medicationId')
    .isMongoId()
    .withMessage('Invalid medication ID format')
];

// Query validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  personalInfoValidation,
  healthInfoValidation,
  lifestyleValidation,
  medicationValidation,
  mongoIdValidation,
  medicationIdValidation,
  paginationValidation,
  validate
};