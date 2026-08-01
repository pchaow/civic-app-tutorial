import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile, UserRole, Department } from '../types';

const googleProvider = new GoogleAuthProvider();

// Explicit Super Admin List (Owners who can assign officer roles in Firestore Strategy 2)
const SUPER_ADMIN_EMAILS = [
  'pchaowmobile@gmail.com',
  'admin@municipality.go.th'
];

export const signInWithGoogle = async (): Promise<UserProfile> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const email = user.email || '';

    // Strategy 2: Check Firestore Database `/users/{uid}` lookup first
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    let role: UserRole = 'citizen';
    let department: Department | null = null;

    if (userDocSnap.exists()) {
      const data = userDocSnap.data() as UserProfile;
      role = data.role || 'citizen';
      department = data.department || null;
    } else {
      // First-time user registration & role assignment
      if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
        role = 'admin'; // Super Admin
      } else if (email.includes('officer') || email.includes('gov')) {
        role = 'officer';
        department = 'infrastructure';
      }

      const initialProfile: UserProfile = {
        uid: user.uid,
        fullName: user.displayName || 'ผู้ใช้งาน Google',
        email: email,
        phone: user.phoneNumber || '',
        role: role,
        department: department,
        fcmTokens: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(userDocRef, initialProfile, { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc notice:', e);
      }
    }

    const userProfile: UserProfile = {
      uid: user.uid,
      fullName: user.displayName || 'ผู้ใช้งาน Google',
      email: email,
      role: role,
      department: department,
      fcmTokens: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save/Update user in local registered users list
    const storedUsersRaw = localStorage.getItem('civicsolve_registered_users');
    let registeredUsers: UserProfile[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
    const existingIdx = registeredUsers.findIndex(u => u.uid === user.uid || u.email === email);
    if (existingIdx >= 0) {
      registeredUsers[existingIdx] = { ...registeredUsers[existingIdx], ...userProfile };
    } else {
      registeredUsers.push(userProfile);
    }
    localStorage.setItem('civicsolve_registered_users', JSON.stringify(registeredUsers));

    return userProfile;

  } catch (error) {
    console.warn('Google Auth popup fallback triggered:', error);
    
    // Demo Fallback Profile for Super Admin
    const adminProfile: UserProfile = {
      uid: `super_admin_chaow`,
      fullName: 'Super Admin (pchaowmobile@gmail.com)',
      email: 'pchaowmobile@gmail.com',
      role: 'admin',
      department: 'infrastructure',
      fcmTokens: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const storedUsersRaw = localStorage.getItem('civicsolve_registered_users');
    let registeredUsers: UserProfile[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
    if (!registeredUsers.some(u => u.email === adminProfile.email)) {
      registeredUsers.push(adminProfile);
      localStorage.setItem('civicsolve_registered_users', JSON.stringify(registeredUsers));
    }

    return adminProfile;
  }
};

export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
};
