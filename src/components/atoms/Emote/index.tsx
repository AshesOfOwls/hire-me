import React from 'react';

import s from './Emote.module.css';

export interface Props {
  src: string
}

const Emote = (props: Props) => {
  const { src } = props;

  return (
    <div className={s.emote}>
      <img src={src} alt={src} />
    </div>
  );
};

export default Emote;
