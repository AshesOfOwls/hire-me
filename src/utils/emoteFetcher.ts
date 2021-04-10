const getTTVGlobalList = async () => {
  const global_chan_id = 0;
  const emoteList = await fetch(`https://api.twitchemotes.com/api/v4/channels/${global_chan_id}`).then((res) => res.json());
  let globalTTVEmotesArr: any = [];
  emoteList.emotes.map((e: any) => globalTTVEmotesArr.push({ code: e.code, url: `https://static-cdn.jtvnw.net/emoticons/v1/${e.id}/1.0` }));
  return globalTTVEmotesArr;
};

const getTTVChannelList = async (channel: String) => {
  const userMeta = await fetch(`https://api.frankerfacez.com/v1/_room/${channel}`).then((res) => res.json());
  if (!userMeta.room) return [];
  const emoteList = await fetch(`https://api.twitchemotes.com/api/v4/channels/${userMeta.room.twitch_id}`).then((res) => res.json());
  let twitchEmotesArr: any = [];
  emoteList.emotes.map((e: any) => twitchEmotesArr.push({ code: e.code, url: `https://static-cdn.jtvnw.net/emoticons/v1/${e.id}/1.0` }));
  return twitchEmotesArr;
};

const getBTTVChannelList = async (channel: String) => {
  const userMeta = await fetch(`https://api.frankerfacez.com/v1/_room/${channel}`).then((res) => res.json());
  if (!userMeta.room) return [];
  const emoteList = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${userMeta.room.twitch_id}`).then((res) => res.json());
  if (!emoteList.emotes) return [];
  let bttvEmotesArr: any = [];
  emoteList.emotes.map((data: any) =>
    bttvEmotesArr.push({
      code: data.code,
      url: `https://cdn.betterttv.net/emote/${data.id}/1x`,
    })
  );
  return bttvEmotesArr;
};

const getFFZChannelList = async (channel: String) => {
  const emoteList = await fetch(`https://api.frankerfacez.com/v1/room/${channel}`).then((res) => res.json());
  if (!emoteList.sets) return [];
  const emoteSets = Object.keys(emoteList.sets);
  let ffzEmotesArr: any = [];
  emoteSets.map((e: any) => emoteList.sets[e].emoticons.map((em: any) => ffzEmotesArr.push({ code: em.name, url: `https:${em.urls[1]}` })));
  return ffzEmotesArr;
};

const emoteFetcher = (channelName: string): Promise<any> => {
  const ttvGlobalEmotes = getTTVGlobalList();
  const ttvEmotes = getTTVChannelList(channelName);
  const bttvEmotes = getBTTVChannelList(channelName);
  const ffzEmotes = getFFZChannelList(channelName);

  return Promise.all([ttvGlobalEmotes, ttvEmotes, bttvEmotes, ffzEmotes]).then((emotes) => {
    const parsedEmotes: any = [];
    emotes.map((emotes: any) => parsedEmotes.push(...emotes));
    return parsedEmotes;
  });
};

export default emoteFetcher;
