import React from 'react';
import { Story, Meta } from '@storybook/react';

import Button, { ButtonProps } from './';

export default {
  title: 'Example/Button',
  component: Button,
  args: {
    children: 'Button text',
  },
} as Meta;

const Template: Story<ButtonProps> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
