import type { Meta, StoryObj } from '@storybook/react';
import { LoginButton } from './login-button';


const meta = {
  title: 'Components/Login/LoginButton',
  component: LoginButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A login button component with an icon and full-width styling, designed for authentication forms.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the button'
    },
    children: {
      control: 'text',
      description: 'The text content of the button'
    }
  }
} satisfies Meta<typeof LoginButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default login button
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default LoginButton with "Login" text and login icon.'
      }
    }
  }
};

// Sign in variant
export const SignIn: Story = {
  args: {
    children: "Sign In"
  },
  parameters: {
    docs: {
      description: {
        story: 'LoginButton with "Sign In" text for alternative messaging.'
      }
    }
  }
};

// Access account variant
export const AccessAccount: Story = {
  args: {
    children: "Access Account"
  },
  parameters: {
    docs: {
      description: {
        story: 'LoginButton with "Access Account" text for more formal tone.'
      }
    }
  }
};

// Custom styled button
export const CustomStyled: Story = {
  args: {
    className: "bg-green-600 hover:bg-green-700 max-w-xs",
    children: "Enter Gym"
  },
  parameters: {
    docs: {
      description: {
        story: 'LoginButton with custom styling and gym-specific text.'
      }
    }
  }
};

// Different width
export const FixedWidth: Story = {
  args: {
    className: "w-48",
    children: "Login"
  },
  parameters: {
    docs: {
      description: {
        story: 'LoginButton with fixed width instead of full width.'
      }
    }
  }
};