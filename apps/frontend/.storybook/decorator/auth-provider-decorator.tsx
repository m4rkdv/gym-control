import type { Decorator } from '@storybook/react';
import { AuthProvider } from '../../contexts/auth-context';

// Provides AuthContext for components using useAuth in stories
export const AuthProviderDecorator: Decorator = (Story) => {
  return (
    <AuthProvider>
      <Story />
    </AuthProvider>
  );
};
