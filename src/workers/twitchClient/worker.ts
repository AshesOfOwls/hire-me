import * as Comlink from 'comlink';
import tmi from 'tmi.js';
import parseTwitchChat from 'utils/parseTwitchChat';
import { TwitchMessage } from 'types/TwitchMessage';
import { format, fromUnixTime } from 'date-fns';
import emoteFetcher from 'utils/emoteFetcher';
import { differenceInMinutes } from 'date-fns';

const client = new tmi.Client({
  connection: { reconnect: true },
  channels: []
});

export interface Metadata {
  channel: string,
  pogsInChannel: number,
};

const INITIAL_METADATA: Metadata = {
  channel: '',
  pogsInChannel: 0,
};

export interface TwitchClientWorker {
  messages: TwitchMessage[],
  channelEmotes: any[],
  init: (callback: any) => void,
  join: (channel: string) => void,
  fetchEmotes: (channel: string, callback: any) => void,
  getMessages: (callback: any) => void,
  subscribe: (channels: string[], callback: any) => void,
  subscribeToMetadata: (callback: any) => void,
  addMessage: (message: TwitchMessage, callback: any) => void,
  catalogMessageMetadata: (message: TwitchMessage) => void,
  destroy: () => void,
  channelMetadata: any,
  hasSubscribed: boolean,
  hasSubscribedToMetadata: boolean,
  joinTimes: any,
  metadataInterval: any,
}

const twitchClient: TwitchClientWorker = {
  messages: [],
  channelEmotes: [],
  hasSubscribed: false,
  hasSubscribedToMetadata: false,
  joinTimes: {},
  channelMetadata: {},
  metadataInterval: null,
  init(callback: any) {
    if (!['OPEN', 'CONNECTING'].includes(client.readyState())) {
      client.connect().then(callback);
    }
  },
  addMessage(message, callback) {
    this.catalogMessageMetadata(message);

    const newMessages = [...this.messages, message];
    this.messages = newMessages;

    callback(message);
  },
  subscribe(callback: any) {
    if (this.hasSubscribed) return;

    this.hasSubscribed = true;

    // client.on('action', (channel, userstate, message, self) => {
    //   console.log(message, userstate)
    // });

    client.on('message', (channel, tags, message) => {      
      const unixTimestamp = parseInt(tags['tmi-sent-ts'] || '0') / 1000;
      const { formatted, emoteCount, wordCount } = parseTwitchChat({ text: message, emoteList: this.channelEmotes });

      const newMessage: TwitchMessage = {
        id: tags.id,
        channel: channel.replace('#', ''),
        messageType: tags['message-type'],
        text: message,
        emoteText: formatted,
        username: tags['display-name'],
        usernameColor: tags.color,
        time: format(fromUnixTime(unixTimestamp), 'h:mm'),
        emotePercentage: emoteCount ? emoteCount / (emoteCount + wordCount) : 0,
      };

      this.addMessage(newMessage, callback);
    })
  },
  subscribeToMetadata(callback) {
    if (this.hasSubscribedToMetadata) return;

    this.hasSubscribedToMetadata = true;
    clearInterval(this.metadataInterval);

    this.metadataInterval = setInterval(() => {
      const metadata: any = {};
      
      Object.keys(this.joinTimes).forEach((channel) => {
        const minutesPassed = differenceInMinutes(new Date(), this.joinTimes[channel]);

        const channelMetadata = this.channelMetadata[channel] || {};
        const totalPogs = channelMetadata.pogsInChannel || 0;
        
        const pogsPerMinute = minutesPassed ? totalPogs / minutesPassed : totalPogs;

        metadata[channel] = {
          pogsPerMinute,
        };
      });

      callback(metadata);
    }, 1000)
  },
  catalogMessageMetadata(message) {
    const metadata = this.channelMetadata[message.channel] || INITIAL_METADATA;

    const pogsInMessage = (message.text.match(/pog/gi) || []).length || 0;

    this.channelMetadata[message.channel] = {
      ...metadata,
      pogsInChannel: (metadata.pogsInChannel || 0) + pogsInMessage,
    };
  },
  getMessages(callback) {
    callback(this.messages);
  },
  join(channel: string) {
    if (client.getChannels().includes(channel)) return;

    this.joinTimes[channel] = new Date();
    this.fetchEmotes(channel, () => client.join(channel));
  },
  async fetchEmotes(channel: string, callback) {
    await emoteFetcher(channel).then((emotes) => {
      this.channelEmotes = [...this.channelEmotes, ...emotes];
      callback();
    });
  },
  destroy() {
    this.messages = [];
    this.channelMetadata = {};
    client.disconnect();
    clearInterval(this.metadataInterval);

    close(); // eslint-disable-line
  }
};

Comlink.expose(twitchClient);