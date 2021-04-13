import React from 'react';
import { TwitchMessage } from 'types/TwitchMessage';
import Emote from 'components/atoms/Emote';

import s from './Message.module.css';

export interface MessageProps {
  message: TwitchMessage
}

const Message = React.memo((props: MessageProps) => {
  const { message } = props;

  const text = message.emoteText.map((fragment: any, index: number) => {
    if (fragment.type === 'emote') {
      return <Emote url={fragment.url} key={fragment.code + index} />
    }

    return fragment.text;
  });

  return (
    <div className={s.message}>
      <span className={s.timestamp}>{ message.time }</span>
      <div className={s.username} style={{ color: message.usernameColor }}>
        { message.username }
      </div>
      <span className={s.separator}>: </span>
      <span>{ text }</span>
    </div>
  );
});

export default Message;
