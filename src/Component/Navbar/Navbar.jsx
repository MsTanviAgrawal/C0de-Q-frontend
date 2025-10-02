import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux"
import { useTranslation } from 'react-i18next'
import bars from '../../assets/bars-solid.svg'
import logo from '../../assets/logo.png';
import search from '../../assets/search-solid.svg'
import Avatar from '../Avatar/Avatar';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import NotificationBell from '../NotificationBell/NotificationBell';
import '../../Component/Navbar/Navbar.css';
import { setcurrentuser } from '../../action/currentuser'
import { jwtDecode } from "jwt-decode"


const Navbar = ({ handleslidein }) => {
    const { t } = useTranslation();
    var User = useSelector((state) => state.currentuserreducer)
    // console.log(User)
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const handlelogout = () => {
        dispatch({ type: "LOGOUT" })
        navigate("/")
        dispatch(setcurrentuser(null))
    }
    useEffect(() => {
        const token = User?.token;
        if (token) {
            const decodedtoken = jwtDecode(token);
            console.log(decodedtoken);
            if (decodedtoken.exp * 1000 < new Date().getTime()) {
                handlelogout();
            }
        }
        dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))))
    }, [User?.token, dispatch]);

    // no changes 

    return (
        <nav className="main-nav">
            <div className="navbar">
                <button className="slide-in-icon" onClick={() => handleslidein()}>
                    <img src={bars} alt="bars" width='15' />
                </button>
                <div className="navbar-1">
                    <Link to='/' className='nav-item nav-logo'>
                        <img src={logo} alt="logo" />
                    </Link>
                    <Link to="/" className="nav-item nav-btn res-nav">
                        {t('navbar.about')}
                    </Link>
                    <Link to="/" className="nav-item nav-btn res-nav">
                        {t('navbar.products')}
                    </Link>
                    <Link to="/" className="nav-item nav-btn res-nav">
                        {t('navbar.forTeams')}
                    </Link>
                    <form><input type="text" placeholder={t('navbar.search')} />
                        <img src={search} alt="search" width='18' className='search-icon' />
                    </form>
                </div>
                <div className="navbar-2">
                    <LanguageSwitcher />
                    
                    {User === null ? (
                        <>
                            <Link to='/Auth?mode=login' className='nav-item nav-links'>
                                {t('login')}
                            </Link>
                            <Link to='/Auth?mode=Signup' className='nav-item nav-links'>
                                {t('signup')}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to='/Subscription' className='nav-item nav-links' style={{ marginRight: '15px' }}>
                                💎 Plans
                            </Link>
                            <NotificationBell />
                            <Avatar backgroundColor='#009dff' px='10px' py='7px' borderRadius='50%' color="white">
                                <Link to={`/Users/${User?.result?._id}`} style={{ color: "white", textDecoration: "none" }}>
                                    {User?.result?.name?.charAt(0).toUpperCase() || 'U'}
                                </Link>
                            </Avatar>
                            <button className="nav-tem nav-links" onClick={handlelogout}>{t('navbar.logout')}</button>
                        </>
                    )}


                </div>
            </div>
        </nav>
    )
}

export default Navbar
