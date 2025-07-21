import {
  getDatabase,
  ref,
  push,
  set,
  get,
  update,
  remove,
} from "firebase/database";
import { firebaseApp } from "./configs";

export const db = getDatabase(firebaseApp);

export const firebaseDb = {
  // Create new entry
  async create<T>(path: string, data: T): Promise<string> {
    try {
      const newRef = push(ref(db, path));
      await set(newRef, data);
      return newRef.key as string;
    } catch (error) {
      throw new Error(`Create failed: ${error}`);
    }
  },

  // Read single entry
  async read<T>(path: string): Promise<T | null> {
    try {
      const snapshot = await get(ref(db, path));
      return snapshot.val();
    } catch (error) {
      throw new Error(`Read failed: ${error}`);
    }
  },

  // Read all entries
  async readAll<T>(path: string): Promise<{ [key: string]: T }> {
    try {
      const snapshot = await get(ref(db, path));
      return snapshot.val() || {};
    } catch (error) {
      throw new Error(`Read all failed: ${error}`);
    }
  },

  // Update entry
  async update<T>(path: string, updates: Partial<T>): Promise<void> {
    try {
      const dbRef = ref(db, path);
      const snapshot = await get(dbRef);
      if (!snapshot.exists()) {
        throw new Error("Entry not found");
      }
      await update(dbRef, updates);
    } catch (error) {
      throw new Error(`Update failed: ${error}`);
    }
  },

  // Delete entry
  async delete(path: string): Promise<void> {
    try {
      const dbRef = ref(db, path);
      const snapshot = await get(dbRef);
      if (!snapshot.exists()) {
        throw new Error("Entry not found");
      }
      await remove(dbRef);
    } catch (error) {
      throw new Error(`Delete failed: ${error}`);
    }
  },
};
