const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [30, 'First name cannot exceed 30 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [30, 'Last name cannot exceed 30 characters']
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function(date) {
          return date < new Date();
        },
        message: 'Date of birth must be in the past'
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
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
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
      value: { type: Number, min: 30, max: 300 }, // in cm
      unit: { type: String, enum: ['cm', 'ft'], default: 'cm' }
    },
    weight: {
      value: { type: Number, min: 10, max: 500 }, // in kg
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
      duration: Number, // minutes per session
      type: [String] // ['cardio', 'strength', 'yoga', 'swimming', etc.]
    }
  },
  avatar: {
    url: String,
    publicId: String // for cloudinary or similar service
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate completion percentage
profileSchema.methods.calculateCompletion = function() {
  let completedFields = 0;
  let totalFields = 0;

  // Personal info fields
  const personalFields = ['firstName', 'lastName', 'dateOfBirth', 'phone'];
  personalFields.forEach(field => {
    totalFields++;
    if (this.personalInfo[field]) completedFields++;
  });

  // Health info fields
  const healthFields = ['bloodType', 'height', 'weight'];
  healthFields.forEach(field => {
    totalFields++;
    if (this.healthInfo[field] && this.healthInfo[field].value) completedFields++;
  });

  // Lifestyle fields
  const lifestyleFields = ['activityLevel', 'diet'];
  lifestyleFields.forEach(field => {
    totalFields++;
    if (this.lifestyle[field]) completedFields++;
  });

  this.completionPercentage = Math.round((completedFields / totalFields) * 100);
  this.isComplete = this.completionPercentage >= 80;
  
  return this.completionPercentage;
};

// Update completion before saving
profileSchema.pre('save', function(next) {
  this.calculateCompletion();
  next();
});

// Indexes
profileSchema.index({ user: 1 });
profileSchema.index({ 'personalInfo.dateOfBirth': 1 });
profileSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Profile', profileSchema);
