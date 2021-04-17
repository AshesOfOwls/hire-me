import React, { useState, useEffect } from 'react';
import * as Comlink from 'comlink';
import { TwitchMessage } from 'types/TwitchMessage';
import ChatWindow from 'components/molecules/ChatWindow';
import GaugeChart from 'react-gauge-chart';
import { useDebounce } from 'use-lodash-debounce'
import Worker from 'workers/filterMessages';
import Filters from './Filters';

import s from './TwitchChat.module.css'
 
const CHUNK_SIZE = 50;
const MAX_MESSAGES = 150;

const worker = new Worker();
const filterMessages = async (messages: any, filters: any, channel: string, callback: any) => {
  if (!worker) return;
  worker.filter(messages, filters, channel, Comlink.proxy(callback));
};

export interface TwitchChatProps {
  stream: string,
  messages: TwitchMessage[],
  metadata?: any,
  onClone: (filters: any) => void,
  onDelete: () => void,
  preFilters?: any,
}

const TwitchChat = (props: TwitchChatProps) => {
  const { stream, messages, metadata, onClone, preFilters, onDelete } = props;

  const [filteredMessages, setFilteredMessages] = useState(messages);

  const [filters, setFilters] = useState(preFilters || {
    maxMessages: MAX_MESSAGES,
    chunkSize: CHUNK_SIZE,
    minEmoteThreshold: 0,
    maxEmoteThreshold: 10,
    filterText: '',
  });

  const debouncedFilters = useDebounce(filters, 100);

  // THERE IS A PROBLEM HERE (messages in deps)
  useEffect(() => {
    filterMessages(messages, debouncedFilters, stream, setFilteredMessages);
  }, [messages, debouncedFilters, stream])

  const { chunkSize } = filters;

  const PPM = metadata ? metadata.pogsPerMinute : 0;
  const PPMPercent = (PPM / 100) > 1 ? 1 : (PPM / 100);

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
      <div className={s.ppmWrapper}>
        <GaugeChart
          id="gauge-chart1"
          percent={PPMPercent}
          className={s.pogsPerMinute}
          formatTextValue={(value) => `${Math.round(PPM)} Pogs per minute`}
          style={{ width: '240px' }}
        />
      </div>
      <Filters
        totalMessages={messages.length}
        displayedMessages={filteredMessages.length}
        onChange={onChangeFilters}
        onClone={handleClone}
        onDelete={onDelete}
        {...filters}
      />
      <ChatWindow messages={filteredMessages} chunkSize={chunkSize} />
    </div>
  )
};

export default TwitchChat;
