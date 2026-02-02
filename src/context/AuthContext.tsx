// src/context/AuthContext.tsx

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserData {
  email: string;
  createdAt: Date;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAllUsers: () => Promise<UserData[]>;
  deleteUserAccount: (userId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_EMAIL = 'kawap07@gmail.com';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => {
    return userData?.isAdmin ?? false;
  }, [userData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            email: data.email,
            createdAt: data.createdAt?.toDate() || new Date(),
            isAdmin: data.isAdmin || false,
          });
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const isAdminUser = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email.toLowerCase(),
      createdAt: serverTimestamp(),
      isAdmin: isAdminUser,
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const getAllUsers = useCallback(async (): Promise<UserData[]> => {
    if (!isAdmin) {
      throw new Error('Unauthorized');
    }

    const usersQuery = query(collection(db, 'users'));
    const snapshot = await getDocs(usersQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        email: data.email,
        createdAt: data.createdAt?.toDate() || new Date(),
        isAdmin: data.isAdmin || false,
        uid: doc.id,
      } as UserData & { uid: string };
    });
  }, [isAdmin]);

  const deleteUserAccount = useCallback(async (userId: string) => {
    if (!isAdmin) {
      throw new Error('Unauthorized');
    }

    // Delete user's todos
    const todosRef = collection(db, 'users', userId, 'todos');
    const todosSnapshot = await getDocs(todosRef);
    const deletePromises = todosSnapshot.docs.map((todoDoc) =>
      deleteDoc(doc(db, 'users', userId, 'todos', todoDoc.id))
    );
    await Promise.all(deletePromises);

    // Delete user document
    await deleteDoc(doc(db, 'users', userId));

    // Note: To fully delete the Firebase Auth user, you would need
    // Firebase Admin SDK on a backend. For now, we just delete the data.
  }, [isAdmin]);

  const value = useMemo(
    () => ({
      user,
      userData,
      loading,
      isAdmin,
      login,
      register,
      logout,
      getAllUsers,
      deleteUserAccount,
    }),
    [user, userData, loading, isAdmin, login, register, logout, getAllUsers, deleteUserAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
