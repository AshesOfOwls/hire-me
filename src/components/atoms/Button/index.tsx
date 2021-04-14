import React from 'react';
import classnames from 'classnames';

import s from './Button.module.css';

export interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  type?: undefined | 'warning' | 'wrapper'
}

const Button = (props: ButtonProps) => {
  const { children, onClick, type = '' } = props;

  return (
    <button
      className={classnames(s.button, s[type])}
      onClick={onClick}
    >
      { children }
    </button>
  );
};

export default Button;