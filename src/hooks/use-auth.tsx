
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Volunteer } from '@/lib/data';
import { getVolunteerById, createVolunteer } from '@/lib/firestore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  volunteer: Volunteer | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  googleSignIn: () => Promise<any>;
  signup: (email: string, pass: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshVolunteer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshVolunteer = useCallback(async () => {
    if (user) {
      const volunteerData = await getVolunteerById(user.uid);
      if (volunteerData) {
        setVolunteer(volunteerData);
      }
    }
  }, [user]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const volunteerData = await getVolunteerById(user.uid);
        if (volunteerData) {
          setVolunteer(volunteerData);
        } else {
            // This case can happen if user exists in Auth but not in Firestore,
            // for instance if the DB record wasn't created properly on sign up.
            // The googleSignIn and signup functions handle creation, but this is a fallback.
            console.warn("No volunteer data found for UID:", user.uid, "Creating a new record as a fallback.");
            const newVolunteer: Volunteer = {
                id: user.uid,
                name: user.displayName || 'New Google User',
                email: user.email!,
                avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
                hours: 0,
                isAdmin: false,
                privacySettings: { showPhone: true, showSocial: true },
                currentClockEventId: null,
            };
            await createVolunteer(newVolunteer);
            setVolunteer(newVolunteer);
        }

      } else {
        setUser(null);
        setVolunteer(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if volunteer already exists in Firestore
    const existingVolunteer = await getVolunteerById(user.uid);
    if (!existingVolunteer) {
        // If not, create a new volunteer profile
        const newVolunteer: Volunteer = {
            id: user.uid,
            name: user.displayName || 'New Volunteer',
            email: user.email!,
            avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
            hours: 0,
            isAdmin: false,
            privacySettings: { showPhone: true, showSocial: true },
            currentClockEventId: null,
        };
        await createVolunteer(newVolunteer);
        setVolunteer(newVolunteer);
    } else {
        setVolunteer(existingVolunteer);
    }
    
    setUser(user);
    return userCredential;
  };

  const signup = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    
    const newVolunteer: Volunteer = {
        id: userCredential.user.uid,
        name: name,
        email: email,
        avatar: `https://i.pravatar.cc/150?u=${userCredential.user.uid}`,
        hours: 0,
        isAdmin: false,
        privacySettings: { showPhone: true, showSocial: true },
        currentClockEventId: null,
    };

    await createVolunteer(newVolunteer);
    setUser(userCredential.user);
    setVolunteer(newVolunteer);

    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const value = {
    user,
    volunteer,
    loading,
    login,
    googleSignIn,
    signup,
    logout,
    refreshVolunteer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
