import React, { useState } from 'react';
import TwitchChat from 'components/organisms/TwitchChat';
import Button from 'components/atoms/Button';

import s from './Splitter.module.css';

const Splitter = () => {
  const [tabs, setTabs] = useState<string[]>(['ludwig']);
  const [streamInputValue, setStreamInputValue] = useState('');
  
  const onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    setStreamInputValue(e.currentTarget.value);
  };
  
  const onAddTab = () => {
    setTabs([...tabs, streamInputValue]);
    setStreamInputValue('');
  }
  
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
            <TwitchChat stream={tab} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Splitter;
