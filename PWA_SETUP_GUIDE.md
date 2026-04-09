# HealthTracker PWA - Installation & Usage Guide

Your HealthTracker web app is now a **Progressive Web App (PWA)** - meaning it works like a native app on your laptop, phone, or tablet! 

## ✨ What is a PWA?

A Progressive Web App is a web application that feels and works like a native app:
- **Installable** - Add to your home screen or install on desktop
- **Works offline** - App functionality available without internet
- **Full screen** - No browser address bar or tabs
- **App-like** - Behaves like a native application
- **Automatic updates** - Gets latest version when online

## 📥 How to Install

### On Google Chrome (Windows/Mac/Linux):
1. Open **HealthTracker** in Chrome: `http://localhost:3000`
2. Click the **"Install"** button in the address bar (⬇️ icon on the right)
3. Click **"Install"** in the popup
4. App will open in its own window - ready to use!

*Alternative:* Right-click the page → "Create shortcut..." → Check "Open as window"

### On Safari (Mac/iPad/iPhone):
1. Open HealthTracker in Safari: `http://localhost:3000`
2. Tap the **Share** button (↑ icon)
3. Select **"Add to Home Screen"**
4. Choose name (leave as "HealthTracker") and tap **"Add"**
5. App will appear on your home screen!

### On Android (Mobile):
1. Open HealthTracker in Chrome: `http://localhost:3000`
2. Tap the 3-dot menu (⋮) → **"Add to Home Screen"**
3. Tap **"Add"**
4. App will appear on your home screen!

### On Windows (Desktop):
1. Open HealthTracker in Chrome: `http://localhost:3000`
2. Click the **"Install"** button in the address bar
3. Click **"Install"** in the popup
4. App launches in its own window without browser UI

## 🎯 Key Features

- **Standalone Window** - Opens like a regular app, not in browser
- **Offline Support** - View cached data even without internet
- **Fast Loading** - Service worker caches pages for instant access
- **Home Screen Icon** - App icon with red heart design
- **Auto-Updates** - Service worker checks for updates when online

## 🌐 How It Works

### Service Worker
A service worker runs in the background to:
- Cache pages and assets on first visit
- Serve cached content when offline
- Sync data with the server when back online
- Manage the offline experience

### Manifest
The `manifest.json` file tells your device:
- App name: "HealthTracker"
- Display mode: Standalone (full-screen, no browser UI)
- Colors: Theme color is red (#dc2626)
- Icons: Heart emoji-based app icons
- Start page: Launches at `/` (dashboard)

## 📱 Using the App

Once installed, the HealthTracker app works exactly like before:

1. **Login/Register** - Create new account or sign in
2. **Dashboard** - View health stats and quick actions
3. **Track Metrics** - Log meals, water, weight, screen time
4. **Profile** - Update your health profile
5. **Logout** - Securely sign out

## 🔄 Offline Behavior

With the service worker active:
- **Online**: Always fetches latest data from server
- **Offline**: Shows last cached data
- **Reconnect**: Automatically syncs changes when back online

## 🚀 Running Locally

The app requires:
1. **Backend**: `npm start` in `/backend` (port 5000)
2. **Frontend**: `npm run dev` in `/web` (port 3000)

Both should be running for full functionality.

## 📝 For Developers

### Files Added:
- `public/manifest.json` - PWA metadata
- `public/sw.js` - Service worker for offline support
- `public/icon-192.svg` - App icon (192x192)
- `public/icon-512.svg` - App icon (512x512)
- `app/pwa-installer.tsx` - Service worker registration
- `app/layout.tsx` - Updated with PWA metadata

### Customization:
To change app details, edit:
- **App Name**: `manifest.json` → `name` & `short_name`
- **Theme Color**: `manifest.json` → `theme_color` & `app/layout.tsx`
- **App Icon**: Replace SVG files in `public/` with your images
- **Caching Strategy**: Edit `public/sw.js`

## 🐛 Troubleshooting

**App won't install?**
- Ensure `manifest.json` is accessible
- Check browser console for errors (F12 → Console)
- Try incognito/private window

**Offline not working?**
- Service worker registration failed (check console)
- Clear app data and reinstall
- View Service Workers: chrome://serviceworker-internals/

**Stuck on old version?**
- Service worker caches files
- Clear app storage or wait for auto-update
- Or: DevTools → Storage → Clear all

## ✅ You're All Set!

Your HealthTracker is now ready to use as a full-featured app on any device. Install it and start tracking your health! 💪
