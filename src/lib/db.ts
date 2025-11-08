// IndexedDB utilities for chat history and reminders

const DB_NAME = 'CareCompanionDB';
const DB_VERSION = 1;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  status: 'upcoming' | 'done';
  createdAt: number;
}

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains('messages')) {
        database.createObjectStore('messages', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('reminders')) {
        database.createObjectStore('reminders', { keyPath: 'id' });
      }
    };
  });
};

// Chat Messages
export const saveMessage = async (message: ChatMessage): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.add(message);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getMessages = async (): Promise<ChatMessage[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['messages'], 'readonly');
    const store = transaction.objectStore('messages');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const clearMessages = async (): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Reminders
export const saveReminder = async (reminder: Reminder): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['reminders'], 'readwrite');
    const store = transaction.objectStore('reminders');
    const request = store.add(reminder);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getReminders = async (): Promise<Reminder[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['reminders'], 'readonly');
    const store = transaction.objectStore('reminders');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const updateReminder = async (id: string, updates: Partial<Reminder>): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['reminders'], 'readwrite');
    const store = transaction.objectStore('reminders');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const reminder = getRequest.result;
      if (reminder) {
        const updated = { ...reminder, ...updates };
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject(new Error('Reminder not found'));
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
};

export const deleteReminder = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['reminders'], 'readwrite');
    const store = transaction.objectStore('reminders');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
