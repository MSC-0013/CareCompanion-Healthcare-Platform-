// controllers/subscriptionController.js

const Subscription = require('../models/Subscription');
const User = require('../models/User');

/**
 * @desc    Get all subscription plans (frontend uses this in Plans.tsx)
 * @route   GET /api/subscription/plans
 * @access  Public
 */
const getPlans = (req, res) => {
  try {
    // Predefined plans — can later be stored in MongoDB
    const plans = [
      {
        id: 'free',
        name: 'Free Plan',
        price: '$0',
        period: 'month',
        description: 'Basic access to CareCompanion features.',
        features: [
          '✅ Access to symptom checker',
          '✅ Basic wellness tips',
          '✅ Limited chat history (10 messages)',
        ],
        limitations: ['❌ No AI model integration', '❌ No advanced analytics'],
        popular: false,
      },
      {
        id: 'pro',
        name: 'Pro Plan',
        price: '$9.99',
        period: 'month',
        description: 'Advanced health tracking and AI insights.',
        features: [
          '✅ Full access to symptom checker',
          '✅ AI-assisted disease explanations',
          '✅ Save unlimited chat history',
          '✅ Personalized wellness analytics',
        ],
        limitations: ['❌ No family sharing'],
        popular: true,
      },
      {
        id: 'ultimate',
        name: 'Ultimate Plan',
        price: '$19.99',
        period: 'month',
        description: 'Complete CareCompanion access for individuals and families.',
        features: [
          '✅ All Pro Plan features',
          '✅ Family account (up to 5 members)',
          '✅ Priority health support',
          '✅ Doctor consultation dashboard',
        ],
        limitations: [],
        popular: false,
      },
    ];

    res.status(200).json({
      success: true,
      message: 'Plans fetched successfully',
      data: { plans },
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plans',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current user's active subscription
 * @route   GET /api/subscription/current
 * @access  Private
 */
const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    let subscription = null;
    if (userId) {
      subscription = await Subscription.findOne({ user: userId, status: 'active' });
    }

    if (!subscription) {
      return res.json({
        success: true,
        message: 'No active subscription found, defaulting to free plan',
        data: {
          subscription: {
            plan: 'free',
            planStartDate: new Date(),
            planEndDate: null,
            status: 'active',
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Current subscription retrieved successfully',
      data: { subscription },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching current subscription',
      error: error.message,
    });
  }
};

/**
 * @desc    Subscribe user to a plan (mock payment)
 * @route   POST /api/subscription/subscribe
 * @access  Private
 */
const subscribeToPlan = async (req, res) => {
  try {
    const { planId, paymentMethod, paymentId } = req.body;

    // ✅ Fix: Ensure user is authenticated before subscribing
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to subscribe to a plan',
      });
    }

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required',
      });
    }

    // Optionally verify plan exists
    const validPlans = ['free', 'pro', 'ultimate'];
    if (!validPlans.includes(planId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID provided',
      });
    }

    // Simulate or create subscription record in DB
    const subscription = await Subscription.create({
      user: req.user.id,
      plan: planId,
      status: 'active',
      paymentMethod: paymentMethod || 'demo',
      paymentId: paymentId || 'demo_payment_id',
      startDate: new Date(),
    });

    // Update user's plan info in User model
    await User.findByIdAndUpdate(req.user.id, {
      plan: planId,
      planStartDate: new Date(),
      planEndDate: null,
    });

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${planId} plan`,
      data: { subscription },
    });
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during subscription',
      error: error.message,
    });
  }
};

/**
 * @desc    Cancel active subscription
 * @route   POST /api/subscription/cancel
 * @access  Private
 */
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { user: userId, status: 'active' },
      { status: 'cancelled', endDate: new Date() },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found to cancel',
      });
    }

    // Downgrade user to free plan
    await User.findByIdAndUpdate(userId, {
      plan: 'free',
      planEndDate: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: { plan: 'free', subscription },
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling subscription',
      error: error.message,
    });
  }
};

module.exports = {
  getPlans,
  getCurrentSubscription,
  subscribeToPlan,
  cancelSubscription,
};
