import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [otp, setOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [verificationType, setVerificationType] = useState('');
  const [useSimpleSwitch, setUseSimpleSwitch] = useState(true);
  const ENABLE_SAVE_PREF = false;
  const User = useSelector((state) => state.currentuserreducer);
  const userId = User?.result?._id;

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const handleSimpleLanguageSwitch = (languageCode) => {
    if (languageCode === i18n.language) {
      setMessage('This language is already selected');
      return;
    }

    i18n.changeLanguage(languageCode);
    localStorage.setItem('preferredLanguage', languageCode);
    
    if (userId && ENABLE_SAVE_PREF) {
      updateUserLanguagePreference(languageCode);
    }
    
    setMessage(`Language switched to ${languages.find(l => l.code === languageCode)?.name}`);
    setShowModal(false);
  };

  const updateUserLanguagePreference = async (languageCode) => {
    try {
      await axios.put(`http://localhost:5001/user/language/${userId}`, {
        preferredLanguage: languageCode
      });
    } catch (error) {
      console.warn('Could not save language preference to database:', error);
    }
  };

  const handleLanguageSelect = async (languageCode) => {
    if (useSimpleSwitch || !userId) {
      handleSimpleLanguageSwitch(languageCode);
      return;
    }

    if (languageCode === i18n.language) {
      setMessage('This language is already selected');
      return;
    }

    setSelectedLanguage(languageCode);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/language/request-switch', {
        userId,
        targetLanguage: languageCode
      });

      setVerificationType(response.data.verificationType);
      setMessage(response.data.message);
      setShowModal(false);
      setShowOTPModal(true);
    } catch (error) {
      if (error.response?.data?.message?.includes('Mobile number required')) {
        setShowModal(false);
        setShowMobileModal(true);
      } else {
        console.warn('OTP service failed, using simple switch:', error);
        handleSimpleLanguageSwitch(languageCode);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!otp.trim()) {
      setMessage('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
     
      const response = { data: { message: 'Verification skipped (frontend-only mode)' } };

      setMessage(response.data.message);
      i18n.changeLanguage(selectedLanguage);
      localStorage.setItem('preferredLanguage', selectedLanguage);
      
      setShowOTPModal(false);
      setOtp('');
      setSelectedLanguage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileUpdate = async () => {
    if (!mobileNumber.trim()) {
      setMessage('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      setShowMobileModal(false);
      setShowOTPModal(true);
      setMessage('Mobile updated. Please verify OTP.');
    } catch (error) {
      setMessage('Failed to update mobile number');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === i18n.language) || languages[0];
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <div className="language-switcher">
      <button 
        className="language-btn"
        onClick={() => setShowModal(true)}
        title={t('language.switchLanguage')}
      >
        <span className="flag">{getCurrentLanguage().flag}</span>
        <span className="lang-code">{getCurrentLanguage().code.toUpperCase()}</span>
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('language.selectLanguage')}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="current-lang">
                <p>{t('language.currentLanguage')}: {getCurrentLanguage().name}</p>
              </div>
              
              <div className="switch-mode" style={{marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '6px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                  <input 
                    type="checkbox" 
                    checked={useSimpleSwitch} 
                    onChange={(e) => setUseSimpleSwitch(e.target.checked)}
                  />
                  <span style={{fontSize: '14px'}}>Quick Switch (No OTP Required)</span>
                </label>
              </div>

              <div className="language-grid">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${lang.code === i18n.language ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect(lang.code)}
                    disabled={loading || lang.code === i18n.language}
                  >
                    <span className="flag">{lang.flag}</span>
                    <span className="name">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showOTPModal && (
        <div className="modal-overlay" onClick={() => setShowOTPModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('language.verificationRequired')}</h3>
              <button className="close-btn" onClick={() => setShowOTPModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{t('language.otpSent')} {verificationType}</p>
              <div className="otp-input">
                <input
                  type="text"
                  placeholder={t('language.enterOTP')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                />
                <button 
                  onClick={handleOTPVerification}
                  disabled={loading || !otp.trim()}
                  className="verify-btn"
                >
                  {loading ? t('common.loading') : t('language.verify')}
                </button>
              </div>
              <div style={{marginTop: '10px', textAlign: 'center'}}>
                <button 
                  onClick={() => {
                    setShowOTPModal(false);
                    handleSimpleLanguageSwitch(selectedLanguage);
                  }}
                  style={{background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer'}}
                >
                  Skip OTP and switch anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMobileModal && (
        <div className="modal-overlay" onClick={() => setShowMobileModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('language.updateMobile')}</h3>
              <button className="close-btn" onClick={() => setShowMobileModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Mobile number is required for language switching (except French).</p>
              <div className="mobile-input">
                <input
                  type="tel"
                  placeholder={t('language.mobileNumber')}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
                <button 
                  onClick={handleMobileUpdate}
                  disabled={loading || !mobileNumber.trim()}
                  className="update-btn"
                >
                  {loading ? t('common.loading') : t('language.update')}
                </button>
              </div>
              <div style={{marginTop: '10px', textAlign: 'center'}}>
                <button 
                  onClick={() => {
                    setShowMobileModal(false);
                    handleSimpleLanguageSwitch(selectedLanguage);
                  }}
                  style={{background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer'}}
                >
                  Skip and switch anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`message ${message.includes('success') || message.includes('switched') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
