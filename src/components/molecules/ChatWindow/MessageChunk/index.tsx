import React from 'react';
import { TwitchMessage } from 'types/TwitchMessage';
import Message from '../Message';

export interface MessageGroupProps {
  messages: TwitchMessage[],
}

const areEqual = (prevProps: any, nextProps: any) => (
  prevProps.messages.map((m: any) => m.id).join() === nextProps.messages.map((m: any) => m.id).join()
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
