const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  personalInfo: {
    firstName: { type: String, trim: true, maxlength: 30 },
    lastName: { type: String, trim: true, maxlength: 30 },

    dateOfBirth: {
      type: Date,
      validate: {
        validator: d => !d || d < new Date(),
        message: "Date of birth must be in the past"
      }
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say'
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[0-9]{7,15}$/, 'Please enter a valid phone number']
    },

    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'US' }
    },

    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },

  healthInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
      default: 'unknown'
    },

    height: {
      value: { type: Number, min: 0 },   // <-- schema allows 0
      unit: { type: String, enum: ['cm', 'ft'], default: 'cm' }
    },

    weight: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' }
    },

    allergies: [{
      allergen: String,
      severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
      notes: String
    }],

    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date,
      prescribedBy: String,
      notes: String
    }],

    medicalConditions: [{
      condition: String,
      diagnosedDate: Date,
      status: { type: String, enum: ['active', 'inactive', 'resolved'] },
      notes: String
    }],

    vaccinations: [{
      vaccine: String,
      date: Date,
      nextDue: Date,
      provider: String
    }]
  },

  lifestyle: {
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'],
      default: 'moderately-active'
    },

    diet: {
      type: String,
      enum: ['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'other'],
      default: 'omnivore'
    },

    smoking: {
      status: { type: String, enum: ['never', 'former', 'current'], default: 'never' },
      years: Number,
      cigarettesPerDay: Number
    },

    alcohol: {
      status: { type: String, enum: ['never', 'occasional', 'regular'], default: 'never' },
      drinksPerWeek: Number
    },

    exercise: {
      frequency: { type: String, enum: ['none', '1-2', '3-4', '5-6', 'daily'], default: '3-4' },
      duration: Number,
      type: [String]
    }
  },

  avatar: {
    url: String,
    publicId: String
  },

  bio: {
    type: String,
    maxlength: 500
  },

  isComplete: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Completion calculation
profileSchema.methods.calculateCompletion = function () {
  let completed = 0;
  let total = 0;

  const personalFields = ['firstName', 'lastName', 'dateOfBirth', 'phone'];
  personalFields.forEach(f => {
    total++;
    if (this.personalInfo[f]) completed++;
  });

  const healthFields = ['bloodType', 'height', 'weight'];
  healthFields.forEach(f => {
    total++;
    if (this.healthInfo[f] && this.healthInfo[f].value) completed++;
  });

  const lifestyleFields = ['activityLevel', 'diet'];
  lifestyleFields.forEach(f => {
    total++;
    if (this.lifestyle[f]) completed++;
  });

  this.completionPercentage = Math.round((completed / total) * 100);
  this.isComplete = this.completionPercentage >= 80;
  return this.completionPercentage;
};

profileSchema.pre('save', function (next) {
  this.calculateCompletion();
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
