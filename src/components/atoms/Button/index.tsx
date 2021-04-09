import React from 'react';

import s from './Button.module.css';

export interface ButtonProps {
  children: React.ReactNode
}

const Button = (props: ButtonProps) => {
  const { children } = props;

  return (
    <div className={s.button}>
      { children }
    </div>
  )
};

export default Button;