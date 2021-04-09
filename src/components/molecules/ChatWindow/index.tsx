import React, { useEffect, useRef } from 'react';
import { TwitchMessage } from 'types/TwitchMessage';
import usePrevious from 'hooks/usePrevious';
import SimpleBar from 'simplebar-react';
import Message from './Message';

import 'simplebar/dist/simplebar.min.css';
import s from './ChatWindow.module.css';

export interface ChatWindowProps {
  messages: TwitchMessage[],
}

const ChatWindow = (props: ChatWindowProps) => {
  const { messages } = props;

  const previousMessageCount = usePrevious(messages.length);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (!chatWindowRef.current) return;
    
    chatWindowRef.current.scrollTo(0, 99999);
  }

  useEffect(() => {
    if (previousMessageCount !== messages.length) {
      scrollToBottom();
    }
  }, [previousMessageCount, messages]);

  return (
    <div className={s.chatWindow}>
      <SimpleBar
        autoHide
        style={{ height: '100%' }}
        scrollableNodeProps={{ ref: chatWindowRef }}
      >
        {messages.map((message) =>
          <Message message={message} key={message.id} />
        )}
      </SimpleBar>
    </div>
  );
}

export default ChatWindow;
