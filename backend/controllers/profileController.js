const Profile = require('../models/Profile');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get user profile
// @route   GET /api/profile
// @route   GET /api/profile/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    // ✅ Auto-create profile if missing (fixes 404 + prevents crashes)
    if (!profile) {
      profile = await Profile.create({ user: req.user.id });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const updateData = req.body;

    // Remove empty strings and null values
    const cleanData = JSON.parse(JSON.stringify(updateData, (key, value) => {
      if (value === '' || value === null) return undefined;
      return value;
    }));

    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: cleanData },
      { new: true, runValidators: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update personal info
// @route   PUT /api/profile/personal
// @access  Private
const updatePersonalInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const newInfo = req.body;

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) profile = await Profile.create({ user: req.user.id });

    // Merge new info with existing info
    profile.personalInfo = { ...profile.personalInfo, ...newInfo };
    await profile.save();

    res.json({
      success: true,
      message: 'Personal information updated successfully',
      data: { personalInfo: profile.personalInfo },
    });
  } catch (error) {
    console.error('Update personal info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating personal info',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update lifestyle info (now persistent)
// @route   PUT /api/profile/lifestyle
// @access  Private
const updateLifestyle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const lifestyleInfo = req.body;

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) profile = await Profile.create({ user: req.user.id });

    // ✅ Merge with existing lifestyle (fixes reset after refresh)
    profile.lifestyle = { ...profile.lifestyle, ...lifestyleInfo };
    await profile.save();

    res.json({
      success: true,
      message: 'Lifestyle information updated successfully',
      data: { lifestyle: profile.lifestyle },
    });
  } catch (error) {
    console.error('Update lifestyle info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating lifestyle info',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update health info (fixes 500 error)
// @route   PUT /api/profile/health
// @access  Private
const updateHealthInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { bio, height, weight, bloodType } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) profile = await Profile.create({ user: req.user.id });

    // Update bio if provided
    if (bio !== undefined) profile.bio = bio;

    // ✅ Safely merge health info (no data loss)
    profile.healthInfo = {
      ...profile.healthInfo,
      ...(height && { height }),
      ...(weight && { weight }),
      ...(bloodType && { bloodType }),
    };

    await profile.save();

    res.json({
      success: true,
      message: 'Health information updated successfully',
      data: {
        bio: profile.bio,
        healthInfo: profile.healthInfo,
      },
    });
  } catch (error) {
    console.error('Update health info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating health info',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Add medication
// @route   POST /api/profile/medications
// @access  Private
const addMedication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const medication = req.body;

    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $push: { 'healthInfo.medications': medication } },
      { new: true, runValidators: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Medication added successfully',
      data: { medications: profile.healthInfo.medications },
    });
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding medication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update medication
// @route   PUT /api/profile/medications/:medicationId
// @access  Private
const updateMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const updateData = req.body;

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const medication = profile.healthInfo.medications.id(medicationId);
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found',
      });
    }

    Object.assign(medication, updateData);
    await profile.save();

    res.json({
      success: true,
      message: 'Medication updated successfully',
      data: { medications: profile.healthInfo.medications },
    });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating medication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Delete medication
// @route   DELETE /api/profile/medications/:medicationId
// @access  Private
const deleteMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    profile.healthInfo.medications.pull(medicationId);
    await profile.save();

    res.json({
      success: true,
      message: 'Medication deleted successfully',
      data: { medications: profile.healthInfo.medications },
    });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting medication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get profile completion status
// @route   GET /api/profile/completion
// @access  Private
const getProfileCompletion = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    const completionPercentage = profile.calculateCompletion();

    res.json({
      success: true,
      data: {
        completionPercentage,
        isComplete: profile.isComplete,
        profile,
      },
    });
  } catch (error) {
    console.error('Get profile completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching completion',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePersonalInfo,
  updateHealthInfo,
  updateLifestyle,
  addMedication,
  updateMedication,
  deleteMedication,
  getProfileCompletion,
};
