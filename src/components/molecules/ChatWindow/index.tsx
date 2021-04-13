import React, { useEffect, useRef } from 'react';
import { TwitchMessage } from 'types/TwitchMessage';
import usePrevious from 'hooks/usePrevious';
import SimpleBar from 'simplebar-react';
import MessageChunk from './MessageChunk';

import 'simplebar/dist/simplebar.min.css';
import s from './ChatWindow.module.css';

const MESSAGE_CHUNK_SIZE = 50;

export interface ChatWindowProps {
  messages: TwitchMessage[],
}

const ChatWindow = (props: ChatWindowProps) => {
  const { messages } = props;

  const previousMessageCount = usePrevious(messages.length);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (!chatWindowRef.current) return;
    
    chatWindowRef.current.scrollTop = 9999999;
  }

  useEffect(() => {
    if (previousMessageCount !== messages.length) {
      scrollToBottom();
    }
  }, [previousMessageCount, messages]);

  const splitMessages = messages.reduce((acc: any, cur: any, index) => {
    const group = Math.floor(index / MESSAGE_CHUNK_SIZE);
    (acc[group] = acc[group] || []).push(cur);

    return acc;
  }, [])

  return (
    <div className={s.chatWindow}>
      <SimpleBar
        autoHide
        style={{ height: '100%' }}
        scrollableNodeProps={{ ref: chatWindowRef }}
      >
        {splitMessages.map((messages: any, index: number) => (
          <MessageChunk messages={messages} key={`chunk${index}`} />
        ))}
      </SimpleBar>
    </div>
  );
};

export default ChatWindow;
