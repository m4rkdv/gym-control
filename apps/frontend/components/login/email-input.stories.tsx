import type { Meta, StoryObj } from '@storybook/react';
import { EmailInput } from './email-input';


const meta = {
  title: 'Components/Login/EmailInput',
  component: EmailInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A complete email input component with label and input field, designed for forms and authentication flows.'
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
      description: 'The label text for the email input'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown in the input field'
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required or optional'
    }
  }
} satisfies Meta<typeof EmailInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default email input
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default EmailInput component with standard email label and placeholder.'
      }
    }
  }
};

// Work email variant
export const WorkEmail: Story = {
  args: {
    label: "Work Email",
    placeholder: "your.name@company.com"
  },
  parameters: {
    docs: {
      description: {
        story: 'EmailInput configured for work email collection.'
      }
    }
  }
};

// Optional field
export const Optional: Story = {
  args: {
    label: "Email (Optional)",
    required: false,
    placeholder: "Enter your email if you want updates"
  },
  parameters: {
    docs: {
      description: {
        story: 'EmailInput that is not required, useful for optional contact information.'
      }
    }
  }
};

// Contact form variant
export const ContactForm: Story = {
  args: {
    label: "Your Email Address",
    placeholder: "we'll never share your email",
    className: "w-80"
  },
  parameters: {
    docs: {
      description: {
        story: 'EmailInput configured for contact forms with privacy assurance.'
      }
    }
  }
};

// Custom styled
export const CustomStyled: Story = {
  args: {
    className: "w-96 p-4 bg-gray-50 rounded-lg border",
    label: "Email",
    placeholder: "Enter your email address"
  },
  parameters: {
    docs: {
      description: {
        story: 'EmailInput with custom styling and container width.'
      }
    }
  }
};