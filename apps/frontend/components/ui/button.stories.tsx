import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Heart, Download, Plus, Settings, ChevronDown, Mail } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component built with Radix UI Slot and class-variance-authority for type-safe styling variants.',
      },
    },
  },  
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
  parameters: {
    docs: {
      description: {
        story: 'Destructive button variant for dangerous actions like delete or remove.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary button variant with subtle background for less prominent actions.',
      },
    },
  },
};

export const Link: Story = {
  args: {
    children: 'Link',
    variant: 'link',
  },
  parameters: {
    docs: {
      description: {
        story: 'Link button variant that appears as a text link with underline on hover.',
      },
    },
  },
};
