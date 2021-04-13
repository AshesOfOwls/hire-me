import React, { useState } from 'react';
import { TwitchMessage } from 'types/TwitchMessage';
import ChatWindow from 'components/molecules/ChatWindow';

const MESSAGE_THESHOLD = 50;
const MAX_MESSAGES = 1000;

export interface TwitchChatProps {
  stream: string,
  messages: TwitchMessage[],
}

const TwitchChat = (props: TwitchChatProps) => {
  const { stream, messages } = props;
  const [messageCount, setMessageCount] = useState(0);
  const [minEmoteThreshold, setMinEmoteThreshold] = useState(0);
  const [maxEmoteThreshold, setMaxEmoteThreshold] = useState(10);
  const [filterText, setFilterText] = useState<string>('');

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

  // MOVE TO WORKER!!!!
  // MOVE TO WORKER!!!!
  // MOVE TO WORKER!!!!
  // MOVE TO WORKER!!!!
  const filteredMessages = messages.filter((m) => {
    if (m.channel !== stream) return false;

    const emoteThreshold = m.emotePercentage * 10;
    const meetsEmoteThreshold = emoteThreshold <= maxEmoteThreshold && emoteThreshold >= minEmoteThreshold;
    let meetsFilterThreshold = true;
    try {
      meetsFilterThreshold = Boolean(m.text.match(filterText));
    } catch {
      meetsFilterThreshold = true;
    }

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
