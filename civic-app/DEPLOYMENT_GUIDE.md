# Firebase Project Setup & Deployment Guide for CivicSolve

Follow these steps to deploy **CivicSolve** to your live Google Firebase project.

---

## Step 1: Initialize Firebase Project
1. Log in to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create Project** and name it `civicsolve-municipality` (or use an existing project).
3. Under **Build**, enable:
   * **Authentication**: Enable Email/Password and Google OAuth.
   * **Firestore Database**: Create in Production Mode.
   * **Storage**: Enable Cloud Storage.
   * **Hosting**: Enable Web Hosting.

---

## Step 2: Configure Environment Variables
Create a file named `.env.local` inside `civic-app/` with your live Firebase app keys:

```env
VITE_FIREBASE_API_KEY="AIzaSyYourActualLiveFirebaseApiKeyHere"
VITE_FIREBASE_AUTH_DOMAIN="civicsolve-municipality.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="civicsolve-municipality"
VITE_FIREBASE_STORAGE_BUCKET="civicsolve-municipality.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
```

---

## Step 3: Deploy using Firebase CLI

1. **Install Firebase CLI globally** (if not installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Log in to Firebase**:
   ```bash
   firebase login
   ```

3. **Link your project ID**:
   ```bash
   firebase use --add civicsolve-municipality
   ```

4. **Build & Deploy Everything**:
   ```bash
   npm run build
   firebase deploy
   ```

---

## Files Created & Configured:
- [`firebase.json`](file:///home/chaow/testagy/civic-app/firebase.json): SPA rewrite rules & static caching headers.
- [`firestore.rules`](file:///home/chaow/testagy/civic-app/firestore.rules): Role-based access control for Citizens, Officers, and Admins.
- [`storage.rules`](file:///home/chaow/testagy/civic-app/storage.rules): Security rules restricting media uploads to image files under 10MB.
- [`firebase-messaging-sw.js`](file:///home/chaow/testagy/civic-app/public/firebase-messaging-sw.js): Web Push notification background service worker.
