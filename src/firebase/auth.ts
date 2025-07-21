import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { firebaseApp } from "./configs";

const auth = getAuth(firebaseApp);

export const firebaseAuth = {
  async signUp(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw new Error(`Signup failed: ${error}`);
    }
  },

  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw new Error(`Login failed: ${error}`);
    }
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(`Logout failed: ${error}`);
    }
  },
};
