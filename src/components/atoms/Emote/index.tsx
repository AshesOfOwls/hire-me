import React from 'react';

import s from './Emote.module.css';

export interface Props {
  url: string
}

const Emote = React.memo((props: Props) => {
  const { url } = props;

  return (
    <div className={s.emote}>
      <img src={url} alt={url} />
    </div>
  );
});

export default Emote;
