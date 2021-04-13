import React, { useEffect, useState } from 'react';
import * as Comlink from 'comlink';
import TwitchChat from 'components/organisms/TwitchChat';
import { TwitchMessage } from 'types/TwitchMessage';
import Button from 'components/atoms/Button';
import Worker from 'workers/twitchClient';

import s from './Splitter.module.css';

const worker = new Worker();

const init = async (callback: any) => {
  worker.init(Comlink.proxy(callback));
}
const subscribe = async (callback: any) => {
  worker.subscribe(Comlink.proxy(callback));
}

const Splitter = () => {
  const [messages, setMessages] = useState<TwitchMessage[]>([]);
  const [tabs, setTabs] = useState<string[]>(['xqcow']);
  const [streamInputValue, setStreamInputValue] = useState('');

  useEffect(() => {
    init(() => worker.join('xqcow'));
    subscribe((message: TwitchMessage) => setMessages(m => [...m, message]));
  });
  
  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    setStreamInputValue(e.currentTarget.value);
  };
  
  const addTab = (tab: string) => {
    worker.join(tab);
    setTabs([...tabs, tab]);
  }
  
  const onAddTab = () => {
    addTab(streamInputValue);
    setStreamInputValue('');
  }

  const onDuplicate = (tab: string) => {
    addTab(tab);
  };

  const onDeleteTab = (index: number) => {
    const newTabs = tabs.splice(index, 1);

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
          <div className={s.tab} key={`${tab}-${index}`}>
            <h3>{ tab } Twitch Chat:</h3>
            <Button onClick={() => onDuplicate(tab)}>New {tab} tab</Button>
            <Button onClick={() => onDeleteTab(index)} type="warning">Delete</Button>
            <TwitchChat stream={tab} messages={messages} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Splitter;
