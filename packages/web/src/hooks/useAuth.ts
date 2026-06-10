import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (store.isAuthenticated && !store.user) {
      store.fetchUser();
    }
  }, [store.isAuthenticated]);

  return store;
}
