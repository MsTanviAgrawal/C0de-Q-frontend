import * as api from '../api/index';
import { signInWithPopup, auth, provider } from '../firebase';
import { setcurrentuser } from './currentuser';
import { fetchallusers } from './users';

export const signup = (authdata, navigate) => async (dispatch) => {
    try {
        const { data } = await api.signup(authdata);
        localStorage.setItem("Profile", JSON.stringify(data));
        dispatch({ type: "AUTH", data });
         dispatch(setcurrentuser(data)); 
        dispatch(fetchallusers());
        navigate("/");
    } catch (error) {
        console.log(error);
    }
};

export const login = (authdata, navigate) => async (dispatch) => {
    try {
        const { data } = await api.login(authdata);
        
        // Check if OTP is required (Chrome browser)
        if (data.needOtp) {
            // Don't navigate or set auth data yet, just return the response
            return data;
        }
        
        // Normal login flow - store data and navigate
        localStorage.setItem("Profile", JSON.stringify(data));
        dispatch({ type: "AUTH", data });
        dispatch(setcurrentuser(data));
        navigate("/");
        
        return data;
    } catch (error) {
        console.log("Login error:", error);
        
        // Handle specific error messages
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw new Error("Login failed. Please try again.");
    }
};


export const googleSignIn = (navigate, isSignup = false) => async (dispatch) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const idToken = await user.getIdToken();
    const authData = {
      name: user.displayName,
      email: user.email,
      token: idToken,
      googleId: user.uid,
      isSignup,
    };

    const { data } = await api.googleLogin(authData);
    localStorage.setItem("Profile", JSON.stringify(data));
    dispatch({ type: "AUTH", data });

    dispatch(setcurrentuser(data));

    dispatch(fetchallusers());
    navigate("/");
  } catch (error) {
    console.error("Google Sign-In Error:", error.message);
    
    // Handle specific Firebase popup errors
    if (error.code === 'auth/cancelled-popup-request' || 
        error.code === 'auth/popup-closed-by-user') {
      // These errors happen when user closes popup or opens multiple popups
      // We don't need to show an alert for these cases
      return;
    }
    
    // Handle other Firebase auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/popup-blocked':
          alert("Popup was blocked by your browser. Please allow popups for this site.");
          break;
        case 'auth/network-request-failed':
          alert("Network error. Please check your connection and try again.");
          break;
        default:
          alert("Google sign-in failed: " + error.message);
          break;
      }
    } else {
      // Handle non-Firebase errors (API errors)
      alert("Google sign-in failed. Please try again.");
    }
  }
};

// Phone Authentication using Fast2SMS backend
export const phoneSignIn = (phone, navigate, isSignup = false) => async (dispatch) => {
    try {
        const { data } = await api.sendOtp({ phone });
        return data; // Return OTP data to show in UI
    } catch (error) {
        alert(error?.response?.data?.message || "Failed to send OTP");
        throw error;
    }
};

// Verify OTP and complete phone authentication
export const verifyOTP = (phone, otp, navigate, isSignup = false, name = null) => async (dispatch) => {
    try {
        const payload = { phone, otp };
        if (name) {
            payload.name = name;
        }
        
        const { data } = await api.verifyOtp(payload);
        
        // If new user needs to provide name, return the flag
        if (data.isNewUser) {
            return data;
        }
        
        // Complete login for existing user or new user with name
        localStorage.setItem("Profile", JSON.stringify(data));
        dispatch({ type: "AUTH", data });
        dispatch(setcurrentuser(data));
        dispatch(fetchallusers());
        navigate("/");
        
        return data;
    } catch (error) {
        alert(error?.response?.data?.message || "OTP verification failed");
        throw error;
    }
};
