import React, { useState, useRef } from 'react';
import { TwitchMessage } from 'types/TwitchMessage';
import ChatWindow from 'components/molecules/ChatWindow';
import GaugeChart from 'react-gauge-chart';
import Filters from './Filters';

import s from './TwitchChat.module.css'
 
const CHUNK_SIZE = 50;
const MAX_MESSAGES = 1000;

export interface TwitchChatProps {
  stream: string,
  messages: TwitchMessage[],
  metadata?: any,
  onClone: (filters: any) => void,
  preFilters?: any,
}

const TwitchChat = (props: TwitchChatProps) => {
  const { stream, messages, metadata, onClone, preFilters } = props;

  const [filters, setFilters] = useState(preFilters || {
    maxMessages: MAX_MESSAGES,
    chunkSize: CHUNK_SIZE,
    minEmoteThreshold: 0,
    maxEmoteThreshold: 10,
    filterText: '',
  });

  // MOVE TO WORKER!!!!
  const { maxMessages, chunkSize, maxEmoteThreshold, minEmoteThreshold, filterText } = filters;
  
  let filteredMessages = messages.filter((m) => {
    if (m.channel !== stream.toLowerCase()) return false;
    
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

  const extraMessages = filteredMessages.length % chunkSize;
  filteredMessages.splice(0, filteredMessages.length - maxMessages - extraMessages);

  const PPM = metadata ? metadata.pogsPerMinute : 0;

  const onChangeFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClone = (filters: any) => {
    onClone({
      channel: stream,
      filters,
    });
  };

  return (
    <div>
      <div>Displayed/Total messages: { filteredMessages.length } / { messages.length }</div>
      <div>
        POGS Per Minute (PPM): { PPM }
        <GaugeChart
          id="gauge-chart1"
          percent={PPM / 100}
          className={s.pogsPerMinute}
          formatTextValue={(value) => `${value} Pogs per minute`}
          style={{ width: '130px' }}
        />
      </div>
      <Filters
        onChange={onChangeFilters}
        onClone={handleClone}
        {...filters}
      />
      <ChatWindow messages={filteredMessages} chunkSize={chunkSize} />
    </div>
  )
};

export default TwitchChat;
