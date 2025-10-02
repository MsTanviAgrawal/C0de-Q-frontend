import React from 'react'
import { useTranslation } from 'react-i18next'
import '../Rightsidebar/Rightsidebar.css';
import comment from "../../assets/comment-alt-solid.svg";
import pen from "../../assets/pen-solid.svg";
import blackLogo from "../../assets/blacklogo.svg";

const Widget = () => {
    const { t } = useTranslation()
    // Use a keyPrefix so we can call post-related keys without 'posts.' prefix
    const { t: tp } = useTranslation(undefined, { keyPrefix: 'posts' })
    
    return (
        <div className='widget'>
            <h4>{tp('blogTitle')}</h4>
            <div className="right-sidebar-div-1">
                <div className="right-sidebar-div-2">
                    <img src={pen} alt='pen' width="18" />
                    <p>
                        {tp('observabilityKey')}
                    </p>
                </div>
                <div className="right-sidebar-div-2">
                    <img src={pen} alt="pen" width="18" />
                    <p>{tp('podcastScreenName')}</p>
                </div>
            </div>
            <h4>{tp('featuredOnMeta')}</h4>
            <div className="right-sidebar-div-1">
                <div className="right-sidebar-div-2" >
                    <img src={comment} alt="pen" width="18" />
                    <p>
                        {tp('reviewWorkflows')}
                    </p>
                </div>
                <div className="right-sidebar-div-2">
                    <img src={comment} alt="pen" width="18" />
                    <p>
                        {tp('welcomeAssociates')}
                    </p>
                </div>
                <div className="right-sidebar-div-2">
                    <img src={blackLogo} alt="pen" width="18" />
                    <p>
                        {tp('outdatedAnswers')}
                    </p>
                </div>
            </div>
            <h4>{tp('posts')}</h4>
            <div className="right-sidebar-div-1">
                <div className="right-sidebar-div-2">
                    <p>38</p>
                    <p>
                        {tp('spamFlagQuestion')}
                    </p>
                </div>
                <div className="right-sidebar-div-2">
                    <p>20</p>
                    <p>
                        {tp('userHighRep')}
                    </p>
                </div>
                <div className="right-sidebar-div-2">
                    <p>14</p>
                    <p>{tp('helpPageLink')}</p>
                </div>
            </div>

        </div>
    )
}

export default Widget
