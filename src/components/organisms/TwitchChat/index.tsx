import React, { useEffect, useState } from 'react';
import tmi from 'tmi.js';
import { TwitchMessage } from 'types/TwitchMessage';
import ChatWindow from 'components/molecules/ChatWindow';

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
        id: tags.id,
        text: message,
        username: tags['display-name'],
        usernameColor: tags.color,
      };
      
      console.log("Message received", channel, tags, message)

      setMessages(m => [...m, newMessage]);
    })
    
    return () => {
      console.log("DISCONNECT")
      client.disconnect();
    };
  }, []);

  return (
    <div>
      <ChatWindow messages={messages} />
    </div>
  )
};

export default TwitchChat;
