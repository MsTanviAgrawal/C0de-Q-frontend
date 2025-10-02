import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import moment from "moment"
import './VideoModal.css'

const Question = ({ question }) => {
    const { t } = useTranslation()
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

    const openVideoModal = () => {
        setIsVideoModalOpen(true)
    }

    const closeVideoModal = () => {
        setIsVideoModalOpen(false)
    }
    
    return (
        <div className="display-question-container">
            <div className="display-votes-ans">
                <p>{question.upvote.length - question.downvote.length}</p>
                <p>{t('questions.votes')}</p>
            </div>
            <div className="display-votes-ans">
                <p>{question.noofanswers}</p>
                <p>{t('questions.answers')}</p>
            </div>
            <div className="display-question-details">
                <Link to={`/Question/${question._id}`} className='question-title-link'>
                    {question.questiontitle.length > (window.innerWidth <= 400 ? 70 : 90)
                        ? question.questiontitle.substring(
                            0,
                            window.innerWidth <= 400 ? 70 : 90
                        ) + "..."
                        : question.questiontitle
                    }
                    {question.hasVideo && <span className="video-indicator">🎥 {t('questions.uploadVideo')}</span>}
                </Link>
                {question.hasVideo && question.video && (
                    <>
                        <div className="video-preview-small" onClick={openVideoModal}>
                            <video 
                                preload="metadata"
                            >
                                <source src={`${import.meta.env.VITE_API_URL || 'https://code-quest-backend-3y3q.onrender.com'}${question.video}#t=0.5`} type="video/mp4" />
                            </video>
                            <div className="video-overlay">
                                <div className="play-icon">▶</div>
                                <span className="watch-text">Click to watch</span>
                            </div>
                        </div>

                        {/* Video Modal */}
                        {isVideoModalOpen && (
                            <div className="video-modal-overlay" onClick={closeVideoModal}>
                                <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                                    <button className="close-modal" onClick={closeVideoModal}>×</button>
                                    <video 
                                        controls
                                        autoPlay
                                        className="modal-video"
                                    >
                                        <source src={`${import.meta.env.VITE_API_URL || 'https://code-quest-backend-3y3q.onrender.com'}${question.video}`} type="video/mp4" />
                                        {t('questions.selectVideo')}
                                    </video>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div className="display-tags-time">
                    <div className="display-tags">
                        {question.questiontags.map((tag)=>(
                            <p key={tag}> {tag}</p>
                        ))}
                    </div>
                    <p className="display-time">
                        {t('questions.asked')} {moment(question.askedon).fromNow()} {question.userposted}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Question
