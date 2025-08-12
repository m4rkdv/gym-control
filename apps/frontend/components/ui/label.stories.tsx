import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from '@/components/ui/input';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A form label component built on top of Radix UI Label primitive with custom styling and accessibility features.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the label'
    },
    children: {
      control: 'text',
      description: 'The content of the label'
    }
  }
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default label
export const Default: Story = {
  args: {
    children: "Email address"
  },
  parameters: {
    docs: {
      description: {
        story: 'Default Label component with standard styling.'
      }
    }
  }
};

// Label with form input
export const WithInput: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="email" {...args}>
        Email
      </Label>
      <Input id="email" type="email" placeholder="m@example.com" />
    </div>
  ),
  args: {
    children: "Email"
  },
  parameters: {
    docs: {
      description: {
        story: 'Label properly associated with an input field using htmlFor attribute.'
      }
    }
  }
};

// Required field indicator
export const RequiredField: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <Label htmlFor="password" {...args}>
        Password <span className="text-red-500">*</span>
      </Label>
      <Input id="password" type="password" />
    </div>
  ),
  args: {
    children: "Password"
  },
  parameters: {
    docs: {
      description: {
        story: 'Label with required field indicator (asterisk).'
      }
    }
  }
};

// Disabled state
export const Disabled: Story = {
  render: (args) => (
    <div className="grid gap-2 group" data-disabled="true">
      <Label htmlFor="disabled-input" {...args}>
        Disabled Field
      </Label>
      <Input id="disabled-input" type="text" disabled placeholder="This field is disabled" />
    </div>
  ),
  args: {
    children: "Disabled Field"
  },
  parameters: {
    docs: {
      description: {
        story: 'Label in disabled state with reduced opacity and pointer events disabled.'
      }
    }
  }
};

// Custom styled label
export const CustomStyled: Story = {
  args: {
    className: "text-lg font-bold text-blue-600",
    children: "Custom Styled Label"
  },
  parameters: {
    docs: {
      description: {
        story: 'Label with custom styling applied via className prop.'
      }
    }
  }
};