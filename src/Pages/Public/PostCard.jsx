import React, { useState } from 'react';
import { deletePublicPost } from '../../api/index';
import './PublicPost.css';

const PostCard = ({ post, currentUserId, onLike, onComment, onShare, onUpdate }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || '');
  const [commentText, setCommentText] = useState('');

  const isOwner = String(post.userId?._id) === String(currentUserId);
  const isLiked = (post.likes || []).some(u => String(u) === String(currentUserId));

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePublicPost(post._id);
        alert('Post deleted successfully!');
        onUpdate();
      } catch (err) {
        alert('Failed to delete post');
        console.error(err);
      }
    }
    setShowDropdown(false);
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowDropdown(false);
  };

  const handleSaveEdit = async () => {
    try {
      // Call edit API (you'll need to implement this)
      // await editPublicPost(post._id, { caption: editCaption });
      alert('Edit functionality - API call needed!');
      setShowEditModal(false);
      onUpdate();
    } catch (err) {
      alert('Failed to update post');
    }
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  return (
    <>
      <div className="post-card">
        {/* Post Header */}
        <div className="post-header">
          <div className="post-user-info">
            <div className="post-user-avatar">
              {post.userId?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="post-username">{post.userId?.name || 'User'}</div>
              <div className="post-time">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
          
          {isOwner && (
            <div className="post-options">
              <span onClick={() => setShowDropdown(!showDropdown)}>⋯</span>
              {showDropdown && (
                <div className="post-dropdown">
                  <button onClick={handleEdit}>✏️ Edit</button>
                  <button onClick={handleDelete} className="delete-btn">🗑️ Delete</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Media */}
        {post.mediaUrl && (
          <div className="post-media-container">
            {post.mediaType === 'image' ? (
              <img 
                src={post.mediaUrl.startsWith('http') ? post.mediaUrl : `${import.meta.env.VITE_API_URL || 'https://code-quest-backend-3y3q.onrender.com'}${post.mediaUrl}`} 
                alt="post" 
                className="post-media"
                onError={(e) => {
                  console.error('Image load error:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
            ) : post.mediaType === 'video' ? (
              <video 
                src={post.mediaUrl.startsWith('http') ? post.mediaUrl : `${import.meta.env.VITE_API_URL || 'https://code-quest-backend-3y3q.onrender.com'}${post.mediaUrl}`} 
                controls 
                className="post-media" 
              />
            ) : null}
          </div>
        )}

        {/* Post Actions */}
        <div className="post-actions">
          <button 
            className={`post-action-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => onLike(post._id)}
          >
            {isLiked ? '❤️' : '🤍'}
            <span className="post-action-count">{(post.likes || []).length}</span>
          </button>
          <button className="post-action-btn">
            💬 <span className="post-action-count">{(post.comments || []).length}</span>
          </button>
          <button 
            className="post-action-btn"
            onClick={() => onShare(post._id)}
          >
            📤 <span className="post-action-count">{post.shares || 0}</span>
          </button>
        </div>

        {/* Post Caption */}
        {post.caption && (
          <div className="post-content">
            <p className="post-caption">
              <strong>{post.userId?.name}</strong>
              {post.caption}
            </p>
          </div>
        )}

        {/* Comments Section */}
        {(post.comments || []).length > 0 && (
          <div className="comments-section">
            {post.comments.map((c, idx) => (
              <div key={idx} className="comment-item">
                <strong>{c.userId?.name || 'User'}:</strong>
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment */}
        <div className="comment-box">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <button 
            onClick={handleAddComment}
            disabled={!commentText.trim()}
          >
            Post
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="edit-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <span>Edit Post</span>
              <button onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="edit-modal-body">
              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Write a caption..."
                maxLength={1000}
              />
            </div>
            <div className="edit-modal-footer">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSaveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
