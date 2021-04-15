import * as Comlink from 'comlink';

export interface FilterMessagesWorker {
  filter: (messages: any, filters: any, channel: string, callback: any) => void,
}

const filterMessages: FilterMessagesWorker = {
  filter(messages, filters, channel, callback) {
    const { maxMessages, chunkSize, maxEmoteThreshold, minEmoteThreshold, filterText } = filters;

    let filteredMessages = [...messages];
    const extraMessages = filteredMessages.length % chunkSize;
    filteredMessages.splice(0, filteredMessages.length - maxMessages - extraMessages);
    
    filteredMessages = filteredMessages.filter((m) => {
      if (m.channel !== channel.toLowerCase()) return false;
      
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

    callback(filteredMessages);
  }
};

Comlink.expose(filterMessages);