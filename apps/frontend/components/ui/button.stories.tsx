import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Heart, Settings} from 'lucide-react';

const meta: Meta<typeof Button> = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A versatile button component built with Radix UI Slot and class-variance-authority for type-safe styling variants.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['default', 'destructive', 'secondary', 'link'],
            description: 'The visual style variant of the button',
        },
        size: {
            control: { type: 'select' },
            options: ['default', 'sm', 'lg', 'icon'],
            description: 'The size of the button',
        },
        disabled: {
            control: { type: 'boolean' },
            description: 'Whether the button is disabled',
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

export const AllSizes: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
                <Heart />
            </Button>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Different button sizes including an icon-only variant.',
            },
        },
    },
};

// Showcase whit all variants
export const VariantsShowcase: Story = {
    render: () => (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Button Variants</h3>
                <p className="text-sm text-muted-foreground">
                    Different visual styles for various use cases and contexts.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-3">
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium">Default</h4>
                        <p className="text-xs text-muted-foreground">Primary actions</p>
                    </div>
                    <Button variant="default">Button</Button>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium">Destructive</h4>
                        <p className="text-xs text-muted-foreground">Dangerous actions</p>
                    </div>
                    <Button variant="destructive">Destructive</Button>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium">Secondary</h4>
                        <p className="text-xs text-muted-foreground">Less prominent actions</p>
                    </div>
                    <Button variant="secondary">Secondary</Button>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium">Link</h4>
                        <p className="text-xs text-muted-foreground">Text link appearance</p>
                    </div>
                    <Button variant="link">Link</Button>
                </div>
            </div>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Comprehensive showcase of all button variants with descriptions and usage examples.',
            },
        },
        layout: 'fullscreen',
    },
};

// Settings Button
export const SettingsButton: Story = {
  args: {
    children: (
      <>
        Settings
        <Settings />
      </>
    ),
    variant: 'default',
    size: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button for settingswith icon positioned on the right side of the text.',
      },
    },
  },
};

// Login Button
export const LoginButton: Story = {
  args: {
    children:"Login",
    variant: 'default',
    size: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button for login with login text.',
      },
    },
  },
};
