// Hook for access to UserContext

// From: https://github.com/iamshaunjp/Complete-React-Native-Tutorial/blob/lesson-29/hooks/useUser.js

import { useContext } from 'react';
import { UserContext } from '@ctx/UserContext';

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
