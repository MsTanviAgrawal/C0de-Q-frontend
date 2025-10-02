const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Temporary in-memory store for user subscriptions { userId -> { plan, expiryDate } }
// In production, this should be replaced with a proper database implementation
const userSubscriptions = new Map();

// Helper function to update user subscription (placeholder for database logic)
const updateUserSubscription = (userId, plan) => {
  const planDurations = {
    'free': 30, // 30 days
    'bronze': 30, // 30 days
    'silver': 30, // 30 days
    'gold': 30 // 30 days
  };
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + planDurations[plan]);
  
  userSubscriptions.set(userId, { plan, expiryDate });
  console.log(`Updated subscription for user ${userId}: ${plan} plan until ${expiryDate}`);
};

// Helper function to get user subscription (placeholder for database logic)
const getUserSubscription = (userId) => {
  return userSubscriptions.get(userId) || null;
};

// Create order endpoint
router.post('/create-order', async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.userId;
    const userEmail = req.userEmail;
    
    // Validate plan
    const plans = {
      'free': { amount: 0, questionsLimit: 1 },
      'bronze': { amount: 10000, questionsLimit: 5 }, // Amount in paise (₹100)
      'silver': { amount: 30000, questionsLimit: 10 }, // Amount in paise (₹300)
      'gold': { amount: 100000, questionsLimit: -1 } // Amount in paise (₹1000), -1 for unlimited
    };
    
    if (!plans[plan]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    // Check if payment is allowed (10-11 AM IST)
    const currentTime = new Date();
    const currentISTTime = new Date(currentTime.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST
    const currentHour = currentISTTime.getUTCHours();
    
    if (currentHour < 10 || currentHour >= 11) {
      return res.status(400).json({ 
        error: 'Payment not allowed at this time. Please try between 10-11 AM IST.' 
      });
    }
    
    // Create Razorpay order
    const options = {
      amount: plans[plan].amount,
      currency: "INR",
      receipt: `receipt_${userId}_${plan}_${Date.now()}`
    };
    
    const order = await razorpay.orders.create(options);
    
    // Add plan details to order
    order.plan = plan;
    order.questionsLimit = plans[plan].questionsLimit;
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: order.plan,
      questionsLimit: order.questionsLimit
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment endpoint
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const userId = req.userId;
    const userEmail = req.userEmail;
    
    // Verify payment signature
    const crypto = require('crypto');
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    
    if (digest !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }
    
    // Update user subscription in database/memory store
    updateUserSubscription(userId, plan);
    
    // Send invoice email
    const planNames = {
      'free': 'Free',
      'bronze': 'Bronze',
      'silver': 'Silver',
      'gold': 'Gold'
    };
    
    const planAmounts = {
      'free': 0,
      'bronze': 100,
      'silver': 300,
      'gold': 1000
    };
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Subscription Payment Invoice - ${planNames[plan]} Plan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment Successful</h2>
          <p>Thank you for subscribing to our ${planNames[plan]} plan!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Payment Details</h3>
            <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
            <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
            <p><strong>Amount Paid:</strong> ₹${planAmounts[plan]}</p>
            <p><strong>Plan:</strong> ${planNames[plan]} Plan</p>
          </div>
          
          <p>Your subscription is now active and you can post questions according to your plan limits.</p>
          <p>If you have any questions, please contact our support team.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666;">This is an automated email from Stack Overflow Clone</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Payment verified successfully and invoice sent' 
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get user subscription endpoint
router.get('/user-subscription', (req, res) => {
  try {
    const userId = req.userId;
    const subscription = getUserSubscription(userId);
    
    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    
    // Check if subscription is expired
    if (subscription.expiryDate < new Date()) {
      userSubscriptions.delete(userId);
      return res.status(404).json({ error: 'Subscription has expired' });
    }
    
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

module.exports = router;
