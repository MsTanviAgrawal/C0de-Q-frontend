import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getPlans, getMySubscription, createOrder, verifyPayment } from '../../api';
import MockPaymentGateway from '../../Components/MockPaymentGateway/MockPaymentGateway';
import './Subscription.css';

const Subscription = () => {
    const [plans, setPlans] = useState(null);
    const [mySubscription, setMySubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [showPaymentGateway, setShowPaymentGateway] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const user = useSelector((state) => state.currentuserreducer);

    useEffect(() => {
        fetchPlans();
        if (user?.result?._id) {
            fetchMySubscription();
        }
    }, [user]);

    const fetchPlans = async () => {
        try {
            const { data } = await getPlans();
            setPlans(data.plans);
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    const fetchMySubscription = async () => {
        try {
            const { data } = await getMySubscription();
            setMySubscription(data.subscription);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planType) => {
        if (!user?.result?._id) {
            alert('Please login to subscribe');
            return;
        }

        if (planType === 'free') {
            alert('You are already on free plan');
            return;
        }

        setPaymentLoading(true);

        try {
            // Create order
            const { data } = await createOrder({ planType });
            console.log('Order created:', data);
            
            // Open mock payment gateway
            setCurrentOrder(data);
            setShowPaymentGateway(true);
            setPaymentLoading(false);
            
        } catch (error) {
            console.error('Payment error:', error);
            
            // Check if it's a time restriction error
            if (error.response?.data?.timeRestriction) {
                // Show detailed time restriction popup
                alert(`⏰ Payment Time Restriction\n\n${error.response.data.message}\n\nAllowed Time: ${error.response.data.allowedWindow}\n\nCurrent Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
            } else {
                alert(error.response?.data?.message || 'Payment initiation failed');
            }
            setPaymentLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentData) => {
        try {
            // Verify payment
            await verifyPayment(paymentData);
            alert('🎉 Payment successful!\n\nYour subscription has been activated.');
            fetchMySubscription(); // Refresh subscription
        } catch (error) {
            console.error('Verification error:', error);
            alert('Payment verification failed. Please contact support.');
        }
    };

    if (loading) {
        return <div className="subscription-container">Loading...</div>;
    }

    const getPlanColor = (planType) => {
        const colors = {
            free: '#95a5a6',
            bronze: '#cd7f32',
            silver: '#c0c0c0',
            gold: '#ffd700'
        };
        return colors[planType] || '#667eea';
    };

    return (
        <div className="subscription-container">
            <h1>💎 Choose Your Plan</h1>
            <p className="subtitle">Unlock more features with our premium plans</p>

            {/* Current Subscription */}
            {mySubscription && (
                <div className="current-subscription">
                    <h3>Your Current Plan</h3>
                    <div className="current-plan-card" style={{ borderColor: getPlanColor(mySubscription.planType) }}>
                        <div className="plan-badge" style={{ background: getPlanColor(mySubscription.planType) }}>
                            {mySubscription.planType.toUpperCase()}
                        </div>
                        <p><strong>Questions Today:</strong> {mySubscription.questionsUsedToday} / {mySubscription.planType === 'gold' ? '∞' : mySubscription.questionsPerDay}</p>
                        {mySubscription.planType !== 'free' && (
                            <p><strong>Valid Until:</strong> {new Date(mySubscription.endDate).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Time Restriction Notice */}
            <div className="time-notice">
                ⏰ <strong>Important:</strong> Payments are only allowed between 10:00 AM - 11:00 AM IST
                <br />
                <small>Current Time: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</small>
            </div>

            {/* Plans Grid */}
            <div className="plans-grid">
                {plans && Object.entries(plans).map(([key, plan]) => (
                    <div key={key} className={`plan-card ${mySubscription?.planType === key ? 'active' : ''}`}>
                        <div className="plan-header" style={{ background: getPlanColor(key) }}>
                            <h2>{plan.name}</h2>
                            <div className="plan-price">
                                ₹{plan.price}
                                {plan.price > 0 && <span>/month</span>}
                            </div>
                        </div>

                        <div className="plan-features">
                            <div className="feature-highlight">
                                <strong>{plan.questionsPerDay === -1 ? '∞ Unlimited' : plan.questionsPerDay}</strong>
                                <span>Questions per day</span>
                            </div>

                            <ul>
                                {plan.features.map((feature, index) => (
                                    <li key={index}>✓ {feature}</li>
                                ))}
                            </ul>
                        </div>

                        <button
                            className={`subscribe-btn ${mySubscription?.planType === key ? 'current' : ''}`}
                            onClick={() => handleSubscribe(key)}
                            disabled={paymentLoading || mySubscription?.planType === key}
                            style={{ background: mySubscription?.planType === key ? '#95a5a6' : getPlanColor(key) }}
                        >
                            {mySubscription?.planType === key ? '✓ Current Plan' : 
                             key === 'free' ? 'Default Plan' : 'Subscribe Now'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Payment Loading Overlay */}
            {paymentLoading && (
                <div className="payment-overlay">
                    <div className="payment-loader">
                        <div className="spinner"></div>
                        <p>Processing payment...</p>
                    </div>
                </div>
            )}

            {/* Mock Payment Gateway */}
            <MockPaymentGateway
                isOpen={showPaymentGateway}
                onClose={() => setShowPaymentGateway(false)}
                orderDetails={currentOrder}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default Subscription;
