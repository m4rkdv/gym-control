import type { Preview } from '@storybook/nextjs-vite';
import '../app/globals.css';
import { AppRouterDecorator } from './decorator/next-router-decorator';
import { MockFetchDecorator } from './decorator/fetch-decorator';
import { AuthProviderDecorator } from './decorator/auth-provider-decorator';


const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    AppRouterDecorator,
    MockFetchDecorator,
    AuthProviderDecorator,
  ],
};

export default preview;