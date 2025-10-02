import React, { useState, useEffect } from 'react'
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { useSelector } from 'react-redux'
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  checkFriendshipStatus,
  getFriendsList
} from '../../api/index';
import Avatar from '../../Component/Avatar/Avatar'
import './FriendButton.css'
import Editprofileform from './Editprofileform'
import Profilebio from './Profilebio'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBirthdayCake, faPen } from '@fortawesome/free-solid-svg-icons'
import NotificationToggle from './NotificationToggle'
import LoginHistorySection from './LoginHistorySection'

const Userprofile = ({ slidein }) => {
    const { id } = useParams()
    const [Switch, setswitch] = useState(false);
    const [friendState, setFriendState] = useState({ status: 'loading' });
    const [friendsList, setFriendsList] = useState([]);
    const [friendsCount, setFriendsCount] = useState(0);

    const users = useSelector((state) => state.usersreducer)
    const currentprofile = users.filter((user) => user._id === id)[0]
    const currentuser = useSelector((state) => state.currentuserreducer)

    // fetch friend status
    useEffect(() => {
      const fetchStatus = async () => {
        if (!currentuser?.result?._id || id === currentuser?.result?._id) return;
        try {
          const { data } = await checkFriendshipStatus(id);
          setFriendState(data);
        } catch (err) {
          console.error(err);
          setFriendState({ status: 'error' });
        }
      };
      fetchStatus();
    }, [id, currentuser]);

    // fetch friends list
    useEffect(() => {
      const fetchFriends = async () => {
        try {
          const { data } = await getFriendsList(id);
          setFriendsList(data.friends || []);
          setFriendsCount(data.count || 0);
        } catch (err) {
          console.error('Error fetching friends:', err);
        }
      };
      fetchFriends();
    }, [id]);

    if (!currentprofile) {
    return (
      <div className="home-container-1">
        <Leftsidebar slidein={slidein} />
        <div className="home-container-2">
          <h2>User not found</h2>
          {/* Optional: You can redirect to home page or show loader */}
        </div>
      </div>
    )
  }

    return (
        <div className="home-container-1">
            <Leftsidebar slidein={slidein} />
            <div className="home-container-2">
                <section>
                    <div className="user-details-container">
                        <div className="user-details">
                            <Avatar backgroundColor="purple" color="white" fontSize="50px" px="40px" py="30px">
                                {currentprofile.name.charAt(0).toUpperCase()}
                                </Avatar>
                            <div className="user-name">
                                <h1>{currentprofile?.name}</h1>
                                <p>
                                    <FontAwesomeIcon icon={faBirthdayCake} /> Joined{" "} 
                                    {moment(currentprofile?.joinedon).fromNow()}
                                </p>
                            </div>
                        </div>
                        {/* Friend actions */}
                        {currentuser?.result?._id !== id && friendState.status !== 'loading' && friendState.status !== 'error' && (
                            <FriendActions state={friendState} refresh={setFriendState} targetId={id} />
                        )}

                        {currentuser?.result?._id === id && (
                            <button className="edit-profile-btn"
                             type='button' 
                             onClick={() => setswitch(true)}>
                                <FontAwesomeIcon icon={faPen} /> Edit Profile</button>
                        )}
                    </div>
                    <>
                        {Switch ? (
                            <Editprofileform currentuser={currentuser} setswitch={setswitch} />
                        ) : (
                            <>
                              <Profilebio currentprofile={currentprofile} />
                              
                              {/* Friends Section */}
                              <div className="friends-section" style={{
                                marginTop: '20px',
                                padding: '20px',
                                background: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}>
                                <h3 style={{marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                  👥 Friends 
                                  <span style={{
                                    background: '#007bff',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                  }}>
                                    {friendsCount}
                                  </span>
                                </h3>
                                
                                {friendsCount === 0 ? (
                                  <p style={{color: '#666', textAlign: 'center', padding: '20px'}}>
                                    {currentuser?.result?._id === id 
                                      ? 'You have no friends yet. Start connecting with others!'
                                      : 'No friends yet'}
                                  </p>
                                ) : (
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: '15px'
                                  }}>
                                    {friendsList.map((friend) => (
                                      <div key={friend._id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px',
                                        background: '#f8f9fa',
                                        borderRadius: '8px',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                      onClick={() => window.location.href = `/Users/${friend._id}`}
                                      >
                                        <Avatar backgroundColor="purple" color="white" fontSize="20px" px="15px" py="10px">
                                          {friend.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <div style={{flex: 1, minWidth: 0}}>
                                          <div style={{fontWeight: 'bold', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                            {friend.name}
                                          </div>
                                          <div style={{fontSize: '12px', color: '#666'}}>
                                            {friend.tags?.length > 0 ? friend.tags[0] : 'Member'}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {currentuser?.result?._id === id && (
                                <LoginHistorySection userId={id} />
                              )}
                            </>
                        )}
                    </>
                </section>
            </div>
            <NotificationToggle/>
        </div>
    )
}

// Separate component for buttons
const FriendActions = ({ state, refresh, targetId }) => {
  const handle = async (action) => {
    try {
      if (action === 'add') {
        await sendFriendRequest(targetId);
        alert('Friend request sent!');
      } else if (action === 'cancel') {
        await cancelFriendRequest(state.requestId);
        alert('Request cancelled');
      } else if (action === 'accept') {
        await acceptFriendRequest(state.requestId);
        alert('Friend request accepted!');
      } else if (action === 'reject') {
        await rejectFriendRequest(state.requestId);
        alert('Request rejected');
      } else if (action === 'unfriend') {
        if (window.confirm('Remove this friend?')) {
          await removeFriend(targetId);
          alert('Friend removed');
        } else {
          return;
        }
      }
      const { data } = await checkFriendshipStatus(targetId);
      refresh(data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  switch (state.status) {
    case 'not_friends':
      return <button className="friend-btn add-friend" onClick={() => handle('add')}>➕ Add Friend</button>;
    case 'request_sent':
      return <button className="friend-btn cancel-request" onClick={() => handle('cancel')}>✕ Cancel Request</button>;
    case 'request_received':
      return (
        <div className="friend-actions-group">
          <button className="friend-btn accept-friend" onClick={() => handle('accept')}>✓ Accept</button>
          <button className="friend-btn reject-friend" onClick={() => handle('reject')}>✕ Reject</button>
        </div>
      );
    case 'friends':
      return <button className="friend-btn unfriend" onClick={() => handle('unfriend')}>👋 Unfriend</button>;
    default:
      return null;
  }
};

export default Userprofile
