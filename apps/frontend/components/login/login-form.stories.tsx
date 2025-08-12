import type { Meta, StoryObj } from '@storybook/react';
import { LoginForm } from './login-form';

const meta: Meta<typeof LoginForm> = {
  title: 'Components/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A complete login form component that combines logo, title, email input, and login button.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the form'
    },
    title: {
      control: 'text',
      description: 'The main title displayed in the form'
    },
    signUpText: {
      control: 'text',
      description: 'Text for the sign-up link'
    },
    signUpHref: {
      control: 'text',
      description: 'URL for the sign-up link'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default login form
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default LoginForm with standard GymControl branding and messaging.'
      }
    }
  }
};

// Member login
export const MemberLogin: Story = {
  args: {
    title: "Welcome back, Member",
    signUpText: "Join as new member",
    signUpHref: "/register"
  },
  parameters: {
    docs: {
      description: {
        story: 'Login form specifically designed for gym members.'
      }
    }
  }
};

// Staff login
export const StaffLogin: Story = {
  args: {
    title: "Staff Portal Access",
    signUpText: "Request access",
    signUpHref: "/request-access"
  },
  parameters: {
    docs: {
      description: {
        story: 'Login form for gym staff and trainers.'
      }
    }
  }
};

// Custom styled form
export const CustomStyled: Story = {
  args: {
    className: "max-w-md mx-auto p-6 bg-gray-50 rounded-lg border",
    title: "Sign in to continue",
    signUpText: "Create account",
    signUpHref: "/signup"
  },
  parameters: {
    docs: {
      description: {
        story: 'LoginForm with custom styling and container.'
      }
    }
  }
};

// Minimal version
export const Minimal: Story = {
  args: {
    title: "Login",
    signUpText: "Register",
    signUpHref: "/register"
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal version with short, concise text.'
      }
    }
  }
};