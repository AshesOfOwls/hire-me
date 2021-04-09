import React from 'react';
import { TwitchMessage } from 'types/TwitchMessage';

import s from './ChatWindow.module.css';

export interface ChatWindowProps {
  messages: TwitchMessage[],
}

const ChatWindow = (props: ChatWindowProps) => {
  const { messages } = props;
  
  return (
    <div className={s.chatWindow}>
      { messages.map((message) => (
        <div className={s.message} key={message.id}>
          <div className={s.username} style={{ color: message.usernameColor }}>
            { message.username }
          </div>
          <span className={s.separator}>: </span>
          <span>{ message.text }</span>
        </div>
      ))}
    </div>
  );
}

export default ChatWindow;
