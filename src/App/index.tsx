import React from 'react';
import TwitchChat from 'components/organisms/TwitchChat';

import s from './App.module.css';

function App() {
  const stream = 'xqcow';

  return (
    <div className={s.app}>
      <h3>{ stream } Twitch Chat:</h3>
      <TwitchChat stream={stream} />
    </div>
  );
}

export default App;
