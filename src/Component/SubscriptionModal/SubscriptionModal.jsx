import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SubscriptionModal.css';

const SubscriptionModal = ({ isOpen, onClose, currentPlan, message }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const plans = [
    {
      name: 'Bronze',
      price: '₹100',
      questions: 5,
      color: '#cd7f32',
      features: ['5 questions/day', 'Priority support', 'No ads']
    },
    {
      name: 'Silver',
      price: '₹300',
      questions: 10,
      color: '#c0c0c0',
      features: ['10 questions/day', 'Priority support', 'Featured questions']
    },
    {
      name: 'Gold',
      price: '₹1000',
      questions: 'Unlimited',
      color: '#ffd700',
      features: ['Unlimited questions', '24/7 support', 'All premium features']
    }
  ];

  const handleUpgrade = () => {
    onClose();
    navigate('/Subscription');
  };

  return (
    <div className="subscription-modal-overlay" onClick={onClose}>
      <div className="subscription-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>⚠️ Daily Limit Reached!</h2>
          <p className="limit-message">{message}</p>
          <p className="current-plan-info">Current Plan: <strong>{currentPlan?.toUpperCase() || 'FREE'}</strong></p>
        </div>

        <div className="modal-body">
          <h3>Upgrade to Post More Questions</h3>
          
          <div className="plans-grid-modal">
            {plans.map((plan) => (
              <div key={plan.name} className="plan-card-modal" style={{ borderColor: plan.color }}>
                <div className="plan-header-modal" style={{ background: plan.color }}>
                  <h4>{plan.name}</h4>
                  <div className="plan-price-modal">{plan.price}<span>/month</span></div>
                </div>
                <div className="plan-body-modal">
                  <div className="questions-count">
                    <strong>{plan.questions}</strong>
                    <span>questions/day</span>
                  </div>
                  <ul className="features-list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="upgrade-btn" onClick={handleUpgrade}>
            💎 View All Plans & Upgrade
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
