import React, { useState, useEffect } from 'react'
import '../Homemainbar/Homemainbar.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Questionlist from '../Homemainbar/Questionlist'
import { fetchallquestions, fetchvideoquestions, fetchtextquestions } from '../../action/question'

const Homemainbar = () => {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('all');
    const user = useSelector((state) => state.currentuserreducer)
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const questionlist = useSelector((state) => state.questionreducer)
    // console.log(questionlist)


    const checkauth = () => {
        if (user === null) {
            alert(t('auth.loginSuccess'))
            navigate("/Auth")
        } else {
            navigate("/Askquestion")
        }
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        switch(tab) {
            case 'all':
                dispatch(fetchallquestions());
                break;
            case 'video':
                dispatch(fetchvideoquestions());
                break;
            case 'text':
                dispatch(fetchtextquestions());
                break;
            default:
                dispatch(fetchallquestions());
        }
    }

    useEffect(() => {
        if (activeTab === 'all') {
            dispatch(fetchallquestions());
        }
    }, [dispatch, activeTab]);

    return (
        <div className="main-bar">
            <div className="main-bar-header">
                {location.pathname === "/" ? (
                    <h1>{t('home.topQuestions')}</h1>
                ) : (
                    <h1>{t('home.allQuestions')}</h1>
                )}
                <button className="ask-btn" onClick={checkauth}>{t('questions.askQuestion')}</button>
            </div>
            
            {/* Question Type Tabs */}
            <div className="question-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => handleTabChange('all')}
                >
                    {t('questions.allQuestions')}
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                    onClick={() => handleTabChange('video')}
                >
                    🎥 {t('questions.videoQuestions')}
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
                    onClick={() => handleTabChange('text')}
                >
                    📝 {t('questions.textQuestions')}
                </button>
            </div>
            <div>
                {questionlist.data === null ? (
                    <h1>{t('common.loading')}</h1>
                ) : (
                    <>
                        <p>
                            {questionlist.data.length} 
                            {activeTab === 'all' ? ` ${t('questions.questions')}` : 
                             activeTab === 'video' ? ` ${t('questions.videoQuestions')}` : ` ${t('questions.textQuestions')}`}
                        </p>
                        <Questionlist questionlist={questionlist.data} />
                    </>
                )
                }
            </div>

        </div>
    )
}

export default Homemainbar
