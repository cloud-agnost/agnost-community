// Button.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from './Button';
import { CheckCircle } from '@phosphor-icons/react';

const meta: Meta<typeof Button> = {
	/* 👇 The title prop is optional.
	 * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
	 * to learn how to generate automatic titles
	 */
	title: 'Button',
	component: Button,
	argTypes: {
		disabled: {
			control: 'boolean',
		},
	},
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
	args: {
		variant: 'primary',
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const Secondary: Story = {
	args: {
		variant: 'secondary',
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const Destructive: Story = {
	args: {
		variant: 'destructive',
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const Text: Story = {
	args: {
		variant: 'text',
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const Link: Story = {
	args: {
		variant: 'link',
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const Disabled: Story = {
	args: {
		disabled: true,
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const Loading: Story = {
	args: {
		loading: true,
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const AsChild: Story = {
	args: {
		asChild: true,
	},
	render: (args) => (
		<Button {...args}>
			<span>Child</span>
		</Button>
	),
};
export const Label: Story = {
	args: {
		label: 'Label',
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const Small: Story = {
	args: {
		size: 'sm',
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const Medium: Story = {
	args: {
		size: 'md',
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const Full: Story = {
	args: {
		size: 'full',
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const IconOnly: Story = {
	args: {
		children: <CheckCircle size={20} />,
	},
	render: (args) => <Button {...args}>{args.label}</Button>,
};
export const IconAndLabel: Story = {
	args: {
		children: (
			<>
				<CheckCircle size={20} />
				<span className='sr-only'>Icon Only</span>
			</>
		),
	},
	render: (args) => <Button {...args} aria-label='Icon Only' />,
};
