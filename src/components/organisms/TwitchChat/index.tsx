import React, { useEffect, useState } from 'react';
import { Client } from 'tmi.js';
import tmi from 'tmi.js';
import { TwitchMessage } from 'types/TwitchMessage';
import ChatWindow from 'components/molecules/ChatWindow';

let client: Client | null = null;

export interface TwitchChatProps {
  stream: string,
}

const TwitchChat = (props: TwitchChatProps) => {
  const { stream } = props;
  const [messages, setMessages] = useState<TwitchMessage[]>([]);
  
  useEffect(() => {
    client = new tmi.Client({
      connection: { reconnect: true },
      channels: [stream]
    });

    client.connect();
    
    client.on('message', (channel, tags, message, self) => {
      const newMessage: TwitchMessage = {
        id: tags.id,
        text: message,
        username: tags['display-name'],
        usernameColor: tags.color,
      };
      
      console.log("Message received", channel, tags, message)

      setMessages(m => [...m, newMessage]);
    })
    
    return () => {
      if (!client) return;
      client.disconnect();
    };
  }, [stream]);

  return (
    <div>
      <ChatWindow messages={messages} />
    </div>
  )
};

export default TwitchChat;
