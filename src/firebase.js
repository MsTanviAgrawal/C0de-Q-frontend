import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDOcFB-oXGSkkdn9l9vgn3Q-MTs0tlYgOw",
  authDomain: "stackoverflowclone-7764.firebaseapp.com",
  projectId: "stackoverflowclone-7764",
  storageBucket: "stackoverflowclone-7764.appspot.com",
  messagingSenderId: "272731119234",
  appId: "1:272731119234:web:c9a41c2c4431d2a5e0de9b",
  measurementId: "G-7XGQKVESVM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber };