import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Mail } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with built-in styling for focus states, validation, and file uploads. Supports all native HTML input attributes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'search', 'date'],
      description: 'The type of input',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the input is required',
    },
    readOnly: {
      control: { type: 'boolean' },
      description: 'Whether the input is read-only',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    type: 'text',
  },
};

export const TextInput: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter your name',
  },
  parameters: {
    docs: {
      description: {
        story: 'Standard text input for general text entry.',
      },
    },
  },
};

export const EmailInput: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
  parameters: {
    docs: {
      description: {
        story: 'Email input with built-in validation for email format.',
      },
    },
  },
};

export const PasswordInput: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password',
  },
  parameters: {
    docs: {
      description: {
        story: 'Password input that masks the entered text for security.',
      },
    },
  },
};

export const NumberInput: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number',
  },
  parameters: {
    docs: {
      description: {
        story: 'Number input that only accepts numeric values.',
      },
    },
  },
};

export const SearchInput: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Search input optimized for search functionality.',
      },
    },
  },
};

export const TelInput: Story = {
  args: {
    type: 'tel',
    placeholder: '+54 (9) 123-4567',
  },
  parameters: {
    docs: {
      description: {
        story: 'Telephone input for phone numbers with regional formatting.',
      },
    },
  },
};