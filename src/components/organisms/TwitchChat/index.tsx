import React, { useEffect, useState } from 'react';
import { TwitchMessage } from 'types/TwitchMessage';
import tmi from 'tmi.js';

const client = new tmi.Client({
	connection: { reconnect: true },
	channels: [ 'ashesofowls' ]
});

client.connect();

const TwitchChat = () => {
  const [messages, setMessages] = useState<TwitchMessage[]>([]);
  
  useEffect(() => {
    client.on('message', (channel, tags, message, self) => {
      const newMessage: TwitchMessage = {
        text: message,
        username: tags['display-name'],
      };

      setMessages([...messages, newMessage]);
    })
    
    return () => {
      client.disconnect();
    };
  });

  return (
    <div>
      { messages.map((message: TwitchMessage) => (
        <div>
          { message.username }
          { message.text }
        </div>
      )) }
    </div>
  )
};

export default TwitchChat;
