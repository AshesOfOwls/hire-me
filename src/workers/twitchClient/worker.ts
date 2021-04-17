import * as Comlink from 'comlink';
import tmi from 'tmi.js';
import parseTwitchChat from 'utils/parseTwitchChat';
import { TwitchMessage } from 'types/TwitchMessage';
import { format, fromUnixTime } from 'date-fns';
import emoteFetcher from 'utils/emoteFetcher';
import badgeFetcher from 'utils/badgeFetcher';
import { differenceInMinutes } from 'date-fns';

const MESSAGE_INTERVAL = 50;

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
  channelBadges: any[],
  init: (callback: any) => void,
  join: (channel: string) => void,
  fetchEmotes: (channel: string, callback: any) => void,
  fetchBadges: (channel: string) => void,
  getMessages: (callback: any) => void,
  subscribe: (channels: string[], callback: any) => void,
  subscribeToMetadata: (callback: any) => void,
  addMessage: (message: TwitchMessage, callback: any) => void,
  catalogMessageMetadata: (message: TwitchMessage) => void,
  parseTwitchEmotes: (message: string, emotes: any) => void,
  destroy: () => void,
  channelMetadata: any,
  channelMessages: any,
  hasSubscribed: boolean,
  hasSubscribedToMetadata: boolean,
  joinTimes: any,
  metadataInterval: any,
  messageInterval: any,
}

const twitchClient: TwitchClientWorker = {
  messages: [],
  channelMessages: {},
  channelBadges: [],
  channelEmotes: [],
  hasSubscribed: false,
  hasSubscribedToMetadata: false,
  joinTimes: {},
  channelMetadata: {},
  metadataInterval: null,
  messageInterval: null,
  init(callback: any) {
    if (!['OPEN', 'CONNECTING'].includes(client.readyState())) {
      client.connect().then(callback);
    }
  },
  addMessage(message, callback) {
    this.catalogMessageMetadata(message);
    const oldMessages = this.channelMessages[message.channel] || [];
    if (oldMessages.length > 500) {
      oldMessages.splice(0, 50)
    }

    this.channelMessages[message.channel] = [...oldMessages, message];
  },
  subscribe(callback: any) {
    if (this.hasSubscribed) return;

    this.hasSubscribed = true;

    clearInterval(this.messageInterval);
    this.messageInterval = setInterval(() => {
      callback(this.channelMessages);
    }, MESSAGE_INTERVAL);

    client.on('subscription', (channel, username, method, message, tags) => {
      const unixTimestamp = parseInt(tags['tmi-sent-ts'] || '0') / 1000;

      const newMessage: TwitchMessage = {
        id: tags.id,
        channel: channel.replace('#', ''),
        messageType: tags['message-type'],
        messageId: tags['msg-id'],
        username,
        text: "OMG A TEST SUB HAPPENED",
        time: format(fromUnixTime(unixTimestamp), 'h:mm'),
      };
      console.log("SUBSCRIPTUION HAPPENED")
      this.addMessage(newMessage, callback);
    });

    client.on('resub', (channel, username, method, message, tags) => {
      const unixTimestamp = parseInt(tags['tmi-sent-ts'] || '0') / 1000;
      console.log("RESUBSCRIPTUION HAPPENED")

      const newMessage: TwitchMessage = {
        id: tags.id,
        channel: channel.replace('#', ''),
        messageId: tags['msg-id'],
        messageType: tags['message-type'],
        username,
        text: "OMG A TEST rESUB HAPPENED",
        time: format(fromUnixTime(unixTimestamp), 'h:mm'),
      };

      this.addMessage(newMessage, callback);
    });

    client.on('message', (channel, tags, message) => {      
      const unixTimestamp = parseInt(tags['tmi-sent-ts'] || '0') / 1000;
      const badges = tags.badges || {};

      this.parseTwitchEmotes(message, tags.emotes);

      console.log("is highlighted?", message, tags)
      const { formattedText, formattedBadges, emoteCount, wordCount } = parseTwitchChat({
        text: message,
        emoteList: this.channelEmotes,
        badges,
        badgeList: this.channelBadges,
      });

      const newMessage: TwitchMessage = {
        id: tags.id,
        channel: channel.replace('#', ''),
        messageType: tags['message-type'],
        messageId: tags['msg-id'],
        text: message,
        emoteText: formattedText,
        username: tags['display-name'],
        usernameColor: tags.color,
        replyName: tags['reply-parent-display-name'],
        replyMessage: tags['reply-parent-msg-body'],
        time: format(fromUnixTime(unixTimestamp), 'h:mm'),
        emotePercentage: emoteCount ? emoteCount / (emoteCount + wordCount) : 0,
        badges: Object.keys(badges),
        formattedBadges,
      };

      this.addMessage(newMessage, callback);
    })
  },
  parseTwitchEmotes(message, emotes) {
    if (!emotes) return;

    const parsedEmotes = Object.keys(emotes).map((emoteCode: any) => {
      const emoteIndex = emotes[emoteCode][0].split('-');

      return ({
        code: message.slice(emoteIndex[0], parseInt(emoteIndex[1] + 1)),
        url: `https://static-cdn.jtvnw.net/emoticons/v1/${emoteCode}/1.0`,
      });
    });
    this.channelEmotes = [...this.channelEmotes, ...parsedEmotes];
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
    }, 1000);
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
    this.fetchBadges(channel);
    this.fetchEmotes(channel, () => client.join(channel));
  },
  async fetchEmotes(channel: string, callback) {
    await emoteFetcher(channel).then((emotes) => {
      this.channelEmotes = [...this.channelEmotes, ...emotes];
      callback();
    });
  },
  async fetchBadges(channel: string) {
    await badgeFetcher(channel).then((badges) => {
      this.channelBadges = [...this.channelBadges, ...badges];
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