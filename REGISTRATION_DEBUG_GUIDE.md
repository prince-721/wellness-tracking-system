# Registration Debug Guide

## Problem
User cannot register in the Expo mobile app with Gmail. Error: "registration failed something went wrong"

## Fixed Issues
✅ Enhanced backend logging in `/api/auth/register` endpoint
✅ Increased timeout from 10s to 30s in axios
✅ Improved error message extraction with network error detection
✅ Added detailed logging to AuthContext
✅ Added detailed logging to RegisterScreen

## Current Status
- **Backend:** ✅ Running on port 5000, MongoDB connected
- **Backend Registration Endpoint:** ✅ TESTED AND WORKING (returns 201 with token + user)
- **Backend Login Endpoint:** ✅ TESTED AND WORKING (returns token + user)
- **Frontend API Config:** ✅ Base URL = 10.0.2.2:5000/api (Android emulator)

## What Changed

### 1. Backend `/src/routes/auth.js`
Added detailed console logging:
```javascript
console.log('📝 Registration attempt:', { name, email });
console.log('✅ User created successfully:', user._id);
console.error('❌ Registration error:', err.message);
```

### 2. Frontend `/src/services/api.js`
- Increased timeout: `10000` → `30000` ms
- Added error catching in async interceptor
- Added API error logging to response interceptor

```javascript
console.error('API Error:', err.message, err.response?.status, err.response?.data);
```

### 3. Frontend `/src/screens/RegisterScreen.js`
Added comprehensive error categorization:
- Network timeouts (ECONNABORTED)
- DNS failures (ENOTFOUND)  
- Server validation errors
- Server message extraction
- 500+ status code handling

### 4. Frontend `/src/context/AuthContext.js`
Added detailed logging:
```javascript
console.log('📤 Calling registration API with:', { name, email });
console.log('📥 Registration response:', res.data);
console.error('Registration API call failed:', err);
```

### 5. New Testing Utility: `/src/utils/networkTest.js`
Tests connectivity to health endpoints and register endpoint

## Debugging Steps

### Step 1: Restart Backend
```bash
cd c:\Users\princ\healthtracker\backend
npm start
```

Watch for:
- `✅ MongoDB connected`
- `🚀 Server running on port 5000`

### Step 2: Start Expo Frontend
```bash
cd c:\Users\princ\healthtracker\frontend
npm start
Press 'a' for Android or 'i' for iOS
```

### Step 3: Open Chrome DevTools for Expo
Go to the Expo app, press Ctrl+Shift+I to open remote debugger. You'll see all console logs from the app.

### Step 4: Test Registration (Try Multiple Times with Different Emails)
Use format: testuser2024_[number]@gmail.com

Possible Results:

#### ✅ SUCCESS (User Created)
Alert shows: "Registration successful" or navigates to ProfileSetup
Console shows: `✅ Registration successful!`

#### ❌ FAILURE - Check Error Message and Console
Watch the Chrome DevTools console log for one of these:

**Request Timeout Error**
```
❌ Registration Error Details: {
  code: "ECONNABORTED",
  message: "timeout of 30000ms exceeded"
}
```
**Solution:** Backend process stopped. Restart: `npm start` in backend

**Network Unreachable**
```
❌ Registration Error Details: {
  code: "ENOTFOUND",
  message: "Cannot reach server"
}
```
**Solution:** BASE_URL is wrong. Check `src/services/api.js`:
- Android Emulator: `http://10.0.2.2:5000/api`
- iOS Simulator: `http://localhost:5000/api`
- Physical Device: `http://<YOUR_MACHINE_IP>:5000/api`

**Validation Error (400)**
```
❌ Registration Error Details: {
  status: 400,
  responseData: {
    errors: [{ msg: "Valid email required" }]
  }
}
```
**Solution:** Check form validation in RegisterScreen or backend validation in auth.js

**Email Already Registered (400)**
```
❌ Registration Error Details: {
  status: 400,
  responseData: { message: "Email already registered" }
}
```
**Solution:** Use a different email address. Each email can only register once.

**Server Error (500+)**
```
❌ Registration Error Details: {
  status: 500,
  responseData: { message: "[actual error from backend]" }
}
```
**Solution:** Check backend terminal logs. Common causes:
- MongoDB connection lost: `mongoose.connect()` failed
- Password hashing error in User pre-save hook
- Unknown error, check err.message in console

### Step 5: Check Backend Logs
When you attempt registration, the backend terminal should show:

```
📨 POST /api/auth/register { name: 'Test', email: 'test@gmail.com', password: '...' }
📝 Registration attempt: { name: 'Test', email: 'test@gmail.com' }
❌ Email already exists: test@gmail.com
        (or)
✅ User created successfully: ObjectId(...)
```

## Isolated Test (No Mobile App)
If you want to test registration without the Expo app:

```powershell
$body = @{
  name="Test User"
  email="newtest@gmail.com"
  password="password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/register `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

Should return:
```json
{
  "success": true,
  "token": "eyJ...",
  "user": { "id": "...", "name": "Test User", "email": "newtest@gmail.com", ... }
}
```

If this works but the app doesn't, the issue is in frontend/Expo setup.

## Information to Collect if Still Failing

Run this in your Expo Chrome DevTools console:
```javascript
import { logNetworkDiagnostics } from '../utils/networkTest';
await logNetworkDiagnostics();
```

This will output:
- Base URL being used
- Health endpoint status
- Register endpoint status
- Full error details if endpoints fail

## Summary
The code now has comprehensive logging at every step:
1. Frontend logs when sending data (RegisterScreen)
2. Frontend logs axios errors with full details
3. AuthContext logs the API response
4. Backend logs when request arrives
5. Backend logs user creation success/failure
6. Error messages now show actual backend errors instead of generic messages

**Next Action:** Share the exact error message you see and the backend/console logs, and we can pinpoint the issue!
