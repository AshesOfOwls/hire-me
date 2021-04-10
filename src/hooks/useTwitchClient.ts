import tmi from 'tmi.js';

const client = new tmi.Client({
  connection: { reconnect: true },
  channels: []
});

const useTwitchClient = () => {
  if (!['OPEN', 'CONNECTING'].includes(client.readyState())) {
    client.connect();
  }

  const isClientReady = client.readyState() === 'OPEN';
  
  return { client, isClientReady };
};

export default useTwitchClient;