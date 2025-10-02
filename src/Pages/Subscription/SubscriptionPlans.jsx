import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get user data from localStorage (from authentication)
  const userData = JSON.parse(localStorage.getItem('Profile')) || {};
  const userId = userData?.result?._id || userData?.result?.uid || null;
  const userEmail = userData?.result?.email || null;

  // Check if current time is within allowed payment window (10-11 AM IST)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Convert to IST (UTC+5:30)
      const istHours = now.getUTCHours() + 5;
      const istMinutes = now.getUTCMinutes() + 30;
      const istHoursAdjusted = istMinutes >= 60 ? istHours + 1 : istHours;
      const finalIstHours = (istHoursAdjusted % 24 + 24) % 24;
      
      // Check if time is between 10 AM and 11 AM IST
      if (finalIstHours >= 10 && finalIstHours < 11) {
        setCanMakePayment(true);
      } else {
        setCanMakePayment(false);
      }
    }, 60000); // Check every minute

    // Initial check
    const now = new Date();
    const istHours = now.getUTCHours() + 5;
    const istMinutes = now.getUTCMinutes() + 30;
    const istHoursAdjusted = istMinutes >= 60 ? istHours + 1 : istHours;
    const finalIstHours = (istHoursAdjusted % 24 + 24) % 24;
    
    if (finalIstHours >= 10 && finalIstHours < 11) {
      setCanMakePayment(true);
    } else {
      setCanMakePayment(false);
    }

    return () => clearInterval(timer);
  }, []);

  const plans = [
    {
      id: 'free',
      name: t('subscription.freePlan'),
      price: 0,
      questionsPerDay: 1,
      features: [
        t('subscription.oneQuestionPerDay'),
        t('subscription.basicSupport')
      ]
    },
    {
      id: 'bronze',
      name: t('subscription.bronzePlan'),
      price: 100,
      questionsPerDay: 5,
      features: [
        t('subscription.fiveQuestionsPerDay'),
        t('subscription.prioritySupport'),
        t('subscription.monthlySubscription')
      ]
    },
    {
      id: 'silver',
      name: t('subscription.silverPlan'),
      price: 300,
      questionsPerDay: 10,
      features: [
        t('subscription.tenQuestionsPerDay'),
        t('subscription.prioritySupport'),
        t('subscription.monthlySubscription'),
        t('subscription.adFreeExperience')
      ]
    },
    {
      id: 'gold',
      name: t('subscription.goldPlan'),
      price: 1000,
      questionsPerDay: 'unlimited',
      features: [
        t('subscription.unlimitedQuestions'),
        t('subscription.premiumSupport'),
        t('subscription.monthlySubscription'),
        t('subscription.adFreeExperience'),
        t('subscription.earlyAccessFeatures')
      ]
    }
  ];

  const handleSubscribe = async (plan) => {
    // Check if user is authenticated
    if (!userId || !userEmail) {
      setError(t('subscription.error.userRequired'));
      return;
    }

    // Check if payment is allowed at this time
    if (!canMakePayment) {
      setError(t('subscription.paymentNotAllowed'));
      return;
    }

    setSelectedPlan(plan.id);
    setLoading(true);
    setError('');

    try {
      // Create order on backend
      const response = await fetch('http://localhost:5001/subscription/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({ 
          plan: plan.id, 
          userId, 
          userEmail 
        })
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || t('subscription.error.createOrder'));
      }

      // Initialize Razorpay payment
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Make sure this is set in your .env file
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Stack Overflow Clone',
        description: `${plan.name} Plan Subscription`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('http://localhost:5001/subscription/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.id,
                userId,
                userEmail
              })
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || t('subscription.error.verifyPayment'));
            }

            alert(t('subscription.paymentSuccess'));
          } catch (error) {
            console.error('Payment verification error:', error);
            setError(error.message || t('subscription.error.verifyPayment'));
          }
        },
        prefill: {
          email: userEmail
        },
        theme: {
          color: '#009dff'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Subscription error:', error);
      setError(error.message || t('subscription.error.subscribe'));
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="subscription-plans-container">
      <h1>{t('subscription.plansTitle')}</h1>
      <p className="payment-time-info">
        {canMakePayment 
          ? t('subscription.paymentAllowed') 
          : t('subscription.paymentNotAllowed')}
      </p>
      <p className="current-time">
        {t('subscription.currentTime')}: {currentTime.toLocaleString()}
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`plan-card ${plan.id === 'gold' ? 'featured' : ''}`}>
            <h2>{plan.name}</h2>
            <div className="plan-price">
              {plan.price > 0 ? (
                <>
                  <span className="price">₹{plan.price}</span>
                  <span className="period">/{t('subscription.month')}</span>
                </>
              ) : (
                <span className="price">{t('subscription.free')}</span>
              )}
            </div>
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <div className="plan-questions-limit">
              <strong>{t('subscription.questionsPerDay')}:</strong> {plan.questionsPerDay}
            </div>
            {plan.price > 0 && (
              <button 
                className="subscribe-button"
                onClick={() => handleSubscribe(plan)}
                disabled={loading && selectedPlan === plan.id || !canMakePayment}
              >
                {loading && selectedPlan === plan.id ? t('subscription.loading') : t('subscription.subscribeNow')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
