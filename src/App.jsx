import { fetchallusers } from './action/users';
import { useState, useEffect } from 'react'
import './App.css'
import './responsive.css'
import Navbar from './Component/Navbar/Navbar'
import { BrowserRouter as Router } from 'react-router-dom';
import Allroutes from './Allroutes'
import { useDispatch } from 'react-redux';
import { fetchallquestions } from './action/question';
import { requestNotificationPermission, showNotification } from './Utils/Notification'
import { connectSocket } from './Utils/socket'
import './i18n'; // Initialize i18n
import { useTranslation } from 'react-i18next';

function App() {
  const [slidein, setSlideIn] = useState(true)
  const dispatch = useDispatch()
  const { i18n } = useTranslation();

  // Load user's preferred language on app start
  useEffect(() => {
    const profile = localStorage.getItem("Profile");
    if (profile) {
      const user = JSON.parse(profile)?.result;
      if (user && user.preferredLanguage) {
        i18n.changeLanguage(user.preferredLanguage);
      } else {
        // Fallback to localStorage or browser language
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage);
        }
      }
    }
  }, [i18n]);

  useEffect(() => {
    dispatch(fetchallusers());
    dispatch(fetchallquestions());
  }, [dispatch])

  useEffect(() => {
    // Connect to socket.io and set up notification listeners
    const profile = localStorage.getItem("Profile");
    const notificationsEnabled = localStorage.getItem("notificationsEnabled") === "true";
    if (profile && notificationsEnabled) {
      const user = JSON.parse(profile)?.result;
      if (user && user._id) {
        const socket = connectSocket(user._id);
        socket.on("new_answer", (data) => {
          if (localStorage.getItem("notificationsEnabled") === "true") {
            showNotification("New Answer", `${data.useranswered} answered your question!`);
          }
        });
        socket.on("question_upvoted", (data) => {
          if (localStorage.getItem("notificationsEnabled") === "true") {
            showNotification("Question Upvoted", `${data.upvotedBy} upvoted your question!`);
          }
        });
        socket.on("question_downvoted", (data) => {
          if (localStorage.getItem("notificationsEnabled") === "true") {
            showNotification("Question Downvoted", `${data.downvotedBy} downvoted your question!`);
          }
        });
        socket.on("friend_request", (data) => {
          if (localStorage.getItem("notificationsEnabled") === "true") {
            showNotification("New Friend Request", `Request sent by ${data.fromUserName}`);
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSlideIn(false)
    }
  }, [])
  const handleslidein = () => {
    if (window.innerWidth <= 768) {
      setSlideIn((state) => !state);
    }
  };
  useEffect(() => {
  const enabled = localStorage.getItem("notificationsEnabled") === "true";
  if (enabled) {
    requestNotificationPermission();
  }
}, []);

  return (
    <>
      <div className='App'>
        <Router>
          <Navbar handleslidein={handleslidein} />
          <Allroutes slidein={slidein} handleslidein={handleslidein} />
        </Router>

      </div>

    </>
  )
}

export default App
