import * as Comlink from 'comlink';
import tmi from 'tmi.js';
import emoteText from 'utils/emoteText';
import { TwitchMessage } from 'types/TwitchMessage';
import { format, fromUnixTime } from 'date-fns';
import emoteFetcher from 'utils/emoteFetcher';

const client = new tmi.Client({
  connection: { reconnect: true },
  channels: []
});

export interface TwitchClientWorker {
  messages: TwitchMessage[],
  channelEmotes: any[],
  init: (callback: any) => void,
  join: (channel: string) => void,
  fetchEmotes: (channel: string, callback: any) => void,
  getMessages: (callback: any) => void,
  subscribe: (channels: string[], callback: any) => void,
  hasSubscribed: boolean,
}

const twitchClient: TwitchClientWorker = {
  messages: [],
  channelEmotes: [],
  hasSubscribed: false,
  init(callback: any) {
    if (!['OPEN', 'CONNECTING'].includes(client.readyState())) {
      client.connect().then(callback);
    }
  },
  subscribe(callback: any) {
    if (this.hasSubscribed) return;

    this.hasSubscribed = true;
    client.on('message', (channel, tags, message) => {
      const unixTimestamp = parseInt(tags['tmi-sent-ts'] || '0') / 1000;
      const { formatted, emoteCount, wordCount } = emoteText({ text: message, emoteList: this.channelEmotes });

      const newMessage: TwitchMessage = {
        id: tags.id,
        channel: channel.replace('#', ''),
        messageType: tags['message-type'],
        text: message,
        emoteText: formatted,
        username: tags['display-name'],
        usernameColor: tags.color,
        time: format(fromUnixTime(unixTimestamp), 'hh:mm'),
        emotePercentage: emoteCount ? emoteCount / (emoteCount + wordCount) : 0,
      };

      const newMessages = [...this.messages, newMessage];
      this.messages = newMessages;
      callback(newMessage);
    })
  },
  getMessages(callback) {
    callback(this.messages);
  },
  join(channel: string) {
    if (client.getChannels().includes(channel)) return;

    this.fetchEmotes(channel, () => client.join(channel));
  },
  async fetchEmotes(channel: string, callback) {
    await emoteFetcher(channel).then((emotes) => {
      this.channelEmotes = [...this.channelEmotes, ...emotes];
      callback();
    });
  }
};

Comlink.expose(twitchClient);