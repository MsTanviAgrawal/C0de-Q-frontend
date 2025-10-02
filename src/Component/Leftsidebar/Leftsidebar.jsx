import React from 'react'
import '../Leftsidebar/Leftsidebar.css'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Globe from '../../assets/Globe.svg'

const Leftsidebar = ({slidein}) => {
    const { t } = useTranslation()
    
    const slideinstyle = {
        transform: "translateX(0%)",
    };
    const slideoutstyle = {
        transform: "translateX(-100%)",
    }

    return (
        <div className="left-sidebar" style={slidein ? slideinstyle : slideoutstyle} >
            <nav className='side-nav'>
                <button className="nav-btnn">
                    <NavLink to='/' className="side-nav-links" activeclassname='active' >
                        <p>{t('navbar.home') || 'Home'}</p>
                    </NavLink>
                </button>
                <div className="side-nav-div">
                    {/* <div>
                        <p>{t('sidebar.public') || 'PUBLIC'}</p>
                    </div> */}
                    <button className='nav-btnn'>
                        <NavLink to='/Question' className='side-nav-links' activeclassname='active'>
                            <img src={Globe} alt='globe' />
                            <p style={{ paddingLeft: "10px" }}>{t('sidebar.questions') || 'Questions'}</p>
                        </NavLink>
                    </button>
                    <button className='nav-btnn'>
                        <NavLink to='/Tags' className='side-nav-links' activeclassname='active' 
                        style={{ paddingLeft: "40px" }}>
                            <p>{t('sidebar.tags') || 'Tags'}</p>
                        </NavLink>
                    </button>
                    <button className='nav-btnn'>
                        <NavLink to='/Users' className='side-nav-links' activeclassname='active'
                            style={{ paddingLeft: "40px" }} >
                            <p>{t('sidebar.users') || 'Users'}</p>
                        </NavLink>
                    </button>
                    <button className='nav-btnn'>
                        <NavLink to='/Public' className='side-nav-links' activeclassname='active' style={{ paddingLeft: "40px" }}>
                            <p>{t('sidebar.public') || 'Public'}</p>
                        </NavLink>
                    </button>
                </div>
            </nav>
        </div>
    )
}

export default Leftsidebar
