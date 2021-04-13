import React from 'react';
import { TwitchMessage } from 'types/TwitchMessage';
import Message from '../Message';

export interface MessageGroupProps {
  messages: TwitchMessage[],
}

const areEqual = (prevProps: any, nextProps: any) => (
  prevProps.messages.length === nextProps.messages.length
);

const MessageGroup = React.memo((props: MessageGroupProps) => {
  const { messages } = props;

  return (
    <>
      {messages.map((message) => <Message message={message} key={message.id} />)}
    </>
  );
}, areEqual);

export default MessageGroup;
