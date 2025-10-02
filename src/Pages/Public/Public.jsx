import React, { useEffect, useState } from 'react';
import './Public.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// Public Space APIs
import { 
  createPublicPost, 
  getPublicFeed, 
  getPublicPostStatus, 
  likePublicPost, 
  commentPublicPost, 
  sharePublicPost 
} from '../../api/index';
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar';
import PostCard from './PostCard';

const Public = ({ slidein, handleslidein }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  const checkAuth = () => {
    const profile = localStorage.getItem('Profile');
    console.log('🔐 Checking auth, Profile:', profile ? 'exists' : 'null');
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        if (parsedProfile && parsedProfile.token) {
          console.log('✅ Authenticated');
          setIsAuthenticated(true);
          return true;
        }
      } catch (error) {
        console.error('Error parsing profile:', error);
        localStorage.removeItem('Profile');
      }
    }
    console.log('❌ Not authenticated');
    setIsAuthenticated(false);
    return false;
  };

  // Fetch posts (public endpoint, no auth required)
  const fetchPosts = async () => {
    try {
      setError('');
      const { data } = await getPublicFeed();
      // data: { posts, page, pageSize, total }
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(t('common.error_loading_posts') || 'Error loading posts');
    }
  };

  // Fetch user post status (requires authentication)
  const fetchStatus = async () => {
    if (!isAuthenticated) {
      setStatus({
        canPost: false,
        reason: t('common.login_to_post') || 'Please log in to create posts',
        friendCount: 0,
        postsToday: 0,
        limit: 0
      });
      return;
    }

    try {
      const { data } = await getPublicPostStatus();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('Profile');
        setIsAuthenticated(false);
        setStatus({
          canPost: false,
          reason: t('common.session_expired') || 'Session expired. Please log in again.',
          friendCount: 0,
          postsToday: 0,
          limit: 0
        });
      } else {
        setStatus({
          canPost: false,
          reason: t('common.error_loading_status') || 'Error loading post status',
          friendCount: 0,
          postsToday: 0,
          limit: 0
        });
      }
    }
  };

  useEffect(() => {
    const authStatus = checkAuth();
    fetchPosts();
    fetchStatus();
    // eslint-disable-next-line
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validate file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert(t('common.file_too_large') || 'File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  // Create new post
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Post submit clicked');
    console.log('Auth status:', isAuthenticated);
    console.log('Content:', content);
    console.log('File:', file);
    console.log('Status:', status);
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated');
      alert(t('common.login_required') || 'Please log in to create posts');
      navigate('/Auth');
      return;
    }

    if (!content.trim() && !file) {
      console.log('❌ No content or file');
      alert(t('common.content_required') || 'Please add some content or select a file');
      return;
    }

    if (status && !status.canPost) {
      console.log('❌ Cannot post:', status.reason);
      alert(status.reason || t('common.posting_limit_reached') || 'Posting limit reached');
      return;
    }

    console.log('✅ All checks passed, creating post...');
    setLoading(true);
    setError('');
    try {
      const result = await createPublicPost(content.trim(), file);
      console.log('✅ Post created:', result);
      setContent('');
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      alert('Post created successfully!');
      fetchPosts();
      fetchStatus();
    } catch (error) {
      console.error('❌ Error creating post:', error);
      console.error('Error response:', error.response);
      if (error.response?.status === 401) {
        localStorage.removeItem('Profile');
        setIsAuthenticated(false);
        alert(t('common.session_expired_login') || 'Session expired. Please log in again.');
        navigate('/Auth');
      } else {
        alert(error.response?.data?.message || t('common.failed_to_create_post') || 'Failed to create post');
      }
    } finally {
      setLoading(false);
    }
  };

  // Like post
  const toggleLike = async (id) => {
    if (!isAuthenticated) {
      alert(t('common.login_to_like') || 'Please log in to like posts');
      navigate('/Auth');
      return;
    }

    try {
      await likePublicPost(id);
      // for simplicity, refetch
      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('Profile');
        setIsAuthenticated(false);
        alert(t('common.session_expired_login') || 'Session expired. Please log in again.');
        navigate('/Auth');
      }
    }
  };

  // Share post
  const handleShare = async (id) => {
    if (!isAuthenticated) {
      alert(t('common.login_to_share') || 'Please log in to share posts');
      navigate('/Auth');
      return;
    }

    try {
      await sharePublicPost(id);
      fetchPosts();
    } catch (error) {
      console.error('Error sharing post:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('Profile');
        setIsAuthenticated(false);
        alert(t('common.session_expired_login') || 'Session expired. Please log in again.');
        navigate('/Auth');
      }
    }
  };

  // Add comment
  const addComment = async (id, comment) => {
    if (!comment.trim()) return;
    
    if (!isAuthenticated) {
      alert(t('common.login_to_comment') || 'Please log in to add comments');
      navigate('/Auth');
      return;
    }

    try {
      await commentPublicPost(id, comment.trim());
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('Profile');
        setIsAuthenticated(false);
        alert(t('common.session_expired_login') || 'Session expired. Please log in again.');
        navigate('/Auth');
      }
    }
  };

  const handleLoginRedirect = () => {
    navigate('/Auth');
  };

  const currentUserId = JSON.parse(localStorage.getItem('Profile'))?.result?._id;

  return (
    <div className="public-page">
      <Leftsidebar slidein={slidein} />
      <div className="public-container" onClick={handleslidein}>
        <h2>{t('sidebar.public') || 'Public'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {!isAuthenticated && (
          <div className="auth-notice">
            <p>{t('common.login_notice') || 'Please log in to create posts and interact with content.'}</p>
            <button onClick={handleLoginRedirect} className="login-button">
              {t('auth.login') || 'Log In'}
            </button>
          </div>
        )}
        
        {isAuthenticated && (
          <>
            {/* Friends Count Warning */}
            {status && status.friendCount === 0 && (
              <div className="friends-warning" style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                <h3 style={{margin: '0 0 10px 0', color: '#856404'}}>⚠️ You have 0 friends!</h3>
                <p style={{margin: '0 0 10px 0', color: '#856404'}}>
                  You need at least <strong>1 friend</strong> to post on Public Space.
                </p>
                <p style={{margin: '0 0 15px 0', fontSize: '14px', color: '#856404'}}>
                  Go to other users' profiles and click "Add Friend" to connect!
                </p>
                <button 
                  onClick={async () => {
                    try {
                      const token = JSON.parse(localStorage.getItem('Profile')).token;
                      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://code-quest-backend-3y3q.onrender.com'}/friends/add-dummy-friend`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      const data = await res.json();
                      alert(`✅ Dummy friend added! Friend count: ${data.friendCount}`);
                      fetchStatus();
                    } catch (err) {
                      alert('Failed to add friend');
                      console.error(err);
                    }
                  }}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ➕ Add Test Friend (For Testing)
                </button>
              </div>
            )}
            
            {/* Friends Count Info */}
            {status && status.friendCount > 0 && (
              <div className="friends-info" style={{
                background: '#d4edda',
                border: '1px solid #28a745',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                <strong>👥 Friends: {status.friendCount}</strong> | 
                <strong> 📝 Daily Limit: {status.limit === Infinity ? 'Unlimited 🎉' : `${status.limit} posts`}</strong>
                {status.friendCount >= 11 && <span> - You're a power user! 🚀</span>}
                {status.friendCount === 1 && <span> - Add more friends to post more!</span>}
              </div>
            )}

            <form className="post-form" onSubmit={handleSubmit}>
              <textarea
                placeholder={t('posts.whats_on_mind') || "What's on your mind?"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                maxLength={1000}
                disabled={status && !status.canPost}
              />
              <div className="file-input-container">
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  onChange={handleFileChange}
                  id="file-input"
                  disabled={status && !status.canPost}
                />
                <label htmlFor="file-input" className="file-input-label">
                  {file ? file.name : (t('posts.choose_file') || 'Choose Image/Video')}
                </label>
              </div>
              <button 
                type="submit" 
                disabled={loading || (status && !status.canPost)} 
                className="post-button"
              >
                {loading ? (t('posts.posting') || 'Posting...') : (t('posts.post') || 'Post')}
              </button>
              {status && (
                <p className="post-status">
                  {t('posts.posts_today') || 'Posts today'}: {status.postsToday || 0}
                  {status.limit && status.limit !== Infinity && ` / ${status.limit}`}
                  {status.limit === Infinity && ' (Unlimited)'}
                </p>
              )}
            </form>
          </>
        )}

        <div className="posts-feed">
          {posts.length === 0 && !loading ? (
            <div className="no-posts">
              {t('posts.no_posts') || 'No posts yet. Be the first to share something!'}
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={currentUserId}
                onLike={toggleLike}
                onComment={addComment}
                onShare={handleShare}
                onUpdate={fetchPosts}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Comment input component
const CommentBox = ({ onAdd, isAuthenticated }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  
  const handleAdd = () => {
    if (!isAuthenticated) {
      alert(t('common.login_to_comment') || 'Please log in to add comments');
      navigate('/Auth');
      return;
    }
    
    if (value.trim()) {
      onAdd(value);
      setValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="comment-box">
      <input
        type="text"
        placeholder={t('posts.add_comment') || 'Add a comment...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        maxLength={500}
        disabled={!isAuthenticated}
      />
      <button onClick={handleAdd} disabled={!value.trim() || !isAuthenticated}>
        {t('posts.add') || 'Add'}
      </button>
    </div>
  );
};

export default Public;
