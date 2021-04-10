import React from 'react';

import s from './Button.module.css';

export interface ButtonProps {
  children: React.ReactNode
  onClick: () => void,
}

const Button = (props: ButtonProps) => {
  const { children, onClick } = props;

  return (
    <button
      className={s.button}
      onClick={onClick}
    >
      { children }
    </button>
  )
};

export default Button;