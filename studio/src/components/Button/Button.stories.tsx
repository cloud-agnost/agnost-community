// Button.stories.ts|tsx

import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from './Button';

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
