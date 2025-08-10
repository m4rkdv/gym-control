import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Mail } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
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

export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <label className="text-sm font-medium">Valid Input</label>
        <Input 
          type="email" 
          placeholder="valid@example.com" 
          defaultValue="user@example.com"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Invalid Input</label>
        <Input 
          type="email" 
          placeholder="Enter valid email" 
          defaultValue="invalid-email"
          aria-invalid="true"
        />
        <p className="text-sm text-destructive">Please enter a valid email address</p>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Required Input</label>
        <Input 
          type="text" 
          placeholder="This field is required" 
          required
        />
        <p className="text-sm text-muted-foreground">* Required field</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input validation states including invalid styling with aria-invalid.',
      },
    },
  },
};

export const DisabledAndReadonly: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <label className="text-sm font-medium">Normal Input</label>
        <Input type="text" placeholder="Enter text..." />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Disabled Input</label>
        <Input 
          type="text" 
          placeholder="Disabled input" 
          disabled 
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Disabled with Value</label>
        <Input 
          type="text" 
          defaultValue="This input is disabled" 
          disabled 
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Read-only Input</label>
        <Input 
          type="text" 
          defaultValue="This input is read-only" 
          readOnly 
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input states including disabled and read-only.',
      },
    },
  },
};

export const DateTimeInputs: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <label className="text-sm font-medium">Date Input</label>
        <Input type="date" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Date and time input types with native browser controls.',
      },
    },
  },
};

export const FocusStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <label className="text-sm font-medium">Normal Focus</label>
        <Input type="text" placeholder="Click to focus" />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Email with Focus</label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Invalid with Focus</label>
        <Input 
          type="email" 
          placeholder="invalid email" 
          defaultValue="invalid"
          aria-invalid="true"
        />
      </div>
      
      <p className="text-sm text-muted-foreground">
        Tab through these inputs to see focus ring styling.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Focus states with custom ring styling for accessibility.',
      },
    },
  },
};