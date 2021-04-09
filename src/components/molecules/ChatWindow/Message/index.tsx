import React from 'react';
import { TwitchMessage } from 'types/TwitchMessage';

import s from './Message.module.css';

export interface MessageProps {
  message: TwitchMessage
}

const Message = (props: MessageProps) => {
  const { message } = props;
  
  return (
    <div className={s.message} key={message.id}>
      <div className={s.username} style={{ color: message.usernameColor }}>
        { message.username }
      </div>
      <span className={s.separator}>: </span>
      <span>{ message.text }</span>
    </div>
  );
}

export default Message;
