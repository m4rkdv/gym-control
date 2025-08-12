import type { Meta, StoryObj } from '@storybook/react';

import { useState } from 'react';
import { PasswordInput } from './password-input';

const meta = {
  title: 'Components/Login/PasswordInput',
  component: PasswordInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A password input component with show/hide toggle functionality, built with label and eye icon controls.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the container'
    },
    label: {
      control: 'text',
      description: 'The label text for the password input'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown in the input field'
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required or optional'
    },
    value: {
      control: 'text',
      description: 'Controlled value of the input'
    }
  }
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default password input
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default PasswordInput with standard label and placeholder, includes show/hide toggle.'
      }
    }
  }
};

// Confirm password variant
export const ConfirmPassword: Story = {
  args: {
    label: "Confirm Password",
    placeholder: "Re-enter your password"
  },
  parameters: {
    docs: {
      description: {
        story: 'PasswordInput configured for password confirmation fields.'
      }
    }
  }
};

// Optional password field
export const Optional: Story = {
  args: {
    label: "Password (Optional)",
    placeholder: "Leave blank to keep current password",
    required: false
  },
  parameters: {
    docs: {
      description: {
        story: 'PasswordInput that is not required, useful for optional password updates.'
      }
    }
  }
};

// Controlled component with state
export const Controlled: Story = {
  render: (args) => {
    const [password, setPassword] = useState('');
    
    return (
      <div className="space-y-4">
        <PasswordInput
          {...args}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-sm text-gray-600">
          Current value: {password}
        </p>
      </div>
    );
  },
  args: {
    label: "Controlled Password",
    placeholder: "Type to see controlled state"
  },
  parameters: {
    docs: {
      description: {
        story: 'PasswordInput as a controlled component with external state management.'
      }
    }
  }
};