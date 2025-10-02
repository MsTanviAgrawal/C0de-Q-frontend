import React, { useState } from 'react';
import './MockPaymentGateway.css';

const MockPaymentGateway = ({ isOpen, onClose, orderDetails, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const mockPaymentData = {
        razorpay_order_id: orderDetails.order.id,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: `mock_signature_${Date.now()}`
      };

      setProcessing(false);
      onSuccess(mockPaymentData);
      onClose();
      alert('✅ Payment Successful!\n\nThis is a test payment. In production, real payment gateway will be integrated.');
    }, 2000);
  };

  return (
    <div className="mock-payment-overlay">
      <div className="mock-payment-modal">
        <div className="mock-payment-header">
          <h2>💳 Test Payment Gateway</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-details">
          <div className="merchant-info">
            <h3>Code Quest</h3>
            <p>Secure Payment</p>
          </div>
          
          <div className="amount-box">
            <span>Amount to Pay</span>
            <h1>₹{orderDetails.planDetails.price}</h1>
            <p>{orderDetails.planDetails.name}</p>
          </div>
        </div>

        <form onSubmit={handlePayment} className="payment-form">
          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim())}
              maxLength="19"
              required
            />
            <small>Use: 4111 1111 1111 1111 (Test Card)</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length >= 2) {
                    val = val.slice(0, 2) + '/' + val.slice(2, 4);
                  }
                  setExpiry(val);
                }}
                maxLength="5"
                required
              />
            </div>

            <div className="form-group">
              <label>CVV</label>
              <input
                type="password"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                maxLength="3"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="pay-btn" 
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="spinner"></span>
                Processing Payment...
              </>
            ) : (
              `Pay ₹${orderDetails.planDetails.price}`
            )}
          </button>
        </form>

        <div className="test-mode-banner">
          🧪 TEST MODE - No real money will be charged
        </div>

        <div className="payment-methods">
          <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" />
          <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" />
          <img src="https://img.icons8.com/color/48/000000/rupay.png" alt="RuPay" />
        </div>
      </div>
    </div>
  );
};

export default MockPaymentGateway;
