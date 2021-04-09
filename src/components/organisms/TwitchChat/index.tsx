import React, { useEffect, useState } from 'react';
import tmi from 'tmi.js';
import { TwitchMessage } from 'types/TwitchMessage';
import emoteFetcher from 'utils/emoteFetcher';
import emoteText from 'utils/emoteText';
import ChatWindow from 'components/molecules/ChatWindow';

const MESSAGE_THESHOLD = 50;
const MAX_MESSAGES = 200;

const client = new tmi.Client({
  connection: { reconnect: true },
  channels: []
});

export interface TwitchChatProps {
  stream: string,
}

const TwitchChat = (props: TwitchChatProps) => {
  const { stream } = props;
  const [messages, setMessages] = useState<TwitchMessage[]>([]);
  const [channelEmotes, setChannelEmotes] = useState([]);
  const [hasFetchedEmotes, setHasFetchedEmotes] = useState(false);
  
  useEffect(() => {
    client.connect().then(() => {
      client.join(stream);
    });
    
    return () => {
      if (!client) return;
      client.part(stream);
      client.disconnect();
    };
  }, [stream]);

  useEffect(() => {
    if (!hasFetchedEmotes || !channelEmotes.length) return;

    client.on('message', (channel, tags, message, self) => {
      const newMessage: TwitchMessage = {
        id: tags.id,
        text: message,
        emoteText: emoteText({ text: message, emoteList: channelEmotes }),
        username: tags['display-name'],
        usernameColor: tags.color,
      };

      setMessages(m => {
        let oldMessages = m;
        
        if (m.length > MAX_MESSAGES + MESSAGE_THESHOLD) {
          oldMessages = oldMessages.splice(0, MESSAGE_THESHOLD);
        }
        
        return [...oldMessages, newMessage]
      });
    });
  }, [channelEmotes, hasFetchedEmotes])

  useEffect(() => {
    if (hasFetchedEmotes) return;

    emoteFetcher(stream).then((emotes) => {
      setHasFetchedEmotes(true);
      setChannelEmotes(emotes);
    });
  }, [stream, hasFetchedEmotes])

  return (
    <div>
      Message count: { messages.length }
      <ChatWindow messages={messages} />
    </div>
  )
};

export default TwitchChat;
