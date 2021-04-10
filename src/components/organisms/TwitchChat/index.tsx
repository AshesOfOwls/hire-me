import React, { useEffect, useState } from 'react';
import tmi from 'tmi.js';
import { TwitchMessage } from 'types/TwitchMessage';
import emoteFetcher from 'utils/emoteFetcher';
import emoteText from 'utils/emoteText';
import ChatWindow from 'components/molecules/ChatWindow';
import useTwitchClient from 'hooks/useTwitchClient';
import { format, fromUnixTime } from 'date-fns';

const MESSAGE_THESHOLD = 50;
const MAX_MESSAGES = 3000;

// const client = new tmi.Client({
//   connection: { reconnect: true },
//   channels: []
// });

export interface TwitchChatProps {
  stream: string,
}

const TwitchChat = (props: TwitchChatProps) => {
  const { stream } = props;
  const [messages, setMessages] = useState<TwitchMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [channelEmotes, setChannelEmotes] = useState([]);
  const [hasFetchedEmotes, setHasFetchedEmotes] = useState(false);
  
  const client = useTwitchClient();
  const isClientReady = client.readyState() === 'OPEN';

  useEffect(() => {
    if (!isClientReady) return;

    client.join(stream);
    
    return () => {
      if (!client) return;
      client.part(stream);
      client.disconnect();
    };
  }, [stream, client, isClientReady]);

  useEffect(() => {
    if (!hasFetchedEmotes || !channelEmotes.length) return;

    client.on('message', (channel, tags, message, self) => {
      if (channel !== `#${stream}`) return;
      
      const unixTimestamp = parseInt(tags['tmi-sent-ts'] || '0') / 1000;
      const newMessage: TwitchMessage = {
        id: tags.id,
        text: message,
        emoteText: emoteText({ text: message, emoteList: channelEmotes }),
        username: tags['display-name'],
        usernameColor: tags.color,
        time: format(fromUnixTime(unixTimestamp), 'hh:mm'),
      };

      setMessageCount(m => m + 1);

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
      <div>Total messages: { messageCount }</div>
      <div>Current messages: { messages.length }</div>
      <ChatWindow messages={messages} />
    </div>
  )
};

export default TwitchChat;
