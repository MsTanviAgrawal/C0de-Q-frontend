# Stack Overflow Clone Backend – OTP Email Setup

## How to Run the Backend for OTP Email Verification

**You must run the backend from this folder (`Stack-Overflow/server`) for the OTP/email feature to work!**

---

## 1. Install dependencies
```sh
npm install
```

## 2. Configure Gmail credentials
Create a `.env` file in this folder with these contents:
```
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```
- Use a [Gmail App Password](https://support.google.com/accounts/answer/185833?hl=en) (not your normal password).

## 3. Start the backend server
```sh
npm run dev
```
Or:
```sh
npm start
```
- You should see: `OTP server running on port 5000`

## 4. Troubleshooting
- **404 errors** on `/user/send-email-otp` mean you are running the server from the wrong directory or on the wrong port.
- Only run the backend from this folder (`Stack-Overflow/server`).
- Make sure your `.env` is filled in and correct.

## 5. API Endpoints
- `POST /user/send-email-otp` – send OTP to email
- `POST /user/verify-email-otp` – verify OTP

## 6. Frontend
- The frontend is already configured to use these endpoints at `http://localhost:5000`.

---

If you follow these steps, the OTP email and video upload feature will work as designed!
