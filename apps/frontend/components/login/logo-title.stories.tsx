import type { Meta, StoryObj } from '@storybook/react';
import { LogoTitle } from './logo-title';


const meta = {
  title: 'Components/Login/LogoTitle',
  component: LogoTitle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A logo and title component with sign-up link, commonly used in authentication forms.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the component'
    },
    title: {
      control: 'text',
      description: 'The main title text to display'
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
} satisfies Meta<typeof LogoTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default login story
export const Default: Story = {
  args: {
    title: "Welcome back",
    signUpText: "Sign up",
    signUpHref: "/register"
  },
  parameters: {
    docs: {
      description: {
        story: 'Default LogoTitle component for login pages.'
      }
    }
  }
};

// Login variations
export const LoginPage: Story = {
  args: {
    title: "Sign in to your account",
    signUpText: "Create account",
    signUpHref: "/signup"
  },
  parameters: {
    docs: {
      description: {
        story: 'LogoTitle configured for a login page with professional messaging.'
      }
    }
  }
};

// Registration variations
export const RegistrationPage: Story = {
  args: {
    title: "Create your account",
    signUpText: "Sign in",
    signUpHref: "/login"
  },
  parameters: {
    docs: {
      description: {
        story: 'LogoTitle for registration pages with link back to login.'
      }
    }
  }
};

// Reset password variations
export const ForgotPassword: Story = {
  args: {
    title: "Reset your password",
    signUpText: "Back to login",
    signUpHref: "/login"
  },
  parameters: {
    docs: {
      description: {
        story: 'Password reset page configuration.'
      }
    }
  }
};

// Different tones and styles
export const Casual: Story = {
  args: {
    title: "Hey there! 👋",
    signUpText: "New here?",
    signUpHref: "/register"
  },
  parameters: {
    docs: {
      description: {
        story: 'Casual and friendly tone with emoji.'
      }
    }
  }
};

export const Professional: Story = {
  args: {
    title: "Member Portal Access",
    signUpText: "Request Access",
    signUpHref: "/request-access"
  },
  parameters: {
    docs: {
      description: {
        story: 'Professional tone for business applications.'
      }
    }
  }
};

export const Motivational: Story = {
  args: {
    title: "Start your fitness journey",
    signUpText: "Get started today",
    signUpHref: "/join"
  },
  parameters: {
    docs: {
      description: {
        story: 'Motivational messaging for fitness applications.'
      }
    }
  }
};

