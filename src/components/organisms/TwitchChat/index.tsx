import React, { useEffect, useState } from 'react';
import { TwitchMessage } from 'types/TwitchMessage';
import emoteFetcher from 'utils/emoteFetcher';
import emoteText from 'utils/emoteText';
import ChatWindow from 'components/molecules/ChatWindow';
import useTwitchClient from 'hooks/useTwitchClient';
import { format, fromUnixTime } from 'date-fns';

const MESSAGE_THESHOLD = 50;
const MAX_MESSAGES = 1000;

export interface TwitchChatProps {
  stream: string,
}

const TwitchChat = (props: TwitchChatProps) => {
  const { stream } = props;
  const [messages, setMessages] = useState<TwitchMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [emoteThreshold, setEmoteThreshold] = useState(1);
  const [channelEmotes, setChannelEmotes] = useState([]);
  const [hasFetchedEmotes, setHasFetchedEmotes] = useState(false);

  const { client, isClientReady } = useTwitchClient();

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
      const { formatted, emoteCount, wordCount } = emoteText({ text: message, emoteList: channelEmotes });

      const newMessage: TwitchMessage = {
        id: tags.id,
        text: message,
        emoteText: formatted,
        username: tags['display-name'],
        usernameColor: tags.color,
        time: format(fromUnixTime(unixTimestamp), 'hh:mm'),
        emotePercentage: emoteCount ? (wordCount + emoteCount) / emoteCount : 0,
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
  }, [client, stream, channelEmotes, hasFetchedEmotes])

  useEffect(() => {
    if (hasFetchedEmotes) return;

    emoteFetcher(stream).then((emotes) => {
      setHasFetchedEmotes(true);
      setChannelEmotes(emotes);
    });
  }, [stream, hasFetchedEmotes])

  const onChangeThreshold = (e: React.FormEvent<HTMLInputElement>) => {
    setEmoteThreshold(parseInt(e.currentTarget.value) / 10);
  };

  const filteredMessages = messages.filter((m) => m.emotePercentage <= emoteThreshold);

  return (
    <div>
      <div>Total messages: { messageCount }</div>
      <div>Current messages: { messages.length }</div>
      <div>
        Emote threshold:
        <input type="range" value={emoteThreshold * 10} min={0} max={10} onChange={onChangeThreshold} step={1} />
      </div>
      <ChatWindow messages={filteredMessages} />
    </div>
  )
};

export default TwitchChat;
