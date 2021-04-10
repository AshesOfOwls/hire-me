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
  const [minEmoteThreshold, setMinEmoteThreshold] = useState(0);
  const [maxEmoteThreshold, setMaxEmoteThreshold] = useState(10);
  const [channelEmotes, setChannelEmotes] = useState([]);
  const [hasFetchedEmotes, setHasFetchedEmotes] = useState(false);
  const [filterText, setFilterText] = useState<string>('');

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
  }, [stream, hasFetchedEmotes]);

  const onChangeMinThreshold = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseInt(e.currentTarget.value);

    if (val >= maxEmoteThreshold) return;
    
    setMinEmoteThreshold(parseInt(e.currentTarget.value));
  };

  const onChangeMaxThreshold = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseInt(e.currentTarget.value);

    if (val <= minEmoteThreshold) return;

    setMaxEmoteThreshold(parseInt(e.currentTarget.value));
  };

  const onChangeFilterText = (e: React.FormEvent<HTMLInputElement>) => {
    setFilterText(e.currentTarget.value);
  }

  const filteredMessages = messages.filter((m) => {
    const emoteThreshold = m.emotePercentage * 10;
    const meetsEmoteThreshold = emoteThreshold <= maxEmoteThreshold && emoteThreshold >= minEmoteThreshold;
    const meetsFilterThreshold = m.text.match(filterText);

    return meetsEmoteThreshold && meetsFilterThreshold;
  });

  return (
    <div>
      <div>Total messages: { messageCount }</div>
      <div>Current messages: { messages.length }</div>
      <div>
        Emote threshold:
        <div>
          Min: <input type="range" value={minEmoteThreshold} min={0} max={10} onChange={onChangeMinThreshold} step={1} />
        </div>
        <div>
          Max: <input type="range" value={maxEmoteThreshold} min={0} max={10} onChange={onChangeMaxThreshold} step={1} />
        </div>
      </div>
      <div>
        Chat Filter:
        <input value={filterText} onChange={onChangeFilterText} />
      </div>
      <ChatWindow messages={filteredMessages} />
    </div>
  )
};

export default TwitchChat;
