import {
  AppRouterContext,
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';

const mockRouter: AppRouterInstance = {
  push: (href: string) => {
    console.log(`Router push: ${href}`);
    return Promise.resolve(true);
  },
  replace: (href: string) => {
    console.log(`Router replace: ${href}`);
    return Promise.resolve(true);
  },
  prefetch: (href: string) => {
    console.log(`Router prefetch: ${href}`);
    return Promise.resolve();
  },
  back: () => {
    console.log('Router back');
  },
  forward: () => {
    console.log('Router forward');
  },
  refresh: () => {
    console.log('Router refresh');
    return Promise.resolve();
  },
};

export const AppRouterDecorator = (Story: any) => (
  <AppRouterContext.Provider value={mockRouter}>
    <Story />
  </AppRouterContext.Provider>
);