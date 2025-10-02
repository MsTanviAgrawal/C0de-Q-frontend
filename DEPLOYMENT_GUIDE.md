# CodeQuest Frontend - Firebase Deployment Guide

## Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Backend deployed on Render

## Deployment Steps

### 1. Build the Project

```bash
cd "c:\Users\smart\OneDrive\Desktop\TAC\Code-Quest-Frontend"
npm run build
```

This will create a `dist` folder with production-ready files.

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase (if not already done)

```bash
firebase init hosting
```

Select:
- **Use existing project** or create new
- **Public directory:** `dist`
- **Single-page app:** `Yes`
- **Automatic builds with GitHub:** `No` (optional)

### 4. Deploy to Firebase

```bash
firebase deploy --only hosting
```

### 5. Your App is Live! 🎉

Firebase will provide you with a URL like:
```
https://your-project-id.web.app
```

## Update Backend CORS

After deployment, update backend CORS to allow your Firebase domain:

1. Go to Render Dashboard
2. Select your backend service
3. Add environment variable:
   - **Key:** `ALLOWED_ORIGIN`
   - **Value:** `https://your-project-id.web.app`

Or update `index.js` directly:

```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "https://codequest93.netlify.app",
  "https://your-project-id.web.app",  // Add your Firebase URL
  process.env.ALLOWED_ORIGIN
].filter(Boolean);
```

## Environment Variables

The app uses these environment variables (already configured):

**Development (.env.development):**
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Production (.env.production):**
```
VITE_API_URL=https://code-quest-backend-3y3q.onrender.com
VITE_SOCKET_URL=https://code-quest-backend-3y3q.onrender.com
```

## Quick Deploy Commands

```bash
# Build and deploy in one go
npm run build && firebase deploy --only hosting

# Deploy to specific project
firebase use your-project-id
firebase deploy --only hosting
```

## Troubleshooting

### Build Fails
- Check for TypeScript/ESLint errors
- Run `npm install` to ensure all dependencies are installed
- Clear cache: `rm -rf node_modules/.vite`

### CORS Errors After Deployment
- Verify backend CORS includes your Firebase domain
- Check browser console for exact origin being blocked
- Ensure `withCredentials: true` is set in API calls

### 404 Errors on Refresh
- Verify `firebase.json` has proper rewrites configuration
- Ensure `public` is set to `dist`

### API Not Connecting
- Check `.env.production` has correct backend URL
- Verify backend is running on Render
- Test backend directly: `https://code-quest-backend-3y3q.onrender.com`

## Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS configuration steps
4. Update backend CORS with your custom domain

## Continuous Deployment with GitHub Actions

The project has GitHub Actions configured. To enable:

1. Go to GitHub repository settings
2. Add Firebase secrets:
   - `FIREBASE_SERVICE_ACCOUNT_YOUR_PROJECT`
3. Push to main branch to auto-deploy

---

**Backend URL:** https://code-quest-backend-3y3q.onrender.com
**Frontend Build:** Vite + React
**Hosting:** Firebase Hosting
