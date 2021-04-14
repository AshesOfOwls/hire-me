import React, { useEffect, useRef, useState } from 'react';
import { TwitchMessage } from 'types/TwitchMessage';
import classnames from 'classnames';
import usePrevious from 'hooks/usePrevious';
import SimpleBar from 'simplebar-react';
import MessageChunk from './MessageChunk';

import 'simplebar/dist/simplebar.min.css';
import s from './ChatWindow.module.css';

const PAUSE_THESHOLD = 50;

export interface ChatWindowProps {
  messages: TwitchMessage[],
  chunkSize: number,
}

const ChatWindow = (props: ChatWindowProps) => {
  const { messages, chunkSize } = props;

  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const previousMessages = usePrevious(messages.map((m: any) => m.id).join());
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (!chatWindowRef.current) return;
    
    chatWindowRef.current.scrollTop = 9999999;
  }

  const onScroll = () => {
    const windowRef = chatWindowRef.current;

    if (!windowRef) return;

    const scrollTop = windowRef.scrollTop;
    const chatHeight = windowRef.offsetHeight;
    const scrollHeight = windowRef.scrollHeight;

    if (isHovered) {
      const shouldPause = scrollHeight - chatHeight >= scrollTop + PAUSE_THESHOLD;

      setIsPaused(shouldPause)
    }
  };

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (isPaused) return;
    
    if (previousMessages !== messages.map((m: any) => m.id).join()) {
      scrollToBottom();
    }
  }, [isPaused, previousMessages, messages]);

  useEffect(() => {
    const windowRef = chatWindowRef.current;

    if (windowRef) {
      windowRef.addEventListener('scroll', onScroll)
      windowRef.addEventListener('mouseenter', onMouseEnter)
      windowRef.addEventListener('mouseleave', onMouseLeave)
    }
    
    return () => {
      if (!windowRef) return;
      windowRef.removeEventListener('mouseenter', onMouseEnter)
      windowRef.removeEventListener('mouseleave', onMouseLeave)
      windowRef.removeEventListener('scroll', onScroll);
    }
  })

  const splitMessages = messages.reduce((acc: any, cur: any, index) => {
    const group = Math.floor(index / chunkSize);
    (acc[group] = acc[group] || []).push(cur);

    return acc;
  }, [])

  const unPause = () => {
    scrollToBottom();
    setIsPaused(false);
  }

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
      <div
        className={classnames(s.pauseMarker, { [s.isVisible]: isPaused })}
        onClick={unPause}
      >
        Chat paused due to scroll.
      </div>
    </div>
  );
};

export default ChatWindow;
