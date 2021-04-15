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
      return <Emote url={fragment.url} key={`${fragment.code}${index}`} />
    }

    if (fragment.type === 'url') {
      return (
        <a href={fragment.text} key={`${fragment.text}${index}`} target="_blank" rel="noreferrer">
          { fragment.text }
        </a>
      );
    }

    return <span key={`${fragment.text}${index}`}>{ fragment.text }</span>;
  });

  const isAction = message.messageType === 'action';

  return (
    <div className={s.message}>
      <span className={s.timestamp}>{ message.time }</span>
      <div className={s.username} style={{ color: message.usernameColor }}>
        { message.username }
      </div>
      <span className={s.separator}>{!isAction && ':'} </span>
      <span style={{ color: isAction ? message.usernameColor : 'inherit' }}>
        { text }
      </span>
    </div>
  );
});

export default Message;
