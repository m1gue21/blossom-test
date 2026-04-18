import { useState, useEffect } from 'react';

const USER_ID_KEY = 'rm_user_id';

function generateUserId(): string {
  return `user_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`;
}

export function useUser(): string {
  const [userId, setUserId] = useState<string>(() => {
    const stored = localStorage.getItem(USER_ID_KEY);
    if (stored) return stored;
    const newId = generateUserId();
    localStorage.setItem(USER_ID_KEY, newId);
    return newId;
  });

  useEffect(() => {
    if (!localStorage.getItem(USER_ID_KEY)) {
      const id = generateUserId();
      localStorage.setItem(USER_ID_KEY, id);
      setUserId(id);
    }
  }, []);

  return userId;
}
