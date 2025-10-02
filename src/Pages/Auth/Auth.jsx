import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import icon from '../../assets/icon.png';
import Aboutauth from './Aboutauth';
import './Auth.css';
import { login, signup, googleSignIn, phoneSignIn, verifyOTP } from '../../action/auth';

const PhoneAuthSection = ({ isSignup, navigate }) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [userName, setUserName] = useState("");
  const dispatch = useDispatch();

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await dispatch(phoneSignIn(phone, navigate, isSignup));
      setOtpSent(true);
      // Show OTP in alert only (not on page)
      if (result?.devOtp) {
        alert(`📱 OTP Generated!\n\nYour OTP is: ${result.devOtp}\n\n(Also check terminal for OTP)`);
      }
    } catch (err) {
      setError(err.message || t('common.somethingWentWrong'));
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await dispatch(verifyOTP(phone, otp, navigate, isSignup));
      // Check if new user needs to provide name
      if (result?.isNewUser) {
        setIsNewUser(true);
      }
      // If old user, navigation will happen automatically in verifyOTP action
    } catch (err) {
      setError(err.message || t('auth.verifyOTP'));
    }
    setLoading(false);
  };

  const handleSubmitName = async () => {
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (userName.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Send OTP verification with name to complete registration
      const result = await dispatch(verifyOTP(phone, otp, navigate, isSignup, userName.trim()));
      // Registration successful, user will be navigated automatically
    } catch (err) {
      setError(err.message || t('common.somethingWentWrong'));
    }
    setLoading(false);
  };

  return (
    <div className="phone-auth-section">
      <input
        type="tel"
        placeholder={t('auth.phoneLogin')}
        value={phone}
        onChange={e => setPhone(e.target.value)}
        disabled={otpSent || loading}
      />
      <button
        type="button"
        className="auth-btn"
        onClick={handleSendOTP}
        disabled={loading || !phone || otpSent}
      >
        {loading && !otpSent ? t('common.loading') : isSignup ? t('auth.signupSuccess') : t('auth.phoneLogin')}
      </button>
      {otpSent && !isNewUser && (
        <>
          <input
            type="text"
            placeholder={t('auth.enterOTP')}
            value={otp}
            onChange={e => setOtp(e.target.value)}
            maxLength="6"
            disabled={loading}
          />
          <button
            type="button"
            className="auth-btn verify"
            onClick={handleVerifyOTP}
            disabled={loading || !otp}
          >
            {loading ? t('common.loading') : t('auth.verifyOTP')}
          </button>
        </>
      )}
      
      {isNewUser && (
        <>
          <div style={{ 
            padding: '10px', 
            background: '#e3f2fd', 
            border: '1px solid #2196f3', 
            borderRadius: '5px',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            ✅ OTP Verified! Please enter your name
          </div>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className="auth-btn"
            onClick={handleSubmitName}
            disabled={loading || !userName.trim()}
          >
            {loading ? t('common.loading') : 'Complete Registration'}
          </button>
        </>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

const Auth = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode'); 

  const [isSignup, setIsSignup] = useState(false);
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needOtp, setNeedOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === 'Signup') {
      setIsSignup(true);
    } else {
      setIsSignup(false);
    }
  }, [mode]);

  const handleSwitch = () => {
    const newMode = isSignup ? 'login' : 'Signup';
    navigate(`/Auth?mode=${newMode}`);
    // Reset form state
    setNeedOtp(false);
    setOtp("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (isSignup) {
      if (!name || !email || !password) {
        setError(t('common.error'));
        setLoading(false);
        return;
      }
      
      try {
        await dispatch(signup({ name, email, password }, navigate));
      } catch (err) {
        setError(err.message || t('common.somethingWentWrong'));
      }
    } else {
      if (!email || !password) {
        setError(t('common.error'));
        setLoading(false);
        return;
      }
      
      try {
        // Check if Chrome browser requires OTP
        const userAgent = navigator.userAgent;
        const isChrome = userAgent.includes("Chrome") && !userAgent.includes("Edge");
        
        if (isChrome && !needOtp) {
          // First attempt - will trigger OTP sending
          await dispatch(login({ email, password }, navigate));
          setNeedOtp(true);
          setError("");
        } else if (needOtp && otp) {
          // Second attempt with OTP
          await dispatch(login({ email, password, otp }, navigate));
        } else {
          // Direct login for non-Chrome browsers
          await dispatch(login({ email, password }, navigate));
        }
      } catch (err) {
        if (err.message && err.message.includes("OTP")) {
          setNeedOtp(true);
          setError(err.message);
        } else {
          setError(err.message || t('common.somethingWentWrong'));
        }
      }
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    // Check if there's already a pending Google sign-in popup
    if (window.googleSignInPending) {
      setError("A Google sign-in popup is already open. Please complete or close it first.");
      return;
    }
    
    window.googleSignInPending = true;
    try {
      await dispatch(googleSignIn(navigate));
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      window.googleSignInPending = false;
    }
  };

  return (
    <section className="auth-section">
      {isSignup && <Aboutauth />}

      <div className="auth-container-2">
        <img src={icon} alt="codequest-logo" className="login-logo" />
        
        <h1>{isSignup ? t('auth.signup') : t('auth.login')}</h1>
        <p className="subtitle">
          {isSignup ? 'Join our community of developers' : 'Welcome back! Please enter your details'}
        </p>

        {/* Error Display */}
        {error && <div className="error-message">{error}</div>}

        {/* Email/Password Login Form */}
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              <h4>{t('auth.name')}</h4>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setname(e.target.value)}
                disabled={loading}
              />
            </label>
          )}

          <label>
            <h4>{t('auth.email')}</h4>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              disabled={loading || needOtp}
            />
          </label>

          <label>
            <h4>{t('auth.password')}</h4>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              disabled={loading || needOtp}
              placeholder={isSignup ? 'Create a strong password' : 'Enter your password'}
            />
          </label>

          {/* OTP Input for Chrome browsers */}
          {needOtp && !isSignup && (
            <label>
              <h4>{t('auth.enterOTP')}</h4>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                disabled={loading}
              />
            </label>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              t('common.loading')
            ) : needOtp && !isSignup ? (
              t('auth.verifyOTP')
            ) : isSignup ? (
              t('auth.signup')
            ) : (
              t('auth.login')
            )}
          </button>
        </form>

        {!isSignup && (
          <div className="forgot-password-link">
            <a href="#" className="forgot-password">
              {t('auth.forgotPassword')}
            </a>
          </div>
        )}

        <div className="divider">OR</div>

        {/* Phone Auth Section */}
        <PhoneAuthSection isSignup={isSignup} navigate={navigate} />

        <div className="divider">OR</div>

        {/* Google Login Button */}
        <button className="auth-btn google-btn" onClick={handleGoogleSignIn}>
          {isSignup ? t('auth.googleSignup') : t('auth.googleLogin')}
        </button>

        <p>
          {isSignup ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}{" "}
          <button className="switch-btn" onClick={handleSwitch} disabled={loading}>
            {isSignup ? t('auth.login') : t('auth.signup')}
          </button>
        </p>
      </div>
    </section>
  );
};

export default Auth;
