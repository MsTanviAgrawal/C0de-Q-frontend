import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://code-quest-backend-3y3q.onrender.com",
    withCredentials: true,
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem("Profile")) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem("Profile")).token
            }`;
    }
    return req;
});

export const googleLogin = (authData) =>
    API.post("/user/googlelogin", authData);

export const phoneLogin = (authData) =>
    API.post("/user/phonelogin", authData);
export const sendOtp = (phoneData) => API.post("/user/send-otp", phoneData);
export const verifyOtp = (otpData) => API.post("/user/verify-otp", otpData);

// Email OTP authentication
export const sendEmailOtp = (emailData) => API.post("/user/send-email-otp", emailData);
export const verifyEmailOtp = (otpData) => API.post("/user/verify-email-otp", otpData);

export const login = (authdata) => API.post("/user/login", authdata);
export const signup = (authdata) => API.post("/user/signup", authdata);
export const getallusers = () => API.get("/user/getallusers");
export const updateprofile = (id, updatedata) =>
    API.patch(`user/update/${id}`, updatedata);

export const postquestion = (questiondata) =>
    API.post("/questions/Ask", questiondata);
export const getallquestions = () => API.get("/questions/get");
export const getvideoquestions = () => API.get("/questions/get/video");
export const gettextquestions = () => API.get("/questions/get/text");
export const deletequestion = (id) => API.delete(`/questions/delete/${id}`);
export const editquestion = (id, questionData) => API.patch(`/questions/edit/${id}`, questionData);
export const votequestion = (id, value) =>
    API.patch(`/questions/vote/${id}`, { value });

export const postanswer = (id, noofanswers, answerbody, useranswered, userid) =>
    API.patch(`/answer/post/${id}`, {
        noofanswers,
        answerbody,
        useranswered,
        userid,
    });

// =============== Public Space APIs ==================
// Create public post (caption + optional media file)
export const createPublicPost = (caption, file) => {
    const form = new FormData();
    if (caption) form.append('caption', caption);
    if (file) form.append('media', file);
    return API.post('/public-posts', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Get feed (paginated)
export const getPublicFeed = (page = 1, pageSize = 10) =>
    API.get(`/public-posts?page=${page}&pageSize=${pageSize}`);

// Get posting status (limits based on friend count)
export const getPublicPostStatus = () => API.get('/public-posts/status');

// Like/unlike
export const likePublicPost = (postId) => API.patch(`/public-posts/${postId}/like`);

// Add comment
export const commentPublicPost = (postId, text) =>
    API.post(`/public-posts/${postId}/comments`, { text });

// Share
export const sharePublicPost = (postId) => API.post(`/public-posts/${postId}/share`);

// Delete own post
export const deletePublicPost = (postId) => API.delete(`/public-posts/${postId}`);

// =============== Friends APIs ==================
// Send friend request
export const sendFriendRequest = (toUserId) => API.post('/friends/request', { toUserId });

// Get pending friend requests (received)
export const getPendingFriendRequests = () => API.get('/friends/requests/pending');

// Get sent friend requests
export const getSentFriendRequests = () => API.get('/friends/requests/sent');

// Accept friend request
export const acceptFriendRequest = (requestId) => API.patch(`/friends/request/${requestId}/accept`);

// Reject friend request
export const rejectFriendRequest = (requestId) => API.patch(`/friends/request/${requestId}/reject`);

// Cancel sent request
export const cancelFriendRequest = (requestId) => API.delete(`/friends/request/${requestId}/cancel`);

// Get friends list
export const getFriendsList = (userId) => API.get(userId ? `/friends/list/${userId}` : '/friends/list');

// Remove friend
export const removeFriend = (friendId) => API.delete(`/friends/${friendId}`);

// Check friendship status
export const checkFriendshipStatus = (targetUserId) => API.get(`/friends/status/${targetUserId}`);

export const deleteanswer = (id, answerid, noofanswers) =>
    API.patch(`/answer/delete/${id}`, { answerid, noofanswers });

export const createPost = (payload) => API.post('/posts/create', payload);
export const getAllPosts = () => API.get('/posts/all');
export const getPostStatus = () => API.get('/posts/status');
export const likePost = (id) => API.patch(`/posts/like/${id}`);
export const addComment = (id, comment) => API.patch(`/posts/comment/${id}`, { comment });
export const sharePost = (id) => API.patch(`/posts/share/${id}`);

export const getLoginHistory = (userId) => API.get(`/user/login-history/${userId}`);
export const getRecentLogins = (userId) => API.get(`/user/recent-logins/${userId}`);
export const getLoginStats = (userId) => API.get(`/user/login-stats/${userId}`);

// Subscription APIs
export const getPlans = () => API.get('/subscription/plans');
export const getMySubscription = () => API.get('/subscription/my-subscription');
export const createOrder = (data) => API.post('/subscription/create-order', data);
export const verifyPayment = (data) => API.post('/subscription/verify-payment', data);
export const getPaymentHistory = () => API.get('/subscription/payment-history');

