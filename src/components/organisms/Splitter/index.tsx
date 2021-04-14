import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Comlink from 'comlink';
import TwitchChat from 'components/organisms/TwitchChat';
import { TwitchMessage } from 'types/TwitchMessage';
import Button from 'components/atoms/Button';
import Worker from 'workers/twitchClient';

import s from './Splitter.module.css';

export interface SplitterTab {
  id: string,
  channel: string,
}

const INITIAL_TAB: SplitterTab = {
  id: uuidv4(),
  channel: 'xqcow',
}

const worker = new Worker();

const init = async (callback: any) => {
  worker.init(Comlink.proxy(callback));
}
const subscribe = async (callback: any) => {
  worker.subscribe(Comlink.proxy(callback));
}
const subscribeToMetadata = async (callback: any) => {
  worker.subscribeToMetadata(Comlink.proxy(callback));
}

const Splitter = () => {
  const [messages, setMessages] = useState<TwitchMessage[]>([]);
  const [tabs, setTabs] = useState<SplitterTab[]>([INITIAL_TAB]);
  const [metadata, setMetadata]: any = useState({});
  const [streamInputValue, setStreamInputValue] = useState('');

  useEffect(() => {
    init(() => {
      // @ts-ignore
      const uniqueTabs = [...new Set(tabs.map((tab) => tab.channel))];
      uniqueTabs.forEach((tab) => worker.join(tab));
    });
    subscribe((message: TwitchMessage) => setMessages(m => [...m, message]));
    subscribeToMetadata((metadata: any) => setMetadata(metadata));
  });
  
  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    setStreamInputValue(e.currentTarget.value);
  };

  const addTab = (channel: string) => {
    const newTab: SplitterTab = {
      id: uuidv4(),
      channel,
    }

    worker.join(channel);
    setTabs([...tabs, newTab]);
  };

  const onAddTab = () => {
    addTab(streamInputValue);
    setStreamInputValue('');
  };

  const onDuplicate = (tab: string) => {
    addTab(tab);
  };

  const onDeleteTab = (index: number) => {
    const newTabs = [...tabs]
    newTabs.splice(index, 1);
    setTabs(newTabs);
  };

  return (
    <div className={s.splitter}>
      <div className={s.options}>
        <input value={streamInputValue} onChange={onInputChange} />
        <Button onClick={onAddTab}>Add</Button>
      </div>

      <div className={s.tabs}>
        {tabs.map((tab, index) => 
          <div className={s.tab} key={tab.id}>
            <h3>{ tab.channel } Twitch Chat:</h3>
            <Button onClick={() => onDuplicate(tab.channel)}>New {tab.channel} tab</Button>
            <Button onClick={() => onDeleteTab(index)} type="warning">Delete</Button>
            <TwitchChat stream={tab.channel} messages={messages} metadata={metadata[tab.channel]} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Splitter;
