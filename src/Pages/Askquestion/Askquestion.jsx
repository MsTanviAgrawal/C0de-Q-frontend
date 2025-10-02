import React from 'react'
import '../Askquestion/Askquestion.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useSelector, useDispatch } from "react-redux"
import { useTranslation } from 'react-i18next'
import { askquestion } from '../../action/question'
import { sendEmailOtp, verifyEmailOtp } from '../../api/index'
import SubscriptionModal from '../../Component/SubscriptionModal/SubscriptionModal'
import './VideoUpload.css'
import './VideoUploadStyles.css'

const Askquestion = () => {
    const { t } = useTranslation()
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state)=>state.currentuserreducer);
    const [questiontitle, setquestiontitle] = useState("");
    const [questionbody, setquestionbody] = useState("");
    const [questiontag, setquestiontags] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [otp, setOtp] = useState("");
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [isOTPVerified, setIsOTPVerified] = useState(false);
    const [emailInput, setEmailInput] = useState(user?.result?.email || "");
    const [errorMsg, setErrorMsg] = useState("");
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [subscriptionError, setSubscriptionError] = useState({ message: '', currentPlan: '' });

    const handlesubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields for all questions
        if (!questiontitle.trim()) {
            alert(t('questions.questionTitle'));
            return;
        }
        if (!questionbody.trim()) {
            alert(t('questions.questionBody'));
            return;
        }
        if (!questiontag || questiontag.length === 0) {
            alert(t('questions.questionTags'));
            return;
        }

        if (user) {
            // Create question data object for text questions (no video)
            const questionData = {
                questiontitle,
                questionbody,
                questiontags: questiontag,
                userposted: user.result.name,
                hasVideo: false // Text questions don't have video
            };

            try {
                await dispatch(askquestion(questionData, navigate));
            } catch (error) {
                console.error("Failed to post question:", error);
                // Check if it's a subscription limit error
                if (error.response?.status === 403) {
                    const errorData = error.response.data;
                    setSubscriptionError({
                        message: errorData.message || 'Daily limit reached!',
                        currentPlan: errorData.currentPlan || 'free'
                    });
                    setShowSubscriptionModal(true);
                } else {
                    alert(t('common.somethingWentWrong'));
                }
            }
        } else {
            alert(t('auth.loginSuccess'));
        }
    }

    const handleenter = (e) => {
        if (e.code === 'Enter') {
            setquestionbody(questionbody + "\n");
        }
    }

    // Send OTP to user's email
    const handleSendOtp = async () => {
        if (!emailInput) {
            setErrorMsg(t('auth.email'));
            return;
        }
        try {
            const response = await sendEmailOtp({ email: emailInput });
            setIsOTPSent(true);
            setErrorMsg("");
            
            // Show OTP in console for development mode
            if (response.data.devOtp) {
                console.log(`🔑 Development OTP: ${response.data.devOtp}`);
                alert(`Development Mode: Your OTP is ${response.data.devOtp}`);
            } else {
                alert('OTP sent successfully to your email!');
            }
        } catch (error) {
            console.error('OTP Send Error:', error);
            const msg = error?.response?.data?.message || 'Failed to send OTP. Please check backend server.';
            setErrorMsg(msg);
            alert(msg);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (!otp) {
            alert(t('auth.enterOTP'));
            return;
        }
        try {
            const response = await verifyEmailOtp({ email: emailInput, otp });
            setIsOTPVerified(true);
            setErrorMsg("");
            alert('OTP verified successfully! You can now upload the video.');
        } catch (error) {
            console.error('OTP Verify Error:', error);
            const msg = error?.response?.data?.message || 'Invalid OTP. Please try again.';
            setErrorMsg(msg);
            alert(msg);
        }
    };

    // Video change handler
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            alert(t('questions.selectVideo'));
            return;
        }

        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(url);
            if (video.duration > 120) {
                alert(t('questions.selectVideo'));
            } else {
                setVideoFile(file);
            }
        };
        video.src = url;
    };

    // Handle video upload
    const handleVideoUpload = async () => {
        if (!videoFile) {
            alert(t('questions.selectVideo'));
            return;
        }

        if (!questiontitle.trim()) {
            alert(t('questions.questionTitle'));
            return;
        }
        if (!questionbody.trim()) {
            alert(t('questions.questionBody'));
            return;
        }
        if (!questiontag || questiontag.length === 0) {
            alert(t('questions.questionTags'));
            return;
        }

        const formData = new FormData();
        formData.append('questiontitle', questiontitle);
        formData.append('questionbody', questionbody);
        formData.append('questiontags', JSON.stringify(questiontag));
        formData.append('userposted', user.result.name);
        formData.append('video', videoFile);
        formData.append('hasVideo', 'true');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://code-quest-backend-3y3q.onrender.com'}/questions/Ask`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                },
                body: formData
            });

            if (response.ok) {
                alert(t('questions.videoUploadSuccess'));
                navigate('/');
            } else {
                const errorData = await response.json();
                alert(errorData.message || t('common.somethingWentWrong'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(t('common.somethingWentWrong'));
        }
    };

    return (
        <div className="ask-question">
            <div className="ask-ques-container">
                <h1>{t('questions.askQuestion')}</h1>
                <form onSubmit={handlesubmit}>
                    <div className="ask-form-container">
                        <label htmlFor="ask-ques-title">
                            <h4>{t('questions.title')}</h4>
                            <p>{t('questions.questionTitle')}</p>
                            <input type="text" id='ask-ques-title' onChange={(e) => {
                                setquestiontitle(e.target.value)
                            }}
                                placeholder={t('questions.questionTitle')}
                            />
                        </label>
                        <label htmlFor="ask-ques-body">
                            <h4>{t('questions.body')}</h4>
                            <p>{t('questions.questionBody')}</p>
                            <textarea name="" id="ask-ques-body" onChange={(e) => {
                                setquestionbody(e.target.value)
                            }} cols="30" rows="10" onKeyDown={handleenter}></textarea>
                        </label>
                        <label htmlFor="ask-ques-tags">
                            <h4>{t('questions.tags')}</h4>
                            <p>{t('questions.questionTags')}</p>
                            <input type="text" id='ask-ques-tags' onChange={(e) => {
                                setquestiontags(e.target.value.split(" "));
                            }}
                                placeholder='e.g. (xml typescript wordpress'
                            />
                        </label>

                        <label htmlFor="video-upload">
                            <h4>{t('questions.uploadVideo')} (max 2 min / 50MB)</h4>
                            <input type="file" accept="video/*" onChange={handleVideoChange} />
                            {videoFile && (
                                <p className="video-selected">✅ {t('questions.selectVideo')}: {videoFile.name}</p>
                            )}
                        </label>

                        {videoFile && !isOTPVerified && (
                            <div className="otp-section">
                                <h4>{t('language.verificationRequired')}</h4>
                                <p>{t('auth.verifyOTP')}</p>
                                <div className="email-otp-block">
                                    <input
                                        type="email"
                                        placeholder={t('auth.email')}
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        disabled={isOTPSent}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={isOTPSent || !emailInput}
                                    >
                                        {t('auth.enterOTP')}
                                    </button>
                                    {isOTPSent && (
                                        <>
                                            <input
                                                type="text"
                                                placeholder={t('auth.enterOTP')}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyOtp}
                                                disabled={!otp}
                                            >
                                                {t('auth.verifyOTP')}
                                            </button>
                                        </>
                                    )}
                                    {errorMsg && <p className="otp-error">{errorMsg}</p>}
                                </div>
                            </div>
                        )}

                        {videoFile && isOTPVerified && (
                            <div className="upload-section">
                                <p className="otp-success">✅ {t('auth.loginSuccess')}</p>
                                <button
                                    type="button"
                                    className="upload-video-btn"
                                    onClick={handleVideoUpload}
                                >
                                    {t('questions.uploadVideo')}
                                </button>
                            </div>
                        )}
                    </div>
                    <input type="submit"
                        value={t('questions.reviewQuestion')}
                        className='review-btn' />
                </form>
            </div>

            {/* Subscription Limit Modal */}
            <SubscriptionModal 
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                currentPlan={subscriptionError.currentPlan}
                message={subscriptionError.message}
            />
        </div>
    )
}

export default Askquestion
