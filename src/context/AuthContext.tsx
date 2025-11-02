/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useLoading } from "./LoadingContext";
import { FirebaseError } from "firebase/app";

interface AuthContextType {
  user: User | null;
  authUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { setLoading: setLoadingDisplay } = useLoading();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthUser(currentUser);

      if (currentUser) {
        const userDoc = await getDoc(
          doc(db, "authorizedUsers", currentUser.email!)
        );
        if (!userDoc.exists() || userDoc.data()?.is_deleted) {
          await signOut(auth);
          setUser(null);
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setLoadingDisplay(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userDoc = await getDoc(
        doc(db, "authorizedUsers", result.user.email!)
      );
      if (!userDoc.exists() || userDoc.data()?.is_deleted) {
        await signOut(auth);
        throw new Error("Unauthorized access");
      }
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        (error.code === "auth/popup-closed-by-user" ||
          error.code === "auth/cancelled-popup-request")
      ) {
        return;
      }
      throw error;
    } finally {
      setLoadingDisplay(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };
  return (
    <AuthContext.Provider
      value={{ user, authUser, loading, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
