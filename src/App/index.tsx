import React from 'react';
import TwitchChat from 'components/organisms/TwitchChat';

import s from './App.module.css';

function App() {
  return (
    <div className={s.app}>
      <h3>Chat:</h3>
      <TwitchChat />
    </div>
  );
}

export default App;
